# test_tenant_portal_api.ps1
# End-to-end live testing for Paul Brit's Tenant Portal Login API

$ownerToken = '159|TkIvJXgmZVrAP0mxuZ8OcsJkUqTwU44EFZWQ0jqD6a270697'
$cashierToken = '189|eVGItDAvAHuZImQTcuoMnuCa1IsQVfgpljSYNqY282a70bf7'
$activeTenantToken = '225|UX3T9P8g6RK2wpfkdazKbjSHgrfoD93ehjKOAEgN9ad78592'
$inactiveTenantToken = '228|XwtNcSsi4NQHPwewLZlLJBPrDCEkqtMWRARlDBKd2f8623b6'
$baseUrl = 'https://api2.gofreehold.com/api'

function Call-Api {
    param(
        [string]$Uri,
        [string]$Token = '',
        [string]$Method = 'GET',
        [string]$ApiContext = 'owner',
        [object]$Body = $null
    )
    $headers = @{ 'Accept' = 'application/json' }
    if ($Token -ne '') { $headers['Authorization'] = "Bearer $Token" }
    if ($ApiContext -ne '') { $headers['X-GFH-Api-Context'] = $ApiContext }

    $statusCode = 0
    $bodyObj = $null
    $rawBody = ''
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
        }
        if ($Body -ne $null) {
            $params['ContentType'] = 'application/json'
            $params['Body'] = ($Body | ConvertTo-Json -Depth 10)
        }
        $resp = Invoke-WebRequest @params
        $statusCode = [int]$resp.StatusCode
        $rawBody = $resp.Content
        $bodyObj = $rawBody | ConvertFrom-Json -ErrorAction SilentlyContinue
    } catch {
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $rawBody = $reader.ReadToEnd()
            $bodyObj = $rawBody | ConvertFrom-Json -ErrorAction SilentlyContinue
        } else {
            $rawBody = $_.Exception.Message
        }
    }

    return [PSCustomObject]@{
        StatusCode = $statusCode
        Body = $bodyObj
        Raw = $rawBody
    }
}

$results = @()
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   TENANT PORTAL LOGIN API -- LIVE PRODUCTION VERIFICATION SUITE   " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Find or create an available unit for owner 1 (avoid unit 1 reserved for vacancy regression tests)
$unitsResp = Call-Api -Uri "$baseUrl/owner/units" -Token $ownerToken
$availUnits = @($unitsResp.Body.data.units | Where-Object { $_.status -eq 'AVAILABLE' -and $_.id -ne 1 })
$unitIdToUse = if ($availUnits.Count -gt 0) { $availUnits[0].id } else { $null }

if (-not $unitIdToUse) {
    Write-Host "No available unit found, creating a test unit..." -ForegroundColor Yellow
    $rndUnit = Get-Random -Minimum 100 -Maximum 999
    $newUnitPayload = @{
        property_id = 1
        number = "U-$rndUnit"
        floor = 1
        type = "1-br"
        size = 800
        price = 45000
        status = "AVAILABLE"
    }
    $createUnitResp = Call-Api -Uri "$baseUrl/owner/units" -Token $ownerToken -Method 'POST' -Body $newUnitPayload
    $unitIdToUse = $createUnitResp.Body.data.unit.id
}

Write-Host "Using Unit ID: $unitIdToUse" -ForegroundColor Green

# 1. Reject contract when tenant_email belongs to staff/owner (Expect 422)
$ownerStaffEmail = 'cashier@rmsez.com'
$badPayload = @{
    unit_id = $unitIdToUse
    tenant_name = "Imposter Tenant"
    tenant_email = $ownerStaffEmail
    rent_amount = 50000
    security_deposit = 2000
    start_date = (Get-Date).ToString('yyyy-MM-dd')
    end_date = (Get-Date).AddYears(1).ToString('yyyy-MM-dd')
}
$t1 = Call-Api -Uri "$baseUrl/owner/contracts" -Token $ownerToken -Method 'POST' -ApiContext 'owner' -Body $badPayload
$pass1 = ($t1.StatusCode -eq 422 -and $t1.Raw -match 'belongs to a staff or owner account')
$results += [PSCustomObject]@{
    Test = '1. Reject email belonging to staff/owner on contract create'
    Expected = '422 (staff/owner warning)'
    Actual = "$($t1.StatusCode)"
    Status = if ($pass1) { 'PASS' } else { 'FAIL' }
    Details = "Blocked: $($t1.Raw | ConvertFrom-Json | Select-Object -ExpandProperty message -ErrorAction SilentlyContinue)"
}

