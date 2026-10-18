import { ModuleEditProps } from '@divi/module-library';
import {
  FormatBreakpointStateAttr,
  InternalAttrs,
  type Element,
  type Module,
} from '@divi/types';

export type FlipCardPreview = 'both' | 'front' | 'back';

export type FlipCardDirection = 'left' | 'right' | 'up' | 'down' | 'up-left' | 'up-right' | 'down-left' | 'down-right';

export type FlipCardEffect = 'flip' | 'slide' | 'fade' | 'zoom' | 'cube';

export type FlipCardTrigger = 'hover' | 'click' | 'button';

export type FlipCardButtonPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

// Value of Divi's icon picker.
export interface FlipCardIcon {
  unicode?: string;
  type?: string;
  weight?: string;
}

export interface FlipCardCssAttr extends Module.Css.AttributeValue {
  inner?: string;
}

export type FlipCardCssGroupAttr = FormatBreakpointStateAttr<FlipCardCssAttr>;

export interface FlipCardAttrs extends InternalAttrs {
  css?: FlipCardCssGroupAttr;

  module?: {
    meta?: Element.Meta.Attributes;
    advanced?: {
      htmlAttributes?: Element.Advanced.IdClasses.Attributes;
      text?: Element.Advanced.Text.Attributes;
    };
    decoration?: Element.Decoration.PickedAttributes<
      'animation' |
      'background' |
      'border' |
      'boxShadow' |
      'disabledOn' |
      'filters' |
      'position' |
      'scroll' |
      'sizing' |
      'spacing' |
      'sticky' |
      'transform' |
      'transition' |
      'zIndex'
    >;
  };

  flip?: {
    advanced?: {
      preview?: FormatBreakpointStateAttr<FlipCardPreview>;
      trigger?: FormatBreakpointStateAttr<FlipCardTrigger>;
      backClick?: FormatBreakpointStateAttr<'on' | 'off'>;
      backEscape?: FormatBreakpointStateAttr<'on' | 'off'>;
      backLeave?: FormatBreakpointStateAttr<'on' | 'off'>;
      hint?: FormatBreakpointStateAttr<'on' | 'off'>;
      effect?: FormatBreakpointStateAttr<FlipCardEffect>;
      direction?: FormatBreakpointStateAttr<FlipCardDirection>;
      duration?: FormatBreakpointStateAttr<string>;
    };
  };

  flipButton?: {
    advanced?: {
      position?: FormatBreakpointStateAttr<FlipCardButtonPosition>;
      label?: FormatBreakpointStateAttr<string>;
      icon?: FormatBreakpointStateAttr<FlipCardIcon>;
    };
    decoration?: Element.Decoration.PickedAttributes<'background' | 'font'>;
  };
}

export type FlipCardEditProps = ModuleEditProps<FlipCardAttrs>;
