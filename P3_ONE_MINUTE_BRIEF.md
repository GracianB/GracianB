# P3 · One-minute candidate brief

**18 October 2026.** P1 (seven phases) and P2 (three recruiter-evidence deliverables) are closed. This release changes only the application desk in the public `GracianB/GracianB` repo.

## Scope · three outcomes

1. **P3.1 One-minute overview.** Five distinct, bilingual summaries: Customer Success, RevOps, Data & Automation, Yoga and Cabin Crew. A choice updates exactly one summary without duplicating CV text or inventing outcomes, credentials, or data. The RevOps summary explicitly discloses that the project remains in development without a public demo; the Cabin Crew summary notes that previous ESATUR training is not a current attestation.
2. **P3.2 Original documents and A4 print.** Each role/language combination routes to the unchanged canonical PDF resume and cover letter, alongside a relevant real public case. A deliberate print button creates an A4-ready single-brief view excluding navigation and unrelated content. The printed sheet includes a reusable link to the selected application context. It is an additional introduction, **not a replacement resume or a new PDF asset stored in GitHub**.
3. **P3.3 Quality and resilience.** Static contracts and Chromium E2E verify five summary routes, two languages, two device sizes, preserved original PDFs, link correctness, no horizontal clipping, click-to-print, print-mode visibility, selected-role persistence and useful no-JavaScript fallback.

## Canonical document routing

| Path | Spanish resume / letter | English resume / letter |
| --- | --- | --- |
| Professional (all 3 focuses) | `Gracian_Baena_CV_2026_ES.pdf` / `Gracian_Baena_Carta_Presentacion_ES.pdf` | `Gracian_Baena_CV_2026_EN.pdf` / `Gracian_Baena_Cover_Letter_EN.pdf` |
| Yoga | `Gracian_Baena_CV_Yoga_ES.pdf` / `Gracian_Baena_Carta_Yoga_ES.pdf` | `Gracian_Baena_CV_Yoga_EN.pdf` / `Gracian_Baena_Cover_Letter_Yoga_EN.pdf` |
| Cabin Crew | `Gracian_Baena_CV_TCP_ES.pdf` / `Gracian_Baena_Carta_TCP_ES.pdf` | `Gracian_Baena_CV_TCP_EN.pdf` / `Gracian_Baena_Cover_Letter_TCP_EN.pdf` |

The evidence action points to the published Bodytone case, Professional Deck, Systems Lab, Yoga Instructor or Cabin Crew site as appropriate. No private Aigoritmo or unpublished RevOps demo is invented.

## Acceptance criteria

- All existing P1/P2 application and hub regression checks remain green.
- The five summaries work across ES/EN and desktop/mobile.
- Only the chosen summary is visible; both language CVs remain listed in the larger application desk.
- The A4 print mode contains only the summary, original-document links, contact link and share URL, not application controls or other unrelated content.
- Without JavaScript, the default Customer Success summary and working original-document links remain accessible; the inert print button is hidden.
- GitHub Actions, GitHub Pages and the *live* production smoke pass.

## Boundaries

Never touch the 12 PDFs, other repositories (Yoga Instructor, Project OHANA, Professional Deck, Systems Lab), local private projects, or unrelated job application data. No tracking, forms, external calls, PDF regeneration, fictitious outcomes or Lighthouse claims. P3 closes after verified production deployment.
