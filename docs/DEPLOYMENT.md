# Deployment Guide

## GitHub Pages

This project is deployed to GitHub Pages via GitHub Actions.

### Build Process

1. Push to `main` branch
2. GitHub Actions runs build workflow
3. Output deployed to `gh-pages` branch
4. Site available at `https://gracianb.github.io/GracianB/`

### Local Build

```bash
npm run build
```

Output in `/dist`

### Preview Build

```bash
npm run preview
```

Serves built files locally for testing.

### Environment

- Node.js 18+
- No external dependencies

## Monitoring

- Lighthouse CI for performance
- Pa11y for accessibility
- ESLint for code quality
