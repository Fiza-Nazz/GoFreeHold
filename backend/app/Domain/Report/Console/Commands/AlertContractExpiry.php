<?php

namespace App\Domain\Report\Console\Commands;

use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\Contract;
use App\Domain\Report\Mail\ContractExpiryMail;
use App\Domain\Report\Models\NotificationLog;
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

        $adminUser = User::where('email', $recipient)->first() ?? User::where('role', 'admin')->first() ?? User::first();
        if (!$adminUser) {
            $adminUser = User::create([
                'name'     => 'System Admin',
                'email'    => $recipient ?: 'admin@gofreehold.ae',
                'password' => bcrypt('password123'),
                'role'     => 'admin',
            ]);
        }
        $adminId = $adminUser->id;

        if ($expiring->count() > 0) {
            try {
                Mail::to($recipient)->send(new ContractExpiryMail($expiring));
                $msg = "Expiry alert sent for {$expiring->count()} contracts to {$recipient}.";
                $this->info($msg);

                NotificationLog::create([
                    'type'         => 'contract_expiry',
                    'recipient_id' => $adminId,
                    'message'      => $msg,
                    'status'       => 'sent',
                    'sent_at'      => now(),
                ]);
            } catch (\Exception $e) {
                $this->error('Failed to send mail (configurable SMTP driver active): ' . $e->getMessage());

                NotificationLog::create([
                    'type'         => 'contract_expiry',
                    'recipient_id' => $adminId,
                    'message'      => 'Failed: ' . $e->getMessage(),
                    'status'       => 'failed',
                    'sent_at'      => now(),
                ]);

                return self::FAILURE;
            }
        } else {
            $this->info('No expiring contracts found.');
            NotificationLog::create([
                'type'         => 'contract_expiry',
                'recipient_id' => $adminId,
                'message'      => 'Checked: No expiring contracts within threshold (' . $days . ' days).',
                'status'       => 'checked',
                'sent_at'      => now(),
            ]);
        }

        return self::SUCCESS;
    }
}