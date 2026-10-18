<?php
/**
 * Plugin Name:       Flip Cards for Divi 5
 * Plugin URI:        https://github.com/markusritschel/divi5-flip-cards
 * Description:       A flip card module for Divi 5. Put any Divi modules on the front and the back.
 * Version:           0.3.0
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Author:            Markus Ritschel
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       divi5-flip-cards
 * Domain Path:       /languages
 * Update URI:        https://github.com/markusritschel/divi5-flip-cards
 *
 * @package D5FC
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Direct access forbidden.' );
}

define( 'D5FC_VERSION', '0.3.0' );
define( 'D5FC_FILE', __FILE__ );
define( 'D5FC_PATH', plugin_dir_path( __FILE__ ) );
define( 'D5FC_URL', plugin_dir_url( __FILE__ ) );
define( 'D5FC_MODULES_JSON_PATH', D5FC_PATH . 'build/modules-json/' );

/**
 * PSR-4 autoloader for the `D5FC\Modules\` namespace, which maps to the `modules/` folder.
 */
spl_autoload_register(
	function ( $class_name ) {
		$prefix = 'D5FC\\Modules\\';

		if ( 0 !== strpos( $class_name, $prefix ) ) {
			return;
		}

		$file = D5FC_PATH . 'modules/' . str_replace( '\\', '/', substr( $class_name, strlen( $prefix ) ) ) . '.php';

		if ( is_readable( $file ) ) {
			require $file;
		}
	}
);

/*
 * Divi classes the modules call. If a Divi update renames or removes one, the modules stay
 * unregistered and admins get a warning, instead of every page failing with a fatal error.
 * Defining the constant earlier (e.g. in wp-config.php) replaces the list; the browser tests use
 * that to simulate a missing class.
 */
if ( ! defined( 'D5FC_REQUIRED_CLASSES' ) ) {
	define(
		'D5FC_REQUIRED_CLASSES',
		[
			'ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface',
			'ET\Builder\Framework\Utility\HTMLUtility',
			'ET\Builder\FrontEnd\BlockParser\BlockParserStore',
			'ET\Builder\FrontEnd\Module\Style',
			'ET\Builder\Packages\IconLibrary\IconFont\Utils',
			'ET\Builder\Packages\Module\Module',
			'ET\Builder\Packages\Module\Options\Css\CssStyle',
			'ET\Builder\Packages\Module\Options\Element\ElementScriptData',
			'ET\Builder\Packages\Module\Options\Text\TextClassnames',
			'ET\Builder\Packages\ModuleLibrary\ModuleRegistration',
			'ET\Builder\Packages\ModuleUtils\ChildrenUtils',
			'ET\Builder\Packages\ModuleUtils\ModuleUtils',
			'ET\Builder\Packages\StyleLibrary\Utils\StyleDeclarations',
			'ET\Builder\VisualBuilder\Assets\PackageBuildManager',
		]
	);
}

/**
 * What the modules need but can't find: Divi classes from `D5FC_REQUIRED_CLASSES`, and the build
 * output the modules are registered from.
 *
 * @return string[] Empty when everything is there.
 */
function d5fc_missing_requirements() {
	$missing = array_values(
		array_filter(
			D5FC_REQUIRED_CLASSES,
			function ( $name ) {
				return ! class_exists( $name ) && ! interface_exists( $name );
			}
		)
	);

	foreach ( [ 'flip-card', 'flip-card-face' ] as $module ) {
		if ( ! is_readable( D5FC_MODULES_JSON_PATH . $module . '/module.json' ) ) {
			$missing[] = 'build/modules-json/' . $module . '/module.json';
		}
	}

	return $missing;
}

require D5FC_PATH . 'modules/Modules.php';

D5FC\Modules\StarterLayouts\StarterLayouts::load();

// Composer dependencies (Plugin Update Checker); absent in a plain git checkout.
if ( is_readable( D5FC_PATH . 'vendor/autoload.php' ) ) {
	require_once D5FC_PATH . 'vendor/autoload.php';
}

// Updates from GitHub releases; independent of Divi, so they keep working when Divi is off.
D5FC\Modules\Updater\Updater::register();

/**
 * Version string for an asset: the file's modification time, so browsers pick up new builds.
 *
 * @param string $relative_path Path relative to the plugin folder.
 *
 * @return string
 */
function d5fc_asset_version( $relative_path ) {
	$file = D5FC_PATH . $relative_path;

	return file_exists( $file ) ? D5FC_VERSION . '.' . filemtime( $file ) : D5FC_VERSION;
}

