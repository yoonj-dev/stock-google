import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  DollarSign,
  ShieldCheck,
  BarChart2,
  PieChart,
  Target,
} from 'lucide-react';
import { StockFundamentals, Candle } from '../../types/stock';
import { formatCurrency, formatLargeNumber, formatPercent } from '../../lib/stockApi';
import { IntradayMiniChart } from './IntradayMiniChart';
import { EarningsFlashBanner } from './EarningsFlashBanner';

interface AlphabetStockHeroProps {
  googl: StockFundamentals;
  goog: StockFundamentals;
  activeTicker: 'GOOGL' | 'GOOG';
  onSelectTicker: (ticker: 'GOOGL' | 'GOOG') => void;
  googlCandles?: Candle[];
  googCandles?: Candle[];
}

export type MarketSession = 'REGULAR' | 'POST' | 'PRE' | 'OVERNIGHT' | 'CLOSED';

export const AlphabetStockHero: React.FC<AlphabetStockHeroProps> = ({
  googl,
  goog,
  activeTicker,
  onSelectTicker,
  googlCandles = [],
  googCandles = [],
}) => {
  const currentStock = activeTicker === 'GOOGL' ? googl : goog;
  const currentCandles = activeTicker === 'GOOGL' ? googlCandles : googCandles;

  // 1. Determine Market Session State
  const rawState = (currentStock.marketState || '').toUpperCase();
  let session: MarketSession = 'CLOSED';
  if (rawState.includes('REGULAR')) {
    session = 'REGULAR';
  } else if (rawState.includes('POST')) {
    session = 'POST';
  } else if (rawState.includes('PRE')) {
    session = 'PRE';
  } else if (rawState.includes('OVERNIGHT')) {
    session = 'OVERNIGHT';
  } else if (rawState.includes('CLOSED')) {
    session = 'CLOSED';
  } else {
    // Check if post/pre price exists
    if (currentStock.postMarketPrice) session = 'POST';
    else if (currentStock.preMarketPrice) session = 'PRE';
    else session = 'REGULAR';
  }

  const isRegular = session === 'REGULAR';

  // 2. Regular market session metrics (Always Regular Close vs Previous Close)
  const regPrice = currentStock.regularMarketPrice || currentStock.regularLastPrice || currentStock.currentPrice;
  const regPrevClose = currentStock.regularMarketPreviousClose || currentStock.previousClose || regPrice;
  const regChange = currentStock.regularMarketChange != null ? currentStock.regularMarketChange : (regPrice - regPrevClose);
  const regChangePercent = currentStock.regularMarketChangePercent != null ? currentStock.regularMarketChangePercent : (regPrevClose > 0 ? (regChange / regPrevClose) * 100 : 0);
  const isRegPositive = regChange >= 0;

  // 3. Extended session metrics (Base is ALWAYS regPrice from the regular session)
  const hasPre = currentStock.preMarketPrice != null && currentStock.preMarketPrice > 0;
  const hasPost = currentStock.postMarketPrice != null && currentStock.postMarketPrice > 0;

  let extPrice: number | null = null;
  let extChange: number | null = null;
  let extChangePercent: number | null = null;
  let extLabel = '';

  if (session === 'PRE' || (session === 'CLOSED' && hasPre && !hasPost)) {
    extPrice = currentStock.preMarketPrice!;
    extChange = currentStock.preMarketChange != null ? currentStock.preMarketChange : (extPrice - regPrice);
    extChangePercent = currentStock.preMarketChangePercent != null ? currentStock.preMarketChangePercent : (regPrice > 0 ? (extChange / regPrice) * 100 : 0);
    extLabel = '프리마켓';
  } else if (session === 'POST' || session === 'OVERNIGHT' || (session === 'CLOSED' && hasPost)) {
    extPrice = currentStock.postMarketPrice!;
    extChange = currentStock.postMarketChange != null ? currentStock.postMarketChange : (extPrice - regPrice);
    extChangePercent = currentStock.postMarketChangePercent != null ? currentStock.postMarketChangePercent : (regPrice > 0 ? (extChange / regPrice) * 100 : 0);
    extLabel = session === 'OVERNIGHT' ? '야간장' : '애프터마켓';
  }

  // 4. Headline Selection: In extended session, display extended price and change against regular close!
  const isExtendedActive = (session === 'PRE' || session === 'POST' || session === 'OVERNIGHT') && extPrice != null;

  const headlinePrice = isExtendedActive ? extPrice! : regPrice;
  const headlineChange = isExtendedActive ? extChange! : regChange;
  const headlineChangePercent = isExtendedActive ? extChangePercent! : regChangePercent;
  const isHeadlinePositive = headlineChange >= 0;

  // Chart baseline for intraday mini chart
  const chartBaseline = isExtendedActive ? regPrice : regPrevClose;

  // 5. 52-week position calculation
  const low52 = currentStock.fiftyTwoWeekLow || 267.67;
  const high52 = currentStock.fiftyTwoWeekHigh || 408.61;
  const pos52 = Math.max(0, Math.min(100, ((headlinePrice - low52) / (high52 - low52)) * 100));

  const targetMean = currentStock.targetMeanPrice || 429.12;
  const upsidePercent = headlinePrice > 0 ? (((targetMean - headlinePrice) / headlinePrice) * 100).toFixed(1) : '35.0';

  // Session Badge Config
  const sessionConfig: Record<MarketSession, { label: string; dotColor: string; badgeBg: string }> = {
    REGULAR: {
      label: '정규장 실시간',
      dotColor: 'bg-emerald-500 animate-pulse',
      badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/25',
    },
    POST: {
      label: '애프터마켓 (시간외)',
      dotColor: 'bg-amber-500 animate-pulse',
      badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-500/25',
    },
    PRE: {
      label: '프리마켓 (개장전)',
      dotColor: 'bg-amber-500 animate-pulse',
      badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-500/25',
    },
    OVERNIGHT: {
      label: '야간장 (오버나이트 24H)',
      dotColor: 'bg-indigo-500',
      badgeBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400 border border-indigo-500/25',
    },
    CLOSED: {
      label: '장마감',
      dotColor: 'bg-slate-400 dark:bg-zinc-500',
      badgeBg: 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700',
    },
  };

  return (
    <div className="w-full space-y-4">
      {/* 🚨 2026 Q3 실적 속보 & 장외 긴급 진단 배너 */}
      <EarningsFlashBanner flash={currentStock.earningsFlash} />

      {/* 1. Main Executive Header Card */}
      <div className="fintech-card p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Top: Company Brand & Ticker Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#4285F4] via-[#EA4335] to-[#FBBC05] p-0.5 shadow-md shrink-0">
              <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-[14px] flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] bg-clip-text text-transparent">
                  G
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Alphabet Inc. (구글)
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold border border-blue-500/20">
                  NASDAQ
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                글로벌 검색(Search), 유튜브(YouTube), Google Cloud 및 Gemini AI 생태계를 이끄는 빅테크 지주회사
              </p>
            </div>
          </div>

          {/* Ticker Selector Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 self-start md:self-auto shrink-0">
            <div className="flex items-center bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-xs font-bold">
              <button
                onClick={() => onSelectTicker('GOOGL')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTicker === 'GOOGL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>GOOGL</span>
                <span className="text-[10px] opacity-80 font-normal hidden xs:inline">(Class A · 의결권 1표)</span>
              </button>

              <button
                onClick={() => onSelectTicker('GOOG')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTicker === 'GOOG'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>GOOG</span>
                <span className="text-[10px] opacity-80 font-normal hidden xs:inline">(Class C · 무의결권)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Middle: Live Price, Session State & 1D Intraday Mini-Chart (Circled Area) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Price, Badges & Extended Session Breakdown */}
          <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
            {/* Ticker & Market Session Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                {activeTicker} {activeTicker === 'GOOGL' ? 'Class A' : 'Class C'}
              </span>

              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${sessionConfig[session].badgeBg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sessionConfig[session].dotColor}`} />
                <span>{sessionConfig[session].label}</span>
              </span>

              {isExtendedActive && (
                <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {extLabel} 체결가
                </span>
              )}
            </div>

            {/* Headline Price & Session Change */}
            <div className="flex items-baseline gap-2.5 sm:gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(headlinePrice)}
              </span>

              <div
                className={`flex items-center gap-1 text-sm sm:text-base font-bold font-mono ${
                  isHeadlinePositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isHeadlinePositive ? (
                  <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <TrendingDown className="w-4 h-4 stroke-[2.5]" />
                )}
                <span>
                  {headlineChange > 0 ? '+' : ''}
                  {formatCurrency(headlineChange)}
                </span>
                <span>({formatPercent(headlineChangePercent)})</span>
              </div>
            </div>

            {/* Sub-line: Unambiguous Breakdown between Regular Market & Extended Market */}
            {isExtendedActive ? (
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-zinc-400 font-mono">
                <span className="font-sans text-slate-400 dark:text-zinc-400">정규장 마감 종가:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">
                  {formatCurrency(regPrice)}
                </span>
                <span
                  className={`font-semibold ${
                    isRegPositive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  ({isRegPositive ? '+' : ''}{formatCurrency(regChange)}, {isRegPositive ? '+' : ''}{regChangePercent.toFixed(2)}%)
                </span>
                <span className="text-slate-300 dark:text-zinc-700">·</span>
                <span className="font-sans text-slate-400 dark:text-zinc-400">{extLabel} 변동:</span>
                <span
                  className={`font-semibold ${
                    isHeadlinePositive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isHeadlinePositive ? '+' : ''}{formatCurrency(headlineChange)} ({isHeadlinePositive ? '+' : ''}{headlineChangePercent.toFixed(2)}%)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 font-mono">
                <span className="font-sans text-slate-400 dark:text-zinc-400 font-sans">전일 종가</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-200">
                  {formatCurrency(regPrevClose)}
                </span>
                <span className="text-slate-300 dark:text-zinc-700">·</span>
                <span className="font-sans text-slate-400 dark:text-zinc-400 font-sans">일중 범위</span>
                <span className="text-slate-600 dark:text-zinc-300">
                  {formatCurrency(currentStock.dayLow || regPrice * 0.99)} ~{' '}
                  {formatCurrency(currentStock.dayHigh || regPrice * 1.01)}
                </span>
                {extPrice != null && (
                  <>
                    <span className="text-slate-300 dark:text-zinc-700">·</span>
                    <span className="font-sans text-slate-400 dark:text-zinc-400 font-sans">{extLabel}:</span>
                    <span
                      className={`font-semibold ${
                        (extChange ?? 0) >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatCurrency(extPrice)} ({(extChange ?? 0) >= 0 ? '+' : ''}
                      {(extChangePercent ?? 0).toFixed(2)}%)
                    </span>
                  </>
                )}
              </div>
            )}

            <p className="text-[10.5px] sm:text-[11px] text-slate-400 dark:text-zinc-400 line-clamp-1">
              * 프리(04:00~) · 정규(09:30~16:00) · 애프터(16:00~20:00) · 야간 실시간 체결가를 반영합니다.
            </p>
          </div>

          {/* Right: 1D Intraday Mini Chart with Extended Hours (Target Circled Spot) */}
          <div className="w-full sm:w-[260px] md:w-[300px] lg:w-[340px] shrink-0">
            <IntradayMiniChart
              candles={currentCandles}
              previousClose={chartBaseline}
              currentPrice={headlinePrice}
              symbol={activeTicker}
            />
          </div>
        </div>

        {/* 52-Week Range Slider (Full Width) */}
        <div className="bg-slate-50 dark:bg-zinc-800/40 p-3.5 sm:p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-zinc-400">
            <span>52주 최저: {formatCurrency(low52)}</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
              현재 위치: {pos52.toFixed(0)}%
            </span>
            <span>52주 최고: {formatCurrency(high52)}</span>
          </div>

          <div className="relative w-full h-2.5 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${pos52}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>전일 종가: {formatCurrency(regPrevClose)}</span>
            <span>
              일중 범위: {formatCurrency(currentStock.dayLow || regPrice * 0.99)} ~{' '}
              {formatCurrency(currentStock.dayHigh || regPrice * 1.01)}
            </span>
          </div>
        </div>

        {/* 2. 6 Fundamental Investor Pillar Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {/* Card 1: Market Cap */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              <span>시가총액</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold font-mono text-slate-900 dark:text-white">
              {formatLargeNumber(currentStock.marketCap || 3.87e12)}
            </div>
            <div className="text-[10.5px] text-slate-400 font-medium">글로벌 4위 빅테크</div>
          </div>

          {/* Card 2: Valuation P/E */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">
              <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>P/E 멀티플</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold font-mono text-slate-900 dark:text-white">
              {currentStock.forwardPE || 20.4}x
            </div>
            <div className="text-[10.5px] text-slate-400 font-medium">
              Trailing: {currentStock.trailingPE || 15.9}x
            </div>
          </div>

          {/* Card 3: Net Cash */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>순현금 요새</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              +$121.7B
            </div>
            <div className="text-[10.5px] text-slate-400 font-medium">총 현금 $242.5B</div>
          </div>

          {/* Card 4: FCF & Buybacks */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">
              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
              <span>주주환원</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold font-mono text-slate-900 dark:text-white">
              $70B 매입
            </div>
            <div className="text-[10.5px] text-slate-400 font-medium">
              배당 $0.80/년 (0.28%)
            </div>
          </div>

          {/* Card 5: Analyst Target */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">
              <Target className="w-3.5 h-3.5 text-rose-500" />
              <span>월가 목표가</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold font-mono text-blue-600 dark:text-blue-400">
              {formatCurrency(targetMean)}
            </div>
            <div className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
              +{upsidePercent}% 상방여력
            </div>
          </div>

          {/* Card 6: Consensus Rating */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">
              <PieChart className="w-3.5 h-3.5 text-purple-500" />
              <span>투자의견</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              Strong Buy
            </div>
            <div className="text-[10.5px] text-slate-400 font-medium">매수 88% 컨센서스</div>
          </div>
        </div>
      </div>
    </div>
  );
};