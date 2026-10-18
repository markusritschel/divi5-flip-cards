<?php
/**
 * Ready-made Flip Cards in the Divi Library ("Add From Library" when inserting a module).
 *
 * @package D5FC\Modules\StarterLayouts
 */

namespace D5FC\Modules\StarterLayouts;

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Direct access forbidden.' );
}

/**
 * Creates the starter cards as module-type Divi Library items, once.
 *
 * Each design is offered once, by the plugin version that introduced it ("since"): a newer set
 * only adds its new designs, and a design the user deleted is not brought back. The block markup
 * lives in `layouts/<slug>.html`.
 */
class StarterLayouts {

	/**
	 * Option holding the newest design set already offered.
	 */
	const OPTION = 'd5fc_starter_layouts';

	/**
	 * Post meta marking a library item as one of these designs (value: the slug).
	 */
	const META = '_d5fc_starter_layout';

	/**
	 * The designs: slug => [ title, set version that introduced it ].
	 *
	 * @return array
	 */
	public static function layouts() {
		return [
			'icon-text'      => [ __( 'Flip Card – Icon + Text', 'divi5-flip-cards' ), 1 ],
			'bold-statement' => [ __( 'Flip Card – Bold Statement', 'divi5-flip-cards' ), 1 ],
			'feature-list'   => [ __( 'Flip Card – Feature List', 'divi5-flip-cards' ), 1 ],
			'call-to-action' => [ __( 'Flip Card – Call to Action', 'divi5-flip-cards' ), 1 ],
		];
	}

	/**
	 * Hooks the creation into requests by editors. Divi registers its library only on some
	 * screens (the Visual Builder, "Add New" screens, the Divi Library, Divi's options), so it
	 * runs on the first such request; until then the option check keeps it cheap.
	 */
	public static function load() {
		add_action( 'wp_loaded', [ self::class, 'maybe_create' ] );
	}

	/**
	 * Creates the designs newer than the set already offered, if Divi's library is available.
	 */
	public static function maybe_create() {
		$offered = (int) get_option( self::OPTION, 0 );
		$newest  = max( array_column( self::layouts(), 1 ) );

		if ( $offered >= $newest || ! current_user_can( 'edit_posts' ) ) {
			return;
		}

		if ( ! post_type_exists( 'et_pb_layout' ) || ! taxonomy_exists( 'layout_type' ) || d5fc_missing_requirements() ) {
			return;
		}

		foreach ( self::layouts() as $slug => list( $title, $since ) ) {
			if ( $since > $offered ) {
				self::create( $slug, $title );
			}
		}

		update_option( self::OPTION, $newest );
	}

	/**
	 * Creates one design, unless a library item for it already exists (in any status).
	 *
	 * @param string $slug  Design slug (file name in `layouts/`).
	 * @param string $title Library item title.
	 */
	private static function create( $slug, $title ) {
		$existing = get_posts(
			[
				'post_type'      => 'et_pb_layout',
				'post_status'    => 'any',
				'meta_key'       => self::META, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
				'meta_value'     => $slug, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
				'fields'         => 'ids',
				'posts_per_page' => 1,
			]
		);

		$file = __DIR__ . '/layouts/' . $slug . '.html';

		if ( $existing || ! is_readable( $file ) ) {
			return;
		}

		// Divi's own format for a module item: the module block inside `divi/placeholder`.
		$post_id = wp_insert_post(
			[
				'post_type'    => 'et_pb_layout',
				'post_status'  => 'publish',
				'post_title'   => $title,
				'post_content' => wp_slash( trim( (string) file_get_contents( $file ) ) ), // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			]
		);

		if ( ! $post_id || is_wp_error( $post_id ) ) {
			return;
		}

		wp_set_object_terms( $post_id, 'module', 'layout_type' );
		wp_set_object_terms( $post_id, 'not_global', 'scope' );
		wp_set_object_terms( $post_id, 'regular', 'module_width' );
		wp_set_object_terms( $post_id, 'local', 'layout_location' );
		wp_set_object_terms( $post_id, __( 'Flip Cards', 'divi5-flip-cards' ), 'layout_category' );

		update_post_meta( $post_id, '_et_pb_module_type', 'd5fc/flip-card' );
		update_post_meta( $post_id, '_et_pb_built_for_post_type', 'page' );
		update_post_meta( $post_id, '_et_pb_template_type', 'module' );
		update_post_meta( $post_id, '_et_pb_use_divi_5', 'on' );
		update_post_meta( $post_id, self::META, $slug );
	}
}
