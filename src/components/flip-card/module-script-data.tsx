import React, { Fragment, ReactElement } from 'react';

import { ModuleScriptDataProps } from '@divi/module';
import { FlipCardAttrs } from './types';

/**
 * Flip Card script data component (scroll effects, sticky, etc.).
 */
export const ModuleScriptData = ({
  elements,
}: ModuleScriptDataProps<FlipCardAttrs>): ReactElement => (
  <Fragment>
    {elements.scriptData({
      attrName: 'module',
    })}
  </Fragment>
);
