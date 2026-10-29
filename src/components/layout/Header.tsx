import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Beer,
  ExternalLink,
  Cpu,
  RefreshCw,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { Theme, toggleTheme } from '../../lib/theme';
import { formatCurrency, formatPercent } from '../../lib/stockApi';
import { StockFundamentals, SpreadAnalysis } from '../../types/stock';

interface HeaderProps {
  currentTheme: Theme;
  onThemeChanged: (theme: Theme) => void;
  googl: StockFundamentals;
  goog: StockFundamentals;
  spread: SpreadAnalysis;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenSpreadExplainer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  onThemeChanged,
  googl,
  goog,
  spread,
  isRefreshing,
  onRefresh,
  onOpenSpreadExplainer,
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

  const handleToggleTheme = () => {
    const next = toggleTheme();
    onThemeChanged(next);
  };

  const handleOpenDonate = () => {
    setMenuTarget(null);
    if (typeof window !== 'undefined') {
      const brandUi = (window as any).BrandUI;
      if (brandUi && typeof brandUi.openDonate === 'function') {
        brandUi.openDonate();
        return;
      }
      const beerBtn = document.getElementById('beer-btn');
      if (beerBtn) {
        beerBtn.click();
        return;
      }
      window.open('https://brand-ui.on-tap.xyz/donate', '_blank', 'noopener,noreferrer');
    }
  };

  const renderDropdownContent = () => (
    <div className="py-1 text-xs text-slate-700 dark:text-zinc-200 divide-y divide-slate-100 dark:divide-zinc-800">
      {/* App Quick Controls */}
      <div className="p-2 space-y-1">
        <button
          onClick={handleToggleTheme}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left"
        >
          <span className="flex items-center gap-2">
            {currentTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
            <span>테마 전환</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-400 uppercase">
            {currentTheme}
          </span>
        </button>

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

        <button
          onClick={() => {
            setMenuTarget(null);
            onOpenSpreadExplainer();
          }}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-500" />
            <span>Class A vs C 가이드</span>
          </span>
        </button>
      </div>

      {/* Mandatory Support & Ecosystem section per UI/UX Standard */}
      <div className="p-2 space-y-1">
        <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-zinc-400 uppercase tracking-wider">
          Support & Ecosystem
        </div>
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
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-blue-500" />
            <span>🚀 개발자 페이지 (On Tap)</span>
          </span>
        </a>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-[#09090b]/85 border-b border-slate-200 dark:border-zinc-800 transition-colors safe-top">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-15 flex items-center justify-between gap-2">
        {/* Left: Brand Identity with 4-Color Prism */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-zinc-900 border border-slate-200/50 dark:border-white/10 flex items-center justify-center shadow-sm relative overflow-hidden group-hover:scale-105 transition-transform">
              {/* Google 4-color micro ring */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#4285F4]/20 via-[#34A853]/20 to-[#EA4335]/20 opacity-80" />
              <img src="/favicon.svg" alt="Alphabet on Tap" className="w-6 h-6 relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  Alphabet
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  ON TAP
                </span>
              </div>
              <p className="text-[10.5px] font-mono text-slate-400 dark:text-zinc-400 hidden sm:block">
                GOOGL · GOOG DUAL INTELLIGENCE
              </p>
            </div>
          </a>
        </div>

        {/* Center: Live Dual Ticker Tickerbar */}
        <div className="hidden md:flex items-center gap-3 bg-slate-100/80 dark:bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-zinc-800 text-xs">
          {/* GOOGL */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 dark:text-zinc-100">GOOGL</span>
            <span className="font-mono text-slate-500 dark:text-zinc-400">
              {formatCurrency(googl.currentPrice)}
            </span>
            <span
              className={`font-mono text-[11px] font-semibold ${
                googl.changePercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatPercent(googl.changePercent)}
            </span>
          </div>

          <span className="text-slate-300 dark:text-zinc-700">|</span>

          {/* GOOG */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 dark:text-zinc-100">GOOG</span>
            <span className="font-mono text-slate-500 dark:text-zinc-400">
              {formatCurrency(goog.currentPrice)}
            </span>
            <span
              className={`font-mono text-[11px] font-semibold ${
                goog.changePercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatPercent(goog.changePercent)}
            </span>
          </div>

          <span className="text-slate-300 dark:text-zinc-700">|</span>

          {/* Spread */}
          <button
            onClick={onOpenSpreadExplainer}
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span>스프레드: </span>
            <span className="font-mono font-bold">+{spread.percentSpread}%</span>
            <span className="text-[10px] text-slate-400">(${spread.dollarDiff})</span>
          </button>
        </div>

        {/* Right: Quick Actions & ⋯ Context Menu Button */}
        <div className="flex items-center gap-2">
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

          {/* Desktop ⋯ Context Menu (Rule 1 & 5) */}
          <div className="relative hidden md:block" ref={desktopMenuRef}>
            <button
              data-brand-context-menu="true"
              onClick={() => setMenuTarget((prev) => (prev === 'desktop' ? null : 'desktop'))}
              title="더보기 메뉴"
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold transition-colors flex items-center gap-1"
            >
              <span className="text-sm font-mono tracking-widest">⋯</span>
            </button>
            {menuTarget === 'desktop' && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-slate-900/10 z-50 animate-in fade-in zoom-in-95 duration-100">
                {renderDropdownContent()}
              </div>
            )}
          </div>

          {/* Mobile ⋯ Menu Button (Rule 1 & 5) */}
          <div className="relative md:hidden" ref={mobileMenuRef}>
            <button
              data-brand-context-menu="true"
              onClick={() => setMenuTarget((prev) => (prev === 'mobile' ? null : 'mobile'))}
              title="메뉴"
              className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            {menuTarget === 'mobile' && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-slate-900/10 z-50 animate-in fade-in zoom-in-95 duration-100">
                {renderDropdownContent()}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
