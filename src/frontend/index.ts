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

// Slide: the front stays visible under the back face. Where the back face covers it completely,
// the front becomes inert (no focus, no clicks), so keyboard users don't tab into hidden links. A
// smaller back face leaves the visible part of the front usable.
const updateCoveredFront = (card: Element, flipped: boolean): void => {
  const [front, back] = card.querySelectorAll<HTMLElement>(
    ":scope > .d5fc_flip_card__inner > .d5fc_flip_card_face",
  );

  if (!front || !back) {
    return;
  }

  // Layout sizes, unaffected by the slide transform.
  const covered =
    back.offsetWidth >= front.offsetWidth &&
    back.offsetHeight >= front.offsetHeight;

  front.toggleAttribute(
    "inert",
    flipped && card.classList.contains("d5fc_flip_card--slide") && covered,
  );
};

const setFlipped = (card: Element, flipped: boolean): void => {
  card.classList.toggle("d5fc_flip_card--flipped", flipped);
  card
    .querySelector(":scope > .d5fc_flip_card__toggle")
    ?.setAttribute("aria-pressed", String(flipped));
  updateCoveredFront(card, flipped);
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

// Cube, up and down: the faces turn around an axis half the card's height behind them. CSS has no
// unit for that, so the height is measured into `--d5fc-depth-y` (module.scss).
if ("ResizeObserver" in window) {
  const depthObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      (entry.target as HTMLElement).style.setProperty(
        "--d5fc-depth-y",
        `${entry.contentRect.height / 2}px`,
      );
    });
  });

  document
    .querySelectorAll(`${CARD}.d5fc_flip_card--cube > .d5fc_flip_card__inner`)
    .forEach((inner) => depthObserver.observe(inner));
}

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
