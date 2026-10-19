import { ModuleClassnamesParams, textOptionsClassnames } from '@divi/module';
import { FlipCardFaceAttrs } from './types';

/**
 * Module classnames function for the Face.
 *
 * `--scroll`: Design > Sizing height 100% and Overflow Y scroll or auto (desktop values). The
 * back face then takes the front's height instead of growing the card, and its content scrolls.
 *
 * The PHP equivalent is `FlipCardFace::module_classnames()`.
 */
export const moduleClassnames = ({
  classnamesInstance,
  attrs,
}: ModuleClassnamesParams<FlipCardFaceAttrs>): void => {
  classnamesInstance.add(textOptionsClassnames(attrs?.module?.advanced?.text ?? {}));

  const decoration = attrs?.module?.decoration;
  const scrolls    = '100%' === decoration?.sizing?.desktop?.value?.height
    && ['scroll', 'auto'].includes(decoration?.overflow?.desktop?.value?.y ?? '');

  classnamesInstance.add('d5fc_flip_card_face--scroll', scrolls);
};
