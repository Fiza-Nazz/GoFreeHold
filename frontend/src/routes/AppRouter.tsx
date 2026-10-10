import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, GuestRoute } from './guards'

// ΓöÇΓöÇΓöÇ Auth Pages ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'

// ΓöÇΓöÇΓöÇ Shared portal shell ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
import PortalLayout from '../components/layout/PortalLayout'

// ΓöÇΓöÇΓöÇ Platform Admin Pages ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
import PlatformDashboard from '../pages/admin/PlatformDashboard'
import OrganizationsPage from '../pages/admin/OrganizationsPage'
import OrganizationDetailPage from '../pages/admin/OrganizationDetailPage'
import PlatformUsersPage from '../pages/admin/PlatformUsersPage'
import PlansPage from '../pages/admin/PlansPage'
import AuditLogsPage from '../pages/admin/AuditLogsPage'
import PlatformSettingsPage from '../pages/admin/PlatformSettingsPage'

// ΓöÇΓöÇΓöÇ Shared operational pages (owner/staff) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
import BuildingManagement from '../pages/admin/BuildingManagement'
import AddPropertyPage from '../pages/admin/AddPropertyPage'
import UnitManagement from '../pages/admin/UnitManagement'
import TenantManagement from '../pages/admin/TenantManagement'
import ContractManagement from '../pages/admin/ContractManagement'
import ContractToUnitRedirect from '../pages/shared/ContractToUnitRedirect'
import PdcChequeTracker from '../pages/admin/PdcChequeTracker'
import ContractCallLogPage from '../pages/admin/ContractCallLog'
import LegalCases from '../pages/admin/LegalCases'
import ServiceCharges from '../pages/admin/ServiceCharges'
import SettlementWizard from '../pages/admin/SettlementWizard'
import OutstandingReceivables from '../pages/admin/OutstandingReceivables'
import FinancialTracking from '../pages/admin/FinancialTracking'
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

// ΓöÇΓöÇΓöÇ Owner Pages ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
import OwnerDashboard from '../pages/owner/Dashboard'
import OwnerPropertyBoard from '../pages/owner/OwnerPropertyBoard'
import VacantUnits from '../pages/owner/VacantUnits'
import UnitDetailPage from '../pages/owner/UnitDetail'
import OwnerUnits from '../pages/owner/OwnerUnits'
import OwnerProfile from '../pages/owner/OwnerProfile'
import OwnerFinancePage from '../pages/owner/OwnerFinancePage'
import OwnerComplaints from '../pages/owner/OwnerComplaints'

// ΓöÇΓöÇΓöÇ Maintenance Pages ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
import MaintenanceComplaints from '../pages/maintenance/Complaints'
import MaintenanceDailyReport from '../pages/maintenance/DailyReport'
import MaintenanceProfile from '../pages/maintenance/Profile'

// ΓöÇΓöÇΓöÇ Tenant Pages ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
import TenantDashboard from '../pages/tenant/Dashboard'
import TenantDues from '../pages/tenant/Dues'
import TenantPayments from '../pages/tenant/Payments'
import TenantComplaints from '../pages/tenant/Complaints'
import TenantComplaintDetail from '../pages/tenant/ComplaintDetail'
import TenantProfile from '../pages/tenant/Profile'

