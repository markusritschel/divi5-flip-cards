import React, { ReactElement } from 'react';

// Icon data: an arrow pointing down, for the "Down" direction.
export const name      = 'd5fc/direction-down';
export const viewBox   = '0 0 16 16';
export const component = (): ReactElement => (
  <path d="m3 9 5 5 5-5H9.5V2h-3v7z" />
);
