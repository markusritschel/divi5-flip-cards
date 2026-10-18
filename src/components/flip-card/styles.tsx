// External dependencies.
import React, { ReactElement } from 'react';

// Divi dependencies.
import {
  StyleContainer,
  StylesProps,
  CssStyle,
} from '@divi/module';

// Local dependencies.
import { FlipCardAttrs } from './types';
import { cssFields } from './custom-css';
import { backSizeDeclaration, durationDeclaration } from './style-declarations';

/**
 * Flip Card style components.
 *
 * The PHP equivalent is `FlipCard::module_styles()`.
 */
export const ModuleStyles = ({
  attrs,
  elements,
  settings,
  orderClass,
  mode,
  state,
  noStyleTag,
}: StylesProps<FlipCardAttrs>): ReactElement => (
  <StyleContainer mode={mode} state={state} noStyleTag={noStyleTag}>
    {elements.style({
      attrName:   'module',
      styleProps: {
        disabledOn: {
          disabledModuleVisibility: settings?.disabledModuleVisibility,
        },
      },
    })}

    {elements.style({
      attrName:   'flip',
      styleProps: {
        advancedStyles: [
          {
            componentName: 'divi/common',
            props:         {
              attr:                attrs?.flip?.advanced?.duration,
              declarationFunction: durationDeclaration,
            },
          },
          {
            componentName: 'divi/common',
            props:         {
              attr:                attrs?.flip?.advanced?.backSizeValue,
              declarationFunction: backSizeDeclaration,
            },
          },
        ],
      },
    })}

    {/* Design tab > Flip Button / Flip Button Text, applied to the button. */}
    {elements.style({
      attrName: 'flipButton',
    })}

    {/* Custom CSS goes last so it can override the module styles. */}
    <CssStyle
      selector={orderClass}
      attr={attrs.css}
      cssFields={cssFields}
    />
  </StyleContainer>
);
