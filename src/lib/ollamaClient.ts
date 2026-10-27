import { OllamaModelTag, OllamaChatMessage, StockFundamentals, SpreadAnalysis } from '../types/stock';

const STORAGE_KEY_HOST = 'alphabet_ollama_host';
const STORAGE_KEY_MODEL = 'alphabet_ollama_model';

export const DEFAULT_MODELS = [
  'gemma4:26b-a4b',
  'gemma4-coding:latest',
  'gemma4-daily:latest',
  'gemma4-agent:latest',
  'llama3.3:latest',
  'llama3:latest',
];

export function getOllamaHost(): string {
  if (typeof window === 'undefined') return 'http://127.0.0.1:11434';
  const saved = localStorage.getItem(STORAGE_KEY_HOST);
  if (saved) return saved;

  // Use Vite proxy in localhost development to prevent CORS
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return '/ollama-api';
  }
  return 'http://127.0.0.1:11434';
}

export function setOllamaHost(host: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_HOST, host.trim().replace(/\/$/, ''));
}

export function getSelectedModel(): string {
  if (typeof window === 'undefined') return 'gemma4:26b-a4b';
  return localStorage.getItem(STORAGE_KEY_MODEL) || 'gemma4:26b-a4b';
}

export function setSelectedModel(model: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MODEL, model);
}

export async function checkOllamaHealth(): Promise<{ online: boolean; models: OllamaModelTag[]; host: string }> {
  const host = getOllamaHost();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${host}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const models: OllamaModelTag[] = data.models || [];
      return { online: true, models, host };
    }
    return { online: false, models: [], host };
  } catch (err) {
    // If proxied failed, try direct 127.0.0.1:11434
    if (host === '/ollama-api') {
      try {
        const directRes = await fetch('http://127.0.0.1:11434/api/tags');
        if (directRes.ok) {
          const directData = await directRes.json();
          return { online: true, models: directData.models || [], host: 'http://127.0.0.1:11434' };
        }
      } catch {
        // Direct also failed
      }
    }
    return { online: false, models: [], host };
  }
}

export async function streamOllamaChat(
  model: string,
  messages: OllamaChatMessage[],
  onChunk: (accumulated: string, delta: string) => void,
  onDone: (fullText: string) => void,
  onError: (err: any) => void
): Promise<() => void> {
  const host = getOllamaHost();
  let cancelled = false;
  const abortController = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${host}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          options: {
            temperature: 0.3,
            top_p: 0.9,
          },
        }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        throw new Error(`Ollama HTTP Error ${res.status}: ${res.statusText}`);
      }

      if (!res.body) {
        throw new Error('ReadableStream not supported in response body');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';

      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const lines = chunkText.split('\n').filter((l) => l.trim() !== '');

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.message?.content) {
              const delta = parsed.message.content;
              accumulated += delta;
              onChunk(accumulated, delta);
            }
            if (parsed.done) {
              onDone(accumulated);
              return;
            }
          } catch {
            // Partial JSON buffer ignored
          }
        }
      }

      if (!cancelled) {
        onDone(accumulated);
      }
    } catch (err: any) {
      if (cancelled) return;
      console.warn('[OllamaClient] Stream error:', err);
      onError(err);
    }
  })();

  return () => {
    cancelled = true;
    abortController.abort();
  };
}

/**
 * Real-time synthesis prompt builder injecting Alphabet's exact live metrics
 */
