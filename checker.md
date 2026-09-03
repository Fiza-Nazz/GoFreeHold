Below is the requirements breakdown for GoFreeHold, a property management platform modeled after the core features of CribApp. Please review the functional scope below for estimation and architectural planning.

Scope & Core Modules
1. Authentication, Access & Roles
Auth: Registration (with role selection & reCAPTCHA), login/logout, password reset.

RBAC: Role-based access control and customized dashboards for Admin, Maintenance, Property Owner, and Common/Tenant users.

2. Dashboard & Financial Tools
Owner portfolio views, property/unit drill-downs, and vacant unit filters.

Automated monthly rent due posting and ledger rebuild tools.

3. Property & Unit Management
CRUD operations for Buildings/Properties and Units (linked to owners and appliances).

Unit statuses: AVAILABLE, BOOKED, OCCUPIED.

Advance booking with daily cash receipts and vacant property reporting.

4. Contracts, Leasing & Legal (UAE Compliance)
Contract lifecycle: Create, edit, renew, vacate, and settlement workflows.

UAE residential and commercial tenancy forms (print contracts, renewals, terms, addendums).

PDC cheque management (tracking, receipts, status updates) and contract call logs.

Legal case management linked to contracts/settlements.

5. Payments, Receivables & Payables
Multi-mode payment recording (Rent, DEWA, Deposits, Settlements via Cash/Card/etc.).

Rent ledger (monthly due postings, payment logs, transaction deletion).

Service charge management, contract payables, and external accounting portal integration (accounts.rmsez.com).

6. Move-out Settlements & Financial Tracking
Comprehensive move-out settlement creation, document handling, and unit status updating.

Outstanding receivables tracking (current vs. previous tenants, categorized by owner).

Income, loan, and expense tracking tied to accounting ledgers.

7. Maintenance & Inventory Management
Complaint log, job assignment to maintenance teams, completion tracking, and daily maintenance reporting.

Appliance catalog, store room/warehouse tracking, unit inventory, and purchase orders.

8. System Reports & Automated Notifications
Reports: Revenue analysis (with Excel export/print), receivables, expired contracts, inventory summaries, and historical ledgers.

Alerts: Automated emails for contract expiries (~100 days), pending cheques, vacant properties, and monthly due postings.