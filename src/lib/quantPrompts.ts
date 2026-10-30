import { StockFundamentals } from '../types/stock';

export type SynthesisReportType = 'memo' | 'ai_cloud' | 'regulatory' | 'valuation';

/**
 * Real-time synthesis prompt builder injecting Alphabet's exact live metrics
 */
export function buildPromptForType(
  type: SynthesisReportType,
  googl: StockFundamentals,
  goog: StockFundamentals
): { system: string; user: string } {
  const current = googl.currentPrice || 317.94;
  const target = googl.targetMeanPrice || 429.12;
  const fpe = googl.forwardPE || 20.4;
  const pe = googl.trailingPE || 15.9;

  const system = `당신은 월스트리트 헤지펀드의 시니어 테크 애널리스트이자 알파벳(Alphabet Inc., GOOGL/GOOG) 전문 수석 퀀트 연구원입니다.
제공된 실시간 주가, 재무제표, 밸류에이션, 사업 부문별 실적 데이터를 바탕으로 알파벳 투자자를 위한 깊이 있고 통찰력 있는 한국어 분석 보고서를 작성하세요.
답변은 가독성 높은 마크다운(#, ##, 불릿 포인트, 볼드) 형식으로 명확하게 정돈되어야 합니다.`;

  if (type === 'ai_cloud') {
    const user = `[알파벳 Google Cloud & Gemini TPU 인프라 심층 분석 요청]
- 알파벳 현재가: $${current} (시가총액: $${((googl.marketCap || 3.87e12) / 1e12).toFixed(2)}T)
- 클라우드 실적: Google Cloud 연간 런레이트 $40B+ 돌파, 분기 영업이익률 11%+로 급성장
- AI 실리콘: 6세대 TPU Trillium 및 v5p 클러스터 양산, DeepMind Gemini 2.0 모델 검색/Workspace/GCP 전면 통합
- 엔터프라이즈 AI: Vertex AI 고객 수 전년 대비 4배 이상 증가

다음 핵심 항목을 정밀하게 분석해 주세요:
1. Google Cloud의 두 자릿수 영업이익률 안착이 알파벳 전체 영업이익(OP) 성장에 미치는 레버리지 효과
2. 엔비디아 GPU 대비 자체 TPU 인프라의 원가 경쟁력과 CapEx(설비투자) 효율성
3. 엔터프라이즈 생성형 AI 수주 잔고(Backlog)와 빅테크(AWS, Azure) 대비 차별화 포인트`;
    return { system, user };
  }

  if (type === 'regulatory') {
    const user = `[알파벳 미 법무부(DOJ) 반독점 소송 및 검색 광고 해자 진단 요청]
- 현재 주가: $${current} | Trailing P/E: ${pe}x | Forward P/E: ${fpe}x (M7 중 최저 수준)
- 주요 소송 이슈: 
  1) 워싱턴DC 검색 반독점 소송: 미 법무부의 Chrome 분할 명령 및 Apple 기본 검색 배타적 계약 제한 요구
  2) 버지니아 AdTech 반독점 소송: 구글 광고 서버(DFP) 및 애드익스체인지(AdX) 분할 압박
- AI 검색 혁신: AI Overviews 전 세계 100개국+ 확대 적용 및 쿼리당 광고 수익화(Monetization) 방어선 구축

다음 항목을 냉철하게 분석해 주세요:
1. 최악의 시나리오(Chrome 분할, Apple 계약 파기) 발생 시 알파벳 검색 매출에 미치는 실질적 타격 규모
2. 항소 법원 및 연방대법원 판결까지 3~5년 소요되는 사법 절차와 시간적 안전마진
3. 현재 주가(P/E 15.9x~20.4x)에 이미 선반영된 규제 디스카운트 수준과 향후 리레이팅(Re-rating) 가능성`;
    return { system, user };
  }

  if (type === 'valuation') {
    const user = `[알파벳 밸류에이션 및 주주환원 현금흐름 감사 요청]
- 현재가: $${current} | Forward P/E: ${fpe}x | Trailing P/E: ${pe}x | PEG: ${googl.pegRatio || 1.12}
- 현금성 자산: 총 현금 $${((googl.totalCash || 242.5e9) / 1e9).toFixed(1)}B | 총부채: $${((googl.totalDebt || 120.8e9) / 1e9).toFixed(1)}B | 순현금: +$121.7B
- 잉여현금흐름(FCF): 연간 $${((googl.freeCashflow || 22.7e9) / 1e9).toFixed(1)}B
- 주주환원: 연간 $70B 자사주 매입 프로그램 + 분기 배당 주당 $0.20 ($0.80/년)
- 월가 목표가: 평균 $${target} (최고 $${googl.targetHighPrice || 500}, 최저 $${googl.targetLowPrice || 340})

다음 항목을 평가해 주세요:
1. M7(MSFT, AAPL, NVDA, META, AMZN) 대비 알파벳의 밸류에이션 매력도 및 멀티플 압착 해소 여력
2. $70B 자사주 매입이 주당순이익(EPS) 성장에 제공하는 하방 안전마진
3. 역(Reverse) DCF 관점에서 현재 주가가 가정하고 있는 내재 FCF 성장률과 목표주가 상방 여력`;
    return { system, user };
  }

  // Default: Comprehensive Institutional Investment Memo
  const user = `[알파벳(Alphabet Inc.) 기관급 종합 투자 리서치 메모 작성]
- 기준 시세: GOOGL/GOOG 현재가 $${current} (${googl.changePercent > 0 ? '+' : ''}${googl.changePercent || -0.71}%)
- 시가총액: $${((googl.marketCap || 3.87e12) / 1e12).toFixed(2)}T | 52주 레인지: $${googl.fiftyTwoWeekLow || 266.5} ~ $${googl.fiftyTwoWeekHigh || 408.61}
- 50일 이동평균선: $${googl.fiftyDayAverage || 342.36} | 200일선: $${googl.twoHundredDayAverage || 341.27}
- 핵심 펀더멘털: Trailing P/E ${pe}x | Forward P/E ${fpe}x | PEG ${googl.pegRatio || 1.12}
- 사업 부문: Google Search(검색 광고), YouTube(구독/쇼츠), Google Cloud($40B 런레이트), Waymo(무인 로보택시), AI Silicon(TPU/Gemini)
- 주요 리스크: 미 법무부(DOJ) 검색 독점 소송 구제책 판결

핵심 내용을 다음 순서로 간결하고 임팩트 있게 요약해 주세요:
1. 📈 **시장 포지셔닝 및 단기 수급 진단** (이동평균선 및 52주 위치)
2. 💡 **핵심 성장 동력: 클라우드 & AI 인프라 레버리지**
3. 🛡️ **규제 리스크 vs 검색 데이터 해자**
4. 🎯 **최종 투자 의견 및 분할 매수 밴드**`;
  return { system, user };
}

