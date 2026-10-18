// External dependencies.
import React, { ReactElement, useEffect, useLayoutEffect, useRef, useState } from 'react';

// WordPress dependencies.
import { __ } from '@wordpress/i18n';

// Divi dependencies.
import { ChildModulesContainer, ModuleContainer } from '@divi/module';

// Local dependencies.
import { FlipCardEditProps, FlipCardPreview } from './types';
import { ModuleStyles } from './styles';
import { ModuleScriptData } from './module-script-data';
import { moduleClassnames } from './module-classnames';

// `@divi/data` (window.divi.data) ships no types here; these are the parts used below.
type EditPostDispatch = {
  editModuleAttribute: (args: { id: string; attrName: string; value: unknown; subName: false }) => void;
};

type EditPostSelectors = {
  getModule: (id: string) => { parent?: string } | undefined;
};

type ModalLibrarySelectors = {
  getActiveModals: () => Record<string, { isActive?: boolean; owner?: string } | undefined> | undefined;
};

type DiviData = {
  dispatch: (store: string) => EditPostDispatch;
  useSelect: <T>(mapSelect: (select: (store: string) => unknown) => T, deps: unknown[]) => T;
};

const diviData = (): DiviData => (window as unknown as { divi: { data: DiviData } }).divi.data;

const editPost = (): EditPostDispatch => diviData().dispatch('divi/edit-post');

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
const FaceSwitch = ({ shown, onShow }: {
  shown: FlipCardPreview;
  onShow: (value: FlipCardPreview) => (event: React.MouseEvent) => void;
}): ReactElement => (
  <div className="d5fc_flip_card__switch et-vb-ui">
    {(['front', 'back'] as const).map((value) => (
      <button
        key={value}
        type="button"
        className={value === shown ? 'is-active' : undefined}
        aria-pressed={value === shown}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={onShow(value)}
      >
        {'front' === value ? 'Front' : 'Back'}
      </button>
    ))}
  </div>
);

/**
 * The face (front or back) holding the module whose settings are open, if it is in this card:
 * walks up from the edited module to the child of this card that contains it.
 */
const useEditedFace = (id: string, childrenIds: string[]): FlipCardPreview | null => diviData().useSelect((select) => {
  const modal     = (select('divi/modal-library') as ModalLibrarySelectors).getActiveModals()?.['divi/module'];
  const getModule = (select('divi/edit-post') as EditPostSelectors).getModule;
  let current     = modal?.isActive ? modal.owner : undefined;

  for (let depth = 0; current && depth < 50; depth++) {
    const parent = getModule(current)?.parent;

    if (parent === id) {
      const index = childrenIds.indexOf(current);
      return 0 === index ? 'front' : (1 === index ? 'back' : null);
    }

    current = parent;
  }

  return null;
}, [id, childrenIds]);

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

  // In the Front/Back view, show the face holding the module being edited. View only (the setting
  // is not changed); the switch and the flip button take over again.
  const editedFace              = useEditedFace(id, childrenIds ?? []);
  const [autoFace, setAutoFace] = useState<FlipCardPreview | null>(null);

  useEffect(() => setAutoFace(null), [preview]);
  useEffect(() => {
    if (editedFace) {
      setAutoFace(editedFace);
    }
  }, [editedFace]);

  const shown = 'both' === preview ? 'both' : (autoFace ?? preview);

  // Design > Flip Button > Button Text; mirrors `FlipCard::render_callback()`.
  const buttonLabel = attrs?.flipButton?.advanced?.label?.desktop?.value?.trim() ?? '';

  const show = (value: FlipCardPreview) => (event: React.MouseEvent) => {
    setAutoFace(null);
    showInBuilder(id, value)(event);
  };

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
      {'both' !== shown && <FaceSwitch shown={shown} onShow={show} />}
      <div className={shown === preview ? 'd5fc_flip_card__inner' : `d5fc_flip_card__inner d5fc_flip_card__inner--show-${shown}`}>
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
        className={buttonLabel ? 'd5fc_flip_card__toggle d5fc_flip_card__toggle--labelled' : 'd5fc_flip_card__toggle'}
        aria-pressed={'back' === shown}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={show('back' === shown ? 'front' : 'back')}
      >
        {TOGGLE_ICON}
        <span className="d5fc_flip_card__toggle-label">{buttonLabel || __('Flip card', 'divi5-flip-cards')}</span>
      </button>
    </ModuleContainer>
  );
};
