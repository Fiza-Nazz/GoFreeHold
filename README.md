<p align="center">
  <img src="https://img.shields.io/badge/GoFreeHold-Frontend-0F3D3A?style=for-the-badge" alt="GoFreeHold Frontend" />
</p>

<h1 align="center">GoFreeHold — Frontend</h1>

<p align="center">
  React property-management UI for <strong>Admin</strong>, <strong>Owner</strong>, <strong>Tenant</strong>, and <strong>Maintenance</strong> portals.<br/>
  Talks only to the Laravel Sanctum API.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Zustand-5-764ABC?logo=redux&logoColor=white" alt="Zustand" />
</p>

---

## What this app is

GoFreeHold frontend is the browser shell for the full property OS:

| Portal | Who | What they do |
|--------|-----|----------------|
| **Admin** | Property managers | Properties, units, contracts, payments, settlements, legal, maintenance, reports |
| **Owner** | Property owners | Portfolio, units, vacant filter, ledger / receivables / payments |
| **Tenant** | Occupants | Rent & DEWA dues, payment history, complaints, profile |
| **Maintenance** | Technicians | Assigned complaints, daily report, profile |

Auth screens (login / register / forgot / reset) are shared. After login, role-based redirects send each user to their portal.

> This repository is **frontend only**.  
> Backend API (separate): [Fiza-Nazz/GoFreeHold](https://github.com/Fiza-Nazz/GoFreeHold)

---

## Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 + TypeScript + Vite 8 |
| Styling | Tailwind CSS 4 (mobile-first + desktop admin tables) |
| Routing | React Router 7 + role route guards |
| State | Zustand (`authStore` — Remember Me → localStorage / sessionStorage) |
| API | Axios wrapper — `VITE_API_BASE_URL` |
| Charts | Recharts (owner / admin dashboards) |
| Captcha | `react-google-recaptcha` on **registration** (per product spec) |

---

## Architecture

```
src/
├── api/                 # Axios instance + interceptors
├── components/
│   ├── gfh/             # Shared admin theme tokens / UI chrome
│   └── layout/          # AdminLayout, OwnerLayout, TenantLayout, MaintenanceLayout
├── pages/
│   ├── auth/            # Login, Register, Forgot, Reset
│   ├── admin/           # Full admin module screens
│   ├── owner/           # Owner portfolio + finance
│   ├── tenant/          # Tenant dues + complaints
│   └── maintenance/     # Maintenance queue + daily report
├── routes/
│   ├── AppRouter.tsx    # Route map
│   └── guards.tsx       # Role guards
├── store/
│   └── authStore.ts     # Token + user session
└── types/               # Shared TS types
```

### Request flow

```
Browser portal
  → Axios (Bearer Sanctum token)
  → Laravel /api/*
  → JSON → React pages
```

---

## Portal routes (where to click)

Base URL (dev): `http://localhost:5173`

### Auth
| Route | Page |
|-------|------|
| `/login` | Login + Remember Me |
| `/register` | Register + role + reCAPTCHA |
| `/forgot-password` | Forgot password |
| `/reset-password` | Reset password |

### Admin (`admin@gofreehold.com`)
| Route | Screen |
|-------|--------|
| `/admin/dashboard` | Dashboard |
| `/admin/properties` | Properties |
| `/admin/units` | Units + advance booking |
| `/admin/contracts` | Contracts |
| `/admin/pdc` | PDC cheques |
| `/admin/call-logs` | Call logs |
| `/admin/legal` | Legal cases |
| `/admin/payments` | Payments |
| `/admin/ledger` | Rent ledger |
| `/admin/receivables` | Receivables |
| `/admin/settlements` | Settlements |
| `/admin/complaints` | Complaints |
| `/admin/reports` | Reports + Excel export |
| `/admin/reports/vacant` | Vacant properties |
| `/admin/settings` | Notification settings |

### Owner (`owner@gofreehold.com`)
| Route | Screen |
|-------|--------|
| `/owner/dashboard` | Portfolio overview |
| `/owner/properties` | Property drill-down |
| `/owner/units` | Units |
| `/owner/vacant-units` | Vacant units |
| `/owner/ledger` | Rent ledger |
| `/owner/receivables` | Receivables |
| `/owner/payments` | Payments |
| `/owner/profile` | Profile |

### Tenant (`tenant@gofreehold.com`)
| Route | Screen |
|-------|--------|
| `/tenant/dashboard` | Dashboard |
| `/tenant/dues` | Rent & DEWA dues |
| `/tenant/payments` | Payment history |
| `/tenant/complaints` | My complaints |
| `/tenant/profile` | Profile |

### Maintenance (`maintenance@gofreehold.com`)
| Route | Screen |
|-------|--------|
| `/maintenance/dashboard` | Dashboard |
| `/maintenance/complaints` | Complaints |
| `/maintenance/daily-report` | Daily report |
| `/maintenance/profile` | Profile |

Demo password (local seed): `password123`

---

## Setup

### Requirements
- Node.js 20+
- Running GoFreeHold backend API (`http://127.0.0.1:8000`)

### Install

```bash
cd frontend
npm install
copy .env.example .env
```

`.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_RECAPTCHA_SITE_KEY=your_google_recaptcha_site_key
```

### Run

```bash
npm run dev
```

Open `http://localhost:5173`

### Production build

```bash
npm run build
npm run preview
```

> `.env` is gitignored. Never commit secrets. Only `.env.example` is shared.

---

## E2E testing (frontend / UI)

This section is for **this frontend repo only**.

### Manual UI walkthrough

1. Start backend API separately (`GoFreeHold` backend repo → `php artisan serve`)  
2. Start this app: `npm run dev` → `http://localhost:5173`  
3. Login each role and open the portal routes above  
4. Critical UI path:
   - Admin → `/admin/units` → book unit (receipt appears)
   - Admin → `/admin/legal` → create legal case
   - Tenant → `/tenant/complaints` → submit complaint
   - Admin → `/admin/complaints` → assign / resolve
   - Maintenance → `/maintenance/complaints` → see ticket
   - Admin → `/admin/reports` → Export Excel

### API automated E2E

API script lives in the **backend** repo (not here):  
`php scripts/e2e_prompt_walkthrough.php` inside [GoFreeHold](https://github.com/Fiza-Nazz/GoFreeHold)

---

## Environment & security notes

- API base URL via `VITE_API_BASE_URL` only  
- Sanctum token: `localStorage` (Remember Me) or `sessionStorage`  
- Route guards block cross-portal access  
- reCAPTCHA on register  
- `node_modules/` and `.env` are never committed  

---

## Related (separate repo)

| Piece | Repo |
|-------|------|
| Backend API only | [Fiza-Nazz/GoFreeHold](https://github.com/Fiza-Nazz/GoFreeHold) |
| Frontend UI only | **this repo** |

---

<p align="center">
  <sub>GoFreeHold · Frontend only · separate from backend</sub>
</p>
