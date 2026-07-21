import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Clock, BarChart3,
  Zap, LogOut, ChevronRight, UserCheck, Mail,
  CalendarDays, User2, ScrollText,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLogout } from '../../hooks/useAuth';

const tenantAdminNavItems = [
  { to: '/dashboard',    label: 'Dashboard',     icon: LayoutDashboard, exact: true },
  { to: '/leads',        label: 'Leads',         icon: Users },
  { to: '/users',        label: 'Users',         icon: UserCheck },
  { to: '/invitations',  label: 'Invitations',   icon: Mail },
  { to: '/activities',   label: 'Activities',    icon: Clock },
  { to: '/reports',      label: 'Reports',       icon: BarChart3 },
  { to: '/audit-logs',   label: 'Audit Logs',    icon: ScrollText },
  { to: '/settings',     label: 'Settings',      icon: Settings },
];

const userNavItems = [
  { to: '/dashboard',    label: 'Dashboard',     icon: LayoutDashboard, exact: true },
  { to: '/my-leads',     label: 'My Leads',      icon: Users },
  { to: '/activities',   label: 'Activities',    icon: Clock },
  { to: '/calendar',     label: 'Calendar',      icon: CalendarDays },
  { to: '/profile',      label: 'Profile',       icon: User2 },
];

// Fallback for any other role
const defaultNavItems = [
  { to: '/dashboard', label: 'Dashboard',     icon: LayoutDashboard, exact: true },
  { to: '/leads',     label: 'Leads',         icon: Users },
  { to: '/overdue',   label: 'Overdue',       icon: Clock },
  { to: '/stats',     label: 'Activity Stats', icon: BarChart3 },
];

export function Sidebar() {
  const { user, roles } = useAuth();
  const logout = useLogout();

  const isTenantAdmin = roles.includes('TenantAdmin');
  const isUser = roles.includes('User') && !isTenantAdmin;
  const navItems = isTenantAdmin
    ? tenantAdminNavItems
    : isUser
      ? userNavItems
      : defaultNavItems;

  const displayName = user
    ? [user.firstName as string, user.lastName as string].filter(Boolean).join(' ') || user.email
    : 'User';

  const primaryRole = roles[0] ?? 'User';

  return (
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
              background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
              boxShadow: '0 3px 0 #1d4ed8, 0 6px 16px rgba(37,99,235,.4)',
            }}
          >
            <Zap size={18} color="#fff" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">
              LeadSense
            </h1>
            <p className="text-xs font-medium" style={{ color: '#4b6ca8' }}>
              CRM Platform
            </p>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-5 pt-6 pb-2">
        <span className="text-xs font-bold tracking-widest uppercase"
          style={{ color: '#334155' }}>
          Menu
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 pb-4" aria-label="Main navigation">
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive ? 'active-nav' : 'inactive-nav'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? {
                    background: to === '/admin'
                      ? 'linear-gradient(90deg,#78350f,#d97706)'
                      : 'linear-gradient(90deg,#1e3a8a,#2563eb)',
                    color: '#fff',
                    boxShadow: to === '/admin'
                      ? '0 2px 0 #92400e, 0 6px 20px rgba(217,119,6,.3)'
                      : '0 2px 0 #1d4ed8, 0 6px 20px rgba(37,99,235,.3)',
                  }
                : { color: to === '/admin' ? '#d97706' : '#64748b' }
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: isActive ? 'rgba(255,255,255,.15)' : '#111827',
                    boxShadow: isActive ? 'none' : 'inset 0 1px 0 rgba(255,255,255,.04)',
                  }}
                >
                  <Icon size={16} />
                </span>
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={13} style={{ opacity: 0.5 }} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card + logout */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid #1a1a2e' }}>
        <div
          className="rounded-xl p-3 flex items-center gap-3"
          style={{ background: '#111827' }}
        >
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)' }}
          >
            {(user?.email?.[0] ?? 'U').toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{displayName}</p>
            <p className="text-xs truncate" style={{ color: '#4b6ca8' }}>
              {primaryRole}
            </p>
          </div>

          {/* Logout button */}
          <button
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#334155',
              padding: 4,
              borderRadius: 6,
              transition: 'color .12s',
              flexShrink: 0,
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
  );
}
