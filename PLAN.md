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

Run on 2026-10-18 against Divi 5.15.1 (Docker WordPress, headless Chromium). Fixed along the way:
autoloader fatal, ~28px gutter margin on the front face in block-layout columns, default face
look lost to Divi's CSS reset, module icon clipped in the picker.

- [x] The plugin activates without PHP errors or notices.
- [x] "Flip Card" appears in the module picker, with its icon.
- [x] Inserting a Flip Card creates two faces labelled "Front" and "Back".
- [ ] A face accepts any module: Text, Image, Button, Blurb, Group, a nested row.
  All of them render inside a face (builder and live page), and a module's "+" inside a face
  offers every module. **Open:** an empty face has no "+" of its own, so a new card's faces can't
  get their first module from the canvas (Divi only draws that button for its own structural
  modules; its Accordion Items have the same gap). Drag and drop is untested.
- [x] A Flip Card only accepts Faces, and a Face can't be added outside a Flip Card.
  (Checked through the "+" buttons and the module picker; drag and drop untested.)
- [x] Content > Flip > *Show in Builder: Back* shows the back face in the builder.
- [x] *Flip Direction* (left/right/up/down) changes the flip on the live page.
- [x] *Flip Duration* changes the speed (the page CSS contains `--d5fc-duration`).
- [x] On the live page, hovering flips the card, and the card is as tall as the taller face.
- [x] Per-face design settings work: background, padding, border, rounded corners, shadow, layout.
- [x] A third face is hidden on the live page and has a red dashed outline in the builder.
- [x] Several cards in a Group with grid layout line up correctly.
- [x] Saving, reloading and editing the page again keeps all settings.

### Assumptions to confirm while testing

- [x] In both the builder and on the live page, the faces are **direct children** of
  `.d5fc_flip_card__inner`. The CSS relies on this (`> .d5fc_flip_card_face:nth-child(1 of ...)`).
- [x] The face's default layout (Divi's flex default) arranges child modules sensibly: they stack
  in a column.
- [x] `divi/range` with `allowedUnits: ["ms"]` stores values like `600ms` (saved as `"900ms"`).
- [x] `StyleDeclarations` accepts the custom property name `--d5fc-duration`.

## Known limitations of milestone 1

- Hover only; on touch devices it depends on the browser's tap-to-hover behaviour (fixed in milestone 3).
- Links on the back face can't be reached by keyboard (fixed in milestone 3).
- A Flip Card nested inside another card's face also flips when the outer card is hovered.
- An empty face has no "+" button in the builder, so the first module has to get into it some
  other way (see the checklist).
- In the builder, empty faces are only as tall as their padding: Divi's builder CSS
  (`.et_pb_module { min-height: 10px }`) outranks the default 200px minimum height. The live page
  is not affected.
