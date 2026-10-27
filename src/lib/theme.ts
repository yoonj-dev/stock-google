/**
 * Dark & Light Theme Engineering Standard Helper (`theme-mode-standard`)
 * - Dual DOM Sync (<html> + <body>)
 * - Single Source of Truth from DOM classList
 * - Synchronizes 'theme', 'stock_theme', and 'alpha_theme' for workspace consistency
 */

export type Theme = 'dark' | 'light';

export const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem('theme') || localStorage.getItem('stock_theme') || localStorage.getItem('alpha_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'dark';
  }
};

export const applyThemeToDom = (theme: Theme, persist = true) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;
  const isDark = theme === 'dark';

  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
    root.setAttribute('data-theme', 'dark');
    if (body) {
      body.classList.add('dark');
      body.classList.remove('light');
      body.setAttribute('data-theme', 'dark');
    }
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
    root.setAttribute('data-theme', 'light');
    if (body) {
      body.classList.remove('dark');
      body.classList.add('light');
      body.setAttribute('data-theme', 'light');
    }
  }

  // Mobile address bar theme color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', isDark ? '#09090b' : '#f4f5f7');
  }

  if (persist && typeof window !== 'undefined') {
    try {
      localStorage.setItem('theme', theme);
      localStorage.setItem('stock_theme', theme);
      localStorage.setItem('alpha_theme', theme);
    } catch {
      // Ignore private browsing storage quota exceptions
    }
  }
};

/**
 * Toggle theme using actual DOM classList as the Single Source of Truth
 */
export const toggleTheme = (): Theme => {
  if (typeof document === 'undefined') return 'dark';
  const isDomDark = document.documentElement.classList.contains('dark') ||
    document.documentElement.getAttribute('data-theme') === 'dark';

  const nextTheme: Theme = isDomDark ? 'light' : 'dark';
  applyThemeToDom(nextTheme, true);
  return nextTheme;
};
