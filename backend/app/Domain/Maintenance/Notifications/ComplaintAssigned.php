<?php

namespace App\Domain\Maintenance\Notifications;

use App\Domain\Maintenance\Models\Complaint;
use App\Domain\Maintenance\Models\Job;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ComplaintAssigned extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Complaint $complaint, public Job $job)
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
        $scheduled = $this->job->scheduled_date ? $this->job->scheduled_date->format('Y-m-d') : 'Scheduled soon';

        return (new MailMessage)
            ->subject("Maintenance Ticket Assigned: #{$this->complaint->id} - {$this->complaint->title}")
            ->line("Maintenance ticket #{$this->complaint->id} has been assigned.")
            ->line("Title: {$this->complaint->title}")
            ->line("Unit: {$unitNumber} ({$propertyName})")
            ->line("Scheduled Date: {$scheduled}")
            ->line("Notes: " . ($this->job->notes ?? 'None'))
            ->action('View Ticket Details', config('app.url') . "/tenant/complaints/{$this->complaint->id}");
    }
}
