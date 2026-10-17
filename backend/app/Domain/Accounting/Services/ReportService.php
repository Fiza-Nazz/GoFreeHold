<?php

namespace App\Domain\Accounting\Services;

use App\Domain\Accounting\Models\ChartAccount;
use App\Domain\Accounting\Models\Ledger;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function __construct(private readonly ReportTreeBuilder $treeBuilder)
    {
    }

    /**
     * Trial Balance Report
     */
    public function trialBalance(int $organizationId, ?string $asOf = null, ?int $ownerId = null): array
    {
        $query = DB::table('ac_ledgers as l')
            ->join('ac_transactions as t', 't.id', '=', 'l.trans_id')
            ->join('ac_chart_accounts as a', 'a.id', '=', 'l.chartaccount_id')
            ->where('l.organization_id', $organizationId)
            ->where('t.status', 'COMPLETED')
            ->where('a.description', 'LEDGER');

        if ($asOf) {
            $query->where('t.date', '<=', $asOf);
        }
        if ($ownerId) {
            $query->where('t.owner_id', $ownerId);
        }

        $rows = $query->select(
            'a.id as account_id',
            'a.code',
            'a.name',
            'a.type',
            'a.dr_cr',
            DB::raw('SUM(l.debit) as total_debit'),
            DB::raw('SUM(l.credit) as total_credit')
        )
            ->groupBy('a.id', 'a.code', 'a.name', 'a.type', 'a.dr_cr')
            ->orderBy('a.code')
            ->get();

        $accounts = [];
        $sumDebit = 0.0;
        $sumCredit = 0.0;

        foreach ($rows as $row) {
            $dr = (float) $row->total_debit;
            $cr = (float) $row->total_credit;
            $sumDebit += $dr;
            $sumCredit += $cr;

            $accounts[] = [
                'id'           => (int) $row->account_id,
                'code'         => $row->code,
                'name'         => $row->name,
                'type'         => $row->type,
                'dr_cr'        => $row->dr_cr,
                'total_debit'  => round($dr, 2),
                'total_credit' => round($cr, 2),
                'net_debit'    => round(max(0, $dr - $cr), 2),
                'net_credit'   => round(max(0, $cr - $dr), 2),
            ];
        }

        $diff = abs($sumDebit - $sumCredit);

        return [
            'as_of'        => $asOf ?? now()->toDateString(),
            'total_debit'  => round($sumDebit, 2),
            'total_credit' => round($sumCredit, 2),
            'balanced'     => $diff < 0.001,
            'accounts'     => $accounts,
        ];
    }

    /**
     * Income Statement (P&L) with nested parent-child tree
     */
    public function incomeStatement(int $organizationId, ?string $from = null, ?string $to = null, ?int $ownerId = null): array
    {
        $from = $from ?? now()->startOfYear()->toDateString();
        $to = $to ?? now()->toDateString();

        $query = DB::table('ac_ledgers as l')
            ->join('ac_transactions as t', 't.id', '=', 'l.trans_id')
            ->join('ac_chart_accounts as a', 'a.id', '=', 'l.chartaccount_id')
            ->where('l.organization_id', $organizationId)
            ->where('t.status', 'COMPLETED')
            ->where('a.description', 'LEDGER')
            ->whereBetween('t.date', [$from, $to])
            ->whereIn('a.type', ['revenue', 'cogs', 'expense']);

        if ($ownerId) {
            $query->where('t.owner_id', $ownerId);
        }

        $lines = $query->select(
            'a.id',
            'a.type',
            DB::raw('SUM(l.debit) as total_debit'),
            DB::raw('SUM(l.credit) as total_credit')
        )
            ->groupBy('a.id', 'a.type')
            ->get();

        $balances = [];
        $totalRevenue = 0.0;
        $totalCogs = 0.0;
        $totalExpenses = 0.0;

        foreach ($lines as $line) {
            $dr = (float) $line->total_debit;
            $cr = (float) $line->total_credit;

            if ($line->type === 'revenue') {
                $amount = $cr - $dr;
                $balances[$line->id] = $amount;
                $totalRevenue += $amount;
            } elseif ($line->type === 'cogs') {
                $amount = $dr - $cr;
                $balances[$line->id] = $amount;
                $totalCogs += $amount;
            } elseif ($line->type === 'expense') {
                $amount = $dr - $cr;
                $balances[$line->id] = $amount;
                $totalExpenses += $amount;
            }
        }

        $allAccounts = ChartAccount::where('organization_id', $organizationId)
            ->whereIn('type', ['revenue', 'cogs', 'expense'])
            ->get();

        $revenueAccounts = $allAccounts->where('type', 'revenue');
        $cogsAccounts = $allAccounts->where('type', 'cogs');
        $expenseAccounts = $allAccounts->where('type', 'expense');

        $revenueTree = $this->treeBuilder->nestByParent($revenueAccounts, $balances);
        $cogsTree = $this->treeBuilder->nestByParent($cogsAccounts, $balances);
        $expenseTree = $this->treeBuilder->nestByParent($expenseAccounts, $balances);

        $grossProfit = $totalRevenue - $totalCogs;
        $netIncome = $grossProfit - $totalExpenses;

        $sections = [
            [
                'id'       => -1,
                'name'     => 'Revenue',
                'amount'   => round($totalRevenue, 2),
                'children' => $revenueTree,
            ],
        ];

        if ($totalCogs > 0 || !empty($cogsTree)) {
            $sections[] = [
                'id'       => -2,
                'name'     => 'Cost of Sales',
                'amount'   => round($totalCogs, 2),
                'children' => $cogsTree,
            ];
        }

        $sections[] = [
            'id'     => -3,
            'name'   => 'Gross Profit',
            'amount' => round($grossProfit, 2),
        ];

        $sections[] = [
            'id'       => -4,
            'name'     => 'Operating Expenses',
            'amount'   => round($totalExpenses, 2),
            'children' => $expenseTree,
        ];

        $sections[] = [
            'id'     => -5,
            'name'   => 'Net Income',
            'amount' => round($netIncome, 2),
        ];

        return [
            'from'       => $from,
            'to'         => $to,
            'currency'   => 'AED',
            'net_income' => round($netIncome, 2),
            'sections'   => $sections,
        ];
    }

    /**
     * Balance Sheet with Net Income integration and Assets = Liabilities + Equity check
     */
    public function balanceSheet(int $organizationId, ?string $asOf = null, ?int $ownerId = null): array
    {
        $asOf = $asOf ?? now()->toDateString();

        // 1. Calculate cumulative Net Income up to as_of
        $pnlQuery = DB::table('ac_ledgers as l')
            ->join('ac_transactions as t', 't.id', '=', 'l.trans_id')
            ->join('ac_chart_accounts as a', 'a.id', '=', 'l.chartaccount_id')
            ->where('l.organization_id', $organizationId)
            ->where('t.status', 'COMPLETED')
            ->where('a.description', 'LEDGER')
            ->where('t.date', '<=', $asOf)
            ->whereIn('a.type', ['revenue', 'cogs', 'expense']);

        if ($ownerId) {
            $pnlQuery->where('t.owner_id', $ownerId);
        }

        $pnlLines = $pnlQuery->select(
            'a.type',
            DB::raw('SUM(l.debit) as total_debit'),
            DB::raw('SUM(l.credit) as total_credit')
        )->groupBy('a.type')->get();

        $cumRevenue = 0.0;
        $cumCogs = 0.0;
        $cumExpense = 0.0;
        foreach ($pnlLines as $row) {
            $dr = (float) $row->total_debit;
            $cr = (float) $row->total_credit;
            if ($row->type === 'revenue') $cumRevenue += ($cr - $dr);
            if ($row->type === 'cogs') $cumCogs += ($dr - $cr);
            if ($row->type === 'expense') $cumExpense += ($dr - $cr);
        }
        $netIncome = $cumRevenue - $cumCogs - $cumExpense;

        // 2. Calculate balance sheet balances (asset, liability, equity)
        $bsQuery = DB::table('ac_ledgers as l')
            ->join('ac_transactions as t', 't.id', '=', 'l.trans_id')
            ->join('ac_chart_accounts as a', 'a.id', '=', 'l.chartaccount_id')
            ->where('l.organization_id', $organizationId)
            ->where('t.status', 'COMPLETED')
            ->where('a.description', 'LEDGER')
            ->where('t.date', '<=', $asOf)
            ->whereIn('a.type', ['asset', 'liability', 'equity']);

        if ($ownerId) {
            $bsQuery->where('t.owner_id', $ownerId);
        }

        $bsLines = $bsQuery->select(
            'a.id',
            'a.type',
            DB::raw('SUM(l.debit) as total_debit'),
            DB::raw('SUM(l.credit) as total_credit')
        )->groupBy('a.id', 'a.type')->get();

        $balances = [];
        $totalAssets = 0.0;
        $totalLiabilities = 0.0;
        $totalEquityAccounts = 0.0;

        foreach ($bsLines as $line) {
            $dr = (float) $line->total_debit;
            $cr = (float) $line->total_credit;

            if ($line->type === 'asset') {
                $amount = $dr - $cr;
                $balances[$line->id] = $amount;
                $totalAssets += $amount;
            } elseif ($line->type === 'liability') {
                $amount = $cr - $dr;
                $balances[$line->id] = $amount;
                $totalLiabilities += $amount;
            } elseif ($line->type === 'equity') {
                $amount = $cr - $dr;
                $balances[$line->id] = $amount;
                $totalEquityAccounts += $amount;
            }
        }

        $allAccounts = ChartAccount::where('organization_id', $organizationId)
            ->whereIn('type', ['asset', 'liability', 'equity'])
            ->get();

        $assetTree = $this->treeBuilder->nestByParent($allAccounts->where('type', 'asset'), $balances);
        $liabilityTree = $this->treeBuilder->nestByParent($allAccounts->where('type', 'liability'), $balances);
        $equityTree = $this->treeBuilder->nestByParent($allAccounts->where('type', 'equity'), $balances);

        // Append synthetic child under Equity for Net Income
        $equityTree[] = [
            'id'     => -99,
            'code'   => 'NET-INC',
            'name'   => 'Net Income (Current Period)',
            'type'   => 'equity',
            'amount' => round($netIncome, 2),
        ];

        $totalEquity = $totalEquityAccounts + $netIncome;
        $totalLiabilitiesAndEquity = $totalLiabilities + $totalEquity;
        $diff = abs($totalAssets - $totalLiabilitiesAndEquity);

        $sections = [
            [
                'id'       => -1,
                'name'     => 'Assets',
                'amount'   => round($totalAssets, 2),
                'children' => $assetTree,
            ],
            [
                'id'       => -2,
                'name'     => 'Liabilities',
                'amount'   => round($totalLiabilities, 2),
                'children' => $liabilityTree,
            ],
            [
                'id'       => -3,
                'name'     => 'Equity',
                'amount'   => round($totalEquity, 2),
                'children' => $equityTree,
            ],
            [
                'id'     => -4,
                'name'   => 'Total Liabilities & Equity',
                'amount' => round($totalLiabilitiesAndEquity, 2),
            ],
        ];

        return [
            'as_of'                        => $asOf,
            'currency'                     => 'AED',
            'total_assets'                 => round($totalAssets, 2),
            'total_liabilities'            => round($totalLiabilities, 2),
            'total_equity'                 => round($totalEquity, 2),
            'total_liabilities_and_equity' => round($totalLiabilitiesAndEquity, 2),
            'net_income'                   => round($netIncome, 2),
            'balanced'                     => $diff < 0.01,
            'sections'                     => $sections,
        ];
    }

    /**
     * Cash Flow Statement (Direct/Indirect Hybrid)
     */
    public function cashFlow(int $organizationId, ?string $from = null, ?string $to = null, ?int $ownerId = null): array
    {
        $from = $from ?? now()->startOfMonth()->toDateString();
        $to = $to ?? now()->toDateString();

        // 1. Identify cash accounts
        $cashAccountIds = ChartAccount::where('organization_id', $organizationId)
            ->where('description', 'LEDGER')
            ->get()
            ->filter(fn (ChartAccount $a) => $a->isCashLike())
            ->pluck('id')
            ->toArray();

        if (empty($cashAccountIds)) {
            return [
                'from'            => $from,
                'to'              => $to,
                'opening_balance' => 0.0,
                'operating'       => 0.0,
                'investing'       => 0.0,
                'financing'       => 0.0,
                'net_change'      => 0.0,
                'closing_balance' => 0.0,
                'reconciled'      => true,
            ];
        }

        // 2. Opening Balance: cash lines where date < from
        $openRow = DB::table('ac_ledgers as l')
            ->join('ac_transactions as t', 't.id', '=', 'l.trans_id')
            ->where('l.organization_id', $organizationId)
            ->where('t.status', 'COMPLETED')
            ->whereIn('l.chartaccount_id', $cashAccountIds)
            ->where('t.date', '<', $from)
            ->selectRaw('SUM(l.debit - l.credit) as balance')
            ->first();
        $openingBalance = (float) ($openRow->balance ?? 0.0);

        // 3. Transactions moving cash in the period
        $cashTransIds = DB::table('ac_ledgers as l')
            ->join('ac_transactions as t', 't.id', '=', 'l.trans_id')
            ->where('l.organization_id', $organizationId)
            ->where('t.status', 'COMPLETED')
            ->whereIn('l.chartaccount_id', $cashAccountIds)
            ->whereBetween('t.date', [$from, $to])
            ->pluck('l.trans_id')
            ->unique()
            ->toArray();

        $operating = 0.0;
        $investing = 0.0;
        $financing = 0.0;

        if (!empty($cashTransIds)) {
            // Find counterparties (non-cash lines of those transactions)
            $counterparties = DB::table('ac_ledgers as l')
                ->join('ac_chart_accounts as a', 'a.id', '=', 'l.chartaccount_id')
                ->whereIn('l.trans_id', $cashTransIds)
                ->whereNotIn('l.chartaccount_id', $cashAccountIds)
                ->select(
                    'a.type',
                    'a.code',
                    'a.name',
                    DB::raw('SUM(l.credit - l.debit) as net_cash_effect') // credit on counterparty = debit on cash
                )
                ->groupBy('a.type', 'a.code', 'a.name')
                ->get();

            foreach ($counterparties as $cp) {
                $effect = (float) $cp->net_cash_effect;
                $type = strtolower((string) $cp->type);

                if (in_array($type, ['equity'])) {
                    $financing += $effect;
                } elseif (in_array($type, ['cogs'])) {
                    $operating += $effect;
                } else {
                    $operating += $effect;
                }
            }
        }

        $netChange = $operating + $investing + $financing;
        $closingBalance = $openingBalance + $netChange;

        // Closing cash verification
        $actualCloseRow = DB::table('ac_ledgers as l')
            ->join('ac_transactions as t', 't.id', '=', 'l.trans_id')
            ->where('l.organization_id', $organizationId)
            ->where('t.status', 'COMPLETED')
            ->whereIn('l.chartaccount_id', $cashAccountIds)
            ->where('t.date', '<=', $to)
            ->selectRaw('SUM(l.debit - l.credit) as balance')
            ->first();
        $actualClosing = (float) ($actualCloseRow->balance ?? 0.0);

        return [
            'from'            => $from,
            'to'              => $to,
            'opening_balance' => round($openingBalance, 2),
            'operating'       => round($operating, 2),
            'investing'       => round($investing, 2),
            'financing'       => round($financing, 2),
            'net_change'      => round($netChange, 2),
            'closing_balance' => round($closingBalance, 2),
            'reconciled'      => abs($closingBalance - $actualClosing) < 0.01,
        ];
    }

    /**
     * Running Cash Ledger
     */
    public function cashRunning(int $organizationId, ?string $from = null, ?string $to = null, ?int $accountId = null): array
    {
        $cashQuery = ChartAccount::where('organization_id', $organizationId)
            ->where('description', 'LEDGER');

        if ($accountId) {
            $cashQuery->where('id', $accountId);
        }

        $cashAccounts = $cashQuery->get()->filter(fn (ChartAccount $a) => $a->isCashLike());
        $cashAccountIds = $cashAccounts->pluck('id')->toArray();

        if (empty($cashAccountIds)) {
            return ['opening_balance' => 0.0, 'entries' => [], 'closing_balance' => 0.0];
        }

        $from = $from ?? now()->startOfMonth()->toDateString();
        $to = $to ?? now()->toDateString();

        // Opening balance before 'from'
        $openRow = DB::table('ac_ledgers as l')
            ->join('ac_transactions as t', 't.id', '=', 'l.trans_id')
            ->where('l.organization_id', $organizationId)
            ->where('t.status', 'COMPLETED')
            ->whereIn('l.chartaccount_id', $cashAccountIds)
            ->where('t.date', '<', $from)
            ->selectRaw('SUM(l.debit - l.credit) as balance')
            ->first();
        $runningBalance = (float) ($openRow->balance ?? 0.0);
        $openingBalance = $runningBalance;

        $lines = DB::table('ac_ledgers as l')
            ->join('ac_transactions as t', 't.id', '=', 'l.trans_id')
            ->join('ac_chart_accounts as a', 'a.id', '=', 'l.chartaccount_id')
            ->where('l.organization_id', $organizationId)
            ->where('t.status', 'COMPLETED')
            ->whereIn('l.chartaccount_id', $cashAccountIds)
            ->whereBetween('t.date', [$from, $to])
            ->orderBy('t.date')
            ->orderBy('t.id')
            ->orderBy('l.id')
            ->select(
                'l.id as ledger_id',
                't.id as trans_id',
                't.date',
                't.description',
                't.source_type',
                't.source_id',
                'a.name as account_name',
                'a.code as account_code',
                'l.debit',
                'l.credit'
            )
            ->get();

        $entries = [];
        foreach ($lines as $line) {
            $dr = (float) $line->debit;
            $cr = (float) $line->credit;
            $runningBalance += ($dr - $cr);

            $entries[] = [
                'ledger_id'       => (int) $line->ledger_id,
                'trans_id'        => (int) $line->trans_id,
                'date'            => $line->date,
                'description'     => $line->description,
                'source_type'     => $line->source_type,
                'source_id'       => $line->source_id ? (int) $line->source_id : null,
                'account_name'    => $line->account_name,
                'account_code'    => $line->account_code,
                'debit'           => round($dr, 2),
                'credit'          => round($cr, 2),
                'running_balance' => round($runningBalance, 2),
            ];
        }

        return [
            'opening_balance' => round($openingBalance, 2),
            'closing_balance' => round($runningBalance, 2),
            'entries'         => $entries,
        ];
    }

    /**
     * Account Ledger for a specific chart account
     */
    public function accountLedger(int $organizationId, int $accountId, ?string $from = null, ?string $to = null): array
    {
        $account = ChartAccount::where('organization_id', $organizationId)
            ->where('id', $accountId)
            ->firstOrFail();

        $from = $from ?? now()->startOfMonth()->toDateString();
        $to = $to ?? now()->toDateString();

        $isDebitNormal = in_array(strtolower((string) $account->type), ['asset', 'expense', 'cogs']);

        // Opening balance before 'from'
        $openRow = DB::table('ac_ledgers as l')
            ->join('ac_transactions as t', 't.id', '=', 'l.trans_id')
            ->where('l.organization_id', $organizationId)
            ->where('l.chartaccount_id', $accountId)
            ->where('t.status', 'COMPLETED')
            ->where('t.date', '<', $from)
            ->selectRaw('SUM(l.debit) as dr, SUM(l.credit) as cr')
            ->first();

        $openDr = (float) ($openRow->dr ?? 0.0);
        $openCr = (float) ($openRow->cr ?? 0.0);
        $runningBalance = $isDebitNormal ? ($openDr - $openCr) : ($openCr - $openDr);
        $openingBalance = $runningBalance;

        $lines = DB::table('ac_ledgers as l')
            ->join('ac_transactions as t', 't.id', '=', 'l.trans_id')
            ->where('l.organization_id', $organizationId)
            ->where('l.chartaccount_id', $accountId)
            ->where('t.status', 'COMPLETED')
            ->whereBetween('t.date', [$from, $to])
            ->orderBy('t.date')
            ->orderBy('t.id')
            ->orderBy('l.id')
            ->select(
                'l.id as ledger_id',
                't.id as trans_id',
                't.date',
                't.description',
                't.source_type',
                't.source_id',
                'l.debit',
                'l.credit'
            )
            ->get();

        $entries = [];
        foreach ($lines as $line) {
            $dr = (float) $line->debit;
            $cr = (float) $line->credit;
            $runningBalance += $isDebitNormal ? ($dr - $cr) : ($cr - $dr);

            $entries[] = [
                'ledger_id'       => (int) $line->ledger_id,
                'trans_id'        => (int) $line->trans_id,
                'date'            => $line->date,
                'description'     => $line->description,
                'source_type'     => $line->source_type,
                'source_id'       => $line->source_id ? (int) $line->source_id : null,
                'debit'           => round($dr, 2),
                'credit'          => round($cr, 2),
                'running_balance' => round($runningBalance, 2),
            ];
        }

        return [
            'account'         => [
                'id'          => $account->id,
                'code'        => $account->code,
                'name'        => $account->name,
                'type'        => $account->type,
                'description' => $account->description,
            ],
            'from'            => $from,
            'to'              => $to,
            'opening_balance' => round($openingBalance, 2),
            'closing_balance' => round($runningBalance, 2),
            'entries'         => $entries,
        ];
    }
}
