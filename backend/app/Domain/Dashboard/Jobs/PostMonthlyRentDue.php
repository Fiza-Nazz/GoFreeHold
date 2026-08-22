<?php

namespace App\Domain\Dashboard\Jobs;

use App\Domain\Dashboard\Services\PostMonthlyRentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Scheduled / dispatchable job: post monthly rent dues into rent_transactions.
 */
class PostMonthlyRentDue implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @return array{posted: int, skipped: int, month: string}
     */
    public function handle(PostMonthlyRentService $service): array
    {
        return $service->postForCurrentMonth();
    }
}
