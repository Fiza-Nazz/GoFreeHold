<?php

namespace Tests\Unit\Domain\Dashboard;

use App\Domain\Contract\Models\Contract;
use App\Domain\Dashboard\Services\PostMonthlyRentService;
use App\Domain\Payment\Models\RentTransaction;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostMonthlyRentServiceTest extends TestCase
{
    use RefreshDatabase;

    private PostMonthlyRentService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(PostMonthlyRentService::class);
    }

    public function test_posts_debit_for_active_contract(): void
    {
        $contract = Contract::factory()->active()->create(['rent_amount' => 5000]);
        $month    = Carbon::now()->startOfMonth();

        $posted = $this->service->postDueForContract($contract, $month);

        $this->assertTrue($posted);
        $this->assertDatabaseHas('rent_transactions', [
            'contract_id' => $contract->id,
            'debit'       => 5000,
            'credit'      => 0,
        ]);
    }

    public function test_is_idempotent_for_same_month(): void
    {
        $contract = Contract::factory()->active()->create(['rent_amount' => 5000]);
        $month    = Carbon::now()->startOfMonth();

        $this->service->postDueForContract($contract, $month);
        $secondCall = $this->service->postDueForContract($contract, $month);

        $this->assertFalse($secondCall);
        $this->assertSame(1, RentTransaction::where('contract_id', $contract->id)->count());
    }

    public function test_posts_for_all_active_contracts_in_batch(): void
    {
        Contract::factory()->active()->count(3)->create();
        Contract::factory()->create(['status' => 'vacated']);

        $result = $this->service->postForCurrentMonth();

        $this->assertSame(3, $result['posted']);
        $this->assertSame(0, $result['skipped']);
    }

    public function test_skipped_count_when_already_posted(): void
    {
        $contract = Contract::factory()->active()->create();
        $month    = Carbon::now()->startOfMonth();

        $this->service->postDueForContract($contract, $month);

        $result = $this->service->postForCurrentMonth();

        $this->assertSame(0, $result['posted']);
        $this->assertSame(1, $result['skipped']);
    }
}
