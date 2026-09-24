<?php

namespace App\Domain\Report\Http\Controllers;

use App\Domain\Report\Models\NotificationLog;
use App\Domain\Report\Models\NotificationSetting;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;

class NotificationSettingController extends Controller
{
    /**
     * Diagnostic: reveal server-side mail configuration (mailer, host, port, from, encryption).
     */
    public function mailDiagnostic(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data'   => [
                'MAIL_MAILER'       => config('mail.default'),
                'MAIL_HOST'         => config('mail.mailers.smtp.host'),
                'MAIL_PORT'         => config('mail.mailers.smtp.port'),
                'MAIL_USERNAME'     => config('mail.mailers.smtp.username') ? '***set***' : '***EMPTY***',
                'MAIL_PASSWORD'     => config('mail.mailers.smtp.password') ? '***set***' : '***EMPTY***',
                'MAIL_SCHEME'       => config('mail.mailers.smtp.scheme'),
                'MAIL_FROM_ADDRESS' => config('mail.from.address'),
                'MAIL_FROM_NAME'    => config('mail.from.name'),
                'MAIL_ENCRYPTION'   => env('MAIL_ENCRYPTION', 'NOT_SET_IN_ENV'),
                'APP_ENV'           => config('app.env'),
                'APP_DEBUG'         => config('app.debug'),
            ],
        ]);
    }

    public function index(): JsonResponse
    {
        if (NotificationSetting::count() === 0) {
            NotificationSetting::insert([
                ['key' => 'contract_expiry', 'enabled' => true, 'recipient_email' => 'admin@gofreehold.ae', 'days_before_expiry' => 100, 'description' => 'Contract Expiry Alerts (~100 days before expiry)', 'created_at' => now(), 'updated_at' => now()],
                ['key' => 'pending_cheques', 'enabled' => true, 'recipient_email' => 'finance@gofreehold.ae', 'days_before_expiry' => 7, 'description' => 'Pending Cheque Alerts', 'created_at' => now(), 'updated_at' => now()],
                ['key' => 'vacant_properties', 'enabled' => true, 'recipient_email' => 'admin@gofreehold.ae', 'days_before_expiry' => 0, 'description' => 'Vacant Property Weekly Alerts', 'created_at' => now(), 'updated_at' => now()],
                ['key' => 'monthly_dues', 'enabled' => true, 'recipient_email' => 'billing@gofreehold.ae', 'days_before_expiry' => 0, 'description' => 'Monthly Rent Due Posting Alerts', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        $settings = NotificationSetting::all();
        $logs = NotificationLog::with('recipient:id,name,email')->latest('id')->take(20)->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'settings' => $settings,
                'logs'     => $logs,
            ],
        ]);
    }

    public function update(Request $request, NotificationSetting $notificationSetting): JsonResponse
    {
        $validated = $request->validate([
            'enabled'            => 'required|boolean',
            'recipient_email'    => 'required|email',
            'days_before_expiry' => 'nullable|integer|min:0',
        ]);

        $notificationSetting->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Notification setting updated.',
            'data'    => ['setting' => $notificationSetting],
        ]);
    }

    public function logs(): JsonResponse
    {
        $logs = NotificationLog::with('recipient:id,name,email')->latest('id')->take(50)->get();

        return response()->json([
            'status' => 'success',
            'data'   => ['logs' => $logs],
        ]);
    }

    public function trigger(string $key): JsonResponse
    {
        $commandMap = [
            'contract_expiry'   => 'alert:contract-expiry',
            'pending_cheques'   => 'alert:pending-cheques',
            'vacant_properties' => 'alert:vacant-properties',
            'monthly_dues'      => 'alert:monthly-dues',
            'rent_posting'      => 'rent:post-monthly',
        ];

        if (!isset($commandMap[$key])) {
            return response()->json([
                'status'  => 'error',
                'message' => "Invalid trigger key: {$key}",
            ], 400);
        }

        $cmd = $commandMap[$key];
        Artisan::call($cmd);
        $output = trim(Artisan::output());

        $logs = NotificationLog::with('recipient:id,name,email')->latest('id')->take(20)->get();

        return response()->json([
            'status'  => 'success',
            'message' => "Triggered {$cmd} successfully.",
            'data'    => [
                'command' => $cmd,
                'output'  => $output,
                'logs'    => $logs,
            ],
        ]);
    }

    public function runScheduler(): JsonResponse
    {
        $commands = [
            'rent:post-monthly',
            'alert:contract-expiry',
            'alert:pending-cheques',
            'alert:vacant-properties',
            'alert:monthly-dues',
        ];

        $results = [];
        foreach ($commands as $cmd) {
            Artisan::call($cmd);
            $results[$cmd] = trim(Artisan::output());
        }

        $logs = NotificationLog::with('recipient:id,name,email')->latest('id')->take(20)->get();

        return response()->json([
            'status'  => 'success',
            'message' => 'Full notification scheduler ran successfully.',
            'data'    => [
                'results' => $results,
                'logs'    => $logs,
            ],
        ]);
    }
}