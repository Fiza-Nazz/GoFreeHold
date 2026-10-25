# verify_all_system_endpoints.ps1
# Comprehensive Mega Verification Suite for ALL System Endpoints and APIs
# Tests Real Data live against https://api2.gofreehold.com

$ownerToken = '159|TkIvJXgmZVrAP0mxuZ8OcsJkUqTwU44EFZWQ0jqD6a270697'
$cashierToken = '189|eVGItDAvAHuZImQTcuoMnuCa1IsQVfgpljSYNqY282a70bf7'
$adminToken = '161|nlXVpjpoVdDE4UjVNiJsqEL2bxjxoHR1j4PmU7ge08e6f959'
$maintToken = '226|M39EACx0K4imZ6fFOjgJvaOM53vfrd914fLxzIwId17ba4bb'
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
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "   GOFREEHOLD MEGA PRODUCTION API VERIFICATION SUITE (ALL ENDPOINTS)      " -ForegroundColor Cyan
Write-Host "   Target: https://api2.gofreehold.com | Real Database | Multi-Role       " -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

# -----------------------------------------------------------------------------
# MODULE 1: AUTH & IDENTITY APIS
# -----------------------------------------------------------------------------
Write-Host "`n[1/7] Testing Auth & Identity APIs..." -ForegroundColor Yellow

# 1.1 Inactive lease tenant login denial
$t1_1 = Call-Api -Uri "$baseUrl/auth/login" -Method 'POST' -Body @{ email = "mock_tenant_paul@gofreehold.com"; password = "Secret123!" }
$pass1_1 = ($t1_1.StatusCode -eq 422 -and $t1_1.Raw -match 'Portal access is available only with an active tenancy')
$results += [PSCustomObject]@{
    Module = 'Auth'
    Endpoint = 'POST /api/auth/login (Inactive Lease)'
    Expected = '422 (Lease Gate)'
    Actual = "$($t1_1.StatusCode)"
    Status = if ($pass1_1) { 'PASS' } else { 'FAIL' }
    Details = "Blocked: $($t1_1.Raw | ConvertFrom-Json | Select-Object -ExpandProperty message -ErrorAction SilentlyContinue)"
}

# 1.2 Invalid credentials login
$t1_2 = Call-Api -Uri "$baseUrl/auth/login" -Method 'POST' -Body @{ email = "nonexistent_user@example.com"; password = "wrong_password" }
$pass1_2 = ($t1_2.StatusCode -eq 422 -and $t1_2.Raw -match 'Invalid credentials')
$results += [PSCustomObject]@{
    Module = 'Auth'
    Endpoint = 'POST /api/auth/login (Invalid Creds)'
    Expected = '422 (Invalid Creds)'
    Actual = "$($t1_2.StatusCode)"
    Status = if ($pass1_2) { 'PASS' } else { 'FAIL' }
    Details = "Blocked: $($t1_2.Raw | ConvertFrom-Json | Select-Object -ExpandProperty message -ErrorAction SilentlyContinue)"
}

# 1.3 Valid Owner login
$t1_3 = Call-Api -Uri "$baseUrl/auth/login" -Method 'POST' -Body @{ email = "owner1@gofreehold.com"; password = "password" }
$pass1_3 = ($t1_3.StatusCode -eq 200 -and $t1_3.Body.data.token -ne $null)
$freshOwnerToken = if ($pass1_3) { $t1_3.Body.data.token } else { $ownerToken }
$results += [PSCustomObject]@{
    Module = 'Auth'
    Endpoint = 'POST /api/auth/login (Valid Owner)'
    Expected = '200 (Token Issued)'
    Actual = "$($t1_3.StatusCode)"
    Status = if ($pass1_3) { 'PASS' } else { 'FAIL' }
    Details = "Logged in as: $($t1_3.Body.data.user.name), Role: $($t1_3.Body.data.user.role)"
}

# 1.4 Get Profile (api/user)
$t1_4 = Call-Api -Uri "$baseUrl/user" -Token $freshOwnerToken
$pass1_4 = ($t1_4.StatusCode -eq 200 -and $t1_4.Body.data.user.email -eq 'owner1@gofreehold.com')
$results += [PSCustomObject]@{
    Module = 'Auth'
    Endpoint = 'GET /api/user (Profile)'
    Expected = '200'
    Actual = "$($t1_4.StatusCode)"
    Status = if ($pass1_4) { 'PASS' } else { 'FAIL' }
    Details = "User: $($t1_4.Body.data.user.name), Email: $($t1_4.Body.data.user.email)"
}

# 1.5 Logout
$t1_5 = Call-Api -Uri "$baseUrl/auth/logout" -Token $freshOwnerToken -Method 'POST'
$pass1_5 = ($t1_5.StatusCode -eq 200 -and $t1_5.Body.status -eq 'success')
$results += [PSCustomObject]@{
    Module = 'Auth'
    Endpoint = 'POST /api/auth/logout'
    Expected = '200'
    Actual = "$($t1_5.StatusCode)"
    Status = if ($pass1_5) { 'PASS' } else { 'FAIL' }
    Details = "Session revoked successfully"
}

