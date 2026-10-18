# Gracián Baena

**Customer Success Systems & Data Strategist**  
Murcia, Spain · Remote · Spanish / English / Italian

[Professional Hub](https://gracianb.github.io/GracianB/) · [Professional Deck](https://gracianb.github.io/professional-deck/) · [LinkedIn](https://www.linkedin.com/in/gracianbaena) · [Book 30 min](https://calendar.app.google/n99psBFktwYyoAWi9)

---

## P1 · final seven-phase release

P1 consists of **seven phases, from P1.1 through P1.7, with a fixed end**. The [P1 release record](./RELEASE_P1_FINAL.md) documents the deliverables, evidence, untouched external repositories and final validation gates. The last phase corrects the application desk's outdated PDF statements, prioritizes ES/EN resumes/letters according to the visitor's language, and adds viewport/theme browser audits; it does not edit the approved PDF documents.

---

## P2 · role-specific recruiter evidence

Following the seven closed P1 stages, P2 is a **three-part recruiter experience upgrade**, not more PDF redesign. The [P2 release record](./P2_RECRUITER_RELEASE.md) specifies role-specific evidence for Customer Success, RevOps and Data & Automation, shareable ES/EN URLs, explicit nonpublic-project disclosure and automated regression requirements. The linked resumes, cover letters and independent project repositories are not modified.

---

## P3 · One-minute role briefing

The [P3 acceptance record](./P3_ONE_MINUTE_BRIEF.md) defines a five-route bilingual 60-second candidate summary in the application desk. It dynamically selects the original CV, cover letter and public evidence, and offers a deliberately printable A4 summary while leaving all twelve PDF assets and external project repositories unchanged. It is not a replacement resume or a claimed improvement in hiring results.

---

## Professional identity · graphite and silver

The professional **ES/EN resumes and cover letters** were published after P3. Their new graphite/silver/ivory editorial design matches the [Professional Deck](https://gracianb.github.io/professional-deck/). The hub's professional-document preview and the application desk's light-mode recruiter brief now follow the same palette (`#151c22`, `#263039`, `#c8cccd`, `#f3eee5`). Yoga green and Cabin Crew navy are independent visual identities and must not be recolored by professional updates.

The 12 PDFs remain **unchanged** in this identity-only pass. Git's `.gitattributes` explicitly treats them as binary assets, preventing noisy line-level comparisons or automatic text merges. Desktop/mobile and theme-specific E2E checks guard the new preview without claiming a measured hiring conversion uplift.

---

## P5 · Language continuity and keyboard navigation

The ES/EN application desk and main hub now share the `gb-hub-lang` preference. A deep-linked application in Spanish or English sets the visitor's language and always uses an explicit `?lang=es` or `?lang=en` return URL. This prevents the previous edge case where a saved English hub could override Spanish chosen in applications.

The mobile navigation keeps Tab and Shift+Tab inside the open menu, while Escape still restores focus to the menu button. The quick navigation dialog excludes its decorative backdrop from keyboard and screen-reader focus. Existing keyboard, localized navigation and dark/light theme workflows retain browser E2E coverage.

This is a scoped accessibility and language-continuity fix: no PDF, project repository, personal claim or portfolio design is altered.

---

## P6 · Performance evidence, not invented speed claims

P6 introduces a repeatable Chromium resource audit (`scripts/performance-audit.mjs`) on **both the homepage and the application desk**, at 390px mobile and 1440px desktop. It records initial HTTP resource requests, browser-reported decoded/encoded and transferred bytes, first-contentful paint, DOMContentLoaded and load timings as JSON artifacts. It runs in preview and again against GitHub Pages after deployment. The budgets guard against unexpectedly adding heavy assets or third-party resources; **environment-specific milliseconds are reported, not asserted as universal page-speed scores or Core Web Vitals**.

The fixed scroll indicator now uses `scaleX()` on its own element, instead of updating a root CSS custom property on every scroll, reducing how widely style invalidation can propagate. The progress display is regression-tested in Chromium. The professional silver identity, Yoga/TCP colors, 12 approved PDF assets, and external project repositories are unchanged.

---

## P7 · A single dark visual system, based on Professional Deck V24

The default dark mode now draws from the **published Professional Deck** graphite and silver system. Both the portfolio and its ES/EN application desk share `deck-dark.css` as their **single dark-only color layer**: `#151c22` graphite, `#1d272e` deep surface, `#263039` raised panels, `#c8cccd` silver and `#f3eee5` restrained ivory. Ochre, brown and golden glows no longer color dark-mode chrome, navigation, recruiter briefs or buttons.

The tab/theme color, install manifest and favicon share the same graphite/silver identity. Existing thematic art for Yoga and Systems Lab stays recognizable. **Light mode and the print-only white A4 application brief stay unchanged.** New Chromium checks inspect effective CSS colors at 320/768/1440px on the hub and 390/1440px on applications, preserve browser screenshots and verify the white print mode. P6's resource budgets still apply: the shared stylesheet is deliberately under 12 KB, without external assets.

The 12 published PDF CVs and letters are not edited. Neither are the Professional Deck, Yoga Instructor, OHANA, Systems Lab or any other independent repositories. This release does not claim a speed or conversion uplift.

---

## The short version

I turn **customer and operational problems into systems people can use, measure and improve**.

My work sits across:

**Customer Success → Operations → Data → Systems → Automation / AI**

I did not start with code. I started with customers, teams and day-to-day operations. The technical layer came later because I wanted to solve those problems directly instead of stopping at recommendations.

**16+ years of professional experience** · customer-facing operations · B2B SaaS · pricing intelligence · analytics · automation · software systems.

> **Proof before claims.**  
> This GitHub exists to show working systems, inspectable decisions, tests, releases and public evidence.

---

## Public ecosystem health · approved public portfolios

In addition to the three intentional hub worlds, a separate, read-only
[ecosystem audit](https://github.com/GracianB/GracianB/actions/workflows/ecosystem-health.yml)
checks five approved public sites: GracianB, Professional Deck, Systems Lab,
Cabin Crew and Yoga Instructor. RevOps Studio and Aigoritmo are not promoted
as publicly accessible products. It validates each HTTP page, canonical URL,
page title, description, own-domain social metadata and the real 1200×630 PNG.
It also rejects links to unpublished code and checks that promoted GitHub
repositories are anonymously accessible.
Runs on release changes, manually and weekly. Does not access private
repositories, submit forms or add website tracking.

The three main universe cards remain unchanged; the additional specialist
portfolios are not turned into new universes.

## Final presentation polish · 2026 CV identity

The 3-world switch now behaves like a quiet editorial control, not a fixed-width carousel arrow or a solid gold tile. Its label never wraps, even on small phones; pressed and hover states keep the subtle CV-inspired surface, and keyboard users retain a visible focus ring. Compact-view cards remain separate worlds with their own styles. The OG PNG (1200×630) has been regenerated from the signed-off SVG palette, and social image URLs are cache-busted.

**Release scope:** This repo only. Yoga Instructor, Professional Deck and Systems Lab remain untouched by this final pass.

## V20 · Choose how to explore

The home page has an **optional "Ver los 3 / View all 3" control** next to the universe selector. The original carousel remains the default for new visitors, and a reader can switch between one-world and three-world overview without loading another page. The last choice is saved locally (no server, analytics, or tracking), and every world is navigable by keyboard and touch. At mobile widths, overview cards stack vertically; no new fourth universe is introduced.

## V19 · Editorial legibility

The CV-aligned visual identity has a second production pass: legible evidence labels and metadata, clearer document links and focus states, high-contrast preferences, and an explicit **ES / EN language control in the mobile navigation**. Both languages now update the theme button's accessible label. The three-world hero and the published CV assets remain intact.

## Visual identity

The **GracianB parent hub** follows the actual visual language of the 2026 Spanish/English CV: warm ink `#14140f`, parchment `#f7f5ef`, ochre `#daa428` and forest ink `#26332f`. Dark mode takes its cue from the CV header and light mode from the CV body. These are GracianB colors, not a borrowed palette from Yoga, Professional Deck or Systems Lab.

The three linked universes deliberately keep their existing colors **only inside their own cards and sites**.

## Three worlds

### P1 · First impression and recruiter route

The first viewport keeps the intentional three-world selector. A compact ES/EN recruiter route links directly to the existing application desk, while the proof line opens the public **Bodytone Support OS case** rather than asserting unspecified results. The facts strip highlights the highest independently managed Minderest account portfolio (**up to 80 international B2B SaaS customers**, as documented in the professional CV), explicitly scoped to Minderest, and keeps the language and remote context.

The universe selector now uses paired accessible `tab`/`tabpanel` relationships, a politely announced current-world counter and translated navigation labels. The mobile menu announces open/closed state in both languages. The linked Yoga Instructor, OHANA, Professional Deck and Systems Lab repositories remain unchanged by this GracianB-only pass.


The public hub opens with a choice of three universes. Each has its own color, emblem and purpose, while the journey behind them follows one common principle: understand people, build something useful and demonstrate the result.

| World | What is inside | Enter |
|---|---|---|
| **Professional** | Customer Success, Operations, Data, business cases and career evidence | [Professional Deck](https://gracianb.github.io/professional-deck/) |
| **Yoga** | Practice, breath, movement and teaching as a professional track in its own right | [Yoga Instructor](https://gracianb.github.io/yoga-instructor/) |
| **Systems Lab** | Games, agents, interfaces, WebGL and technical experiments that can be opened and tested | [Systems Lab](https://gracianb.github.io/systems-lab/) |

The site tells its story in a deliberate sequence: **who I am → what works → how I work → how I got here → where you can go next**. The later universe links are a closing choice after the evidence, not a second introductory screen.

The three worlds are different surfaces of the same working pattern:

**understand people → model complexity → build something usable → test what happens**

---

## Complementary path: Cabin Crew / TCP

The three core portfolio universes remain unchanged: Professional Deck, Systems Lab and Yoga Instructor. An additional personal career track is reachable from the hub's document area and quick navigation, not from a fourth hero carousel slide.

- [Cabin Crew / TCP, Spanish and English](https://gracianb.github.io/GracianB/cabin-crew.html)
- [Generic Spanish aviation cover letter (printable)](https://gracianb.github.io/GracianB/cabin-letter-es.html)
- [Generic English cabin crew cover letter (printable)](https://gracianb.github.io/GracianB/cabin-letter-en.html)

This application profile draws on verified personal experience: three-year Tourism diploma (Murcia) and a fourth-year Erasmus Bologna top-up to a Tourism bachelor's degree in Bergamo, international customer-facing roles in Spain/Italy/Portugal, native Spanish, advanced English and Italian, and previously completed TCP training at ESATUR with aircraft simulator practice. The page does not claim current crew employment, an active attestation or endorsement by an airline. The two documents are adaptable templates for applications. No airline logo or branding is used.

### Cabin Crew editorial V2 · Story, learning and atlas

The TCP path is now a complete, bilingual, structured personal account rather than a list of duties or a duplicate of the professional deck. It includes:

- **Four narrative chapters**: Tourism/Erasmus, retail and initial cabin training, international service and client operations, and the intentional return to aviation after building technical skills.
- **Seven dated learning milestones** preserved from Professional Deck: Murcia Tourism diploma (2011), Bergamo Tourism degree top-up (2012, fourth year through Erasmus / Bologna adaptation of the Spanish three-year Diplomatura), completed ESATUR Cabin Crew training (2015, simulator Mallorca, *not represented as an active attestation*), Madrid Yoga instructor certification (2019), Data Science/Coursera (2022), IT Automation/Google (2023), and AI Visualization/Columbia (2025). The latter three are described as complementary study, without claiming independently verified official certificates.
- **Interactive six-stop editorial atlas** aligned to the original Professional Deck: Murcia, Gran Canaria, Madrid, Lisbon, Bergamo and Warsaw. The two last-named connection-only stops are clearly distinguished from verified workplaces or schools. Coordinates and lines are conceptual, **not actual flight routes**.
- **Five-language board**: Spanish native, English and Italian C1 as previously stated in the CV, and basic Portuguese and French. The distinction between self-reported levels and official test certificates is explicit.
- **Accessible ES/EN controls**: language switching, keyboard-reachable city stops, prev/next navigation, credential category filters, descriptive labels and reduced-motion styling.
- The original **two generic print-ready application letters** remain unchanged and available.

The technical quality gate extends browser acceptance tests at 320, 390 and 1280 pixels, including switching city context and language and filtering credentials. The public hub's **three primary worlds remain exactly three**.

## Operating model

```text
People
  ↓
Operational context
  ↓
Data + signals
  ↓
Rules + system design
  ↓
Automation / AI where useful
  ↓
Human decision
  ↓
Measurable outcome
  ↓
Iteration
```

A useful system should make the next action clearer.

My default sequence is:

**understand → model → build → validate → activate → measure → iterate**

---

## Selected evidence

| System | What it demonstrates | Evidence |
|---|---|---|
| **Bodytone Support OS** | Customer Operations, Zendesk, knowledge, routing, automation, reporting | [Public Help Center](https://bodytonehelp.zendesk.com/hc/es) · [Professional case](https://gracianb.github.io/professional-deck/) |
| **RevOps Studio** | Data quality, scoring, forecasting and human approval | **En construcción · acceso público pendiente** |
| **Project OHANA** | Stateful software, fixed simulation, behavioural systems, regression, browser E2E, CI | [Play](https://gracianb.github.io/project-ohana/) · [Source](https://github.com/GracianB/project-ohana) |
| **VØRTICE** | TypeScript, WebGL, real-time interaction, adaptive rendering, accessibility, performance contracts | [Experience](https://vortex-gilt-xi.vercel.app/) · [Source](https://github.com/GracianB/vortex) |
| **Aigoritmo** | Four characters, local models, video, voice and conversation history | **Local app · [Systems Lab case](https://gracianb.github.io/systems-lab/#aigoritmo), no hosted chat** |

### Bodytone Support OS

A real Customer Operations ecosystem built around the support operation.

```text
Customer
  ↓
Request + context
  ↓
Knowledge / routing
  ↓
Workflow / automation
  ↓
Data
  ↓
Decision / follow-up
```

The point is not Zendesk itself. The point is the operating model around it: information, handoffs, rules, ownership and visibility.

### RevOps Studio

**Under construction. Not a public live product or accessible portfolio destination yet.** A deliberately inspectable decision system in development.

```text
Synthetic records
  ↓
Data-quality validation
  ↓
Deterministic scoring
  ↓
Classification
  ↓
Recommended action
  ↓
Human approval
  ↓
Decision Trace / audit
```

It is intentionally explicit about its limits. It does not pretend to be a live CRM integration when it is not.

### Project OHANA

A browser game used as a systems-engineering laboratory.

The interesting part is not only the game. It is the coordination of state, simulation, character behaviour, progression, save contracts, browser runtime and regression testing as the system grows.

### VØRTICE

A generative audiovisual WebGL experience.

The project has evolved from a visual experiment into an interactive instrument with curated movements, audio-reactive behaviour, adaptive rendering, mobile contracts, reduced-motion support, performance budgets and real browser E2E.

### Aigoritmo

Four peers share a local conversation space: **Llama** and **Qwen** for exploring ideas, **Arcana** and **Arcano** for symbolic readings. Each has its own video presence; the application combines voice and persistent conversation history.

The local configuration uses `llama3.2:3b` and `qwen2.5-coder:3b`, with Python and FastAPI serving the web UI. These are existing models, not models developed by this project.

[View the Systems Lab case](https://gracianb.github.io/systems-lab/#aigoritmo). This public showcase documents a local application; it does not provide a hosted chat or a public source entry point.

---

## Career progression

The progression matters because it explains why the repositories look the way they do.

| Stage | What I learned to see |
|---|---|
| **Retail / service / operations** | What actually happens when a process meets customers, teams and constraints |
| **Training / enablement** | How to capture knowledge, structure it and make other people perform independently |
| **Majorel · Google/YouTube environment** | Quality and consistency inside a large international operation |
| **Minderest · B2B SaaS Customer Success** | Adoption, engagement, support signals, pricing intelligence and customer diagnosis |
| **Bodytone · Customer Success / Data / Operations** | How customer work, analytics, process, knowledge and internal tools connect |
| **AI / data / software specialization** | How to build the system directly, test it and ship it |

That is the common thread behind the portfolio:

**people → operations → data → systems → AI**

---

## What I build

### Customer Success & Customer Operations
- Customer workflows and operating models
- Support architecture
- Knowledge, routing and ownership
- Adoption and process improvement
- Operational reporting
- Internal enablement and handoff

### Revenue & Decision Systems
- Account and pipeline signals
- Data-quality rules
- Scoring and classification
- Forecasting and segmentation
- Human-in-the-loop decisions
- Traceability and audit

### Data & Automation
- Power BI
- SQL
- Python
- Google Apps Script
- Data validation
- Workflow automation
- Reporting that leads to action

### AI & Software Systems
- GenAI applied to operations
- LLM workflows
- Local AI experimentation
- FastAPI
- JavaScript / TypeScript
- Canvas / WebGL
- Testing and CI
- Deterministic and inspectable rules

---

## Engineering principles

1. **Understand the operation before automating it.**
2. **Make data trustworthy before using it for decisions.**
3. **Separate standard workflows from exceptions.**
4. **Use AI where it improves the system, not because AI is fashionable.**
5. **Keep humans accountable for consequential decisions.**
6. **Test the contracts that matter.**
7. **Make the result inspectable.**
8. **Build for handoff, not dependency on the author.**
9. **Measure independent performance, not presentation quality.**
10. **Ship something people can actually use.**

---

## Where to go next

### Professional experience
Customer Success, Operations, Data and business cases in an interactive ES/EN portfolio.

**[Open Professional Deck](https://gracianb.github.io/professional-deck/)**

### Systems Lab
Games, agents, interfaces, WebGL and technical experiments with working public surfaces.

**[Open Systems Lab](https://gracianb.github.io/systems-lab/)**

### Human layer
Yoga instruction and practice as a complementary professional track.

**[Open Yoga Instructor](https://gracianb.github.io/yoga-instructor/)**

---

## Documents

The twelve canonical PDF documents are hosted at the central hub, with a separate [application selector (ES/EN)](https://gracianb.github.io/GracianB/apply.html). The source portfolio and Yoga Instructor sites are separate repositories and are not modified by this P1 release.

### Professional
- [CV 2026 · Español](./Gracian_Baena_CV_2026_ES.pdf)
- [CV 2026 · English](./Gracian_Baena_CV_2026_EN.pdf)
- [Carta de presentación · Español](./Gracian_Baena_Carta_Presentacion_ES.pdf)
- [Cover Letter · English](./Gracian_Baena_Cover_Letter_EN.pdf)

### Yoga
- [CV Yoga · Español](./Gracian_Baena_CV_Yoga_ES.pdf)
- [CV Yoga · English](./Gracian_Baena_CV_Yoga_EN.pdf)
- [Carta Yoga · Español](./Gracian_Baena_Carta_Yoga_ES.pdf)
- [Cover Yoga · English](./Gracian_Baena_Cover_Letter_Yoga_EN.pdf)

### Cabin Crew / TCP
- [CV TCP · Español](./Gracian_Baena_CV_TCP_ES.pdf)
- [Cabin Crew CV · English](./Gracian_Baena_CV_TCP_EN.pdf)
- [Carta TCP · Español](./Gracian_Baena_Carta_TCP_ES.pdf)
- [Cabin Crew cover letter · English](./Gracian_Baena_Cover_Letter_TCP_EN.pdf)
- [Dedicated aviation portfolio](https://gracianb.github.io/cabin-crew-site/)

**Academic clarification:** The Tourism qualification consists of the original three-year Diplomatura in Spain followed by a fourth Erasmus year in Bergamo, completed as an adaptation to the Grado under the Bologna Process. These are consecutive stages of one academic progression, not two unrelated degrees.

**Public PDF integrity:** After replacing the canonical PDFs, run `python scripts/check-cv-publication.py` and review `scripts/live-cv-pdfs.mjs` for the live TCP files. Test all public PDF destinations before distributing application links. Avoid promoting the private Aigoritmo code repository: its [public case](https://gracianb.github.io/systems-lab/#aigoritmo) is the correct destination.

---

## P1.3 · Leaner storefront, unchanged universes

The P1.3 audit identified 63 CSS rules exclusively targeting legacy artwork (`hero-system`, `hero-orbit`, orphaned signal/orbit subcomponents), none of which exists on this page or is created by its JavaScript. Those rules, an unused orbit keyframe and obsolete CSS pointer variables were removed, saving **7,233 characters (8.15%)** in the original stylesheet before transport compression. The corresponding global `pointermove` listener has also been removed because only deleted artwork consumed its CSS properties.

The main dictionary script now uses `defer` ahead of `main.js` to preserve dictionary initialization order without parser-blocking JavaScript. The redundant CSS preload is removed, leaving a single high-priority render-blocking stylesheet. Assets are cache-busted as `v23` to prevent stale client combinations.

**No content, style or interaction in the active three-world selector, Bodytone case, recruiter routes or published PDFs has been intentionally changed.** Static guards prohibit accidental reintroduction of dead components, and desktop/mobile/reduced-motion browser runs remain the quality gate. Savings refer to source characters, not a measured Lighthouse score or verified network byte improvement.

---

## P1.4 · Coherent universe paths and bilingual application handoff

The hero and the closing world navigation follow the same numbered order: **01 Professional Deck → 02 Yoga Instructor → 03 Systems Lab**. The final cards act as a concise editorial recap after the evidence and career narrative, instead of repeating the hero descriptions and oversized card heights. Each destination remains the existing public portfolio. No additional universe has been introduced.

Both main-hub entrances to the application desk preserve the active ES/EN language selection. The application desk, in turn, returns to the matching hub language through its brand, navigation and footer links. The base Spanish URLs remain readable without JavaScript. This is covered by static assertions and browser round-trips in desktop and mobile viewports.

The 12 published PDFs and the linked Yoga Instructor, OHANA, Professional Deck and Systems Lab repositories are unchanged.

---

## Release and presentation contract

- The cover belongs to **GracianB**: deep black and restrained copper in dark mode, porcelain white and graphite in light mode.
- **Professional Deck** carries silver, beige and its professional orbit symbol; **Yoga** carries botanical green and the lotus; **Systems Lab** carries cyan and the wand. World colors remain scoped to their own cards.
- The opening screen is the actual hero and three-world carousel. There is **no extra gateway or cinematic introduction** on this hub.
- RevOps Studio is **under construction**: no live or source-entry links are promoted as finished products.
- Public projects are labeled by what they actually demonstrate; avoid hardcoding release-version badges that grow stale.
- The ES/EN translations include project availability, carousel names and assistive labels. Both themes, mobile layouts, keyboard navigation and reduced-motion are release requirements.

---

## About this repository

This repository is both my **GitHub profile README** and the source for the public professional hub at:

**https://gracianb.github.io/GracianB/**

The hub is intentionally lightweight: semantic HTML, CSS and plain JavaScript. No framework is required for the page itself.

The final quality contract covers:

- ES / EN parity
- dark / light themes
- semantic structure
- keyboard-accessible navigation
- command palette
- reduced motion
- 320 px mobile layout
- no horizontal overflow
- JavaScript syntax
- static content contracts
- Chromium browser E2E
- canonical professional documents
- public evidence links
- no unsupported role, language or project claims

The goal is simple:

**A hiring manager should understand the profile in 30 seconds.  
A technical reviewer should find evidence in 60.  
Anyone should be able to choose Professional, Yoga or Systems Lab without hunting for the entrance.**

---

## Contact

[LinkedIn](https://www.linkedin.com/in/gracianbaena) · [Email](mailto:gracianbaenagonzalez@gmail.com) · [Book 30 min](https://calendar.app.google/n99psBFktwYyoAWi9)

**Gracián Baena · Murcia, Spain · 2026**
