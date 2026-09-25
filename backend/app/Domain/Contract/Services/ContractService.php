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

            $paymentFrequency    = $data['payment_frequency'] ?? ($data['lease_term'] ?? null);
            $numberOfCheques     = isset($data['number_of_cheques']) && $data['number_of_cheques'] !== ''
                ? (int) $data['number_of_cheques']
                : null;
            $firstPaymentDueDate = $data['first_payment_due_date'] ?? ($data['due_date'] ?? ($data['start_date'] ?? null));
            $firstChequeNumber   = $data['first_cheque_number'] ?? null;
            $chequeBank          = $data['cheque_bank'] ?? 'Emirates NBD';

            // Remove inline attributes that are not columns on contracts table
            unset(
                $data['tenant_name'],
                $data['tenant_email'],
                $data['tenant_phone'],
                $data['tenant_emirates_id'],
                $data['tenant_nationality'],
                $data['tenant_passport_number'],
                $data['tenant_address'],
                $data['payment_frequency'],
                $data['number_of_cheques'],
                $data['first_payment_due_date'],
                $data['first_cheque_number'],
                $data['cheque_bank']
            );

            // 2. Validate Unit Occupancy
            $unit = Unit::lockForUpdate()->findOrFail($data['unit_id']);
            if ($unit->status === 'OCCUPIED') {
                throw new InvalidArgumentException('The selected unit is already occupied.');
            }

            // 3. Create Contract and set status to Active
            $data['status']         = 'active';
            $data['date']           = $data['date'] ?? now()->toDateString();
            $data['due_date']       = $data['due_date'] ?? $firstPaymentDueDate;
            $data['lease_term']     = $data['lease_term'] ?? ($paymentFrequency ?: 'Annual');
            $data['contract_value'] = $data['contract_value'] ?? $data['rent_amount'];

            $contract = Contract::create($data);

            // 4. Update Unit Status from AVAILABLE -> OCCUPIED
            $unit->update(['status' => 'OCCUPIED']);

            // 5. Create Default Addendum (TenancyContract c1..c8) & Terms for PDF / Ejari
            \App\Domain\Contract\Models\TenancyContract::create([
                'contract_id' => $contract->id,
                'c1' => 'The tenant shall use the leased premises strictly for ' . ($contract->type ?? 'residential') . ' purposes only and shall not sublease without prior written consent of the landlord.',
                'c2' => 'All utility bills including DEWA, chiller, gas, and telecommunications shall be borne and paid directly by the tenant during the tenancy period.',
                'c3' => 'The security deposit of AED ' . number_format((float) ($contract->security_deposit ?? 0), 2) . ' is refundable upon vacating the unit, subject to clearance of all utility bills and deduction for any damages beyond normal wear and tear.',
                'c4' => 'Minor maintenance and day-to-day repairs up to AED 500 per occurrence are the responsibility of the tenant; major structural and MEP repairs are the responsibility of the landlord.',
                'c5' => 'The tenant shall not make any structural alterations, partitioning, or modifications to the premises without written approval from the landlord and building management.',
                'c6' => 'A dishonoured/bounced cheque penalty of AED 500 shall be charged to the tenant for each returned cheque.',
                'c7' => 'Either party must give at least 90 days written notice prior to contract expiry for non-renewal or any amendment to the tenancy terms in accordance with RERA regulations.',
                'c8' => 'Upon expiry or termination, the tenant shall hand over the unit in good, clean, and repainted condition along with all original keys and access cards.',
            ]);

            \App\Domain\Contract\Models\Term::create([
                'cid'   => $contract->id,
                'terms' => 'Standard UAE Ejari Tenancy Terms & Conditions apply. Rent is payable via ' . ($paymentFrequency ?: ($contract->mode_of_payment ?: 'agreed schedule')) . '. Security deposit is held against damages and unpaid utilities upon move-out.',
            ]);

            // 6. Post Initial First-Month Rent Due in Rent Transactions Ledger
            $this->rentDueService->postInitialDueForContract($contract);

            // 7. Auto-generate scheduled PDC cheques if number_of_cheques is specified or implied by payment_frequency
            if ($numberOfCheques === null && $paymentFrequency && preg_match('/^(\d+)\s*cheque/i', (string) $paymentFrequency, $m)) {
                $numberOfCheques = (int) $m[1];
            }

            if ($numberOfCheques && $numberOfCheques > 0) {
                $totalAmount   = (float) ($contract->contract_value ?: $contract->rent_amount);
                $perCheque     = round($totalAmount / $numberOfCheques, 2);
                $monthStep     = max(1, (int) round(12 / $numberOfCheques));
                $baseDueDate   = \Carbon\Carbon::parse($firstPaymentDueDate ?: $contract->start_date ?: now());
                $numericPrefix = $firstChequeNumber ? (int) preg_replace('/\D/', '', $firstChequeNumber) : 0;
                $baseChequeNo  = $numericPrefix > 0 ? $numericPrefix : (100000 + ($contract->id * 10));

                for ($i = 0; $i < $numberOfCheques; $i++) {
                    $amount = ($i === $numberOfCheques - 1)
                        ? round($totalAmount - ($perCheque * ($numberOfCheques - 1)), 2)
                        : $perCheque;

                    \App\Domain\Contract\Models\ContractCheque::create([
                        'contract_id'   => $contract->id,
                        'cheque_number' => (string) ($baseChequeNo + $i),
                        'bank_name'     => $chequeBank ?: 'Emirates NBD',
                        'amount'        => $amount,
                        'due_date'      => $baseDueDate->copy()->addMonths($i * $monthStep)->toDateString(),
                        'status'        => 'pending',
                        'notes'         => 'Installment ' . ($i + 1) . ' of ' . $numberOfCheques,
                    ]);
                }
            }

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

        $ownerId     = $data['owner_id'] ?? null;
        $tenantEmail = $data['tenant_email'] ?? null;
        $tenantName  = $data['tenant_name'] ?? 'Tenant User';
        $phone       = $data['tenant_phone'] ?? null;
        $emiratesId  = $data['tenant_emirates_id'] ?? null;
        $nationality = $data['tenant_nationality'] ?? null;
        $passport    = $data['tenant_passport_number'] ?? null;
        $address     = $data['tenant_address'] ?? null;

        // Check for existing tenant by Emirates ID or Phone under the same owner to prevent duplicates
        if ($ownerId && ($emiratesId || $phone)) {
            $existingTenant = Tenant::where('owner_id', $ownerId)
                ->where(function ($q) use ($emiratesId, $phone) {
                    if ($emiratesId) {
                        $q->orWhere('emirates_id', $emiratesId);
                    }
                    if ($phone) {
                        $q->orWhere('phone', $phone)->orWhere('contact', $phone);
                    }
                })
                ->first();

            if ($existingTenant) {
                return (int) $existingTenant->id;
            }
        }

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
                'owner_id'        => $ownerId,
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
                'owner_id'        => $ownerId ?: $tenant->owner_id,
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
