import { DeclarationFunctionProps } from "@divi/module";
import { StyleDeclarations } from "@divi/style-library";

import { FlipCardEasing } from "./types";

// Speed curves; mirrors `FlipCard::EASINGS`.
const EASINGS: FlipCardEasing[] = [
  "ease-in-out",
  "ease",
  "ease-in",
  "ease-out",
  "linear",
];

export interface FlipCardTiming {
  duration?: string;
  easing?: string;
  delay?: string;
  perspective?: string;
}

/**
 * Outputs the flip timing and perspective as CSS custom properties, which the faces read in
 * `module.scss`.
 *
 * The PHP equivalent is `FlipCard::flip_declaration()`.
 */
export const flipDeclaration = ({
  attrValue,
}: DeclarationFunctionProps<FlipCardTiming>): string => {
  const declarations = new StyleDeclarations({
    returnType: "string",
    important: false,
  });

  if (attrValue?.duration) {
    declarations.add("--d5fc-duration", attrValue.duration);
  }

  if (
    attrValue?.easing &&
    EASINGS.includes(attrValue.easing as FlipCardEasing)
  ) {
    declarations.add("--d5fc-easing", attrValue.easing);
  }

  if (attrValue?.delay) {
    declarations.add("--d5fc-delay", attrValue.delay);
  }

  if (attrValue?.perspective) {
    declarations.add("--d5fc-perspective", attrValue.perspective);
  }

  return declarations.value as string;
};
