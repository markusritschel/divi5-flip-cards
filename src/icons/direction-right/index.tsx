import React, { ReactElement } from 'react';

// Icon data: an arrow pointing right, for the "Right" direction.
export const name      = 'd5fc/direction-right';
export const viewBox   = '0 0 16 16';
export const component = (): ReactElement => (
  <path d="m9 3 5 5-5 5V9.5H2v-3h7z" />
);
