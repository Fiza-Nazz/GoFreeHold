<?php
namespace App\Domain\Report\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PendingChequeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $cheques;

    public function __construct($cheques)
    {
        $this->cheques = $cheques;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'GFH Alert: Upcoming PDC Cheques Due Soon',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.pending-cheques',
            with: [
                'cheques' => $this->cheques,
            ],
        );
    }
}
