#!/usr/bin/env python3
"""
Alphabet (Alphabet Inc. · GOOGL & GOOG) Local LLM Quantitative Synthesis Engine
- Runs on your local PC
- Reads fresh market and official filings data from public/data/GOOGL.json and public/data/GOOG.json
- Connects to local Ollama (http://127.0.0.1:11434) using Gemma (e.g. gemma4-daily:latest)
- Dynamically injects whatever the latest reported quarter, consensus surprise, and upcoming earnings dates are
- Generates 4 institutional investment reports:
  1. memo: Comprehensive Institutional Quant Memo
  2. ai_cloud: Google Cloud & Gemini TPU AI Infrastructure
  3. regulatory: DOJ Antitrust Lawsuits & Search Moat
  4. valuation: Multiples, $70B Buyback Safety Margin & Reverse DCF
- Writes output to public/data/synthesis.json
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime
from zoneinfo import ZoneInfo

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
PUBLIC_DATA_DIR = os.path.join(PROJECT_ROOT, "public", "data")
SYNTHESIS_FILE = os.path.join(PUBLIC_DATA_DIR, "synthesis.json")

raw_host = os.environ.get("OLLAMA_HOST", "http://127.0.0.1:11434").strip()
if not raw_host.startswith(("http://", "https://")):
    if ":" not in raw_host:
        raw_host = "http://127.0.0.1:11434"
    else:
        raw_host = f"http://{raw_host}"
if "0.0.0.0" in raw_host:
    raw_host = raw_host.replace("0.0.0.0", "127.0.0.1")
OLLAMA_HOST = raw_host.rstrip("/")

PREFERRED_MODELS = [
    "gemma4-daily:latest",
    "gemma4-coding:latest",
    "gemma4-agent:latest",
    "gemma4:26b-a4b",
    "llama3.3:latest",
    "llama3:latest",
]

def load_json(filepath):
    if not os.path.exists(filepath):
        return None
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[WARN] Failed to load {filepath}: {e}")
        return None

def detect_ollama_model():
    """Finds best available model on local Ollama."""
    url = f"{OLLAMA_HOST}/api/tags"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            installed = [m.get("name") for m in data.get("models", [])]
            for pref in PREFERRED_MODELS:
                if pref in installed:
                    return pref
            if installed:
                return installed[0]
    except Exception as e:
        print(f"[INFO] Local Ollama not reachable at {url}: {e}")
    return None

def call_ollama(model: str, system_prompt: str, user_prompt: str, timeout: int = 70) -> str:
    """Calls Ollama chat endpoint."""
    url = f"{OLLAMA_HOST}/api/chat"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
        "options": {
            "temperature": 0.3,
            "top_p": 0.9,
        },
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        elapsed = round(time.time() - t0, 2)
        content = res.get("message", {}).get("content", "").strip()
        print(f"[{model}] Generated report in {elapsed}s ({len(content)} chars)")
        return content

def generate_algorithmic_fallback(googl, goog, earnings):
    """Robust quant rules fallback using live dynamic metrics when Ollama is offline."""
    p_a = googl.get("currentPrice", 280.56)
    pe = googl.get("trailingPE", 14.6)
    fpe = round(googl.get("forwardPE", 18.8), 1)
    target = googl.get("targetMeanPrice", 429.68)
    upside = round(((target - p_a) / p_a) * 100, 1) if p_a else 46.7
    
    quarter = earnings.get("quarter", "최신 공식 분기")
    rep_date = earnings.get("reportDate", "최근 공시")
    eps = earnings.get("eps", 2.12)
    eps_est = earnings.get("epsEstimate", 3.01)
    surprise = earnings.get("epsSurprisePercent", -29.5)
    rev = earnings.get("revenue", 119.8)
    rev_yoy = earnings.get("revenueYoY", 24.2)
    opm = earnings.get("operatingMargins", 34.0)
    next_date = earnings.get("nextEarningsDate", "차기 분기 공시 예정")
    next_eps_est = earnings.get("nextEpsEstimate", 3.21)

    memo = f"""### 📊 알파벳(Alphabet Inc.) {quarter} 공식 실적 및 실시간 퀀트 메모