# -----------------------------------------------------------------------------
# MODULE 2: OWNER PORTFOLIO & DASHBOARD APIS
# -----------------------------------------------------------------------------
Write-Host "[2/7] Testing Owner Portfolio & Dashboard APIs..." -ForegroundColor Yellow

# 2.1 Owner Properties
$t2_1 = Call-Api -Uri "$baseUrl/owner/properties" -Token $ownerToken -ApiContext 'owner'
$pass2_1 = ($t2_1.StatusCode -eq 200 -and @($t2_1.Body.data.properties).Count -ge 2)
$results += [PSCustomObject]@{
    Module = 'Owner'
    Endpoint = 'GET /api/owner/properties'
    Expected = '200'
    Actual = "$($t2_1.StatusCode)"
    Status = if ($pass2_1) { 'PASS' } else { 'FAIL' }
    Details = "Properties count: $(@($t2_1.Body.data.properties).Count)"
}

# 2.2 Owner Units
$t2_2 = Call-Api -Uri "$baseUrl/owner/units" -Token $ownerToken -ApiContext 'owner'
$pass2_2 = ($t2_2.StatusCode -eq 200 -and @($t2_2.Body.data.units).Count -ge 1)
$results += [PSCustomObject]@{
    Module = 'Owner'
    Endpoint = 'GET /api/owner/units'
    Expected = '200'
    Actual = "$($t2_2.StatusCode)"
    Status = if ($pass2_2) { 'PASS' } else { 'FAIL' }
    Details = "Units count: $(@($t2_2.Body.data.units).Count)"
}

# 2.3 Owner Tenants (with portal_enabled and has_active_lease flags)
$t2_3 = Call-Api -Uri "$baseUrl/owner/tenants" -Token $ownerToken -ApiContext 'owner'
$pass2_3 = ($t2_3.StatusCode -eq 200 -and $t2_3.Body.data.tenants[0].portal_enabled -ne $null -and $t2_3.Body.data.tenants[0].has_active_lease -ne $null)
$results += [PSCustomObject]@{
    Module = 'Owner'
    Endpoint = 'GET /api/owner/tenants (Portal Flags)'
    Expected = '200 (Flags present)'
    Actual = "$($t2_3.StatusCode)"
    Status = if ($pass2_3) { 'PASS' } else { 'FAIL' }
    Details = "Tenants count: $(@($t2_3.Body.data.tenants).Count), Flags: portal_enabled=$($t2_3.Body.data.tenants[0].portal_enabled)"
}

# 2.4 Owner Contracts
$t2_4 = Call-Api -Uri "$baseUrl/owner/contracts" -Token $ownerToken -ApiContext 'owner'
$pass2_4 = ($t2_4.StatusCode -eq 200 -and $t2_4.Body.data -ne $null)
$results += [PSCustomObject]@{
    Module = 'Owner'
    Endpoint = 'GET /api/owner/contracts'
    Expected = '200'
    Actual = "$($t2_4.StatusCode)"
    Status = if ($pass2_4) { 'PASS' } else { 'FAIL' }
    Details = "Contracts retrieved successfully"
}

# 2.5 Owner Dashboard Unit Board Property 1
$t2_5 = Call-Api -Uri "$baseUrl/owner/dashboard/properties/1/unit-board" -Token $ownerToken -ApiContext 'owner'
$pass2_5 = ($t2_5.StatusCode -eq 200 -and $t2_5.Body.data.property.name -eq 'Royal Residence')
$results += [PSCustomObject]@{
    Module = 'Owner'
    Endpoint = 'GET /api/owner/dashboard/properties/1/unit-board'
    Expected = '200'
    Actual = "$($t2_5.StatusCode)"
    Status = if ($pass2_5) { 'PASS' } else { 'FAIL' }
    Details = "Property: $($t2_5.Body.data.property.name), Units: $(@($t2_5.Body.data.units).Count)"
}

# 2.6 Route Alias: GET /owner/properties/1/unit-board
$t2_6 = Call-Api -Uri "$baseUrl/owner/properties/1/unit-board" -Token $ownerToken -ApiContext 'owner'
$pass2_6 = ($t2_6.StatusCode -eq 200 -and $t2_6.Body.data.property.name -eq 'Royal Residence')
$results += [PSCustomObject]@{
    Module = 'Owner'
    Endpoint = 'GET /api/owner/properties/1/unit-board (Alias)'
    Expected = '200'
    Actual = "$($t2_6.StatusCode)"
    Status = if ($pass2_6) { 'PASS' } else { 'FAIL' }
    Details = "Alias returned: $($t2_6.Body.data.property.name)"
}

# 2.7 Vacant Unit Detail: GET /owner/dashboard/units/1
$t2_7 = Call-Api -Uri "$baseUrl/owner/dashboard/units/1" -Token $ownerToken -ApiContext 'owner'
$u1 = $t2_7.Body.data.unit
$pass2_7 = ($t2_7.StatusCode -eq 200 -and $u1.status -eq 'AVAILABLE' -and $u1.active_contract -eq $null)
$results += [PSCustomObject]@{
    Module = 'Owner'
    Endpoint = 'GET /api/owner/dashboard/units/1 (Vacant)'
    Expected = '200 (active_contract=null)'
    Actual = "$($t2_7.StatusCode)"
    Status = if ($pass2_7) { 'PASS' } else { 'FAIL' }
    Details = "Unit: $($u1.number), Status: $($u1.status), Active Contract: $($u1.active_contract)"
}

