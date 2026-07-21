import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider }     from './context/AuthContext';
import { ProtectedRoute }   from './components/auth/ProtectedRoute';
import { RoleHome }         from './components/auth/RoleGate';
import { AppLayout }        from './components/layout/AppLayout';
import { AdminLayout }      from './components/layout/AdminLayout';
import { ErrorBoundary }    from './components/ui/ErrorBoundary';

// ── Public ────────────────────────────────────────────────────────────────────
import { LoginPage }        from './pages/LoginPage';

// ── SuperAdmin pages ──────────────────────────────────────────────────────────
import { SuperAdminPage }           from './pages/SuperAdminPage';
import { PlatformAnalyticsPage }    from './pages/admin/PlatformAnalyticsPage';
import { AdminTenantsPage }         from './pages/admin/AdminTenantsPage';
import { AdminSubscriptionsPage }   from './pages/admin/AdminSubscriptionsPage';
import { AdminAuditLogsPage }       from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage }        from './pages/admin/AdminSettingsPage';

// ── Shared CRM pages (TenantAdmin + User) ─────────────────────────────────────
import { DashboardPage }    from './pages/DashboardPage';
import { LeadsPage }        from './pages/LeadsPage';
import { LeadDetailPage }   from './pages/LeadDetailPage';
import { OverduePage }      from './pages/OverduePage';
import { StatsPage }        from './pages/StatsPage';

// ── TenantAdmin-only pages ────────────────────────────────────────────────────
import { UsersPage }        from './pages/UsersPage';
import { InvitationsPage }  from './pages/InvitationsPage';
import { ReportsPage }      from './pages/ReportsPage';
import { AuditLogsPage }    from './pages/AuditLogsPage';
import { SettingsPage }     from './pages/SettingsPage';

// ── User-only pages ───────────────────────────────────────────────────────────
import { MyLeadsPage }      from './pages/MyLeadsPage';
import { CalendarPage }     from './pages/CalendarPage';
import { ProfilePage }      from './pages/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
          <Routes>

            {/* ── Public ─────────────────────────────────────────────────── */}
            <Route path="/login" element={<LoginPage />} />

            {/* ── Root redirect: role-based home ─────────────────────────── */}
            <Route
              index
              element={
                <ProtectedRoute>
                  <RoleHome />
                </ProtectedRoute>
              }
            />

            {/* ── SuperAdmin shell ───────────────────────────────────────── */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['SuperAdmin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index                  element={<SuperAdminPage />} />
              <Route path="tenants"         element={<AdminTenantsPage />} />
              <Route path="subscriptions"   element={<AdminSubscriptionsPage />} />
              <Route path="analytics"       element={<PlatformAnalyticsPage />} />
              <Route path="audit-logs"      element={<AdminAuditLogsPage />} />
              <Route path="settings"        element={<AdminSettingsPage />} />
            </Route>

            {/* ── CRM shell — TenantAdmin routes ─────────────────────────── */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={['TenantAdmin', 'User']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
            </Route>

            <Route
              path="/leads"
              element={
                <ProtectedRoute roles={['TenantAdmin', 'User']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index    element={<LeadsPage />} />
              <Route path=":id" element={<LeadDetailPage />} />
            </Route>

            <Route
              path="/overdue"
              element={
                <ProtectedRoute roles={['TenantAdmin', 'User']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<OverduePage />} />
            </Route>

            <Route
              path="/stats"
              element={
                <ProtectedRoute roles={['TenantAdmin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StatsPage />} />
            </Route>

            {/* TenantAdmin-only */}
            <Route
              path="/users"
              element={
                <ProtectedRoute roles={['TenantAdmin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<UsersPage />} />
            </Route>

            <Route
              path="/invitations"
              element={
                <ProtectedRoute roles={['TenantAdmin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<InvitationsPage />} />
            </Route>

            <Route
              path="/reports"
              element={
                <ProtectedRoute roles={['TenantAdmin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ReportsPage />} />
            </Route>

            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute roles={['TenantAdmin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AuditLogsPage />} />
            </Route>

            <Route
              path="/settings"
              element={
                <ProtectedRoute roles={['TenantAdmin', 'User']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SettingsPage />} />
            </Route>

            {/* User-only */}
            <Route
              path="/my-leads"
              element={
                <ProtectedRoute roles={['User']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<MyLeadsPage />} />
            </Route>

            <Route
              path="/activities"
              element={
                <ProtectedRoute roles={['TenantAdmin', 'User']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Reuse StatsPage as a full activity overview */}
              <Route index element={<StatsPage />} />
            </Route>

            <Route
              path="/calendar"
              element={
                <ProtectedRoute roles={['User']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<CalendarPage />} />
            </Route>

            <Route
              path="/profile"
              element={
                <ProtectedRoute roles={['TenantAdmin', 'User']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ProfilePage />} />
            </Route>

            {/* ── Fallback ─────────────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </AuthProvider>
        </BrowserRouter>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              fontSize: '14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
