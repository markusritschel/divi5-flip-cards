# Flip Cards for Divi 5

A flip card module for **Divi 5**. Each card has a front and a back, and each side can hold **any Divi modules**:
text, images, buttons, groups, nested rows and more. The card is always as tall as its taller side.

> **Status:** early development (milestone 1). The module builds and packages, but has not been
> tested in Divi yet. See [`PLAN.md`](PLAN.md) for the roadmap and the test checklist.

## Features (so far)

- **Flip Card** module with a **Front** and a **Back** face.
- Each face holds any Divi modules and has its own design settings.
- 3D flip on hover: left, right, up or down, with adjustable duration.
- *Show in Builder: Front/Back* to edit the back side in the Visual Builder.
- Cross-fade instead of rotation for visitors who prefer reduced motion.

Planned: click/tap and flip-button triggers, keyboard support, more effects (fade, slide, zoom, cube), easing and delay settings.

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