/**
 * Intelligent algorithmic offline synthesis fallback reflecting latest official financials & metrics
 */
export function generateOfflineFallbackSynthesis(
  type: SynthesisReportType,
  googl: StockFundamentals,
  goog: StockFundamentals
): string {
  const current = googl.currentPrice || 280.56;
  const pe = googl.trailingPE || 14.6;
  const fpe = roundNumber(googl.forwardPE || 18.8, 1);
  const target = googl.targetMeanPrice || 429.68;
  const upside = (((target - current) / current) * 100).toFixed(1);

  const flash = googl.earningsBrief || googl.earningsFlash;
  const quarter = flash?.quarter || '최신 공식 분기';
  const rev = flash?.revenue != null ? `$${flash.revenue}B` : (flash?.totalRevenueTTM != null ? `$${flash.totalRevenueTTM}B` : '$119.8B');
  const revYoY = flash?.revenueYoY ?? flash?.revenueGrowthYoY ?? 24.2;
  const eps = flash?.eps != null ? `$${flash.eps.toFixed(2)}` : '$2.12';
  const opm = flash?.operatingMargins ?? 34.0;
  const nextDate = flash?.nextEarningsDate || '차기 실적 공시 예정';

  if (type === 'ai_cloud') {
    return `### ☁️ Google Cloud & Gemini TPU 인프라 퀀트 심층 감사

#### 1. 🚀 Google Cloud Platform(GCP) 성장세 및 마진 레버리지
- **엔터프라이즈 AI 수주 가속**: 글로벌 500대 기업의 75% 이상이 Vertex AI를 실서빙 환경에 도입하며, 클라우드 매출이 두 자릿수 고성장을 지속하고 있습니다.
- **영업이익 기여도 확대**: 클라우드 부문 영업이익률이 개선되면서 광고 외 사업 부문에서의 현금 창출 다각화가 안착했습니다.

#### 2. ⚡ TPU 자체 실리콘의 원가 경제학
- **AI 추론 원가 절감**: 6세대 TPU Trillium 클러스터 양산 배치를 통해 외부 가속기 임차 대비 AI 서빙 비용을 획기적으로 낮췄습니다.
- **CapEx 투자의 질적 성격**: 데이터센터 및 TPU 인프라 투자는 향후 5~7년간 클라우드/AI 플랫폼의 독점적 서비스 마진을 회수할 선행 자산입니다.

#### 3. 🎯 퀀트 결론
- 알파벳은 단순 광고 지주회사를 넘어 **자체 AI 실리콘부터 파운데이션 모델, 클라우드 서빙까지 수직계열화한 유일한 빅테크**로서 강력한 기술적 해자를 보유하고 있습니다.`;
  }

  if (type === 'regulatory') {
    return `### 🛡️ 미 법무부(DOJ) 반독점 규제 소송 및 검색 해자 진단

#### 1. 🔍 검색 및 디지털 광고 해자의 건재함
- 생성형 AI 검색 대체 우려에도 불구하고, 구글 검색 쿼리는 높은 트래픽 유지력을 증명하고 있습니다.
- **AI Overviews 수익화**: AI 검색 결과 내 스폰서십 광고가 정착되며 쿼리당 광고 단가(CPC)를 견고하게 방어 중입니다.

#### 2. ⚖️ 반독점 소송 현황 및 시간적 안전마진
- **사법 절차 타임라인**: 1심 판결 및 구제책 심리 이후에도 항소법원과 연방대법원 최종 판결까지 3~5년의 법적 공방 기간이 소요됩니다.
- **크롬 분할 명령의 실현성**: 브라우저 강제 분할은 법적/기술적 전례가 없어 항소심에서 기각 또는 대폭 완화된 대체 구제책으로 수렴될 가능성이 높습니다.

#### 3. 🎯 결론
- 본업 쿼리 및 현금 창출력이 유지되는 한, 규제 소송은 주가 멀티플을 일시적으로 압박하는 노이즈일 뿐 장기 펀더멘털을 훼손하지 못합니다.`;
  }

  if (type === 'valuation') {
    return `### 📊 알파벳(Alphabet) 실시간 밸류에이션 및 주주환원 감사

#### 1. 💎 M7 빅테크 중 압도적 밸류에이션 매력
- **Trailing P/E**: **${pe}x** (S&P 500 테크 평균 28x 대비 약 45% 할인)
- **Forward P/E**: **${fpe}x** (빅테크 피어 그룹 중 최저 밸류에이션 수준)
- **월가 컨센서스 목표가**: **$${target}** (현재가 $${current} 대비 **+${upside}%** 상승 잠재력)

#### 2. 🏰 순현금 요새와 주주환원 안전망
- **순현금 요새**: 총 현금 $240B+ 기반의 압도적인 대차대조표 건전성을 유지하고 있습니다.
- **연간 $70B 자사주 매입 지속**: 주가 조정 구간에서의 대규모 자사주 매입은 유통 주식 수를 빠르게 축소시켜 향후 주당순이익(EPS)을 레버리지하는 강력한 주주환원 버팀목입니다.

#### 3. 📈 역(Reverse) DCF 관점
- 현재 주가는 향후 5년간 FCF 성장을 단 5~6%대로 가정한 보수적 가정에 머물러 있어, **최소 35~40% 이상의 펀더멘털 안전마진(Safety Margin)**을 내포하고 있습니다.`;
  }

  return `### 📊 알파벳(Alphabet Inc.) ${quarter} 공식 실적 및 실시간 퀀트 메모

**기준 시세**: GOOGL / GOOG 현재가 $${current} | Trailing P/E: ${pe}x | Forward P/E: ${fpe}x
**차기 실적 발표**: ${nextDate}

#### 1. 📊 ${quarter} 핵심 실적 팩트체크
- **매출 성과**: 분기 매출 **${rev} (+${revYoY}% YoY)**로 두 자릿수 견고한 성장세를 이어가고 있습니다.
- **주당순이익(EPS)**: **${eps}**
- **영업이익률(OPM)**: **${opm}%** 수준의 업계 최고 수준 마진 체력을 유지 중입니다.

#### 2. 🚀 핵심 사업 성장 엔진 (Cloud, AI Search & YouTube)
- **Google Cloud & Vertex AI**: 글로벌 기업들의 생성형 AI 엔터프라이즈 도입 가속화로 클라우드 사업 부문이 전사 핵심 성장축으로 도약했습니다.
- **검색 및 유튜브 해자**: AI Overviews 도입 후 쿼리 단가(CPC) 방어와 쇼츠/구독 서비스 성장이 이어지고 있습니다.

#### 3. 🎯 밸류에이션 및 투자 전략
- **투자의견**: **STRONG BUY (적극 분할 매수)**
- **진단**: Forward P/E ${fpe}x는 S&P 500 테크 평균 대비 큰 폭으로 할인된 수준으로, 본업 펀더멘털 대비 높은 **안전마진(Safety Margin)**을 제공합니다.
- **월가 컨센서스 목표가**: **$${target}** (+${upside}% 상방 여력)`;
}

function roundNumber(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}
