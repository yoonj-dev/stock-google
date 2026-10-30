import React, { useState } from 'react';
import {
  Flame,
  Calendar,
  Target,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { StockFundamentals } from '../../types/stock';
import { SingleStockProfile } from '../../types/stockConfig';
import { formatCurrency } from '../../lib/stockApi';

interface QuantInsightDockProps {
  profile: SingleStockProfile;
  fundamentals: StockFundamentals;
  onSelectAiQuestion?: (question: string) => void;
  onOpenTab?: (tabId: 'chart' | 'ai_memo' | 'moat' | 'valuation') => void;
}

export const QuantInsightDock: React.FC<QuantInsightDockProps> = ({
  profile,
  fundamentals,
  onSelectAiQuestion,
  onOpenTab,
}) => {
  const [, setCopiedQuestion] = useState<string | null>(null);

  const handleQuestionClick = (q: string) => {
    if (onSelectAiQuestion) {
      onSelectAiQuestion(q);
    }
    if (onOpenTab) {
      onOpenTab('ai_memo');
    }
    setCopiedQuestion(q);
    setTimeout(() => setCopiedQuestion(null), 2500);
  };

  const targetMean = fundamentals.targetMeanPrice || 205.00;
  const currentPrice = fundamentals.currentPrice || 172.50;
  const upside = currentPrice > 0 ? (((targetMean - currentPrice) / currentPrice) * 100).toFixed(1) : '18.8';

  return (
    <div className="space-y-3.5">
      {/* 1. Volatility & Key Catalysts Radar Card */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-3.5 sm:p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Flame className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              핵심 모멘텀 촉매 레이더
            </h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25">
            Gemini & TPU 가속
          </span>
        </div>

        <div className="space-y-2">
          {profile.catalysts.map((cat) => (
            <div
              key={cat.id}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-500/40 transition-colors group cursor-default"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {cat.title}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    cat.impact === 'HIGH'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40'
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40'
                  }`}
                >
                  {cat.tag}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                {cat.summary}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Earnings Flash & Financial Margins Card */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-3.5 sm:p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              실적 발표 & 펀더멘털 마진
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
            {profile.earnings.dDay} ({profile.earnings.date})
          </span>
        </div>

        {/* 2x2 Financial Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
            <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-medium">분기 총매출</span>
            <span className="font-mono font-bold text-slate-900 dark:text-zinc-100 text-xs">
              {profile.earnings.estRevenue}
            </span>
            <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              전년비 +15.1%
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
            <span className="block text-[10px] text-slate-400 dark:text-zinc-500 font-medium">희석 EPS</span>
            <span className="font-mono font-bold text-slate-900 dark:text-zinc-100 text-xs">
              {profile.earnings.estEps}
            </span>
            <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              전년비 +36.8%
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
            <span className="block text-[10px] text-blue-700 dark:text-blue-400 font-medium">매출총이익률 (Gross)</span>
            <span className="font-mono font-black text-blue-800 dark:text-blue-300 text-xs">
              {profile.earnings.grossMargin}
            </span>
            <span className="block text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
              독점적 플랫폼 마진
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
            <span className="block text-[10px] text-indigo-700 dark:text-indigo-400 font-medium">영업이익률 (OPM)</span>
            <span className="font-mono font-black text-indigo-800 dark:text-indigo-300 text-xs">
              {profile.earnings.operatingMargin}
            </span>
            <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5">
              클라우드 마진 급증
            </span>
          </div>
        </div>
      </div>

      {/* 3. Wall Street Consensus & Target Range */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-3.5 sm:p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Target className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              월가 투자 의견 & 목표가
            </h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
            강력 매수 (Strong Buy)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-500 dark:text-zinc-400">평균 목표가 (Mean)</span>
            <div className="text-right">
              <span className="font-mono font-black text-slate-900 dark:text-zinc-100 text-sm">
                {formatCurrency(targetMean)}
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 ml-1.5">
                (+{upside}%)
              </span>
            </div>
          </div>

          {/* Target Min/Max Range Bar */}
          <div className="space-y-1 pt-1">
            <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full relative overflow-hidden">
              <div className="absolute left-[15%] right-[15%] h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-zinc-500">
              <span>최저 $155.00</span>
              <span className="font-bold text-slate-700 dark:text-zinc-300">현재 ${currentPrice.toFixed(2)}</span>
              <span>최고 $240.00</span>
            </div>
          </div>
        </div>

        {/* Quick Reverse DCF Hook */}
        {onOpenTab && (
          <button
            type="button"
            onClick={() => onOpenTab('valuation')}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50/70 hover:bg-blue-100/80 dark:bg-blue-950/30 dark:hover:bg-blue-900/50 border border-blue-200/60 dark:border-blue-800/40 transition-colors flex items-center justify-between cursor-pointer"
          >
            <span>🧮 역DCF 내재 FCF 성장률 계산기 실행</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 4. One-Click Quick AI Prompts */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-3.5 sm:p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              원클릭 퀵 AI 질의
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
            클릭 시 즉시 답변
          </span>
        </div>

        <div className="space-y-1.5">
          {profile.quickAiQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuestionClick(q)}
              className="w-full text-left p-2 rounded-xl text-xs text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 hover:bg-blue-50/60 dark:bg-zinc-800/40 dark:hover:bg-blue-950/20 border border-slate-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-800/40 transition-all flex items-center justify-between gap-2 cursor-pointer group"
            >
              <span className="truncate">{q}</span>
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-500 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
