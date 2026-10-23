# master_system_test.ps1
# Comprehensive master verification of all APIs and endpoints

$ownerToken = '159|TkIvJXgmZVrAP0mxuZ8OcsJkUqTwU44EFZWQ0jqD6a270697'
$cashierToken = '189|eVGItDAvAHuZImQTcuoMnuCa1IsQVfgpljSYNqY282a70bf7'
$adminToken = '161|nlXVpjpoVdDE4UjVNiJsqEL2bxjxoHR1j4PmU7ge08e6f959'
$maintToken = '226|M39EACx0K4imZ6fFOjgJvaOM53vfrd914fLxzIwId17ba4bb'
$tenantToken = '225|UX3T9P8g6RK2wpfkdazKbjSHgrfoD93ehjKOAEgN9ad78592'

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

Write-Host "Starting Master System Test on https://api2.gofreehold.com..." -ForegroundColor Cyan

# ==========================================
# MODULE 1: MAINTENANCE API — TENANT FLOW
# ==========================================

# 1. Tenant: GET /tenant/units
$t1 = Call-Api -Uri "$baseUrl/tenant/units" -Token $tenantToken -ApiContext 'tenant'
$pass1 = ($t1.StatusCode -eq 200 -and $t1.Body.status -eq 'success' -and $t1.Body.data.units -ne $null)
$tenantUnitId = if ($t1.Body.data.units -and @($t1.Body.data.units).Count -gt 0) { $t1.Body.data.units[0].id } else { null }
$results += [PSCustomObject]@{
    Module = 'Maintenance (Tenant)'
    Endpoint = 'GET /api/tenant/units'
    Expected = '200'
    Actual = "$($t1.StatusCode)"
    Status = if ($pass1) { 'PASS' } else { 'FAIL' }
    Details = "Units: $(@($t1.Body.data.units).Count), First Unit ID: $tenantUnitId"
}

# 2. Tenant: GET /tenant/complaints
$t2 = Call-Api -Uri "$baseUrl/tenant/complaints" -Token $tenantToken -ApiContext 'tenant'
$pass2 = ($t2.StatusCode -eq 200 -and $t2.Body.status -eq 'success')
$results += [PSCustomObject]@{
    Module = 'Maintenance (Tenant)'
    Endpoint = 'GET /api/tenant/complaints'
    Expected = '200'
    Actual = "$($t2.StatusCode)"
    Status = if ($pass2) { 'PASS' } else { 'FAIL' }
    Details = "Complaints: $(@($t2.Body.data.complaints).Count)"
}

# 3. Tenant: POST /tenant/complaints
$createdTenantTicketId = $null
if ($tenantUnitId) {
    $createData = @{
        unit_id = $tenantUnitId
        title = "Master Test - Kitchen Faucet - $(Get-Date -Format 'HH:mm:ss')"
        description = "Faucet dripping continuously."
        category = "plumbing"
        priority = "medium"
    }
    $t3 = Call-Api -Uri "$baseUrl/tenant/complaints" -Token $tenantToken -Method 'POST' -ApiContext 'tenant' -Body $createData
    $pass3 = ($t3.StatusCode -eq 201 -and $t3.Body.data.complaint.category -eq 'plumbing' -and $t3.Body.data.complaint.source -eq 'tenant' -and $t3.Body.data.complaint.status -eq 'open')
    if ($t3.Body.data.complaint) { $createdTenantTicketId = $t3.Body.data.complaint.id }
    $results += [PSCustomObject]@{
        Module = 'Maintenance (Tenant)'
        Endpoint = 'POST /api/tenant/complaints'
        Expected = '201'
        Actual = "$($t3.StatusCode)"
        Status = if ($pass3) { 'PASS' } else { 'FAIL' }
        Details = "Created ID: $createdTenantTicketId, Category: $($t3.Body.data.complaint.category), Source: $($t3.Body.data.complaint.source)"
    }
}

