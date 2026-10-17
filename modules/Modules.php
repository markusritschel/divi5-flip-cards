<?php
/**
 * Registers the modules with Divi 5's dependency tree.
 *
 * @package D5FC\Modules
 */

namespace D5FC\Modules;

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Direct access forbidden.' );
}

use D5FC\Modules\FlipCard\FlipCard;
use D5FC\Modules\FlipCardFace\FlipCardFace;

add_action(
	'divi_module_library_modules_dependency_tree',
	function ( $dependency_tree ) {
		$dependency_tree->add_dependency( new FlipCardFace() );
		$dependency_tree->add_dependency( new FlipCard() );
	}
);
