import { Outlet } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import {
  Shield, Zap, LogOut, LayoutDashboard,
  Building2, CreditCard, BarChart3, ScrollText, Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLogout } from '../../hooks/useAuth';

const adminNavItems = [
  { to: '/admin',                label: 'Overview',            icon: LayoutDashboard, exact: true },
  { to: '/admin/tenants',        label: 'Tenants',             icon: Building2 },
  { to: '/admin/subscriptions',  label: 'Subscriptions',       icon: CreditCard },
  { to: '/admin/analytics',      label: 'Platform Analytics',  icon: BarChart3 },
  { to: '/admin/audit-logs',     label: 'Audit Logs',          icon: ScrollText },
  { to: '/admin/settings',       label: 'Settings',            icon: Settings },
];

export function AdminLayout() {
  const { user } = useAuth();
  const logout = useLogout();

  const displayName =
    [user?.firstName as string, user?.lastName as string].filter(Boolean).join(' ') ||
    user?.email || 'SuperAdmin';

  return (
    <div className="flex min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Admin Sidebar */}
      <aside
        className="sidebar-glow w-64 min-h-screen flex flex-col"
        style={{ background: '#0a0a0f', borderRight: '1px solid #1a1a2e' }}
      >
        {/* Brand */}
        <div className="px-5 py-6" style={{ borderBottom: '1px solid #1a1a2e' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg,#78350f,#d97706)',
                boxShadow: '0 3px 0 #92400e, 0 6px 16px rgba(217,119,6,.4)',
              }}
            >
              <Zap size={18} color="#fff" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-widest uppercase">
                LeadSense
              </h1>
              <p className="text-xs font-bold" style={{ color: '#d97706' }}>
                Super Admin
              </p>
            </div>
          </div>
        </div>

        {/* Warning badge */}
        <div className="mx-3 mt-4 mb-2 rounded-xl px-3 py-2"
          style={{ background: 'rgba(217,119,6,.12)', border: '1px solid rgba(217,119,6,.3)' }}>
          <div className="flex items-center gap-2">
            <Shield size={12} color="#d97706" />
            <span className="text-xs font-bold" style={{ color: '#d97706' }}>
              Platform Control
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#92400e' }}>
            Full system access
          </p>
        </div>

        {/* Nav label */}
        <div className="px-5 pt-4 pb-2">
          <span className="text-xs font-bold tracking-widest uppercase"
            style={{ color: '#334155' }}>Navigation</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 pb-4" aria-label="Admin navigation">
          {adminNavItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? '' : ''
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: 'linear-gradient(90deg,#78350f,#d97706)',
                      color: '#fff',
                      boxShadow: '0 2px 0 #92400e, 0 6px 20px rgba(217,119,6,.3)',
                    }
                  : { color: '#d97706' }
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: isActive ? 'rgba(255,255,255,.15)' : 'rgba(217,119,6,.15)',
                    }}
                  >
                    <Icon size={16} />
                  </span>
                  <span className="flex-1">{label}</span>
                  {isActive && <span style={{ opacity: 0.5, fontSize: 12 }}>›</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card + logout */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid #1a1a2e' }}>
          <div className="rounded-xl p-3 flex items-center gap-3"
            style={{ background: '#111827' }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0"
              style={{ background: 'linear-gradient(135deg,#78350f,#d97706)' }}
            >
              {(user?.email?.[0] ?? 'S').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{displayName}</p>
              <p className="text-xs" style={{ color: '#d97706' }}>SuperAdmin</p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#334155', padding: 4, borderRadius: 6,
                transition: 'color .12s', flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={e => (e.currentTarget.style.color = '#334155')}
            >
              <LogOut size={15} />
            </button>
          </div>
          <p className="text-center mt-2 text-xs" style={{ color: '#1e3a5f' }}>
            © 2026 Amantya Technologies
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
