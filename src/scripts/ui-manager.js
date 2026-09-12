/**
 * UI Manager
 * Handles general UI interactions
 */

class UIManager {
  constructor() {
    this.drawer = document.getElementById('drawer');
    this.menuBtn = document.querySelector('[data-menu-toggle]');
    this.menuOpen = false;
  }

  static init() {
    const manager = new UIManager();
    manager.setupDrawer();
    return manager;
  }

  setupDrawer() {
    if (!this.drawer || !this.menuBtn) return;

    this.menuBtn.addEventListener('click', () => this.toggleMenu());

    this.drawer.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    if (this.menuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.menuOpen = true;
    this.drawer.hidden = false;
    this.drawer.classList.add('is-open');
    this.menuBtn.classList.add('is-open');
    this.menuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-on');

    const first = this.drawer.querySelector('a');
    requestAnimationFrame(() => first?.focus());
  }

  closeMenu() {
    this.menuOpen = false;
    this.drawer.hidden = true;
    this.drawer.classList.remove('is-open');
    this.menuBtn.classList.remove('is-open');
    this.menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-on');
    this.menuBtn.focus();
  }
}

export { UIManager };
