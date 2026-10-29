import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Sun,
  Moon,
  Beer,
  ExternalLink,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { Theme, applyThemeToDom } from '../../lib/theme';
import { formatCurrency, formatPercent } from '../../lib/stockApi';
import { StockFundamentals } from '../../types/stock';

interface HeaderProps {
  currentTheme: Theme;
  onThemeChanged: (theme: Theme) => void;
  googl: StockFundamentals;
  goog: StockFundamentals;
  activeTicker: 'GOOGL' | 'GOOG';
  onSelectTicker: (t: 'GOOGL' | 'GOOG') => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  onThemeChanged,
  googl,
  goog,
  activeTicker,
  onSelectTicker,
  isRefreshing,
  onRefresh,
}) => {
  // Rule 5: Responsive dropdown target separation to avoid dual mount collisions
  const [menuTarget, setMenuTarget] = useState<'mobile' | 'desktop' | null>(null);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuTarget === 'desktop' &&
        desktopMenuRef.current &&
        !desktopMenuRef.current.contains(target)
      ) {
        setMenuTarget(null);
      }
      if (
        menuTarget === 'mobile' &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target)
      ) {
        setMenuTarget(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuTarget]);

  // Ground Truth Toggle
  const handleToggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    const next: Theme = isDark ? 'light' : 'dark';
    onThemeChanged(next);
    applyThemeToDom(next);
  };

  const handleSelectThemeMode = (mode: Theme) => {
    onThemeChanged(mode);
    applyThemeToDom(mode);
    setMenuTarget(null);
  };

  // Rule 2: Open donate modal via BrandUI or fallback
  const handleOpenDonate = () => {
    setMenuTarget(null);
    if ((window as any).BrandUI?.openDonate) {
      (window as any).BrandUI.openDonate();
      return;
    }
    const beerBtn = document.getElementById('beer-btn');
    if (beerBtn) {
      beerBtn.click();
      return;
    }
    window.open('https://brand-ui.on-tap.xyz/donate', '_blank', 'noopener,noreferrer');
  };

  // Helper: Get active session price & tag for header ticker pill
  const getHeaderTickerMetrics = (stock: StockFundamentals) => {
    const state = (stock.marketState || '').toUpperCase();
    if (state.includes('PRE') && stock.preMarketPrice) {
      return {
        price: stock.preMarketPrice,
        changePercent: stock.preMarketChangePercent ?? stock.changePercent,
        tag: 'PRE',
      };
    }
    if (state.includes('POST') && stock.postMarketPrice) {
      return {
        price: stock.postMarketPrice,
        changePercent: stock.postMarketChangePercent ?? stock.changePercent,
        tag: 'POST',
      };
    }
    if (state.includes('OVERNIGHT') && (stock.postMarketPrice || stock.preMarketPrice)) {
      return {
        price: stock.postMarketPrice || stock.preMarketPrice!,
        changePercent: stock.postMarketChangePercent ?? stock.changePercent,
        tag: '24H',
      };
    }
    return {
      price: stock.regularMarketPrice ?? stock.currentPrice,
      changePercent: stock.regularMarketChangePercent ?? stock.changePercent,
      tag: null,
    };
  };

  const googlMetrics = getHeaderTickerMetrics(googl);
  const googMetrics = getHeaderTickerMetrics(goog);

  const renderThemePill = (mode: Theme, label: string, icon: React.ReactNode) => {
    const isSelected = currentTheme === mode;
    return (
      <button
        onClick={() => handleSelectThemeMode(mode)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
          isSelected
            ? 'bg-blue-600 text-white font-bold shadow-xs'
            : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
        }`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  const renderDropdownMenu = () => (
    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl z-50 p-2 text-xs divide-y divide-slate-100 dark:divide-zinc-800 animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Theme Selector */}
      <div className="p-2 space-y-1.5">
        <div className="text-[10px] font-semibold text-slate-400 dark:text-zinc-400 uppercase tracking-wider">
          테마 모드 설정
        </div>
        <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl">
          {renderThemePill('light', '라이트', <Sun className="w-3.5 h-3.5" />)}
          {renderThemePill('dark', '다크', <Moon className="w-3.5 h-3.5" />)}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 space-y-1">
        <button
          onClick={() => {
            setMenuTarget(null);
            onRefresh();
          }}
          disabled={isRefreshing}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left"
        >
          <span className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>실시간 시세 갱신</span>
          </span>
        </button>
      </div>

      {/* Mandatory Support & Ecosystem section per UI/UX Standard */}
      <div className="p-2 space-y-1">
        <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-zinc-400 uppercase tracking-wider">
          Support & Ecosystem
        </div>
        <a
          href={`https://stock.on-tap.xyz/?symbol=${activeTicker}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setMenuTarget(null)}
          className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 dark:text-blue-400 transition-colors font-medium"
        >
          <span className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span>📈 Stock on Tap (미국주식 퀀트)</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </a>
        <button
          onClick={handleOpenDonate}
          data-brand-open-donate="true"
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-700 dark:text-amber-400 transition-colors text-left font-medium"
        >
          <Beer className="w-4 h-4 text-amber-500" />
          <span>🍺 Buy me a beer (후원하기)</span>
        </button>
        <a
          href="https://dev.on-tap.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span>🚀 개발자 페이지 (On Tap)</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </a>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4285F4] via-[#EA4335] to-[#FBBC05] p-0.5 shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-[10px] flex items-center justify-center">
                <span className="text-base font-black bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] bg-clip-text text-transparent">
                  G
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Alphabet
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  ON TAP
                </span>
              </div>
              <p className="text-[10.5px] font-mono text-slate-400 dark:text-zinc-400 hidden sm:block">
                ALPHABET (GOOGL · GOOG) INVESTOR HUB
              </p>
            </div>
          </a>
        </div>

        {/* Center: Live Tickers Pill (Clickable Ticker Switch) */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100/80 dark:bg-zinc-900/80 p-1 rounded-xl border border-slate-200/60 dark:border-zinc-800 text-xs">
          {/* GOOGL */}
          <button
            onClick={() => onSelectTicker('GOOGL')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              activeTicker === 'GOOGL'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>GOOGL</span>
            {googlMetrics.tag && (
              <span className="text-[9.5px] px-1 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-mono font-bold">
                {googlMetrics.tag}
              </span>
            )}
            <span className="font-mono">{formatCurrency(googlMetrics.price)}</span>
            <span
              className={`font-mono text-[11px] font-semibold ${
                googlMetrics.changePercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatPercent(googlMetrics.changePercent)}
            </span>
          </button>

          {/* GOOG */}
          <button
            onClick={() => onSelectTicker('GOOG')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              activeTicker === 'GOOG'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>GOOG</span>
            {googMetrics.tag && (
              <span className="text-[9.5px] px-1 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-mono font-bold">
                {googMetrics.tag}
              </span>
            )}
            <span className="font-mono">{formatCurrency(googMetrics.price)}</span>
            <span
              className={`font-mono text-[11px] font-semibold ${
                googMetrics.changePercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatPercent(googMetrics.changePercent)}
            </span>
          </button>
        </div>

        {/* Right: Quick Actions & ⋯ Context Menu Button */}
        <div className="flex items-center gap-2">
          {/* Stock on Tap Header Link */}
          <a
            href={`https://stock.on-tap.xyz/?symbol=${activeTicker}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Stock on Tap 전체 주식 퀀트 플랫폼으로 이동"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/70 hover:bg-blue-100/80 dark:bg-blue-950/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold transition-all shrink-0 shadow-2xs"
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-[11.5px] sm:text-xs font-bold whitespace-nowrap">Stock on Tap</span>
            <ExternalLink className="w-3 h-3 opacity-60 hidden sm:inline shrink-0" />
          </a>

          {/* Quick Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="실시간 시세 갱신"
            className="p-2 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
          </button>

          {/* Theme Quick Toggle (Visible on larger screens) */}
          <button
            onClick={handleToggleTheme}
            title="라이트/다크 테마 토글"
            className="hidden sm:flex p-2 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {currentTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Rule 1: Mandatory ⋯ (3-dot) Context Menu button */}
          <div className="relative" ref={desktopMenuRef}>
            <button
              onClick={() => setMenuTarget(menuTarget === 'desktop' ? null : 'desktop')}
              data-brand-context-menu="true"
              title="더보기 메뉴"
              className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuTarget === 'desktop' && renderDropdownMenu()}
          </div>
        </div>
      </div>
    </header>
  );
};
