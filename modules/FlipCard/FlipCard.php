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
				) . $inner,
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
								],
							],
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
