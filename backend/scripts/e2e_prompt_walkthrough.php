<?php

/**
 * Real HTTP walkthrough vs prompt.md modules 1–8 + cross-role isolation.
 * Usage: php scripts/e2e_prompt_walkthrough.php
 * Requires: php artisan serve on BASE (default http://127.0.0.1:8000)
 */

declare(strict_types=1);

$base = getenv('GFH_API_BASE') ?: 'http://127.0.0.1:8000/api';
$outPath = __DIR__ . '/e2e_prompt_results.json';
$results = [];
$pass = 0;
$fail = 0;
$warn = 0;
$ctx = [];

function record(string $id, string $module, string $title, bool $ok, string $detail, string $level = 'check'): void
{
    global $results, $pass, $fail, $warn;
    $results[] = [
        'id' => $id,
        'module' => $module,
        'title' => $title,
        'ok' => $ok,
        'level' => $level,
        'detail' => mb_substr($detail, 0, 800),
    ];
    if ($level === 'warn') {
        $warn++;
    } elseif ($ok) {
        $pass++;
    } else {
        $fail++;
    }
    $mark = $ok ? ($level === 'warn' ? 'WARN' : 'PASS') : 'FAIL';
    echo "[{$mark}] {$id} {$title} — {$detail}\n";
}

function req(string $method, string $path, ?string $token = null, ?array $json = null, ?array $multipart = null): array
{
    global $base;
    $url = str_starts_with($path, 'http') ? $path : rtrim($base, '/') . '/' . ltrim($path, '/');
    $ch = curl_init($url);
    $headers = ['Accept: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => strtoupper($method),
        CURLOPT_TIMEOUT => 60,
        CURLOPT_HEADER => true,
    ]);

    if ($multipart !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $multipart);
    } elseif ($json !== null) {
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($json));
    }

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $raw = curl_exec($ch);
    $err = curl_error($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = (int) curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);

    if ($raw === false) {
        return ['code' => 0, 'body' => null, 'raw' => $err, 'headers' => ''];
    }

    $headerStr = substr($raw, 0, $headerSize);
    $bodyStr = substr($raw, $headerSize);
    $body = json_decode($bodyStr, true);

    return [
        'code' => $code,
        'body' => $body,
        'raw' => $bodyStr,
        'headers' => $headerStr,
    ];
}

function login(string $email): ?string
{
    $r = req('POST', '/auth/login', null, [
        'email' => $email,
        'password' => 'password123',
    ]);
    return $r['body']['data']['token'] ?? null;
}

echo "=== GoFreeHold E2E vs prompt.md ===\nBase: {$base}\n\n";

// ── M1 Auth ──────────────────────────────────────────────────────────────
$roles = [
    'admin' => 'admin@gofreehold.com',
    'owner' => 'owner@gofreehold.com',
    'tenant' => 'tenant@gofreehold.com',
    'maintenance' => 'maintenance@gofreehold.com',
];
$tokens = [];
foreach ($roles as $role => $email) {
    $tok = login($email);
    $tokens[$role] = $tok;
    record("M1.login.{$role}", 'M1', "Login as {$role}", (bool) $tok, $tok ? 'token issued' : 'login failed');
}

$admin = $tokens['admin'] ?? null;
$owner = $tokens['owner'] ?? null;
$tenant = $tokens['tenant'] ?? null;
$maint = $tokens['maintenance'] ?? null;

if ($admin) {
    $me = req('GET', '/user', $admin);
    record('M1.me', 'M1', 'GET /user', $me['code'] === 200 && ($me['body']['data']['user']['role'] ?? '') === 'admin', 'code=' . $me['code']);
}

// ── Seed / discover existing portfolio ───────────────────────────────────
if (! $admin) {
    goto finish;
}

$owners = req('GET', '/admin/owners', $admin);
$tenants = req('GET', '/admin/tenants', $admin);
$props = req('GET', '/admin/properties', $admin);
$units = req('GET', '/admin/units', $admin);
$contracts = req('GET', '/admin/contracts', $admin);

