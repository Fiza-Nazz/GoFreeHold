<?php

namespace App\Domain\Auth\Mail;

use App\Domain\Auth\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TenantPortalCredentialsMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $tempPassword,
        public ?string $propertyName = null
    ) {
    }

    public function build(): self
    {
        $loginUrl = rtrim(config('app.frontend_url', config('app.url')), '/') . '/login';
        $propertyContext = $this->propertyName ? " for your tenancy at <strong>{$this->propertyName}</strong>" : "";

        $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Tenant Portal Login Credentials</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #10B981; padding: 18px 24px; border-radius: 8px 8px 0 0; color: white;">
        <h2 style="margin: 0; font-size: 20px;">GoFreeHold Tenant Portal</h2>
    </div>
    <div style="border: 1px solid #E2E8F0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px; background: #FFFFFF;">
        <p>Dear <strong>{$this->user->name}</strong>,</p>
        <p>Your tenant portal access has been provisioned{$propertyContext}. You can now log in to view your lease agreement, track rent receipts, and submit maintenance tickets.</p>
        
        <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Portal Login URL:</strong> <a href="{$loginUrl}" style="color: #0284C7;">{$loginUrl}</a></p>
            <p style="margin: 0 0 8px 0;"><strong>Email:</strong> {$this->user->email}</p>
            <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background: #E2E8F0; padding: 3px 8px; border-radius: 4px; font-size: 15px; font-weight: bold; color: #0F172A;">{$this->tempPassword}</code></p>
        </div>

        <p style="color: #64748B; font-size: 13px;"><em>Note: Please keep your password confidential. If you have questions about your lease or portal access, please contact your property manager.</em></p>
        <p style="margin-top: 24px;">Best regards,<br><strong>GoFreeHold Property Management</strong></p>
    </div>
</body>
</html>
HTML;

        return $this->subject('Your GoFreeHold Tenant Portal Login Credentials')
            ->html($html);
    }
}
