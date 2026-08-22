<?php

namespace App\Domain\Report\Console\Commands;

use App\Domain\Contract\Models\Contract;
use App\Domain\Payment\Models\RentTransaction;
use App\Domain\Report\Mail\MonthlyDuesMail;
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

        if ($dues->isEmpty()) {
            $this->info('No outstanding monthly dues found.');

            return self::SUCCESS;
        }

        try {
            Mail::to($recipient)->send(new MonthlyDuesMail($dues));
            $this->info("Monthly dues alert sent for {$dues->count()} contracts to {$recipient}.");
            Log::info('Monthly dues alert emailed', [
                'count'     => $dues->count(),
                'recipient' => $recipient,
            ]);
        } catch (\Exception $e) {
            $this->error('Failed to send mail: ' . $e->getMessage());
            Log::error('Monthly dues alert mail failed: ' . $e->getMessage());

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}