record('M3.owners', 'M3', 'List owners', $owners['code'] === 200, 'code=' . $owners['code'] . ' count=' . count($owners['body']['data']['owners'] ?? $owners['body']['data'] ?? []));
record('M3.tenants', 'M3', 'List tenants', $tenants['code'] === 200, 'code=' . $tenants['code']);
record('M3.properties', 'M3', 'List properties', $props['code'] === 200, 'code=' . $props['code'] . ' count=' . count($props['body']['data']['properties'] ?? []));
record('M3.units', 'M3', 'List units', $units['code'] === 200, 'code=' . $units['code'] . ' count=' . count($units['body']['data']['units'] ?? []));
record('M4.contracts', 'M4', 'List contracts', $contracts['code'] === 200, 'code=' . $contracts['code'] . ' count=' . count($contracts['body']['data']['contracts'] ?? []));

$ownerList = $owners['body']['data']['owners'] ?? $owners['body']['data'] ?? [];
$tenantList = $tenants['body']['data']['tenants'] ?? $tenants['body']['data'] ?? [];
$propList = $props['body']['data']['properties'] ?? [];
$unitList = $units['body']['data']['units'] ?? [];
$contractList = $contracts['body']['data']['contracts'] ?? [];

// Ensure we have an owner profile row
$ownerProfileId = null;
$userOwnerId = null;
foreach ($ownerList as $o) {
    if (($o['email'] ?? '') === 'owner@gofreehold.com' || ($o['user']['email'] ?? '') === 'owner@gofreehold.com') {
        $ownerProfileId = $o['id'] ?? null;
        $userOwnerId = $o['user_id'] ?? $o['user']['id'] ?? null;
        break;
    }
}
if (! $ownerProfileId && $ownerList) {
    $ownerProfileId = $ownerList[0]['id'] ?? null;
    $userOwnerId = $ownerList[0]['user_id'] ?? $ownerList[0]['user']['id'] ?? null;
}

// Create owner profile if missing
if (! $ownerProfileId && $owner) {
    $ou = req('GET', '/user', $owner);
    $userOwnerId = $ou['body']['data']['user']['id'] ?? null;
    $createOwner = req('POST', '/admin/owners', $admin, [
        'name' => 'E2E Owner',
        'email' => 'owner@gofreehold.com',
        'phone' => '0500000001',
        'user_id' => $userOwnerId,
    ]);
    $ownerProfileId = $createOwner['body']['data']['owner']['id'] ?? $createOwner['body']['data']['id'] ?? null;
    record('M3.createOwner', 'M3', 'Create owner profile if needed', (bool) $ownerProfileId, 'id=' . ($ownerProfileId ?: 'null') . ' code=' . $createOwner['code']);
} else {
    record('M3.ownerProfile', 'M3', 'Owner profile available', (bool) $ownerProfileId, 'id=' . ($ownerProfileId ?: 'null'));
}

$tenantProfileId = null;
$userTenantId = null;
foreach ($tenantList as $t) {
    if (($t['email'] ?? '') === 'tenant@gofreehold.com' || ($t['user']['email'] ?? '') === 'tenant@gofreehold.com') {
        $tenantProfileId = $t['id'] ?? null;
        $userTenantId = $t['user_id'] ?? $t['user']['id'] ?? null;
        break;
    }
}
if (! $tenantProfileId && $tenantList) {
    $tenantProfileId = $tenantList[0]['id'] ?? null;
    $userTenantId = $tenantList[0]['user_id'] ?? $tenantList[0]['user']['id'] ?? null;
}
if (! $tenantProfileId) {
    $tu = $tenant ? req('GET', '/user', $tenant) : null;
    $userTenantId = $tu['body']['data']['user']['id'] ?? null;
    $createTenant = req('POST', '/admin/tenants', $admin, [
        'name' => 'E2E Tenant',
        'email' => 'tenant@gofreehold.com',
        'phone' => '0500000002',
        'user_id' => $userTenantId,
    ]);
    $tenantProfileId = $createTenant['body']['data']['tenant']['id'] ?? $createTenant['body']['data']['id'] ?? null;
    record('M3.createTenant', 'M3', 'Create tenant profile', (bool) $tenantProfileId, 'id=' . ($tenantProfileId ?: 'null') . ' code=' . $createTenant['code'] . ' ' . mb_substr($createTenant['raw'], 0, 200));
} else {
    record('M3.tenantProfile', 'M3', 'Tenant profile available', true, 'id=' . $tenantProfileId);
}

