<?php
/**
 * Face module (one side of a Flip Card): registration and front-end rendering.
 *
 * Each method mirrors a file in src/components/flip-card-face/ (named in its doc comment);
 * keep the two in sync.
 *
 * @package D5FC\Modules\FlipCardFace
 */

namespace D5FC\Modules\FlipCardFace;

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Direct access forbidden.' );
}

// phpcs:disable ET.Sniffs.ValidVariableName.UsedPropertyNotSnakeCase -- WP uses camelCase in \WP_Block_Parser_Block.

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\FrontEnd\Module\Style;
use ET\Builder\Packages\Module\Module;
use ET\Builder\Packages\Module\Options\Css\CssStyle;
use ET\Builder\Packages\Module\Options\Element\ElementScriptData;
use ET\Builder\Packages\Module\Options\Text\TextClassnames;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;
use ET\Builder\Packages\ModuleUtils\ChildrenUtils;
use ET\Builder\Packages\ModuleUtils\ModuleUtils;

/**
 * Face module.
 */
class FlipCardFace implements DependencyInterface {

	/**
	 * Registers the module and its render callback.
	 */
	public function load() {
		add_action(
			'init',
			function () {
				ModuleRegistration::register_module(
					D5FC_MODULES_JSON_PATH . 'flip-card-face/',
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
	 * @param string                                                                   $content  Rendered child modules.
	 * @param \WP_Block                                                                $block    Parsed block being rendered.
	 * @param \ET\Builder\Packages\Module\Layout\Components\ModuleElements\ModuleElements $elements ModuleElements instance.
	 *
	 * @return string
	 */
	public static function render_callback( $attrs, $content, $block, $elements ) {
		$parent = BlockParserStore::get_parent( $block->parsed_block['id'], $block->parsed_block['storeInstance'] );

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
				'parentAttrs'         => ModuleUtils::get_all_attrs( $parent ),
				'parentId'            => $parent->id ?? '',
				'parentName'          => $parent->blockName ?? '',
				'children'            => $elements->style_components(
					[
						'attrName' => 'module',
					]
				) . $content,
				'childrenIds'         => ChildrenUtils::extract_children_ids( $block ),
			]
		);
	}

	/**
	 * Adds the module classes. Mirrors `module-classnames.ts`.
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
	}

	/**
	 * Adds the module styles. Mirrors `styles.tsx`.
	 *
	 * @param array $args Style arguments passed by `Module::render()`.
	 */
	public static function module_styles( $args ) {
		$attrs    = $args['attrs'] ?? [];
		$elements = $args['elements'];

		Style::add(
			[
				'id'            => $args['id'],
				'name'          => $args['name'],
				'orderIndex'    => $args['orderIndex'],
				'storeInstance' => $args['storeInstance'],
				'styles'        => [
					$elements->style(
						[
							'attrName' => 'module',
						]
					),

					// Custom CSS goes last so it can override the module styles.
					CssStyle::style(
						[
							'selector'  => $args['orderClass'],
							'attr'      => $attrs['css'] ?? [],
							'cssFields' => [],
						]
					),
				],
			]
		);
	}

	/**
	 * Sets the script data. Mirrors `module-script-data.tsx`.
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
}
