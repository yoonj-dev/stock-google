import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { DualTickerHero } from './components/dashboard/DualTickerHero';
import { LocalLlmSynthesizer } from './components/dashboard/LocalLlmSynthesizer';
import { TradingViewSection } from './components/dashboard/TradingViewSection';
import { AlphabetSixPillars } from './components/dashboard/AlphabetSixPillars';
import { ValuationCalculator } from './components/dashboard/ValuationCalculator';
import { Footer } from './components/layout/Footer';
import { SpreadExplainerModal } from './components/modals/SpreadExplainerModal';
import { LlmSettingsModal } from './components/modals/LlmSettingsModal';
import { Theme, getInitialTheme, applyThemeToDom } from './lib/theme';
import { fetchStockData, calculateSpread } from './lib/stockApi';
import { MOCK_GOOGL_DATA, MOCK_GOOG_DATA } from './data/mockSnapshot';
import { StockFundamentals, SpreadAnalysis } from './types/stock';

export const App: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getInitialTheme);
  const [googl, setGoogl] = useState<StockFundamentals>(MOCK_GOOGL_DATA.fundamentals);
  const [goog, setGoog] = useState<StockFundamentals>(MOCK_GOOG_DATA.fundamentals);
  const [spread, setSpread] = useState<SpreadAnalysis>(() =>
    calculateSpread(MOCK_GOOGL_DATA.fundamentals, MOCK_GOOG_DATA.fundamentals)
  );

  const [activeChartTicker, setActiveChartTicker] = useState<'GOOGL' | 'GOOG'>('GOOGL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLlmModalOpen, setIsLlmModalOpen] = useState<boolean>(false);
  const [isSpreadModalOpen, setIsSpreadModalOpen] = useState<boolean>(false);

  // Sync theme to DOM on mount
  useEffect(() => {
    applyThemeToDom(currentTheme, true);
  }, [currentTheme]);

  // Load fresh stock data
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [googlData, googData] = await Promise.all([
        fetchStockData('GOOGL'),
        fetchStockData('GOOG'),
      ]);

      if (googlData?.fundamentals) setGoogl(googlData.fundamentals);
      if (googData?.fundamentals) setGoog(googData.fundamentals);

      const calculated = calculateSpread(
        googlData?.fundamentals || googl,
        googData?.fundamentals || goog
      );
      setSpread(calculated);
    } catch (err) {
      console.warn('[App] Failed to refresh live data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f7] dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 transition-colors">
      {/* 1. Standard Header with Context Menu */}
      <Header
        currentTheme={currentTheme}
        onThemeChanged={setCurrentTheme}
        googl={googl}
        goog={goog}
        spread={spread}
        isRefreshing={isRefreshing}
        onRefresh={loadData}
        onOpenLlmModal={() => setIsLlmModalOpen(true)}
        onOpenSpreadExplainer={() => setIsSpreadModalOpen(true)}
      />

      {/* 2. Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-5 sm:py-6 space-y-6">
        {/* Dual Hero: GOOGL (Class A) vs GOOG (Class C) + Spread Gauge */}
        <DualTickerHero
          googl={googl}
          goog={goog}
          spread={spread}
          onSelectTickerForChart={setActiveChartTicker}
          activeChartTicker={activeChartTicker}
          onOpenSpreadExplainer={() => setIsSpreadModalOpen(true)}
        />

        {/* Local LLM Synthesis Station (Real-time Local LLM 취합) */}
        <LocalLlmSynthesizer
          googl={googl}
          goog={goog}
          spread={spread}
          onOpenLlmModal={() => setIsLlmModalOpen(true)}
        />

        {/* TradingView Chart & Multi-Perspective Analysis Suite */}
        <TradingViewSection
          theme={currentTheme}
          activeTicker={activeChartTicker}
          onTickerChange={setActiveChartTicker}
        />

        {/* Alphabet 6-Pillars Intelligence Deck */}
        <AlphabetSixPillars />

        {/* Reverse DCF Valuation Calculator & Wall Street Targets */}
        <ValuationCalculator googl={googl} />
      </main>

      {/* 3. Global Footer */}
      <Footer />

      {/* Modals */}
      <SpreadExplainerModal
        isOpen={isSpreadModalOpen}
        onClose={() => setIsSpreadModalOpen(false)}
        spread={spread}
      />

      <LlmSettingsModal
        isOpen={isLlmModalOpen}
        onClose={() => setIsLlmModalOpen(false)}
        onSaved={loadData}
      />
    </div>
  );
};
