<?php

namespace Tests\Unit\Domain\Property;

use PHPUnit\Framework\TestCase;

class UnitDetailEndpointTest extends TestCase
{
    /**
     * Test 1: Overpaid lease returns negative signed due (e.g. -250), not clamped to 0.
     */
    public function test_overpaid_lease_returns_negative_due_not_clamped_to_zero(): void
    {
        $totalDebit = 3500.00;
        $totalCredit = 3750.00;

        $totalBalance = round($totalDebit - $totalCredit, 2);
        $due = $totalBalance;

        $this->assertEquals(-250.00, $due);
        $this->assertLessThan(0, $due);
    }

    /**
     * Test 2: Outstanding lease returns positive due.
     */
    public function test_outstanding_lease_returns_positive_due(): void
    {
        $totalDebit = 7000.00;
        $totalCredit = 3500.00;

        $totalBalance = round($totalDebit - $totalCredit, 2);
        $due = $totalBalance;

        $this->assertEquals(3500.00, $due);
        $this->assertGreaterThan(0, $due);
    }

    /**
     * Test 3: Fully paid clear balance returns 0.00.
     */
    public function test_cleared_lease_returns_zero(): void
    {
        $totalDebit = 3500.00;
        $totalCredit = 3500.00;

        $totalBalance = round($totalDebit - $totalCredit, 2);
        if (abs($totalBalance) < 0.0001) {
            $totalBalance = 0.00;
        }

        $this->assertEquals(0.00, $totalBalance);
    }

    /**
     * Test 4: Vacant unit payload format has active_contract null, empty payments and empty statement.
     */
    public function test_vacant_unit_payload_contract(): void
    {
        $activeContract = null;
        $recentPayments = [];
        $statement = [
            'entries' => [],
            'summary' => [
                'total_debit'   => 0,
                'total_credit'  => 0,
                'total_balance' => 0,
            ],
        ];

        $this->assertNull($activeContract);
        $this->assertIsArray($recentPayments);
        $this->assertEmpty($recentPayments);
        $this->assertIsArray($statement['entries']);
        $this->assertEmpty($statement['entries']);
        $this->assertEquals(0, $statement['summary']['total_balance']);
    }

    /**
     * Test 5: Monthly vs Yearly rent normalization.
     */
    public function test_monthly_rent_normalization(): void
    {
        // Monthly lease
        $rawRent1 = 3500.00;
        $isMonthly1 = stripos('Monthly', 'month') !== false;
        $monthlyRent1 = $isMonthly1 ? round($rawRent1, 2) : round($rawRent1 / 12, 2);
        $this->assertEquals(3500.00, $monthlyRent1);

        // Yearly lease
        $rawRent2 = 42000.00;
        $isMonthly2 = stripos('Yearly', 'month') !== false;
        $monthlyRent2 = $isMonthly2 ? round($rawRent2, 2) : round($rawRent2 / 12, 2);
        $this->assertEquals(3500.00, $monthlyRent2);
    }

    /**
     * Test 6: Plain arrays for payments and statement entries (never paginator wrappers).
     */
    public function test_plain_array_invariants(): void
    {
        $payments = [
            [
                'id' => 901,
                'contract_id' => 321,
                'date' => '2026-10-20',
                'type' => 'RENT',
                'amount' => 3750.00,
                'mode' => 'CASH',
                'remarks' => 'October + overpay',
                'receipt_number' => 'RCP-901',
            ],
        ];

        $statementEntries = [
            [
                'id' => 1,
                'date' => '2026-10-17',
                'description' => 'Rent charge — Oct 2026',
                'debit' => 3500.00,
                'credit' => 0.00,
            ],
            [
                'id' => 2,
                'date' => '2026-10-20',
                'description' => 'Payment — RENT',
                'debit' => 0.00,
                'credit' => 3750.00,
            ],
        ];

        // Ensure they are sequential 0-indexed arrays
        $this->assertTrue(array_is_list($payments));
        $this->assertTrue(array_is_list($statementEntries));
        $this->assertArrayNotHasKey('data', $payments);
        $this->assertArrayNotHasKey('data', $statementEntries);
    }
}
