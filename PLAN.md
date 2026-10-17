# Divi 5 Flip Cards: plan

## Decisions

| Topic | Decision |
|---|---|
| Platform | Divi 5 only (native Divi 5 module API, no Divi 4 support). Developed against Divi 5.15. |
| Structure | **Flip Card** module (`d5fc/flip-card`) with exactly two **Face** child modules (`d5fc/flip-card-face`). |
| Face content | Each face holds **any** Divi module, like Divi's Group module (`childrenName: []`). Front and back hold different modules. |
| Front/back | A new card comes with a "Front" and a "Back" face. The first face is the front, the second the back. Further faces are hidden on the live page and marked with a red dashed outline in the builder. |
| Height | The card is always as tall as the taller face (both faces share one CSS grid cell). |
| Grid of cards | No dedicated grid module for now. Put cards in a Divi Group/row with grid or flex layout. Can be revisited. |
| Trigger | A setting: *Hover*, *Click anywhere* (clicks on links/buttons inside still work), *Flip button*. Hover falls back to tap on touch devices. |
| Effects | User-selectable. Flip first; then fade, slide, zoom and possibly cube. |
| Directions | Left, right, up, down first; diagonal later. |
| Design | Every face has its own full design settings (background, spacing, border, shadow, layout, ...). |
| Accessibility | Keyboard flipping, correct ARIA states, hidden face not focusable, `prefers-reduced-motion` gives a cross-fade. |
| Naming | "Divi 5 Flip Cards", slug/text domain `divi5-flip-cards`, prefix `d5fc`, GPL-2.0-or-later. |
| Distribution | For now the author and one client; public distribution later. |
| Development | Code that doesn't need Divi can be written anywhere; everything else is tested locally in **LocalWP** with Divi 5.15 (see `docs/local-development.md`). |

## Milestones

1. **Scaffold + core** (done, *not yet tested in Divi*)
   - Plugin bootstrap, build setup adapted from Elegant Themes' official example, release ZIP, CI.
   - Flip Card + Face modules, faces hold any modules, height fits the taller face.
   - 3D flip on hover in four directions, adjustable duration.
   - "Show in Builder: Front/Back" setting, hover flipping turned off in the builder.
   - Reduced motion: cross-fade instead of rotation.
2. **Verify in Divi 5.15** (next, locally): run the checklist below and fix what breaks.
3. **Triggers**: hover / click anywhere / flip button, touch fallback, keyboard (Enter/Space), ARIA, small front-end script.
4. **Effects and timing**: flip, fade, slide, zoom, cube; easing, delay, perspective; diagonal directions.
5. **Builder usability**: polish the front/back switch, warnings for extra faces, sensible defaults and presets.
6. **Release**: translations (PHP and JS), readme, versioning, tested ZIP for the client site.

## Milestone 1 verification checklist (Divi 5.15, LocalWP)

Nothing below could be checked without Divi. Test with `WP_DEBUG` and `WP_DEBUG_LOG` on.

- [ ] The plugin activates without PHP errors or notices.
- [ ] "Flip Card" appears in the module picker, with its icon.
- [ ] Inserting a Flip Card creates two faces labelled "Front" and "Back".
- [ ] A face accepts any module: Text, Image, Button, Blurb, Group, a nested row.
- [ ] A Flip Card only accepts Faces, and a Face can't be added outside a Flip Card.
- [ ] Content > Flip > *Show in Builder: Back* shows the back face in the builder.
- [ ] *Flip Direction* (left/right/up/down) changes the flip on the live page.
- [ ] *Flip Duration* changes the speed (the page CSS contains `--d5fc-duration`).
- [ ] On the live page, hovering flips the card, and the card is as tall as the taller face.
- [ ] Per-face design settings work: background, padding, border, rounded corners, shadow, layout.
- [ ] A third face is hidden on the live page and has a red dashed outline in the builder.
- [ ] Several cards in a Group with grid layout line up correctly.
- [ ] Saving, reloading and editing the page again keeps all settings.

### Assumptions to confirm while testing

- In both the builder and on the live page, the faces are **direct children** of
  `.d5fc_flip_card__inner`. The CSS relies on this (`> .d5fc_flip_card_face:nth-child(1 of ...)`).
  Check with the browser dev tools. If the builder adds a wrapper, the selectors need adjusting.
- The face's default layout (Divi's flex default) arranges child modules sensibly. If they line up
  side by side, set a better default (column direction).
- `divi/range` with `allowedUnits: ["ms"]` stores values like `600ms`.
- `StyleDeclarations` accepts the custom property name `--d5fc-duration`.

## Known limitations of milestone 1

- Hover only; on touch devices it depends on the browser's tap-to-hover behaviour (fixed in milestone 3).
- Links on the back face can't be reached by keyboard (fixed in milestone 3).
- A Flip Card nested inside another card's face also flips when the outer card is hovered.
