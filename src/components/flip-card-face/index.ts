// Divi dependencies.
import {
  type Metadata,
  type ModuleLibrary,
} from '@divi/types';

// Local dependencies.
import metadata from './module.json';
import { FlipCardFaceEdit } from './edit';
import { FlipCardFaceAttrs } from './types';

// Styles.
import './module.scss';

/**
 * Face module: one side of a Flip Card. Holds any Divi modules.
 */
export const flipCardFace: ModuleLibrary.Module.RegisterDefinition<FlipCardFaceAttrs> = {
  // Imported JSON has no inferred type, hence the cast.
  metadata:    metadata as Metadata.Values<FlipCardFaceAttrs>,
  renderers:   {
    edit: FlipCardFaceEdit,
  },
  parentsName: ['d5fc/flip-card'],
};