/**
 * Loads the plugin translations.
 */
function d5fc_load_textdomain() {
	load_plugin_textdomain( 'divi5-flip-cards', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}
add_action( 'init', 'd5fc_load_textdomain' );

/**
 * Registers the Visual Builder script and builder-only styles.
 */
function d5fc_enqueue_visual_builder_assets() {
	if ( ! et_builder_d5_enabled() || ! et_core_is_fb_enabled() || d5fc_missing_requirements() ) {
		return;
	}

	\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
		[
			'name'    => 'divi5-flip-cards-builder-script',
			'version' => d5fc_asset_version( 'build/bundle.js' ),
			'script'  => [
				'src'                => D5FC_URL . 'build/bundle.js',
				'deps'               => [
					'divi-module-library',
					'divi-vendor-wp-hooks',
				],
				'enqueue_top_window' => false,
				'enqueue_app_window' => true,
			],
		]
	);

	\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
		[
			'name'    => 'divi5-flip-cards-builder-style',
			'version' => d5fc_asset_version( 'build/vb-bundle.css' ),
			'style'   => [
				'src'                => D5FC_URL . 'build/vb-bundle.css',
				'deps'               => [],
				'enqueue_top_window' => false,
				'enqueue_app_window' => true,
			],
		]
	);
}
add_action( 'divi_visual_builder_assets_before_enqueue_scripts', 'd5fc_enqueue_visual_builder_assets' );

/**
 * Enqueues the module styles on the front end (the builder's app window is a front-end page too),
 * and the front-end script outside the builder.
 */
function d5fc_enqueue_frontend_assets() {
	wp_enqueue_style(
		'divi5-flip-cards',
		D5FC_URL . 'build/bundle.css',
		[],
		d5fc_asset_version( 'build/bundle.css' )
	);

	if ( function_exists( 'et_core_is_fb_enabled' ) && et_core_is_fb_enabled() ) {
		return;
	}

	wp_enqueue_script(
		'divi5-flip-cards-frontend',
		D5FC_URL . 'build/frontend.js',
		[],
		d5fc_asset_version( 'build/frontend.js' ),
		[
			'strategy'  => 'defer',
			'in_footer' => true,
		]
	);
}
add_action( 'wp_enqueue_scripts', 'd5fc_enqueue_frontend_assets' );

/**
 * Whether Divi 5 is running (as the Divi/Extra theme or through the builder).
 *
 * @return bool
 */
function d5fc_is_divi5_active() {
	if ( function_exists( 'et_builder_d5_enabled' ) && et_builder_d5_enabled() ) {
		return true;
	}

	$theme = wp_get_theme( get_template() );

	return in_array( $theme->get( 'Name' ), [ 'Divi', 'Extra' ], true )
		&& version_compare( (string) $theme->get( 'Version' ), '5.0', '>=' );
}

/**
 * Tells administrators when Divi 5 is missing, because the modules then do nothing.
 */
function d5fc_missing_divi_notice() {
	if ( ! current_user_can( 'activate_plugins' ) || d5fc_is_divi5_active() ) {
		return;
	}

	printf(
		'<div class="notice notice-warning"><p>%s</p></div>',
		esc_html__( 'Flip Cards for Divi 5 needs Divi 5. The Flip Card module is only available while a Divi 5 theme or builder is active.', 'divi5-flip-cards' )
	);
}
add_action( 'admin_notices', 'd5fc_missing_divi_notice' );

/**
 * Tells administrators when Divi 5 is there but lacks parts the modules need (see
 * `d5fc_missing_requirements()`), so the modules are switched off.
 */
function d5fc_missing_requirements_notice() {
	if ( ! current_user_can( 'activate_plugins' ) || ! d5fc_is_divi5_active() ) {
		return;
	}

	$missing = d5fc_missing_requirements();

	if ( ! $missing ) {
		return;
	}

	printf(
		'<div class="notice notice-error"><p><strong>%1$s</strong> %2$s</p><p>%3$s <code>%4$s</code></p></div>',
		esc_html__( 'Flip Cards for Divi 5 is switched off.', 'divi5-flip-cards' ),
		esc_html__( 'This Divi version lacks parts the Flip Card modules need, so they are turned off to keep your pages working. Your cards are safe: their content shows as plain modules until an updated version of the plugin is installed.', 'divi5-flip-cards' ),
		esc_html__( 'Missing:', 'divi5-flip-cards' ),
		esc_html( implode( ', ', $missing ) )
	);
}
add_action( 'admin_notices', 'd5fc_missing_requirements_notice' );
