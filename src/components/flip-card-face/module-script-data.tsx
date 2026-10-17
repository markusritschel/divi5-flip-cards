import React, { Fragment, ReactElement } from 'react';

import { ModuleScriptDataProps } from '@divi/module';
import { FlipCardFaceAttrs } from './types';

/**
 * Face script data component.
 */
export const ModuleScriptData = ({
  elements,
}: ModuleScriptDataProps<FlipCardFaceAttrs>): ReactElement => (
  <Fragment>
    {elements.scriptData({
      attrName: 'module',
    })}
  </Fragment>
);
