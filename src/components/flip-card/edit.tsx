// External dependencies.
import React, { ReactElement } from 'react';

// Divi dependencies.
import { ChildModulesContainer, ModuleContainer } from '@divi/module';

// Local dependencies.
import { FlipCardEditProps, FlipCardPreview } from './types';
import { ModuleStyles } from './styles';
import { ModuleScriptData } from './module-script-data';
import { moduleClassnames } from './module-classnames';

// `@divi/data` (window.divi.data) ships no types here; this is the one action the switch needs.
type EditPostDispatch = {
  editModuleAttribute: (args: { id: string; attrName: string; value: unknown; subName: false }) => void;
};

const editPost = (): EditPostDispatch => (
  window as unknown as { divi: { data: { dispatch: (store: string) => EditPostDispatch } } }
).divi.data.dispatch('divi/edit-post');

/**
 * Front/Back switch shown on the card in the builder (not in the stacked view). It changes the
 * "Show in Builder" setting, so the settings panel stays in sync. Builder only: PHP has no
 * equivalent.
 */
const FaceSwitch = ({ id, preview }: { id: string; preview: FlipCardPreview }): ReactElement => {
  const show = (value: FlipCardPreview) => (event: React.MouseEvent) => {
    // Keep the click from selecting or dragging the module.
    event.stopPropagation();
    editPost().editModuleAttribute({
      id,
      attrName: 'flip.advanced.preview',
      value:    { desktop: { value } },
      subName:  false,
    });
  };

  return (
    <div className="d5fc_flip_card__switch et-vb-ui">
      {(['front', 'back'] as const).map((value) => (
        <button
          key={value}
          type="button"
          className={value === preview ? 'is-active' : undefined}
          aria-pressed={value === preview}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={show(value)}
        >
          {'front' === value ? 'Front' : 'Back'}
        </button>
      ))}
    </div>
  );
};

/**
 * Flip Card edit component of the Visual Builder.
 *
 * The faces are rendered inside `.d5fc_flip_card__inner`, which stacks them in a single
 * CSS grid cell so the card always takes the height of the taller face.
 */
export const FlipCardEdit = (props: FlipCardEditProps): ReactElement => {
  const {
    attrs,
    elements,
    id,
    name,
    childrenIds,
    isLooped,
    loopIndex,
    canvasId,
  } = props;

  const preview = attrs?.flip?.advanced?.preview?.desktop?.value ?? 'both';

  return (
    <ModuleContainer
      attrs={attrs}
      elements={elements}
      id={id}
      name={name}
      childrenIds={childrenIds}
      stylesComponent={ModuleStyles}
      scriptDataComponent={ModuleScriptData}
      classnamesFunction={moduleClassnames}
      isLooped={isLooped}
      loopIndex={loopIndex}
    >
      {elements.styleComponents({
        attrName: 'module',
      })}
      {'both' !== preview && <FaceSwitch id={id} preview={preview} />}
      <div className="d5fc_flip_card__inner">
        {childrenIds && childrenIds.length > 0 && (
          <ChildModulesContainer ids={childrenIds} isLooped={isLooped} loopIndex={loopIndex} canvasId={canvasId} />
        )}
      </div>
    </ModuleContainer>
  );
};
