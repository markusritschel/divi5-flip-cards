import { addFilter } from "@wordpress/hooks";

import {
  directionDown,
  directionDownLeft,
  directionDownRight,
  directionLeft,
  directionRight,
  directionUp,
  directionUpLeft,
  directionUpRight,
  effectCube,
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
  [directionLeft.name]: directionLeft,
  [directionRight.name]: directionRight,
  [directionUp.name]: directionUp,
  [directionDown.name]: directionDown,
  [directionUpLeft.name]: directionUpLeft,
  [directionUpRight.name]: directionUpRight,
  [directionDownLeft.name]: directionDownLeft,
  [directionDownRight.name]: directionDownRight,
  [effectCube.name]: effectCube,
}));
