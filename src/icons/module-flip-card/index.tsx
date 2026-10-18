import React, { ReactElement } from 'react';

// Icon data. Drawn on a 16x16 grid: the module picker and the layers panel render module icons
// with a fixed `viewBox="0 0 16 16"` and ignore the icon's own viewBox.
export const name      = 'd5fc/module-flip-card';
export const viewBox   = '0 0 16 16';
export const component = (): ReactElement => (
  <path d="M2 5.333h7.333v9.334H2zM3.333 6.667v6.666h4.667V6.667zM10.667 6.667h1.333v8h-1.333zM13 8h1v5.333h-1zM3.333 2.5h6V1L12 3l-2.667 2V3.5h-6z" />
);