# 2. Cashier/Owner creates contract Mode B (new tenant + auto portal provisioning)
$randomSuffix = Get-Random -Minimum 1000 -Maximum 9999
$newTenantEmail = "tenant.portal.$randomSuffix@testgofreehold.com"
$newTenantName = "Tariq Tenant $randomSuffix"

$contractPayload = @{
    unit_id = $unitIdToUse
    tenant_name = $newTenantName
    tenant_email = $newTenantEmail
    tenant_phone = "+97150123$randomSuffix"
    tenant_emirates_id = "784-1990-123$randomSuffix-1"
    tenant_nationality = "UAE"
    rent_amount = 60000
    security_deposit = 3000
    payment_frequency = "4 cheques"
    number_of_cheques = 4
    start_date = (Get-Date).ToString('yyyy-MM-dd')
    end_date = (Get-Date).AddYears(1).ToString('yyyy-MM-dd')
}

$t2 = Call-Api -Uri "$baseUrl/owner/contracts" -Token $ownerToken -Method 'POST' -ApiContext 'owner' -Body $contractPayload
$pass2 = ($t2.StatusCode -eq 201 -and $t2.Body.data.portal.provisioned -eq $true -and $t2.Body.data.portal.email -eq $newTenantEmail)
$createdContractId = if ($t2.Body.data.contract) { $t2.Body.data.contract.id } else { $null }
$results += [PSCustomObject]@{
    Test = '2. Mode B Contract Create (Auto provisions portal + email credentials)'
    Expected = '201 (portal provisioned)'
    Actual = "$($t2.StatusCode)"
    Status = if ($pass2) { 'PASS' } else { 'FAIL' }
    Details = "Contract ID: $createdContractId, Portal Provisioned: $($t2.Body.data.portal.provisioned), Email Sent: $($t2.Body.data.portal.email_sent)"
}

# 3. Enable portal for existing tenant (Manual enable: POST /owner/tenants/{id}/portal)
$tenantsResp = Call-Api -Uri "$baseUrl/owner/tenants" -Token $ownerToken
$firstTenant = if ($tenantsResp.Body.data.tenants -and @($tenantsResp.Body.data.tenants).Count -gt 0) { $tenantsResp.Body.data.tenants[0] } else { $null }

if ($firstTenant) {
    $t3 = Call-Api -Uri "$baseUrl/owner/tenants/$($firstTenant.id)/portal" -Token $ownerToken -Method 'POST' -ApiContext 'owner' -Body @{ force_password_reset = $false }
    $pass3 = ($t3.StatusCode -eq 200 -and $t3.Body.status -eq 'success' -and $t3.Body.data.portal -ne $null)
    $results += [PSCustomObject]@{
        Test = '3. Manual enable portal for existing tenant (POST /owner/tenants/{id}/portal)'
        Expected = '200'
        Actual = "$($t3.StatusCode)"
        Status = if ($pass3) { 'PASS' } else { 'FAIL' }
        Details = "Tenant ID: $($firstTenant.id), Portal User: $($t3.Body.data.tenant.user_id)"
    }
}

# 4. Reset temp password for tenant (Manual reset: POST /owner/tenants/{id}/portal/reset-password)
if ($firstTenant -and $firstTenant.email) {
    $t4 = Call-Api -Uri "$baseUrl/owner/tenants/$($firstTenant.id)/portal/reset-password" -Token $ownerToken -Method 'POST' -ApiContext 'owner'
    $pass4 = ($t4.StatusCode -eq 200 -and $t4.Body.status -eq 'success')
    $results += [PSCustomObject]@{
        Test = '4. Reset portal password (POST /owner/tenants/{id}/portal/reset-password)'
        Expected = '200'
        Actual = "$($t4.StatusCode)"
        Status = if ($pass4) { 'PASS' } else { 'FAIL' }
        Details = "Message: $($t4.Body.message), Email Sent: $($t4.Body.data.portal.email_sent)"
    }
}

