<?php

namespace App\Helpers;

require_once __DIR__ . '/ArPHP/src/Arabic.php';

class ArHelper
{
    private static ?\ArPHP\I18N\Arabic $arabic = null;

    /**
     * Reshape Arabic string into visual glyphs for DomPDF rendering.
     */
    public static function ar(string $text): string
    {
        if (empty($text)) {
            return '';
        }

        if (self::$arabic === null) {
            // Temporarily suppress deprecation warnings during ArPHP execution on PHP 8.x
            $prev = error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE);
            self::$arabic = new \ArPHP\I18N\Arabic();
            error_reporting($prev);
        }

        $prev = error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE);
        $shaped = self::$arabic->utf8Glyphs($text);
        error_reporting($prev);

        return $shaped;
    }
}
