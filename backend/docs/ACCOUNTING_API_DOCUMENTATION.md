# GoFreeHold — Accounting API Documentation (3-Table General Ledger)

**Environment Base URL:** `https://api2.gofreehold.com`  
**API Prefix (Owner & Accountant):** `/api/owner/accounting`  
**API Prefix (Staff Finance Read-Only):** `/api/staff/finance/accounting`  
**Authentication:** Laravel Sanctum Bearer Token  
**Format:** JSON (`Accept: application/json`, `Content-Type: application/json`)  
**Status:** Live on Production

---

## 1. Architectural Overview

The accounting engine is an **organization-scoped, strict double-entry General Ledger** adhering to IFRS/GAAP standards and Dubai real-estate property management requirements.

### Database Schema (3-Table Architecture)
1. **`ac_chart_accounts`**: Accounts master list.
   - Hierarchy: Sections (`asset`, `liability`, `equity`, `revenue`, `expense`, `cogs`).
   - Types: `GROUP` (summary folders, cannot hold transactions) and `LEDGER` (transaction-posting accounts).
2. **`ac_transactions`**: Journal transaction headers.
   - Header metadata (`date`, `description`, `source_type`, `source_id`, `status`, `organization_id`, `owner_id`, `created_by`).
3. **`ac_ledgers`**: Double-entry transaction line items.
   - Lines linked to `ac_transactions` and `ac_chart_accounts`.
   - Invariant: $\sum \text{Debit} = \sum \text{Credit}$ for every transaction.
   - Immutability: Transactions cannot be modified or hard-deleted once posted; adjustments are made via reversal journals (`POST .../reverse`).

---

## 2. Authentication & Role Permissions

Pass the API token in the HTTP Authorization header:
```http
Authorization: Bearer <SANCTUM_TOKEN>
Accept: application/json
Content-Type: application/json
```

| Role | Read Operations (COA, Journals, Reports) | Write Operations (Create Account, Post Journal, Reverse) |
| :--- | :---: | :---: |
| **Owner** | Allowed | Allowed |
| **Accountant** | Allowed | Allowed |
| **Cashier** | Allowed | Forbidden (`403 Forbidden`) |

---

## 3. Chart of Accounts (COA) Endpoints

### 3.1. List Chart of Accounts
Returns all accounts for the authenticated user's organization.

* **Method:** `GET`
* **URL:** `/api/owner/accounting/chart-accounts`
* **Query Parameters:**
  - `type` (optional): `asset`, `liability`, `equity`, `revenue`, `expense`, `cogs`
  - `description` (optional): `GROUP` or `LEDGER`
  - `status` (optional): `ACTIVE` or `INACTIVE`
  - `is_cash` (optional): `true` or `false`
  - `q` (optional): Search query (matches code, name, or account_header)

#### Response Example (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "accounts": [
      {
        "id": 1,
        "organization_id": 1,
        "code": "1000",
        "name": "Current Assets",
        "type": "asset",
        "account_header": null,
        "parent_coa": "0",
        "description": "GROUP",
        "dr_cr": "DR",
        "is_cash": false,
        "status": "ACTIVE"
      },
      {
        "id": 6,
        "organization_id": 1,
        "code": "1100",
        "name": "Cash",
        "type": "asset",
        "account_header": "Bank & Cash",
        "parent_coa": "1",
        "description": "LEDGER",
        "dr_cr": "DR",
        "is_cash": true,
        "status": "ACTIVE"
      },
      {
        "id": 7,
        "organization_id": 1,
        "code": "1200",
        "name": "Bank",
        "type": "asset",
        "account_header": "Bank & Cash",
        "parent_coa": "1",
        "description": "LEDGER",
        "dr_cr": "DR",
        "is_cash": true,
        "status": "ACTIVE"
      },
      {
        "id": 8,
        "organization_id": 1,
        "code": "1300",
        "name": "Rent Receivable",
        "type": "asset",
        "account_header": "Current Assets",
        "parent_coa": "1",
        "description": "LEDGER",
        "dr_cr": "DR",
        "is_cash": false,
        "status": "ACTIVE"
      }
    ]
  }
}
```

---

### 3.2. Get Chart of Accounts Tree View
Returns a structured nested tree view grouped by sections (`asset`, `liability`, `equity`, `revenue`, `expense`, `cogs`), with `LEDGER` accounts nested inside parent `GROUP` folders.

* **Method:** `GET`
* **URL:** `/api/owner/accounting/chart-accounts/tree`

#### Response Example (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "tree": {
      "asset": [
        {
          "id": 1,
          "code": "1000",
          "name": "Current Assets",
          "type": "asset",
          "description": "GROUP",
          "children": [
            {
              "id": 6,
              "code": "1100",
              "name": "Cash",
              "type": "asset",
              "description": "LEDGER",
              "is_cash": true,
              "dr_cr": "DR"
            },
            {
              "id": 7,
              "code": "1200",
              "name": "Bank",
              "type": "asset",
              "description": "LEDGER",
              "is_cash": true,
              "dr_cr": "DR"
            }
          ]
        }
      ],
      "liability": [],
      "equity": [],
      "revenue": [],
      "expense": []
    }
  }
}
```