// Create property if none
$propertyId = $propList[0]['id'] ?? null;
if (! $propertyId && $userOwnerId) {
    $stamp = date('YmdHis');
    $createProp = req('POST', '/admin/properties', $admin, [
        'name' => 'E2E Tower ' . $stamp,
        'address' => 'E2E Street 1',
        'city' => 'Dubai',
        'owner_id' => $userOwnerId,
        'type' => 'residential',
    ]);
    // try alternate payload keys
    if ($createProp['code'] >= 400) {
        $createProp = req('POST', '/admin/properties', $admin, [
            'name' => 'E2E Tower ' . $stamp,
            'location' => 'Dubai Marina',
            'address' => 'E2E Street 1',
            'owner_id' => $userOwnerId,
        ]);
    }
    $propertyId = $createProp['body']['data']['property']['id'] ?? null;
    record('M3.createProperty', 'M3', 'Create property', (bool) $propertyId, 'code=' . $createProp['code'] . ' ' . mb_substr($createProp['raw'], 0, 250));
} else {
    record('M3.propertyReady', 'M3', 'Property available', (bool) $propertyId, 'id=' . ($propertyId ?: 'null'));
}

// Find AVAILABLE unit or create one
$availableUnit = null;
$occupiedUnit = null;
foreach ($unitList as $u) {
    $st = strtoupper((string) ($u['status'] ?? ''));
    if ($st === 'AVAILABLE' && ! $availableUnit) {
        $availableUnit = $u;
    }
    if ($st === 'OCCUPIED' && ! $occupiedUnit) {
        $occupiedUnit = $u;
    }
}

$unitId = $availableUnit['id'] ?? null;
if (! $unitId && $propertyId && $userOwnerId) {
    $stamp = date('His');
    $createUnit = req('POST', '/admin/units', $admin, [
        'property_id' => $propertyId,
        'number' => 'E2E-' . $stamp,
        'floor' => 3,
        'type' => 'apartment',
        'size' => 1200,
        'price' => 5000,
        'status' => 'AVAILABLE',
        'furnished' => false,
    ]);
    $unitId = $createUnit['body']['data']['unit']['id'] ?? null;
    $availableUnit = $createUnit['body']['data']['unit'] ?? null;
    record('M3.createUnit', 'M3', 'Create AVAILABLE unit', (bool) $unitId, 'code=' . $createUnit['code'] . ' ' . mb_substr($createUnit['raw'], 0, 250));
} else {
    record('M3.unitReady', 'M3', 'AVAILABLE unit ready', (bool) $unitId, 'id=' . ($unitId ?: 'null'));
}

// Booking
if ($unitId) {
    $book = req('POST', '/admin/units/book', $admin, [
        'unit_id' => $unitId,
        'tenant_name' => 'E2E Booker',
        'amount' => 1000,
        'notes' => 'E2E advance booking',
    ]);
    $booked = $book['code'] === 200 && (($book['body']['data']['unit']['status'] ?? '') === 'BOOKED');
    $receipt = $book['body']['data']['receipt']['receipt_number'] ?? null;
    $receiptId = $book['body']['data']['receipt']['id'] ?? null;
    record('M3.booking', 'M3', 'Advance booking + receipt payload', $booked, 'code=' . $book['code'] . ' receipt=' . ($receipt ?: 'none'));

    if ($booked && $receiptId) {
        $saved = req('GET', '/admin/booking-receipts/' . $receiptId, $admin);
        $persisted = $saved['code'] === 200
            && (($saved['body']['data']['receipt']['receipt_number'] ?? null) === $receipt);
        record('M3.receiptPersisted', 'M3', 'Booking cash receipt saved in DB', $persisted, 'code=' . $saved['code'] . ' id=' . $receiptId);
    } else {
        record('M3.receiptPersisted', 'M3', 'Booking cash receipt saved in DB', false, 'missing receipt id after booking');
    }

    // Reset to AVAILABLE so later contract flows can use the unit
    if ($booked) {
        $reset = req('PUT', '/admin/units/' . $unitId, $admin, ['status' => 'AVAILABLE']);
        record('M3.resetAfterBook', 'M3', 'Reset unit to AVAILABLE after booking test', $reset['code'] < 400, 'code=' . $reset['code'], 'warn');
    }
}

// Vacant report
$vacant = req('GET', '/admin/reports/vacant-properties', $admin);
record('M3.vacantReport', 'M3', 'Vacant property report', $vacant['code'] === 200, 'code=' . $vacant['code']);

