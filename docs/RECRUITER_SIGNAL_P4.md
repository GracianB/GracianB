# P4 · Recruiter signal (10 November 2026)

## Goal

Keep the constellation and three universes intact, but make the primary professional value legible without requiring a recruiter to discover the document archive.

## Changes

- A 60-second, bilingual ES/EN evidence strip directly below the three worlds.
- A small shortcut at the existing recruiter pathway, with a real anchor and native navigation.
- Three honest proof routes: a published Bodytone case, Professional Deck and Systems Lab.
- Canonical professional CV / cover-letter route via `apply.html`.
- High-contrast light and dark surfaces, 320px reflow, keyboard focus, reduced-motion support.
- No new runtime JavaScript, cookies, third-party fonts, metrics or speculative claims.
- Static tests now assert the actual README artwork `docs/profile-showcase.svg` instead of the obsolete `docs/portfolio-banner.svg`.

## Verification

- `node scripts/static-contract.mjs`: main page structure, internal anchors, bilingual keys and existing canonical PDFs.
- `node scripts/browser-smoke.mjs`: visible three-card evidence panel across languages and viewport sizes, functional CV route.
- `GracianB Final Quality` in GitHub Actions: static job first, Chromium only after the static gate passes.

## Deliberate boundaries

Public portfolio evidence is not measured business impact. The role route does not claim unpublished apps are live services, publish private CVs, or change the twelve canonical PDFs.
