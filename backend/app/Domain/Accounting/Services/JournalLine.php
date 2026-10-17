<?php

namespace App\Domain\Accounting\Services;

final class JournalLine
{
    public function __construct(
        public readonly int $chartAccountId,
        public readonly string $debit,
        public readonly string $credit,
    ) {
    }
}
