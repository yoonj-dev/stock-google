import React, { useState } from 'react';
import {
  BarChart3,
  BrainCircuit,
  Layers,
  Calculator,
  Users,
  PieChart,
} from 'lucide-react';
import { StockFundamentals, Candle } from '../../types/stock';
import { SingleStockProfile } from '../../types/stockConfig';
import { StockTickerRibbon } from './StockTickerRibbon';
import { QuantInsightDock } from './QuantInsightDock';
import { TradingViewSection } from './TradingViewSection';
import { LocalLlmSynthesizer } from './LocalLlmSynthesizer';
import { AlphabetSixPillars } from './AlphabetSixPillars';
import { ValuationCalculator } from './ValuationCalculator';
import { PeerIntelligenceMatrix } from './PeerIntelligenceMatrix';
import { SegmentMomentumTracker } from './SegmentMomentumTracker';

export type WorkspaceTabId = 'chart' | 'ai_memo' | 'segments' | 'peers' | 'moat' | 'valuation';

interface SingleStockTerminalProps {
  profile: SingleStockProfile;
  googl: StockFundamentals;
  goog: StockFundamentals;
  activeTicker: 'GOOGL' | 'GOOG';
  onSelectTicker: (ticker: 'GOOGL' | 'GOOG') => void;
  candles?: Candle[];
  resolvedTheme: 'dark' | 'light';
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export const SingleStockTerminal: React.FC<SingleStockTerminalProps> = ({
  profile,
  googl,
  goog,
  activeTicker,
  onSelectTicker,
  candles = [],
  resolvedTheme,
  isRefreshing = false,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('ai_memo');
  const [activeAiQuestion, setActiveAiQuestion] = useState<string | undefined>(undefined);

  const currentStock = activeTicker === 'GOOGL' ? googl : goog;

  const TABS = [
    {
      id: 'ai_memo' as const,
      domId: 'section-ai-memo',
      label: 'AI 기관 리서치 메모',
      shortLabel: 'AI 리포트',
      icon: <BrainCircuit className="w-4 h-4" />,
      badge: 'Gemma 4',
    },
    {
      id: 'segments' as const,
      domId: 'section-segments',
      label: '사업부문별 실적 기여도',
      shortLabel: '부문 실적',
      icon: <PieChart className="w-4 h-4" />,
      badge: '10-Q',
    },
    {
      id: 'peers' as const,
      domId: 'section-peers',
      label: '빅테크 5사 상대가치',
      shortLabel: '피어 비교',
      icon: <Users className="w-4 h-4" />,
      badge: 'Peer',
    },
    {
      id: 'moat' as const,
      domId: 'section-moat',
      label: '6대 핵심 사업부 해자',
      shortLabel: '사업부 해자',
      icon: <Layers className="w-4 h-4" />,
      badge: '6 Pillars',
    },
    {
      id: 'valuation' as const,
      domId: 'section-valuation',
      label: '역DCF 밸류에이션 모델',
      shortLabel: '역DCF 모델',
      icon: <Calculator className="w-4 h-4" />,
      badge: '내재가치',
    },
    {
      id: 'chart' as const,
      domId: 'section-chart',
      label: '실시간 차트 & 테크니컬',
      shortLabel: '차트/기술적',
      icon: <BarChart3 className="w-4 h-4" />,
      badge: 'Live',
    },
  ];

  const scrollToSection = (tabId: WorkspaceTabId, domId: string) => {
    setActiveTab(tabId);
    const el = document.getElementById(domId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Top High-Density Stock Ticker Ribbon */}
      <StockTickerRibbon
        profile={profile}
        googl={googl}
        goog={goog}
        activeTicker={activeTicker}
        onSelectTicker={onSelectTicker}
        candles={candles}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      {/* 2. Bento Interactive Terminal (12-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Left Column (8 cols): Continuous Full-Scroll Intelligence Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {/* Quick-Jump Navigation Ribbon (Sticky) */}
          <div className="sticky top-16 z-20 p-1.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200/90 dark:border-zinc-800 shadow-sm flex items-center justify-between overflow-x-auto no-scrollbar gap-1">
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => scrollToSection(tab.id, tab.domId)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? `${profile.themeClasses.activeTab} shadow-xs`
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    <span
                      className={`text-[9px] font-mono px-1 rounded ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 hidden md:inline px-2 font-medium">
              스크롤하여 전체 열람
            </span>
          </div>

          {/* Section 1: AI Institutional Research Memo */}
          <section id="section-ai-memo" className="scroll-mt-32 space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <BrainCircuit className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  AI 기관 퀀트 리서치 메모
                </h3>
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                Gemma 4 로컬 리서치 모델 합성
              </span>
            </div>
            <LocalLlmSynthesizer
              googl={googl}
              goog={goog}
              externalQuestion={activeAiQuestion}
              onQuestionHandled={() => setActiveAiQuestion(undefined)}
            />
          </section>

          {/* Section 2: Segment Momentum Tracker */}
          <section id="section-segments" className="scroll-mt-32 space-y-2">
            <div className="flex items-center justify-between px-1 pt-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <PieChart className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  사업부문별 실적 기여도 & 성장 모멘텀 (10-Q)
                </h3>
              </div>
              <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 font-mono">
                Google Search · Cloud · YouTube 실적 분석
              </span>
            </div>
            <SegmentMomentumTracker />
          </section>

          {/* Section 3: Peer Intelligence Matrix */}
          <section id="section-peers" className="scroll-mt-32 space-y-2">
            <div className="flex items-center justify-between px-1 pt-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                  <Users className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  빅테크 5사(Big Tech) 상대가치 비교 매트릭스
                </h3>
              </div>
              <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400 font-mono">
                P/E · P/S · OPM · 매출성장률 벤치마크
              </span>
            </div>
            <PeerIntelligenceMatrix />
          </section>

          {/* Section 4: 6 Pillars Moat */}
          <section id="section-moat" className="scroll-mt-32 space-y-2">
            <div className="flex items-center justify-between px-1 pt-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <Layers className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  알파벳 6대 핵심 비즈니스 엔진 및 해자
                </h3>
              </div>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                Search · Cloud · YouTube · Waymo · Android · Hardware
              </span>
            </div>
            <AlphabetSixPillars />
          </section>

          {/* Section 5: Reverse DCF Valuation */}
          <section id="section-valuation" className="scroll-mt-32 space-y-2">
            <div className="flex items-center justify-between px-1 pt-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                  <Calculator className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  역DCF(Reverse DCF) 내재가치 밸류에이션 모델
                </h3>
              </div>
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 font-mono">
                현재 주가에 내재된 시장 기대성장률 역산
              </span>
            </div>
            <ValuationCalculator googl={currentStock} />
          </section>

          {/* Section 6: Real-time TradingView Chart (Moved to Bottom) */}
          <section id="section-chart" className="scroll-mt-32 space-y-2">
            <div className="flex items-center justify-between px-1 pt-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <BarChart3 className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  실시간 인터랙티브 차트 & 기술적 분석
                </h3>
              </div>
              <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 font-mono">
                TradingView Interactive Feed
              </span>
            </div>
            <TradingViewSection
              theme={resolvedTheme}
              activeTicker={activeTicker}
              onTickerChange={onSelectTicker}
            />
          </section>
        </div>

        {/* Right Column (4 cols): Sticky Quant Insight Dock */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          <QuantInsightDock
            profile={profile}
            fundamentals={currentStock}
            onSelectAiQuestion={(q: string) => {
              setActiveAiQuestion(q);
              scrollToSection('ai_memo', 'section-ai-memo');
            }}
            onOpenTab={(tabId: WorkspaceTabId) => {
              const matched = TABS.find((t) => t.id === tabId);
              if (matched) scrollToSection(matched.id, matched.domId);
            }}
          />
        </div>
      </div>
    </div>
  );
};