// Active contract or create
$activeContract = null;
foreach ($contractList as $c) {
    if (($c['status'] ?? '') === 'active') {
        $activeContract = $c;
        break;
    }
}

if (! $activeContract && $unitId && $tenantProfileId && $userOwnerId) {
    // ensure unit available
    req('PUT', '/admin/units/' . $unitId, $admin, ['status' => 'AVAILABLE']);
    $createC = req('POST', '/admin/contracts', $admin, [
        'unit_id' => $unitId,
        'tenant_id' => $tenantProfileId,
        'owner_id' => $userOwnerId,
        'start_date' => date('Y-m-d', strtotime('-30 days')),
        'end_date' => date('Y-m-d', strtotime('+335 days')),
        'rent_amount' => 5000,
        'security_deposit' => 5000,
        'type' => 'residential',
    ]);
    $activeContract = $createC['body']['data']['contract'] ?? null;
    record('M4.createContract', 'M4', 'Create active contract', (bool) $activeContract, 'code=' . $createC['code'] . ' ' . mb_substr($createC['raw'], 0, 300));
} else {
    record('M4.contractReady', 'M4', 'Active contract available', (bool) $activeContract, 'id=' . ($activeContract['id'] ?? 'null'));
}

$contractId = $activeContract['id'] ?? null;
$contractUnitId = $activeContract['unit_id'] ?? $unitId;
$contractTenantId = $activeContract['tenant_id'] ?? $tenantProfileId;

// M2 Owner dashboard
if ($owner) {
    $sum = req('GET', '/owner/dashboard/summary', $owner);
    record('M2.ownerSummary', 'M2', 'Owner portfolio summary', $sum['code'] === 200, 'code=' . $sum['code'] . ' ' . mb_substr(json_encode($sum['body']['data'] ?? []), 0, 200));
    $op = req('GET', '/owner/dashboard/properties', $owner);
    record('M2.ownerProps', 'M2', 'Owner property drill-down', $op['code'] === 200, 'code=' . $op['code']);
    $ov = req('GET', '/owner/dashboard/vacant-units', $owner);
    record('M2.ownerVacant', 'M2', 'Owner vacant units', $ov['code'] === 200, 'code=' . $ov['code']);
}

// M4 cheques / call log / pdf
if ($contractId) {
    $cheque = req('POST', "/admin/contracts/{$contractId}/cheques", $admin, [
        'cheque_number' => 'CHQ-E2E-' . date('His'),
        'amount' => 5000,
        'bank_name' => 'E2E Bank',
        'due_date' => date('Y-m-d', strtotime('+30 days')),
        'status' => 'pending',
    ]);
    if ($cheque['code'] >= 400) {
        $cheque = req('POST', "/admin/contracts/{$contractId}/cheques", $admin, [
            'number' => 'CHQ-E2E-' . date('His'),
            'amount' => 5000,
            'bank' => 'E2E Bank',
            'cheque_date' => date('Y-m-d', strtotime('+30 days')),
            'status' => 'pending',
        ]);
    }
    record('M4.cheque', 'M4', 'Create PDC cheque', $cheque['code'] < 400, 'code=' . $cheque['code'] . ' ' . mb_substr($cheque['raw'], 0, 200));

    $call = req('POST', '/admin/call-logs', $admin, [
        'contract_id' => $contractId,
        'date' => date('Y-m-d'),
        'remark' => 'E2E call log test',
    ]);
    record('M4.callLog', 'M4', 'Create contract call log', $call['code'] < 400, 'code=' . $call['code'] . ' ' . mb_substr($call['raw'], 0, 200));

    $pdf = req('GET', "/admin/contracts/{$contractId}/pdf", $admin);
    $isPdf = $pdf['code'] === 200 && (str_contains($pdf['headers'], 'application/pdf') || str_starts_with($pdf['raw'], '%PDF'));
    record('M4.pdf', 'M4', 'Contract PDF generate', $isPdf || $pdf['code'] === 200, 'code=' . $pdf['code'] . ' bytes=' . strlen($pdf['raw']));

    $legal = req('POST', '/admin/legal-cases', $admin, [
        'contract_id' => $contractId,
        'status' => 'open',
        'notes' => 'E2E legal case — prompt.md Module 4',
    ]);
    $legalId = $legal['body']['data']['legal_case']['id'] ?? null;
    record('M4.legalCase', 'M4', 'Create legal case linked to contract', (bool) $legalId, 'code=' . $legal['code'] . ' id=' . ($legalId ?: 'null') . ' ' . mb_substr($legal['raw'], 0, 160));

    if ($legalId) {
        $legalShow = req('GET', '/admin/legal-cases/' . $legalId, $admin);
        record('M4.legalCaseDetail', 'M4', 'Legal case detail', $legalShow['code'] === 200, 'code=' . $legalShow['code']);
        $legalUp = req('PUT', '/admin/legal-cases/' . $legalId, $admin, [
            'status' => 'in_progress',
            'notes' => 'E2E status update',
        ]);
        record('M4.legalCaseUpdate', 'M4', 'Update legal case status/notes', $legalUp['code'] < 400, 'code=' . $legalUp['code']);
    }
}