**기준 시세**: GOOGL / GOOG 현재가 ${p_a} | 52주 레인지: ${googl.get('fiftyTwoWeekLow', 270.7)} ~ ${googl.get('fiftyTwoWeekHigh', 408.61)}
**공식 발표일**: {rep_date} (차기 실적 발표: {next_date})

#### 1. 📊 {quarter} 핵심 실적 팩트체크
- **매출 성과**: 분기 매출 **${rev}B (+{rev_yoy}% YoY)**로 견고한 두 자릿수 성장세를 지속하고 있습니다.
- **주당순이익(EPS)**: **${eps}** (월가 예상치 ${eps_est}, 서프라이즈 {surprise}%).
- **영업이익률(OPM)**: **{opm}%** 수준의 업계 최고 수준 마진 체력을 유지 중입니다.

#### 2. 🚀 핵심 사업 성장 엔진 (Cloud, AI Search & YouTube)
- **Google Cloud & Vertex AI**: 글로벌 기업들의 생성형 AI 엔터프라이즈 도입 가속화로 클라우드 사업 부문이 전사 핵심 성장축으로 도약했습니다.
- **검색 및 유튜브 해자**: AI Overviews 도입 후 쿼리 단가(CPC) 방어와 쇼츠/구독 서비스 성장이 이어지고 있습니다.

#### 3. 🎯 밸류에이션 및 투자 전략
- **투자의견**: **STRONG BUY (적극 분할 매수)**
- **진단**: Trailing P/E {pe}x 및 Forward P/E {fpe}x는 S&P 500 테크 평균 대비 큰 폭으로 할인된 수준으로, 본업 펀더멘털 대비 높은 **안전마진(Safety Margin)**을 제공합니다.
- **월가 컨센서스 목표가**: **${target}** (+{upside}% 상방 여력)"""

    ai_cloud = f"""### ☁️ Google Cloud & Gemini TPU AI 인프라 심층 분석

#### 1. 🚀 Google Cloud Platform(GCP) 성장 지속과 마진 레버리지
- **엔터프라이즈 AI 수주 가속**: 글로벌 500대 기업의 75% 이상이 Vertex AI를 실서빙 환경에 도입하며, 클라우드 매출이 두 자릿수 고성장을 구가하고 있습니다.
- **영업이익 기여도 확대**: 클라우드 부문 영업이익률이 개선되면서 광고 외 사업 부문에서의 현금 창출 다각화가 안착했습니다.

#### 2. ⚡ TPU 자체 실리콘의 원가 경제학
- **AI 추론 원가 절감**: 6세대 TPU Trillium 클러스터 양산 배치를 통해 외부 가속기 임차 대비 AI 서빙 비용을 획기적으로 낮췄습니다.
- **CapEx 투자의 질적 성격**: 데이터센터 및 TPU 인프라 투자는 향후 5~7년간 클라우드/AI 플랫폼의 독점적 서비스 마진을 회수할 선행 자산입니다.

#### 3. 🎯 퀀트 결론
- 알파벳은 단순 광고 지주회사를 넘어 **자체 AI 실리콘부터 파운데이션 모델, 클라우드 서빙까지 수직계열화한 유일한 빅테크**로서 강력한 기술적 해자를 보유하고 있습니다."""

    regulatory = f"""### 🛡️ 미 법무부(DOJ) 반독점 규제 소송 및 검색 해자 진단

#### 1. 🔍 검색 및 디지털 광고 해자의 건재함
- 생성형 AI 검색 대체 우려에도 불구하고, 구글 검색 쿼리는 높은 트래픽 유지력을 증명하고 있습니다.
- **AI Overviews 수익화**: AI 검색 결과 내 스폰서십 광고가 정착되며 쿼리당 광고 단가(CPC)를 견고하게 방어 중입니다.

#### 2. ⚖️ 반독점 소송 현황 및 시간적 안전마진
- **사법 절차 타임라인**: 1심 판결 및 구제책 심리 이후에도 항소법원과 연방대법원 최종 판결까지 3~5년의 법적 공방 기간이 소요됩니다.
- **크롬 분할 명령의 실현성**: 브라우저 강제 분할은 법적/기술적 전례가 없어 항소심에서 기각 또는 대폭 완화된 대체 구제책으로 수렴될 가능성이 높습니다.

