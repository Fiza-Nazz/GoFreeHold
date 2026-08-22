# GoFreeHold — Backend API

Property management platform API for **GoFreeHold**.  
Laravel REST backend for admin, owner, tenant, and maintenance portals.

Stack: **PHP 8.3 · Laravel 13 · Sanctum · MariaDB/MySQL · DomPDF · Maatwebsite Excel**

---

## What this API does

GoFreeHold manages rental properties end-to-end:

| Area | Capabilities |
|------|----------------|
| Parties | Owners, tenants, admin users, maintenance staff |
| Portfolio | Properties, units, bookings, vacant units |
| Leasing | Contracts, renew / vacate / settle, cheques, docs, PDF |
| Money | Rent ledger, payments, service charges, payables, receivables |
| Settlements | Move-out settlements, income / expense tracking, bank accounts |
| Ops | Complaints, jobs, teams, appliances, inventory / purchases |
| Reports | Revenue, receivables, expired contracts, inventory, Excel export |
| Alerts | Notification settings + scheduled vacant / dues alerts |

Frontend talks to this API only (JSON). Auth is token-based via **Laravel Sanctum**.

---

## Roles

| Role | Access |
|------|--------|
| `admin` | Full `/api/admin/*` management |
| `owner` | `/api/owner/*` portfolio + finance views |
| `tenant` | Complaints, own finance / portal routes |
| `maintenance` | Complaints, jobs, daily reports |

Role checks use `auth:sanctum` + `role:{name}` middleware (`App\Domain\Auth\Http\Middleware\RoleMiddleware`).

---

## Architecture

Domain-modular Laravel app. Each business module owns its routes, controllers, models, and a service provider.

```
app/
├── Domain/
│   ├── Auth/          # Module 1 — register, login, logout, password reset, /user
│   ├── Dashboard/     # Module 2 — owner/tenant dashboards, ledger rebuild
│   ├── Property/      # Module 3 — properties, units, booking, vacant report
│   ├── Contract/      # Module 4 — contracts, cheques, docs, PDF, call logs
│   ├── Payment/       # Module 5 — payments, rent ledger, service charges, payables
│   ├── Settlement/    # Module 6 — settlements, income/expense, financial tracking
│   ├── Maintenance/   # Module 7 — complaints, jobs, teams, inventory, charges
│   └── Report/        # Module 8 — reports, Excel export, notification settings
├── Http/Controllers/  # Legacy / shared API controllers (still used where not moved)
├── Models/            # Shared Eloquent models
├── Exports/           # Excel export classes
├── Mail/              # Alert emails
└── Console/Commands/  # Scheduled alerts (vacant properties, monthly dues)
```

### How modules load

Providers are registered in `bootstrap/providers.php`.  
Each domain provider loads its own `routes/api.php` under the `/api` prefix.

Central glue (comments + remaining admin party/inventory routes): `routes/api.php`.

### Request flow

```
Client (React portal)
    → POST /api/auth/login  (Sanctum token)
    → Authorization: Bearer {token}
    → role middleware
    → Domain controller → Eloquent / services → JSON
```

### Auth endpoints

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public — returns token |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/auth/reset-password` | Public |
| GET | `/api/user` | Authenticated |
| POST | `/api/auth/logout` | Authenticated |

Admin APIs live under `/api/admin/...`.  
Owner APIs under `/api/owner/...`.  
Tenant / maintenance routes are role-scoped inside the Maintenance (and related) domains.

---

## Tech choices

- **Sanctum** — API token auth for SPA / portals  
- **Domain service providers** — keep modules isolated and loadable  
- **DomPDF** — tenancy contract PDFs  
- **Maatwebsite Excel** — report `.xlsx` exports  
- **DBAL** — schema changes in migrations  
- **Queues / mail** — alerts and notification delivery (config via `.env`)

---

## Setup

### Requirements

- PHP 8.3+
- Composer
- MariaDB or MySQL
- (Optional) Node only if you use Vite assets inside Laravel

### Install

```bash
cd backend
composer install
copy .env.example .env   # Windows
php artisan key:generate
```

Configure database in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gofreehold
DB_USERNAME=root
DB_PASSWORD=
```

Then:

```bash
php artisan migrate
php artisan db:seed          # if seeders are configured
php artisan serve            # http://127.0.0.1:8000
```

API base URL: `http://127.0.0.1:8000/api`

### Security note

- `.env` is **gitignored** — never commit real secrets  
- Commit / share `.env.example` only  
- Create a local `.env` from the example on every machine

---

## Useful paths

| Path | Purpose |
|------|---------|
| `routes/api.php` | Core protected route map + module pointers |
| `app/Domain/*/routes/api.php` | Per-module API routes |
| `app/Domain/*/Providers/*ServiceProvider.php` | Module registration |
| `database/migrations/` | Schema |
| `database/seeders/` | Demo / bootstrap data |
| `app/Exports/` | Excel report builders |
| `resources/views/pdf/` | Contract PDF Blade templates |
| `scripts/e2e_prompt_walkthrough.php` | Real API E2E walkthrough vs prompt.md |

---

## E2E testing (backend / API)

This section is for **this backend repo only**.

With API running on `http://127.0.0.1:8000`:

```bash
php scripts/e2e_prompt_walkthrough.php
```

Covers Modules 1–8 against real DB data:

- Auth for admin / owner / tenant / maintenance  
- Booking cash receipt persistence  
- Legal cases  
- Payments, settlements, complaints  
- Reports + Excel exports  
- Scheduled alerts  
- Cross-role `403` isolation  

Results: `scripts/e2e_prompt_results.json`  
Target: `fail=0`

Demo API users (local seed):  
`admin@gofreehold.com` · `owner@gofreehold.com` · `tenant@gofreehold.com` · `maintenance@gofreehold.com`  
Password: `password123`

---

## Related (separate repo)

Frontend is **not** in this repository.  
UI lives here: [Fiza-Nazz/GoFreeHold-Frontend](https://github.com/Fiza-Nazz/GoFreeHold-Frontend)

---

## License

Private project — GoFreeHold · **Backend API only**.
