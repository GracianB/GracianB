# P2 · Recruiter evidence routes

**Date:** 18 October 2026
**Scope:** only the public `GracianB/GracianB` repository, specifically the professional route inside `apply.html`. P1's seven milestones remain closed.

## Why P2 exists

P1 published the portfolio's three universes and the 12 PDF resumes/letters and completed the ES/EN application journey. A professional application still showed identical evidence whether the recipient was screening Customer Success, Revenue Operations or a data/automation role. That made the recruiter work harder to find pertinent public proof.

P2 adds **three narrowly defined deliverables**:

1. **P2.1 Role-fit evidence:** three professional focus choices: Customer Success, RevOps, Data & Automation. The resume and cover letter remain identical; only a bilingual evidence brief and relevant public links change. RevOps Studio is explicitly *not* represented as a public demo.
2. **P2.2 Shareable context:** URL `apply.html?track=professional&lang=en&focus=revops` opens with the correct language, track and evidence. Selection updates the URL without page reload; users can copy the URL using a direct click. Invalid focus values safely default to Customer Success. There are no accounts, analytics, external JS, tracking or data submission. Without JS, the default Bodytone case remains visible while inert controls are hidden.
3. **P2.3 Evidence-driven QA:** static and Chromium E2E coverage for all 3 focuses × both languages × desktop/mobile, role-only content, accessible pressed states, correctness of document links, copy-link feedback, invalid URL handling and no-JavaScript fallback. Retain all P1 public-link and PDF quality gates.

## Public evidence and limitations

| Professional focus | Public primary evidence | Secondary proof | Disclosure |
|---|---|---|---|
| Customer Success | [Bodytone Support OS case](https://gracianb.github.io/professional-deck/proyecto-bodytone.html) | [Bodytone Help Center](https://bodytonehelp.zendesk.com/hc/es) | The Help Center and case are public; this is not a published metric audit |
| RevOps | [Professional Deck](https://gracianb.github.io/professional-deck/) | [Systems Lab](https://gracianb.github.io/systems-lab/) | RevOps Studio is in development; there is no public demo claimed |
| Data & Automation | [Bodytone Support OS case](https://gracianb.github.io/professional-deck/proyecto-bodytone.html) | [Systems Lab](https://gracianb.github.io/systems-lab/) | Private/local apps are not advertised as live public products |

No credential, employment metric, degree, company claim or CV text is changed as part of this release. The 12 PDF assets are byte-for-byte untouched. The three university/world entrances and Cabin Crew/Yoga application paths remain intact.

## Acceptance and closure

- Static Node contracts and PDF/route signatures remain green.
- Chromium application test passes both languages, all three professional focuses, two viewport sizes, no overflow, safe unknown focus, copy result and JS-disabled fallback.
- Existing site-level desktop/mobile/reduced-motion and live-production tests remain green.
- Merge via review PR only after CI passes. Verify GitHub Pages and production smoke before declaring P2 completed.

**No measured increase in recruiter engagement or hiring outcomes is claimed.** P2 ends after this release. Larger features require separate justification, rather than expanding P2 indefinitely.
