// External dependencies.
import React, { ReactElement } from 'react';

// Divi dependencies.
import { ChildModulesContainer, ModuleContainer } from '@divi/module';

// Local dependencies.
import { FlipCardFaceEditProps } from './types';
import { ModuleStyles } from './styles';
import { ModuleScriptData } from './module-script-data';
import { moduleClassnames } from './module-classnames';

/**
 * Face edit component of the Visual Builder.
 *
 * A face is a container like Divi's Group module: `childrenName: []` in module.json lets
 * it hold any regular Divi module.
 */
export const FlipCardFaceEdit = (props: FlipCardFaceEditProps): ReactElement => {
  const {
    attrs,
    elements,
    id,
    name,
    parentAttrs,
    childrenIds,
    isLooped,
    loopIndex,
    canvasId,
  } = props;

  return (
    <ModuleContainer
      attrs={attrs}
      parentAttrs={parentAttrs}
      elements={elements}
      id={id}
      name={name}
      childrenIds={childrenIds}
      stylesComponent={ModuleStyles}
      scriptDataComponent={ModuleScriptData}
      classnamesFunction={moduleClassnames}
      isLooped={isLooped}
      loopIndex={loopIndex}
      tag="div"
    >
      {elements.styleComponents({
        attrName: 'module',
      })}
      {childrenIds && childrenIds.length > 0 && (
        <ChildModulesContainer ids={childrenIds} isLooped={isLooped} loopIndex={loopIndex} canvasId={canvasId} />
      )}
    </ModuleContainer>
  );
};
