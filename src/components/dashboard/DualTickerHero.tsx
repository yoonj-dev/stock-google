import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Award,
  Vote,
  ShieldCheck,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { StockFundamentals, SpreadAnalysis } from '../../types/stock';
import { formatCurrency, formatLargeNumber, formatPercent } from '../../lib/stockApi';

interface DualTickerHeroProps {
  googl: StockFundamentals;
  goog: StockFundamentals;
  spread: SpreadAnalysis;
  onSelectTickerForChart: (ticker: 'GOOGL' | 'GOOG') => void;
  activeChartTicker: string;
  onOpenSpreadExplainer: () => void;
}

export const DualTickerHero: React.FC<DualTickerHeroProps> = ({
  googl,
  goog,
  spread,
  onSelectTickerForChart,
  activeChartTicker,
  onOpenSpreadExplainer,
}) => {
  // Helper for 52-week position percentage
  const calculate52WPosition = (current: number, low: number, high: number) => {
    if (!low || !high || high <= low) return 50;
    const pos = ((current - low) / (high - low)) * 100;
    return Math.max(0, Math.min(100, pos));
  };

  const googl52Pos = calculate52WPosition(
    googl.currentPrice,
    googl.fiftyTwoWeekLow || 264.28,
    googl.fiftyTwoWeekHigh || 408.61
  );
  const goog52Pos = calculate52WPosition(
    goog.currentPrice,
    goog.fiftyTwoWeekLow || 264.94,
    goog.fiftyTwoWeekHigh || 404.47
  );

  return (
    <div className="w-full space-y-4">
      {/* Top Banner: Voting Premium & Live Arbitrage Gauge */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-emerald-500/10 border border-blue-500/20 dark:border-blue-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <Scale className="w-4 h-4" />
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>클래스 A (GOOGL) vs C (GOOG) 의결권 스프레드 레이더</span>
                <button
                  onClick={onOpenSpreadExplainer}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                  title="자세히 보기"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
              {spread.verdictExplanation}
            </p>
          </div>

          {/* Spread Metric Badge & Button */}
          <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end bg-white/60 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
            <div className="text-right">
              <div className="text-[10.5px] text-slate-400 dark:text-zinc-400 uppercase font-semibold">
                Voting Premium
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                  +{spread.percentSpread}%
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                  (+${spread.dollarDiff})
                </span>
              </div>
            </div>

            <div
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                spread.verdict === 'BUY_GOOGL'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                  : spread.verdict === 'BUY_GOOG'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{spread.verdictLabel}</span>
            </div>
          </div>
        </div>

        {/* Visual Spread Range Bar */}
        <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-zinc-800/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400 mb-1">
            <span>GOOGL 저평가 (&lt;1.0%)</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              역사적 평균: 1.5% (현재: {spread.percentSpread}%)
            </span>
            <span>GOOG 저평가 (&gt;2.2%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-full relative overflow-hidden">
            {/* Color Zones */}
            <div className="absolute inset-y-0 left-0 w-[40%] bg-emerald-500/30" />
            <div className="absolute inset-y-0 left-[40%] w-[35%] bg-blue-500/30" />
            <div className="absolute inset-y-0 right-0 w-[25%] bg-amber-500/30" />

            {/* Current Indicator Pin */}
            <div
              className="absolute top-0 bottom-0 w-2.5 bg-blue-600 dark:bg-blue-400 rounded-full shadow-md -ml-1 transition-all duration-500"
              style={{
                left: `${Math.min(100, Math.max(0, (spread.percentSpread / 3.0) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Dual Cards Grid: GOOGL (Class A) vs GOOG (Class C) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CARD 1: GOOGL (Class A) */}
        <div
          onClick={() => onSelectTickerForChart('GOOGL')}
          className={`fintech-card p-5 cursor-pointer relative overflow-hidden transition-all duration-200 ${
            activeChartTicker === 'GOOGL'
              ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-md'
              : 'hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          {/* Top Row: Symbol, Class Badge, Chart Status */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  GOOGL
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30 flex items-center gap-1">
                  <Vote className="w-3 h-3" />
                  <span>Class A · 의결권 1표</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Alphabet Inc. (Voting Common Stock)
              </p>
            </div>

            {activeChartTicker === 'GOOGL' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500 text-white">
                차트 활성
              </span>
            )}
          </div>

          {/* Price & Change Row */}
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white">
                {formatCurrency(googl.currentPrice)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-1 font-mono text-sm font-bold ${
                    googl.changePercent >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {googl.changePercent >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {formatPercent(googl.changePercent)} ({googl.change > 0 ? '+' : ''}${googl.change.toFixed(2)})
                </span>
                <span className="text-[11px] text-slate-400 dark:text-zinc-400">
                  정규장 기준
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 dark:text-zinc-400 font-semibold uppercase">
                시가총액
              </div>
              <div className="text-sm font-mono font-bold text-slate-800 dark:text-zinc-200">
                {formatLargeNumber(googl.marketCap)}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-zinc-400">
                Trailing P/E: <span className="font-mono font-bold text-slate-700 dark:text-zinc-200">{googl.trailingPE}x</span>
              </div>
            </div>
          </div>

          {/* 52-Week Range Bar */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-zinc-400">
              <span>52W 저: {formatCurrency(googl.fiftyTwoWeekLow)}</span>
              <span className="text-slate-600 dark:text-zinc-300 font-semibold">
                위치: {googl52Pos.toFixed(0)}%
              </span>
              <span>52W 고: {formatCurrency(googl.fiftyTwoWeekHigh)}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full mt-1.5 relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                style={{ width: `${googl52Pos}%` }}
              />
            </div>
          </div>

          {/* Key Fundamentals Grid */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/60">
              <div className="text-[10px] text-slate-400 dark:text-zinc-400">Forward P/E</div>
              <div className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                {googl.forwardPE ? `${googl.forwardPE}x` : '20.6x'}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/60">
              <div className="text-[10px] text-slate-400 dark:text-zinc-400">PEG Ratio</div>
              <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {googl.pegRatio || 1.12}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/60">
              <div className="text-[10px] text-slate-400 dark:text-zinc-400">배당 수익률</div>
              <div className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                {googl.dividendYield ? `${googl.dividendYield}%` : '0.28%'}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: GOOG (Class C) */}
        <div
          onClick={() => onSelectTickerForChart('GOOG')}
          className={`fintech-card p-5 cursor-pointer relative overflow-hidden transition-all duration-200 ${
            activeChartTicker === 'GOOG'
              ? 'ring-2 ring-emerald-500 dark:ring-emerald-400 shadow-md'
              : 'hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          {/* Top Row: Symbol, Class Badge, Chart Status */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  GOOG
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Class C · 무의결권</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Alphabet Inc. (Non-Voting Capital Stock)
              </p>
            </div>

            {activeChartTicker === 'GOOG' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                차트 활성
              </span>
            )}
          </div>

          {/* Price & Change Row */}
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white">
                {formatCurrency(goog.currentPrice)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-1 font-mono text-sm font-bold ${
                    goog.changePercent >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {goog.changePercent >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {formatPercent(goog.changePercent)} ({goog.change > 0 ? '+' : ''}${goog.change.toFixed(2)})
                </span>
                <span className="text-[11px] text-slate-400 dark:text-zinc-400">
                  정규장 기준
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 dark:text-zinc-400 font-semibold uppercase">
                시가총액
              </div>
              <div className="text-sm font-mono font-bold text-slate-800 dark:text-zinc-200">
                {formatLargeNumber(goog.marketCap)}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-zinc-400">
                Trailing P/E: <span className="font-mono font-bold text-slate-700 dark:text-zinc-200">{goog.trailingPE || 15.8}x</span>
              </div>
            </div>
          </div>

          {/* 52-Week Range Bar */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-zinc-400">
              <span>52W 저: {formatCurrency(goog.fiftyTwoWeekLow)}</span>
              <span className="text-slate-600 dark:text-zinc-300 font-semibold">
                위치: {goog52Pos.toFixed(0)}%
              </span>
              <span>52W 고: {formatCurrency(goog.fiftyTwoWeekHigh)}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full mt-1.5 relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                style={{ width: `${goog52Pos}%` }}
              />
            </div>
          </div>

          {/* Key Fundamentals Grid */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/60">
              <div className="text-[10px] text-slate-400 dark:text-zinc-400">Forward P/E</div>
              <div className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                {goog.forwardPE ? `${goog.forwardPE}x` : '20.4x'}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/60">
              <div className="text-[10px] text-slate-400 dark:text-zinc-400">스프레드 할인</div>
              <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                -${spread.dollarDiff}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/60">
              <div className="text-[10px] text-slate-400 dark:text-zinc-400">배당 수익률</div>
              <div className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                {goog.dividendYield ? `${goog.dividendYield}%` : '0.28%'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
