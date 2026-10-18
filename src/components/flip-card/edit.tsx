// External dependencies.
import React, { ReactElement, useLayoutEffect, useRef } from 'react';

// WordPress dependencies.
import { __ } from '@wordpress/i18n';

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

// Sets "Show in Builder" from a click on the card, without selecting or dragging the module.
const showInBuilder = (id: string, value: FlipCardPreview) => (event: React.MouseEvent) => {
  event.stopPropagation();
  editPost().editModuleAttribute({
    id,
    attrName: 'flip.advanced.preview',
    value:    { desktop: { value } },
    subName:  false,
  });
};

/**
 * Icon of the flip button (two turning arrows). Mirrors `FlipCard::TOGGLE_ICON`.
 */
const TOGGLE_ICON = (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
    <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.6M20 4v4.6h-4.6M20 12a8 8 0 0 1-13.7 5.7L4 15.4M4 20v-4.6h4.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Front/Back switch shown on the card in the builder (not in the stacked view). It changes the
 * "Show in Builder" setting, so the settings panel stays in sync. Builder only: PHP has no
 * equivalent.
 */
const FaceSwitch = ({ id, preview }: { id: string; preview: FlipCardPreview }): ReactElement => {
  const show = (value: FlipCardPreview) => showInBuilder(id, value);

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

// Applies class changes to the card without animating them: `--instant` (style.scss) turns the
// face transitions off while the browser recalculates the styles once.
const changeInstantly = (card: HTMLElement, change: () => void): void => {
  card.classList.add('d5fc_flip_card--instant');
  change();
  void card.offsetWidth; // Forces the style recalculation while transitions are off.
  card.classList.remove('d5fc_flip_card--instant');
};

/**
 * Plays the transition once (to the other face and back) when the effect, direction or duration
 * changes, so the choice can be judged right away. Builder only: the `--play` class turns the
 * card over in module.scss, and the stacked view is suspended while it plays.
 *
 * The new settings first take effect instantly; otherwise the faces would animate from the old
 * effect's position to the new one (e.g. a rotation before a slide). A layout effect, so the
 * browser never paints that in-between state.
 */
const usePreviewOnChange = (id: string, effect: string, direction: string, duration: string): void => {
  const isFirstRender = useRef(true);

  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return undefined;
    }

    const card = document.querySelector<HTMLElement>(`.d5fc_flip_card_${id}`);

    if (! card) {
      return undefined;
    }

    const ms       = parseFloat(getComputedStyle(card).getPropertyValue('--d5fc-duration')) || 600;
    const isStacked = card.classList.contains('d5fc_flip_card--preview-both');
    const timers: number[] = [];

    const restore = () => changeInstantly(card, () => {
      card.classList.remove('d5fc_flip_card--play');
      card.classList.toggle('d5fc_flip_card--preview-both', isStacked);
    });

    changeInstantly(card, () => card.classList.remove('d5fc_flip_card--preview-both'));
    card.classList.add('d5fc_flip_card--play');
    // Hold the other face briefly, then turn back; restore the stacked view once settled.
    timers.push(window.setTimeout(() => card.classList.remove('d5fc_flip_card--play'), ms + 400));
    timers.push(window.setTimeout(restore, (2 * ms) + 500));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      restore();
    };
  }, [id, effect, direction, duration]);
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

  usePreviewOnChange(
    id,
    attrs?.flip?.advanced?.effect?.desktop?.value ?? 'flip',
    attrs?.flip?.advanced?.direction?.desktop?.value ?? 'left',
    attrs?.flip?.advanced?.duration?.desktop?.value ?? '',
  );

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
      {/* Flip hint; same markup as in PHP (`FlipCard::has_hint()`). */}
      {'on' === attrs?.flip?.advanced?.hint?.desktop?.value && (
        <span className="d5fc_flip_card__hint" aria-hidden="true">{TOGGLE_ICON}</span>
      )}
      {/* Same markup as in PHP. In the builder it switches the face shown. */}
      <button
        type="button"
        className="d5fc_flip_card__toggle"
        aria-pressed={'back' === preview}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={showInBuilder(id, 'back' === preview ? 'front' : 'back')}
      >
        {TOGGLE_ICON}
        <span className="d5fc_flip_card__toggle-label">{__('Flip card', 'divi5-flip-cards')}</span>
      </button>
    </ModuleContainer>
  );
};