# 2.8 Unit Detail Alias: GET /owner/units/1/detail
$t2_8 = Call-Api -Uri "$baseUrl/owner/units/1/detail" -Token $ownerToken -ApiContext 'owner'
$u1Alias = $t2_8.Body.data.unit
$pass2_8 = ($t2_8.StatusCode -eq 200 -and $u1Alias.number -eq '305')
$results += [PSCustomObject]@{
    Module = 'Owner'
    Endpoint = 'GET /api/owner/units/1/detail (Alias)'
    Expected = '200'
    Actual = "$($t2_8.StatusCode)"
    Status = if ($pass2_8) { 'PASS' } else { 'FAIL' }
    Details = "Alias returned unit number: $($u1Alias.number)"
}

# -----------------------------------------------------------------------------
# MODULE 3: TENANT PORTAL PROVISIONING & LEASE LIFECYCLE (PAUL'S GUIDE)
# -----------------------------------------------------------------------------
Write-Host "[3/7] Testing Tenant Portal Provisioning & Lease Lifecycle..." -ForegroundColor Yellow

# Find or create a test unit for contract operations (avoiding unit 1)
$availUnits = @($t2_2.Body.data.units | Where-Object { $_.status -eq 'AVAILABLE' -and $_.id -ne 1 })
$testUnitId = if ($availUnits.Count -gt 0) { $availUnits[0].id } else { $null }

if (-not $testUnitId) {
    $rndU = Get-Random -Minimum 100 -Maximum 999
    $newUPayload = @{
        property_id = 1
        number = "U-$rndU"
        floor = 1
        type = "1-br"
        size = 800
        price = 45000
        status = "AVAILABLE"
    }
    $cResp = Call-Api -Uri "$baseUrl/owner/units" -Token $ownerToken -Method 'POST' -Body $newUPayload
    $testUnitId = $cResp.Body.data.unit.id
}

# 3.1 Reject staff/owner email as tenant on contract create
$t3_1 = Call-Api -Uri "$baseUrl/owner/contracts" -Token $ownerToken -Method 'POST' -ApiContext 'owner' -Body @{
    unit_id = $testUnitId
    tenant_name = "Imposter Staff"
    tenant_email = "cashier@rmsez.com"
    rent_amount = 50000
    security_deposit = 2000
    start_date = (Get-Date).ToString('yyyy-MM-dd')
    end_date = (Get-Date).AddYears(1).ToString('yyyy-MM-dd')
}
$pass3_1 = ($t3_1.StatusCode -eq 422 -and $t3_1.Raw -match 'belongs to a staff or owner account')
$results += [PSCustomObject]@{
    Module = 'Portal Provision'
    Endpoint = 'POST /api/owner/contracts (Staff Email Rejection)'
    Expected = '422 (Staff email rejected)'
    Actual = "$($t3_1.StatusCode)"
    Status = if ($pass3_1) { 'PASS' } else { 'FAIL' }
    Details = "Validation blocked: $($t3_1.Raw | ConvertFrom-Json | Select-Object -ExpandProperty message -ErrorAction SilentlyContinue)"
}

# 3.2 Mode B Contract Create (Auto portal provisioning + credentials mail)
$rndS = Get-Random -Minimum 1000 -Maximum 9999
$newTName = "Hamza Portal $rndS"
$newTEmail = "hamza.tenant.$rndS@testgofreehold.com"

$t3_2 = Call-Api -Uri "$baseUrl/owner/contracts" -Token $ownerToken -Method 'POST' -ApiContext 'owner' -Body @{
    unit_id = $testUnitId
    tenant_name = $newTName
    tenant_email = $newTEmail
    tenant_phone = "+97150123$rndS"
    tenant_emirates_id = "784-1990-$rndS-1"
    tenant_nationality = "UAE"
    rent_amount = 55000
    security_deposit = 2500
    payment_frequency = "4 cheques"
    number_of_cheques = 4
    start_date = (Get-Date).ToString('yyyy-MM-dd')
    end_date = (Get-Date).AddYears(1).ToString('yyyy-MM-dd')
}
$pass3_2 = ($t3_2.StatusCode -eq 201 -and $t3_2.Body.data.portal.provisioned -eq $true -and $t3_2.Body.data.portal.email -eq $newTEmail)
$results += [PSCustomObject]@{
    Module = 'Portal Provision'
    Endpoint = 'POST /api/owner/contracts (Mode B Auto Portal)'
    Expected = '201 (data.portal returned)'
    Actual = "$($t3_2.StatusCode)"
    Status = if ($pass3_2) { 'PASS' } else { 'FAIL' }
    Details = "Contract ID: $($t3_2.Body.data.contract.id), Portal Provisioned: $($t3_2.Body.data.portal.provisioned), Email Sent: $($t3_2.Body.data.portal.email_sent)"
}

