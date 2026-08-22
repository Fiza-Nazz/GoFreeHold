import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, GuestRoute } from './guards'

// ─── Auth Pages ───────────────────────────────────────────────────────────────
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'

// ─── Admin Pages ──────────────────────────────────────────────────────────────
import AdminLayout from '../components/layout/AdminLayout'
import AdminDashboard from '../pages/admin/Dashboard'
import BuildingManagement from '../pages/admin/BuildingManagement'
import UnitManagement from '../pages/admin/UnitManagement'
import ContractManagement from '../pages/admin/ContractManagement'
import ContractDetailPage from '../pages/admin/ContractDetailPage'
import PdcChequeTracker from '../pages/admin/PdcChequeTracker'
import ContractCallLogPage from '../pages/admin/ContractCallLog'
import LegalCases from '../pages/admin/LegalCases'
import PaymentForm from '../pages/admin/PaymentForm'
import RentLedger from '../pages/admin/RentLedger'
import ReceivablesSummary from '../pages/admin/ReceivablesSummary'
import ServiceCharges from '../pages/admin/ServiceCharges'
import SettlementWizard from '../pages/admin/SettlementWizard'
import OutstandingReceivables from '../pages/admin/OutstandingReceivables'
import FinancialTracking from '../pages/admin/FinancialTracking'
import ComplaintDashboard from '../pages/admin/ComplaintDashboard'
import DailyMaintenanceReport from '../pages/admin/DailyMaintenanceReport'
import ApplianceCatalog from '../pages/admin/ApplianceCatalog'
import InventoryManagement from '../pages/admin/InventoryManagement'
import PurchaseOrderTracker from '../pages/admin/PurchaseOrderTracker'
import ReportsDashboard from '../pages/admin/ReportsDashboard'
import VacantPropertyReport from '../pages/admin/VacantPropertyReport'
import AdminSettings from '../pages/admin/AdminSettings'
import TeamsPage from '../pages/admin/TeamsPage'
import JobsPage from '../pages/admin/JobsPage'
import MaintenancesPage from '../pages/admin/MaintenancesPage'
import ItemStorePage from '../pages/admin/ItemStorePage'
import ContractPayablesPage from '../pages/admin/ContractPayablesPage'
import BankAccountsPage from '../pages/admin/BankAccountsPage'
import SettlementPaymentsPage from '../pages/admin/SettlementPaymentsPage'
import TermsPage from '../pages/admin/TermsPage'
import TenancyResPage from '../pages/admin/TenancyResPage'

// ─── Owner Pages ──────────────────────────────────────────────────────────────
import OwnerLayout from '../components/layout/OwnerLayout'
import OwnerDashboard from '../pages/owner/Dashboard'
import PropertyDrillDown from '../pages/owner/PropertyDrillDown'
import VacantUnits from '../pages/owner/VacantUnits'
import UnitDetailPage from '../pages/owner/UnitDetail'
import OwnerUnits from '../pages/owner/OwnerUnits'
import OwnerProfile from '../pages/owner/OwnerProfile'
import OwnerFinancePage from '../pages/owner/OwnerFinancePage'

// ─── Maintenance Pages ────────────────────────────────────────────────────────
import MaintenanceLayout from '../components/layout/MaintenanceLayout'
import MaintenanceDashboard from '../pages/maintenance/Dashboard'
import MaintenanceComplaints from '../pages/maintenance/Complaints'
import MaintenanceDailyReport from '../pages/maintenance/DailyReport'
import MaintenanceProfile from '../pages/maintenance/Profile'

// ─── Tenant Pages ─────────────────────────────────────────────────────────────
import TenantLayout from '../components/layout/TenantLayout'
import TenantDashboard from '../pages/tenant/Dashboard'
import TenantDues from '../pages/tenant/Dues'
import TenantPayments from '../pages/tenant/Payments'
import TenantComplaints from '../pages/tenant/Complaints'
import TenantComplaintDetail from '../pages/tenant/ComplaintDetail'
import TenantProfile from '../pages/tenant/Profile'

