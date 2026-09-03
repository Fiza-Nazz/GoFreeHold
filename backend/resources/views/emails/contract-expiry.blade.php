@extends('emails.layout', ['title' => 'Contract Expiry Alert'])

@section('content')
  <div style="margin-bottom: 24px;">
    <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #18002E;">
      Upcoming Tenancy Contract Expirations
    </h2>
    <p style="margin: 0; font-size: 14px; color: #64748B; line-height: 1.5;">
      The following active tenancy contracts are scheduled to expire within the next <strong>100 days</strong>. Please review renewal terms or issue vacating notices accordingly.
    </p>
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #EEE8F8; border-radius: 6px; overflow: hidden; margin-bottom: 24px;">
    <thead>
      <tr style="background-color: #F8F5FD; border-bottom: 2px solid #E4DAF5;">
        <th style="padding: 12px 14px; font-size: 11.5px; font-weight: 700; color: #4A3E68; text-transform: uppercase; text-align: left;">Contract ID</th>
        <th style="padding: 12px 14px; font-size: 11.5px; font-weight: 700; color: #4A3E68; text-transform: uppercase; text-align: left;">Tenant</th>
        <th style="padding: 12px 14px; font-size: 11.5px; font-weight: 700; color: #4A3E68; text-transform: uppercase; text-align: left;">Expiry Date</th>
        <th style="padding: 12px 14px; font-size: 11.5px; font-weight: 700; color: #4A3E68; text-transform: uppercase; text-align: center;">Status</th>
      </tr>
    </thead>
    <tbody>
      @forelse($expiringContracts as $c)
        <tr style="border-bottom: 1px solid #F0EBF9;">
          <td style="padding: 12px 14px; font-size: 13px; font-weight: 700; color: #240046;">
            GFH-{{ $c['id'] }}
          </td>
          <td style="padding: 12px 14px; font-size: 13px; font-weight: 600; color: #1E293B;">
            {{ $c['tenant']['name'] ?? '—' }}
          </td>
          <td style="padding: 12px 14px; font-size: 12.5px; color: #64748B;">
            <span style="display: inline-block; background-color: #FEF3C7; color: #92400E; padding: 3px 8px; border-radius: 3px; font-weight: 600;">
              {{ \Illuminate\Support\Carbon::parse($c['end_date'])->format('d M Y') }}
            </span>
          </td>
          <td style="padding: 12px 14px; text-align: center;">
            <span style="display: inline-block; background-color: #DCFCE7; color: #166534; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 3px; text-transform: uppercase;">
              ACTIVE
            </span>
          </td>
        </tr>
      @empty
        <tr>
          <td colspan="4" style="padding: 20px; text-align: center; font-size: 13px; color: #64748B;">
            No contracts expiring within notice window.
          </td>
        </tr>
      @endforelse
    </tbody>
  </table>
@endsection