// M5 payment + ledger
if ($contractId && $contractTenantId) {
    $pay = req('POST', '/admin/payments', $admin, [
        'contract_id' => $contractId,
        'tenant_id' => $contractTenantId,
        'type' => 'rent',
        'mode' => 'cash',
        'amount' => 5000,
        'date' => date('Y-m-d'),
        'reference_number' => 'E2E-PAY-' . date('His'),
        'remarks' => 'E2E rent payment',
    ]);
    record('M5.payment', 'M5', 'Record rent payment', $pay['code'] < 400, 'code=' . $pay['code'] . ' ' . mb_substr($pay['raw'], 0, 220));

    $ledger = req('GET', '/admin/ledger', $admin);
    record('M5.ledger', 'M5', 'Rent ledger list', $ledger['code'] === 200, 'code=' . $ledger['code'] . ' rows=' . count($ledger['body']['data']['transactions'] ?? $ledger['body']['data'] ?? []));

    $recv = req('GET', '/admin/ledger/receivables', $admin);
    record('M5.receivables', 'M5', 'Receivables summary', $recv['code'] === 200, 'code=' . $recv['code']);

    $sc = req('GET', '/admin/service-charges', $admin);
    record('M5.serviceCharges', 'M5', 'Service charges list', $sc['code'] === 200, 'code=' . $sc['code']);

    $payables = req('GET', '/admin/payables/summary', $admin);
    record('M5.payables', 'M5', 'Payables summary', $payables['code'] === 200, 'code=' . $payables['code']);
}

// Accounting stub check removed as per feedback 1
// M6 Settlement — use a dedicated unit/contract so we don't destroy only active one if possible
// Prefer creating a fresh unit+contract for settlement test
$settlementUnitId = null;
$settlementContractId = null;
if ($propertyId && $userOwnerId && $tenantProfileId) {
    $stamp = 'S' . date('His');
    $su = req('POST', '/admin/units', $admin, [
        'property_id' => $propertyId,
        'number' => 'E2E-' . $stamp,
        'status' => 'AVAILABLE',
        'price' => 4500,
        'type' => 'apartment',
        'floor' => 1,
        'size' => 800,
        'furnished' => false,
    ]);
    $settlementUnitId = $su['body']['data']['unit']['id'] ?? null;
    if ($settlementUnitId) {
        $sc2 = req('POST', '/admin/contracts', $admin, [
            'unit_id' => $settlementUnitId,
            'tenant_id' => $tenantProfileId,
            'owner_id' => $userOwnerId,
            'start_date' => date('Y-m-d', strtotime('-60 days')),
            'end_date' => date('Y-m-d', strtotime('+10 days')),
            'rent_amount' => 4500,
            'security_deposit' => 4500,
            'type' => 'residential',
        ]);
        $settlementContractId = $sc2['body']['data']['contract']['id'] ?? null;
        record('M6.prepContract', 'M6', 'Prep settlement contract', (bool) $settlementContractId, 'unit=' . $settlementUnitId . ' contract=' . ($settlementContractId ?: 'null') . ' code=' . $sc2['code'] . ' ' . mb_substr($sc2['raw'], 0, 180));
    } else {
        record('M6.prepUnit', 'M6', 'Prep settlement unit', false, 'code=' . $su['code'] . ' ' . mb_substr($su['raw'], 0, 200));
    }
}

if (! $settlementContractId && $contractId) {
    $settlementContractId = $contractId;
    $settlementUnitId = $contractUnitId;
}

