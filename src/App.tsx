import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { AlphabetStockHero } from './components/dashboard/AlphabetStockHero';
import { LocalLlmSynthesizer } from './components/dashboard/LocalLlmSynthesizer';
import { TradingViewSection } from './components/dashboard/TradingViewSection';
import { AlphabetSixPillars } from './components/dashboard/AlphabetSixPillars';
import { ValuationCalculator } from './components/dashboard/ValuationCalculator';
import { Footer } from './components/layout/Footer';
import { Theme, getInitialTheme, applyThemeToDom } from './lib/theme';
import { fetchStockData } from './lib/stockApi';
import { MOCK_GOOGL_DATA, MOCK_GOOG_DATA } from './data/mockSnapshot';
import { StockFundamentals } from './types/stock';

export const App: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getInitialTheme);
  const [googl, setGoogl] = useState<StockFundamentals>(MOCK_GOOGL_DATA.fundamentals);
  const [goog, setGoog] = useState<StockFundamentals>(MOCK_GOOG_DATA.fundamentals);
  const [activeChartTicker, setActiveChartTicker] = useState<'GOOGL' | 'GOOG'>('GOOGL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

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
        activeTicker={activeChartTicker}
        onSelectTicker={setActiveChartTicker}
        isRefreshing={isRefreshing}
        onRefresh={loadData}
      />

      {/* 2. Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-5 sm:py-6 space-y-6">
        {/* Executive Alphabet Investor Hero (GOOGL / GOOG Ticker Switcher & Key Fundamentals) */}
        <AlphabetStockHero
          googl={googl}
          goog={goog}
          activeTicker={activeChartTicker}
          onSelectTicker={setActiveChartTicker}
        />

        {/* Local LLM Synthesis Station (Pre-compiled via PC Pipeline) */}
        <LocalLlmSynthesizer
          googl={googl}
          goog={goog}
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
    </div>
  );
};
