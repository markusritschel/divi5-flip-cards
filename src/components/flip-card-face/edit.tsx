// External dependencies.
import React, { ReactElement } from 'react';

// Divi dependencies.
import { ChildModulesContainer, ModuleAdd, ModuleContainer } from '@divi/module';

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
 *
 * Divi only draws the "add a module inside" button for its own structural modules (Group,
 * Column, ...), so an empty face renders that button itself.
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
    layout,
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
      {childrenIds && childrenIds.length > 0 ? (
        <ChildModulesContainer ids={childrenIds} isLooped={isLooped} loopIndex={loopIndex} canvasId={canvasId} />
      ) : (
        <ModuleAdd
          moduleId={id}
          basicModuleType="module"
          basicModuleTypeLabel="Module"
          addChild
          isRow={false}
          isSection={false}
          isColumnInner={false}
          isNestedModule
          isSpecialtyColumn={false}
          layout={layout}
        />
      )}
    </ModuleContainer>
  );
};