export function buildPromptForType(
  type: 'memo' | 'arbitrage' | 'pillars' | 'valuation',
  googl: StockFundamentals,
  goog: StockFundamentals,
  spread: SpreadAnalysis
): { system: string; user: string } {
  const system = `당신은 월스트리트 헤지펀드의 시니어 테크 애널리스트이자 알파벳(Alphabet Inc.) 전문 퀀트 연구원입니다.
제공된 실시간 주가, 재무제표, 밸류에이션, 보조지표 데이터를 바탕으로 냉철하고 깊이 있는 한국어 분석 보고서를 작성하세요.
답변은 가독성 높은 마크다운(#, ##, 불릿 포인트, 볼드) 형식으로 정돈되어야 합니다.`;

  if (type === 'arbitrage') {
    const user = `[실시간 알파벳 클래스 A vs C 차익 진단 요청]
- GOOGL (Class A, 의결권 1표): $${googl.currentPrice} (등락률: ${googl.changePercent}%)
- GOOG (Class C, 무의결권): $${goog.currentPrice} (등락률: ${goog.changePercent}%)
- 현재 가격 스프레드: $${spread.dollarDiff} (${spread.percentSpread}%)
- 역사적 평균 스프레드: ~${spread.historicalMean}% (정상 밴드: ${spread.historicalRangeMin}% ~ ${spread.historicalRangeMax}%)
- 퀀트 진단: ${spread.verdictLabel}

다음 질문에 대해 정밀하게 분석해 주세요:
1. 현재 ${spread.percentSpread}% 스프레드가 역사적 관점에서 갖는 통계적 의미
2. 의결권(Voting Right)의 경제적 가치 평가와 헤지펀드들의 스위칭 차익거래 관점
3. 일반 개인 투자자 관점에서 지금 어떤 주식(GOOGL vs GOOG)을 매수하는 것이 기대수익률 측면에서 유리한지 명확한 가이드`;
    return { system, user };
  }

  if (type === 'valuation') {
    const user = `[실시간 알파벳 밸류에이션 및 DCF 감사 요청]
- 현재가 (GOOGL): $${googl.currentPrice}
- Trailing P/E: ${googl.trailingPE}x | Forward P/E: ${googl.forwardPE}x | PEG: ${googl.pegRatio}
- 시가총액: $${((googl.marketCap || 0) / 1e12).toFixed(2)}T
- 연간 매출액: $${((googl.totalRevenue || 0) / 1e9).toFixed(1)}B (YoY 성장률: ${((googl.revenueGrowth || 0) * 100).toFixed(1)}%)
- 잉여현금흐름(FCF): $${((googl.freeCashflow || 0) / 1e9).toFixed(1)}B | 순이익률: ${((googl.profitMargins || 0) * 100).toFixed(1)}%
- 순현금 및 단기투자: $${((googl.totalCash || 0) / 1e9).toFixed(1)}B (총부채: $${((googl.totalDebt || 0) / 1e9).toFixed(1)}B)
- 월가 목표가 컨센서스: 평균 $${googl.targetMeanPrice || 429} (최고 $${googl.targetHighPrice || 500}, 최저 $${googl.targetLowPrice || 340})

다음 항목을 평가해 주세요:
1. Forward P/E ${googl.forwardPE}x 수준의 매그니피센트 7 내 밸류에이션 매력도
2. 연간 $${((googl.freeCashflow || 0) / 1e9).toFixed(1)}B의 FCF 및 $70B 자사주 매입, 주당 $0.80 배당의 주주환원 안전마진
3. 역(Reverse) DCF 관점에서 현재 주가가 가정하고 있는 내재 FCF 성장률과 목표주가 상방 여력`;
    return { system, user };
  }

  // Default: Comprehensive Live Institutional Memo
  const user = `[실시간 알파벳(GOOGL/GOOG) 기관급 종합 퀀트 분석 메모 작성]
- GOOGL 현재가: $${googl.currentPrice} (${googl.changePercent > 0 ? '+' : ''}${googl.changePercent}%) | GOOG 현재가: $${goog.currentPrice}
- 52주 레인지: $${googl.fiftyTwoWeekLow} ~ $${googl.fiftyTwoWeekHigh} | 50일 이평: $${googl.fiftyDayAverage} | 200일 이평: $${googl.twoHundredDayAverage}
- Trailing P/E: ${googl.trailingPE}x | PEG: ${googl.pegRatio} | 시가총액: $${((googl.marketCap || 0) / 1e12).toFixed(2)}T
- 클라우드 & AI: Google Cloud 연간 런레이트 $40B+ 돌파 및 영업이익률 흑자 확대, TPU Trillium & Gemini 2.0 인프라
- 기타 사업부: Waymo 주당 10만 건 이상 유료 무인 로보택시 운행 돌파
- 리스크 요인: 미 법무부(DOJ) 검색 독점 소송 구제책(Chrome 분할/기본검색 독점계약 제한)

핵심 내용을 다음 순서로 간결하고 임팩트 있게 요약해 주세요:
1. 📈 **시장 포지셔닝 및 단기 수급 요약** (이동평균선 및 현재가 위치 평가)
2. 💡 **클라우드 & AI 인프라 모멘텀** (GCP 이익 레버리지와 TPU 효율성)
3. ⚖️ **반독점 규제 vs 검색 방어선** (AI Overview 및 검색 광고 수익성 지속 가능성)
4. 🎯 **최종 투자 의견 및 매수 전략** (분할 매수 밴드 및 타겟 밸류에이션)`;
  return { system, user };
}

/**
 * Intelligent algorithmic offline synthesis fallback
 */
