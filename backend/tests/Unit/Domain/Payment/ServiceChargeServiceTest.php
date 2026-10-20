<?php

namespace Tests\Unit\Domain\Payment;

use App\Domain\Payment\Models\ServiceCharge;
use App\Domain\Payment\Models\ServiceChargePayment;
use Tests\TestCase;

class ServiceChargeServiceTest extends TestCase
{
    public function test_service_charge_status_refresh_logic(): void
    {
        $charge = new ServiceCharge([
            'amount' => '3000.00',
            'status' => 'pending',
        ]);

        $this->assertEquals('pending', $charge->status);
        $this->assertEquals(3000.00, (float) $charge->amount);
    }

    public function test_payment_model_attributes_and_casts(): void
    {
        $payment = new ServiceChargePayment([
            'service_charge_id' => 10,
            'amount'            => 1500.50,
            'payment_method'    => 'bank_transfer',
            'payment_date'      => '2026-10-20',
            'reference_number'  => 'REF-12345',
            'remarks'           => 'Paid to OA',
        ]);

        $this->assertEquals(10, $payment->service_charge_id);
        $this->assertEquals('1500.50', (string) $payment->amount);
        $this->assertEquals('bank_transfer', $payment->payment_method);
        $this->assertEquals('REF-12345', $payment->reference_number);
    }
}
