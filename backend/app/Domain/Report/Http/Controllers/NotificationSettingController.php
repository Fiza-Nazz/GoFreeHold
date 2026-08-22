<?php

namespace App\Domain\Report\Http\Controllers;

use App\Domain\Report\Models\NotificationSetting;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationSettingController extends Controller
{
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

        return response()->json(['status' => 'success', 'data' => ['settings' => $settings]]);
    }

    public function update(Request $request, NotificationSetting $notificationSetting): JsonResponse
    {
        // min:0 — vacant_properties / monthly_dues defaults use 0
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
}