---

### 3.3. Create Chart Account
Creates a new `GROUP` folder or `LEDGER` posting account.

* **Method:** `POST`
* **URL:** `/api/owner/accounting/chart-accounts`
* **Permissions:** Owner, Accountant

#### Request Body:
```json
{
  "code": "1120",
  "name": "Petty Cash Dubai Branch",
  "type": "asset",
  "account_header": "Bank & Cash",
  "parent_coa": "1",
  "description": "LEDGER",
  "dr_cr": "DR",
  "is_cash": true,
  "status": "ACTIVE"
}
```

#### Field Specifications:
- `code` *(required|string|unique per organization)*: Account number code.
- `name` *(required|string)*: Account display name.
- `type` *(required|enum)*: `asset`, `liability`, `equity`, `revenue`, `expense`, `cogs`.
- `description` *(required|enum)*: `GROUP` (parent category) or `LEDGER` (transaction account).
- `parent_coa` *(optional|string)*: Parent account ID (must point to a `GROUP` account). Use `"0"` for root.
- `dr_cr` *(optional|enum)*: Normal balance (`DR` or `CR`).
- `is_cash` *(optional|boolean)*: `true` if account represents physical cash or bank (used in cash reports).
- `status` *(optional|enum)*: `ACTIVE` or `INACTIVE`.

#### Response Example (`201 Created`):
```json
{
  "status": "success",
  "message": "Chart account created successfully.",
  "data": {
    "account": {
      "id": 41,
      "organization_id": 1,
      "code": "1120",
      "name": "Petty Cash Dubai Branch",
      "type": "asset",
      "parent_coa": "1",
      "description": "LEDGER",
      "dr_cr": "DR",
      "is_cash": true,
      "status": "ACTIVE"
    }
  }
}
```

---

### 3.4. Update Chart Account
* **Method:** `PUT`
* **URL:** `/api/owner/accounting/chart-accounts/{id}`
* **Permissions:** Owner, Accountant

#### Request Body:
```json
{
  "name": "Petty Cash Main Office",
  "status": "ACTIVE"
}
```
*Note: A `GROUP` cannot be converted to `LEDGER` if children exist. A `LEDGER` cannot be converted to `GROUP` if transactions have already been posted.*

---

### 3.5. Delete Chart Account
* **Method:** `DELETE`
* **URL:** `/api/owner/accounting/chart-accounts/{id}`
* **Permissions:** Owner, Accountant
* **Safeguards:** Deletion is blocked (`422 Unprocessable Entity`) if child accounts exist or if transactions have been posted to this account.

---

### 3.6. Seed Default Chart of Accounts
Idempotently creates standard Dubai real-estate accounts (Cash, Bank, Rent Receivable, Security Deposits, Rental Income, Maintenance Expense, etc.) for a newly created organization.

* **Method:** `POST`
* **URL:** `/api/owner/accounting/chart-accounts/seed-default`

---

## 4. Journal Entries & General Ledger Endpoints

