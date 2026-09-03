<?php

namespace App\Domain\Report\Console\Commands;

use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\ContractCheque;
use App\Domain\Report\Mail\PendingChequeMail;
use App\Domain\Report\Models\NotificationLog;
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

        $adminUser = User::where('email', $recipient)->first() ?? User::where('role', 'admin')->first() ?? User::first();
        if (!$adminUser) {
            $adminUser = User::create([
                'name'     => 'System Admin',
                'email'    => $recipient ?: 'finance@gofreehold.ae',
                'password' => bcrypt('password123'),
                'role'     => 'admin',
            ]);
        }
        $adminId = $adminUser->id;

        if ($pending->count() > 0) {
            try {
                Mail::to($recipient)->send(new PendingChequeMail($pending));
                $msg = "Pending cheques alert sent for {$pending->count()} cheques to {$recipient}.";
                $this->info($msg);

                NotificationLog::create([
                    'type'         => 'pending_cheques',
                    'recipient_id' => $adminId,
                    'message'      => $msg,
                    'status'       => 'sent',
                    'sent_at'      => now(),
                ]);
            } catch (\Exception $e) {
                $this->error('Failed to send mail: ' . $e->getMessage());

                NotificationLog::create([
                    'type'         => 'pending_cheques',
                    'recipient_id' => $adminId,
                    'message'      => 'Failed: ' . $e->getMessage(),
                    'status'       => 'failed',
                    'sent_at'      => now(),
                ]);

                return self::FAILURE;
            }
        } else {
            $this->info('No pending cheques due soon.');
            NotificationLog::create([
                'type'         => 'pending_cheques',
                'recipient_id' => $adminId,
                'message'      => 'Checked: No pending cheques due within threshold (' . $days . ' days).',
                'status'       => 'checked',
                'sent_at'      => now(),
            ]);
        }

        return self::SUCCESS;
    }
}