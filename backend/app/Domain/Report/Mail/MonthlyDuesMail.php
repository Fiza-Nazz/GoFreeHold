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
        $rows = $this->dues->map(function ($row) {
            $tenant = e($row['tenant_name'] ?? '—');
            $unit = e($row['unit_number'] ?? '—');
            $property = e($row['property_name'] ?? '—');
            $amt = number_format((float) $row['outstanding'], 2);
            return "<li>Contract GFH-" . str_pad((string) $row['contract_id'], 5, '0', STR_PAD_LEFT)
                . " — {$tenant} @ {$property}/{$unit} — AED {$amt}</li>";
        })->implode('');

        $total = number_format($this->grandTotal, 2);

        return new Content(
            htmlString: "<h2>GoFreeHold Monthly Dues Alert</h2>"
                . "<p>The following active contracts have outstanding rent (debit − credit &gt; 0):</p>"
                . "<ul>{$rows}</ul>"
                . "<p><strong>Grand total outstanding: AED {$total}</strong></p>"
        );
    }
}
