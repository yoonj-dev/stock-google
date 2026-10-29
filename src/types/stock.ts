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

export interface EarningsFlash {
  quarter: string; // e.g. "2026 Q3"
  reportDate: string; // "2026-10-28"
  revenue: number; // 127.6 ($B)
  revenueYoY: number; // 25.0 (%)
  revenueEstimate: number; // 122.5 ($B)
  revenueBeat: boolean;
  eps: number; // 2.12
  epsEstimate: number; // 3.01
  epsSurprisePercent: number; // -29.5 (%)
  epsBeat: boolean;
  epsMissReason: string;
  cloudRevenue: number; // 30.7 ($B)
  cloudYoY: number; // 103.0 (%)
  cloudOpIncome: number; // 11.1 ($B)
  cloudOpMargin: number; // 36.2 (%)
  youtubeRevenue: number; // 11.2 ($B)
  youtubeYoY: number; // 9.0 (%)
  searchRevenue: number; // 63.4 ($B)
  searchYoY: number; // 12.0 (%)
  capex: number; // 51.4 ($B)
  capexYoY: number; // 114.2 (%)
  fullYearCapexGuidance: string;
  afterMarketPrice: number; // 292.50
  afterMarketChangePercent: number; // -9.97
  keyTakeaway: string;
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
