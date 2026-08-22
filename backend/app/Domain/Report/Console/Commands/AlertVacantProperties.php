<?php

namespace App\Domain\Report\Console\Commands;

use App\Domain\Property\Models\Unit;
use App\Domain\Report\Mail\VacantPropertiesMail;
use App\Domain\Report\Models\NotificationSetting;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AlertVacantProperties extends Command
{
    protected $signature = 'alert:vacant-properties';
    protected $description = 'Send email alerts for vacant properties summary';

    public function handle(): int
    {
        $setting = NotificationSetting::where('key', 'vacant_properties')->first();
        if ($setting && !$setting->enabled) {
            $this->info('Vacant property alerts disabled.');

            return self::SUCCESS;
        }

        $recipient = $setting?->recipient_email ?? 'admin@gofreehold.ae';

        $vacant = Unit::with('property:id,name')
            ->where('status', 'AVAILABLE')
            ->orderBy('property_id')
            ->orderBy('number')
            ->get();

        if ($vacant->isEmpty()) {
            $this->info('No vacant (AVAILABLE) units found.');

            return self::SUCCESS;
        }

        try {
            Mail::to($recipient)->send(new VacantPropertiesMail($vacant));
            $this->info("Vacant properties alert sent for {$vacant->count()} units to {$recipient}.");
            Log::info('Vacant property alert emailed', [
                'count'     => $vacant->count(),
                'recipient' => $recipient,
            ]);
        } catch (\Exception $e) {
            $this->error('Failed to send mail: ' . $e->getMessage());
            Log::error('Vacant property alert mail failed: ' . $e->getMessage());

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}