### 4.1. List Journal Entries (Transactions)
* **Method:** `GET`
* **URL:** `/api/owner/accounting/journals`
* **Query Parameters:**
  - `from` (optional): Start date (`YYYY-MM-DD`)
  - `to` (optional): End date (`YYYY-MM-DD`)
  - `status` (optional): `COMPLETED`, `DRAFT`, `REVERSED`
  - `source_type` (optional): `MANUAL_JOURNAL`, `PAYMENT`, `RENT_CHARGE`, `SETTLEMENT`, `CHEQUE`, `REVERSAL`
  - `q` (optional): Search query
  - `per_page` (optional): Default 25 (max 100)

#### Response Example (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "journals": [
      {
        "id": 1,
        "organization_id": 1,
        "owner_id": 1,
        "date": "2026-10-18",
        "description": "Rent adjustment for Unit 308",
        "source_type": "MANUAL_JOURNAL",
        "source_id": null,
        "status": "COMPLETED",
        "ledgers": [
          {
            "id": 1,
            "trans_id": 1,
            "chartaccount_id": 7,
            "debit": "5000.00",
            "credit": "0.00",
            "chart_account": {
              "id": 7,
              "code": "1200",
              "name": "Bank",
              "type": "asset"
            }
          },
          {
            "id": 2,
            "trans_id": 1,
            "chartaccount_id": 14,
            "debit": "0.00",
            "credit": "5000.00",
            "chart_account": {
              "id": 14,
              "code": "4100",
              "name": "Rental Income",
              "type": "revenue"
            }
          }
        ]
      }
    ],
    "total": 1,
    "page": 1,
    "last_page": 1
  }
}
```

---

### 4.2. Create Manual Journal Entry
Posts a multi-line double-entry journal transaction.

* **Method:** `POST`
* **URL:** `/api/owner/accounting/journals`
* **Permissions:** Owner, Accountant

#### Request Body:
```json
{
  "date": "2026-10-19",
  "description": "Monthly Bank Account Interest & Charges Adjustment",
  "owner_id": 1,
  "lines": [
    {
      "chartaccount_id": 7,
      "debit": 1500.00,
      "credit": 0.00
    },
    {
      "chartaccount_id": 18,
      "debit": 50.00,
      "credit": 0.00
    },
    {
      "chartaccount_id": 16,
      "debit": 0.00,
      "credit": 1550.00
    }
  ]
}
```

#### Validation Rules:
1. **Double-Entry Balance**: Total Debits MUST equal Total Credits ($\sum \text{Debit} = \sum \text{Credit}$). A discrepancy returns `422 Unprocessable Entity: Journal entry is not balanced.`
2. **Account Validity**: Every `chartaccount_id` must exist in the user's organization and MUST be of description `LEDGER`. Attempting to post to a `GROUP` folder returns `422 Unprocessable Entity: Cannot post transaction to a GROUP account.`
3. **Minimum Lines**: At least 2 lines required.

#### Response Example (`201 Created`):
```json
{
  "status": "success",
  "message": "Journal entry posted successfully.",
  "data": {
    "journal": {
      "id": 8,
      "organization_id": 1,
      "date": "2026-10-19",
      "description": "Monthly Bank Account Interest & Charges Adjustment",
      "source_type": "MANUAL_JOURNAL",
      "status": "COMPLETED"
    }
  }
}
```

---

### 4.3. Reverse Journal Entry
Reverses an existing completed journal transaction by generating an immutable reciprocal journal with inverted Debits and Credits.

* **Method:** `POST`
* **URL:** `/api/owner/accounting/journals/{id}/reverse`
* **Permissions:** Owner, Accountant

#### Request Body:
```json
{
  "reason": "Reversing incorrect bank charge entry posted by mistake"
}
```

#### Response Example (`200 OK`):
```json
{
  "status": "success",
  "message": "Journal #8 reversed successfully by Journal #9.",
  "data": {
    "reversal": {
      "id": 9,
      "source_type": "REVERSAL",
      "source_id": 8,
      "description": "Reversal of Journal #8: Reversing incorrect bank charge entry posted by mistake",
      "status": "COMPLETED"
    }
  }
}
```

---

### 4.4. Account Ledger (Running Balance)
Returns the chronological journal lines and running balance for a specific chart account.

* **Method:** `GET`
* **URL:** `/api/owner/accounting/accounts/{id}/ledger`
* **Query Parameters:**
  - `from` (optional): `YYYY-MM-DD`
  - `to` (optional): `YYYY-MM-DD`

#### Response Example (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "account": {
      "id": 7,
      "code": "1200",
      "name": "Bank",
      "type": "asset",
      "description": "LEDGER"
    },
    "from": "2026-10-01",
    "to": "2026-10-19",
    "opening_balance": 0.00,
    "closing_balance": 15000.00,
    "entries": [
      {
        "ledger_id": 1,
        "trans_id": 1,
        "date": "2026-10-18",
        "description": "Rent payment Unit 308",
        "source_type": "PAYMENT",
        "source_id": 8,
        "debit": 5000.00,
        "credit": 0.00,
        "running_balance": 5000.00
      }
    ]
  }
}
```

