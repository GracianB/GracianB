# GraciánB V8.0.0 · Final Three-World Hub Certificate

**Repository:** `GracianB/GracianB`  
**Release intent:** final stable professional identity hub  
**Date:** 2026-10-07

## Final concept

The hub has one identity and three explicit worlds:

1. **Professional** — Customer Success, Operations, Data and business evidence.
2. **Yoga** — practice, breath, movement and teaching.
3. **Systems Lab** — build, code, games, agents, interfaces, WebGL and technical experimentation.

The homepage must answer two questions immediately:

**Who is Gracián Baena?**  
**Which world do I want to enter?**

No visitor should need to infer where Systems Lab lives.

## Cover contract

- Full name visible immediately.
- Professional role and thesis visible without oversized text.
- Three-world selector appears in the first viewport on desktop and directly below identity on smaller screens.
- Each world has a visually distinct language:
  - Professional: customer/data/operations signal system.
  - Yoga: lotus and breathing rings.
  - Systems Lab: wand, sparks and technical orbits.
- Every active world exposes a large, obvious entry CTA.
- Previous / next controls, tabs, keyboard arrows and touch swipe work.
- Inactive slides are removed from keyboard navigation.
- All three worlds remain reachable without JavaScript.

## Clickability contract

Project actions are controls, not decorative micro-links.

- PLAY / LIVE / SYSTEM / EXPERIENCE / SOURCE actions use visible pill controls.
- The first action on each evidence card has stronger emphasis.
- Hover/focus states increase border and surface contrast.
- The lower ecosystem cards also link directly to Professional, Systems Lab and Yoga.

## Navigation contract

- Top navigation includes **Worlds**.
- Mobile navigation includes **Worlds**.
- Command palette includes Systems Lab directly.
- Systems Lab canonical public URL: https://gracianb.github.io/systems-lab/

## Document language contract

The document area is neutral portfolio documentation.

Allowed framing:
- **Documentación profesional**
- CV and cover-letter descriptions by context

Rejected framing:
- “ready to send”
- “listos para enviar”
- application-process language

## Quality contract

V8 inherits the V7 engineering contract and adds:

- exactly three world slides
- canonical links for Professional / Yoga / Systems Lab
- world selector keyboard navigation
- world selector visible CTAs
- 320 px carousel fit
- no clipping or horizontal overflow
- no JavaScript errors
- reduced-motion compatibility
- ES / EN world-copy parity
- no-JS fallback links

## Closure rule

V8 is closed when:

1. the final PR is merged;
2. `main` static and Chromium gates are green;
3. GitHub Pages serves the merged V8 assets;
4. production HTTP + browser smoke are green.

After that point, changes are factual maintenance only. No V9 redesign because a button looked at us strangely.
