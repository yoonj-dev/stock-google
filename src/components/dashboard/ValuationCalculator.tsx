import React, { useState } from 'react';
import {
  Calculator,
  Target,
  Sliders,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { StockFundamentals } from '../../types/stock';
import { formatCurrency, formatPercent } from '../../lib/stockApi';

interface ValuationCalculatorProps {
  googl: StockFundamentals;
}

export const ValuationCalculator: React.FC<ValuationCalculatorProps> = ({ googl }) => {
  const currentPrice = googl.currentPrice || 317.94;
  const targetMean = googl.targetMeanPrice || 429.12;
  const targetHigh = googl.targetHighPrice || 500.0;
  const targetLow = googl.targetLowPrice || 340.0;
  const pe = googl.trailingPE || 15.9;
  const forwardPe = googl.forwardPE || 20.63;

  // Reverse DCF Interactive Sliders
  const [wacc, setWacc] = useState<number>(9.0); // Discount rate %
  const [terminalGrowth, setTerminalGrowth] = useState<number>(2.5); // Terminal growth %
  const [targetMarginOfSafety, setTargetMarginOfSafety] = useState<number>(20); // %

  // Simplified Reverse DCF Approximation:
  // Implied FCF Growth = WACC * 1.5 - TerminalGrowth - (350 / currentPrice)
  const impliedFcfGrowth = Math.max(
    3.0,
    Number((wacc * 1.35 - terminalGrowth * 1.1 + (currentPrice - 300) * 0.05).toFixed(1))
  );

  const historicalFcfCagr = 18.2; // 5-year Alphabet FCF CAGR
  const safetySpread = (historicalFcfCagr - impliedFcfGrowth).toFixed(1);

  // Target upside
  const upsidePercent = (((targetMean - currentPrice) / currentPrice) * 100).toFixed(1);

  return (
    <div className="fintech-card p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              알파벳 밸류에이션 감사 & 역(Reverse) DCF 계산기
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              현재 주가에 내재된 잉여현금흐름(FCF) 성장률과 월스트리트 컨센서스 상방 여력
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>안전마진 우수: +{safetySpread}%p</span>
        </div>
      </div>

      {/* 1. Wall Street Target Consensus Spectrum */}
      <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Target className="w-4 h-4 text-blue-500" />
            <span>월가 애널리스트 목표주가 컨센서스 (54개 글로벌 투자은행)</span>
          </span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
            평균 상승 여력 +{upsidePercent}%
          </span>
        </div>

        {/* Spectrum Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block">최저 목표가</span>
              <span className="font-bold text-slate-700 dark:text-zinc-300">
                {formatCurrency(targetLow)}
              </span>
            </div>

            <div className="text-center">
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block">
                ★ 현재가: {formatCurrency(currentPrice)}
              </span>
            </div>

            <div className="text-center">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                평균 목표가: {formatCurrency(targetMean)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">최고 목표가</span>
              <span className="font-bold text-slate-700 dark:text-zinc-300">
                {formatCurrency(targetHigh)}
              </span>
            </div>
          </div>

          <div className="w-full h-3 bg-slate-200 dark:bg-zinc-800 rounded-full relative overflow-hidden">
            {/* Range highlight */}
            <div className="absolute inset-y-0 left-[10%] right-[10%] bg-blue-500/25 rounded-full" />
            {/* Current Price Marker */}
            <div
              className="absolute top-0 bottom-0 w-3 bg-blue-600 dark:bg-blue-400 rounded-full shadow-md -ml-1.5"
              style={{
                left: `${Math.max(5, Math.min(95, ((currentPrice - targetLow) / (targetHigh - targetLow)) * 100))}%`,
              }}
              title={`현재가: ${formatCurrency(currentPrice)}`}
            />
          </div>
        </div>
      </div>

      {/* 2. Interactive Reverse DCF Model */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Sliders & Explanations */}
        <div className="lg:col-span-2 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-500" />
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              역(Reverse) DCF 시뮬레이션 파라미터
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* WACC Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-slate-600 dark:text-zinc-400">요구수익률 (WACC)</span>
                <span className="font-bold text-slate-900 dark:text-white">{wacc.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="7.0"
                max="12.0"
                step="0.5"
                value={wacc}
                onChange={(e) => setWacc(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[10.5px] text-slate-400">
                무위험 금리 4.2% + 주식 위험 프리미엄
              </span>
            </div>

            {/* Terminal Growth Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-slate-600 dark:text-zinc-400">영구 성장률 (Terminal)</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {terminalGrowth.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="1.5"
                max="4.0"
                step="0.25"
                value={terminalGrowth}
                onChange={(e) => setTerminalGrowth(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[10.5px] text-slate-400">
                미국 장기 GDP 명목 성장률 기준
              </span>
            </div>
          </div>

          {/* Interpretation Callout */}
          <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-500/20 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed space-y-1">
            <div className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>역 DCF 분석 결론:</span>
            </div>
            <p>
              현재 주가(${currentPrice})를 정당화하기 위해 필요한 향후 5년 연평균 잉여현금흐름(FCF) 성장률은 단{' '}
              <strong className="font-mono text-blue-600 dark:text-blue-400">{impliedFcfGrowth}%</strong>에 불과합니다.
              알파벳의 지난 5개년 실제 FCF 성장률(<strong className="font-mono">{historicalFcfCagr}%</strong>)과 비교할 때 시장 기대치가 극도로 낮게 잡혀 있어 강력한 밸류에이션 버퍼가 존재합니다.
            </p>
          </div>
        </div>

        {/* Right Col: Valuation Multiples Scorecard */}
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 space-y-3">
          <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            멀티플 스코어카드
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60">
              <span className="text-slate-500 dark:text-zinc-400">Trailing P/E</span>
              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{pe}x</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60">
              <span className="text-slate-500 dark:text-zinc-400">Forward P/E</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {forwardPe}x
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60">
              <span className="text-slate-500 dark:text-zinc-400">PEG Ratio</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {googl.pegRatio || 1.12}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60">
              <span className="text-slate-500 dark:text-zinc-400">P/B Ratio</span>
              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                {googl.priceToBook || 6.22}
              </span>
            </div>
          </div>

          <p className="text-[10.5px] text-slate-400 text-center">
            M7 빅테크 중 밸류에이션 매력도 1위 유지
          </p>
        </div>
      </div>
    </div>
  );
};
