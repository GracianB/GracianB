/**
 * Theme Manager
 * Handles light/dark theme switching
 */

const THEME_KEY = 'gb-hub-theme';

class ThemeManager {
  constructor() {
    this.theme = 'dark';
  }

  static init() {
    const manager = new ThemeManager();
    manager.restore();
    manager.apply();
    manager.setupListeners();
    return manager;
  }

  restore() {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark') {
        this.theme = stored;
      }
    } catch (_) {}

    const params = new URLSearchParams(location.search);
    if (params.get('theme') === 'light' || params.get('theme') === 'dark') {
      this.theme = params.get('theme');
    }
  }

  apply() {
    document.documentElement.setAttribute('data-theme', this.theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', this.theme === 'light' ? '#f3f0e7' : '#06070a');
    }

    document.querySelectorAll('[data-set-theme]').forEach((btn) => {
      const isActive = btn.getAttribute('data-set-theme') === this.theme;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  setupListeners() {
    document.addEventListener('click', (e) => {
      const themeBtn = e.target.closest('[data-set-theme]');
      if (themeBtn) {
        e.preventDefault();
        this.setTheme(themeBtn.getAttribute('data-set-theme'));
      }
    });
  }

  setTheme(next) {
    this.theme = next === 'light' ? 'light' : 'dark';

    try {
      localStorage.setItem(THEME_KEY, this.theme);
    } catch (_) {}

    const url = new URL(location.href);
    url.searchParams.set('theme', this.theme);
    history.replaceState(null, '', url);

    this.apply();
  }
}

export { ThemeManager };