# 3.3 Manual Portal Enable (POST /owner/tenants/{tenant}/portal)
$firstTenant = $t2_3.Body.data.tenants[0]
$t3_3 = Call-Api -Uri "$baseUrl/owner/tenants/$($firstTenant.id)/portal" -Token $ownerToken -Method 'POST' -ApiContext 'owner' -Body @{ force_password_reset = $false }
$pass3_3 = ($t3_3.StatusCode -eq 200 -and $t3_3.Body.status -eq 'success' -and $t3_3.Body.data.portal -ne $null)
$results += [PSCustomObject]@{
    Module = 'Portal Provision'
    Endpoint = 'POST /api/owner/tenants/{id}/portal (Manual Enable)'
    Expected = '200'
    Actual = "$($t3_3.StatusCode)"
    Status = if ($pass3_3) { 'PASS' } else { 'FAIL' }
    Details = "Tenant ID: $($firstTenant.id), User ID: $($t3_3.Body.data.tenant.user_id)"
}

# 3.4 Reset Portal Password (POST /owner/tenants/{tenant}/portal/reset-password)
$t3_4 = Call-Api -Uri "$baseUrl/owner/tenants/$($firstTenant.id)/portal/reset-password" -Token $ownerToken -Method 'POST' -ApiContext 'owner'
$pass3_4 = ($t3_4.StatusCode -eq 200 -and $t3_4.Body.status -eq 'success')
$results += [PSCustomObject]@{
    Module = 'Portal Provision'
    Endpoint = 'POST /api/owner/tenants/{id}/portal/reset-password'
    Expected = '200'
    Actual = "$($t3_4.StatusCode)"
    Status = if ($pass3_4) { 'PASS' } else { 'FAIL' }
    Details = "Message: $($t3_4.Body.message), Email Sent: $($t3_4.Body.data.portal.email_sent)"
}

# -----------------------------------------------------------------------------
# MODULE 4: STAFF / CASHIER / FINANCE APIS
# -----------------------------------------------------------------------------
Write-Host "[4/7] Testing Staff / Cashier / Finance APIs..." -ForegroundColor Yellow

# 4.1 Assigned Property Unit Board
$t4_1 = Call-Api -Uri "$baseUrl/staff/finance/properties/2/unit-board" -Token $cashierToken -ApiContext 'staff'
$pass4_1 = ($t4_1.StatusCode -eq 200 -and $t4_1.Body.data.property.name -eq 'Marina Tower')
$results += [PSCustomObject]@{
    Module = 'Staff Finance'
    Endpoint = 'GET /api/staff/finance/properties/2/unit-board (Assigned)'
    Expected = '200'
    Actual = "$($t4_1.StatusCode)"
    Status = if ($pass4_1) { 'PASS' } else { 'FAIL' }
    Details = "Property: $($t4_1.Body.data.property.name), Units: $(@($t4_1.Body.data.units).Count)"
}

# 4.2 Unassigned Property Unit Board Blocked (404)
$t4_2 = Call-Api -Uri "$baseUrl/staff/finance/properties/1/unit-board" -Token $cashierToken -ApiContext 'staff'
$pass4_2 = ($t4_2.StatusCode -eq 404)
$results += [PSCustomObject]@{
    Module = 'Staff Finance'
    Endpoint = 'GET /api/staff/finance/properties/1/unit-board (Unassigned)'
    Expected = '404 (Property not found)'
    Actual = "$($t4_2.StatusCode)"
    Status = if ($pass4_2) { 'PASS' } else { 'FAIL' }
    Details = "Correctly blocked unassigned property access"
}

# 4.3 Occupied Unit Detail (Unit 3 - Active Lease, Cheques, Statements, Sub-ledger)
$t4_3 = Call-Api -Uri "$baseUrl/staff/finance/units/3" -Token $cashierToken -ApiContext 'staff'
$u3Data = $t4_3.Body.data.unit
$pass4_3 = ($t4_3.StatusCode -eq 200 -and $u3Data.status -eq 'OCCUPIED' -and $u3Data.active_contract -ne $null -and $u3Data.statement -ne $null)
$results += [PSCustomObject]@{
    Module = 'Staff Finance'
    Endpoint = 'GET /api/staff/finance/units/3 (Occupied Unit Detail)'
    Expected = '200 (Full Financial Schema)'
    Actual = "$($t4_3.StatusCode)"
    Status = if ($pass4_3) { 'PASS' } else { 'FAIL' }
    Details = "Unit: $($u3Data.number), Contract ID: $($u3Data.active_contract.id), Total Balance: $($u3Data.statement.total_balance)"
}

# 4.4 Unassigned Unit Blocked (Unit 1 on Royal Residence)
$t4_4 = Call-Api -Uri "$baseUrl/staff/finance/units/1" -Token $cashierToken -ApiContext 'staff'
$pass4_4 = ($t4_4.StatusCode -eq 404)
$results += [PSCustomObject]@{
    Module = 'Staff Finance'
    Endpoint = 'GET /api/staff/finance/units/1 (Unassigned Unit)'
    Expected = '404 (Unit not found)'
    Actual = "$($t4_4.StatusCode)"
    Status = if ($pass4_4) { 'PASS' } else { 'FAIL' }
    Details = "Correctly blocked unassigned unit access"
}