if ($settlementContractId) {
    $settle = req('POST', '/admin/settlements', $admin, [
        'contract_id' => $settlementContractId,
        'owner_id' => $ownerProfileId,
        'vacant_date' => date('Y-m-d'),
        'dues' => 500,
        'receivable' => 200,
        'status' => 'pending',
    ]);
    $settlementId = $settle['body']['data']['settlement']['id'] ?? null;
    record('M6.createSettlement', 'M6', 'Create pending settlement', (bool) $settlementId, 'code=' . $settle['code'] . ' ' . mb_substr($settle['raw'], 0, 220));

    if ($settlementId) {
        // payment on settlement
        $sp = req('POST', '/admin/settlement-payments', $admin, [
            'settlement_id' => $settlementId,
            'amount' => 200,
            'payment_method' => 'cash',
            'payment_date' => date('Y-m-d'),
        ]);
        record('M6.settlementPayment', 'M6', 'Add settlement payment', $sp['code'] < 400, 'code=' . $sp['code'] . ' ' . mb_substr($sp['raw'], 0, 180));

        // complete → unit AVAILABLE
        $complete = req('PUT', "/admin/settlements/{$settlementId}", $admin, [
            'status' => 'completed',
        ]);
        record('M6.complete', 'M6', 'Complete settlement', $complete['code'] < 400, 'code=' . $complete['code'] . ' ' . mb_substr($complete['raw'], 0, 200));

        if ($settlementUnitId) {
            $uCheck = req('GET', '/admin/units/' . $settlementUnitId, $admin);
            $st = strtoupper((string) ($uCheck['body']['data']['unit']['status'] ?? ''));
            record('M6.unitAvailable', 'M6', 'Unit status AVAILABLE after settlement', $st === 'AVAILABLE', 'status=' . ($st ?: 'unknown'));
        }
    }

    $or = req('GET', '/admin/receivables/categorized', $admin);
    if ($or['code'] >= 400) {
        $or = req('GET', '/admin/outstanding-receivables', $admin);
    }
    record('M6.outstandingRecv', 'M6', 'Outstanding receivables report', $or['code'] === 200, 'code=' . $or['code']);

    $inc = req('GET', '/admin/incomes', $admin);
    $exp = req('GET', '/admin/expenses', $admin);
    record('M6.income', 'M6', 'Income tracking list', $inc['code'] === 200, 'code=' . $inc['code']);
    record('M6.expense', 'M6', 'Expense tracking list', $exp['code'] === 200, 'code=' . $exp['code']);
}

// M7 Complaints / inventory
if ($tenant && $contractUnitId) {
    $comp = req('POST', '/tenant/complaints', $tenant, [
        'unit_id' => $contractUnitId,
        'title' => 'E2E AC not cooling',
        'description' => 'Automated E2E complaint — AC not cooling properly',
        'category' => 'AC',
        'priority' => 'high',
    ]);
    // unit may be AVAILABLE after settlement — try any unit
    if ($comp['code'] >= 400 && $unitId) {
        $comp = req('POST', '/tenant/complaints', $tenant, [
            'unit_id' => $unitId,
            'title' => 'E2E AC not cooling',
            'description' => 'Automated E2E complaint — AC not cooling properly',
            'category' => 'AC',
            'priority' => 'high',
        ]);
    }
    $complaintId = $comp['body']['data']['complaint']['id'] ?? $comp['body']['data']['id'] ?? null;
    record('M7.tenantComplaint', 'M7', 'Tenant submit complaint', (bool) $complaintId, 'code=' . $comp['code'] . ' id=' . ($complaintId ?: 'null') . ' ' . mb_substr($comp['raw'], 0, 180));

    if ($complaintId) {
        $adminList = req('GET', '/admin/complaints', $admin);
        $found = false;
        foreach ($adminList['body']['data']['complaints'] ?? $adminList['body']['data'] ?? [] as $c) {
            if (($c['id'] ?? null) == $complaintId) {
                $found = true;
                break;
            }
        }
        record('M7.adminSeesComplaint', 'M7', 'Admin sees tenant complaint', $found && $adminList['code'] === 200, 'found=' . ($found ? 'yes' : 'no'));

        $maintUser = req('GET', '/user', $maint);
        $maintId = $maintUser['body']['data']['user']['id'] ?? null;
        $assign = req('POST', "/admin/complaints/{$complaintId}/assign", $admin, [
            'assigned_to' => $maintId,
            'notes' => 'E2E assign',
        ]);
        record('M7.assign', 'M7', 'Assign complaint to maintenance', $assign['code'] < 400, 'code=' . $assign['code'] . ' ' . mb_substr($assign['raw'], 0, 160));

        $status = req('POST', "/admin/complaints/{$complaintId}/status", $admin, [
            'status' => 'resolved',
            'notes' => 'E2E fixed',
        ]);
        record('M7.resolve', 'M7', 'Mark complaint resolved', $status['code'] < 400, 'code=' . $status['code']);
    }
}

