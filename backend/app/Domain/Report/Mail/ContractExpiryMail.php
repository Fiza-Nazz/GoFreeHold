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
            htmlString: "<h2>GoFreeHold Contract Expiry Alert</h2><p>The following contracts are expiring within the next 100 days:</p><ul>" . 
                implode('', array_map(fn($c) => "<li>Contract GFH-{$c['id']} (Tenant: {$c['tenant']['name']}) - Expires on {$c['end_date']}</li>", $this->expiringContracts->toArray())) .
                "</ul>"
        );
    }
}
