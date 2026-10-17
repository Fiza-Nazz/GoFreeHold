<?php

namespace App\Domain\Accounting\Services;

use App\Domain\Accounting\Models\ChartAccount;
use Illuminate\Support\Collection;

class ReportTreeBuilder
{
    /**
     * Nest accounts by parent_coa into a hierarchy of GROUP nodes and LEDGER leaves.
     *
     * @param Collection<int, ChartAccount> $accounts
     * @param array<int, float> $balances [chartaccount_id => amount]
     * @return array<array<string, mixed>>
     */
    public function nestByParent(Collection $accounts, array $balances): array
    {
        $groups = [];
        $ledgersByParent = [];
        $orphans = [];

        foreach ($accounts as $acc) {
            if ($acc->isGroup()) {
                $groups[$acc->id] = [
                    'id'       => (int) $acc->id,
                    'code'     => $acc->code,
                    'name'     => $acc->name,
                    'type'     => $acc->type,
                    'amount'   => 0.0,
                    'children' => [],
                ];
            }
        }

        foreach ($accounts as $acc) {
            if ($acc->isLedger()) {
                $amount = (float) ($balances[$acc->id] ?? 0.0);
                $node = [
                    'id'     => (int) $acc->id,
                    'code'   => $acc->code,
                    'name'   => $acc->name,
                    'type'   => $acc->type,
                    'amount' => round($amount, 2),
                ];

                $parentId = $acc->parentGroupId();
                if ($parentId && isset($groups[$parentId])) {
                    $ledgersByParent[$parentId][] = $node;
                } else {
                    $orphans[] = $node;
                }
            }
        }

        // Attach ledgers to groups and roll up group amounts
        $tree = [];
        foreach ($groups as $groupId => $group) {
            $children = $ledgersByParent[$groupId] ?? [];
            $groupSum = 0.0;
            foreach ($children as $child) {
                $groupSum += (float) $child['amount'];
            }
            $group['amount'] = round($groupSum, 2);
            $group['children'] = $children;

            // Only include group if it has children or non-zero
            $tree[] = $group;
        }

        // Add orphan ledgers directly to tree
        foreach ($orphans as $orphan) {
            $tree[] = $orphan;
        }

        return $tree;
    }
}
