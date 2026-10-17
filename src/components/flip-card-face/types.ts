import { ModuleEditProps } from '@divi/module-library';
import {
  FormatBreakpointStateAttr,
  InternalAttrs,
  type Element,
  type Module,
} from '@divi/types';

import { FlipCardAttrs } from '../flip-card/types';

export interface FlipCardFaceAttrs extends InternalAttrs {
  css?: FormatBreakpointStateAttr<Module.Css.AttributeValue>;

  module?: {
    meta?: Element.Meta.Attributes;
    advanced?: {
      htmlAttributes?: Element.Advanced.IdClasses.Attributes;
      text?: Element.Advanced.Text.Attributes;
    };
    decoration?: Element.Decoration.PickedAttributes<
      'background' |
      'border' |
      'boxShadow' |
      'filters' |
      'layout' |
      'overflow' |
      'sizing' |
      'spacing'
    >;
  };
}

export type FlipCardFaceEditProps = ModuleEditProps<FlipCardFaceAttrs, FlipCardAttrs>;
