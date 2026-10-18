import { DeclarationFunctionProps } from '@divi/module';
import { StyleDeclarations } from '@divi/style-library';

/**
 * Outputs the flip duration as a CSS custom property, which the faces read in `module.scss`.
 *
 * The PHP equivalent is `FlipCard::duration_declaration()`.
 */
export const durationDeclaration = ({
  attrValue,
}: DeclarationFunctionProps<string>): string => {
  const declarations = new StyleDeclarations({
    returnType: 'string',
    important:  false,
  });

  if (attrValue) {
    declarations.add('--d5fc-duration', attrValue);
  }

  return declarations.value as string;
};

/**
 * Outputs the fixed size of the sliding back face ("Fixed Size") as a CSS custom property.
 *
 * The PHP equivalent is `FlipCard::back_size_declaration()`.
 */
export const backSizeDeclaration = ({
  attrValue,
}: DeclarationFunctionProps<string>): string => {
  const declarations = new StyleDeclarations({
    returnType: 'string',
    important:  false,
  });

  if (attrValue) {
    declarations.add('--d5fc-back-size', attrValue);
  }

  return declarations.value as string;
};

/**
 * Outputs the backdrop blur of the sliding back face ("Backdrop Blur") as a CSS custom property;
 * nothing for 0, so no backdrop filter is applied.
 *
 * The PHP equivalent is `FlipCard::backdrop_blur_declaration()`.
 */
export const backdropBlurDeclaration = ({
  attrValue,
}: DeclarationFunctionProps<string>): string => {
  const declarations = new StyleDeclarations({
    returnType: 'string',
    important:  false,
  });

  if (attrValue && 0 !== parseFloat(attrValue)) {
    declarations.add('--d5fc-backdrop', `blur(${attrValue})`);
  }

  return declarations.value as string;
};
