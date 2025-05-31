# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit-based admin dashboard application with modern design principles, comprehensive testing, and a component-driven development approach.

## Tech Stack

- **Framework**: SvelteKit 2.16.0 with Svelte 5.0.0
- **Styling**: Tailwind CSS 4.1.7 + DaisyUI 5.0.35
- **Language**: TypeScript 5.0.0
- **Testing**: Vitest (unit), Playwright (e2e), Storybook (component)
- **Package Manager**: pnpm (fallback to npm)

## Essential Commands

```bash
# Development
npm run dev              # Start dev server (port 5173)
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run all tests (unit + e2e)
npm run test:unit        # Run unit tests only
npm run test:e2e         # Run e2e tests only

# Code Quality
npm run lint             # Run prettier check + eslint
npm run format           # Format code with prettier
npm run check            # Type check with svelte-check

# Storybook
npm run storybook        # Start Storybook dev server
npm run build-storybook  # Build Storybook
```

## Architecture

### Routing Structure
- File-based routing in `src/routes/`
- Layout components: `+layout.svelte`
- Page components: `+page.svelte`
- Load functions: `+page.js` or `+page.server.js`

### Component Organization
- **Reusable components**: `src/lib/components/`
- **Route-specific components**: Alongside route files
- **Storybook stories**: `src/stories/`
- **Component tests**: Co-located `.test.ts` files

### State Management
- Svelte stores in `src/lib/stores/`
- Route-specific stores alongside routes (e.g., `chatStore.js`)

### Testing Strategy
1. **Unit tests**: Vitest + Testing Library, co-located with components
2. **E2E tests**: Playwright tests in `e2e/` directory
3. **Component docs**: Storybook stories for visual testing

### Styling Approach
- Utility-first CSS with Tailwind
- DaisyUI component classes
- Global styles in `src/app.css`
- Component-specific CSS modules when needed

## Key Design Principles

The project follows 2025 admin dashboard design trends:
- **Minimalist UI**: Clean interfaces with effective whitespace
- **Mobile-first**: Responsive design for all screen sizes
- **Microinteractions**: Subtle animations for user feedback
- **AI-powered insights**: Interactive data visualization
- **Accessibility**: WCAG 2.1 AA compliance

## Development Notes

- The project uses Vite for fast HMR and builds
- TypeScript strict mode is enabled
- ESLint 9 flat config is used
- Prettier handles all formatting
- Test files should use `.test.ts` extension
- E2E tests target the preview server by default