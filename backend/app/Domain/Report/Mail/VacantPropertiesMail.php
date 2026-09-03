<?php
namespace App\Domain\Report\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class VacantPropertiesMail extends Mailable
{
    use Queueable, SerializesModels;

    public Collection $units;
    public int $vacantCount;

    public function __construct(Collection $units)
    {
        $this->units = $units;
        $this->vacantCount = $units->count();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "GFH Alert: {$this->vacantCount} Vacant Unit(s)",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.vacant-properties',
            with: [
                'units'       => $this->units,
                'vacantCount' => $this->vacantCount,
            ],
        );
    }
}