---

## 5. Financial Reports Endpoints

All financial reports compute real-time figures directly from the general ledger entries (`ac_ledgers`).

### 5.1. Trial Balance Report
Verifies that all debits and credits in the organization balance out to zero.

* **Method:** `GET`
* **URL:** `/api/owner/accounting/reports/trial-balance`
* **Query Parameters:**
  - `as_of` (optional): Cutoff date `YYYY-MM-DD` (defaults to today)
  - `owner_id` (optional): Filter by property owner ID

#### Response Example (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "as_of": "2026-10-19",
    "total_debit": 23850.00,
    "total_credit": 23850.00,
    "balanced": true,
    "accounts": [
      {
        "id": 6,
        "code": "1100",
        "name": "Cash",
        "type": "asset",
        "dr_cr": "DR",
        "total_debit": 850.00,
        "total_credit": 0.00,
        "net_debit": 850.00,
        "net_credit": 0.00
      },
      {
        "id": 7,
        "code": "1200",
        "name": "Bank",
        "type": "asset",
        "dr_cr": "DR",
        "total_debit": 6500.00,
        "total_credit": 16500.00,
        "net_debit": 0.00,
        "net_credit": 10000.00
      },
      {
        "id": 14,
        "code": "4100",
        "name": "Rental Income",
        "type": "revenue",
        "dr_cr": "CR",
        "total_debit": 16500.00,
        "total_credit": 7350.00,
        "net_debit": 9150.00,
        "net_credit": 0.00
      }
    ]
  }
}
```

---

### 5.2. Income Statement (Profit & Loss)
Computes Net Income = Total Revenue - Cost of Goods Sold - Operating Expenses.

* **Method:** `GET`
* **URL:** `/api/owner/accounting/reports/income-statement`
* **Query Parameters:**
  - `from` (optional): Start date (defaults to start of current year)
  - `to` (optional): End date (defaults to today)
  - `owner_id` (optional): Filter by property owner ID

#### Response Example (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "from": "2026-01-01",
    "to": "2026-10-19",
    "currency": "AED",
    "net_income": 45000.00,
    "sections": [
      {
        "id": -1,
        "name": "Revenue",
        "amount": 50000.00,
        "children": [
          {
            "id": 4,
            "code": "4000",
            "name": "Revenue",
            "type": "revenue",
            "amount": 50000.00,
            "children": [
              {
                "id": 14,
                "code": "4100",
                "name": "Rental Income",
                "type": "revenue",
                "amount": 50000.00
              }
            ]
          }
        ]
      },
      {
        "id": -3,
        "name": "Gross Profit",
        "amount": 50000.00
      },
      {
        "id": -4,
        "name": "Operating Expenses",
        "amount": 5000.00,
        "children": [
          {
            "id": 17,
            "code": "6100",
            "name": "Maintenance Expense",
            "type": "expense",
            "amount": 5000.00
          }
        ]
      },
      {
        "id": -5,
        "name": "Net Income",
        "amount": 45000.00
      }
    ]
  }
}
```

---

### 5.3. Balance Sheet Report
Displays financial position matching the fundamental equation:  
$$\text{Total Assets} = \text{Total Liabilities} + \text{Total Equity}$$

* **Method:** `GET`
* **URL:** `/api/owner/accounting/reports/balance-sheet`
* **Query Parameters:**
  - `as_of` (optional): Cutoff date `YYYY-MM-DD`
  - `owner_id` (optional): Filter by property owner ID

