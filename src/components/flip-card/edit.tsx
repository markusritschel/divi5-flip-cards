// External dependencies.
import React, { ReactElement } from 'react';

// Divi dependencies.
import { ChildModulesContainer, ModuleContainer } from '@divi/module';

// Local dependencies.
import { FlipCardEditProps } from './types';
import { ModuleStyles } from './styles';
import { ModuleScriptData } from './module-script-data';
import { moduleClassnames } from './module-classnames';

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
      <div className="d5fc_flip_card__inner">
        {childrenIds && childrenIds.length > 0 && (
          <ChildModulesContainer ids={childrenIds} isLooped={isLooped} loopIndex={loopIndex} canvasId={canvasId} />
        )}
      </div>
    </ModuleContainer>
  );
};
