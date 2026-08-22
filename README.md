<p align="center">
  <img src="https://img.shields.io/badge/GoFreeHold-Enterprise_Property_Management_OS-065F46?style=for-the-badge&logo=homeadvisor&logoColor=white" alt="GoFreeHold" />
</p>

<h1 align="center">GoFreeHold — Enterprise Property Management System</h1>

<p align="center">
  <strong>Production-Grade Domain-Driven Property Management Operating System</strong><br/>
  Built with <strong>Laravel 11 (Domain-Driven Design)</strong>, <strong>React 19 + TypeScript</strong>, and <strong>MariaDB / MySQL</strong>.<br/>
  Featuring Official <strong>Dubai Land Department (EJARI) 3-Page Bilingual PDF Generation</strong>, Double-Entry Rent Ledger, and 4 Role-Based Portals.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel&logoColor=white" alt="Laravel" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/DomPDF-UAE_Ejari-1E1B4B" alt="DomPDF" />
  <img src="https://img.shields.io/badge/Sanctum-RBAC_Auth-065F46" alt="Sanctum" />
  <img src="https://img.shields.io/badge/PHPUnit-15_Tests_Passed-059669" alt="PHPUnit" />
</p>

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [Domain-Driven Architecture (DDD)](#-domain-driven-architecture-ddd)
3. [The 4 Specialized Portals](#-the-4-specialized-portals)
4. [UAE Dubai Land Department (EJARI) PDF Engine](#-uae-dubai-land-department-ejari-pdf-engine)
5. [Core Business Logic & Double-Entry Ledger](#-core-business-logic--double-entry-ledger)
6. [Demo Accounts & Credentials](#-demo-accounts--credentials)
7. [Installation & Setup (0 to 100 Guide)](#-installation--setup-0-to-100-guide)
8. [Automated Testing & PHPUnit Suite](#-automated-testing--phpunit-suite)
9. [Scheduled Artisan Automation (Cron Jobs)](#-scheduled-artisan-automation-cron-jobs)

---

## 🏛️ Project Overview

**GoFreeHold** is a full-lifecycle property management platform tailored for the UAE / Dubai real estate ecosystem. It unifies Landlords/Owners, Tenants, Maintenance Technicians, and Property Managers into a single synchronized system.

### Key Capabilities:
- **🏢 Multi-Property & Unit Management:** Residential, Commercial, and Industrial units with status tracking (`AVAILABLE`, `BOOKED`, `OCCUPIED`, `SOLD`).
- **📝 Lease & Tenancy Contracts:** Full lifecycle management (Creation with 12+ dynamic fields, Renewal with timestamp tracking, Move-out Vacate with auto-occupancy release).
- **📄 Pixel-Perfect UAE Ejari PDF:** 3-Page official Dubai Land Department bilingual contract & addendum generator with RTL Arabic glyph shaping.
- **💰 Financial Engine & PDC Cheques:** Automated rent-due ledger posting, payment recording with corresponding ledger credits, 4-quarterly cheque tracking (`pending` $\rightarrow$ `cleared` $\rightarrow$ `bounced`), and service charges.
- **🚪 Move-Out Settlements:** Deposit deductions, refunds, and automatic unit vacancy transition upon completion.
- **🛠️ Maintenance Ticket System:** Tenant ticket logging, staff assignment, work status progression (`open` $\rightarrow$ `in_progress` $\rightarrow$ `resolved`), and daily completion analytics.
- **📊 Real-time Reports & Exports:** Excel (.xlsx) exports for portfolio revenue, receivables, expiring leases, and stock inventory.

---

## 🧩 Domain-Driven Architecture (DDD)

The backend is organized into **8 isolated business domains** under `backend/app/Domain/`, each containing its own Models, Controllers, Requests, Services, Providers, and Routes:

```
backend/app/Domain/
├── 📁 Auth/           → RBAC Middleware, Sanctum Tokens, Google reCAPTCHA v2, Profile
├── 📁 Property/       → Buildings, Units, Advance Booking Receipts, Vacant Filters
├── 📁 Contract/       → Lease Contracts, Call Logs, PDC Cheques, EJARI DomPDF Engine
├── 📁 Dashboard/      → Portfolio Metrics, PostMonthlyRentService, LedgerRebuildService
├── 📁 Payment/        → Payments, Rent Ledger Transactions, Service Charges
├── 📁 Settlement/     → Move-out Settlement Wizard, Deposit Deductions, Auto-Vacate
├── 📁 Maintenance/    → Complaint Tickets, Job Assignments, Appliance Catalog, Stock POs
└── 📁 Report/         → 5 Excel Reports, Notification Settings, 4 Artisan Alert Schedulers
```

---

## 👥 The 4 Specialized Portals

| Portal | User Type | Key Features |
| :--- | :--- | :--- |
| **Admin Portal** | Property Managers & Admins | 33 comprehensive management screens (Properties, Units, Contracts, Cheques, Ledger, Settlements, Complaints, Reports, Settings). |
| **Owner Portal** | Landlords & Investors | 7 dedicated views: Portfolio overview, Building drill-down, Unit occupancy rates, Vacant units, Rent ledger, and received payments. |
| **Tenant Portal** | Leased Occupants | 6 views: Leased contract summary, Rent & DEWA dues statement, Payment history receipts, Maintenance ticket submission & timeline. |
| **Maintenance Portal** | Technicians & Field Staff | 4 views: Assigned jobs queue, work status updater (`in_progress` $\rightarrow$ `resolved`), and Daily completion reporting. |

---

## 📄 UAE Dubai Land Department (EJARI) PDF Engine

The system generates official 3-Page Tenancy Contracts matching Dubai Land Department (DLD) specifications:
1. **Page 1 (Front Tenancy Sheet):** High-res Government of Dubai & Land Department logos, Title Box with Date/No, Property Usage selection, Bilingual field grid with dotted line underlines, circled clause numbers `(1)` to `(9)`.
2. **Page 2 (Terms & Addendum):** Standard DLD Clauses `(10)` to `(14)`, "Know Your Rights" bilingual checklist, and Additional Terms dynamic overlay.
3. **Page 3 (Addendum & Inventory):** `ADDENDUM NO.3 TO Tenancy Contract` with tenant metadata, appliance handover checklist, and Payment Cheques Schedule table.

---

## 🔑 Demo Accounts & Credentials

For evaluation and testing, all accounts are pre-seeded with password **`password`**:

| Role | Email | Password | Portal URL |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@gofreehold.com` | `password` | `http://localhost:5173/admin/dashboard` |
| **Property Owner** | `owner1@gofreehold.com` | `password` | `http://localhost:5173/owner/dashboard` |
| **Tenant** | `tenant1@gofreehold.com` | `password` | `http://localhost:5173/tenant/dashboard` |
| **Maintenance Staff** | `maintenance@gofreehold.com` | `password` | `http://localhost:5173/maintenance/dashboard` |

---

## 🚀 Installation & Setup (0 to 100 Guide)

### 1. Prerequisites
- **PHP 8.2+** with `pdo_mysql`, `mbstring`, `gd`, `fileinfo` extensions enabled
- **Composer** (PHP Package Manager)
- **Node.js 20+** & **npm**
- **MariaDB** or **MySQL 8.0+** running on `localhost:3306`

---

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install PHP dependencies
composer install

# Configure environment
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations and seed demo data
php artisan migrate --seed

# Start Laravel backend server (Port 8000)
php artisan serve --host=127.0.0.1 --port=8000
```

---

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Configure environment
cp .env.example .env

# Start Vite development server (Port 5173)
npm run dev
```

Open your browser at **`http://localhost:5173`** to access GoFreeHold.

---

## 🧪 Automated Testing & PHPUnit Suite

The project includes real automated PHPUnit feature tests covering core domain business logic:

```bash
cd backend
php artisan test
```

### Verified Test Cases:
- ✅ **AuthTest:** Registration role validation, Sanctum token generation, RBAC route protection.
- ✅ **PropertyTest:** Unit status transitions (`AVAILABLE` $\rightarrow$ `BOOKED` $\rightarrow$ `OCCUPIED` $\rightarrow$ `AVAILABLE`).
- ✅ **ContractTest:** Auto-occupy unit on contract creation, automatic first-month rent-due posting, contract renewal timestamps.
- ✅ **PaymentTest:** Double-entry ledger credit recording, soft-delete ledger reversal, and audit logging.
- ✅ **SettlementTest:** Settlement completion, deposit deductions, and automatic linked unit vacancy release.
- ✅ **MaintenanceTest:** Ticket submission, status progression (`open` $\rightarrow$ `in_progress` $\rightarrow$ `resolved`), daily reporting metrics.

---

## ⏰ Scheduled Artisan Automation (Cron Jobs)

The backend provides 4 scheduled console commands for automated real estate operations:

| Command | Schedule | Purpose |
| :--- | :--- | :--- |
| `php artisan rent:post-monthly` | Monthly (1st) | Automatically posts monthly rent due debit transactions for active contracts. |
| `php artisan alert:contract-expiry` | Daily | Dispatches email alerts for contracts expiring within 30, 60, or 90 days. |
| `php artisan alert:pending-cheques` | Daily | Flags PDC cheques due within 7 days. |
| `php artisan alert:monthly-dues` | Monthly | Sends payment reminder notifications for overdue rent balances. |

---

<p align="center">
  <sub>GoFreeHold — Designed and engineered for high-performance property management operations.</sub>
</p>
