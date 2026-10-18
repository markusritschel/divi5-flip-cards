<?php
/**
 * Updates from GitHub releases via Plugin Update Checker (vendor/, shipped in the release ZIP).
 * Missing library or any error: no update checks, nothing else changes.
 *
 * @package D5FC\Modules\Updater
 */

namespace D5FC\Modules\Updater;

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Direct access forbidden.' );
}

/**
 * Registers the update checker for this plugin.
 */
final class Updater {

	const REPOSITORY = 'https://github.com/markusritschel/divi5-flip-cards/';

	/**
	 * Release asset built by .github/workflows/release.yml (contains vendor/).
	 */
	const ASSET = '/^divi5-flip-cards-v[\d.]+\.zip$/';

	/**
	 * Registers the checker; independent of Divi, so updates keep working when Divi is off.
	 *
	 * @return object|null The update checker, or null when it can't be set up.
	 */
	public static function register() {
		$factory = '\YahnisElsts\PluginUpdateChecker\v5\PucFactory';

		if ( ! class_exists( $factory ) ) {
			return null;
		}

		try {
			$checker = $factory::buildUpdateChecker( self::REPOSITORY, D5FC_FILE, 'divi5-flip-cards' );
			$api     = $checker->getVcsApi();

			if ( method_exists( $api, 'enableReleaseAssets' ) ) {
				$api->enableReleaseAssets( self::ASSET );
			}

			return $checker;
		} catch ( \Throwable $e ) {
			return null; // Updates are a convenience; never let them break the site.
		}
	}
}
