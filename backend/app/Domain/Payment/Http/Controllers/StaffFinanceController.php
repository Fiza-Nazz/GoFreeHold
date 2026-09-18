<?php
namespace App\Domain\Payment\Http\Controllers;

use App\Domain\Auth\Services\OwnerContextResolver;
use App\Domain\Contract\Models\Contract;
use App\Domain\Payment\Models\{Payment, RentTransaction};
use App\Domain\Payment\Services\StaffPaymentService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StaffFinanceController extends Controller
{
    public function __construct(private OwnerContextResolver $context, private StaffPaymentService $staffPayments) {}
    private function contractScope(Request $r)
    {
        $owner = $this->context->ownerId($r->user());
        return function ($q) use ($r, $owner) {
            $this->context->contracts($q, $owner);
            if ($r->filled('property_id')) $q->whereHas('unit', fn ($u) => $u->where('property_id', $r->property_id));
            if ($r->filled('contract_id')) $q->where('contracts.id', $r->contract_id);
        };
    }
    private function filters(Request $r): void
    {
        $r->validate(['from' => 'nullable|date_format:Y-m-d', 'to' => 'nullable|date_format:Y-m-d'.($r->filled('from') ? '|after_or_equal:from' : ''),
            'contract_id' => 'nullable|integer|min:1', 'property_id' => 'nullable|integer|min:1',
            'type' => 'nullable|in:rent,dewa,deposit,settlement,service_charge,other', 'page' => 'nullable|integer|min:1']);
    }
    private function payments(Request $r)
    {
        $this->filters($r);
        $q = Payment::whereHas('contract', $this->contractScope($r));
        if ($r->filled('from')) $q->whereDate('date', '>=', $r->from);
        if ($r->filled('to')) $q->whereDate('date', '<=', $r->to);
        if ($r->filled('type')) $q->where('type', $r->type);
        return $q;
    }
    private function ledgerQuery(Request $r)
    {
        $q = RentTransaction::whereHas('contract', $this->contractScope($r));
        if ($r->filled('from')) $q->whereDate('date', '>=', $r->from);
        if ($r->filled('to')) $q->whereDate('date', '<=', $r->to);
        return $q;
    }
    private function relations(): array
    {
        return ['contract:id,unit_id,tenant_id', 'contract.unit:id,number,property_id', 'contract.unit.property:id,name', 'tenant:id,name', 'recordedBy:id,name'];
    }
    public function index(Request $r)
    {
        $q = $this->payments($r);
        return response()->json(['data' => ['total_amount' => (clone $q)->sum('amount'), 'payments' => $q->with($this->relations())->orderByDesc('date')->orderByDesc('id')->paginate(25)]]);
    }
    public function summary(Request $r)
    {
        $q = $this->payments($r);
        $ledger = $this->ledgerQuery($r);
        $outstanding = RentTransaction::whereHas('contract', $this->contractScope($r))->selectRaw('COALESCE(SUM(debit-credit),0) as balance')->first()->balance;
        return response()->json(['data' => [
            'collections' => (clone $q)->sum('amount'), 'payment_count' => (clone $q)->count(),
            'today_collections' => (clone $q)->whereDate('date', today())->sum('amount'),
            'today_count' => (clone $q)->whereDate('date', today())->count(),
            'total_debit' => (clone $ledger)->sum('debit'), 'total_credit' => (clone $ledger)->sum('credit'),
            'outstanding' => $outstanding, 'business_date' => today()->toDateString(), 'timezone' => config('app.timezone'),
            'by_method' => (clone $q)->select('mode')->selectRaw('SUM(amount) as total')->groupBy('mode')->get(),
        ]]);
    }
    public function contracts(Request $r)
    {
        $this->filters($r);
        $q = Contract::query();
        ($this->contractScope($r))($q);
        $contracts = $q->select('id','unit_id','tenant_id','status')->with(['tenant:id,name','unit:id,number,property_id','unit.property:id,name'])->orderBy('id')->get();
        return response()->json(['data' => ['contracts' => $contracts]]);
    }
    public function ledger(Request $r)
    {
        abort_unless($r->user()->role === 'accountant', 403);
        $this->filters($r);
        $q = $this->ledgerQuery($r);
        return response()->json(['data' => ['total_debit' => (clone $q)->sum('debit'), 'total_credit' => (clone $q)->sum('credit'),
            'entries' => $q->orderByDesc('date')->orderByDesc('id')->paginate(25)]]);
    }
    public function receivables(Request $r)
    {
        $this->filters($r);
        $q = Contract::query();
        ($this->contractScope($r))($q);
        return response()->json(['data' => ['contracts' => $q->select('id','unit_id','tenant_id')
            ->with(['tenant:id,name','unit:id,number,property_id','unit.property:id,name'])
            ->withSum('rentTransactions as total_debit','debit')->withSum('rentTransactions as total_credit','credit')->orderBy('id')->paginate(25)]]);
    }
    public function show(Request $r, int $payment)
    {
        $record = $this->payments($r)->with($this->relations())->findOrFail($payment);
        return response()->json(['data' => ['payment' => $record]]);
    }
    public function receipt(Request $r, int $payment)
    {
        $record = $this->payments($r)->with($this->relations())->findOrFail($payment);
        return \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.staff-payment-receipt', ['payment' => $record])->download('receipt-'.$record->id.'.pdf');
    }
    public function store(Request $r)
    {
        $data = $r->validate([
            'contract_id' => 'required|integer', 'tenant_id' => 'prohibited', 'owner_id' => 'prohibited', 'recorded_by' => 'prohibited',
            'type' => 'required|in:rent,dewa,deposit,settlement,service_charge,other',
            'mode' => 'required|in:cash,card,bank_transfer,cheque,online',
            'amount' => ['required','numeric','min:1','max:99999999.99','decimal:0,2'],
            'date' => 'required|date_format:Y-m-d', 'due_date' => 'nullable|date_format:Y-m-d',
            'reference_number' => 'nullable|string|max:100', 'remarks' => 'nullable|string|max:2000',
            'idempotency_key' => 'required|uuid',
        ]);
        [$payment, $replay] = $this->staffPayments->record($r->user(), $data);
        return response()->json(['data' => ['payment' => $payment->load($this->relations()), 'replayed' => $replay]], $replay ? 200 : 201);
    }
}
