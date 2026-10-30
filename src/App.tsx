import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { SingleStockTerminal } from './components/dashboard/SingleStockTerminal';
import { Footer } from './components/layout/Footer';
import { Theme, getInitialTheme, applyThemeToDom, resolveTheme } from './lib/theme';
import { fetchStockData } from './lib/stockApi';
import { MOCK_GOOGL_DATA, MOCK_GOOG_DATA } from './data/mockSnapshot';
import { StockData } from './types/stock';
import { GOOGLE_PROFILE } from './lib/profiles/googleProfile';

export const App: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getInitialTheme);
  const [googlData, setGooglData] = useState<StockData>(MOCK_GOOGL_DATA);
  const [googData, setGoogData] = useState<StockData>(MOCK_GOOG_DATA);
  const [activeChartTicker, setActiveChartTicker] = useState<'GOOGL' | 'GOOG'>('GOOGL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const googl = googlData.fundamentals;
  const goog = googData.fundamentals;

  // Sync theme to DOM on mount
  useEffect(() => {
    applyThemeToDom(currentTheme, true);
  }, [currentTheme]);

  // Load fresh stock data
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [gData, cData] = await Promise.all([
        fetchStockData('GOOGL'),
        fetchStockData('GOOG'),
      ]);

      if (gData?.fundamentals) setGooglData(gData);
      if (cData?.fundamentals) setGoogData(cData);
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

  const activeCandles = activeChartTicker === 'GOOGL'
    ? googlData.candles?.['1d_intraday']
    : googData.candles?.['1d_intraday'];

  const resolvedTheme = resolveTheme(currentTheme);

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

      {/* 2. Bento Interactive Terminal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5">
        <SingleStockTerminal
          profile={GOOGLE_PROFILE}
          googl={googl}
          goog={goog}
          activeTicker={activeChartTicker}
          onSelectTicker={setActiveChartTicker}
          candles={activeCandles}
          resolvedTheme={resolvedTheme}
          isRefreshing={isRefreshing}
          onRefresh={loadData}
        />
      </main>

      {/* 3. Global Footer */}
      <Footer />
    </div>
  );
};
