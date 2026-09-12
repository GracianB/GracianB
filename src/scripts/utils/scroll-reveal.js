/**
 * Scroll Reveal Utility
 * Reveals elements as they scroll into view
 */

class ScrollReveal {
  constructor() {
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  static init() {
    const sr = new ScrollReveal();
    sr.setup();
    return sr;
  }

  setup() {
    if (this.reduce || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    document
      .querySelectorAll('.mode, .stat, .cv-lane, .contact-panel, .hero-copy, .constellation')
      .forEach((el) => {
        el.classList.add('reveal');
        io.observe(el);
      });
  }
}

export { ScrollReveal };
