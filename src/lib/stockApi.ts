import { StockData, StockFundamentals, SpreadAnalysis, LlmSynthesisData } from '../types/stock';
import { MOCK_GOOGL_DATA, MOCK_GOOG_DATA } from '../data/mockSnapshot';

const STOCK_API_BASE = 'https://stock-api.on-tap.xyz';

export async function fetchSynthesisData(): Promise<LlmSynthesisData | null> {
  try {
    const res = await fetch(`/data/synthesis.json?t=${Date.now()}`);
    if (res.ok) {
      const data: LlmSynthesisData = await res.json();
      if (data?.reports?.memo) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[stockApi] Failed to fetch static synthesis data:', err);
  }
  return null;
}

export async function fetchStockData(symbol: 'GOOGL' | 'GOOG'): Promise<StockData> {
  const fallback = symbol === 'GOOGL' ? MOCK_GOOGL_DATA : MOCK_GOOG_DATA;

  // 1. Fetch live market summary from stock-api (Ground Truth)
  let liveQuote: any = null;
  try {
    const sumRes = await fetch(`${STOCK_API_BASE}/market_summary.json?t=${Date.now()}`);
    if (sumRes.ok) {
      const sumData = await sumRes.json();
      liveQuote = sumData?.summary?.[symbol];
    }
  } catch (err) {
    console.warn(`[stockApi] Failed to fetch live quote for ${symbol}:`, err);
  }

  // 2. Try local static data first (instant & resilient)
  let data: StockData | null = null;
  try {
    const localRes = await fetch(`/data/${symbol}.json?t=${Date.now()}`);
    if (localRes.ok) {
      const localData: StockData = await localRes.json();
      if (localData?.fundamentals?.currentPrice) {
        data = localData;
      }
    }
  } catch {
    // Continue to remote API
  }

  // 3. Try remote stock-api if local not available
  if (!data) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${STOCK_API_BASE}/data/${symbol}.json?t=${Date.now()}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const remoteData: StockData = await res.json();
        if (remoteData?.fundamentals?.currentPrice) {
          data = remoteData;
        }
      }
    } catch (err) {
      console.warn(`[stockApi] Network error for ${symbol}, utilizing cached fallback.`, err);
    }
  }

  if (!data) {
    data = fallback;
  }

  // 4. Synchronize live price metrics from single source of truth (market_summary)
  if (liveQuote && data?.fundamentals) {
    data.fundamentals.currentPrice = liveQuote.currentPrice;
    data.fundamentals.regularMarketPrice = liveQuote.currentPrice;
    data.fundamentals.regularLastPrice = liveQuote.currentPrice;
    if (liveQuote.previousClose != null) data.fundamentals.previousClose = liveQuote.previousClose;
    if (liveQuote.change != null) data.fundamentals.change = liveQuote.change;
    if (liveQuote.changePercent != null) data.fundamentals.changePercent = liveQuote.changePercent;
    if (liveQuote.marketState) data.fundamentals.marketState = liveQuote.marketState;
    if (liveQuote.dayHigh != null) data.fundamentals.dayHigh = liveQuote.dayHigh;
    if (liveQuote.dayLow != null) data.fundamentals.dayLow = liveQuote.dayLow;
    if (liveQuote.open != null) data.fundamentals.open = liveQuote.open;
  }

  return data;
}

export async function fetchIndices(): Promise<Record<string, any>> {
  try {
    const res = await fetch(`${STOCK_API_BASE}/indices_summary.json?t=${Date.now()}`);
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

export function calculateSpread(googl: StockFundamentals, goog: StockFundamentals): SpreadAnalysis {
  const googlPrice = googl.currentPrice || 317.94;
  const googPrice = goog.currentPrice || 315.08;
  const dollarDiff = Number((googlPrice - googPrice).toFixed(2));
  const percentSpread = Number(((dollarDiff / googPrice) * 100).toFixed(2));

  let verdict: 'BUY_GOOGL' | 'BUY_GOOG' | 'BALANCED' = 'BALANCED';
  let verdictLabel = '적정 스프레드 (중립 구간)';
  let verdictExplanation =
    '두 주식 간 의결권 프리미엄이 역사적 정상 수렴대(1.0% ~ 2.0%) 내에 안정적으로 위치해 있습니다.';

  if (percentSpread < 1.0) {
    verdict = 'BUY_GOOGL';
    verdictLabel = '클래스 A (GOOGL) 매수 우세';
    verdictExplanation = `현재 의결권 프리미엄이 ${percentSpread}%로 역사적 평균(1.5%) 대비 현저히 축소되어, 의결권이 있는 본주(GOOGL)를 매우 유리한 조건에 취득할 수 있습니다.`;
  } else if (percentSpread > 2.2) {
    verdict = 'BUY_GOOG';
    verdictLabel = '클래스 C (GOOG) 가성비 우세';
    verdictExplanation = `클래스 A 프리미엄이 ${percentSpread}%로 과도하게 벌어져 있습니다. 주총 의결권 행사가 불필요한 장기 투자자는 GOOG 매수를 통한 가성비 극대화가 권장됩니다.`;
  }

  return {
    googlPrice,
    googPrice,
    dollarDiff,
    percentSpread,
    historicalMean: 1.5,
    historicalRangeMin: 0.8,
    historicalRangeMax: 2.4,
    verdict,
    verdictLabel,
    verdictExplanation,
  };
}

export function formatCurrency(val?: number): string {
  if (val === undefined || val === null || isNaN(val)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatLargeNumber(val?: number): string {
  if (val === undefined || val === null || isNaN(val)) return '-';
  if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  return val.toLocaleString();
}

export function formatPercent(val?: number, includeSign = true): string {
  if (val === undefined || val === null || isNaN(val)) return '0.00%';
  const sign = includeSign && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}%`;
}
