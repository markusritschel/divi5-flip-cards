import { ModuleClassnamesParams, textOptionsClassnames } from '@divi/module';
import { FlipCardAttrs } from './types';

/**
 * Module classnames function for the Flip Card (Visual Builder only).
 *
 * The PHP equivalent is `FlipCard::module_classnames()`. The builder adds classes the front
 * end never gets: `d5fc_flip_card--builder` turns off hover flipping while editing,
 * `d5fc_flip_card--preview-both` stacks the faces so both can be edited, and
 * `d5fc_flip_card--preview-back` shows the back face of the flipping card.
 */
export const moduleClassnames = ({
  classnamesInstance,
  attrs,
}: ModuleClassnamesParams<FlipCardAttrs>): void => {
  const direction = attrs?.flip?.advanced?.direction?.desktop?.value ?? 'left';
  const effect    = attrs?.flip?.advanced?.effect?.desktop?.value ?? 'flip';
  const trigger   = attrs?.flip?.advanced?.trigger?.desktop?.value ?? 'hover';
  const preview   = attrs?.flip?.advanced?.preview?.desktop?.value ?? 'both';

  classnamesInstance.add(textOptionsClassnames(attrs?.module?.advanced?.text ?? {}));
  classnamesInstance.add(`d5fc_flip_card--${direction}`);
  classnamesInstance.add(`d5fc_flip_card--${effect}`);
  classnamesInstance.add(`d5fc_flip_card--trigger-${trigger}`);
  classnamesInstance.add('d5fc_flip_card--hint', 'on' === attrs?.flip?.advanced?.hint?.desktop?.value);
  classnamesInstance.add('d5fc_flip_card--back-click', 'off' !== attrs?.flip?.advanced?.backClick?.desktop?.value);
  classnamesInstance.add('d5fc_flip_card--back-escape', 'off' !== attrs?.flip?.advanced?.backEscape?.desktop?.value);
  classnamesInstance.add('d5fc_flip_card--back-leave', 'on' === attrs?.flip?.advanced?.backLeave?.desktop?.value);
  classnamesInstance.add(`d5fc_flip_card--button-${attrs?.flipButton?.advanced?.position?.desktop?.value ?? 'bottom-right'}`);
  classnamesInstance.add('d5fc_flip_card--builder');
  classnamesInstance.add('d5fc_flip_card--preview-both', 'both' === preview);
  classnamesInstance.add('d5fc_flip_card--preview-back', 'back' === preview);
};
