import React, { ReactElement } from 'react';

// Icon data: an arrow pointing up, for the "Up" direction.
export const name      = 'd5fc/direction-up';
export const viewBox   = '0 0 16 16';
export const component = (): ReactElement => (
  <path d="m3 7 5-5 5 5H9.5v7h-3V7z" />
);
