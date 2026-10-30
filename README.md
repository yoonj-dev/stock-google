# Alphabet on Tap (stock-google)

> **알파벳(GOOGL · GOOG) 올인원 주식 인텔리전스, 실시간 로컬 LLM 퀀트 취합 & 트레이딩뷰 허브**  
> **공식 서비스 URL**: `https://google.on-tap.xyz` (배포 예정)  
> **생태계**: [Stock on Tap](https://stock.on-tap.xyz) · [Alpha on Tap](https://alpha.on-tap.xyz) · [On Tap Dev](https://dev.on-tap.xyz)

---

## 1. 개요 (Overview)

**Alphabet on Tap**은 구글 모회사 알파벳(Alphabet Inc.)의 두 상장 주식 클래스인 **GOOGL(Class A, 의결권 1표)**과 **GOOG(Class C, 무의결권)**의 모든 펀더멘털, 실시간 시세, 기술적 보조지표, 6대 사업부 해자 분석을 총망라한 전문 핀테크 웹 애플리케이션입니다.

특히 온디바이스 로컬 거대언어모델(**Ollama × Google Gemma**)을 브라우저에 직접 연결하여 실시간 체결가, 스프레드, 재무제표 데이터를 즉시 취합 및 스트리밍 추론하는 **실시간 로컬 LLM 퀀트 취합 스테이션**을 탑재하였습니다.

---

## 2. 핵심 기능 (Key Capabilities)

### 2.1 ⚖️ 클래스 A(GOOGL) vs C(GOOG) 의결권 스프레드 & 차익거래 레이더
- **실시간 스프레드 측정**: `(GOOGL - GOOG) / GOOG * 100` (%) 및 달러($) 가격 차이 실시간 계산
- **역사적 정상 수렴 밴드(1.0% ~ 2.0%) 비교**:
  - **스프레드 < 1.0% (GOOGL 저평가)**: 의결권 프리미엄이 역사적 평균(1.5%) 대비 극도로 축소되어 본주(GOOGL) 매수가 유리한 구간 판별
  - **스프레드 > 2.2% (GOOG 가성비 우세)**: 의결권 가치가 과도하게 평가되어 무의결권 주식(GOOG) 매수가 실리적인 구간 판별
- **클래스 B(1주당 10표, 비상장 창업자 주식)** 지배 구조 및 2014년 주식 분할 배경 완벽 해설 모달 탑재

### 2.2 ⚡ 온디바이스 로컬 LLM 실시간 퀀트 취합 스테이션 (Ollama Integration)
- **로컬 Ollama 연결**: `http://127.0.0.1:11434` (Vite 프록시 `/ollama-api`를 통한 브라우저 CORS 원천 차단)
- **로컬 Gemma 모델 자동 감지**: `gemma4:26b-a4b`, `gemma4-coding:latest`, `gemma4-daily:latest`, `llama3.3` 등
- **3대 실시간 취합 모드**:
  1. **종합 퀀트 메모 (Full Memo)**: 이동평균선(50/200 DMA), RSI/MFI 과매도 지지선, 클라우드 흑자 레버리지, 반독점 소송 구제책 종합 보고서
  2. **클래스 A vs C 차익 진단 (Spread Doctor)**: 실시간 수치 기반 페어 트레이딩 스위칭 가이드
  3. **밸류에이션 & DCF 감사 (Valuation Audit)**: FCF $22.7B+, 순현금 $121B+, 자사주 매입 $70B 안전마진 분석
- **AI 애널리스트 인터랙티브 대화 (Copilot)**: 실시간 재무 데이터가 주입된 온디바이스 Gemma와 멀티턴 질의응답
- **스마트 폴백 엔진**: 로컬 Ollama 미실행 시에도 내장 퀀트 규칙 엔진을 통해 즉각적인 분석 제공
- **AI 네이티브 앱 딥링크 연동 (`aiAppLauncher.ts`)**: Google Gemini, ChatGPT, Claude, Perplexity, Grok 앱 원클릭 실행

### 2.3 📈 트레이딩뷰(TradingView) 풀스택 차트 & 분석 스위트
- **실시간 캔들스틱 인터랙티브 차트**: GOOGL / GOOG 원클릭 스위칭, 15분/1시간/일봉/주봉/월봉 타임프레임, RSI 및 이동평균선 내장
- **기술적 분석 게이지 (Technical Analysis Gauge)**: 오실레이터, 이동평균선 종합 매수/매도/중립 시그널
- **매그니피센트 7 (M7) 피어 비교**: GOOGL vs MSFT, NVDA, AAPL, AMZN, META, QQQ, SPY 상대수익률 오버레이
- **재무제표 뷰 (Financials)**: 손익계산서, 대차대조표, 현금흐름표 시각화

### 2.4 🏛️ 알파벳 6대 비즈니스 기둥 (Business Pillars Intelligence)
1. **Google Services & Search**: 글로벌 검색 점유율 90.8%, AI Overviews 전환율, Android/Chrome 생태계 락인
2. **Google Cloud Platform (GCP)**: 연간 런레이트 $40B+ 돌파, 영업이익률 11.8% 흑자 전환, Vertex AI 엔터프라이즈 모멘텀
3. **YouTube & Subscriptions**: Music & Premium 구독자 1억 명, 거실 TV 시청 1위, Shorts 700억 뷰
4. **Waymo & Other Bets**: 주당 15만 건+ 유료 무인 로보택시 운행, 6세대 Waymo Driver 현대차 아이오닉 5 양산, $50B+ 잠재 가치
5. **AI Research & Custom Silicon**: Google DeepMind, Gemini 2.0 / Flash, 6세대 TPU Trillium 및 v5p 수직계열화 원가 우위
6. **Capital Allocation & Fortress**: 순현금 $121B+, 연간 $70B 자사주 매입 소각, 주당 $0.80 분기 배당 주주환원

### 2.5 🎯 역(Reverse) DCF 계산기 & 월가 컨센서스 스펙트럼
- **역 DCF 시뮬레이터**: 요구수익률(WACC)과 영구 성장률 슬라이더를 조절하여 현재 주가에 내재된 필요 FCF 성장률(7.8%) 역산
- **안전마진 확인**: 알파벳 5개년 실제 FCF 성장률(18.2%) 대비 +10.4%p의 강력한 하방 안전마진 가시화
- **월가 컨센서스 스펙트럼**: 54개 글로벌 투자은행 목표주가(최저 $340, 평균 $429.12, 최고 $500) 대비 현재가 위치 게이지

---

## 3. 디자인 & 표준 규격 준수 (Standards & Protocols)

1. **Dark & Light Theme Engineering Standard (`theme-mode-standard`)**:
   - Tailwind CSS v4 `@custom-variant dark (&:is(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *));` (명시도 `(0, 2, 0)`)
   - `:root, .light, [data-theme="light"]` 및 `.dark, [data-theme="dark"]` 양방향 CSS 변수 완비
   - DOM 듀얼 동기화 (`<html>` + `<body>`) 및 `document.documentElement.classList.contains('dark')` 단일 진실 공급원
   - `alpha_theme`, `stock_theme`, `theme` 로컬스토리지 삼중 동기화로 에코시스템 간 테마 일관성 유지
   - `check_theme.sh` 정적 분석 0개 경고 통과
2. **헤더 `⋯` (3-dot) 컨텍스트 메뉴 및 애드센스 공존 규격**:
   - `data-brand-context-menu="true"` 속성 트리거
   - `menuTarget: 'mobile' | 'desktop' | null` 반응형 분리로 DOM 중복 마운트 원천 방지
   - `🍺 Buy me a beer (후원하기)` (`window.BrandUI.openDonate()` / `#beer-btn` 위젯 연동)
   - `🚀 개발자 페이지 (On Tap)` (`https://dev.on-tap.xyz`)
   - Google AdSense 메타 태그, `<script>`, `/ads.txt` 및 `.brand-ui-ad-slot` 탑재
3. **Cloudflare Deployment Protocol (Workers & Pages)**:
   - Node.js v22 표준화 (`.nvmrc`, `.node-version`, `engines.node >= 22.0.0`)
   - `wrangler.toml` 정적 에셋 규격: `[assets] directory = "./dist"`, `not_found_handling = "single-page-application"`
   - `_redirects` 파일 금지 정책 준수로 `100324: Infinite loop detected` 원천 차단
   - `npx wrangler deploy --dry-run` 100% 무결성 검증 완료

---

## 4. 로컬 실행 및 빌드 가이드

### 4.1 개발 서버 구동
```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행 (Vite 포트 3001, /ollama-api 프록시 활성화)
npm run dev
```

### 4.2 프로덕션 빌드 & Cloudflare 검증
```bash
# TypeScript 검사 및 Vite 프로덕션 빌드
npm run build

# Cloudflare 에셋 배포 Dry-run 사전 검증
npx wrangler deploy --dry-run
```

### 4.3 로컬 Ollama 실행 (선택 사항)
브라우저에서 직접 로컬 Ollama를 호출할 때 CORS 제한 없이 사용하려면:
```bash
OLLAMA_ORIGINS="*" ollama serve
```

---

## 5. 라이선스

MIT License © 2026 YoonJ Dev & Antigravity.
