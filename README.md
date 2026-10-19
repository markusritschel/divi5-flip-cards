# Flip Cards for Divi 5

A flip card module for **Divi 5**. Each card has a front and a back, and each side can hold **any Divi modules**:
text, images, buttons, groups, nested rows and more. The card is always as tall as its taller side.

> **Status:** 0.4.1, in development and tested against Divi 5.15.1 (browser test suite in
> [`e2e/`](e2e)). See [`PLAN.md`](PLAN.md) for the roadmap.

## Features

- **Flip Card** module with a **Front** and a **Back** face; each face holds any Divi modules and has
  its own design settings.
- **Triggers:** hover (tap on touch screens), click anywhere, or a flip button. Click and button
  cards turn back on a second click, with Escape and/or when the pointer leaves.
- **Effects:** 3D flip, slide-in, fade, zoom or cube turn, in four straight and four diagonal
  directions, with duration, speed curve, delay and perspective settings. With the slide, the front
  stays visible behind the back face, so a see-through background with a backdrop blur
  (Design > Filters) gives a frosted-glass look; the back face covers the whole card unless its
  Design > Sizing says otherwise.
- **Accessible:** every card has a real flip button for keyboard users, `aria-pressed`, hidden faces
  stay out of the tab order, and reduced motion gives a cross-fade.
- **Flip button design:** corner, icon, optional text, background and text colors (the flip hint
  follows the same design).
- **Optional flip hint:** a small icon that wiggles once when the card scrolls into view.
- **Builder:** both faces stacked for editing, or the real card with a Front/Back switch; "+" and an
  Elements list for filling faces; tiles for trigger, effect and direction with a live preview.
- **Ready-made cards** in the Divi Library ("Add From Library"): Icon + Text, Bold Statement,
  Feature List, Call to Action.

Planned: translations.

## Updates

Installed from a release ZIP, the plugin checks this repository's GitHub releases and offers
updates under **Plugins**, like any other plugin.

## Requirements

- WordPress 6.5+, PHP 7.4+
- Divi 5 (developed against 5.15)

## Installation

Download the plugin ZIP from the latest **Build** run under GitHub Actions (unzip the artifact once), then upload it
under **Plugins > Add New > Upload Plugin**. To build it yourself, see below.

## Development

```bash
npm install
npm start          # rebuild on change
npm run build      # production build
npm run zip        # dist/divi5-flip-cards-<version>.zip
```

Local setup with LocalWP and Divi: [`docs/local-development.md`](docs/local-development.md).
Code structure and conventions: [`CLAUDE.md`](CLAUDE.md).

## License

GPL-2.0-or-later. See [`LICENSE`](LICENSE).
