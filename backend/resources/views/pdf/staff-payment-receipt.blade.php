<!doctype html>
<html><head><meta charset="utf-8"><style>body{font-family:DejaVu Sans,sans-serif;color:#123c32;font-size:13px}h1{color:#098764}td{padding:9px;border-bottom:1px solid #ddd}table{width:100%}</style></head>
<body><h1>GoFreeHold — Payment Receipt</h1><p>Receipt #{{ $payment->id }}</p>
<table>
<tr><td>Tenant</td><td>{{ $payment->tenant?->name }}</td></tr>
<tr><td>Contract</td><td>#{{ $payment->contract_id }}</td></tr>
<tr><td>Property / Unit</td><td>{{ $payment->contract?->unit?->property?->name }} / {{ $payment->contract?->unit?->number }}</td></tr>
<tr><td>Date</td><td>{{ $payment->date?->format('Y-m-d') }}</td></tr>
<tr><td>Amount</td><td>AED {{ number_format($payment->amount,2) }}</td></tr>
<tr><td>Category / Method</td><td>{{ $payment->type }} / {{ $payment->mode }}</td></tr>
<tr><td>Reference</td><td>{{ $payment->reference_number }}</td></tr>
<tr><td>Remarks</td><td>{{ $payment->remarks }}</td></tr>
<tr><td>Recorded by</td><td>{{ $payment->recordedBy?->name }}</td></tr>
</table></body></html>
