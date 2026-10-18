/**
 * Front-end script: turns cards over on click, tap or the flip button.
 *
 * Hover flipping is pure CSS. This script sets `d5fc_flip_card--flipped` (and `aria-pressed` on
 * the flip button) for the other triggers, and for taps on touch screens with the hover trigger.
 * One delegated listener serves every card, including ones added later.
 */

const CARD = ".d5fc_flip_card";

// Clicks on these inside a card keep their own meaning with the "Click anywhere" trigger.
const INTERACTIVE =
  'a, button, input, select, textarea, label, summary, [role="button"], [contenteditable]';

const canHover = window.matchMedia("(hover: hover)");

const setFlipped = (card: Element, flipped: boolean): void => {
  card.classList.toggle("d5fc_flip_card--flipped", flipped);
  card
    .querySelector(":scope > .d5fc_flip_card__toggle")
    ?.setAttribute("aria-pressed", String(flipped));
};

const toggle = (card: Element): void =>
  setFlipped(card, !card.classList.contains("d5fc_flip_card--flipped"));

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  // The innermost card, so a card nested in a face turns on its own.
  const card = target?.closest(CARD);

  if (!target || !card || card.classList.contains("d5fc_flip_card--builder")) {
    return;
  }

  const button = target.closest(".d5fc_flip_card__toggle");

  if (button && button.parentElement === card) {
    toggle(card);
    return;
  }

  const clickAnywhere =
    card.classList.contains("d5fc_flip_card--trigger-click") ||
    (card.classList.contains("d5fc_flip_card--trigger-hover") &&
      !canHover.matches);

  const interactive = target.closest(INTERACTIVE);

  if (clickAnywhere && !(interactive && card.contains(interactive))) {
    toggle(card);
  }
});

// "Show Flip Hint": wiggle the hint once, the first time a card is half in view.
if ("IntersectionObserver" in window) {
  const hintObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("d5fc_flip_card--hint-played");
          hintObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  document
    .querySelectorAll(`${CARD}.d5fc_flip_card--hint`)
    .forEach((card) => hintObserver.observe(card));
}
