import { addAction } from '@wordpress/hooks';

import { registerModule } from '@divi/module-library';

import { flipCard } from './components/flip-card';
import { flipCardFace } from './components/flip-card-face';

import './module-icons';

// Register the modules with the Visual Builder.
addAction('divi.moduleLibrary.registerModuleLibraryStore.after', 'divi5FlipCards', () => {
  const { metadata: faceMetadata, ...face } = flipCardFace;
  const { metadata: cardMetadata, ...card } = flipCard;

  registerModule(faceMetadata, face);
  registerModule(cardMetadata, card);
});
