# PLAN: Alphabet on Tap UI/UX & Sequential Feature Enhancement
- Plan ID: PLAN-20261030-ALPHABET-HERMES
- Date: 2026-10-30
- Status: Approved (Conditional Recommendations Reflected)
- Target Repo: stock-google (https://google.on-tap.xyz)
- 1. Implementation Phases & Architecture
* Phase 1: Real-time Price Glow Pulse & Micro-interactions in AlphabetStockHero.tsx.
* Price update detection hook tracking previous vs latest headline price.
* Emerald (up) / Rose (down) subtle glow flash animation on headline price box upon live data refresh with 1.2s timeout auto-cleanup.
* Active streaming sync heartbeat badge with visual refresh progress feedback.
* Phase 2: Peer Intelligence Matrix Component (src/components/dashboard/PeerIntelligenceMatrix.tsx).
* Big-Tech 5-Peer benchmark dataset: GOOGL vs MSFT, AMZN, META, AAPL.
* Metrics: Trailing PER, Forward PER, PEG Ratio, EV/EBITDA, Operating Margin, FCF Margin, Cloud/AI YoY Growth, 52W Target Upside.
* Dynamic valuation insight callout: Highlighting Alphabet's ~22% discount against peer average PEG.
* Interactive sorting & view toggle: Valuation Multiples, Margins & FCF, AI & Cloud Growth.
* Phase 3: Segment Revenue & Momentum Visualizer (src/components/dashboard/SegmentMomentumTracker.tsx).
* 5 core official business units: Google Search, YouTube Ads, Google Cloud, Subscriptions/Devices, Other Bets.
* Interactive proportional segment breakdown bar with percentage share & dollar run-rate.
* Segment YoY growth comparison badges with Cloud (+34.9%) and Subscriptions (+27.8%) high-growth highlights.
* Cloud operating margin expansion timeline (from loss to +11.3% operating margin leverage).
* Phase 4: Dynamic Scenario Engine in ValuationCalculator.tsx.
* 3 institutional preset scenario buttons: Cloud Margin Expansion (+3%p), DOJ Antitrust Remedy Baseline, TPU CapEx Efficiency.
* One-click dynamic slider adjustment with instant recalculation of Implied Fair Value & Margin of Safety.
- 2. Hermes Audit Feedback Integration
* UI Performance: React.memo applied to PeerIntelligenceMatrix, SegmentMomentumTracker, and IntradayMiniChart to prevent unnecessary dashboard rerenders.
* Mathematical Integrity: Precision bounds on DCF sensitivity scenarios to guarantee stable calculations.
* Data Reliability: Display official SEC 10-Q filing references and timestamp badges on segment and peer data.
- 3. Integration & Dashboard Hierarchy Alignment in App.tsx
* 1. Header (Brand, Ticker Switcher, ⋯ Context Menu)
* 2. MarketVolatilityAlertBanner (3%+ Volatility or Strategic Catalyst) / EarningsFlashBanner
* 3. AlphabetStockHero (Glow Pulse, Dual Session Price, 1D Mini Chart, 52W Gauge, Key Ratios)
* 4. SegmentMomentumTracker (New: Segment Revenue & Cloud Margin Momentum)
* 5. PeerIntelligenceMatrix (New: GOOGL vs MSFT/AMZN/META/AAPL Relative Valuation)
* 6. LocalLlmSynthesizer (4 Quant Memos + Interactive Q&A)
* 7. TradingViewSection (Real-time Candlesticks, Tech Gauge, Financials, Comparison)
* 8. AlphabetSixPillars (6 Business Engines Moat Deck)
* 9. ValuationCalculator (Enhanced: Reverse DCF & Dynamic Scenario Simulator)
* 10. Footer (Ecosystem links & Disclaimers)
- 4. Verification & Compliance Checklist
* TypeScript Compilation: npm run build (0 errors, 0 warnings).
* Theme Standard: check_theme.sh verification (no single-dark utilities, full dark/light dual classes).
* Cloudflare Standard: wrangler deploy --dry-run (18+ assets mapped, SPA route intact).
* Git Protocol: Atomic git commit and push to origin/main.