# 4.5 Financial Summary
$t4_5 = Call-Api -Uri "$baseUrl/staff/finance/summary" -Token $cashierToken -ApiContext 'staff'
$pass4_5 = ($t4_5.StatusCode -eq 200)
$results += [PSCustomObject]@{
    Module = 'Staff Finance'
    Endpoint = 'GET /api/staff/finance/summary'
    Expected = '200'
    Actual = "$($t4_5.StatusCode)"
    Status = if ($pass4_5) { 'PASS' } else { 'FAIL' }
    Details = "Summary loaded successfully"
}

# -----------------------------------------------------------------------------
# MODULE 5: MAINTENANCE SUPERVISOR & COMPLAINT WORKFLOW APIS
# -----------------------------------------------------------------------------
Write-Host "[5/7] Testing Maintenance Supervisor & Complaint Workflow..." -ForegroundColor Yellow

# 5.1 Supervisor Org Queue
$t5_1 = Call-Api -Uri "$baseUrl/maintenance/complaints" -Token $maintToken -ApiContext 'maintenance'
$pass5_1 = ($t5_1.StatusCode -eq 200)
$results += [PSCustomObject]@{
    Module = 'Maintenance'
    Endpoint = 'GET /api/maintenance/complaints (Supervisor Queue)'
    Expected = '200'
    Actual = "$($t5_1.StatusCode)"
    Status = if ($pass5_1) { 'PASS' } else { 'FAIL' }
    Details = "Supervisor queue count: $(@($t5_1.Body.data.complaints).Count)"
}

# 5.2 Supervisor Technicians
$t5_2 = Call-Api -Uri "$baseUrl/maintenance/technicians" -Token $maintToken -ApiContext 'maintenance'
$pass5_2 = ($t5_2.StatusCode -eq 200 -and @($t5_2.Body.data.technicians).Count -gt 0)
$firstTechId = if ($pass5_2) { $t5_2.Body.data.technicians[0].id } else { 1 }
$results += [PSCustomObject]@{
    Module = 'Maintenance'
    Endpoint = 'GET /api/maintenance/technicians'
    Expected = '200'
    Actual = "$($t5_2.StatusCode)"
    Status = if ($pass5_2) { 'PASS' } else { 'FAIL' }
    Details = "Technicians count: $(@($t5_2.Body.data.technicians).Count), First Tech: $($t5_2.Body.data.technicians[0].name)"
}

# 5.3 Supervisor Jobs List
$t5_3 = Call-Api -Uri "$baseUrl/maintenance/jobs" -Token $maintToken -ApiContext 'maintenance'
$pass5_3 = ($t5_3.StatusCode -eq 200)
$results += [PSCustomObject]@{
    Module = 'Maintenance'
    Endpoint = 'GET /api/maintenance/jobs'
    Expected = '200'
    Actual = "$($t5_3.StatusCode)"
    Status = if ($pass5_3) { 'PASS' } else { 'FAIL' }
    Details = "Jobs retrieved: $(@($t5_3.Body.data.jobs).Count)"
}

# 5.4 Daily Report
$t5_4 = Call-Api -Uri "$baseUrl/maintenance/daily-report" -Token $maintToken -ApiContext 'maintenance'
$pass5_4 = ($t5_4.StatusCode -eq 200)
$results += [PSCustomObject]@{
    Module = 'Maintenance'
    Endpoint = 'GET /api/maintenance/daily-report'
    Expected = '200'
    Actual = "$($t5_4.StatusCode)"
    Status = if ($pass5_4) { 'PASS' } else { 'FAIL' }
    Details = "Daily report generated successfully"
}

# 5.5 Owner/Staff Creates Ticket
$cPayload = @{
    unit_id = 1
    title = "AC Water Leak - Test Ticket $(Get-Random)"
    category = "HVAC"
    description = "Water leaking from air handler in living room."
    priority = "high"
}
$t5_5 = Call-Api -Uri "$baseUrl/owner/complaints" -Token $ownerToken -Method 'POST' -ApiContext 'owner' -Body $cPayload
$createdTicketId = if ($t5_5.Body.data.complaint) { $t5_5.Body.data.complaint.id } else { $null }
$pass5_5 = ($t5_5.StatusCode -eq 201 -and $createdTicketId -ne $null)
$results += [PSCustomObject]@{
    Module = 'Maintenance'
    Endpoint = 'POST /api/owner/complaints (Ticket Creation)'
    Expected = '201'
    Actual = "$($t5_5.StatusCode)"
    Status = if ($pass5_5) { 'PASS' } else { 'FAIL' }
    Details = "Ticket ID: $createdTicketId, Category: $($t5_5.Body.data.complaint.category), Status: $($t5_5.Body.data.complaint.status)"
}