# 4. Tenant: GET /tenant/complaints/{id}
if ($createdTenantTicketId) {
    $t4 = Call-Api -Uri "$baseUrl/tenant/complaints/$createdTenantTicketId" -Token $tenantToken -ApiContext 'tenant'
    $hasUpdates = ($t4.Body.data.complaint.updates -and @($t4.Body.data.complaint.updates).Count -gt 0)
    $pass4 = ($t4.StatusCode -eq 200 -and $t4.Body.data.complaint.id -eq $createdTenantTicketId -and $hasUpdates)
    $results += [PSCustomObject]@{
        Module = 'Maintenance (Tenant)'
        Endpoint = "GET /api/tenant/complaints/{id}"
        Expected = '200'
        Actual = "$($t4.StatusCode)"
        Status = if ($pass4) { 'PASS' } else { 'FAIL' }
        Details = "Title: $($t4.Body.data.complaint.title), Updates count: $(@($t4.Body.data.complaint.updates).Count)"
    }
}

# ==========================================
# MODULE 2: MAINTENANCE API — SUPERVISOR FLOW
# ==========================================

# 5. Maintenance: GET /maintenance/complaints (org-wide queue)
$m1 = Call-Api -Uri "$baseUrl/maintenance/complaints" -Token $maintToken -ApiContext 'maintenance'
$passM1 = ($m1.StatusCode -eq 200 -and $m1.Body.status -eq 'success')
$results += [PSCustomObject]@{
    Module = 'Maintenance (Supervisor)'
    Endpoint = 'GET /api/maintenance/complaints'
    Expected = '200'
    Actual = "$($m1.StatusCode)"
    Status = if ($passM1) { 'PASS' } else { 'FAIL' }
    Details = "Org queue tickets: $(@($m1.Body.data.complaints).Count)"
}

# 6. Maintenance: GET /maintenance/technicians
$m2 = Call-Api -Uri "$baseUrl/maintenance/technicians" -Token $maintToken -ApiContext 'maintenance'
$passM2 = ($m2.StatusCode -eq 200 -and $m2.Body.data.technicians -ne $null)
$results += [PSCustomObject]@{
    Module = 'Maintenance (Supervisor)'
    Endpoint = 'GET /api/maintenance/technicians'
    Expected = '200'
    Actual = "$($m2.StatusCode)"
    Status = if ($passM2) { 'PASS' } else { 'FAIL' }
    Details = "Technicians count: $(@($m2.Body.data.technicians).Count)"
}

# 7. Owner: POST /owner/complaints (staff create)
$staffData = @{
    unit_id = 1
    title = "Master Test - HVAC Inspection - $(Get-Date -Format 'HH:mm:ss')"
    description = "Annual maintenance filter replacement."
    category = "ac"
    priority = "high"
}
$o1 = Call-Api -Uri "$baseUrl/owner/complaints" -Token $ownerToken -Method 'POST' -ApiContext 'owner' -Body $staffData
$passO1 = ($o1.StatusCode -eq 201 -and $o1.Body.data.complaint.category -eq 'ac' -and $o1.Body.data.complaint.source -eq 'staff')
$staffTicketId = if ($o1.Body.data.complaint) { $o1.Body.data.complaint.id } else { null }
$results += [PSCustomObject]@{
    Module = 'Maintenance (Owner)'
    Endpoint = 'POST /api/owner/complaints'
    Expected = '201'
    Actual = "$($o1.StatusCode)"
    Status = if ($passO1) { 'PASS' } else { 'FAIL' }
    Details = "Created ID: $staffTicketId, Source: $($o1.Body.data.complaint.source), Category: $($o1.Body.data.complaint.category)"
}

$workTicketId = if ($staffTicketId) { $staffTicketId } else { $createdTenantTicketId }

# 8. Assign ticket: POST /owner/complaints/{id}/assign
if ($workTicketId) {
    $assignData = @{
        assigned_to = 60
        scheduled_date = (Get-Date).AddDays(2).ToString('yyyy-MM-dd')
        notes = "Assigned for AC filter replacement"
    }
    $o2 = Call-Api -Uri "$baseUrl/owner/complaints/$workTicketId/assign" -Token $ownerToken -Method 'POST' -ApiContext 'owner' -Body $assignData
    $passO2 = ($o2.StatusCode -eq 200 -and $o2.Body.data.job.status -eq 'assigned' -and $o2.Body.data.job.scheduled_date -ne $null)
    $results += [PSCustomObject]@{
        Module = 'Maintenance (Assign)'
        Endpoint = "POST /api/owner/complaints/{id}/assign"
        Expected = '200'
        Actual = "$($o2.StatusCode)"
        Status = if ($passO2) { 'PASS' } else { 'FAIL' }
        Details = "Job ID: $($o2.Body.data.job.id), Status: $($o2.Body.data.job.status), Scheduled: $($o2.Body.data.job.scheduled_date)"
    }
}

