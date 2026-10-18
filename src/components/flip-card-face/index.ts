// Divi dependencies.
import * as moduleUtils from "@divi/module-utils";
import { type Metadata, type ModuleLibrary } from "@divi/types";

// Local dependencies.
import metadata from "./module.json";
import { FlipCardFaceEdit } from "./edit";
import { FlipCardFaceAttrs } from "./types";

// Styles.
import "./module.scss";

type Callbacks = NonNullable<
  ModuleLibrary.Module.RegisterDefinition["callbacks"]
>;

// The handlers behind the "Elements > Add Element" list that Divi's Group and Row use. Divi 5.15
// ships them in `divi.moduleUtils`, but the bundled @divi/module-utils types predate them.
const { elementsCallbacks } = moduleUtils as typeof moduleUtils & {
  elementsCallbacks?: NonNullable<Callbacks["content"]>[string];
};

/**
 * Face module: one side of a Flip Card. Holds any Divi modules.
 */
export const flipCardFace: ModuleLibrary.Module.RegisterDefinition<FlipCardFaceAttrs> =
  {
    // Imported JSON has no inferred type, hence the cast.
    metadata: metadata as Metadata.Values<FlipCardFaceAttrs>,
    renderers: {
      edit: FlipCardFaceEdit,
    },
    parentsName: ["d5fc/flip-card"],
    callbacks: elementsCallbacks
      ? { content: { elements: elementsCallbacks } }
      : undefined,
  };
