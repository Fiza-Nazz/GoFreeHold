<?php
namespace App\Domain\Report\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContractExpiryMail extends Mailable
{
    use Queueable, SerializesModels;

    public $expiringContracts;

    public function __construct($expiringContracts)
    {
        $this->expiringContracts = $expiringContracts;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'GFH Alert: Upcoming Contract Expirations (~100 Days Notice)',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contract-expiry',
            with: [
                'expiringContracts' => $this->expiringContracts,
            ],
        );
    }
}