#### Response Example (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "as_of": "2026-10-19",
    "currency": "AED",
    "total_assets": 125000.00,
    "total_liabilities": 25000.00,
    "total_equity": 100000.00,
    "total_liabilities_and_equity": 125000.00,
    "net_income": 45000.00,
    "balanced": true,
    "sections": [
      {
        "id": -1,
        "name": "Assets",
        "amount": 125000.00,
        "children": []
      },
      {
        "id": -2,
        "name": "Liabilities",
        "amount": 25000.00,
        "children": []
      },
      {
        "id": -3,
        "name": "Equity",
        "amount": 100000.00,
        "children": [
          {
            "id": -99,
            "code": "NET-INC",
            "name": "Net Income (Current Period)",
            "type": "equity",
            "amount": 45000.00
          }
        ]
      },
      {
        "id": -4,
        "name": "Total Liabilities & Equity",
        "amount": 125000.00
      }
    ]
  }
}
```

---

### 5.4. Cash Flow Statement
Classifies cash movements into Operating, Investing, and Financing activities.

* **Method:** `GET`
* **URL:** `/api/owner/accounting/reports/cash-flow`
* **Query Parameters:**
  - `from` (optional): Start date `YYYY-MM-DD`
  - `to` (optional): End date `YYYY-MM-DD`
  - `owner_id` (optional): Filter by property owner ID

#### Response Example (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "from": "2026-10-01",
    "to": "2026-10-19",
    "opening_balance": 10000.00,
    "operating": 15000.00,
    "investing": 0.00,
    "financing": 0.00,
    "net_change": 15000.00,
    "closing_balance": 25000.00,
    "reconciled": true
  }
}
```

---

### 5.5. Running Cash Ledger
Detailed audit trail of all transactions affecting cash and bank accounts.

* **Method:** `GET`
* **URL:** `/api/owner/accounting/reports/cash-running`
* **Query Parameters:**
  - `from` (optional): Start date
  - `to` (optional): End date
  - `account_id` (optional): Filter to a specific Cash or Bank account

#### Response Example (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "opening_balance": 0.00,
    "closing_balance": 25000.00,
    "entries": [
      {
        "ledger_id": 1,
        "trans_id": 1,
        "date": "2026-10-18",
        "description": "Tenant Rent Payment Unit 308",
        "source_type": "PAYMENT",
        "source_id": 8,
        "account_name": "Bank",
        "account_code": "1200",
        "debit": 2500.00,
        "credit": 0.00,
        "running_balance": 2500.00
      }
    ]
  }
}
```

---

## 6. Automatic Background Journal Postings

The backend automatically creates double-entry journal transactions in real-time when operational events occur:

| Operational Event | Triggering Action | Automated Journal Entry |
| :--- | :--- | :--- |
| **Monthly Rent Due** | Contract creation or monthly cron (`PostMonthlyRentService`) | **DR** Rent Receivable (`1300`)<br>**CR** Rental Income (`4100`) |
| **Rent Payment Received** | Cashier / Owner records rent payment | **DR** Cash (`1100`) / Bank (`1200`)<br>**CR** Rent Receivable (`1300`) |
| **Security Deposit Received** | Payment of type `deposit` | **DR** Bank (`1200`)<br>**CR** Tenant Security Deposits (`2100`) |
| **PDC Cheque Cleared** | Cheque status marked `CLEARED` | **DR** Bank Account (`1200`)<br>**CR** Cheques Under Collection / PDC Receivable |
| **Move-Out Settlement** | Confirm Vacate & Settlement completed | Deducts damage fees from Security Deposit liability, clears outstanding dues, and books refund or receivable |

---

## 7. Error Handling & HTTP Status Codes

- `200 OK`: Request succeeded.
- `201 Created`: Resource (account, journal) created successfully.
- `400 Bad Request`: Malformed request syntax.
- `401 Unauthorized`: Missing or invalid Bearer token.
- `403 Forbidden`: Authenticated user role has insufficient permissions (e.g. Cashier attempting to post journals).
- `404 Not Found`: Requested account or journal ID does not exist in the user's organization.
- `422 Unprocessable Entity`: Validation failure (e.g. unbalanced debits/credits, attempt to post to `GROUP` account, duplicate account code).