// ─── Other ───────────────────────────────────────────────────────────────────
import NotFound from '../pages/NotFound'
import Unauthorized from '../pages/Unauthorized'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ── Guest Routes (auth pages) ─────────────────────────────────── */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* ── Admin Routes ──────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            {/* Stage 3: Property & Unit Management */}
            <Route path="properties" element={<BuildingManagement />} />
            <Route path="buildings" element={<Navigate to="/admin/properties" replace />} />
            <Route path="units" element={<UnitManagement />} />
            {/* Stage 4: Contracts, Leasing & Legal */}
            <Route path="contracts" element={<ContractManagement />} />
            <Route path="contracts/:id" element={<ContractDetailPage />} />
            <Route path="pdc" element={<PdcChequeTracker />} />
            <Route path="call-logs" element={<ContractCallLogPage />} />
            <Route path="legal" element={<LegalCases />} />
            {/* Stage 5: Payments, Receivables & Payables */}
            <Route path="payments" element={<PaymentForm />} />
            <Route path="ledger" element={<RentLedger />} />
            <Route path="receivables" element={<ReceivablesSummary />} />
            <Route path="service-charges" element={<ServiceCharges />} />
            {/* Stage 6: Move-out Settlements & Financial Tracking */}
            <Route path="settlements" element={<SettlementWizard />} />
            <Route path="receivables-categorized" element={<OutstandingReceivables />} />
            <Route path="financial-tracking" element={<FinancialTracking />} />
            {/* Stage 7: Maintenance & Inventory Management */}
            <Route path="complaints" element={<ComplaintDashboard />} />
            <Route path="daily-maintenance" element={<DailyMaintenanceReport />} />
            <Route path="appliances" element={<ApplianceCatalog />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="purchase-orders" element={<PurchaseOrderTracker />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="maintenances" element={<MaintenancesPage />} />
            <Route path="item-store" element={<ItemStorePage />} />
            <Route path="contract-payables" element={<ContractPayablesPage />} />
            <Route path="bank-accounts" element={<BankAccountsPage />} />
            <Route path="settlement-payments" element={<SettlementPaymentsPage />} />
            <Route path="tenancy-res" element={<TenancyResPage />} />
            <Route path="terms" element={<TermsPage />} />
            {/* Stage 8: System Reports & Automated Notifications */}
            <Route path="reports" element={<ReportsDashboard />} />
            <Route path="reports/vacant" element={<VacantPropertyReport />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* ── Owner Routes ──────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
          <Route path="/owner" element={<OwnerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="properties" element={<PropertyDrillDown />} />
            <Route path="vacant-units" element={<VacantUnits />} />
            <Route path="vacant" element={<Navigate to="/owner/vacant-units" replace />} />
            <Route path="units" element={<OwnerUnits />} />
            <Route path="units/:unitId" element={<UnitDetailPage />} />
            <Route path="ledger" element={<OwnerFinancePage kind="ledger" />} />
            <Route path="receivables" element={<OwnerFinancePage kind="receivables" />} />
            <Route path="payments" element={<OwnerFinancePage kind="payments" />} />
            <Route path="profile" element={<OwnerProfile />} />
          </Route>
        </Route>

        {/* ── Maintenance Routes ────────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['maintenance']} />}>
          <Route path="/maintenance" element={<MaintenanceLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<MaintenanceDashboard />} />
            <Route path="complaints" element={<MaintenanceComplaints />} />
            <Route path="daily-report" element={<MaintenanceDailyReport />} />
            <Route path="profile" element={<MaintenanceProfile />} />
          </Route>
        </Route>

        {/* ── Tenant Routes ─────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
          <Route path="/tenant" element={<TenantLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TenantDashboard />} />
            <Route path="dues" element={<TenantDues />} />
            <Route path="payments" element={<TenantPayments />} />
            <Route path="complaints" element={<TenantComplaints />} />
            <Route path="complaints/:id" element={<TenantComplaintDetail />} />
            <Route path="profile" element={<TenantProfile />} />
          </Route>
        </Route>

        {/* ── Misc ─────────────────────────────────────────────────────── */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
