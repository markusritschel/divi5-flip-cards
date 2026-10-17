// WordPress dependencies.
import { __ } from '@wordpress/i18n';

import metadata from './module.json';

const customCssFields = metadata.customCssFields as Record<'inner', { subName: string, selectorSuffix: string, label: string }>;

customCssFields.inner.label = __('Inner Wrapper', 'divi5-flip-cards');

export const cssFields = { ...customCssFields };
