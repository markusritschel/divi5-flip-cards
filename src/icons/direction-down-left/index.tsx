import React, { ReactElement } from "react";

// Icon data: an arrow pointing down and left, for the "Down Left" direction.
export const name = "d5fc/direction-down-left";
export const viewBox = "0 0 16 16";
export const component = (): ReactElement => (
  <path d="M7 3 2 8l5 5V9.5h7v-3H7z" transform="rotate(-45 8 8)" />
);