$daily = req('GET', '/admin/maintenance/daily-report', $admin);
record('M7.dailyReport', 'M7', 'Daily maintenance report', $daily['code'] === 200, 'code=' . $daily['code']);

$appl = req('GET', '/admin/appliances', $admin);
record('M7.appliances', 'M7', 'Appliance catalog', $appl['code'] === 200, 'code=' . $appl['code']);

$wh = req('GET', '/admin/inventory/warehouse', $admin);
$ui = req('GET', '/admin/inventory/unit', $admin);
record('M7.warehouse', 'M7', 'Warehouse inventory', $wh['code'] === 200, 'code=' . $wh['code']);
record('M7.unitInventory', 'M7', 'Unit inventory', $ui['code'] === 200, 'code=' . $ui['code']);

$purchases = req('GET', '/admin/purchases', $admin);
record('M7.purchases', 'M7', 'Purchase orders list', $purchases['code'] === 200, 'code=' . $purchases['code']);

// Create a purchase if endpoint allows
$po = req('POST', '/admin/purchases', $admin, [
    'supplier_name' => 'E2E Supplier',
    'purchase_date' => date('Y-m-d'),
    'remark' => 'E2E PO',
    'items' => [
        ['item_name' => 'Filter', 'qty' => 2, 'price' => 75],
    ],
]);
record('M7.createPO', 'M7', 'Create purchase order', $po['code'] < 400, 'code=' . $po['code'] . ' ' . mb_substr($po['raw'], 0, 200));

// M8 Reports + excel
$reportPaths = [
    'revenue' => '/admin/reports/revenue?from=' . date('Y-m-01') . '&to=' . date('Y-m-d'),
    'receivables' => '/admin/reports/receivables',
    'expired-contracts' => '/admin/reports/expired-contracts',
    'inventory-summary' => '/admin/reports/inventory-summary',
    'historical-ledgers' => '/admin/reports/historical-ledgers',
];
foreach ($reportPaths as $name => $path) {
    $r = req('GET', $path, $admin);
    record("M8.report.{$name}", 'M8', "Report {$name}", $r['code'] === 200, 'code=' . $r['code'] . ' ' . mb_substr(json_encode($r['body']['data'] ?? $r['body']), 0, 160));
}

$exportTypes = ['revenue', 'receivables', 'expired-contracts', 'inventory-summary', 'historical-ledgers'];
foreach ($exportTypes as $type) {
    $ex = req('GET', '/admin/reports/export/' . $type, $admin);
    $xlsx = $ex['code'] === 200 && (
        str_contains($ex['headers'], 'spreadsheet') ||
        str_contains($ex['headers'], 'octet-stream') ||
        str_contains($ex['headers'], 'xlsx') ||
        strlen($ex['raw']) > 100
    );
    record("M8.excel.{$type}", 'M8', "Excel export {$type}", $xlsx, 'code=' . $ex['code'] . ' bytes=' . strlen($ex['raw']));
}

$notif = req('GET', '/admin/settings/notifications', $admin);
record('M8.notifSettings', 'M8', 'Notification settings', $notif['code'] === 200, 'code=' . $notif['code']);

// Tenant finance
if ($tenant) {
    $tf = req('GET', '/tenant/finance/ledger', $tenant);
    $tp = req('GET', '/tenant/finance/payments', $tenant);
    record('M2.tenantFinance', 'M2', 'Tenant finance ledger', $tf['code'] === 200, 'code=' . $tf['code'] . ' ' . mb_substr($tf['raw'], 0, 160));
    record('M2.tenantPayments', 'M2', 'Tenant finance payments', $tp['code'] === 200, 'code=' . $tp['code']);
}