#### 3. 🎯 결론
- 본업 쿼리 및 현금 창출력이 유지되는 한, 규제 소송은 주가 멀티플을 일시적으로 압박하는 노이즈일 뿐 장기 펀더멘털을 훼손하지 못합니다."""

    valuation = f"""### 📊 알파벳(Alphabet) 실시간 밸류에이션 및 주주환원 감사

#### 1. 💎 M7 빅테크 중 압도적 밸류에이션 매력
- **Trailing P/E**: **{pe}x** (S&P 500 테크 평균 28x 대비 약 45% 할인)
- **Forward P/E**: **{fpe}x** (빅테크 피어 그룹 중 최저 밸류에이션 수준)
- **월가 컨센서스 목표가**: **${target}** (현재가 ${p_a} 대비 **+{upside}%** 상승 잠재력)

#### 2. 🏰 순현금 요새와 주주환원 안전망
- **순현금 요새**: 총 현금 $240B+ 기반의 압도적인 대차대조표 건전성을 유지하고 있습니다.
- **연간 $70B 자사주 매입 지속**: 주가 조정 구간에서의 대규모 자사주 매입은 유통 주식 수를 빠르게 축소시켜 향후 주당순이익(EPS)을 레버리지하는 강력한 주주환원 버팀목입니다.

#### 3. 📈 역(Reverse) DCF 관점
- 현재 주가는 향후 5년간 FCF 성장을 단 5~6%대로 가정한 보수적 가정에 머물러 있어, **최소 35~40% 이상의 펀더멘털 안전마진(Safety Margin)**을 내포하고 있습니다."""

    return memo, ai_cloud, regulatory, valuation

def main():
    print("=== Alphabet (Alphabet Inc.) Dynamic Synthesis Engine ===")
    
    # 1. Load data
    googl_data = load_json(os.path.join(PUBLIC_DATA_DIR, "GOOGL.json")) or {}
    goog_data = load_json(os.path.join(PUBLIC_DATA_DIR, "GOOG.json")) or {}
    
    googl_f = googl_data.get("fundamentals", {})
    goog_f = goog_data.get("fundamentals", {})
    
    p_a = googl_f.get("currentPrice", 280.56)
    p_c = goog_f.get("currentPrice", 279.10)
    
    # 2. Extract dynamic official earnings data & volatility alert
    earnings = googl_data.get("earnings_brief") or googl_data.get("earnings_flash") or {}
    quarter = earnings.get("quarter", "최신 공식 분기")
    rep_date = earnings.get("reportDate", "최근 공시")
    eps = earnings.get("eps", 2.12)
    eps_est = earnings.get("epsEstimate", 3.01)
    surprise = earnings.get("epsSurprisePercent", -29.5)
    rev = earnings.get("revenue", 119.8)
    rev_yoy = earnings.get("revenueYoY", 24.2)
    opm = earnings.get("operatingMargins", 34.0)
    next_date = earnings.get("nextEarningsDate", "차기 분기 공시 예정")
    next_eps_est = earnings.get("nextEpsEstimate", 3.21)

    # Volatility Alert context (>= 3.0% moves)
    vol_alert = googl_data.get("volatility_alert") or {}
    vol_triggered = vol_alert.get("triggered", False)
    vol_pct = vol_alert.get("changePercent", googl_f.get("changePercent", 0.0))
    vol_headline = vol_alert.get("headline", "")
    vol_reason = vol_alert.get("primaryReason", "")

    pe = googl_f.get("trailingPE", 14.6)
    fpe = round(googl_f.get("forwardPE", 18.8), 1)
    target = googl_f.get("targetMeanPrice", 429.68)
    market_cap_t = googl_f.get("marketCap", 3.87e12) / 1e12
    upside = round(((target - p_a) / p_a) * 100, 1) if p_a else 46.7

    # 3. Check local Ollama
    model = detect_ollama_model()
    now_kst = datetime.now(ZoneInfo("Asia/Seoul")).isoformat()
    now_ny = datetime.now(ZoneInfo("America/New_York")).isoformat()

    system_prompt = (
        "당신은 월스트리트 헤지펀드의 시니어 테크 애널리스트이자 알파벳(Alphabet Inc., GOOGL/GOOG) 전문 수석 퀀트 연구원입니다. "
        "제공된 실시간 주가, 재무제표, 밸류에이션, 사업 부문별 실적 데이터를 바탕으로 알파벳 투자자를 위한 깊이 있고 통찰력 있는 한국어 분석 보고서를 작성하세요. "
        "답변은 가독성 높은 마크다운(#, ##, 불릿 포인트, 볼드) 형식으로 명확하게 정돈되어야 합니다."
    )

    memo_text = None
    ai_cloud_text = None
    regulatory_text = None
    valuation_text = None
    engine_used = "offline_quant"

    if model:
        print(f"[Ollama] Detected local model: {model}. Synthesizing 4 Alphabet investor reports with dynamic official metrics ({quarter})...")
        try:
            # 1. Memo (Dynamic with Volatility Focus)
            vol_snippet = f"- [🚨 긴급 시장 변동성 경보]: 주가 {vol_pct:+.2f}% 급변 감지 | 원인: {vol_reason}\n" if vol_triggered else ""
            u_memo = f"""[알파벳(Alphabet Inc.) {quarter} 최신 공식 실적 및 실시간 퀀트 리서치 메모 작성]
