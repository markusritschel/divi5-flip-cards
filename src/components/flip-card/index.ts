// Divi dependencies.
import {
  type Metadata,
  type ModuleLibrary,
} from '@divi/types';

// Local dependencies.
import metadata from './module.json';
import { FlipCardEdit } from './edit';
import { FlipCardAttrs } from './types';

// The "flip back" options only apply to cards turned by a click or the flip button.
const isClickOrButton = ({ attrs }: { attrs: unknown }): boolean => ['click', 'button'].includes(
  (attrs as FlipCardAttrs)?.flip?.advanced?.trigger?.desktop?.value ?? 'hover',
);

// Styles.
import './module.scss';
import './style.scss';

/**
 * Flip Card module.
 *
 * Only accepts `d5fc/flip-card-face` children (no `allowAllElements`). A new card starts
 * with two faces; the first one is the front and the second one the back. "Add New Face"
 * disappears at two faces; further faces (e.g. from older content) are hidden on the front end
 * and flagged in the builder.
 */
export const flipCard: ModuleLibrary.Module.RegisterDefinition<FlipCardAttrs> = {
  // Imported JSON has no inferred type, hence the cast.
  metadata:     metadata as Metadata.Values<FlipCardAttrs>,
  childrenName: ['d5fc/flip-card-face'],
  template:     [
    ['d5fc/flip-card-face', { module: { meta: { adminLabel: { desktop: { value: 'Front' } } } } }],
    ['d5fc/flip-card-face', { module: { meta: { adminLabel: { desktop: { value: 'Back' } } } } }],
  ],
  renderers: {
    edit: FlipCardEdit,
  },
  callbacks: {
    content: {
      'd5fc/flip-card-face': {
        maxItemsCallback: () => 2,
      },
      // Field keys: the attribute path in Divi's notation (`flip.advanced.backClick`).
      contentFlip: {
        fields: {
          flipAdvancedBackclick:  { visible: isClickOrButton },
          flipAdvancedBackescape: { visible: isClickOrButton },
          flipAdvancedBackleave:  { visible: isClickOrButton },
          flipAdvancedBackdropblur: { visible: ({ attrs }) => 'slide' === (attrs as FlipCardAttrs)?.flip?.advanced?.effect?.desktop?.value },
          // The flip button already shows the card can be turned.
          flipAdvancedHint:       { visible: ({ attrs }) => 'button' !== (attrs as FlipCardAttrs)?.flip?.advanced?.trigger?.desktop?.value },
        },
      },
    },
  },
};
