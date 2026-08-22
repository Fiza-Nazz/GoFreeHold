<?php

namespace App\Domain\Report\Console\Commands;

use App\Domain\Contract\Models\Contract;
use App\Domain\Report\Mail\ContractExpiryMail;
use App\Domain\Report\Models\NotificationSetting;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class AlertContractExpiry extends Command
{
    protected $signature = 'alert:contract-expiry';
    protected $description = 'Send email alerts for contracts expiring in ~100 days';

    public function handle(): int
    {
        $setting = NotificationSetting::where('key', 'contract_expiry')->first();
        if ($setting && !$setting->enabled) {
            $this->info('Contract expiry alerts disabled in settings.');

            return self::SUCCESS;
        }

        $days = $setting?->days_before_expiry ?? 100;
        $recipient = $setting?->recipient_email ?? 'admin@gofreehold.ae';
        $threshold = Carbon::now()->addDays($days);

        $expiring = Contract::with('tenant', 'unit')
            ->where('status', 'active')
            ->whereDate('end_date', '<=', $threshold)
            ->get();

        if ($expiring->count() > 0) {
            try {
                Mail::to($recipient)->send(new ContractExpiryMail($expiring));
                $this->info("Expiry alert email sent for {$expiring->count()} contracts to {$recipient}.");
            } catch (\Exception $e) {
                $this->error('Failed to send mail (configurable SMTP driver active): ' . $e->getMessage());

                return self::FAILURE;
            }
        } else {
            $this->info('No expiring contracts found.');
        }

        return self::SUCCESS;
    }
}