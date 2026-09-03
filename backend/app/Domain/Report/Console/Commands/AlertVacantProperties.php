<?php

namespace App\Domain\Report\Console\Commands;

use App\Domain\Auth\Models\User;
use App\Domain\Property\Models\Unit;
use App\Domain\Report\Mail\VacantPropertiesMail;
use App\Domain\Report\Models\NotificationLog;
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

        if ($vacant->isEmpty()) {
            $this->info('No vacant (AVAILABLE) units found.');
            NotificationLog::create([
                'type'         => 'vacant_properties',
                'recipient_id' => $adminId,
                'message'      => 'Checked: No vacant units found.',
                'status'       => 'checked',
                'sent_at'      => now(),
            ]);

            return self::SUCCESS;
        }

        try {
            Mail::to($recipient)->send(new VacantPropertiesMail($vacant));
            $msg = "Vacant properties alert sent for {$vacant->count()} units to {$recipient}.";
            $this->info($msg);
            Log::info('Vacant property alert emailed', [
                'count'     => $vacant->count(),
                'recipient' => $recipient,
            ]);

            NotificationLog::create([
                'type'         => 'vacant_properties',
                'recipient_id' => $adminId,
                'message'      => $msg,
                'status'       => 'sent',
                'sent_at'      => now(),
            ]);
        } catch (\Exception $e) {
            $this->error('Failed to send mail: ' . $e->getMessage());
            Log::error('Vacant property alert mail failed: ' . $e->getMessage());

            NotificationLog::create([
                'type'         => 'vacant_properties',
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