<?php

namespace App\Domain\Contract\Services;

use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\Contract;
use App\Domain\Dashboard\Services\PostMonthlyRentService;
use App\Domain\Property\Models\Unit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use InvalidArgumentException;

/**
 * Domain Service for Contract Lifecycle & Tenant Onboarding
 *
 * Encapsulates:
 * 1. Automatic Tenant & User profile resolution/creation when creating a contract.
 * 2. Unit occupancy state transitions.
 * 3. Double-entry rent ledger initial due posting.
 * 4. Contract renewals and vacating lifecycles.
 */
class ContractService
{
    public function __construct(
        protected PostMonthlyRentService $rentDueService,
        protected ContractVacateService $vacateService
    ) {}

    /**
     * Create a new tenancy contract, automatically resolving/creating tenant details if provided,
     * occupying the unit, and posting initial first-month rent due debit.
     *
     * @param array $data
     * @return Contract
     * @throws InvalidArgumentException|\Exception
     */
    public function createContract(array $data): Contract
    {
        return DB::transaction(function () use ($data) {
            // 1. Resolve or Auto-Create Tenant
            $tenantId = $this->resolveTenantId($data);
            $data['tenant_id'] = $tenantId;

            // Remove tenant-specific inline attributes so they don't break Contract::create()
            unset(
                $data['tenant_name'],
                $data['tenant_email'],
                $data['tenant_phone'],
                $data['tenant_emirates_id'],
                $data['tenant_nationality'],
                $data['tenant_passport_number'],
                $data['tenant_address']
            );

            // 2. Validate Unit Occupancy
            $unit = Unit::lockForUpdate()->findOrFail($data['unit_id']);
            if ($unit->status === 'OCCUPIED') {
                throw new InvalidArgumentException('The selected unit is already occupied.');
            }

            // 3. Create Contract
            $data['status'] = 'active';
            $contract = Contract::create($data);

            // 4. Update Unit Status to OCCUPIED
            $unit->update(['status' => 'OCCUPIED']);

            // 5. Post Initial First-Month Rent Due in Rent Transactions Ledger
            $this->rentDueService->postInitialDueForContract($contract);

            return $contract;
        });
    }

    /**
     * Resolve existing tenant ID or automatically create User + Tenant record.
     *
     * @param array $data
     * @return int
     */
    public function resolveTenantId(array $data): int
    {
        if (!empty($data['tenant_id'])) {
            return (int) $data['tenant_id'];
        }

        $tenantEmail = $data['tenant_email'] ?? null;
        $tenantName  = $data['tenant_name'] ?? 'Tenant User';
        $phone       = $data['tenant_phone'] ?? null;
        $emiratesId  = $data['tenant_emirates_id'] ?? null;
        $nationality = $data['tenant_nationality'] ?? null;
        $passport    = $data['tenant_passport_number'] ?? null;
        $address     = $data['tenant_address'] ?? null;

        // If an email is provided, check if user already exists
        $user = null;
        if ($tenantEmail) {
            $user = User::where('email', $tenantEmail)->first();
        }

        if (!$user) {
            // Generate fallback unique email if none provided
            $email = $tenantEmail ?: 'tenant_' . Str::random(8) . '@gofreehold.com';
            $user = User::create([
                'name'     => $tenantName,
                'email'    => $email,
                'password' => Hash::make(Str::random(16)),
                'role'     => 'tenant',
            ]);
        }

        // Check if tenant profile exists for this user
        $tenant = Tenant::where('user_id', $user->id)->first();

        if (!$tenant) {
            $tenant = Tenant::create([
                'user_id'         => $user->id,
                'name'            => $tenantName,
                'email'           => $user->email,
                'phone'           => $phone,
                'contact'         => $phone,
                'emirates_id'     => $emiratesId,
                'nationality'     => $nationality,
                'passport_number' => $passport,
                'address'         => $address,
            ]);
        } else {
            // Update profile with any newly provided details
            $updates = array_filter([
                'name'            => $tenantName ?: $tenant->name,
                'phone'           => $phone ?: $tenant->phone,
                'contact'         => $phone ?: $tenant->contact,
                'emirates_id'     => $emiratesId ?: $tenant->emirates_id,
                'nationality'     => $nationality ?: $tenant->nationality,
                'passport_number' => $passport ?: $tenant->passport_number,
                'address'         => $address ?: $tenant->address,
            ]);
            if (!empty($updates)) {
                $tenant->update($updates);
            }
        }

        return $tenant->id;
    }

    /**
     * Renew an existing contract.
     *
     * @param Contract $contract
     * @param array $data
     * @return Contract
     */
    public function renewContract(Contract $contract, array $data): Contract
    {
        $contract->update([
            'end_date'        => $data['new_end_date'],
            'rent_amount'     => $data['new_rent_amount'] ?? $contract->rent_amount,
            'status'          => 'active',
            'last_renewed_at' => now(),
        ]);

        return $contract;
    }

    /**
     * Vacate a contract and release the linked unit.
     *
     * @param Contract $contract
     * @param string|null $notes
     * @return void
     */
    public function vacateContract(Contract $contract, ?string $notes = null): void
    {
        $this->vacateService->vacate($contract, $notes);
    }
}
