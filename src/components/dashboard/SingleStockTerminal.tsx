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
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('chart');
  const [activeAiQuestion, setActiveAiQuestion] = useState<string | undefined>(undefined);

  const currentStock = activeTicker === 'GOOGL' ? googl : goog;

  const TABS = [
    {
      id: 'chart' as const,
      label: '실시간 차트 & 테크니컬',
      shortLabel: '차트/기술적',
      icon: <BarChart3 className="w-4 h-4" />,
      badge: 'Live',
    },
    {
      id: 'ai_memo' as const,
      label: 'AI 기관 리서치 메모',
      shortLabel: 'AI 리포트',
      icon: <BrainCircuit className="w-4 h-4" />,
      badge: 'Gemma 4',
    },
    {
      id: 'segments' as const,
      label: '사업부문별 실적 기여도',
      shortLabel: '부문 실적',
      icon: <PieChart className="w-4 h-4" />,
      badge: '10-Q',
    },
    {
      id: 'peers' as const,
      label: '빅테크 5사 상대가치',
      shortLabel: '피어 비교',
      icon: <Users className="w-4 h-4" />,
      badge: 'Peer',
    },
    {
      id: 'moat' as const,
      label: '6대 핵심 사업부 해자',
      shortLabel: '사업부 해자',
      icon: <Layers className="w-4 h-4" />,
      badge: '6 Pillars',
    },
    {
      id: 'valuation' as const,
      label: '역DCF 밸류에이션 모델',
      shortLabel: '역DCF 모델',
      icon: <Calculator className="w-4 h-4" />,
      badge: '내재가치',
    },
  ];

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
        {/* Left Column (8 cols): Primary Tabbed Workspace */}
        <div className="lg:col-span-8 space-y-3.5">
          {/* Workspace Tab Switcher Ribbon */}
          <div className="p-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-sm flex items-center justify-between overflow-x-auto no-scrollbar gap-1">
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? `${profile.themeClasses.activeTab}`
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
          </div>

          {/* Active Tab Viewport */}
          <div className="transition-all duration-150">
            {activeTab === 'chart' && (
              <TradingViewSection
                theme={resolvedTheme}
                activeTicker={activeTicker}
                onTickerChange={onSelectTicker}
              />
            )}

            {activeTab === 'ai_memo' && (
              <LocalLlmSynthesizer
                googl={googl}
                goog={goog}
                externalQuestion={activeAiQuestion}
                onQuestionHandled={() => setActiveAiQuestion(undefined)}
              />
            )}

            {activeTab === 'segments' && (
              <SegmentMomentumTracker />
            )}

            {activeTab === 'peers' && (
              <PeerIntelligenceMatrix />
            )}

            {activeTab === 'moat' && (
              <AlphabetSixPillars />
            )}

            {activeTab === 'valuation' && (
              <ValuationCalculator googl={currentStock} />
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Quant Insight Dock */}
        <div className="lg:col-span-4 lg:sticky lg:top-4 space-y-4">
          <QuantInsightDock
            profile={profile}
            fundamentals={currentStock}
            onSelectAiQuestion={(q: string) => {
              setActiveAiQuestion(q);
              setActiveTab('ai_memo');
            }}
            onOpenTab={(tabId: WorkspaceTabId) => setActiveTab(tabId)}
          />
        </div>
      </div>
    </div>
  );
};
