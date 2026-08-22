<?php

namespace App\Helpers;

/**
 * Arabic text reshaper for DomPDF compatibility.
 *
 * DomPDF does not natively support Arabic glyph shaping.
 * This class converts Arabic Unicode text into its presentational (shaped/joined)
 * glyph form so that DomPDF + Amiri font can render it correctly.
 *
 * Based on the Arabic glyph shaping algorithm (Unicode Arabic Presentation Forms).
 */
class ArabicText
{
    // Arabic letter forms: [isolated, final, initial, medial]
    private static array $letterForms = [
        // Hamza forms
        0x0621 => [0xFE80, 0xFE80, 0xFE80, 0xFE80], // HAMZA
        0x0622 => [0xFE81, 0xFE82, 0xFE81, 0xFE82], // ALEF WITH MADDA ABOVE
        0x0623 => [0xFE83, 0xFE84, 0xFE83, 0xFE84], // ALEF WITH HAMZA ABOVE
        0x0624 => [0xFE85, 0xFE86, 0xFE85, 0xFE86], // WAW WITH HAMZA ABOVE
        0x0625 => [0xFE87, 0xFE88, 0xFE87, 0xFE88], // ALEF WITH HAMZA BELOW
        0x0626 => [0xFE89, 0xFE8A, 0xFE8B, 0xFE8C], // YEH WITH HAMZA ABOVE
        0x0627 => [0xFE8D, 0xFE8E, 0xFE8D, 0xFE8E], // ALEF
        0x0628 => [0xFE8F, 0xFE90, 0xFE91, 0xFE92], // BA
        0x0629 => [0xFE93, 0xFE94, 0xFE93, 0xFE94], // TA MARBUTA
        0x062A => [0xFE95, 0xFE96, 0xFE97, 0xFE98], // TA
        0x062B => [0xFE99, 0xFE9A, 0xFE9B, 0xFE9C], // THA
        0x062C => [0xFE9D, 0xFE9E, 0xFE9F, 0xFEA0], // JIM
        0x062D => [0xFEA1, 0xFEA2, 0xFEA3, 0xFEA4], // HA
        0x062E => [0xFEA5, 0xFEA6, 0xFEA7, 0xFEA8], // KHA
        0x062F => [0xFEA9, 0xFEAA, 0xFEA9, 0xFEAA], // DAL
        0x0630 => [0xFEAB, 0xFEAC, 0xFEAB, 0xFEAC], // DHAL
        0x0631 => [0xFEAD, 0xFEAE, 0xFEAD, 0xFEAE], // RA
        0x0632 => [0xFEAF, 0xFEB0, 0xFEAF, 0xFEB0], // ZAIN
        0x0633 => [0xFEB1, 0xFEB2, 0xFEB3, 0xFEB4], // SIN
        0x0634 => [0xFEB5, 0xFEB6, 0xFEB7, 0xFEB8], // SHIN
        0x0635 => [0xFEB9, 0xFEBA, 0xFEBB, 0xFEBC], // SAD
        0x0636 => [0xFEBD, 0xFEBE, 0xFEBF, 0xFEC0], // DAD
        0x0637 => [0xFEC1, 0xFEC2, 0xFEC3, 0xFEC4], // TA (heavy)
        0x0638 => [0xFEC5, 0xFEC6, 0xFEC7, 0xFEC8], // ZA (heavy)
        0x0639 => [0xFEC9, 0xFECA, 0xFECB, 0xFECC], // AIN
        0x063A => [0xFECD, 0xFECE, 0xFECF, 0xFED0], // GHAIN
        0x0641 => [0xFED1, 0xFED2, 0xFED3, 0xFED4], // FA
        0x0642 => [0xFED5, 0xFED6, 0xFED7, 0xFED8], // QAF
        0x0643 => [0xFED9, 0xFEDA, 0xFEDB, 0xFEDC], // KAF
        0x0644 => [0xFEDD, 0xFEDE, 0xFEDF, 0xFEE0], // LAM
        0x0645 => [0xFEE1, 0xFEE2, 0xFEE3, 0xFEE4], // MIM
        0x0646 => [0xFEE5, 0xFEE6, 0xFEE7, 0xFEE8], // NUN
        0x0647 => [0xFEE9, 0xFEEA, 0xFEEB, 0xFEEC], // HA
        0x0648 => [0xFEED, 0xFEEE, 0xFEED, 0xFEEE], // WAW
        0x0649 => [0xFEEF, 0xFEF0, 0xFEEF, 0xFEF0], // ALEF MAQSURA
        0x064A => [0xFEF1, 0xFEF2, 0xFEF3, 0xFEF4], // YEH
        // Special
        0x0644 => [0xFEDD, 0xFEDE, 0xFEDF, 0xFEE0], // LAM (duplicate for lam-alef)
    ];

