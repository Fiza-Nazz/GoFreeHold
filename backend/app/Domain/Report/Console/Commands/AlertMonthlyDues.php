<?php

namespace App\Domain\Report\Console\Commands;

use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\Contract;
use App\Domain\Payment\Models\RentTransaction;
use App\Domain\Report\Mail\MonthlyDuesMail;
use App\Domain\Report\Models\NotificationLog;
use App\Domain\Report\Models\NotificationSetting;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AlertMonthlyDues extends Command
{
    protected $signature = 'alert:monthly-dues';
    protected $description = 'Send monthly due posting notification alerts';

    public function handle(): int
    {
        $setting = NotificationSetting::where('key', 'monthly_dues')->first();
        if ($setting && !$setting->enabled) {
            $this->info('Monthly dues alerts disabled.');

            return self::SUCCESS;
        }

        $recipient = $setting?->recipient_email ?? 'billing@gofreehold.ae';

        $contracts = Contract::with(['unit:id,number,property_id', 'unit.property:id,name', 'tenant:id,name'])
            ->whereIn('status', ['active', 'renewed'])
            ->get();

        $dues = $contracts->map(function (Contract $contract) {
            $outstanding = (float) RentTransaction::where('contract_id', $contract->id)
                ->selectRaw('COALESCE(SUM(debit) - SUM(credit), 0) as bal')
                ->value('bal');

            if ($outstanding <= 0) {
                return null;
            }

            return [
                'contract_id'   => $contract->id,
                'tenant_name'   => $contract->tenant?->name,
                'unit_number'   => $contract->unit?->number,
                'property_name' => $contract->unit?->property?->name,
                'outstanding'   => $outstanding,
            ];
        })->filter()->values();

        $adminUser = User::where('email', $recipient)->first() ?? User::where('role', 'admin')->first() ?? User::first();
        if (!$adminUser) {
            $adminUser = User::create([
                'name'     => 'System Admin',
                'email'    => $recipient ?: 'billing@gofreehold.ae',
                'password' => bcrypt('password123'),
                'role'     => 'admin',
            ]);
        }
        $adminId = $adminUser->id;

        if ($dues->isEmpty()) {
            $this->info('No outstanding monthly dues found.');
            NotificationLog::create([
                'type'         => 'monthly_dues',
                'recipient_id' => $adminId,
                'message'      => 'Checked: No outstanding monthly dues found.',
                'status'       => 'checked',
                'sent_at'      => now(),
            ]);

            return self::SUCCESS;
        }

        try {
            Mail::to($recipient)->send(new MonthlyDuesMail($dues));
            $msg = "Monthly dues alert sent for {$dues->count()} contracts to {$recipient}.";
            $this->info($msg);
            Log::info('Monthly dues alert emailed', [
                'count'     => $dues->count(),
                'recipient' => $recipient,
            ]);

            NotificationLog::create([
                'type'         => 'monthly_dues',
                'recipient_id' => $adminId,
                'message'      => $msg,
                'status'       => 'sent',
                'sent_at'      => now(),
            ]);
        } catch (\Exception $e) {
            $this->error('Failed to send mail: ' . $e->getMessage());
            Log::error('Monthly dues alert mail failed: ' . $e->getMessage());

            NotificationLog::create([
                'type'         => 'monthly_dues',
                'recipient_id' => $adminId,
                'message'      => 'Failed: ' . $e->getMessage(),
                'status'       => 'failed',
                'sent_at'      => now(),
            ]);

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}