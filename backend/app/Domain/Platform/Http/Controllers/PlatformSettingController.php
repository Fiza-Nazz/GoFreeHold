<?php

namespace App\Domain\Platform\Http\Controllers;

use App\Domain\Platform\Models\PlatformSetting;
use App\Domain\Platform\Services\AuditService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlatformSettingController extends Controller
{
    private function defaultSettings(): array
    {
        return [
            'branding_name'      => 'GoFreeHold',
            'support_email'      => 'support@gofreehold.com',
            'default_trial_days' => 14,
            'feature_flags'      => [
                'impersonation'      => true,
                'prepared_contracts' => true,
                'owner_self_signup'  => true,
            ],
            'email_templates'    => (object)[],
        ];
    }

    /**
     * GET /admin/settings
     */
    public function show(): JsonResponse
    {
        $setting = PlatformSetting::where('key', 'general')->first();
        $value = $setting ? $setting->value : $this->defaultSettings();

        return response()->json([
            'data' => [
                'settings' => $value,
            ],
        ]);
    }

    /**
     * PUT /admin/settings
     */
    public function update(Request $request): JsonResponse
    {
        $payload = $request->input('settings', $request->all());

        $setting = PlatformSetting::updateOrCreate(
            ['key' => 'general'],
            ['value' => $payload]
        );

        AuditService::log('settings.updated', 'settings', $setting->id, ['keys' => array_keys($payload)]);

        return response()->json([
            'data' => [
                'settings' => $setting->value,
            ],
        ]);
    }
}