    // Letters that do NOT connect on the left (no medial/initial forms)
    private static array $rightJoinOnly = [
        0x0621, 0x0622, 0x0623, 0x0624, 0x0625, 0x0627,
        0x0629, 0x062F, 0x0630, 0x0631, 0x0632, 0x0648, 0x0649,
    ];

    /**
     * Reshape Arabic text for proper rendering in DomPDF.
     * Converts logical-order Arabic text to visual presentation form.
     */
    public static function reshape(string $text): string
    {
        if (empty($text)) return $text;

        // Split text into characters (handling multibyte UTF-8)
        $chars = self::mbStrSplit($text);
        $result = [];
        $len = count($chars);

        for ($i = 0; $i < $len; $i++) {
            $code = self::mbOrd($chars[$i]);

            if (!isset(self::$letterForms[$code])) {
                $result[] = $chars[$i];
                continue;
            }

            $prevCode = $i > 0 ? self::mbOrd($chars[$i - 1]) : 0;
            $nextCode = $i < $len - 1 ? self::mbOrd($chars[$i + 1]) : 0;

            $prevIsArabic = isset(self::$letterForms[$prevCode]) && !in_array($prevCode, self::$rightJoinOnly);
            $nextIsArabic = isset(self::$letterForms[$nextCode]);
            $isRightOnly  = in_array($code, self::$rightJoinOnly);

            if ($prevIsArabic && $nextIsArabic && !$isRightOnly) {
                // Medial form
                $glyph = self::$letterForms[$code][3];
            } elseif ($prevIsArabic && !$nextIsArabic) {
                // Final form
                $glyph = self::$letterForms[$code][1];
            } elseif (!$prevIsArabic && $nextIsArabic && !$isRightOnly) {
                // Initial form
                $glyph = self::$letterForms[$code][2];
            } else {
                // Isolated form
                $glyph = self::$letterForms[$code][0];
            }

            $result[] = self::mbChr($glyph);
        }

        // Reverse for RTL visual display (DomPDF doesn't handle BiDi)
        return implode('', array_reverse($result));
    }

    /**
     * Reverse Arabic words within a string for RTL display in DomPDF.
     * Useful for short labels/strings.
     */
    public static function rtl(string $text): string
    {
        // Split by spaces, reverse word order
        $words = explode(' ', $text);
        return implode(' ', array_reverse($words));
    }

    private static function mbStrSplit(string $string): array
    {
        $chars = [];
        $len = mb_strlen($string, 'UTF-8');
        for ($i = 0; $i < $len; $i++) {
            $chars[] = mb_substr($string, $i, 1, 'UTF-8');
        }
        return $chars;
    }

    private static function mbOrd(string $char): int
    {
        $ord = ord($char[0]);
        if ($ord < 128) return $ord;
        if ($ord < 224) return ($ord - 192) * 64 + (ord($char[1]) - 128);
        if ($ord < 240) return ($ord - 224) * 4096 + (ord($char[1]) - 128) * 64 + (ord($char[2]) - 128);
        return ($ord - 240) * 262144 + (ord($char[1]) - 128) * 4096 + (ord($char[2]) - 128) * 64 + (ord($char[3]) - 128);
    }

    private static function mbChr(int $code): string
    {
        if ($code < 128) return chr($code);
        if ($code < 2048) return chr(192 + ($code >> 6)) . chr(128 + ($code & 63));
        if ($code < 65536) return chr(224 + ($code >> 12)) . chr(128 + (($code >> 6) & 63)) . chr(128 + ($code & 63));
        return chr(240 + ($code >> 18)) . chr(128 + (($code >> 12) & 63)) . chr(128 + (($code >> 6) & 63)) . chr(128 + ($code & 63));
    }
}
