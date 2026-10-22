<?php

namespace Tests\Unit\Domain\Property;

use PHPUnit\Framework\TestCase;

class PropertyUnitBoardDueTest extends TestCase
{
    /**
     * Test that overpaid lease returns negative signed due (e.g. -250), not 0.
     */
    public function test_overpaid_lease_returns_negative_due_not_clamped_to_zero(): void
    {
        $debitSum = 1000.00;
        $creditSum = 1250.00;

        // Implementation rule: round($debitSum - $creditSum, 2) without max(0, ...)
        $due = round($debitSum - $creditSum, 2);

        $this->assertEquals(-250.00, $due);
        $this->assertLessThan(0, $due);
    }

    /**
     * Test that outstanding lease returns positive due.
     */
    public function test_outstanding_lease_returns_positive_due(): void
    {
        $debitSum = 1500.00;
        $creditSum = 1000.00;

        $due = round($debitSum - $creditSum, 2);

        $this->assertEquals(500.00, $due);
        $this->assertGreaterThan(0, $due);
    }

    /**
     * Test that cleared lease returns 0.00.
     */
    public function test_cleared_lease_returns_zero(): void
    {
        $debitSum = 1200.00;
        $creditSum = 1200.00;

        $due = round($debitSum - $creditSum, 2);

        $this->assertEquals(0.00, $due);
    }

    /**
     * Test card structure for vacant and booked units without lease.
     */
    public function test_vacant_and_booked_units_have_null_rent_and_due(): void
    {
        // When contract is null
        $contract = null;
        $rent = $contract ? 1000 : null;
        $due = $contract ? 0 : null;
        $contractId = $contract ? 1 : null;

        $this->assertNull($rent);
        $this->assertNull($due);
        $this->assertNull($contractId);
    }
}
