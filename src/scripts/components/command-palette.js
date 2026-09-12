/**
 * Command Palette Component
 * Provides keyboard-driven navigation
 */

class CommandPalette {
  constructor() {
    this.cmd = document.getElementById('cmd');
    this.cmdInput = document.getElementById('cmd-input');
    this.cmdList = document.getElementById('cmd-list');
    this.cmdIndex = 0;
    this.lastFocus = null;
  }

  static init() {
    const cp = new CommandPalette();
    cp.setup();
    return cp;
  }

  setup() {
    if (!this.cmd) return;

    document.querySelectorAll('[data-cmd-open]').forEach((el) => {
      el.addEventListener('click', () => this.open());
    });

    document.querySelector('[data-cmd-close]')?.addEventListener('click', () => this.close());

    this.cmdInput?.addEventListener('input', () => this.filter(this.cmdInput.value));

    document.addEventListener('keydown', (e) => this.handleKeydown(e));

    this.cmdList?.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
  }

  open() {
    if (!this.cmd) return;
    this.lastFocus = document.activeElement;
    this.cmd.hidden = false;
    this.cmdIndex = 0;
    if (this.cmdInput) this.cmdInput.value = '';
    this.filter('');
    this.paint();
    requestAnimationFrame(() => this.cmdInput?.focus());
  }

  close() {
    if (!this.cmd || this.cmd.hidden) return;
    this.cmd.hidden = true;
    if (this.lastFocus && typeof this.lastFocus.focus === 'function') {
      this.lastFocus.focus();
    }
  }

  filter(q) {
    const needle = q.trim().toLowerCase();
    this.cmdList?.querySelectorAll('li').forEach((li) => {
      const text = (li.textContent || '').toLowerCase();
      li.hidden = needle ? !text.includes(needle) : false;
    });
    this.cmdIndex = 0;
    this.paint();
  }

  paint() {
    const items = this.visibleCmds();
    items.forEach((li, i) => li.classList.toggle('is-active', i === this.cmdIndex));
    items[this.cmdIndex]?.scrollIntoView({ block: 'nearest' });
  }

  go() {
    const items = this.visibleCmds();
    const a = items[this.cmdIndex]?.querySelector('a');
    if (!a) return;

    this.close();
    const href = a.getAttribute('href');
    if (href?.startsWith('#')) {
      location.hash = href;
    } else {
      window.open(href, a.host === location.host ? '_self' : '_blank', 'noopener');
    }
  }

  visibleCmds() {
    return [...(this.cmdList?.querySelectorAll('li') || [])].filter((li) => !li.hidden);
  }

  handleKeydown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.cmd?.hidden ? this.open() : this.close();
      return;
    }

    if (e.key === 'Escape') {
      this.close();
      return;
    }

    if (this.cmd && !this.cmd.hidden) {
      const n = this.visibleCmds().length;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.cmdIndex = (this.cmdIndex + 1) % Math.max(n, 1);
        this.paint();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.cmdIndex = (this.cmdIndex - 1 + n) % Math.max(n, 1);
        this.paint();
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        this.go();
      }
    }
  }

  handlePointerDown(e) {
    const li = e.target.closest('li');
    if (!li || li.hidden) return;
    this.cmdIndex = this.visibleCmds().indexOf(li);
    this.paint();
  }
}

export { CommandPalette };
