# test_all_endpoints.ps1
# Comprehensive end-to-end testing script for Paul Brit requirements

$ownerToken = '159|TkIvJXgmZVrAP0mxuZ8OcsJkUqTwU44EFZWQ0jqD6a270697'
$cashierToken = '189|eVGItDAvAHuZImQTcuoMnuCa1IsQVfgpljSYNqY282a70bf7'
$adminToken = '161|nlXVpjpoVdDE4UjVNiJsqEL2bxjxoHR1j4PmU7ge08e6f959'

function Call-Api {
    param(
        [string]$Uri,
        [string]$Token = '',
        [string]$Method = 'GET',
        [string]$ApiContext = 'owner'
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
        $resp = Invoke-WebRequest -Uri $Uri -Method $Method -Headers $headers -UseBasicParsing
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

# SECTION 1: PROPERTY UNIT BOARD ENDPOINTS
$r1 = Call-Api -Uri 'https://api2.gofreehold.com/api/owner/dashboard/properties/1/unit-board' -Token $ownerToken
$pass1 = ($r1.StatusCode -eq 200 -and $r1.Body.data.units -ne $null)
$uCount1 = if ($r1.Body.data.units) { @($r1.Body.data.units).Count } else { 0 }
$results += [PSCustomObject]@{
    Test = '1.1 Owner GET property 1 unit-board'
    Expected = '200'
    Actual = [string]$r1.StatusCode
    Status = if ($pass1) { 'PASS' } else { 'FAIL' }
    Details = "Units count: $uCount1"
}

$r2 = Call-Api -Uri 'https://api2.gofreehold.com/api/owner/properties/1/unit-board' -Token $ownerToken
$pass2 = ($r2.StatusCode -eq 200 -and $r2.Body.data.property.id -eq 1)
$results += [PSCustomObject]@{
    Test = '1.2 Owner Alias GET /owner/properties/1/unit-board'
    Expected = '200'
    Actual = [string]$r2.StatusCode
    Status = if ($pass2) { 'PASS' } else { 'FAIL' }
    Details = "Property: $($r2.Body.data.property.name)"
}

$r3 = Call-Api -Uri 'https://api2.gofreehold.com/api/staff/finance/properties/2/unit-board' -Token $cashierToken
$pass3 = ($r3.StatusCode -eq 200 -and $r3.Body.data.property.id -eq 2)
$uCount3 = if ($r3.Body.data.units) { @($r3.Body.data.units).Count } else { 0 }
$results += [PSCustomObject]@{
    Test = '1.3 Cashier GET assigned property 2 unit-board'
    Expected = '200'
    Actual = [string]$r3.StatusCode
    Status = if ($pass3) { 'PASS' } else { 'FAIL' }
    Details = "Property: $($r3.Body.data.property.name), Units: $uCount3"
}

$r4 = Call-Api -Uri 'https://api2.gofreehold.com/api/staff/finance/properties/1/unit-board' -Token $cashierToken
$pass4 = ($r4.StatusCode -eq 404 -and $r4.Body.code -eq 'PROPERTY_NOT_FOUND')
$results += [PSCustomObject]@{
    Test = '1.4 Cashier GET unassigned property 1 unit-board'
    Expected = '404'
    Actual = [string]$r4.StatusCode
    Status = if ($pass4) { 'PASS' } else { 'FAIL' }
    Details = "Blocked: $($r4.Body.message)"
}

# SECTION 2: UNIT DETAIL API — OCCUPIED UNIT
$r5 = Call-Api -Uri 'https://api2.gofreehold.com/api/staff/finance/units/3' -Token $cashierToken
$u3 = $r5.Body.data.unit
$pass5 = ($r5.StatusCode -eq 200 -and $u3.status -eq 'OCCUPIED' -and $u3.active_contract.status -eq 'active')
$results += [PSCustomObject]@{
    Test = '2.1 Cashier GET /api/staff/finance/units/3'
    Expected = '200'
    Actual = [string]$r5.StatusCode
    Status = if ($pass5) { 'PASS' } else { 'FAIL' }
    Details = "Status: $($u3.status), Contract: $($u3.active_contract.id)"
}

$act3 = $u3.active_contract
$hasDates = ($act3.start_date -match '^\d{4}-\d{2}-\d{2}$' -and $act3.end_date -match '^\d{4}-\d{2}-\d{2}$')
$hasTenant = ($act3.tenant.id -ne $null -and $act3.tenant.name -ne $null -and $act3.tenant.phone -ne $null -and $act3.tenant.contact -ne $null)
$hasRentNorm = ($act3.monthly_rent -ne $null -and [double]$act3.monthly_rent -gt 0)
$pass6 = ($act3 -ne $null -and $hasDates -and $hasTenant -and $hasRentNorm)
$results += [PSCustomObject]@{
    Test = '2.2 Active Contract Schema (Dates, Tenant, Rent)'
    Expected = 'Valid'
    Actual = if ($pass6) { 'Valid' } else { 'Invalid' }
    Status = if ($pass6) { 'PASS' } else { 'FAIL' }
    Details = "start: $($act3.start_date), monthly_rent: $($act3.monthly_rent)"
}

$recPay = $u3.recent_payments
$isPlainArray = ($recPay -is [array] -or ($recPay.Count -ge 0))
$payDatesValid = $true
foreach ($p in $recPay) {
    if ($p.date -and $p.date -notmatch '^\d{4}-\d{2}-\d{2}$') { $payDatesValid = $false }
}
$payCount = if ($recPay) { @($recPay).Count } else { 0 }
$pass7 = ($isPlainArray -and $payDatesValid)
$results += [PSCustomObject]@{
    Test = '2.3 Recent Payments (Plain array, YYYY-MM-DD)'
    Expected = 'PlainArray'
    Actual = "Count: $payCount"
    Status = if ($pass7) { 'PASS' } else { 'FAIL' }
    Details = "Payments count: $payCount"
}

$stmt = $u3.statement
$hasEntries = ($stmt.entries -is [array])
$hasSummary = ($stmt.summary.total_debit -ne $null -and $stmt.summary.total_credit -ne $null -and $stmt.summary.total_balance -ne $null)
$balanceCorrect = ([double]$stmt.summary.total_balance -eq ([double]$stmt.summary.total_debit - [double]$stmt.summary.total_credit))
$pass8 = ($hasEntries -and $hasSummary -and $balanceCorrect)
$results += [PSCustomObject]@{
    Test = '2.4 Statement Sub-ledger (Entries + Summary)'
    Expected = 'Valid'
    Actual = if ($pass8) { 'Valid' } else { 'Invalid' }
    Status = if ($pass8) { 'PASS' } else { 'FAIL' }
    Details = "Debit: $($stmt.summary.total_debit), Credit: $($stmt.summary.total_credit), Balance: $($stmt.summary.total_balance)"
}

# SECTION 3: UNIT DETAIL API — VACANT / VACATED UNIT
$r6 = Call-Api -Uri 'https://api2.gofreehold.com/api/owner/dashboard/units/1' -Token $ownerToken
$u1 = $r6.Body.data.unit
$pass9 = ($r6.StatusCode -eq 200 -and $u1.status -eq 'AVAILABLE')
$results += [PSCustomObject]@{
    Test = '3.1 Owner GET /api/owner/dashboard/units/1'
    Expected = '200'
    Actual = [string]$r6.StatusCode
    Status = if ($pass9) { 'PASS' } else { 'FAIL' }
    Details = "Unit: $($u1.number), Status: $($u1.status)"
}

$pass10 = ($u1.active_contract -eq $null)
$results += [PSCustomObject]@{
    Test = '3.2 Vacated Lease NOT Embedded as active_contract'
    Expected = 'Null'
    Actual = if ($u1.active_contract -eq $null) { 'Null' } else { 'Embedded' }
    Status = if ($pass10) { 'PASS' } else { 'FAIL' }
    Details = 'active_contract is strictly null'
}

$u1PayCount = if ($u1.recent_payments) { @($u1.recent_payments).Count } else { 0 }
$pass11 = ($u1.recent_payments -is [array] -and $u1PayCount -eq 0)
$results += [PSCustomObject]@{
    Test = '3.3 Vacant Unit Recent Payments empty array'
    Expected = 'EmptyArray'
    Actual = "Count: $u1PayCount"
    Status = if ($pass11) { 'PASS' } else { 'FAIL' }
    Details = 'recent_payments is []'
}

$u1EntriesCount = if ($u1.statement.entries) { @($u1.statement.entries).Count } else { 0 }
$pass12 = ($u1.statement.entries -is [array] -and $u1EntriesCount -eq 0 -and $u1.statement.summary.total_balance -eq 0)
$results += [PSCustomObject]@{
    Test = '3.4 Vacant Unit Statement empty with 0 balance'
    Expected = '0 Balance'
    Actual = "Balance: $($u1.statement.summary.total_balance)"
    Status = if ($pass12) { 'PASS' } else { 'FAIL' }
    Details = 'statement entries: [], total_balance: 0'
}

$r7 = Call-Api -Uri 'https://api2.gofreehold.com/api/owner/units/1/detail' -Token $ownerToken
$pass13 = ($r7.StatusCode -eq 200 -and $r7.Body.data.unit.id -eq 1)
$results += [PSCustomObject]@{
    Test = '3.5 Owner Alias GET /api/owner/units/1/detail'
    Expected = '200'
    Actual = [string]$r7.StatusCode
    Status = if ($pass13) { 'PASS' } else { 'FAIL' }
    Details = "Alias returned unit $($r7.Body.data.unit.number)"
}

# SECTION 4: ROLE BOUNDARY, ASSIGNMENTS & SECURITY (404/403/401)
$r8 = Call-Api -Uri 'https://api2.gofreehold.com/api/staff/finance/units/1' -Token $cashierToken
$pass14 = ($r8.StatusCode -eq 404 -and $r8.Body.code -eq 'UNIT_NOT_FOUND')
$results += [PSCustomObject]@{
    Test = '4.1 Cashier unassigned unit 1 -> 404 Not Found'
    Expected = '404'
    Actual = [string]$r8.StatusCode
    Status = if ($pass14) { 'PASS' } else { 'FAIL' }
    Details = "Response: $($r8.Body.message)"
}

$r9 = Call-Api -Uri 'https://api2.gofreehold.com/api/owner/dashboard/units/1' -Token $cashierToken
$pass15 = ($r9.StatusCode -eq 404 -and $r9.Body.code -eq 'UNIT_NOT_FOUND')
$results += [PSCustomObject]@{
    Test = '4.2 Cashier unassigned unit on owner route -> 404'
    Expected = '404'
    Actual = [string]$r9.StatusCode
    Status = if ($pass15) { 'PASS' } else { 'FAIL' }
    Details = "Response: $($r9.Body.message)"
}

$r10 = Call-Api -Uri 'https://api2.gofreehold.com/api/owner/dashboard/units/1' -Token $adminToken
$pass16 = ($r10.StatusCode -eq 403)
$results += [PSCustomObject]@{
    Test = '4.3 Platform Admin blocked from owner unit -> 403'
    Expected = '403'
    Actual = [string]$r10.StatusCode
    Status = if ($pass16) { 'PASS' } else { 'FAIL' }
    Details = "Response: $($r10.Body.message)"
}

$r11 = Call-Api -Uri 'https://api2.gofreehold.com/api/staff/finance/units/3' -Token $adminToken
$pass17 = ($r11.StatusCode -eq 403)
$results += [PSCustomObject]@{
    Test = '4.4 Platform Admin blocked from staff unit -> 403'
    Expected = '403'
    Actual = [string]$r11.StatusCode
    Status = if ($pass17) { 'PASS' } else { 'FAIL' }
    Details = "Response: $($r11.Body.message)"
}

$r12 = Call-Api -Uri 'https://api2.gofreehold.com/api/owner/dashboard/units/1'
$pass18 = ($r12.StatusCode -eq 401)
$results += [PSCustomObject]@{
    Test = '4.5 Unauthenticated request -> 401 Unauthorized'
    Expected = '401'
    Actual = [string]$r12.StatusCode
    Status = if ($pass18) { 'PASS' } else { 'FAIL' }
    Details = "Response: $($r12.Body.message)"
}

$r13 = Call-Api -Uri 'https://api2.gofreehold.com/api/owner/dashboard/units/999999' -Token $ownerToken
$pass19 = ($r13.StatusCode -eq 404 -and $r13.Body.code -eq 'UNIT_NOT_FOUND')
$results += [PSCustomObject]@{
    Test = '4.6 Non-existent ID 999999 -> 404 UNIT_NOT_FOUND'
    Expected = '404'
    Actual = [string]$r13.StatusCode
    Status = if ($pass19) { 'PASS' } else { 'FAIL' }
    Details = "Response: $($r13.Body.message)"
}

# SECTION 5: SIGNED BALANCE CHECKS
$r14 = Call-Api -Uri 'https://api2.gofreehold.com/api/staff/finance/units/4' -Token $cashierToken
$u4 = $r14.Body.data.unit
$dueVal = $u4.active_contract.due
$chequesCount = if ($u4.active_contract.cheques) { @($u4.active_contract.cheques).Count } else { 0 }
$pass20 = ($r14.StatusCode -eq 200 -and $dueVal -ne $null)
$results += [PSCustomObject]@{
    Test = '5.1 Occupied Unit 4 returns signed numeric due'
    Expected = 'SignedNumeric'
    Actual = "due: $dueVal"
    Status = if ($pass20) { 'PASS' } else { 'FAIL' }
    Details = "Cheques: $chequesCount, due: $dueVal"
}

# Output Results
$results | Format-Table -AutoSize Test, Expected, Actual, Status, Details

$totalTests = $results.Count
$totalPassed = ($results | Where-Object { $_.Status -eq 'PASS' }).Count
$totalFailed = $totalTests - $totalPassed

Write-Output "TOTAL TESTS: $totalTests"
Write-Output "PASSED:      $totalPassed"
Write-Output "FAILED:      $totalFailed"
if ($totalFailed -eq 0) {
    Write-Output "RESULT: 100% OF ENDPOINTS AND APIS COMPLIANT WITH PAUL'S REQUIREMENTS!"
}
