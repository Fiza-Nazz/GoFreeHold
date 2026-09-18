<?php

namespace App\Domain\Auth\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword
{
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Reset your password')
            ->view('emails.reset-password', [
                'resetUrl' => $this->resetUrl($notifiable),
                'expires' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire'),
            ]);
    }
}