// ΓöÇΓöÇΓöÇ Other ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
import NotFound from '../pages/NotFound'
import FinancePage from '../pages/staff/FinancePage'
import PropertyUnitsBoard from '../pages/shared/PropertyUnitsBoard'
import StaffManagement from '../pages/owner/StaffManagement'
import StaffActivation from '../pages/auth/StaffActivation'
import AssignedJobs from '../pages/maintenance/AssignedJobs'
import Unauthorized from '../pages/Unauthorized'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/staff/activate" element={<StaffActivation />} />
        {(['cashier', 'accountant'] as const).map((role) => (
          <Route key={role} element={<ProtectedRoute allowedRoles={[role]} />}>
            <Route path={'/' + role} element={<PortalLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="portfolio" element={<OwnerPropertyBoard />} />
              <Route path="units" element={<OwnerUnits />} />
              <Route path="units/:unitId" element={<UnitDetailPage />} />
              <Route path="properties/:propertyId" element={<PropertyUnitsBoard />} />
              <Route path="contracts" element={<ContractManagement basePath={'/' + role} />} />
              <Route path="prepared-contracts" element={<ContractManagement basePath={'/' + role} preparationOnly />} />
              <Route path="contracts/:id" element={<ContractToUnitRedirect basePath={'/' + role} />} />
              <Route path="pdc" element={<Navigate to="/pdc" replace />} />
              {['dashboard', 'payments', 'payments/new', 'receivables', 'profile', ...(role === 'accountant' ? ['ledger'] : [])].map((path) => (
                <Route key={path} path={path} element={<FinancePage key={role + '/' + path} />} />
              ))}
            </Route>
          </Route>
        ))}

        {/* Shared PDC tracker ΓÇö owner / cashier / accountant */}
        <Route element={<ProtectedRoute allowedRoles={['owner', 'cashier', 'accountant']} />}>
          <Route element={<PortalLayout />}>
            <Route path="/pdc" element={<PdcChequeTracker />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Platform Admin ΓÇö SaaS operator only (no property operations) */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} requiredPermissions={['platform.manage']} />}>
          <Route path="/admin" element={<PortalLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PlatformDashboard />} />
            <Route path="organizations" element={<OrganizationsPage />} />
            <Route path="organizations/:id" element={<OrganizationDetailPage />} />
            <Route path="users" element={<PlatformUsersPage />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="settings" element={<PlatformSettingsPage />} />
            {/* Legacy operational URLs redirect into owner portal guidance */}
            <Route path="properties/*" element={<Navigate to="/unauthorized" replace />} />
            <Route path="units/*" element={<Navigate to="/unauthorized" replace />} />
            <Route path="contracts/*" element={<Navigate to="/unauthorized" replace />} />
            <Route path="tenants/*" element={<Navigate to="/unauthorized" replace />} />
            <Route path="payments/*" element={<Navigate to="/unauthorized" replace />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        {/* Owner ΓÇö customer organization property operations */}
        <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
          <Route path="/owner" element={<PortalLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="properties" element={<BuildingManagement />} />
            <Route path="properties/add" element={<AddPropertyPage />} />
            <Route path="buildings" element={<Navigate to="/owner/properties" replace />} />
            <Route path="properties/:propertyId" element={<PropertyUnitsBoard />} />
            <Route path="portfolio" element={<OwnerPropertyBoard />} />
            <Route path="units" element={<OwnerUnits />} />
            <Route path="units/:unitId" element={<UnitDetailPage />} />
            <Route path="vacant-units" element={<VacantUnits />} />
            <Route path="vacant" element={<Navigate to="/owner/vacant-units" replace />} />
            <Route path="appliances" element={<ApplianceCatalog />} />
            <Route path="tenants" element={<TenantManagement />} />
            <Route path="tenants/add" element={<TenantManagement mode="add" />} />
            <Route path="tenants/previous" element={<TenantManagement mode="previous" />} />
            <Route path="contracts" element={<ContractManagement basePath="/owner" />} />
            <Route path="prepared-contracts" element={<ContractManagement basePath="/owner" preparationOnly />} />
            <Route path="contracts/:id" element={<ContractToUnitRedirect basePath="/owner" />} />
            <Route path="pdc" element={<Navigate to="/pdc" replace />} />
            <Route path="call-logs" element={<ContractCallLogPage />} />
            <Route path="legal" element={<LegalCases />} />
            <Route path="payments" element={<OwnerFinancePage kind="payments" />} />
            <Route path="ledger" element={<OwnerFinancePage kind="ledger" />} />
            <Route path="receivables" element={<OwnerFinancePage kind="receivables" />} />
            <Route path="service-charges" element={<ServiceCharges />} />
            <Route path="settlements" element={<SettlementWizard />} />
            <Route path="receivables-categorized" element={<OutstandingReceivables />} />
            <Route path="financial-tracking" element={<FinancialTracking />} />
            <Route path="contract-payables" element={<ContractPayablesPage />} />
            <Route path="bank-accounts" element={<BankAccountsPage />} />
            <Route path="settlement-payments" element={<SettlementPaymentsPage />} />
            <Route path="complaints" element={<OwnerComplaints />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="maintenances" element={<MaintenancesPage />} />
            <Route path="daily-maintenance" element={<DailyMaintenanceReport />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="item-store" element={<ItemStorePage />} />
            <Route path="purchase-orders" element={<PurchaseOrderTracker />} />
            <Route path="reports" element={<ReportsDashboard />} />
            <Route path="reports/vacant" element={<VacantPropertyReport />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="profile" element={<OwnerProfile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['maintenance']} />}>
          <Route path="/maintenance" element={<PortalLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AssignedJobs />} />
            <Route path="complaints" element={<MaintenanceComplaints />} />
            <Route path="daily-report" element={<MaintenanceDailyReport />} />
            <Route path="profile" element={<MaintenanceProfile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
          <Route path="/tenant" element={<PortalLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TenantDashboard />} />
            <Route path="dues" element={<TenantDues />} />
            <Route path="payments" element={<TenantPayments />} />
            <Route path="complaints" element={<TenantComplaints />} />
            <Route path="complaints/:id" element={<TenantComplaintDetail />} />
            <Route path="profile" element={<TenantProfile />} />
          </Route>
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
