/**
 * I18n Manager
 * Handles language switching and translation
 */

import { translations } from '../data/i18n.js';

const LANG_KEY = 'gb-hub-lang';

class I18nManager {
  constructor() {
    this.lang = 'es';
    this.translations = translations;
  }

  static init() {
    const manager = new I18nManager();
    manager.restore();
    manager.apply();
    manager.setupListeners();
    return manager;
  }

  restore() {
    // Check localStorage
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored === 'en' || stored === 'es') {
        this.lang = stored;
      }
    } catch (_) {}

    // Check URL params
    const params = new URLSearchParams(location.search);
    if (params.get('lang') === 'en' || params.get('lang') === 'es') {
      this.lang = params.get('lang');
    }
  }

  apply() {
    const t = this.translations[this.lang] || this.translations.es;
    document.documentElement.lang = this.lang;
    document.documentElement.setAttribute('data-lang', this.lang);
    document.title = t.docTitle || document.title;

    // Update meta tags
    this.updateMeta('description', t.meta);
    this.updateMeta('og:title', t.ogTitle, 'property');
    this.updateMeta('og:description', t.ogDesc, 'property');
    this.updateMeta('og:locale', this.lang === 'en' ? 'en_US' : 'es_ES', 'property');

    // Update i18n elements
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = this.t(el.dataset.i18n);
      if (v) el.textContent = v;
    });

    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const v = this.t(el.dataset.i18nHtml);
      if (v) el.innerHTML = v;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const v = this.t(el.dataset.i18nPlaceholder);
      if (v) el.setAttribute('placeholder', v);
    });

    // Update lang buttons
    document.querySelectorAll('[data-set-lang]').forEach((btn) => {
      const isActive = btn.getAttribute('data-set-lang') === this.lang;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  setupListeners() {
    document.addEventListener('click', (e) => {
      const langBtn = e.target.closest('[data-set-lang]');
      if (langBtn) {
        e.preventDefault();
        this.setLang(langBtn.getAttribute('data-set-lang'));
      }
    });
  }

  setLang(next) {
    this.lang = next === 'en' ? 'en' : 'es';

    try {
      localStorage.setItem(LANG_KEY, this.lang);
    } catch (_) {}

    const url = new URL(location.href);
    url.searchParams.set('lang', this.lang);
    history.replaceState(null, '', url);

    this.apply();
  }

  t(key) {
    const t = this.translations[this.lang] || this.translations.es;
    return t[key] || null;
  }

  updateMeta(name, content, type = 'name') {
    const selector = type === 'property' ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    const meta = document.querySelector(selector);
    if (meta && content) {
      meta.setAttribute('content', content);
    }
  }
}

export { I18nManager };