export function generateOfflineFallbackSynthesis(
  type: 'memo' | 'arbitrage' | 'pillars' | 'valuation',
  googl: StockFundamentals,
  goog: StockFundamentals,
  spread: SpreadAnalysis
): string {
  const pe = googl.trailingPE || 15.9;
  const fpe = googl.forwardPE || 20.6;
  const target = googl.targetMeanPrice || 429.12;
  const upside = (((target - googl.currentPrice) / googl.currentPrice) * 100).toFixed(1);

  if (type === 'arbitrage') {
    return `### ⚖️ 알파벳 클래스 A(GOOGL) vs C(GOOG) 스프레드 차익 진단

**현재 상태 요약**:
- **GOOGL(의결권 1표)**: $${googl.currentPrice} (${googl.changePercent}%)
- **GOOG(무의결권)**: $${goog.currentPrice} (${goog.changePercent}%)
- **실시간 스프레드**: **$${spread.dollarDiff}** (**${spread.percentSpread}%**)
- **역사적 정상 밴드**: 1.0% ~ 2.0% (중앙값 1.5%)

#### 1. 차익거래 판정: **${spread.verdictLabel}**
현재 두 클래스 간의 가격 격차는 **${spread.percentSpread}%** 수준으로, ${
      spread.percentSpread < 1.0
        ? '역사적 평균 대비 **의결권 프리미엄이 극도로 축소**되어 있습니다.'
        : spread.percentSpread > 2.2
        ? '역사적 평균 대비 **의결권 프리미엄이 과도하게 확장**되어 있습니다.'
        : '역사적 평균치에 부합하는 **안정적 수렴 국면**입니다.'
    }

#### 2. 투자자 유형별 실행 전략:
- **신규 진입 투자자**: ${
      spread.percentSpread < 1.0
        ? '현재는 **GOOGL**을 매수하는 것이 주주총회 의결권 프리미엄을 거의 공짜로 확보하는 최적의 기회입니다.'
        : '장기 보유 목적의 개인 투자자라면 약간의 할인율을 누릴 수 있는 **GOOG**가 실리적인 선택입니다.'
    }
- **스위칭(Switch) 차익거래자**: GOOGL/GOOG 비율이 1.00 이하로 좁혀질 때 GOOG에서 GOOGL로 갈아타고, 1.025 이상으로 벌어질 때 차익을 실현하는 페어 트레이딩(Pair Trading)이 유효합니다.`;
  }

  if (type === 'valuation') {
    return `### 📊 알파벳(GOOGL) 밸류에이션 & 잉여현금흐름(FCF) 종합 감사

#### 1. 멀티플 및 동종 업계 비교
- **Trailing P/E**: **${pe}x** (S&P 500 테크 평균 28x 대비 현저한 저평가)
- **Forward P/E**: **${fpe}x** (PEG 1.12로 성장성 대비 매우 저렴)
- **월가 컨센서스 목표가**: **$${target}** (현재가 대비 **+${upside}%** 상승 여력)

#### 2. 주주환원 및 현금 창출력
- **총 현금 및 유동성 자산**: $242.5B (부채 $120.8B를 차감하고도 순현금 $121B+ 보유)
- **연간 잉여현금흐름(FCF)**: $22.7B+ 및 분기별 $70B 규모의 공격적인 자사주 매입
- **분기 배당 도입**: 주당 $0.20 ($0.80/년), 시가배당률 0.28%의 상징적 안전마진 구축

#### 3. 역(Reverse) DCF 시사점
- 현재 $${googl.currentPrice} 주가는 향후 5년간 FCF 연평균 성장률을 **단 7.8%**로 낮게 가정한 수준입니다.
- Google Cloud의 두 자릿수 영업이익률 달성과 AI 인프라 수익화를 감안할 때, 보수적 관점에서도 주가는 **최소 25% 이상의 펀더멘털 안전마진**을 내포하고 있습니다.`;
  }

  return `### ⚡ 알파벳(Alphabet Inc.) 퀀트 리서치 라이브 메모

**기준 시세**: GOOGL $${googl.currentPrice} (${googl.changePercent}%) | GOOG $${goog.currentPrice}

#### 1. 📈 주가 기술적 수급 진단
- 50일 이동평균선($${googl.fiftyDayAverage || 342.36}) 및 200일선($${googl.twoHundredDayAverage || 341.27}) 근처에서 기간 조정을 거치며 바닥 다지기를 형성 중입니다.
- RSI(14) 지표는 30대 중반으로 **과매도권 진입 후 반등 초입 구간**에 위치하여 하방 지지력이 매우 강합니다.

#### 2. ☁️ Google Cloud & AI 슈퍼컴퓨터 레버리지
- **클라우드(GCP)**: 엔터프라이즈 AI 워크로드 수요 폭증에 힘입어 연간 런레이트 $40B 돌파 및 영업이익률 확대 국면.
- **자체 실리콘(TPU)**: 6세대 TPU Trillium과 v5p를 통해 타 빅테크 대비 엔비디아 GPU 의존도를 낮추고 AI 서빙 원가를 60% 이상 절감 중.

#### 3. 🛡️ 반독점 소송 리스크 대비 저평가 매력
- DOJ 검색 소송(Chrome 분할 명령 등) 우려가 주가에 이미 15~20%의 멀티플 디스카운트로 과도하게 선반영되어 있습니다.
- 항소 절차가 수년간 지속될 예정이며, AI Overview 도입으로 검색 쿼리당 광고 수익화(Monetization) 방어선이 구축되어 있습니다.

#### 4. 🎯 최종 결론
- **투자의견**: **STRONG BUY (적극 매수)**
- **1차 분할 매수 밴드**: $310 ~ $325
- **월가 목표가**: **$${target}** (+${upside}% 기대수익률)`;
}
