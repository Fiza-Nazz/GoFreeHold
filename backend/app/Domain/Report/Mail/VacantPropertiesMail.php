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
        $rows = $this->units->map(function ($u) {
            $property = $u->property?->name ?? '—';
            $number = $u->number ?? $u->id;
            $price = number_format((float) ($u->price ?? 0), 2);
            return "<li>{$property} / Unit {$number} — AED {$price} ({$u->status})</li>";
        })->implode('');

        return new Content(
            htmlString: "<h2>GoFreeHold Vacant Properties Alert</h2>"
                . "<p>There are currently <strong>{$this->vacantCount}</strong> AVAILABLE unit(s):</p>"
                . "<ul>{$rows}</ul>"
        );
    }
}
