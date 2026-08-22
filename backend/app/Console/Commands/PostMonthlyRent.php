<?php

namespace App\Console\Commands;

use App\Domain\Dashboard\Jobs\PostMonthlyRentDue;
use App\Domain\Dashboard\Services\PostMonthlyRentService;
use Illuminate\Console\Command;

/**
 * Artisan entry-point for Domain\Dashboard monthly rent posting.
 * Keeps signature rent:post-monthly for scheduler + manual verification.
 */
class PostMonthlyRent extends Command
{
    protected $signature = 'rent:post-monthly';

    protected $description = 'Post monthly rent dues as debit entries on rent_transactions for active contracts';

    public function handle(PostMonthlyRentService $service): int
    {
        $this->info('Starting monthly rent posting process...');

        $result = (new PostMonthlyRentDue)->handle($service);

        $this->info(sprintf(
            'Rent posting complete for %s. Posted=%d, skipped(idempotent)=%d.',
            $result['month'],
            $result['posted'],
            $result['skipped']
        ));

        return self::SUCCESS;
    }
}
