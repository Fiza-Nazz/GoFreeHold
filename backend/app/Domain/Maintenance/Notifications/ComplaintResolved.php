<?php

namespace App\Domain\Maintenance\Notifications;

use App\Domain\Maintenance\Models\Complaint;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ComplaintResolved extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Complaint $complaint, public ?string $note = null)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $unitNumber = $this->complaint->unit?->number ?? 'N/A';
        $propertyName = $this->complaint->unit?->property?->name ?? 'Property';

        $msg = (new MailMessage)
            ->subject("Maintenance Ticket Resolved: #{$this->complaint->id} - {$this->complaint->title}")
            ->line("Your maintenance ticket has been marked as resolved.")
            ->line("Ticket ID: #{$this->complaint->id}")
            ->line("Title: {$this->complaint->title}")
            ->line("Unit: {$unitNumber} ({$propertyName})");

        if (!empty($this->note)) {
            $msg->line("Resolution note: {$this->note}");
        }

        return $msg->action('View Ticket', config('app.url') . "/tenant/complaints/{$this->complaint->id}");
    }
}
