# Aga · Public editorial preview V20

This folder powers the **direct browser URL**:
- English: https://gracianb.github.io/GracianB/aga-vista-previa/
- Polski: https://gracianb.github.io/GracianB/aga-vista-previa/pl/
- Español: https://gracianb.github.io/GracianB/aga-vista-previa/es/

## Public-content boundary
This is **not** Agnieszka's approved professional website. It is a public, independent editorial illustration based on sources already publicly available, and it explicitly identifies fictional operations scenarios as fictional. The original private repository and all draft CV PDFs are excluded.

Do not publish:
- CV drafts, embedded PDF data, or any files from `GracianB/Agnieszka-Piazzese/cv/`
- private contact details, credentials, employment dates, or quantified claims that Agnieszka has not verified
- fictional simulations framed as individual achievements
- an official endorsement or affiliation without consent

Noindex is merely an indexing preference: this directory is accessible to anyone who knows the URL.

## V20 capability release
This V20 milestone combines a set of improvements without claiming that intermediate V12–V19 were separately released:

1. **V12 · Narrative clarity:** public information explicitly separated from unsupported private data.
2. **V13 · Localization:** EN/PL/ES consistent and idiomatic, including Poland-first terminology.
3. **V14 · Executive navigation:** access to the Operations Control Tower from the navigation.
4. **V15 · Scenario console:** three fictional disruptions, each independently selectable.
5. **V16 · Sensitivity model:** delivery urgency, buffer resilience and document confidence yield distinct recommended responses.
6. **V17 · Access:** accessible slider labels, pressed states, 44px touch areas and keyboard controls.
7. **V18 · Layout:** mobile, tablet and desktop layouts at 320, 390, 768 and 1440px.
8. **V19 · Quality & trust:** automated privacy scans, mobile Chromium interactions, no PDF exposure.
9. **V20 · Release:** visual control-tower experience, scenario timeline, scroll progress and scenario continuity when switching languages.

**Technical caveat:** the Control Tower is a deterministic, rule-based **fictional triage exercise**. It is neither real predictive analytics nor evidence of actual performance. Scores are not measured business KPIs.

## Testing
- `node scripts/check-aga-public-preview.mjs`
- `node scripts/aga-public-preview-e2e.mjs` (Playwright)
- GitHub Actions: `GracianB Final Quality` + `Deploy GracianB to GitHub Pages`

Only after validation succeeds should the changes be merged to the public `main` branch.
