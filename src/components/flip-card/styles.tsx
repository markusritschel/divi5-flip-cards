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
import { flipDeclaration } from './style-declarations';

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
              // The timing settings together, in Divi's breakpoint format (they are not responsive).
              attr:                {
                desktop: {
                  value: {
                    duration:    attrs?.flip?.advanced?.duration?.desktop?.value,
                    easing:      attrs?.flip?.advanced?.easing?.desktop?.value,
                    delay:       attrs?.flip?.advanced?.delay?.desktop?.value,
                    perspective: attrs?.flip?.advanced?.perspective?.desktop?.value,
                  },
                },
              },
              declarationFunction: flipDeclaration,
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