# 5.6 Assign Technician + 1:1 Job Sync
$schedDate = (Get-Date).AddDays(1).ToString('yyyy-MM-dd')
$t5_6 = Call-Api -Uri "$baseUrl/owner/complaints/$createdTicketId/assign" -Token $ownerToken -Method 'POST' -ApiContext 'owner' -Body @{
    assigned_to = $firstTechId
    scheduled_date = $schedDate
}
$pass5_6 = ($t5_6.StatusCode -eq 200 -and $t5_6.Body.data.job.status -eq 'assigned' -and $t5_6.Body.data.job -ne $null)
$results += [PSCustomObject]@{
    Module = 'Maintenance'
    Endpoint = 'POST /api/owner/complaints/{id}/assign (1:1 Job Sync)'
    Expected = '200 (Status=assigned, Job synced)'
    Actual = "$($t5_6.StatusCode)"
    Status = if ($pass5_6) { 'PASS' } else { 'FAIL' }
    Details = "Job ID: $($t5_6.Body.data.job.id), Status: $($t5_6.Body.data.job.status)"
}

# 5.7 Transition to 'in_progress'
$t5_7 = Call-Api -Uri "$baseUrl/owner/complaints/$createdTicketId/status" -Token $ownerToken -Method 'POST' -ApiContext 'owner' -Body @{
    status = 'in_progress'
    notes = 'Technician on site inspecting AC unit.'
}
$pass5_7 = ($t5_7.StatusCode -eq 200 -and $t5_7.Body.data.complaint.status -eq 'in_progress')
$results += [PSCustomObject]@{
    Module = 'Maintenance'
    Endpoint = 'POST /api/owner/complaints/{id}/status -> in_progress'
    Expected = '200'
    Actual = "$($t5_7.StatusCode)"
    Status = if ($pass5_7) { 'PASS' } else { 'FAIL' }
    Details = "Status updated: $($t5_7.Body.data.complaint.status)"
}

# 5.8 Transition to 'resolved' (sets completed_at)
$t5_8 = Call-Api -Uri "$baseUrl/owner/complaints/$createdTicketId/status" -Token $ownerToken -Method 'POST' -ApiContext 'owner' -Body @{
    status = 'resolved'
    notes = 'Drain line cleared. AC running normally.'
}
$pass5_8 = ($t5_8.StatusCode -eq 200 -and $t5_8.Body.data.complaint.status -eq 'resolved' -and $t5_8.Body.data.job.completed_at -ne $null)
$results += [PSCustomObject]@{
    Module = 'Maintenance'
    Endpoint = 'POST /api/owner/complaints/{id}/status -> resolved'
    Expected = '200 (completed_at set)'
    Actual = "$($t5_8.StatusCode)"
    Status = if ($pass5_8) { 'PASS' } else { 'FAIL' }
    Details = "Status: $($t5_8.Body.data.complaint.status), Completed At: $($t5_8.Body.data.job.completed_at)"
}

# 5.9 Illegal Reopen Rejection ('resolved' -> 'open' -> 422)
$t5_9 = Call-Api -Uri "$baseUrl/owner/complaints/$createdTicketId/status" -Token $ownerToken -Method 'POST' -ApiContext 'owner' -Body @{
    status = 'open'
    notes = 'Attempt illegal reopen'
}
$pass5_9 = ($t5_9.StatusCode -eq 422)
$results += [PSCustomObject]@{
    Module = 'Maintenance'
    Endpoint = 'POST /api/owner/complaints/{id}/status -> open (Illegal Reopen)'
    Expected = '422 (Strict State Machine)'
    Actual = "$($t5_9.StatusCode)"
    Status = if ($pass5_9) { 'PASS' } else { 'FAIL' }
    Details = "Blocked: $($t5_9.Raw | ConvertFrom-Json | Select-Object -ExpandProperty message -ErrorAction SilentlyContinue)"
}

# -----------------------------------------------------------------------------
# MODULE 6: TENANT PORTAL CLIENT & LEASE-GATE APIS
# -----------------------------------------------------------------------------
Write-Host "[6/7] Testing Tenant Portal Client & Lease-Gate APIs..." -ForegroundColor Yellow

# 6.1 Active Tenant Allowed (/api/tenant/units)
$t6_1 = Call-Api -Uri "$baseUrl/tenant/units" -Token $activeTenantToken -ApiContext 'tenant'
$pass6_1 = ($t6_1.StatusCode -eq 200 -and @($t6_1.Body.data.units).Count -gt 0)
$results += [PSCustomObject]@{
    Module = 'Tenant Portal'
    Endpoint = 'GET /api/tenant/units (Active Tenant)'
    Expected = '200 (Allowed)'
    Actual = "$($t6_1.StatusCode)"
    Status = if ($pass6_1) { 'PASS' } else { 'FAIL' }
    Details = "Tenancy allowed. Units count: $(@($t6_1.Body.data.units).Count)"
}