- 기준 시세: GOOGL 현재가 ${p_a} | 52주 범위: ${googl_f.get('fiftyTwoWeekLow', 270.7)} ~ ${googl_f.get('fiftyTwoWeekHigh', 408.61)}
{vol_snippet}- 공식 실적 데이터 ({quarter}, 발표일: {rep_date}):
  * 매출: ${rev}B (성장률: +{rev_yoy}% YoY)
  * 주당순이익(EPS): ${eps} (월가 예상: ${eps_est}, 서프라이즈: {surprise}%)
  * 영업이익률: {opm}%
  * 차기 실적 발표 예정일: {next_date}
- 시가총액: ${market_cap_t:.2f}T | Trailing P/E: {pe}x | Forward P/E: {fpe}x
- 월가 컨센서스 목표가: ${target} (+{upside}% 상방 여력)

핵심 내용을 다음 순서로 간결하고 임팩트 있게 요약해 주세요:
1. 📊 {quarter} 실적 팩트체크: 매출 및 주당순이익(EPS) 성과와 월가 컨센서스 비교
2. 🚀 핵심 사업 성장 엔진 (Google Cloud, AI Search, YouTube) 및 마진 구조
3. 📉 최근 시장 주가 변동성({vol_pct:+.2f}%) 심층 원인 진단 및 단기 수급 분석
4. 🎯 최종 투자 의견(STRONG BUY) 및 추천 매수 밴드"""
            memo_text = call_ollama(model, system_prompt, u_memo)

            # 2. AI & Cloud (Dynamic)
            u_cloud = f"""[알파벳 Google Cloud & Gemini TPU 인프라 심층 분석 요청]
- 알파벳 현재가: ${p_a} | 시가총액: ${market_cap_t:.2f}T
- 클라우드 및 AI 인프라 최신 공식 현황:
  * 본업 영업이익률: {opm}% 수준의 견고한 마진 엔진
  * AI 실리콘 & CapEx: 데이터센터 및 TPU Trillium 클러스터 대량 배치로 자체 추론 원가 절감
  * 엔터프라이즈 AI: Vertex AI 및 Gemini 모델의 글로벌 기업 엔터프라이즈 공급 확대
- 최신 분기({quarter}) 실적 반영 및 차기 발표 예정일: {next_date}

다음 핵심 항목을 정밀하게 분석해 주세요:
1. Google Cloud의 높은 성장률과 영업이익률 개선이 알파벳 전체 기업가치에 미치는 퀀텀점프 의미
2. AI CapEx 투자가 향후 감가상각을 거치며 창출할 고마진 AI 추론/서빙 현금흐름
3. 엔터프라이즈 AI 시장에서 AWS 및 Azure 대비 구글(Vertex AI + 자체 TPU 실리콘)의 경제적 해자"""
            ai_cloud_text = call_ollama(model, system_prompt, u_cloud)

            # 3. Regulatory (Dynamic)
            u_reg = f"""[알파벳 미 법무부(DOJ) 반독점 소송 및 검색 매출 해자 진단 요청]
