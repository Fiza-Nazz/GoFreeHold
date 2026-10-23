# test_maintenance_endpoints.ps1
# End-to-end verification of Paul Brit's Maintenance Module API

$ownerToken = '159|TkIvJXgmZVrAP0mxuZ8OcsJkUqTwU44EFZWQ0jqD6a270697'
$cashierToken = '189|eVGItDAvAHuZImQTcuoMnuCa1IsQVfgpljSYNqY282a70bf7'
$adminToken = '161|nlXVpjpoVdDE4UjVNiJsqEL2bxjxoHR1j4PmU7ge08e6f959'
$maintToken = '226|M39EACx0K4imZ6fFOjgJvaOM53vfrd914fLxzIwId17ba4bb'
$tenantToken = '225|UX3T9P8g6RK2wpfkdazKbjSHgrfoD93ehjKOAEgN9ad78592'

function Call-Api {
    param(
        [string]$Uri,
        [string]$Token = '',
        [string]$Method = 'GET',
        [string]$ApiContext = 'owner',
        [object]$Body = $null
    )
    $headers = @{
        'Accept' = 'application/json'
    }
    if ($Token -ne '') {
        $headers['Authorization'] = "Bearer $Token"
    }
    if ($ApiContext -ne '') {
        $headers['X-GFH-Api-Context'] = $ApiContext
    }

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
$baseUrl = 'https://api2.gofreehold.com/api'

# 1. Tenant: GET /tenant/units
$r1 = Call-Api -Uri "$baseUrl/tenant/units" -Token $tenantToken -ApiContext 'tenant'
$pass1 = ($r1.StatusCode -eq 200 -and $r1.Body.status -eq 'success' -and $r1.Body.data.units -ne $null)
$tenantUnitId = if ($r1.Body.data.units -and @($r1.Body.data.units).Count -gt 0) { $r1.Body.data.units[0].id } else { null }
$results += [PSCustomObject]@{
    Test = '1. Tenant GET /tenant/units'
    Expected = '200'
    Actual = "$($r1.StatusCode)"
    Result = if ($pass1) { 'PASS' } else { 'FAIL' }
    Details = "Units count: $(@($r1.Body.data.units).Count), First Unit ID: $tenantUnitId"
}

# 2. Tenant: GET /tenant/complaints
$r2 = Call-Api -Uri "$baseUrl/tenant/complaints" -Token $tenantToken -ApiContext 'tenant'
$pass2 = ($r2.StatusCode -eq 200 -and $r2.Body.status -eq 'success')
$results += [PSCustomObject]@{
    Test = '2. Tenant GET /tenant/complaints'
    Expected = '200'
    Actual = "$($r2.StatusCode)"
    Result = if ($pass2) { 'PASS' } else { 'FAIL' }
    Details = "Complaints count: $(@($r2.Body.data.complaints).Count)"
}

# 3. Tenant: POST /tenant/complaints with category & priority
$newComplaintId = $null
if ($tenantUnitId) {
    $createPayload = @{
        unit_id = $tenantUnitId
        title = "Automated Test Leak - $(Get-Date -Format 'HH:mm:ss')"
        description = "Water leaking under the sink in kitchen."
        category = "plumbing"
        priority = "high"
    }
    $r3 = Call-Api -Uri "$baseUrl/tenant/complaints" -Token $tenantToken -Method 'POST' -ApiContext 'tenant' -Body $createPayload
    $pass3 = ($r3.StatusCode -eq 201 -and $r3.Body.data.complaint.category -eq 'plumbing' -and $r3.Body.data.complaint.source -eq 'tenant' -and $r3.Body.data.complaint.status -eq 'open')
    if ($r3.Body.data.complaint) {
        $newComplaintId = $r3.Body.data.complaint.id
    }
    $results += [PSCustomObject]@{
        Test = '3. Tenant POST /tenant/complaints (persists category & source=tenant)'
        Expected = '201'
        Actual = "$($r3.StatusCode)"
        Result = if ($pass3) { 'PASS' } else { 'FAIL' }
        Details = "Created ID: $newComplaintId, Category: $($r3.Body.data.complaint.category), Source: $($r3.Body.data.complaint.source)"
    }
} else {
    $results += [PSCustomObject]@{
        Test = '3. Tenant POST /tenant/complaints'
        Expected = '201'
        Actual = 'SKIPPED'
        Result = 'SKIP'
        Details = 'No active unit for tenant account'
    }
}

# 4. Tenant: GET /tenant/complaints/{id}
if ($newComplaintId) {
    $r4 = Call-Api -Uri "$baseUrl/tenant/complaints/$newComplaintId" -Token $tenantToken -ApiContext 'tenant'
    $hasUpdate = ($r4.Body.data.complaint.updates -and @($r4.Body.data.complaint.updates).Count -gt 0)
    $pass4 = ($r4.StatusCode -eq 200 -and $r4.Body.data.complaint.id -eq $newComplaintId -and $hasUpdate)
    $results += [PSCustomObject]@{
        Test = '4. Tenant GET /tenant/complaints/{id} (includes timeline updates)'
        Expected = '200'
        Actual = "$($r4.StatusCode)"
        Result = if ($pass4) { 'PASS' } else { 'FAIL' }
        Details = "Title: $($r4.Body.data.complaint.title), Updates count: $(@($r4.Body.data.complaint.updates).Count)"
    }
}

# 5. Maintenance: GET /maintenance/complaints (org-wide queue)
$r5 = Call-Api -Uri "$baseUrl/maintenance/complaints" -Token $maintToken -ApiContext 'maintenance'
$pass5 = ($r5.StatusCode -eq 200 -and $r5.Body.status -eq 'success')
$results += [PSCustomObject]@{
    Test = '5. Maintenance GET /maintenance/complaints (org queue)'
    Expected = '200'
    Actual = "$($r5.StatusCode)"
    Result = if ($pass5) { 'PASS' } else { 'FAIL' }
    Details = "Complaints in supervisor queue: $(@($r5.Body.data.complaints).Count)"
}

# 6. Maintenance: GET /maintenance/technicians
$r6 = Call-Api -Uri "$baseUrl/maintenance/technicians" -Token $maintToken -ApiContext 'maintenance'
$pass6 = ($r6.StatusCode -eq 200 -and $r6.Body.data.technicians -ne $null)
$techCount = if ($r6.Body.data.technicians) { @($r6.Body.data.technicians).Count } else { 0 }
$results += [PSCustomObject]@{
    Test = '6. Maintenance GET /maintenance/technicians'
    Expected = '200'
    Actual = "$($r6.StatusCode)"
    Result = if ($pass6) { 'PASS' } else { 'FAIL' }
    Details = "Technicians count: $techCount"
}

# 7. Owner: POST /owner/complaints (staff create)
$ownerStaffPayload = @{
    unit_id = 1
    title = "Staff Logged AC Failure - $(Get-Date -Format 'HH:mm:ss')"
    description = "AC blowing warm air in master bedroom."
    category = "ac"
    priority = "medium"
}
$r7 = Call-Api -Uri "$baseUrl/owner/complaints" -Token $ownerToken -Method 'POST' -ApiContext 'owner' -Body $ownerStaffPayload
$pass7 = ($r7.StatusCode -eq 201 -and $r7.Body.data.complaint.category -eq 'ac' -and $r7.Body.data.complaint.source -eq 'staff')
$staffComplaintId = if ($r7.Body.data.complaint) { $r7.Body.data.complaint.id } else { null }
$results += [PSCustomObject]@{
    Test = '7. Owner POST /owner/complaints (staff ticket)'
    Expected = '201'
    Actual = "$($r7.StatusCode)"
    Result = if ($pass7) { 'PASS' } else { 'FAIL' }
    Details = "Created ID: $staffComplaintId, Source: $($r7.Body.data.complaint.source), Category: $($r7.Body.data.complaint.category)"
}

# Target complaint for workflow transitions
$targetId = if ($staffComplaintId) { $staffComplaintId } else { $newComplaintId }

# 8. Maintenance / Owner: Assign technician + schedule
if ($targetId) {
    $assignPayload = @{
        assigned_to = 60
        scheduled_date = (Get-Date).AddDays(1).ToString('yyyy-MM-dd')
        notes = "Assigned for morning inspection"
    }
    $r8 = Call-Api -Uri "$baseUrl/owner/complaints/$targetId/assign" -Token $ownerToken -Method 'POST' -ApiContext 'owner' -Body $assignPayload
    $pass8 = ($r8.StatusCode -eq 200 -and $r8.Body.data.job.status -eq 'assigned' -and $r8.Body.data.job.scheduled_date -ne $null)
    $results += [PSCustomObject]@{
        Test = '8. POST /owner/complaints/{id}/assign (upserts job, sets scheduled_date)'
        Expected = '200'
        Actual = "$($r8.StatusCode)"
        Result = if ($pass8) { 'PASS' } else { 'FAIL' }
        Details = "Job ID: $($r8.Body.data.job.id), Status: $($r8.Body.data.job.status), Scheduled: $($r8.Body.data.job.scheduled_date)"
    }
}

# 9. Maintenance: Status -> in_progress
if ($targetId) {
    $statusPayload = @{
        status = "in_progress"
        notes = "Technician arrived on-site and began troubleshooting."
    }
    $r9 = Call-Api -Uri "$baseUrl/maintenance/complaints/$targetId/status" -Token $maintToken -Method 'POST' -ApiContext 'maintenance' -Body $statusPayload
    $pass9 = ($r9.StatusCode -eq 200 -and $r9.Body.data.complaint.status -eq 'in_progress' -and $r9.Body.data.job.status -eq 'in_progress')
    $results += [PSCustomObject]@{
        Test = '9. POST /maintenance/complaints/{id}/status -> in_progress (syncs job)'
        Expected = '200'
        Actual = "$($r9.StatusCode)"
        Result = if ($pass9) { 'PASS' } else { 'FAIL' }
        Details = "Complaint: $($r9.Body.data.complaint.status), Job: $($r9.Body.data.job.status)"
    }
}

# 10. Maintenance: Status -> resolved
if ($targetId) {
    $resolvePayload = @{
        status = "resolved"
        notes = "Compressor cleaned and refrigerant recharged. Issue fully resolved."
    }
    $r10 = Call-Api -Uri "$baseUrl/maintenance/complaints/$targetId/status" -Token $maintToken -Method 'POST' -ApiContext 'maintenance' -Body $resolvePayload
    $pass10 = ($r10.StatusCode -eq 200 -and $r10.Body.data.complaint.status -eq 'resolved' -and $r10.Body.data.job.status -eq 'completed' -and $r10.Body.data.job.completed_at -ne $null)
    $results += [PSCustomObject]@{
        Test = '10. POST /maintenance/complaints/{id}/status -> resolved (job completed_at set)'
        Expected = '200'
        Actual = "$($r10.StatusCode)"
        Result = if ($pass10) { 'PASS' } else { 'FAIL' }
        Details = "Complaint: $($r10.Body.data.complaint.status), Job: $($r10.Body.data.job.status), CompletedAt: $($r10.Body.data.job.completed_at)"
    }
}

# 11. State Machine: Illegal transition resolved -> open (Expect 422)
if ($targetId) {
    $illegalPayload = @{
        status = "open"
        notes = "Trying to reopen a terminal resolved ticket"
    }
    $r11 = Call-Api -Uri "$baseUrl/maintenance/complaints/$targetId/status" -Token $maintToken -Method 'POST' -ApiContext 'maintenance' -Body $illegalPayload
    $pass11 = ($r11.StatusCode -eq 422)
    $results += [PSCustomObject]@{
        Test = '11. Illegal transition resolved -> open (State machine validation)'
        Expected = '422'
        Actual = "$($r11.StatusCode)"
        Result = if ($pass11) { 'PASS' } else { 'FAIL' }
        Details = "$($r11.Raw | ConvertFrom-Json | Select-Object -ExpandProperty message -ErrorAction SilentlyContinue)"
    }
}

# 12. Security Boundary: Tenant cannot assign complaints (Expect 403)
if ($targetId) {
    $tenantAssignPayload = @{
        assigned_to = 60
    }
    $r12 = Call-Api -Uri "$baseUrl/tenant/complaints/$targetId/assign" -Token $tenantToken -Method 'POST' -ApiContext 'tenant' -Body $tenantAssignPayload
    $pass12 = ($r12.StatusCode -eq 403 -or $r12.StatusCode -eq 404 -or $r12.StatusCode -eq 405)
    $results += [PSCustomObject]@{
        Test = '12. Tenant cannot assign complaints (Role boundary)'
        Expected = '403/404/405'
        Actual = "$($r12.StatusCode)"
        Result = if ($pass12) { 'PASS' } else { 'FAIL' }
        Details = "Blocked tenant assign request"
    }
}

# 13. Owner: GET /owner/complaints/{id}
if ($targetId) {
    $r13 = Call-Api -Uri "$baseUrl/owner/complaints/$targetId" -Token $ownerToken -ApiContext 'owner'
    $pass13 = ($r13.StatusCode -eq 200 -and $r13.Body.data.complaint.id -eq $targetId)
    $results += [PSCustomObject]@{
        Test = '13. Owner GET /owner/complaints/{id} (detail + job + updates)'
        Expected = '200'
        Actual = "$($r13.StatusCode)"
        Result = if ($pass13) { 'PASS' } else { 'FAIL' }
        Details = "Updates count: $(@($r13.Body.data.complaint.updates).Count)"
    }
}

Write-Host "`n================ LIVE API MAINTENANCE MODULE TEST RESULTS ================" -ForegroundColor Cyan
$results | Format-Table -AutoSize Test, Expected, Actual, Result, Details
$passCount = ($results | Where-Object { $_.Result -eq 'PASS' }).Count
$totalCount = $results.Count
Write-Host "Summary: $passCount of $totalCount tests PASSED`n" -ForegroundColor $(if ($passCount -eq $totalCount) { 'Green' } else { 'Yellow' })
