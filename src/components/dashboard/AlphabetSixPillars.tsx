import React, { useState } from 'react';
import {
  Compass,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { ALPHABET_PILLARS } from '../../data/alphabetPillars';
import { BusinessPillar } from '../../types/stock';

export const AlphabetSixPillars: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('search-services');

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="fintech-card p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              알파벳 6대 비즈니스 기둥 (Business Pillars)
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              검색, 클라우드, 유튜브, Waymo, 자체 반도체(TPU) 및 주주환원 해자 분석
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 self-start sm:self-auto">
          포트폴리오 다각화 지수: <span className="text-blue-600 dark:text-blue-400 font-bold">최우수 (AAA)</span>
        </div>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALPHABET_PILLARS.map((pillar) => {
          const isExpanded = expandedId === pillar.id;

          return (
            <div
              key={pillar.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                isExpanded
                  ? 'border-blue-500/40 dark:border-blue-500/40 bg-white dark:bg-zinc-900 shadow-md ring-1 ring-blue-500/20'
                  : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${pillar.dotColor}`} />
                    <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider">
                      {pillar.category}
                    </span>
                  </div>
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {pillar.badge}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    {pillar.subtitle}
                  </p>
                </div>

                {/* Micro Highlights */}
                <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 text-center">
                  {pillar.highlights.map((h, i) => (
                    <div key={i}>
                      <div className="text-[9.5px] text-slate-400 dark:text-zinc-400 truncate">
                        {h.label}
                      </div>
                      <div className="text-xs font-extrabold font-mono text-slate-800 dark:text-zinc-100">
                        {h.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Text */}
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {pillar.summary}
                </p>

                {/* Expanded Section: Catalysts & Risks */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150">
                    {/* Catalysts */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>핵심 성장 촉매 (Catalysts)</span>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-zinc-300 pl-4 list-disc marker:text-emerald-500">
                        {pillar.catalysts.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Risks */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>점검 리스크 요인 (Risks)</span>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-zinc-300 pl-4 list-disc marker:text-rose-500">
                        {pillar.risks.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Expand Toggle */}
              <button
                onClick={() => toggleExpand(pillar.id)}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 flex items-center justify-center gap-1 transition-colors"
              >
                <span>{isExpanded ? '간략히 접기' : '촉매 및 리스크 자세히 보기'}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
