/**
 * Main entry point
 * Orchestrates all modules
 */

import { I18nManager } from './i18n-manager.js';
import { ThemeManager } from './theme-manager.js';
import { UIManager } from './ui-manager.js';
import { CommandPalette } from './components/command-palette.js';
import { ScrollReveal } from './utils/scroll-reveal.js';
import { PointerEffects } from './utils/pointer-effects.js';

// Initialize managers
const i18n = I18nManager.init();
const theme = ThemeManager.init();
const ui = UIManager.init();

// Initialize components
CommandPalette.init();
ScrollReveal.init();
PointerEffects.init();

// Update year in footer
const year = document.getElementById('year');
if (year) {
  year.textContent = String(new Date().getFullYear());
}

// Expose to window for debugging (dev only)
if (process.env.NODE_ENV === 'development') {
  window.__GRACIANB__ = { i18n, theme, ui };
}

export { i18n, theme, ui };