# 6.2 Inactive Tenant Blocked (/api/tenant/units -> 403 TENANT_LEASE_INACTIVE)
$t6_2 = Call-Api -Uri "$baseUrl/tenant/units" -Token $inactiveTenantToken -ApiContext 'tenant'
$pass6_2 = ($t6_2.StatusCode -eq 403 -and $t6_2.Body.code -eq 'TENANT_LEASE_INACTIVE')
$results += [PSCustomObject]@{
    Module = 'Tenant Portal'
    Endpoint = 'GET /api/tenant/units (Inactive Tenant Lease-Gate)'
    Expected = '403 (TENANT_LEASE_INACTIVE)'
    Actual = "$($t6_2.StatusCode)"
    Status = if ($pass6_2) { 'PASS' } else { 'FAIL' }
    Details = "Blocked: $($t6_2.Body.code) - $($t6_2.Body.message)"
}

# 6.3 Active Tenant Complaints List
$t6_3 = Call-Api -Uri "$baseUrl/tenant/complaints" -Token $activeTenantToken -ApiContext 'tenant'
$pass6_3 = ($t6_3.StatusCode -eq 200)
$results += [PSCustomObject]@{
    Module = 'Tenant Portal'
    Endpoint = 'GET /api/tenant/complaints'
    Expected = '200'
    Actual = "$($t6_3.StatusCode)"
    Status = if ($pass6_3) { 'PASS' } else { 'FAIL' }
    Details = "Complaints count: $(@($t6_3.Body.data.complaints).Count)"
}

# 6.4 Active Tenant Creates Complaint
$tTenantUnit = $t6_1.Body.data.units[0].id
$t6_4 = Call-Api -Uri "$baseUrl/tenant/complaints" -Token $activeTenantToken -Method 'POST' -ApiContext 'tenant' -Body @{
    unit_id = $tTenantUnit
    title = "Tenant App Issue - $(Get-Random)"
    category = "Plumbing"
    description = "Bathroom faucet dripping."
    priority = "medium"
}
$tenantCreatedTicketId = if ($t6_4.Body.data.complaint) { $t6_4.Body.data.complaint.id } else { $null }
$pass6_4 = ($t6_4.StatusCode -eq 201 -and $tenantCreatedTicketId -ne $null)
$results += [PSCustomObject]@{
    Module = 'Tenant Portal'
    Endpoint = 'POST /api/tenant/complaints'
    Expected = '201'
    Actual = "$($t6_4.StatusCode)"
    Status = if ($pass6_4) { 'PASS' } else { 'FAIL' }
    Details = "Created Ticket ID: $tenantCreatedTicketId, Category: $($t6_4.Body.data.complaint.category)"
}

# 6.5 Active Tenant Views Own Complaint Detail (with live timeline/updates)
$t6_5 = Call-Api -Uri "$baseUrl/tenant/complaints/$tenantCreatedTicketId" -Token $activeTenantToken -ApiContext 'tenant'
$pass6_5 = ($t6_5.StatusCode -eq 200 -and $t6_5.Body.data.complaint.id -eq $tenantCreatedTicketId)
$results += [PSCustomObject]@{
    Module = 'Tenant Portal'
    Endpoint = 'GET /api/tenant/complaints/{id} (Own Detail)'
    Expected = '200'
    Actual = "$($t6_5.StatusCode)"
    Status = if ($pass6_5) { 'PASS' } else { 'FAIL' }
    Details = "Loaded ticket: $($t6_5.Body.data.complaint.title), Updates count: $(@($t6_5.Body.data.complaint.updates).Count)"
}

# 6.6 Tenant Payments
$t6_6 = Call-Api -Uri "$baseUrl/tenant/finance/payments" -Token $activeTenantToken -ApiContext 'tenant'
$pass6_6 = ($t6_6.StatusCode -eq 200)
$results += [PSCustomObject]@{
    Module = 'Tenant Portal'
    Endpoint = 'GET /api/tenant/finance/payments'
    Expected = '200'
    Actual = "$($t6_6.StatusCode)"
    Status = if ($pass6_6) { 'PASS' } else { 'FAIL' }
    Details = "Payments returned: $(@($t6_6.Body.data.payments).Count)"
}

# 6.7 Tenant Ledger
$t6_7 = Call-Api -Uri "$baseUrl/tenant/finance/ledger" -Token $activeTenantToken -ApiContext 'tenant'
$pass6_7 = ($t6_7.StatusCode -eq 200)
$results += [PSCustomObject]@{
    Module = 'Tenant Portal'
    Endpoint = 'GET /api/tenant/finance/ledger'
    Expected = '200'
    Actual = "$($t6_7.StatusCode)"
    Status = if ($pass6_7) { 'PASS' } else { 'FAIL' }
    Details = "Ledger loaded successfully"
}

# -----------------------------------------------------------------------------
# MODULE 7: SECURITY, ROLE BOUNDARIES & ERROR HANDLING APIS
# -----------------------------------------------------------------------------
Write-Host "[7/7] Testing Security, Role Boundaries & Error Handling..." -ForegroundColor Yellow

