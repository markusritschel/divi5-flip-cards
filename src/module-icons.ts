import { addFilter } from '@wordpress/hooks';

import { moduleFlipCard } from './icons';

// Add the module icons to Divi's icon library.
addFilter('divi.iconLibrary.icon.map', 'divi5FlipCards', (icons) => ({
  ...icons, // Keep every other icon.
  [moduleFlipCard.name]: moduleFlipCard,
}));
