@extends('emails.layout', ['title' => 'Monthly Rent Dues Alert'])

@section('content')
  <div style="margin-bottom: 24px;">
    <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #18002E;">
      Monthly Rent Dues Outstanding
    </h2>
    <p style="margin: 0; font-size: 14px; color: #64748B; line-height: 1.5;">
      The following active contracts currently have outstanding rent dues recorded in the rent ledger.
    </p>
  </div>

  <div style="background-color: #F8F5FD; border: 1.5px solid #E4DAF5; padding: 14px 18px; border-radius: 6px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-size: 13px; font-weight: 600; color: #4A3E68;">Total Outstanding Balance:</span>
    <strong style="font-size: 18px; font-weight: 800; color: #991B1B;">AED {{ number_format($grandTotal, 2) }}</strong>
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #EEE8F8; border-radius: 6px; overflow: hidden; margin-bottom: 24px;">
    <thead>
      <tr style="background-color: #F8F5FD; border-bottom: 2px solid #E4DAF5;">
        <th style="padding: 12px 14px; font-size: 11.5px; font-weight: 700; color: #4A3E68; text-transform: uppercase; text-align: left;">Contract</th>
        <th style="padding: 12px 14px; font-size: 11.5px; font-weight: 700; color: #4A3E68; text-transform: uppercase; text-align: left;">Tenant</th>
        <th style="padding: 12px 14px; font-size: 11.5px; font-weight: 700; color: #4A3E68; text-transform: uppercase; text-align: left;">Property / Unit</th>
        <th style="padding: 12px 14px; font-size: 11.5px; font-weight: 700; color: #4A3E68; text-transform: uppercase; text-align: right;">Amount Due</th>
      </tr>
    </thead>
    <tbody>
      @forelse($dues as $d)
        <tr style="border-bottom: 1px solid #F0EBF9;">
          <td style="padding: 12px 14px; font-size: 13px; font-weight: 700; color: #240046;">
            GFH-{{ str_pad((string)$d['contract_id'], 5, '0', STR_PAD_LEFT) }}
          </td>
          <td style="padding: 12px 14px; font-size: 13px; font-weight: 600; color: #1E293B;">
            {{ $d['tenant_name'] ?? '—' }}
          </td>
          <td style="padding: 12px 14px; font-size: 12.5px; color: #64748B;">
            {{ $d['property_name'] ?? '—' }} / {{ $d['unit_number'] ?? '—' }}
          </td>
          <td style="padding: 12px 14px; font-size: 13px; font-weight: 700; color: #991B1B; text-align: right;">
            AED {{ number_format((float)$d['outstanding'], 2) }}
          </td>
        </tr>
      @empty
        <tr>
          <td colspan="4" style="padding: 20px; text-align: center; font-size: 13px; color: #64748B;">
            No outstanding rent dues at this time.
          </td>
        </tr>
      @endforelse
    </tbody>
  </table>
@endsection
