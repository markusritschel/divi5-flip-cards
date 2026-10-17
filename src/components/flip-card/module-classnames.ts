import { ModuleClassnamesParams, textOptionsClassnames } from '@divi/module';
import { FlipCardAttrs } from './types';

/**
 * Module classnames function for the Flip Card (Visual Builder only).
 *
 * The PHP equivalent is `FlipCard::module_classnames()`. The builder adds two classes the
 * front end never gets: `d5fc_flip_card--builder` turns off hover flipping while editing,
 * and `d5fc_flip_card--preview-back` shows the back face so it can be edited.
 */
export const moduleClassnames = ({
  classnamesInstance,
  attrs,
}: ModuleClassnamesParams<FlipCardAttrs>): void => {
  const direction = attrs?.flip?.advanced?.direction?.desktop?.value ?? 'left';
  const preview   = attrs?.flip?.advanced?.preview?.desktop?.value ?? 'front';

  classnamesInstance.add(textOptionsClassnames(attrs?.module?.advanced?.text ?? {}));
  classnamesInstance.add(`d5fc_flip_card--${direction}`);
  classnamesInstance.add('d5fc_flip_card--builder');
  classnamesInstance.add('d5fc_flip_card--preview-back', 'back' === preview);
};
