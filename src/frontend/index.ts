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

const isFlipped = (card: Element): boolean =>
  card.classList.contains("d5fc_flip_card--flipped");

// A click turns the card over; turning it back is up to "Flip Back on Second Click".
const toggle = (card: Element): void => {
  if (!isFlipped(card)) {
    setFlipped(card, true);
  } else if (card.classList.contains("d5fc_flip_card--back-click")) {
    setFlipped(card, false);
  }
};

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
    // Taps on hover cards always turn back and forth; the "flip back" options are for clicks.
    if (card.classList.contains("d5fc_flip_card--trigger-hover")) {
      setFlipped(card, !isFlipped(card));
    } else {
      toggle(card);
    }
  }
});

// "Flip Back with Escape". Focus on the (now hidden) back face moves to the card's flip button.
document.addEventListener("keydown", (event) => {
  if ("Escape" !== event.key) {
    return;
  }

  document
    .querySelectorAll(`${CARD}.d5fc_flip_card--flipped.d5fc_flip_card--back-escape`)
    .forEach((card) => {
      const hadFocus = card.contains(document.activeElement);
      setFlipped(card, false);

      if (hadFocus) {
        card.querySelector<HTMLElement>(":scope > .d5fc_flip_card__toggle")?.focus();
      }
    });
});

// "Flip Back When the Pointer Leaves".
document.addEventListener("mouseout", (event) => {
  const card = event.target instanceof Element ? event.target.closest(CARD) : null;
  const to = event.relatedTarget instanceof Node ? event.relatedTarget : null;

  if (
    card &&
    isFlipped(card) &&
    card.classList.contains("d5fc_flip_card--back-leave") &&
    !(to && card.contains(to))
  ) {
    setFlipped(card, false);
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
