@extends('emails.layout', ['title' => 'Vacant Units Summary'])

@section('content')
  <div style="margin-bottom: 24px;">
    <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #18002E;">
      Currently Vacant Units Report
    </h2>
    <p style="margin: 0; font-size: 14px; color: #64748B; line-height: 1.5;">
      There are currently <strong>{{ $vacantCount }}</strong> AVAILABLE units ready for leasing across properties.
    </p>
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #EEE8F8; border-radius: 6px; overflow: hidden; margin-bottom: 24px;">
    <thead>
      <tr style="background-color: #F8F5FD; border-bottom: 2px solid #E4DAF5;">
        <th style="padding: 12px 14px; font-size: 11.5px; font-weight: 700; color: #4A3E68; text-transform: uppercase; text-align: left;">Property</th>
        <th style="padding: 12px 14px; font-size: 11.5px; font-weight: 700; color: #4A3E68; text-transform: uppercase; text-align: left;">Unit #</th>
        <th style="padding: 12px 14px; font-size: 11.5px; font-weight: 700; color: #4A3E68; text-transform: uppercase; text-align: right;">Listing Price</th>
        <th style="padding: 12px 14px; font-size: 11.5px; font-weight: 700; color: #4A3E68; text-transform: uppercase; text-align: center;">Status</th>
      </tr>
    </thead>
    <tbody>
      @forelse($units as $u)
        <tr style="border-bottom: 1px solid #F0EBF9;">
          <td style="padding: 12px 14px; font-size: 13px; font-weight: 700; color: #240046;">
            {{ $u->property?->name ?? '—' }}
          </td>
          <td style="padding: 12px 14px; font-size: 13px; font-weight: 600; color: #1E293B;">
            Unit {{ $u->number ?? $u->id }}
          </td>
          <td style="padding: 12px 14px; font-size: 13px; font-weight: 700; color: #065F46; text-align: right;">
            AED {{ number_format((float)($u->price ?? 0), 2) }}
          </td>
          <td style="padding: 12px 14px; text-align: center;">
            <span style="display: inline-block; background-color: #E0F2FE; color: #0369A1; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 3px; text-transform: uppercase;">
              AVAILABLE
            </span>
          </td>
        </tr>
      @empty
        <tr>
          <td colspan="4" style="padding: 20px; text-align: center; font-size: 13px; color: #64748B;">
            All units are currently occupied.
          </td>
        </tr>
      @endforelse
    </tbody>
  </table>
@endsection
