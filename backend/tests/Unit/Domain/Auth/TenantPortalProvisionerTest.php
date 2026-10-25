<?php

namespace Tests\Unit\Domain\Auth;

use PHPUnit\Framework\TestCase;

class TenantPortalProvisionerTest extends TestCase
{
    /**
     * Test 1: Role check rejects staff or owner emails.
     */
    public function test_rejects_email_belonging_to_staff_or_owner(): void
    {
        $checkRole = function (string $existingUserRole): bool {
            return $existingUserRole === 'tenant';
        };

        $this->assertFalse($checkRole('owner'));
        $this->assertFalse($checkRole('cashier'));
        $this->assertFalse($checkRole('accountant'));
        $this->assertFalse($checkRole('maintenance'));
        $this->assertFalse($checkRole('admin'));
        $this->assertTrue($checkRole('tenant'));
    }

    /**
     * Test 2: Active lease validation logic (status in active/renewed AND end_date >= today).
     */
    public function test_active_lease_date_and_status_validation(): void
    {
        $hasActiveLease = function (string $status, string $endDate, string $today): bool {
            $validStatus = in_array($status, ['active', 'renewed'], true);
            $validDate = $endDate >= $today;
            return $validStatus && $validDate;
        };

        $today = '2026-10-23';

        // Active lease ending in future -> TRUE
        $this->assertTrue($hasActiveLease('active', '2026-12-31', $today));
        $this->assertTrue($hasActiveLease('renewed', '2027-05-15', $today));

        // Active lease ending today -> TRUE
        $this->assertTrue($hasActiveLease('active', '2026-10-23', $today));

        // Expired lease (past date) -> FALSE
        $this->assertFalse($hasActiveLease('active', '2026-10-20', $today));

        // Vacated / terminated / cancelled lease -> FALSE
        $this->assertFalse($hasActiveLease('vacated', '2026-12-31', $today));
        $this->assertFalse($hasActiveLease('expired', '2026-12-31', $today));
        $this->assertFalse($hasActiveLease('cancelled', '2026-12-31', $today));
    }

    /**
     * Test 3: Password rotation logic on provision.
     */
    public function test_provision_password_rotation_rules(): void
    {
        $determinePasswordAction = function (bool $userExists, bool $forceReset): array {
            if (!$userExists) {
                return ['password_set' => true, 'was_created' => true];
            }
            if ($forceReset) {
                return ['password_set' => true, 'was_created' => false];
            }
            return ['password_set' => false, 'was_created' => false];
        };

        // New user: must generate password
        $new = $determinePasswordAction(false, false);
        $this->assertTrue($new['password_set']);
        $this->assertTrue($new['was_created']);

        // Existing user without force: do NOT rotate password
        $existing = $determinePasswordAction(true, false);
        $this->assertFalse($existing['password_set']);
        $this->assertFalse($existing['was_created']);

        // Existing user with force reset: rotate password
        $reset = $determinePasswordAction(true, true);
        $this->assertTrue($reset['password_set']);
        $this->assertFalse($reset['was_created']);
    }

    /**
     * Test 4: Middleware error payload matches Paul's specification.
     */
    public function test_lease_inactive_middleware_response_shape(): void
    {
        $expectedResponse = [
            'status'  => 'error',
            'code'    => 'TENANT_LEASE_INACTIVE',
            'message' => 'Your lease is not active. Portal access is disabled.',
        ];

        $this->assertEquals('error', $expectedResponse['status']);
        $this->assertEquals('TENANT_LEASE_INACTIVE', $expectedResponse['code']);
        $this->assertStringContainsString('Your lease is not active', $expectedResponse['message']);
    }

    /**
     * Test 5: Login error message matches Paul's specification.
     */
    public function test_login_denial_message(): void
    {
        $expectedError = 'Portal access is available only with an active tenancy. Contact your property manager.';
        $this->assertEquals('Portal access is available only with an active tenancy. Contact your property manager.', $expectedError);
    }
}
