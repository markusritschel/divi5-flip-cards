// Divi dependencies.
import {
  type Metadata,
  type ModuleLibrary,
} from '@divi/types';

// Local dependencies.
import metadata from './module.json';
import { FlipCardEdit } from './edit';
import { FlipCardAttrs } from './types';

// Styles.
import './module.scss';
import './style.scss';

/**
 * Flip Card module.
 *
 * Only accepts `d5fc/flip-card-face` children (no `allowAllElements`). A new card starts
 * with two faces; the first one is the front and the second one the back. Any further
 * faces are hidden on the front end and flagged in the builder.
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
};
