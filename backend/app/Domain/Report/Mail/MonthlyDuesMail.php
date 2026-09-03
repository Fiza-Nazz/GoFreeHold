<?php
namespace App\Domain\Report\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class MonthlyDuesMail extends Mailable
{
    use Queueable, SerializesModels;

    public Collection $dues;
    public float $grandTotal;

    public function __construct(Collection $dues)
    {
        $this->dues = $dues;
        $this->grandTotal = (float) $dues->sum('outstanding');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'GFH Alert: Monthly Rent Dues Outstanding',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.monthly-dues',
            with: [
                'dues'       => $this->dues,
                'grandTotal' => $this->grandTotal,
            ],
        );
    }
}
