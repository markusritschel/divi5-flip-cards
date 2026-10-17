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