# 9. Status -> in_progress: POST /maintenance/complaints/{id}/status
if ($workTicketId) {
    $inProgData = @{
        status = "in_progress"
        notes = "Technician arrived on site, commenced inspection"
    }
    $m3 = Call-Api -Uri "$baseUrl/maintenance/complaints/$workTicketId/status" -Token $maintToken -Method 'POST' -ApiContext 'maintenance' -Body $inProgData
    $passM3 = ($m3.StatusCode -eq 200 -and $m3.Body.data.complaint.status -eq 'in_progress' -and $m3.Body.data.job.status -eq 'in_progress')
    $results += [PSCustomObject]@{
        Module = 'Maintenance (Status)'
        Endpoint = "POST .../status -> in_progress"
        Expected = '200'
        Actual = "$($m3.StatusCode)"
        Status = if ($passM3) { 'PASS' } else { 'FAIL' }
        Details = "Complaint: $($m3.Body.data.complaint.status), Job: $($m3.Body.data.job.status)"
    }
}

# 10. Status -> resolved: POST /maintenance/complaints/{id}/status
if ($workTicketId) {
    $resolveData = @{
        status = "resolved"
        notes = "Filters replaced and system fully tested."
    }
    $m4 = Call-Api -Uri "$baseUrl/maintenance/complaints/$workTicketId/status" -Token $maintToken -Method 'POST' -ApiContext 'maintenance' -Body $resolveData
    $passM4 = ($m4.StatusCode -eq 200 -and $m4.Body.data.complaint.status -eq 'resolved' -and $m4.Body.data.job.status -eq 'completed' -and $m4.Body.data.job.completed_at -ne $null)
    $results += [PSCustomObject]@{
        Module = 'Maintenance (Status)'
        Endpoint = "POST .../status -> resolved"
        Expected = '200'
        Actual = "$($m4.StatusCode)"
        Status = if ($passM4) { 'PASS' } else { 'FAIL' }
        Details = "Complaint: $($m4.Body.data.complaint.status), Job: $($m4.Body.data.job.status), CompletedAt: $($m4.Body.data.job.completed_at)"
    }
}

# 11. State Machine: Illegal transition resolved -> open (Expect 422)
if ($workTicketId) {
    $reopenData = @{
        status = "open"
        notes = "Attempting illegal reopen"
    }
    $m5 = Call-Api -Uri "$baseUrl/maintenance/complaints/$workTicketId/status" -Token $maintToken -Method 'POST' -ApiContext 'maintenance' -Body $reopenData
    $passM5 = ($m5.StatusCode -eq 422)
    $results += [PSCustomObject]@{
        Module = 'Maintenance (Validation)'
        Endpoint = "Illegal transition resolved -> open"
        Expected = '422'
        Actual = "$($m5.StatusCode)"
        Status = if ($passM5) { 'PASS' } else { 'FAIL' }
        Details = "$($m5.Raw | ConvertFrom-Json | Select-Object -ExpandProperty message -ErrorAction SilentlyContinue)"
    }
}

# 12. Security: Tenant cannot assign complaints (Expect 403 or 404)
if ($workTicketId) {
    $sec1 = Call-Api -Uri "$baseUrl/tenant/complaints/$workTicketId/assign" -Token $tenantToken -Method 'POST' -ApiContext 'tenant' -Body @{ assigned_to = 60 }
    $passSec1 = ($sec1.StatusCode -eq 403 -or $sec1.StatusCode -eq 404 -or $sec1.StatusCode -eq 405)
    $results += [PSCustomObject]@{
        Module = 'Maintenance (Security)'
        Endpoint = "Tenant assign attempt blocked"
        Expected = '403/404/405'
        Actual = "$($sec1.StatusCode)"
        Status = if ($passSec1) { 'PASS' } else { 'FAIL' }
        Details = "Role boundary enforced"
    }
}

# 13. Security: Cross-tenant complaint view (Expect 404)
if ($staffTicketId) {
    $sec2 = Call-Api -Uri "$baseUrl/tenant/complaints/$staffTicketId" -Token $tenantToken -ApiContext 'tenant'
    $passSec2 = ($sec2.StatusCode -eq 404)
    $results += [PSCustomObject]@{
        Module = 'Maintenance (Security)'
        Endpoint = "Cross-tenant complaint view blocked"
        Expected = '404'
        Actual = "$($sec2.StatusCode)"
        Status = if ($passSec2) { 'PASS' } else { 'FAIL' }
        Details = "Cross-tenant access blocked without leaking existence"
    }
}