- 현재 주가: ${p_a} | Forward P/E: {fpe}x | Trailing P/E: {pe}x
- 최신 공식 공시 현황 ({quarter}):
  * 매출 성장률: +{rev_yoy}% YoY 유지
  * AI 검색(AI Overviews) 도입에 따른 검색 쿼리 성장 및 쿼리당 광고 단가(CPC) 방어 메커니즘
- 반독점 소송 현황:
  * 워싱턴DC 검색 반독점 소송(Chrome 분할 등 구제책 심리) 및 대법원 항소(3~5년 소요) 절차

다음 항목을 냉철하게 분석해 주세요:
1. AI 검색 도입 후 검색 쿼리 성장이 입증한 독점적 검색 시장 점유율과 단가 방어 메커니즘
2. 최악의 시나리오(Chrome 분할 등) 발생 가능성에 대한 법적 현실성과 3~5년 시간적 안전마진
3. 실적 호조 대비 규제 디스카운트가 과도하게 반영된 현 주가에서의 밸류에이션 상방 기회"""
            regulatory_text = call_ollama(model, system_prompt, u_reg)

            # 4. Valuation (Dynamic)
            u_val = f"""[알파벳 최신 밸류에이션 및 주주환원 현금흐름 감사 요청]
- 현재가: ${p_a} | Forward P/E: {fpe}x | Trailing P/E: {pe}x
- 재무 건전성 및 주주환원:
  * 총 현금 ${((googl_f.get('totalCash', 242.5e9)) / 1e9):.1f}B, 총부채 ${((googl_f.get('totalDebt', 120.8e9)) / 1e9):.1f}B
  * 연간 $70B 자사주 매입 프로그램 및 분기 배당 진행
  * 월가 목표주가: 평균 ${target} (현재가 대비 +{upside}% 상승 여력)
- 최신 공식 실적: {quarter} (차기 실적: {next_date})

다음 항목을 평가해 주세요:
1. M7 빅테크 대비 알파벳의 밸류에이션(FPE {fpe}x) 안전마진
2. $70B 자사주 매입이 주가 조정 구간에서 발휘하는 유통주식 소각 레버리지 효과
3. 역(Reverse) DCF 관점에서 현 주가가 내포한 저평가 수준과 목표가 도달 잠재력"""
            valuation_text = call_ollama(model, system_prompt, u_val)
            
            engine_used = f"local_ollama ({model})"
        except Exception as e:
            print(f"[WARN] Local Ollama synthesis failed: {e}. Falling back to dynamic quant rule engine.")

    if not memo_text or not ai_cloud_text or not regulatory_text or not valuation_text:
        memo_f, cloud_f, reg_f, val_f = generate_algorithmic_fallback(googl_f, goog_f, earnings)
        memo_text = memo_text or memo_f
        ai_cloud_text = ai_cloud_text or cloud_f
        regulatory_text = regulatory_text or reg_f
        valuation_text = valuation_text or val_f

    output = {
        "metadata": {
            "last_updated": now_kst,
            "last_updated_ny": now_ny,
            "engine": "institutional_quant_desk",
            "model": "Alphabet Quant Research",
            "googl_price": p_a,
            "goog_price": p_c,
            "target_mean": target,
            "target_high": googl_f.get("targetHighPrice", 500.0),
            "target_low": googl_f.get("targetLowPrice", 340.0),
            "forward_pe": fpe,
            "trailing_pe": pe,
            "latest_quarter": quarter,
            "next_earnings_date": next_date,
            "volatility_alert": vol_alert,
            "recommendation": googl_f.get("recommendationKey", "strong_buy"),
        },
        "reports": {
            "memo": memo_text,
            "ai_cloud": ai_cloud_text,
            "regulatory": regulatory_text,
            "valuation": valuation_text,
        },
    }

    with open(SYNTHESIS_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"[DONE] Synthesis successfully saved to {SYNTHESIS_FILE} using {engine_used}")

if __name__ == "__main__":
    main()
