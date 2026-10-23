<?php

namespace App\Domain\Maintenance\Notifications;

use App\Domain\Maintenance\Models\Complaint;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ComplaintCreated extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Complaint $complaint)
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

        return (new MailMessage)
            ->subject("New Maintenance Request: #{$this->complaint->id} - {$this->complaint->title}")
            ->line("A new maintenance complaint has been submitted.")
            ->line("Ticket ID: #{$this->complaint->id}")
            ->line("Title: {$this->complaint->title}")
            ->line("Unit: {$unitNumber} ({$propertyName})")
            ->line("Category: " . ucfirst($this->complaint->category ?? 'General'))
            ->line("Priority: " . strtoupper($this->complaint->priority ?? 'medium'))
            ->line("Description: " . ($this->complaint->description ?? ''))
            ->action('View Ticket', config('app.url') . "/maintenance/complaints");
    }
}
