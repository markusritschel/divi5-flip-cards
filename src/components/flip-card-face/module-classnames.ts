import { ModuleClassnamesParams, textOptionsClassnames } from '@divi/module';
import { FlipCardFaceAttrs } from './types';

/**
 * Module classnames function for the Face.
 *
 * The PHP equivalent is `FlipCardFace::module_classnames()`.
 */
export const moduleClassnames = ({
  classnamesInstance,
  attrs,
}: ModuleClassnamesParams<FlipCardFaceAttrs>): void => {
  classnamesInstance.add(textOptionsClassnames(attrs?.module?.advanced?.text ?? {}));
};
