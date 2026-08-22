<div align="center">

<br/>

```
 ██████╗  ██████╗ ███████╗██████╗ ███████╗███████╗██╗  ██╗ ██████╗ ██╗     ██████╗
██╔════╝ ██╔═══██╗██╔════╝██╔══██╗██╔════╝██╔════╝██║  ██║██╔═══██╗██║     ██╔══██╗
██║  ███╗██║   ██║█████╗  ██████╔╝█████╗  █████╗  ███████║██║   ██║██║     ██║  ██║
██║   ██║██║   ██║██╔══╝  ██╔══██╗██╔══╝  ██╔══╝  ██╔══██║██║   ██║██║     ██║  ██║
╚██████╔╝╚██████╔╝██║     ██║  ██║███████╗███████╗██║  ██║╚██████╔╝███████╗██████╔╝
 ╚═════╝  ╚═════╝ ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═════╝
```

### **Enterprise Property Management Operating System**
*Built for the UAE Real Estate Ecosystem — Dubai Land Department Ready*

<br/>

[![Laravel](https://img.shields.io/badge/Laravel_11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

[![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)](https://mariadb.org)
[![DomPDF](https://img.shields.io/badge/DomPDF-UAE_EJARI_PDF-1E1B4B?style=for-the-badge)](https://github.com/dompdf/dompdf)
[![PHPUnit](https://img.shields.io/badge/PHPUnit-15_Tests_✓_Passing-059669?style=for-the-badge)](https://phpunit.de)
[![Sanctum](https://img.shields.io/badge/Laravel_Sanctum-RBAC_Auth-065F46?style=for-the-badge)](https://laravel.com/docs/sanctum)
[![reCAPTCHA](https://img.shields.io/badge/Google_reCAPTCHA_v2-Bot_Protection-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://www.google.com/recaptcha)

<br/>

> 🏛️ **Domain-Driven Architecture** &nbsp;|&nbsp; 📄 **Official Dubai EJARI 3-Page Bilingual PDF** &nbsp;|&nbsp; 👥 **4 Role-Based Portals** &nbsp;|&nbsp; 💰 **Double-Entry Rent Ledger**

<br/>

</div>

---

<br/>

## 🗺️ What Is GoFreeHold?

**GoFreeHold** is a production-grade, end-to-end **Property & Tenancy Management System** purpose-built for the **UAE / Dubai real estate market**.

It unifies every stakeholder — Property Managers, Landlords, Tenants, and Maintenance Technicians — into a single synchronized platform, from the very first property listing all the way through lease signing, rent collection, and final move-out settlement.

<br/>

```
OWNER                    ADMIN                    TENANT              MAINTENANCE
  │                        │                        │                      │
  ├── Portfolio View        ├── Properties & Units   ├── Rent & DEWA Dues   ├── Assigned Jobs
  ├── Rent Ledger           ├── Lease Contracts      ├── Payment History     ├── Status Updates
  ├── Receivables           ├── PDC Cheque Tracker   ├── Complaints          ├── Daily Report
  └── Payments History      ├── Legal Cases          └── Profile             └── Profile
                            ├── Settlement Wizard
                            ├── Maintenance Queue
                            ├── 5 Excel Reports
                            └── Cron Alert System
```

<br/>

---

## ✨ Feature Highlights

<br/>

<table>
<tr>
<td width="50%">

### 🏢 Property & Portfolio Management
- Multi-building, multi-unit property hierarchy
- Unit status engine: `AVAILABLE` → `BOOKED` → `OCCUPIED` → `SOLD`
- Advance booking receipts with auto-status
- Vacant unit filtering and reporting

</td>
<td width="50%">

### 📝 Tenancy Contracts & Leasing
- Full lease lifecycle: Create → Renew → Vacate
- Contract auto-marks unit as `OCCUPIED` on signing
- Move-out vacates unit back to `AVAILABLE`
- Call log history per contract

</td>
</tr>
<tr>
<td width="50%">

### 📄 UAE Official EJARI PDF Generation
- **3-Page** Dubai Land Department contract
- **Bilingual** English/Arabic with RTL Amiri font shaping
- Property Usage selector: Residential `[X]` / Commercial / Industrial
- PDC Cheques schedule table, tenant inventory addendum

</td>
<td width="50%">

### 💰 Double-Entry Rent Ledger Engine
- Auto-posts first-month rent `DEBIT` on contract creation
- Each payment records a balancing `CREDIT`
- Running balance tracking per tenant
- Service charges, DEWA dues, adjustments

</td>
</tr>
<tr>
<td width="50%">

### 🧾 PDC Cheque Tracker
- 4-cheque quarterly schedule per contract
- Status progression: `pending` → `cleared` / `bounced`
- Bounced cheque alerts and legal case linkage
- Comprehensive cheque management dashboard

</td>
<td width="50%">

### 🚪 Move-Out Settlement Wizard
- Step-by-step guided settlement wizard
- Deposit deductions & repair itemization
- Settlement completion auto-vacates linked unit
- Income/Expense tracking for financial reporting

</td>
</tr>
<tr>
<td width="50%">

### 🛠️ Maintenance & Asset Management
- Tenant complaint ticket submission & tracking
- Technician job assignment & dispatch
- Status flow: `open` → `in_progress` → `resolved`
- Unit appliance catalog with serial tracking
- Stock inventory & Purchase Order management

</td>
<td width="50%">

### 📊 Reports & Excel Export
- **5 Excel Reports:** Portfolio Revenue, Receivables, Expired Leases, Stock Inventory, PDC Status
- Vacant Property PDF/Excel export
- Artisan-scheduled email alerts for expiring contracts, overdue cheques, and monthly dues
- Daily maintenance completion analytics

</td>
</tr>
</table>

<br/>

---

## 🏛️ Architecture — Domain-Driven Design (DDD)

The backend is structured into **8 fully isolated business domains**, each containing its own Models, Controllers, Services, Form Requests, Route Provider, and API routes:

```
backend/
└── app/
    └── Domain/
        ├── 🔐 Auth/           → RBAC Middleware, Sanctum Tokens, Google reCAPTCHA v2, Password Reset
        ├── 🏘️  Property/      → Buildings, Units, Advance Booking, Vacant Unit Reports
        ├── 📝 Contract/       → Lease Contracts, Call Logs, PDC Cheques, EJARI DomPDF Engine
        ├── 📊 Dashboard/      → Owner & Tenant Dashboards, PostMonthlyRent, Ledger Rebuild
        ├── 💳 Payment/        → Payments, Rent Ledger, Service Charges, Receivables, Payables
        ├── 🏦 Settlement/     → Move-out Wizard, Deposit Deductions, Bank Accounts, Auto-Vacate
        ├── 🔧 Maintenance/    → Complaints, Job Dispatch, Teams, Appliance Catalog, Stock POs
        └── 📈 Report/         → 5 Excel Reports, Notification Settings, 4 Artisan Schedulers
```

```
frontend/
└── src/
    ├── api/              → Axios instance + Bearer token interceptors
    ├── components/
    │   ├── auth/         → Shared AuthShell (login/register/forgot/reset UI chrome)
    │   ├── gfh/          → Admin theme tokens, shared UI components
    │   └── layout/       → AdminLayout, OwnerLayout, TenantLayout, MaintenanceLayout
    ├── pages/
    │   ├── auth/         → Login, Register (+ reCAPTCHA), Forgot, Reset
    │   ├── admin/        → 33 comprehensive admin management screens
    │   ├── owner/        → 7 portfolio & finance screens
    │   ├── tenant/       → 6 dues, payments & complaint screens
    │   └── maintenance/  → 4 work queue & reporting screens
    ├── routes/           → AppRouter.tsx + Role-based route guards
    ├── store/            → Zustand authStore (Remember Me → localStorage / sessionStorage)
    └── types/            → Shared TypeScript types & interfaces
```

<br/>

---

## 👥 The 4 Role-Based Portals

| Portal | User Type | Screens | Access |
|--------|-----------|---------|--------|
| 🛡️ **Admin** | Property Managers | 33 screens | Full system management: properties, units, contracts, cheques, legal, maintenance, settlements, reports |
| 🏠 **Owner** | Landlords & Investors | 7 screens | Portfolio overview, property drill-down, rent ledger, receivables, payment history |
| 👤 **Tenant** | Lease Occupants | 6 screens | Rent & DEWA dues, payment history, maintenance complaint submission & timeline |
| 🔧 **Maintenance** | Technicians & Staff | 4 screens | Assigned complaint queue, job status updates, daily completion report |

<br/>

---

## 🔑 Demo Accounts

> 💡 All accounts are pre-seeded and ready to use. No configuration required.

| Role | Email | Password | Portal |
|------|-------|----------|--------|
| 🛡️ Administrator | `admin@gofreehold.com` | **`password`** | `/admin/dashboard` |
| 🏠 Property Owner | `owner1@gofreehold.com` | **`password`** | `/owner/dashboard` |
| 👤 Tenant | `tenant1@gofreehold.com` | **`password`** | `/tenant/dashboard` |
| 🔧 Maintenance | `maintenance@gofreehold.com` | **`password`** | `/maintenance/dashboard` |

<br/>

---

## 🚀 Installation — 0 to 100 Guide

### Prerequisites

| Requirement | Version |
|-------------|---------|
| PHP | 8.2+ (`pdo_mysql`, `mbstring`, `gd`, `fileinfo` extensions) |
| Composer | Latest |
| Node.js + npm | 20+ |
| MariaDB / MySQL | 8.0+ on `localhost:3306` |

<br/>

### ⚙️ Step 1 — Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install PHP dependencies
composer install

# 3. Copy environment config
cp .env.example .env          # Windows: copy .env.example .env

# 4. Generate application key
php artisan key:generate
```

> ⚠️ **Important — Create your database first:**  
> Open MySQL/MariaDB (phpMyAdmin, TablePlus, HeidiSQL, or terminal) and run:
> ```sql
> CREATE DATABASE gofreehold CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> ```
> Then open `backend/.env` and set your database credentials:
> ```env
> DB_DATABASE=gofreehold
> DB_USERNAME=root
> DB_PASSWORD=          ← your MySQL/MariaDB root password (leave blank if none)
> ```

```bash
# 5. Run all 37 migrations and seed demo accounts
php artisan migrate --seed

# 6. Start the API server
php artisan serve --host=127.0.0.1 --port=8000
```

✅ Backend API now running at **`http://127.0.0.1:8000`**

<br/>

### 🖥️ Step 2 — Frontend Setup

```bash
# In a NEW terminal window

# 1. Navigate to frontend
cd frontend

# 2. Install Node dependencies
npm install

# 3. Copy environment config (keys are pre-configured for localhost)
cp .env.example .env          # Windows: copy .env.example .env

# 4. Start Vite development server
npm run dev
```

✅ Frontend now running at **`http://localhost:5173`**

<br/>

### 🔐 Google reCAPTCHA — Works Out of the Box

The reCAPTCHA keys in `.env.example` are **pre-authorized for `localhost` and `127.0.0.1`**.  
Paul (or any reviewer) clones and runs the project — the **"I'm not a robot"** checkbox works immediately with zero configuration.

> For production deployment: Replace keys with domain-specific ones from [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin).

<br/>

---

## 🧪 Automated Test Suite — PHPUnit

```bash
cd backend
php artisan test
```

```
   PASS  Tests\Feature\AuthTest          ........ 5 assertions
   PASS  Tests\Feature\PropertyTest      ........ 4 assertions
   PASS  Tests\Feature\ContractTest      ........ 7 assertions
   PASS  Tests\Feature\PaymentTest       ........ 6 assertions
   PASS  Tests\Feature\SettlementTest    ........ 8 assertions
   PASS  Tests\Feature\MaintenanceTest   ........ 8 assertions

   Tests: 15 passed  |  Assertions: 38  |  Time: 2.45s
```

| Test | Coverage |
|------|----------|
| **AuthTest** | Role validation, Sanctum token issuance, RBAC middleware blocking |
| **PropertyTest** | Unit status transitions: `AVAILABLE` → `BOOKED` → `OCCUPIED` → `AVAILABLE` |
| **ContractTest** | Auto-occupy unit, auto first-month rent-due posting, renewal timestamps |
| **PaymentTest** | Double-entry ledger credit, soft-delete reversal, audit trail |
| **SettlementTest** | Settlement wizard, deposit deduction, auto-unit vacancy release |
| **MaintenanceTest** | Ticket lifecycle, status progression, daily report analytics |

<br/>

---

## ⏰ Scheduled Artisan Automations

```bash
# Run all scheduled commands via Laravel task scheduler
php artisan schedule:run
```

| Command | Schedule | Purpose |
|---------|----------|---------|
| `rent:post-monthly` | 1st of every month | Auto-posts monthly rent debit for all active contracts |
| `alert:contract-expiry` | Daily | Sends email for contracts expiring in 30, 60, or 90 days |
| `alert:pending-cheques` | Daily | Flags PDC cheques due within 7 days |
| `alert:monthly-dues` | Monthly | Sends overdue balance payment reminders |

<br/>

---

## 📐 Tech Stack

<div align="center">

| Layer | Technology |
|-------|-----------|
| **Backend Framework** | Laravel 11 — Domain-Driven Design (8 isolated domains) |
| **API Auth** | Laravel Sanctum — Bearer token per portal role |
| **Database** | MariaDB / MySQL 8.0+ — 37 production migrations |
| **PDF Generation** | DomPDF + Amiri Arabic Font — Official UAE EJARI 3-Page Contract |
| **Excel Export** | Maatwebsite Excel — 5 report types |
| **Frontend Framework** | React 19 + TypeScript 5 + Vite 8 |
| **Styling** | Tailwind CSS 4 — Semantic admin color system |
| **State Management** | Zustand — Persistent auth with Remember Me |
| **Data Fetching** | Axios — Auto Bearer token injection |
| **Charts** | Recharts — Owner & Admin financial dashboards |
| **Bot Protection** | Google reCAPTCHA v2 — Registration guard |
| **Testing** | PHPUnit — 15 feature tests, 38 assertions |

</div>

<br/>

---

<div align="center">

<br/>

**GoFreeHold** — *Engineered for high-performance UAE property management operations.*

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-Fiza--Nazz%2FGoFreeHold-181717?style=for-the-badge&logo=github)](https://github.com/Fiza-Nazz/GoFreeHold)

<br/>

</div>
