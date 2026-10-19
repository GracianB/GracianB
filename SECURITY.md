# Security Policy

## Supported version
The published V1 on the `main` branch is the supported version. Old branches, proof-of-concept code and linked external projects are not included in this policy.

## Report privately
For a potential vulnerability, use GitHub's **Report a vulnerability** feature under the repository Security tab if enabled. Otherwise contact the repository owner privately using the contact information published on the portfolio or GitHub profile. Do not disclose live vulnerabilities or personal data in public issues.

Include the affected URL/commit, impact, safe reproduction steps and recommended fix. Never send passwords, access tokens or full copies of personal documents.

## Trust boundaries
This is a static GitHub Pages site: no backend, authentication, database or intentional secret storage. Browser localStorage keeps only display preferences (theme and language). External links and their services belong to their respective operators.

Do not commit credentials, API keys, session cookies, private identity documents or sensitive personal information. The 12 application PDFs are intentionally public; review every revision before upload. Avoid third-party scripts and untrusted remote assets. Keep workflow permissions minimal and review pull requests before merging.

## Maintenance
Review GitHub Actions results, link health, asset-size budgets, external dependencies and browser regressions before deploying. Configure branch rules, Dependabot/security alerts and secret scanning in repository Settings if available to the account; this file alone does not enable those features.
