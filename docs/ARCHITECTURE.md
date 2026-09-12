# Architecture Guide

## Overview

GracianB is a modern, modular personal hub built with a component-based architecture.

## Directory Structure

```
src/
├── index.html              # Main HTML entry
├── styles/                 # CSS modules
│   ├── main.css           # Entry point
│   ├── variables.css      # Design tokens
│   ├── reset.css          # Browser reset
│   ├── typography.css     # Type scales
│   ├── layout.css         # Layout utilities
│   ├── components.css     # Component styles
│   ├── animations.css     # Keyframes
│   ├── responsive.css     # Media queries
│   ├── theme.css          # Theme-specific
│   └── accessibility.css  # A11y utilities
├── scripts/               # JavaScript modules
│   ├── main.js           # Entry & orchestration
│   ├── i18n-manager.js   # Language switching
│   ├── theme-manager.js  # Dark/light mode
│   ├── ui-manager.js     # UI interactions
│   ├── components/       # Reusable components
│   │   └── command-palette.js
│   └── utils/            # Utility functions
│       ├── scroll-reveal.js
│       └── pointer-effects.js
└── data/                 # Data files
    └── i18n.js          # Translations
```

## Module System

Each module is a self-contained ES6 class with:
- `static init()` - initialization method
- `setup()` - internal setup
- Public methods for interaction

## CSS Architecture

- **variables.css**: Design tokens (colors, typography, spacing)
- **reset.css**: Browser normalization
- **Component-specific**: Imported as needed
- **Responsive**: Mobile-first approach

## Build Process

1. **Development**: `npm run dev` → Vite dev server on :3000
2. **Production**: `npm run build` → Minified output in `/dist`
3. **Preview**: `npm run preview` → Local preview of build

## Performance

- Code splitting for i18n, theme, UI modules
- Lazy loading of components
- CSS variables for dynamic theming
- Minimal JavaScript footprint

## Testing

- Unit tests: `npm run test`
- UI tests: `npm run test:ui`
- Coverage: `npm run test:coverage`

## Linting & Formatting

- ESLint: `npm run lint`
- Prettier: `npm run format`
