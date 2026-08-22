<?php

namespace App\Domain\Report\Console\Commands;

use App\Domain\Contract\Models\ContractCheque;
use App\Domain\Report\Mail\PendingChequeMail;
use App\Domain\Report\Models\NotificationSetting;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class AlertPendingCheques extends Command
{
    protected $signature = 'alert:pending-cheques';
    protected $description = 'Send email alerts for pending PDC cheques due soon';

    public function handle(): int
    {
        $setting = NotificationSetting::where('key', 'pending_cheques')->first();
        if ($setting && !$setting->enabled) {
            $this->info('Pending cheque alerts disabled.');

            return self::SUCCESS;
        }

        $days = $setting?->days_before_expiry ?? 7;
        $recipient = $setting?->recipient_email ?? 'finance@gofreehold.ae';
        $threshold = Carbon::now()->addDays($days);

        $pending = ContractCheque::where('status', 'pending')
            ->whereDate('due_date', '<=', $threshold)
            ->get();

        if ($pending->count() > 0) {
            try {
                Mail::to($recipient)->send(new PendingChequeMail($pending));
                $this->info("Pending cheques alert sent for {$pending->count()} cheques to {$recipient}.");
            } catch (\Exception $e) {
                $this->error('Failed to send mail: ' . $e->getMessage());

                return self::FAILURE;
            }
        } else {
            $this->info('No pending cheques due soon.');
        }

        return self::SUCCESS;
    }
}