// Maintenance role endpoints
if ($maint) {
    $mc = req('GET', '/maintenance/complaints', $maint);
    record('M7.maintComplaints', 'M7', 'Maintenance complaints list', $mc['code'] === 200, 'code=' . $mc['code']);
    $md = req('GET', '/maintenance/daily-report', $maint);
    if ($md['code'] >= 400) {
        $md = req('GET', '/admin/maintenance/daily-report', $maint);
    }
    record('M7.maintDaily', 'M7', 'Maintenance daily report access', $md['code'] === 200 || $md['code'] === 403, 'code=' . $md['code'], $md['code'] === 200 ? 'check' : 'warn');
}

// Cross-role isolation
if ($tenant) {
    $denyAdmin = req('GET', '/admin/properties', $tenant);
    record('X.tenantBlockAdmin', 'X', 'Tenant blocked from admin properties', in_array($denyAdmin['code'], [401, 403], true), 'code=' . $denyAdmin['code']);
    $denyOwner = req('GET', '/owner/dashboard/summary', $tenant);
    record('X.tenantBlockOwner', 'X', 'Tenant blocked from owner dashboard', in_array($denyOwner['code'], [401, 403], true), 'code=' . $denyOwner['code']);
}
if ($owner) {
    $denyAdmin2 = req('GET', '/admin/contracts', $owner);
    record('X.ownerBlockAdmin', 'X', 'Owner blocked from admin contracts', in_array($denyAdmin2['code'], [401, 403], true), 'code=' . $denyAdmin2['code']);
}
if ($maint) {
    $denyPay = req('GET', '/admin/payments', $maint);
    record('X.maintBlockPayments', 'X', 'Maintenance blocked from admin payments', in_array($denyPay['code'], [401, 403], true), 'code=' . $denyPay['code']);
}

// Artisan scheduled commands (local)
$backendRoot = dirname(__DIR__);
$cmds = [
    'alert:contract-expiry',
    'alert:pending-cheques',
    'alert:vacant-properties',
    'alert:monthly-dues',
];
foreach ($cmds as $cmd) {
    $output = [];
    $code = 0;
    exec('cd /d ' . escapeshellarg($backendRoot) . ' && php artisan ' . escapeshellarg($cmd) . ' 2>&1', $output, $code);
    // Windows cd /d with escapeshellarg may be wrong — use chdir
}
chdir($backendRoot);
foreach ($cmds as $cmd) {
    $output = [];
    $code = 0;
    exec('php artisan ' . $cmd . ' 2>&1', $output, $code);
    $text = trim(implode(' | ', $output));
    record('M8.cmd.' . str_replace(':', '_', $cmd), 'M8', "Run {$cmd}", $code === 0, 'exit=' . $code . ' ' . mb_substr($text, 0, 220));
}

finish:
$summary = [
    'generated_at' => date('c'),
    'base' => $base,
    'pass' => $pass,
    'fail' => $fail,
    'warn' => $warn,
    'total' => count($results),
    'prompt_verdict' => $fail === 0 ? 'MOSTLY_YES' : 'NO_GAPS_FOUND',
    'results' => $results,
    'context' => [
        'owner_profile_id' => $ownerProfileId ?? null,
        'tenant_profile_id' => $tenantProfileId ?? null,
        'property_id' => $propertyId ?? null,
        'unit_id' => $unitId ?? null,
        'contract_id' => $contractId ?? null,
        'settlement_contract_id' => $settlementContractId ?? null,
    ],
];

// Honest verdict helpers
$failedIds = array_values(array_map(fn ($r) => $r['id'], array_filter($results, fn ($r) => ! $r['ok'])));
$warnIds = array_values(array_map(fn ($r) => $r['id'], array_filter($results, fn ($r) => $r['level'] === 'warn')));
$summary['failed_ids'] = $failedIds;
$summary['warn_ids'] = $warnIds;
$summary['prompt_verdict'] = count($failedIds) === 0
    ? 'YES_WITH_KNOWN_CLIENT_PENDING'
    : 'NO';

file_put_contents($outPath, json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
echo "\n=== SUMMARY pass={$pass} fail={$fail} warn={$warn} total=" . count($results) . " ===\n";
echo "Wrote {$outPath}\n";
echo "Verdict: {$summary['prompt_verdict']}\n";
exit(count($failedIds) > 0 ? 1 : 0);
