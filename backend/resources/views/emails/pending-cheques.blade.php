@extends('emails.layout', ['title' => 'Pending PDC Cheques Alert'])

@section('content')
  <div style="margin-bottom: 24px;">
    <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #18002E;">
      Upcoming PDC Cheques Due Soon
    </h2>
    <p style="margin: 0; font-size: 14px; color: #64748B; line-height: 1.5;">
      The following Post-Dated Cheques (PDC) are scheduled for bank deposit within the threshold window.
    </p>
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #EEE8F8; border-radius: 6px; overflow: hidden; margin-bottom: 24px;">
    <thead>
      <tr style="background-color: #F8F5FD; border-bottom: 2px solid #E4DAF5;">
        <th style="padding: 12px 14px; font-size: 11.5px; font-weight: 700; color: #4A3E68; text-transform: uppercase; text-align: left;">Cheque #</th>
        <th style="padding: 12px 14px; font-size: 11.5px; font-weight: 700; color: #4A3E68; text-transform: uppercase; text-align: left;">Bank</th>
        <th style="padding: 12px 14px; font-size: 11.5px; font-weight: 700; color: #4A3E68; text-transform: uppercase; text-align: left;">Due Date</th>
        <th style="padding: 12px 14px; font-size: 11.5px; font-weight: 700; color: #4A3E68; text-transform: uppercase; text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      @forelse($cheques as $chq)
        <tr style="border-bottom: 1px solid #F0EBF9;">
          <td style="padding: 12px 14px; font-size: 13px; font-weight: 700; color: #240046;">
            #{{ $chq['cheque_number'] }}
          </td>
          <td style="padding: 12px 14px; font-size: 13px; font-weight: 600; color: #1E293B;">
            {{ $chq['bank_name'] ?? '—' }}
          </td>
          <td style="padding: 12px 14px; font-size: 12.5px; color: #64748B;">
            <span style="display: inline-block; background-color: #FEF3C7; color: #92400E; padding: 3px 8px; border-radius: 3px; font-weight: 600;">
              {{ \Illuminate\Support\Carbon::parse($chq['due_date'])->format('d M Y') }}
            </span>
          </td>
          <td style="padding: 12px 14px; font-size: 13px; font-weight: 700; color: #065F46; text-align: right;">
            AED {{ number_format((float)$chq['amount'], 2) }}
          </td>
        </tr>
      @empty
        <tr>
          <td colspan="4" style="padding: 20px; text-align: center; font-size: 13px; color: #64748B;">
            No pending cheques due within notice window.
          </td>
        </tr>
      @endforelse
    </tbody>
  </table>
@endsection
