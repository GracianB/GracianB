# GracianB · P1 final / 18 October 2026

**Scope:** the central GracianB portfolio and its in-repository application desk. Exactly **seven P1 milestones**. **No eighth P1 milestone is planned.**

## Seven milestones

| Phase | Delivered | GitHub evidence |
| --- | --- | --- |
| **P1.1** | Three bilingual editorial CV/cover-letter families (12 PDFs); Bologna-adaptation academic wording; public case routing and document identity | [PR #48](https://github.com/GracianB/GracianB/pull/48) |
| **P1.2** | Recruiter handoff from first viewport; direct Bodytone proof; keyboard and bilingual navigation | [PR #49](https://github.com/GracianB/GracianB/pull/49) |
| **P1.3** | Removed 63 unreachable CSS rules and a stale pointer listener; stylesheet source size decreased by 8.15% at that stage | [PR #50](https://github.com/GracianB/GracianB/pull/50) |
| **P1.4** | Consistent Professional → Yoga → Systems Lab universe order; ES/EN language-preserving return from application desk | [PR #51](https://github.com/GracianB/GracianB/pull/51) |
| **P1.5** | Legible footer, evidence tags and career dates, stronger keyboard focus and mobile spacing; actual Chromium measurements at 320, 768 and 1440 px in both themes | This final release PR |
| **P1.6** | Removed obsolete PDF-provenance copy; ES/EN CV and letter displayed first according to selected application language, while keeping both editions available | This final release PR |
| **P1.7** | Desktop/mobile and recruiter integration regression suite, 3 careers × 2 languages, visual layout guards and screenshot artifacts; final release contract | This final release PR |

## Career architecture

The site has exactly **three first-class universes**, with independent destinations:

1. [Professional Deck](https://gracianb.github.io/professional-deck/): experience, operations, systems, verifiable cases.
2. [Yoga Instructor](https://gracianb.github.io/yoga-instructor/): teaching, practice and guided studio.
3. [Systems Lab](https://gracianb.github.io/systems-lab/): software, experiments and engineering.

[Cabin Crew / TCP](https://gracianb.github.io/cabin-crew-site/) remains a **specialist career route**, not an artificial fourth universe. [Application desk](https://gracianb.github.io/GracianB/apply.html) presents three recruitment tracks: professional, Yoga and Cabin Crew.

## Evidence and documentation

All 12 published PDF paths must continue to return valid documents. The two Yoga CVs are the user's newer approved versions. The academic narrative reflects **three years of Diplomatura en Turismo in Murcia and a fourth Erasmus year in Bergamo adapting to the Bologna Tourism degree**, not an unrelated second course of study.

The Bodytone Support OS case is explicitly linked; the Aigoritmo repository remains private; RevOps is not presented as a publicly available production application; ESATUR Cabin Crew training is historical, not a current airline attestation. Never fabricate placement outcomes or replace dated evidence with unsupported claims.

## Acceptance gates

- Node/static contracts, HTML structure, existing approved paths and PDF signatures.
- Browser E2E: desktop, mobile 320/390, intermediate widths 768 and 1440, ES/EN navigation, reduced motion and themes.
- Application-specific E2E: all 3 tracks × 2 languages, both desktop/mobile, correct first-language document, no horizontal overflow.
- Production gates after merge: GitHub Pages deployment, live HTTP, evidence destinations, document routes and browser smoke.

**Measured**: CSS source reduction in P1.3; automated CSS font-size/layout/overflow checks in P1.5; route/doc existence. **Not measured**: Lighthouse performance scores, all phone cameras decoding PDF QR codes, hiring conversion or third-party portfolio visual quality. These must never be claimed as verified.

## Changes deliberately excluded

- Do not alter the repositories or currently in-progress work of **Yoga Instructor**, **Project OHANA**, **Professional Deck**, **Systems Lab** or any private app.
- Do not rewrite the approved 12 PDFs.
- Do not add a fourth universe, tracking scripts, subscriptions, self-playing audio/video or fake conversion statistics.

## Closure

P1 is closed once the final PR passes CI, is merged into `main`, GitHub Pages deploys, and the live production smoke succeeds. Any substantial new work should be proposed as a **separately scoped P2**, rather than extending P1 indefinitely.
