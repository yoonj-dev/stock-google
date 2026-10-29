import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  DollarSign,
  ShieldCheck,
  Zap,
  BarChart2,
  PieChart,
  Target,
  Sparkles,
} from 'lucide-react';
import { StockFundamentals } from '../../types/stock';
import { formatCurrency, formatLargeNumber, formatPercent } from '../../lib/stockApi';

interface AlphabetStockHeroProps {
  googl: StockFundamentals;
  goog: StockFundamentals;
  activeTicker: 'GOOGL' | 'GOOG';
  onSelectTicker: (ticker: 'GOOGL' | 'GOOG') => void;
}

export const AlphabetStockHero: React.FC<AlphabetStockHeroProps> = ({
  googl,
  goog,
  activeTicker,
  onSelectTicker,
}) => {
  const currentStock = activeTicker === 'GOOGL' ? googl : goog;
  const isPositive = currentStock.changePercent >= 0;

  // 52-week position calculation
  const low52 = currentStock.fiftyTwoWeekLow || 264.28;
  const high52 = currentStock.fiftyTwoWeekHigh || 408.61;
  const price = currentStock.currentPrice || 317.94;
  const pos52 = Math.max(0, Math.min(100, ((price - low52) / (high52 - low52)) * 100));

  const targetMean = currentStock.targetMeanPrice || 429.12;
  const upsidePercent = price > 0 ? (((targetMean - price) / price) * 100).toFixed(1) : '35.0';

  return (
    <div className="w-full space-y-4">
      {/* 1. Main Executive Header Card */}
      <div className="fintech-card p-5 sm:p-6 space-y-5">
        {/* Top: Company Brand & Ticker Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4285F4] via-[#EA4335] to-[#FBBC05] p-0.5 shadow-md shrink-0">
              <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-[14px] flex items-center justify-center">
                <span className="text-xl font-black bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] bg-clip-text text-transparent">
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
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                글로벌 검색(Search), 유튜브(YouTube), Google Cloud 및 Gemini AI 생태계를 이끄는 빅테크 지주회사
              </p>
            </div>
          </div>

          {/* Ticker Selector Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 self-start md:self-auto">
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
                <span className="text-[10px] opacity-80 font-normal">(Class A · 의결권 1표)</span>
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
                <span className="text-[10px] opacity-80 font-normal">(Class C · 무의결권)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Middle: Live Price, Change & 52-Week Range */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Price & Change (5 Cols) */}
          <div className="lg:col-span-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                {activeTicker} {activeTicker === 'GOOGL' ? 'Class A' : 'Class C'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                정규장 실시간
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {formatCurrency(price)}
              </span>
              <div
                className={`flex items-center gap-1 text-sm sm:text-base font-bold font-mono ${
                  isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <TrendingDown className="w-4 h-4 stroke-[2.5]" />
                )}
                <span>
                  {currentStock.change > 0 ? '+' : ''}
                  {formatCurrency(currentStock.change)}
                </span>
                <span>({formatPercent(currentStock.changePercent)})</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-zinc-400">
              * 알파벳은 의결권 유무에 따라 GOOGL과 GOOG로 나뉘며, 동일한 기업 실적 및 현금흐름 지분을 갖습니다.
            </p>
          </div>

          {/* 52-Week Range Slider (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800/80 space-y-2">
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
              <span>전일 종가: {formatCurrency(currentStock.previousClose || price)}</span>
              <span>
                일중 범위: {formatCurrency(currentStock.dayLow || price * 0.99)} ~{' '}
                {formatCurrency(currentStock.dayHigh || price * 1.01)}
              </span>
            </div>
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

        {/* 3. Strategic Watchpoint Pills */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            핵심 투자 모멘텀:
          </span>

          <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium border border-blue-500/20">
            ☁️ Google Cloud 연간 런레이트 $40B+ & OP 마진 11%+
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 font-medium border border-purple-500/20">
            🧠 자체 실리콘 TPU Trillium & Gemini 2.0 추론 원가 50% 절감
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-500/20">
            🚗 Waymo 주당 10만+ 건 유료 무인 로보택시 상용 주행
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium border border-slate-200 dark:border-zinc-700">
            🛡️ 순현금 $121B 및 $70B 자사주 매입의 하방 안전마진
          </span>
        </div>
      </div>
    </div>
  );
};
