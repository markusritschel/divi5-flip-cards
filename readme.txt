=== Flip Cards for Divi 5 ===
Contributors: markusritschel
Tags: divi, divi 5, flip card, flip box
Requires at least: 6.5
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 0.4.1
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A flip card module for Divi 5. Put any Divi modules on the front and the back.

== Description ==

Adds a **Flip Card** module to the Divi 5 Visual Builder. A card has two faces, Front and Back,
and each face can hold any Divi modules: text, images, buttons, groups and so on. The card is
always as tall as its taller face.

Requires Divi 5.

== Changelog ==

= 0.4.1 =
* Fix: a Flip Card saved as a Component now shows up in the builder's Components list and under "Convert to Component".
* Cards that turn on a click or tap show the pointer cursor (this also helps taps reach the card on iPhones).

= 0.4.0 =
* New effects: Fade, Zoom and Cube.
* Diagonal directions (Up Left, Up Right, Down Left, Down Right); Cube flips on diagonals.
* Speed Curve, Delay and Perspective settings next to Duration.
* Slide: while the back face covers the front completely, the front's links are out of the tab order.

= 0.3.1 =
* Slide: the back face's own Design > Filters > Backdrop Blur works now; the extra Backdrop Blur slider is gone.
* Slide: the back face's size comes from its own Design > Sizing (it sits at the edge it slides in from); the Back Face Size option is gone.
* The flip hint takes the Flip Button design (colors, icon, corner).

= 0.3.0 =
* Slide: the front face stays visible, so a see-through back face lets it show through; optional backdrop blur.
* Slide: back face size (full, as far as its content needs, or a fixed size).
* Flip button: pick its icon (Divi and Font Awesome icons).
* Updates from GitHub releases show up under Plugins.
* Fix: after a transition preview, the builder kept the "Show in Builder" view.

= 0.2.0 =
* Triggers: hover (tap on touch screens), click anywhere or flip button; choose how a flipped card returns (second click, Escape, pointer leaving).
* Slide effect, chosen from tiles like Divi's animation styles, with a preview in the builder.
* Accessible flip button on every card; optional flip hint; flip button design options.
* Builder: stacked view of both faces, Front/Back switch, "+" and Elements list for empty faces, at most two faces.
* Four ready-made cards in the Divi Library.
* The modules switch off with an admin warning if Divi lacks a class they need.
* Renamed to "Flip Cards for Divi 5".

= 0.1.0 =
* First development version: Flip Card and Face modules, flip on hover in four directions, adjustable duration.