# 5. Check GET /owner/tenants includes portal_enabled and has_active_lease
$t5 = Call-Api -Uri "$baseUrl/owner/tenants" -Token $ownerToken
$hasFlags = ($t5.Body.data.tenants -and @($t5.Body.data.tenants).Count -gt 0 -and $t5.Body.data.tenants[0].portal_enabled -ne $null -and $t5.Body.data.tenants[0].has_active_lease -ne $null)
$pass5 = ($t5.StatusCode -eq 200 -and $hasFlags)
$results += [PSCustomObject]@{
    Test = '5. GET /owner/tenants includes portal_enabled and has_active_lease'
    Expected = '200 (flags present)'
    Actual = "$($t5.StatusCode)"
    Status = if ($pass5) { 'PASS' } else { 'FAIL' }
    Details = "Tenant 0 Portal Enabled: $($t5.Body.data.tenants[0].portal_enabled), Active Lease: $($t5.Body.data.tenants[0].has_active_lease)"
}

# 6. Tenant login denial when lease inactive (Expect 422 with clear message)
$t6 = Call-Api -Uri "$baseUrl/auth/login" -Method 'POST' -Body @{
    email = "mock_tenant_paul@gofreehold.com"
    password = "Secret123!"
}
$pass6 = ($t6.StatusCode -eq 422 -and $t6.Raw -match 'Portal access is available only with an active tenancy')
$results += [PSCustomObject]@{
    Test = '6. Tenant login blocked when no active lease (Lease-Gate)'
    Expected = '422 (active tenancy required)'
    Actual = "$($t6.StatusCode)"
    Status = if ($pass6) { 'PASS' } else { 'FAIL' }
    Details = "Blocked: $($t6.Raw | ConvertFrom-Json | Select-Object -ExpandProperty message -ErrorAction SilentlyContinue)"
}

# 7. Middleware lease gate: call /api/tenant/units with inactive tenant token (Expect 403 TENANT_LEASE_INACTIVE)
$t7 = Call-Api -Uri "$baseUrl/tenant/units" -Token $inactiveTenantToken -ApiContext 'tenant'
$pass7 = ($t7.StatusCode -eq 403 -and $t7.Body.code -eq 'TENANT_LEASE_INACTIVE')
$results += [PSCustomObject]@{
    Test = '7. Inactive tenant blocked by lease middleware (Expect 403 TENANT_LEASE_INACTIVE)'
    Expected = '403 (TENANT_LEASE_INACTIVE)'
    Actual = "$($t7.StatusCode)"
    Status = if ($pass7) { 'PASS' } else { 'FAIL' }
    Details = "Blocked: $($t7.Body.code) - $($t7.Body.message)"
}

# 8. Middleware lease gate: call /api/tenant/units with active tenant token (Expect 200 OK)
$t8 = Call-Api -Uri "$baseUrl/tenant/units" -Token $activeTenantToken -ApiContext 'tenant'
$pass8 = ($t8.StatusCode -eq 200 -and $t8.Body.status -eq 'success')
$results += [PSCustomObject]@{
    Test = '8. Active tenant allowed by lease middleware (Expect 200 OK)'
    Expected = '200 (success)'
    Actual = "$($t8.StatusCode)"
    Status = if ($pass8) { 'PASS' } else { 'FAIL' }
    Details = "Units returned: $(@($t8.Body.data.units).Count)"
}

Write-Host "================ TENANT PORTAL LOGIN API LIVE TEST RESULTS ================" -ForegroundColor Cyan
$results | Format-Table -AutoSize Test, Expected, Actual, Status, Details
$passCount = ($results | Where-Object { $_.Status -eq 'PASS' }).Count
$totalCount = $results.Count
$summaryColor = if ($passCount -eq $totalCount) { 'Green' } else { 'Red' }
Write-Host "Summary: $passCount of $totalCount tests PASSED" -ForegroundColor $summaryColor
