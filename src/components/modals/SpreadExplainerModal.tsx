import React from 'react';
import { X, Vote, ShieldCheck, Scale, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { SpreadAnalysis } from '../../types/stock';

interface SpreadExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  spread: SpreadAnalysis;
}

export const SpreadExplainerModal: React.FC<SpreadExplainerModalProps> = ({
  isOpen,
  onClose,
  spread,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-4 h-4" />
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              알파벳 주식 클래스(GOOGL vs GOOG) 완벽 해설
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Pill */}
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-500/20 text-xs space-y-1">
          <div className="flex items-center justify-between font-mono font-bold">
            <span className="text-blue-700 dark:text-blue-300">현재 실시간 스프레드</span>
            <span className="text-blue-600 dark:text-blue-400">
              +{spread.percentSpread}% (${spread.dollarDiff})
            </span>
          </div>
          <p className="text-slate-600 dark:text-zinc-300 text-[11.5px]">
            {spread.verdictExplanation}
          </p>
        </div>

        {/* 3 Classes Breakdown */}
        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-50/30 dark:bg-blue-950/20 space-y-1">
            <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400">
              <Vote className="w-4 h-4" />
              <span>클래스 A (티커: GOOGL) - 의결권 1주당 1표</span>
            </div>
            <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
              2004년 상장 당시의 오리지널 주식입니다. 주주총회 투표권이 주어지며, 통상 무의결권 주식(GOOG)보다 1% ~ 2% 프리미엄을 받고 거래됩니다.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>클래스 C (티커: GOOG) - 무의결권 (0표)</span>
            </div>
            <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
              2014년 4월 주식 분할 당시 신설된 주식입니다. 창업자들의 지배력을 희석시키지 않고 직원 스톡옵션 및 기업 인수에 활용하기 위해 발행되었습니다. 의결권이 없는 대신 약간 저렴합니다.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-zinc-300">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>클래스 B (비상장) - 1주당 10표 (슈퍼 의결권)</span>
            </div>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
              공개 시장에서 거래되지 않으며 래리 페이지, 세르게이 브린 등 창업진과 극소수 초기 임원이 보유합니다. 이 주식으로 인해 두 창업자가 알파벳 의결권의 과반(51%+)을 영구 통제합니다.
            </p>
          </div>
        </div>

        {/* Investment & Arbitrage Strategy */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-purple-500" />
            <span>실전 투자 및 차익거래(Arbitrage) 룰북</span>
          </h4>
          <ul className="space-y-1.5 text-slate-600 dark:text-zinc-300 list-disc pl-4 leading-relaxed">
            <li>
              <strong>스프레드 1.0% 이하</strong>: GOOGL 매수 강력 추천. 의결권의 프리미엄이 거의 무료 수준이므로 본주를 매수하는 것이 유리합니다.
            </li>
            <li>
              <strong>스프레드 2.2% 이상</strong>: GOOG 매수 추천. 의결권 가치가 과도하게 평가되어 있으므로 배당과 기업 실적에만 관심 있는 개인 투자자는 GOOG를 싸게 사는 것이 유리합니다.
            </li>
            <li>
              <strong>배당금 및 주주가치</strong>: 두 주식 모두 주당 배당금($0.20/분기)과 자사주 매입 혜택을 100% 동일하게 수령합니다.
            </li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-xs"
        >
          확인 완료
        </button>
      </div>
    </div>
  );
};
