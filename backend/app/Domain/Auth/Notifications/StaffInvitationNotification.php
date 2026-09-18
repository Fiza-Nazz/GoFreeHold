<?php
namespace App\Domain\Auth\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class StaffInvitationNotification extends Notification
{
    public function __construct(public string $activationUrl) {}
    public function via(object $notifiable): array { return ['mail']; }
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->subject('GoFreeHold staff invitation')
            ->line('Your employer invited you to GoFreeHold. Set your password to activate your account.')
            ->action('Activate account', $this->activationUrl)
            ->line('This link expires in 24 hours and can be used once.');
    }
}
