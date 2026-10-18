<?php
/**
 * Flip Card module: registration and front-end rendering.
 *
 * Each method mirrors a file in src/components/flip-card/ (named in its doc comment);
 * keep the two in sync.
 *
 * @package D5FC\Modules\FlipCard
 */

namespace D5FC\Modules\FlipCard;

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Direct access forbidden.' );
}

// phpcs:disable ET.Sniffs.ValidVariableName.UsedPropertyNotSnakeCase -- WP uses camelCase in \WP_Block_Parser_Block.

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Framework\Utility\HTMLUtility;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\FrontEnd\Module\Style;
use ET\Builder\Packages\IconLibrary\IconFont\Utils as IconFontUtils;
use ET\Builder\Packages\Module\Module;
use ET\Builder\Packages\Module\Options\Css\CssStyle;
use ET\Builder\Packages\Module\Options\Element\ElementScriptData;
use ET\Builder\Packages\Module\Options\Text\TextClassnames;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;
use ET\Builder\Packages\ModuleUtils\ChildrenUtils;
use ET\Builder\Packages\StyleLibrary\Utils\StyleDeclarations;

/**
 * Flip Card module.
 */
class FlipCard implements DependencyInterface {

	/**
	 * Flip directions; each one has a matching `d5fc_flip_card--{direction}` class in module.scss.
	 */
	const DIRECTIONS = [ 'left', 'right', 'up', 'down' ];

	/**
	 * Effects; each one has a matching `d5fc_flip_card--{effect}` class in module.scss.
	 */
	const EFFECTS = [ 'flip', 'slide' ];

	/**
	 * Triggers; each one has a matching `d5fc_flip_card--trigger-{trigger}` class, used by
	 * module.scss and the front-end script.
	 */
	const TRIGGERS = [ 'hover', 'click', 'button' ];

	/**
	 * Flip button corners; each one has a matching `d5fc_flip_card--button-{position}` class.
	 */
	const BUTTON_POSITIONS = [ 'top-left', 'top-right', 'bottom-left', 'bottom-right' ];

	/**
	 * Icon of the flip button (two turning arrows). Mirrors `TOGGLE_ICON` in `edit.tsx`.
	 */
	const TOGGLE_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.6M20 4v4.6h-4.6M20 12a8 8 0 0 1-13.7 5.7L4 15.4M4 20v-4.6h4.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

	/**
	 * Registers the module and its render callback.
	 */
	public function load() {
		add_action(
			'init',
			function () {
				ModuleRegistration::register_module(
					D5FC_MODULES_JSON_PATH . 'flip-card/',
					[
						'render_callback' => [ self::class, 'render_callback' ],
					]
				);
			}
		);
	}

	/**
	 * Renders the module on the front end. Mirrors `edit.tsx`.
	 *
	 * @param array                                                                    $attrs    Module attributes saved by the builder.
	 * @param string                                                                   $content  Rendered faces.
	 * @param \WP_Block                                                                $block    Parsed block being rendered.
	 * @param \ET\Builder\Packages\Module\Layout\Components\ModuleElements\ModuleElements $elements ModuleElements instance.
	 *
	 * @return string
	 */
	public static function render_callback( $attrs, $content, $block, $elements ) {
		$parent = BlockParserStore::get_parent( $block->parsed_block['id'], $block->parsed_block['storeInstance'] );

		$inner = HTMLUtility::render(
			[
				'tag'               => 'div',
				'attributes'        => [
					'class' => 'd5fc_flip_card__inner',
				],
				'childrenSanitizer' => 'et_core_esc_previously',
				'children'          => $content,
			]
		);

		// The flip button: visible with the "Flip button" trigger, otherwise shown only while
		// focused, so keyboard users can turn every card. The front-end script makes it work.
		// Design > Flip Button > Button Text: shown next to the icon; otherwise a hidden label.
		$button_label = trim( (string) ( $attrs['flipButton']['advanced']['label']['desktop']['value'] ?? '' ) );

		$toggle = sprintf(
			'<button type="button" class="%1$s" aria-pressed="false">%2$s<span class="d5fc_flip_card__toggle-label">%3$s</span></button>',
			'' === $button_label ? 'd5fc_flip_card__toggle' : 'd5fc_flip_card__toggle d5fc_flip_card__toggle--labelled',
			self::toggle_icon( $attrs['flipButton']['advanced']['icon']['desktop']['value'] ?? [] ),
			'' === $button_label ? esc_html__( 'Flip card', 'divi5-flip-cards' ) : esc_html( $button_label )
		);

		// Decorative flip hint in the corner; the front-end script wiggles it once.
		$hint = self::has_hint( $attrs ) ? '<span class="d5fc_flip_card__hint" aria-hidden="true">' . self::TOGGLE_ICON . '</span>' : '';

		return Module::render(
			[
				// Front end only.
				'orderIndex'          => $block->parsed_block['orderIndex'],
				'storeInstance'       => $block->parsed_block['storeInstance'],

				// Same as in the builder.
				'id'                  => $block->parsed_block['id'],
				'name'                => $block->block_type->name,
				'moduleCategory'      => $block->block_type->category,
				'attrs'               => $attrs,
				'elements'            => $elements,
				'classnamesFunction'  => [ self::class, 'module_classnames' ],
				'scriptDataComponent' => [ self::class, 'module_script_data' ],
				'stylesComponent'     => [ self::class, 'module_styles' ],
				'parentAttrs'         => $parent->attrs ?? [],
				'parentId'            => $parent->id ?? '',
				'parentName'          => $parent->blockName ?? '',
				'children'            => $elements->style_components(
					[
						'attrName' => 'module',
					]
				) . $inner . $hint . $toggle,
				'childrenIds'         => ChildrenUtils::extract_children_ids( $block ),
			]
		);
	}