# 14. Maintenance: GET /maintenance/jobs
$mJobs = Call-Api -Uri "$baseUrl/maintenance/jobs" -Token $maintToken -ApiContext 'maintenance'
$passMJobs = ($mJobs.StatusCode -eq 200 -and $mJobs.Body.status -eq 'success')
$results += [PSCustomObject]@{
    Module = 'Maintenance (Jobs)'
    Endpoint = "GET /api/maintenance/jobs"
    Expected = '200'
    Actual = "$($mJobs.StatusCode)"
    Status = if ($passMJobs) { 'PASS' } else { 'FAIL' }
    Details = "Jobs list: $(@($mJobs.Body.data.jobs).Count)"
}

# 15. Maintenance: GET /maintenance/daily-report
$mReport = Call-Api -Uri "$baseUrl/maintenance/daily-report" -Token $maintToken -ApiContext 'maintenance'
$passMReport = ($mReport.StatusCode -eq 200)
$results += [PSCustomObject]@{
    Module = 'Maintenance (Report)'
    Endpoint = "GET /api/maintenance/daily-report"
    Expected = '200'
    Actual = "$($mReport.StatusCode)"
    Status = if ($passMReport) { 'PASS' } else { 'FAIL' }
    Details = "Daily report generated"
}

# ==========================================
# MODULE 3: PROPERTY UNIT BOARD (Signed Due)
# ==========================================

# 16. Owner GET Property 1 Unit Board
$ub1 = Call-Api -Uri "$baseUrl/owner/dashboard/properties/1/unit-board" -Token $ownerToken
$passUb1 = ($ub1.StatusCode -eq 200 -and $ub1.Body.data.units -ne $null)
$results += [PSCustomObject]@{
    Module = 'Unit Board'
    Endpoint = 'GET /api/owner/dashboard/properties/1/unit-board'
    Expected = '200'
    Actual = "$($ub1.StatusCode)"
    Status = if ($passUb1) { 'PASS' } else { 'FAIL' }
    Details = "Units count: $(@($ub1.Body.data.units).Count)"
}

# 17. Cashier GET Assigned Property 2 Unit Board
$ub2 = Call-Api -Uri "$baseUrl/staff/finance/properties/2/unit-board" -Token $cashierToken -ApiContext 'owner'
$passUb2 = ($ub2.StatusCode -eq 200 -and $ub2.Body.data.units -ne $null)
$results += [PSCustomObject]@{
    Module = 'Unit Board'
    Endpoint = 'GET /api/staff/finance/properties/2/unit-board'
    Expected = '200'
    Actual = "$($ub2.StatusCode)"
    Status = if ($passUb2) { 'PASS' } else { 'FAIL' }
    Details = "Property: $($ub2.Body.data.property.name), Units: $(@($ub2.Body.data.units).Count)"
}

# 18. Cashier GET Unassigned Property 1 Unit Board (Blocked -> 404)
$ub3 = Call-Api -Uri "$baseUrl/staff/finance/properties/1/unit-board" -Token $cashierToken -ApiContext 'owner'
$passUb3 = ($ub3.StatusCode -eq 404)
$results += [PSCustomObject]@{
    Module = 'Unit Board (Security)'
    Endpoint = 'GET .../properties/1/unit-board (unassigned)'
    Expected = '404'
    Actual = "$($ub3.StatusCode)"
    Status = if ($passUb3) { 'PASS' } else { 'FAIL' }
    Details = "Blocked: $($ub3.Raw | ConvertFrom-Json | Select-Object -ExpandProperty message -ErrorAction SilentlyContinue)"
}

# ==========================================
# MODULE 4: SINGLE UNIT DETAIL API
# ==========================================

# 19. Cashier GET Occupied Unit 3 Detail
$ud1 = Call-Api -Uri "$baseUrl/staff/finance/units/3" -Token $cashierToken -ApiContext 'owner'
$passUd1 = ($ud1.StatusCode -eq 200 -and $ud1.Body.data.unit.status -eq 'OCCUPIED' -and $ud1.Body.data.unit.active_contract -ne $null)
$results += [PSCustomObject]@{
    Module = 'Unit Detail'
    Endpoint = 'GET /api/staff/finance/units/3 (Occupied)'
    Expected = '200'
    Actual = "$($ud1.StatusCode)"
    Status = if ($passUd1) { 'PASS' } else { 'FAIL' }
    Details = "Status: $($ud1.Body.data.unit.status), Contract: $($ud1.Body.data.unit.active_contract.id), Due: $($ud1.Body.data.unit.active_contract.balance.due)"
}

