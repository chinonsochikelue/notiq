# Changelog

## 1.1.0

### Added
- **CSS Layers & Scoping**: All Notiq styles are now wrapped in `@layer notiq` and scoped to `.notiq-root` class
  - Prevents global CSS pollution (`:root`, `.dark`, `*`, `select`, etc.)
  - Eliminates conflicts with host applications (Fumadocs, Docusaurus, etc.)
  - Editor component automatically wraps content with `.notiq-root` div
- Added `lint:css` script to enforce CSS layering in future development

### Changed
- CSS variables moved from global `:root` to scoped `.notiq-root`
- Dark mode styles moved from global `.dark` to scoped `.dark .notiq-root`
- All component selectors now prefixed with `.notiq-root`
