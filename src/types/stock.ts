export interface Candle {
  time: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  rsi?: number | null;
  mfi?: number | null;
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
  regularLastPrice?: number;
  regularLastTime?: string;
  extendedLastPrice?: number;
  extendedLastTime?: string;
  extendedLastType?: string;
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
    '1h'?: Candle[];
    '1d'?: Candle[];
    '1w'?: Candle[];
  };
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
    spread_diff: number;
    spread_percent: number;
    verdict: 'BUY_GOOGL' | 'BUY_GOOG' | 'BALANCED';
  };
  reports: {
    memo: string;
    arbitrage: string;
    valuation: string;
  };
}
