/**
 * Pointer Effects Utility
 * Handles interactive pointer effects
 */

class PointerEffects {
  constructor() {
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  static init() {
    const pe = new PointerEffects();
    pe.setup();
    return pe;
  }

  setup() {
    if (this.reduce) return;

    // Orb movement
    const fx = document.querySelector('.fx');
    if (fx) {
      window.addEventListener(
        'pointermove',
        (e) => {
          const x = (e.clientX / window.innerWidth - 0.5) * 24;
          const y = (e.clientY / window.innerHeight - 0.5) * 16;
          fx.style.setProperty('--mx', x.toFixed(1) + 'px');
          fx.style.setProperty('--my', y.toFixed(1) + 'px');
        },
        { passive: true }
      );
    }

    // Constellation parallax
    const stage = document.querySelector('.hero-stage');
    const field = document.querySelector('.constellation');
    if (stage && field && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      stage.addEventListener('pointermove', (e) => {
        const r = stage.getBoundingClientRect();
        const px = e.clientX - r.left / r.width - 0.5;
        const py = e.clientY - r.top / r.height - 0.5;
        field.style.setProperty('--cx', (px * 14).toFixed(1) + 'px');
        field.style.setProperty('--cy', (py * 10).toFixed(1) + 'px');
      });

      stage.addEventListener('pointerleave', () => {
        field.style.setProperty('--cx', '0px');
        field.style.setProperty('--cy', '0px');
      });
    }
  }
}

export { PointerEffects };
