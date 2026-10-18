import { addFilter } from "@wordpress/hooks";

import {
  moduleFlipCard,
  triggerButton,
  triggerClick,
  triggerHover,
} from "./icons";

// Add the module and setting icons to Divi's icon library.
addFilter("divi.iconLibrary.icon.map", "divi5FlipCards", (icons) => ({
  ...icons, // Keep every other icon.
  [moduleFlipCard.name]: moduleFlipCard,
  [triggerHover.name]: triggerHover,
  [triggerClick.name]: triggerClick,
  [triggerButton.name]: triggerButton,
}));