	/**
	 * Adds the module classes. Mirrors `module-classnames.ts`, minus the builder-only classes.
	 *
	 * @param array $args {
	 *     @type object $classnamesInstance Classnames instance.
	 *     @type array  $attrs              Module attributes.
	 * }
	 */
	public static function module_classnames( $args ) {
		$classnames_instance = $args['classnamesInstance'];
		$attrs               = $args['attrs'];

		$text_options_classnames = TextClassnames::text_options_classnames( $attrs['module']['advanced']['text'] ?? [] );

		if ( $text_options_classnames ) {
			$classnames_instance->add( $text_options_classnames, true );
		}

		$direction = $attrs['flip']['advanced']['direction']['desktop']['value'] ?? 'left';

		if ( ! in_array( $direction, self::DIRECTIONS, true ) ) {
			$direction = 'left';
		}

		$classnames_instance->add( 'd5fc_flip_card--' . $direction, true );

		$effect = $attrs['flip']['advanced']['effect']['desktop']['value'] ?? 'flip';

		if ( ! in_array( $effect, self::EFFECTS, true ) ) {
			$effect = 'flip';
		}

		$classnames_instance->add( 'd5fc_flip_card--' . $effect, true );

		$trigger = $attrs['flip']['advanced']['trigger']['desktop']['value'] ?? 'hover';

		if ( ! in_array( $trigger, self::TRIGGERS, true ) ) {
			$trigger = 'hover';
		}

		$classnames_instance->add( 'd5fc_flip_card--trigger-' . $trigger, true );

		// Slide: how far the back face reaches ("full" needs no class).
		$back_size = $attrs['flip']['advanced']['backSize']['desktop']['value'] ?? 'full';

		if ( in_array( $back_size, [ 'content', 'fixed' ], true ) ) {
			$classnames_instance->add( 'd5fc_flip_card--back-' . $back_size, true );
		}

		$classnames_instance->add( 'd5fc_flip_card--hint', self::has_hint( $attrs ) );

		// How a flipped card returns (click and flip button triggers); read by the front-end script.
		$flip = $attrs['flip']['advanced'] ?? [];
		$classnames_instance->add( 'd5fc_flip_card--back-click', 'off' !== ( $flip['backClick']['desktop']['value'] ?? 'on' ) );
		$classnames_instance->add( 'd5fc_flip_card--back-escape', 'off' !== ( $flip['backEscape']['desktop']['value'] ?? 'on' ) );
		$classnames_instance->add( 'd5fc_flip_card--back-leave', 'on' === ( $flip['backLeave']['desktop']['value'] ?? 'off' ) );

		$button_position = $attrs['flipButton']['advanced']['position']['desktop']['value'] ?? 'bottom-right';

		if ( ! in_array( $button_position, self::BUTTON_POSITIONS, true ) ) {
			$button_position = 'bottom-right';
		}

		$classnames_instance->add( 'd5fc_flip_card--button-' . $button_position, true );
	}

	/**
	 * Icon of the flip button: the icon picked in Design > Flip Button (a Divi or Font Awesome
	 * icon, whose font Divi loads when it finds the icon in the content), or the turning arrows.
	 * Mirrors `ToggleIcon` in `edit.tsx`.
	 *
	 * @param array $icon Icon picker value (`unicode`, `type`, `weight`).
	 *
	 * @return string
	 */
	public static function toggle_icon( $icon ) {
		$character = is_array( $icon ) && ! empty( $icon['unicode'] ) ? IconFontUtils::process_font_icon( $icon ) : '';

		if ( ! is_string( $character ) || '' === $character ) {
			return self::TOGGLE_ICON;
		}

		$style = 'font-family:' . IconFontUtils::get_icon_font_family( $icon['type'] ?? null ) . ';';

		if ( ! empty( $icon['weight'] ) ) {
			$style .= 'font-weight:' . $icon['weight'] . ';';
		}

		return sprintf(
			'<span class="d5fc_flip_card__toggle-icon" aria-hidden="true" style="%1$s">%2$s</span>',
			esc_attr( $style ),
			esc_html( $character )
		);
	}

	/**
	 * Whether the "Show Flip Hint" setting is on. Mirrors the `hint` check in `edit.tsx`.
	 *
	 * @param array $attrs Module attributes.
	 *
	 * @return bool
	 */
	public static function has_hint( $attrs ) {
		return 'on' === ( $attrs['flip']['advanced']['hint']['desktop']['value'] ?? 'off' );
	}

