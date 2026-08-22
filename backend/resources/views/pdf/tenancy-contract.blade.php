<!DOCTYPE html>
<html lang="ar" dir="ltr">
<head>
<meta charset="UTF-8">
<style>
@font-face {
  font-family: 'Amiri';
  font-weight: normal;
  src: url('{{ storage_path("fonts/Amiri-Regular.ttf") }}') format('truetype');
}
@font-face {
  font-family: 'Amiri';
  font-weight: bold;
  src: url('{{ storage_path("fonts/Amiri-Bold.ttf") }}') format('truetype');
}

* { margin:0; padding:0; box-sizing:border-box; }
html { margin:0; padding:0; }
body { margin:0; padding:0; font-size:0; background:#fff; }

@page { size: 794px 1122px; margin: 0; }

/* page break ONLY before pages 2 & 3 */
.pb { page-break-before: always; page-break-after: avoid; }

/* ── PAGE CONTAINER ── */
.page {
  position: relative;
  width:  794px;
  height: 1122px;
  display: block;
  page-break-after: avoid;
  page-break-inside: avoid;
}
.page-bg {
  position: absolute;
  top: 0; left: 0;
  width: 794px;
  height: 1122px;
  display: block;
}

/* ── DATA OVERLAY TEXT (Matches Image 2 Paul Reference exactly) ── */
.f {
  position: absolute;
  font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
  font-size: 9.2pt;
  font-weight: normal;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  line-height: 1.1;
  letter-spacing: 0.2px;
}
.f-sm { font-size: 8pt; font-weight: normal; }
.f-xs { font-size: 7.5pt; font-weight: normal; }

/* ── INVENTORY / ADDENDUM PAGE (Page 3) ── */
.inv-page {
  font-size: 8.5pt;
  width: 678px;
  min-height: 1040px;
  padding: 40px 58px;
  background: #fff;
}
.inv-title {
  font-size: 13pt; font-weight: bold; color: #1a2b6d;
  border-bottom: 2px solid #1a2b6d;
  padding-bottom: 5px; margin-bottom: 10px;
}
.inv-disclaimer {
  font-size: 7.5pt; font-style: italic; color: #333;
  margin: 8px 0 10px 0; line-height: 1.45;
  border-left: 3px solid #1a2b6d; padding-left: 8px;
}
.inv-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
.inv-table tr { border-bottom: 1px solid #aaa; }
.inv-table td { padding: 5px 7px; font-size: 8pt; vertical-align: middle; }
.inv-agree {
  margin-top: 24px; font-size: 8.5pt;
  font-weight: bold; color: #1a2b6d; text-align: center;
}
</style>
</head>
<body>
@php
  use Carbon\Carbon;
  use App\Helpers\ArHelper;

  $ar    = fn($t) => ArHelper::ar((string)$t);
  $fmt   = fn($d)  => $d ? Carbon::parse($d)->format('d/m/Y') : '';
  $num   = fn($n)  => ($n !== null && $n !== '') ? number_format((float)$n, 0) : '';
  $v     = fn(...$c) => collect($c)->first(fn($x) => $x !== null && $x !== '');
  $blank = fn($val) => ($val !== null && $val !== '' && $val !== 0 && $val !== '0') ? $val : '';

  $usage = strtolower($v($res?->property_usage ?? null, $contract->type ?? '', ''));
  $isRes = str_contains($usage, 'resid') || $usage === 'r';
  $isCom = str_contains($usage, 'comm')  || $usage === 'c';
  $isInd = str_contains($usage, 'ind')   || $usage === 'i';
  if (!$isRes && !$isCom && !$isInd) $isRes = true;

  $cNo     = $v($res?->contract_no ?? null, $contract->contract_no ?? null, 'GFH-'.str_pad($contract->id ?? 1, 4, '0', STR_PAD_LEFT));
  $ownerN  = strtoupper($v($owner?->name ?? null, $res?->owner_name ?? null, 'N/A'));
  $lanN    = $ownerN;
  $tenN    = strtoupper($v($tenant?->name ?? null, $res?->tenant_name ?? null, 'N/A'));
  $tenEmail= $v($tenant?->email ?? null, $res?->tenant_email ?? null, '');
  $lanEmail= $v($owner?->email  ?? null, $res?->lessor_email ?? null, '');
  $tenPh   = $v($tenant?->phone ?? null, $tenant?->contact ?? null, $res?->tenant_phone ?? null, '');
  $lanPh   = $v($owner?->phone  ?? null, $owner?->contact ?? null, $res?->lessor_phone ?? null, '');
  $bldName = strtoupper($v($building?->name ?? null, $res?->property_name ?? null, ''));
  $loc     = strtoupper($v($building?->address ?? null, $building?->city ?? null, $res?->location ?? null, ''));
  $pSize   = $v($unit?->size ?? null, $res?->property_area ?? null, '');
  $pType   = strtoupper($v($unit?->type ?? null, $res?->property_type ?? null, ''));
  $pNo     = $v($unit?->number ?? null, '');
  $dewaNo  = $v($unit?->dhewa_no ?? null, $unit?->dewa_no ?? null, '');
  $plotNo  = $v($res?->plot_no ?? null, '');
  // Full date format for Contract Period (e.g. "10 August 2026")
  $fmtLong = fn($d) => $d ? Carbon::parse($d)->format('d F Y') : '';
  $pFrom   = $fmt($contract->start_date ?? $res?->period_from ?? null);
  $pTo     = $fmt($contract->end_date   ?? $res?->period_to   ?? null);
  $pFromL  = $fmtLong($contract->start_date ?? $res?->period_from ?? null);
  $pToL    = $fmtLong($contract->end_date   ?? $res?->period_to   ?? null);
  $rentVal = (float)($contract->rent_amount ?? $res?->annual_rent ?? 0);
  $rent    = $num($rentVal);
  $cVal    = $num($contract->contract_value ?? $contract->rent_amount ?? null);
  $secDep  = $v($contract->security_deposit ?? null, $res?->security_deposit_amount ?? null, '');
  $mop     = strtoupper($v($contract->mode_of_payment ?? null, 'MONTHLY'));

  $nw = function(int $n) use (&$nw): string {
    $ones=[0=>'ZERO',1=>'ONE',2=>'TWO',3=>'THREE',4=>'FOUR',5=>'FIVE',
           6=>'SIX',7=>'SEVEN',8=>'EIGHT',9=>'NINE',10=>'TEN',11=>'ELEVEN',
           12=>'TWELVE',13=>'THIRTEEN',14=>'FOURTEEN',15=>'FIFTEEN',16=>'SIXTEEN',
           17=>'SEVENTEEN',18=>'EIGHTEEN',19=>'NINETEEN',20=>'TWENTY',
           30=>'THIRTY',40=>'FORTY',50=>'FIFTY',60=>'SIXTY',70=>'SEVENTY',
           80=>'EIGHTY',90=>'NINETY'];
    if($n<=0)  return 'ZERO';
    if($n<=20) return $ones[$n];
    if($n<100) { $t=$ones[(int)($n/10)*10]; $o=$n%10?$ones[$n%10]:''; return $t.($o?' '.$o:''); }
    if($n<1000){ return $ones[(int)($n/100)].' HUNDRED'.(($n%100)?' AND '.$nw($n%100):''); }
    if($n<1000000){ return $nw((int)($n/1000)).' THOUSAND'.(($n%1000)?' '.$nw($n%1000):''); }
    return number_format($n);
  };

  $rentW = $nw((int)$rentVal).' DIRHAMS ONLY';
  $cValW = $nw((int)($contract->contract_value ?? $rentVal)).' DIRHAMS ONLY';

  $pg1 = public_path('images/tenancyres1.jpg');
  $pg2 = public_path('images/tenancyres2.jpg');

  $contractDate = $v($res?->contract_date ?? null, $contract->date ?? null, $contract->contract_date ?? null, $contract->start_date ?? null, $contract->created_at ?? null);
  $cDate = $contractDate ? Carbon::parse($contractDate) : now();
  $dd = $cDate->format('d');
  $mm = $cDate->format('m');
  $yy = $cDate->format('Y');

  // Real inventory items from database (only real database items, zero copied data)
  $items = (isset($unit_items) && $unit_items && $unit_items->count() > 0)
    ? $unit_items->map(fn($i) => [$i->name ?? $i->item_name ?? 'ITEM', $i->quantity ?? 1])->toArray()
    : [];
  // Default additional terms from Paul's template (used if no custom terms/addendum found)
  $defaultTerms = [
    'DEWA EMPOWER & ANY OTHER UTILITY WILL BE PAID BY TENANT',
    'TENANT IS RESPONSIBLE FOR ANY MAINTENANCE.',
    'SPECIAL DISCOUNT IN RENT 14,000/- AED (28,000/- AED RENT FOR THIS YEAR ONLY).',
    '2,000/- AED CASH DEPOSIT FOR DEWA REFUNDABLE.',
    '245/- AED WILL BE PAID BY THE TENANT AS AN ADMIN CHARGES WHEN VACATING THE APARTMENT.',
    'ANY CHEQUE DISHONORED FROM THE TENANT, A CHARGE OF 2000/- AED SHALL BE APPLIED.',
    'APARTMENT SHOULD BE HANDED OVER WITHOUT ANY DAMAGES AND SHOULD BE CLEAN UPON VACATING THE APARTMENT.',
    'INCASE TENANT WANTS TERMINATE THE CONTRACT EARLY 2 MONTHS PENALTY WILL BE CHARGED.',
  ];

  $displayTerms = [];
  if (isset($termsList) && $termsList && $termsList->count() > 0) {
    foreach ($termsList->take(8) as $t) {
      $txt = $t->terms ?? $t->description ?? $t->content ?? $t->term ?? '';
      if (!empty(trim($txt))) $displayTerms[] = trim($txt);
    }
  } elseif (isset($addendum) && $addendum) {
    foreach (['c1','c2','c3','c4','c5','c6','c7','c8'] as $k) {
      if (!empty($addendum->$k)) {
        $displayTerms[] = strtoupper(trim($addendum->$k));
      }
    }
  }
  if (empty($displayTerms)) {
    $displayTerms = $defaultTerms;
  }
@endphp
{{-- ══════════════════════════ PAGE 1 ══════════════════════════ --}}<div class="page">
  <img class="page-bg" src="{{ $pg1 }}" alt="">

  {{-- ── TITLE BOX: Date & Contract No (Exact match with Paul's Image 2 reference) ── --}}
  <div class="f" style="top:78px; left:62px; width:26px; text-align:center;">{{ $dd }}</div>
  <div class="f" style="top:78px; left:106px; width:26px; text-align:center;">{{ $mm }}</div>
  <div class="f" style="top:78px; left:148px; width:36px; text-align:center;">{{ $yy }}</div>
  <div class="f" style="top:100px; left:65px;">{{ $cNo }}</div>

  {{-- ── PROPERTY USAGE CHECKBOXES ── --}}
  <div class="f" style="top:161px; left:265px; font-size:11pt;">{!! $isInd ? 'X' : '' !!}</div>
  <div class="f" style="top:161px; left:413px; font-size:11pt;">{!! $isCom ? 'X' : '' !!}</div>
  <div class="f" style="top:161px; left:563px; font-size:11pt;">{!! $isRes ? 'X' : '' !!}</div>

  {{-- ── FORM FIELD ROWS (Pixel-perfect matching Image 2 reference) ── --}}

  {{-- Row 1 — Owner Name --}}
  <div class="f" style="top:185px; left:92px; width:580px;">{{ $ownerN }}</div>

  {{-- Row 2 — Landlord Name --}}
  <div class="f" style="top:213px; left:102px; width:570px;">{{ $lanN }}</div>

  {{-- Row 3 — Tenant Name --}}
  <div class="f" style="top:241px; left:92px; width:580px;">{{ $tenN }}</div>

  {{-- Row 4 — Tenant Email | Landlord Email --}}
  <div class="f" style="top:269px; left:88px; width:220px;">{{ $tenEmail }}</div>
  <div class="f" style="top:269px; left:484px; width:220px;">{{ $lanEmail }}</div>

  {{-- Row 5 — Tenant Phone | Landlord Phone --}}
  <div class="f" style="top:297px; left:92px; width:230px;">{{ $tenPh }}</div>
  <div class="f" style="top:297px; left:488px; width:200px;">{{ $lanPh }}</div>

  {{-- Row 6 — Building Name | Location --}}
  <div class="f" style="top:326px; left:98px; width:240px;">{{ $bldName }}</div>
  <div class="f" style="top:326px; left:458px; width:245px;">{{ $loc }}</div>

  {{-- Row 7 — Property Size | Property Type | Property No --}}
  <div class="f" style="top:354px; left:116px; width:88px;">{{ $pSize }}</div>
  <div class="f" style="top:354px; left:394px; width:110px;">{{ $pType }}</div>
  <div class="f" style="top:354px; left:648px; width:50px;">{{ $pNo }}</div>

  {{-- Row 8 — Premises No DEWA | Plot No --}}
  <div class="f" style="top:382px; left:128px; width:190px;">{{ $dewaNo }}</div>
  <div class="f" style="top:382px; left:454px; width:250px;">{{ $plotNo }}</div>

  {{-- Row 9 — Contract Period: To | From --}}
  <div class="f" style="top:410px; left:138px; width:230px;">{{ $pToL }}</div>
  <div class="f" style="top:410px; left:444px; width:245px;">{{ $pFromL }}</div>

  {{-- Row 10 — Annual Rent --}}
  <div class="f" style="top:438px; left:92px; width:588px;">{!! $rent !!} ({!! $rentW !!})</div>

  {{-- Row 11 — Contract Value --}}
  <div class="f" style="top:467px; left:102px; width:580px;">{!! $cVal !!} ({!! $cValW !!})</div>

  {{-- Row 12 — Security Deposit | Mode of Payment --}}
  <div class="f" style="top:495px; left:148px; width:190px;">{!! $secDep ? $secDep.' AED CASH DEPOSIT' : '' !!}</div>
  <div class="f" style="top:495px; left:494px; width:195px;">{{ $mop }}</div>

</div>
{{-- ══════════════════════════ PAGE 2 ══════════════════════════ --}}<div class="page pb">
  <img class="page-bg" src="{{ $pg2 }}" alt="">

  {{-- ── ADDITIONAL TERMS DYNAMIC OVERLAY (Exact match to Paul's reference) ── --}}
  @php
    $termPositions = [627, 665, 702, 738, 771, 807, 842, 874];
  @endphp
  @foreach($termPositions as $ti => $topY)
    @if(isset($displayTerms[$ti]))
      <div style="position:absolute; top:{{ $topY }}px; left:58px; width:680px; font-family:Arial,Helvetica,sans-serif; font-size:7.6pt; font-weight:bold; color:#000; white-space:nowrap; line-height:1; z-index:10;">{{ $displayTerms[$ti] }}</div>
    @endif
  @endforeach
</div>
{{-- ══════════════════════════ PAGE 3: ADDENDUM ══════════════════════════ --}}<div class="inv-page pb">

  <div style="text-align:center; font-size:14pt; font-weight:bold; color:#111; margin-top:20px; margin-bottom:30px; font-family:Arial,Helvetica,sans-serif;">
    ADDENDUM NO.3 TO Tenancy Contract
  </div>

  <table style="width:100%; font-family:Arial,Helvetica,sans-serif; font-size:9pt; color:#111; margin-bottom:12px; border-collapse:collapse;">
    <tr>
      <td style="width:120px; padding:4px 0; font-size:9pt;">Tenant</td>
      <td style="padding:4px 0; font-size:9pt;">{{ $tenN }}</td>
    </tr>
    <tr>
      <td style="padding:4px 0; font-size:9pt;">Contact</td>
      <td style="padding:4px 0; font-size:9pt;">{{ $tenEmail ?: $tenPh }}</td>
    </tr>
    <tr>
      <td style="padding:4px 0; font-size:9pt;">Building</td>
      <td style="padding:4px 0; font-size:9pt;">{{ $bldName }}{{ $pNo ? ' - ' . $pNo : '' }}{{ $pType ? ' - ' . $pType : '' }}</td>
    </tr>
  </table>

  <div style="font-family:Arial,Helvetica,sans-serif; font-size:8.5pt; color:#222; margin-bottom:15px; line-height:1.4;">
    I have received the property and items in good working condition. I shall reimburse the cost of items in case of a damage while vacating the apartment.
  </div>

  @if(count($items) > 0)
    <table style="width:100%; border-collapse:collapse; font-family:Arial,Helvetica,sans-serif; font-size:9pt; color:#111;">
      @foreach($items as $idx => $item)
      <tr style="border-top:1px solid #ddd; border-bottom:1px solid #ddd;">
        <td style="padding:12px 4px; text-transform:uppercase;">{{ $item[0] }}</td>
        <td style="padding:12px 4px; text-align:center; width:80px;">{{ $item[1] }}</td>
      </tr>
      @endforeach
    </table>
  @else
    <table style="width:100%; border-collapse:collapse; font-family:Arial,Helvetica,sans-serif; font-size:9pt; color:#111;">
      <tr style="border-top:1px solid #ddd; border-bottom:1px solid #ddd;">
        <td style="padding:12px 4px;">MAIN DOOR KEYS & ACCESS FOBS</td>
        <td style="padding:12px 4px; text-align:center; width:80px;">HANDED</td>
      </tr>
      <tr style="border-top:1px solid #ddd; border-bottom:1px solid #ddd;">
        <td style="padding:12px 4px;">DEWA & UTILITY CONNECTIONS (PREMISES: {{ $dewaNo ?: 'N/A' }})</td>
        <td style="padding:12px 4px; text-align:center; width:80px;">VERIFIED</td>
      </tr>
      <tr style="border-top:1px solid #ddd; border-bottom:1px solid #ddd;">
        <td style="padding:12px 4px;">FIXTURES, ELECTRICAL & PLUMBING FITTINGS</td>
        <td style="padding:12px 4px; text-align:center; width:80px;">INSPECTED</td>
      </tr>
    </table>
  @endif

  @if(isset($cheques) && $cheques && count($cheques) > 0)
    <div style="font-family:Arial,Helvetica,sans-serif; font-size:10pt; font-weight:bold; color:#111; margin-top:24px; margin-bottom:8px;">
      Payment & Cheques Schedule
    </div>
    <table style="width:100%; border-collapse:collapse; font-family:Arial,Helvetica,sans-serif; font-size:8.5pt; color:#111;">
      <tr style="border-bottom:1.5px solid #111; font-weight:bold;">
        <td style="padding:6px 4px;">Cheque #</td>
        <td style="padding:6px 4px;">Bank</td>
        <td style="padding:6px 4px;">Due Date</td>
        <td style="padding:6px 4px; text-align:right;">Amount (AED)</td>
      </tr>
      @foreach($cheques as $c)
      <tr style="border-bottom:1px solid #ddd;">
        <td style="padding:8px 4px;">{{ $c->cheque_number ?? $c->cheque_no ?? '-' }}</td>
        <td style="padding:8px 4px;">{{ $c->bank_name ?? '-' }}</td>
        <td style="padding:8px 4px;">{{ $fmt($c->due_date ?? null) }}</td>
        <td style="padding:8px 4px; text-align:right;">{{ $num($c->amount ?? 0) }}</td>
      </tr>
      @endforeach
    </table>
  @endif

  <div style="font-family:Arial,Helvetica,sans-serif; font-size:9pt; color:#111; margin-top:28px;">
    Agreed and Accepted
  </div>

</div>

</body>
</html>