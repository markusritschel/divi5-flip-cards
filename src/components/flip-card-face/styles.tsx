// External dependencies.
import React, { ReactElement } from 'react';

// Divi dependencies.
import {
  StyleContainer,
  StylesProps,
  CssStyle,
} from '@divi/module';

// Local dependencies.
import { FlipCardFaceAttrs } from './types';

/**
 * Face style components.
 *
 * The PHP equivalent is `FlipCardFace::module_styles()`.
 */
export const ModuleStyles = ({
  attrs,
  elements,
  orderClass,
  mode,
  state,
  noStyleTag,
}: StylesProps<FlipCardFaceAttrs>): ReactElement => (
  <StyleContainer mode={mode} state={state} noStyleTag={noStyleTag}>
    {elements.style({
      attrName: 'module',
    })}

    {/* Custom CSS goes last so it can override the module styles. */}
    <CssStyle
      selector={orderClass}
      attr={attrs.css}
      cssFields={{}}
    />
  </StyleContainer>
);
