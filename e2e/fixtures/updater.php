<?php
// Used by tests/updater.mjs through `wp eval-file`: describes the update checker as registered.
$checker = D5FC\Modules\Updater\Updater::register();
$api     = $checker ? $checker->getVcsApi() : null;

echo wp_json_encode(
	[
		'checker' => $checker ? get_class( $checker ) : null,
		'slug'    => $checker ? $checker->slug : null,
		'repo'    => $api ? $api->getRepositoryUrl() : null,
		'assets'  => $api && method_exists( $api, 'enableReleaseAssets' ),
	]
);
