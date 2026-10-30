export interface Candle {
  time: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  rsi?: number | null;
  mfi?: number | null;
  session?: 'PRE' | 'REGULAR' | 'POST';
}

export interface VolatilityCatalystNews {
  title: string;
  source: string;
  link: string;
  pubDate: string;
}

export interface VolatilityDriver {
  title: string;
  description: string;
  type: 'negative' | 'positive' | 'warning' | 'info';
}

export type MajorIssueCategory =
  | 'PRICE_VOLATILITY' // 3%+ 주가 급등/급락
  | 'ANTITRUST_LEGAL'  // DOJ 반독점 소송, Chrome 분할, 법원 명령
  | 'AI_SILICON'       // TPU 대형 수주, Gemini 혁신, 엔터프라이즈 AI
  | 'WAYMO_AUTONOMOUS' // Waymo 로보택시 상용화, 서비스 확대
  | 'EARNINGS_CATALYST'// 분기 실적 서프라이즈/미스, CapEx
  | 'LEADERSHIP_MNA'   // 리더십 교체, 대규모 M&A, 주주환원
  | 'GENERAL_MARKET';  // 일반 시장 흐름

export interface MarketVolatilityAlert {
  triggered: boolean;
  triggerReason: 'PRICE_VOLATILITY' | 'MAJOR_CATALYST' | 'BOTH' | 'NONE';
  category: MajorIssueCategory;
  categoryLabel: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';
  direction: 'SURGE' | 'PLUNGE' | 'NEUTRAL';
  changePercent: number;
  changeAmount: number;
  sessionPrice: number;
  threshold: number; // 3.0
  headline: string;
  primaryReason: string;
  drivers: VolatilityDriver[];
  institutionalVerdict: string;
  actionGuide: string;
  relatedNews: VolatilityCatalystNews[];
  detectedAt: string;
}

export interface EarningsFlash {
  quarter: string; // e.g. "2026 Q3"
  reportDate?: string; // "2026-10-28"
  revenue?: number; // ($B)
  revenueYoY?: number; // (%)
  revenueEstimate?: number; // ($B)
  revenueBeat?: boolean;
  eps?: number; // Reported EPS
  epsEstimate?: number;
  epsSurprisePercent?: number; // (%)
  epsBeat?: boolean;
  epsMissReason?: string;
  cloudRevenue?: number; // ($B)
  cloudYoY?: number; // (%)
  cloudOpIncome?: number; // ($B)
  cloudOpMargin?: number; // (%)
  youtubeRevenue?: number; // ($B)
  youtubeYoY?: number; // (%)
  searchRevenue?: number; // ($B)
  searchYoY?: number; // (%)
  capex?: number; // ($B)
  capexYoY?: number; // (%)
  fullYearCapexGuidance?: string;
  afterMarketPrice?: number;
  afterMarketChangePercent?: number;
  keyTakeaway?: string;
  isBreaking?: boolean;
  nextEarningsDate?: string;
  nextEpsEstimate?: number;
  daysSinceReport?: number;
  operatingMargins?: number;
  totalRevenueTTM?: number;
  revenueGrowthYoY?: number;
  earningsGrowthYoY?: number;
}

export interface StockFundamentals {
  symbol: string;
  shortName?: string;
  displayName?: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  open?: number;
  dayLow?: number;
  dayHigh?: number;
  volume?: number;
  marketCap?: number;
  trailingPE?: number;
  forwardPE?: number;
  priceToBook?: number;
  dividendYield?: number;
  dividendRate?: number;
  beta?: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyDayAverage?: number;
  twoHundredDayAverage?: number;
  marketState?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketPreviousClose?: number;
  regularLastPrice?: number;
  regularLastTime?: string;
  extendedLastPrice?: number;
  extendedLastTime?: string;
  extendedLastType?: string;
  postMarketPrice?: number;
  postMarketChange?: number;
  postMarketChangePercent?: number;
  preMarketPrice?: number;
  preMarketChange?: number;
  preMarketChangePercent?: number;
  earningsFlash?: EarningsFlash;
  earningsBrief?: EarningsFlash;
  volatilityAlert?: MarketVolatilityAlert;
  targetHighPrice?: number;
  targetLowPrice?: number;
  targetMeanPrice?: number;
  targetMedianPrice?: number;
  recommendationKey?: string;
  numberOfAnalystOpinions?: number;
  totalCash?: number;
  totalDebt?: number;
  totalRevenue?: number;
  revenueGrowth?: number;
  freeCashflow?: number;
  operatingCashflow?: number;
  grossMargins?: number;
  operatingMargins?: number;
  profitMargins?: number;
  trailingEps?: number;
  forwardEps?: number;
  pegRatio?: number;
  lastDividendValue?: number;
  sharesOutstanding?: number;
  [key: string]: any;
}

export interface StockData {
  fundamentals: StockFundamentals;
  candles: {
    '1d_intraday'?: Candle[];
    '1h'?: Candle[];
    '1d'?: Candle[];
    '1w'?: Candle[];
  };
  earnings_flash?: EarningsFlash;
  earnings_brief?: EarningsFlash;
  volatility_alert?: MarketVolatilityAlert;
  ai_prompts?: {
    momentum?: string;
    comprehensive?: string;
  };
}

export interface SpreadAnalysis {
  googlPrice: number;
  googPrice: number;
  dollarDiff: number;
  percentSpread: number; // (GOOGL - GOOG) / GOOG * 100
  historicalMean: number; // ~1.5%
  historicalRangeMin: number; // ~0.8%
  historicalRangeMax: number; // ~2.4%
  verdict: 'BUY_GOOGL' | 'BUY_GOOG' | 'BALANCED';
  verdictLabel: string;
  verdictExplanation: string;
}

export interface BusinessPillar {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  color: string;
  dotColor: string;
  badge: string;
  highlights: { label: string; value: string; change?: string }[];
  summary: string;
  catalysts: string[];
  risks: string[];
}

export interface OllamaModelTag {
  name: string;
  model: string;
  size: number;
  digest: string;
  details?: {
    family?: string;
    parameter_size?: string;
    quantization_level?: string;
  };
}

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmSynthesisData {
  metadata: {
    last_updated: string;
    last_updated_ny?: string;
    engine: string;
    model: string;
    googl_price: number;
    goog_price: number;
    target_mean?: number;
    target_high?: number;
    target_low?: number;
    forward_pe?: number;
    recommendation?: string;
  };
  reports: {
    memo: string;
    ai_cloud: string;
    regulatory: string;
    valuation: string;
  };
}