# 7.1 Cross-tenant access blocked (Ticket 15 belongs to owner/another tenant)
$t7_1 = Call-Api -Uri "$baseUrl/tenant/complaints/$createdTicketId" -Token $activeTenantToken -ApiContext 'tenant'
$pass7_1 = ($t7_1.StatusCode -eq 404)
$results += [PSCustomObject]@{
    Module = 'Security'
    Endpoint = 'GET /api/tenant/complaints/{unowned_id}'
    Expected = '404 (Cross-tenant blocked)'
    Actual = "$($t7_1.StatusCode)"
    Status = if ($pass7_1) { 'PASS' } else { 'FAIL' }
    Details = "Correctly blocked unowned ticket access"
}

# 7.2 Tenant assign attempt blocked
$t7_2 = Call-Api -Uri "$baseUrl/tenant/complaints/$tenantCreatedTicketId/assign" -Token $activeTenantToken -Method 'POST' -ApiContext 'tenant'
$pass7_2 = ($t7_2.StatusCode -in @(403, 404, 405))
$results += [PSCustomObject]@{
    Module = 'Security'
    Endpoint = 'POST /api/tenant/complaints/{id}/assign (Privilege Escalation)'
    Expected = '403/404/405'
    Actual = "$($t7_2.StatusCode)"
    Status = if ($pass7_2) { 'PASS' } else { 'FAIL' }
    Details = "Tenant assign attempt blocked with status $($t7_2.StatusCode)"
}

# 7.3 Admin blocked from owner-scoped unit
$t7_3 = Call-Api -Uri "$baseUrl/owner/dashboard/units/1" -Token $adminToken -ApiContext 'owner'
$pass7_3 = ($t7_3.StatusCode -eq 403)
$results += [PSCustomObject]@{
    Module = 'Security'
    Endpoint = 'GET /api/owner/dashboard/units/1 (Admin Privilege Boundary)'
    Expected = '403 (Unauthorized)'
    Actual = "$($t7_3.StatusCode)"
    Status = if ($pass7_3) { 'PASS' } else { 'FAIL' }
    Details = "Admin blocked: $($t7_3.Raw | ConvertFrom-Json | Select-Object -ExpandProperty message -ErrorAction SilentlyContinue)"
}

# 7.4 Admin blocked from staff-scoped unit
$t7_4 = Call-Api -Uri "$baseUrl/staff/finance/units/3" -Token $adminToken -ApiContext 'staff'
$pass7_4 = ($t7_4.StatusCode -eq 403)
$results += [PSCustomObject]@{
    Module = 'Security'
    Endpoint = 'GET /api/staff/finance/units/3 (Admin Privilege Boundary)'
    Expected = '403 (Unauthorized)'
    Actual = "$($t7_4.StatusCode)"
    Status = if ($pass7_4) { 'PASS' } else { 'FAIL' }
    Details = "Admin blocked: $($t7_4.Raw | ConvertFrom-Json | Select-Object -ExpandProperty message -ErrorAction SilentlyContinue)"
}

# 7.5 Unauthenticated request blocked (401)
$t7_5 = Call-Api -Uri "$baseUrl/owner/properties" -Token ''
$pass7_5 = ($t7_5.StatusCode -eq 401)
$results += [PSCustomObject]@{
    Module = 'Security'
    Endpoint = 'GET /api/owner/properties (No Token)'
    Expected = '401 (Unauthenticated)'
    Actual = "$($t7_5.StatusCode)"
    Status = if ($pass7_5) { 'PASS' } else { 'FAIL' }
    Details = "Blocked unauthenticated request"
}

# 7.6 Non-existent ID handled gracefully (404)
$t7_6 = Call-Api -Uri "$baseUrl/owner/dashboard/units/999999" -Token $ownerToken -ApiContext 'owner'
$pass7_6 = ($t7_6.StatusCode -eq 404)
$results += [PSCustomObject]@{
    Module = 'Security'
    Endpoint = 'GET /api/owner/dashboard/units/999999 (Non-existent ID)'
    Expected = '404 (Unit Not Found)'
    Actual = "$($t7_6.StatusCode)"
    Status = if ($pass7_6) { 'PASS' } else { 'FAIL' }
    Details = "Handled gracefully: $($t7_6.Raw | ConvertFrom-Json | Select-Object -ExpandProperty message -ErrorAction SilentlyContinue)"
}

# -----------------------------------------------------------------------------
# FINAL RESULTS & METRICS
# -----------------------------------------------------------------------------
Write-Host "`n==========================================================================" -ForegroundColor Cyan
Write-Host "                       ALL ENDPOINTS LIVE TEST RESULTS                     " -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

$results | Format-Table -AutoSize Module, Endpoint, Expected, Actual, Status
$failed = @($results | Where-Object { $_.Status -ne 'PASS' })
if ($failed.Count -gt 0) {
    Write-Host "`nFAILED TESTS DETAILS:" -ForegroundColor Red
    $failed | Format-Table -AutoSize Module, Endpoint, Expected, Actual, Details
}
$passCount = ($results | Where-Object { $_.Status -eq 'PASS' }).Count
$totalCount = $results.Count
$summaryColor = if ($passCount -eq $totalCount) { 'Green' } else { 'Red' }

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "  FINAL SUMMARY: $passCount OF $totalCount ENDPOINTS & APIS PASSED PERFECTLY!" -ForegroundColor $summaryColor
Write-Host "==========================================================================" -ForegroundColor Cyan