	/**
	 * Adds the module styles. Mirrors `styles.tsx`.
	 *
	 * @param array $args Style arguments passed by `Module::render()`.
	 */
	public static function module_styles( $args ) {
		$attrs    = $args['attrs'] ?? [];
		$elements = $args['elements'];
		$settings = $args['settings'] ?? [];

		Style::add(
			[
				'id'            => $args['id'],
				'name'          => $args['name'],
				'orderIndex'    => $args['orderIndex'],
				'storeInstance' => $args['storeInstance'],
				'styles'        => [
					$elements->style(
						[
							'attrName'   => 'module',
							'styleProps' => [
								'disabledOn' => [
									'disabledModuleVisibility' => $settings['disabledModuleVisibility'] ?? null,
								],
							],
						]
					),

					$elements->style(
						[
							'attrName'   => 'flip',
							'styleProps' => [
								'advancedStyles' => [
									[
										'componentName' => 'divi/common',
										'props'         => [
											'attr'                => $attrs['flip']['advanced']['duration'] ?? [],
											'declarationFunction' => [ self::class, 'duration_declaration' ],
										],
									],
									[
										'componentName' => 'divi/common',
										'props'         => [
											'attr'                => $attrs['flip']['advanced']['backdropBlur'] ?? [],
											'declarationFunction' => [ self::class, 'backdrop_blur_declaration' ],
										],
									],
									[
										'componentName' => 'divi/common',
										'props'         => [
											'attr'                => $attrs['flip']['advanced']['backSizeValue'] ?? [],
											'declarationFunction' => [ self::class, 'back_size_declaration' ],
										],
									],
								],
							],
						]
					),

					// Design tab > Flip Button / Flip Button Text, applied to the button.
					$elements->style(
						[
							'attrName' => 'flipButton',
						]
					),

					// Custom CSS goes last so it can override the module styles.
					CssStyle::style(
						[
							'selector'  => $args['orderClass'],
							'attr'      => $attrs['css'] ?? [],
							'cssFields' => self::custom_css(),
						]
					),
				],
			]
		);
	}

	/**
	 * Outputs the flip duration as a CSS custom property. Mirrors `style-declarations.ts`.
	 *
	 * @param array $params Declaration parameters; `attrValue` holds the duration, e.g. `600ms`.
	 *
	 * @return string
	 */
	public static function duration_declaration( $params ) {
		$duration = $params['attrValue'] ?? '';

		$style_declarations = new StyleDeclarations(
			[
				'returnType' => 'string',
				'important'  => false,
			]
		);

		if ( is_string( $duration ) && '' !== $duration ) {
			$style_declarations->add( '--d5fc-duration', $duration );
		}

		return $style_declarations->value();
	}

	/**
	 * Outputs the fixed size of the sliding back face as a CSS custom property. Mirrors
	 * `backSizeDeclaration` in `style-declarations.ts`.
	 *
	 * @param array $params Declaration parameters; `attrValue` holds the size, e.g. `50%`.
	 *
	 * @return string
	 */
	public static function back_size_declaration( $params ) {
		$size = $params['attrValue'] ?? '';

		$style_declarations = new StyleDeclarations(
			[
				'returnType' => 'string',
				'important'  => false,
			]
		);

		if ( is_string( $size ) && '' !== $size ) {
			$style_declarations->add( '--d5fc-back-size', $size );
		}

		return $style_declarations->value();
	}

	/**
	 * Outputs the backdrop blur of the sliding back face as a CSS custom property; nothing for 0.
	 * Mirrors `backdropBlurDeclaration` in `style-declarations.ts`.
	 *
	 * @param array $params Declaration parameters; `attrValue` holds the blur, e.g. `8px`.
	 *
	 * @return string
	 */
	public static function backdrop_blur_declaration( $params ) {
		$blur = $params['attrValue'] ?? '';

		$style_declarations = new StyleDeclarations(
			[
				'returnType' => 'string',
				'important'  => false,
			]
		);

		if ( is_string( $blur ) && 0.0 !== (float) $blur ) {
			$style_declarations->add( '--d5fc-backdrop', 'blur(' . $blur . ')' );
		}

		return $style_declarations->value();
	}

	/**
	 * Sets the script data for scroll effects, sticky, etc. Mirrors `module-script-data.tsx`.
	 *
	 * @param array $args Script data arguments passed by `Module::render()`.
	 */
	public static function module_script_data( $args ) {
		ElementScriptData::set(
			[
				'id'            => $args['id'] ?? '',
				'selector'      => $args['selector'] ?? '',
				'attrs'         => $args['attrs']['module']['decoration'] ?? [],
				'storeInstance' => $args['storeInstance'] ?? null,
			]
		);
	}

	/**
	 * Custom CSS fields from module.json. Mirrors `custom-css.ts`, without the labels.
	 *
	 * @return array
	 */
	public static function custom_css() {
		return \WP_Block_Type_Registry::get_instance()->get_registered( 'd5fc/flip-card' )->customCssFields;
	}
}