# 20. Owner GET Vacant Unit 1 Detail
$ud2 = Call-Api -Uri "$baseUrl/owner/dashboard/units/1" -Token $ownerToken -ApiContext 'owner'
$passUd2 = ($ud2.StatusCode -eq 200 -and $ud2.Body.data.unit.status -eq 'AVAILABLE' -and $ud2.Body.data.unit.active_contract -eq $null)
$results += [PSCustomObject]@{
    Module = 'Unit Detail'
    Endpoint = 'GET /api/owner/dashboard/units/1 (Vacant)'
    Expected = '200'
    Actual = "$($ud2.StatusCode)"
    Status = if ($passUd2) { 'PASS' } else { 'FAIL' }
    Details = "Status: $($ud2.Body.data.unit.status), active_contract: $(if ($ud2.Body.data.unit.active_contract) {'Present'} else {'Null'})"
}

# 21. Owner Alias GET /owner/units/1/detail
$ud3 = Call-Api -Uri "$baseUrl/owner/units/1/detail" -Token $ownerToken -ApiContext 'owner'
$passUd3 = ($ud3.StatusCode -eq 200 -and $ud3.Body.data.unit.id -eq 1)
$results += [PSCustomObject]@{
    Module = 'Unit Detail'
    Endpoint = 'GET /api/owner/units/1/detail (Alias)'
    Expected = '200'
    Actual = "$($ud3.StatusCode)"
    Status = if ($passUd3) { 'PASS' } else { 'FAIL' }
    Details = "Unit: $($ud3.Body.data.unit.number)"
}

# 22. Cashier unassigned unit 1 blocked -> 404
$ud4 = Call-Api -Uri "$baseUrl/staff/finance/units/1" -Token $cashierToken -ApiContext 'owner'
$passUd4 = ($ud4.StatusCode -eq 404)
$results += [PSCustomObject]@{
    Module = 'Unit Detail (Security)'
    Endpoint = 'GET /api/staff/finance/units/1 (Unassigned)'
    Expected = '404'
    Actual = "$($ud4.StatusCode)"
    Status = if ($passUd4) { 'PASS' } else { 'FAIL' }
    Details = "Blocked: $($ud4.Raw | ConvertFrom-Json | Select-Object -ExpandProperty message -ErrorAction SilentlyContinue)"
}

# 23. Unauthenticated request -> 401
$ud5 = Call-Api -Uri "$baseUrl/owner/dashboard/units/1" -Token ''
$passUd5 = ($ud5.StatusCode -eq 401)
$results += [PSCustomObject]@{
    Module = 'Auth Boundary'
    Endpoint = 'Unauthenticated GET request'
    Expected = '401'
    Actual = "$($ud5.StatusCode)"
    Status = if ($passUd5) { 'PASS' } else { 'FAIL' }
    Details = "Blocked unauthenticated call"
}

# 24. Non-existent unit -> 404
$ud6 = Call-Api -Uri "$baseUrl/owner/dashboard/units/999999" -Token $ownerToken -ApiContext 'owner'
$passUd6 = ($ud6.StatusCode -eq 404)
$results += [PSCustomObject]@{
    Module = 'Error Handling'
    Endpoint = 'GET non-existent unit 999999'
    Expected = '404'
    Actual = "$($ud6.StatusCode)"
    Status = if ($passUd6) { 'PASS' } else { 'FAIL' }
    Details = "Correctly handled non-existent ID"
}

Write-Host "`n================ MASTER SYSTEM TEST RESULTS (24 ASSERTIONS) ================" -ForegroundColor Cyan
$results | Format-Table -AutoSize Module, Endpoint, Expected, Actual, Status, Details
$passCount = ($results | Where-Object { $_.Status -eq 'PASS' }).Count
$totalCount = $results.Count
Write-Host "Summary: $passCount of $totalCount tests PASSED`n" -ForegroundColor $(if ($passCount -eq $totalCount) { 'Green' } else { 'Red' })
