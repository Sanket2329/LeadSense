import { BarChart3, TrendingUp, Users, Building2 } from 'lucide-react';
import { useTenants, useAdminUsers, useSubscriptions } from '../../hooks/useAdmin';

interface KpiTileProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  bg: string;
  sub?: string;
}
function KpiTile({ label, value, icon, bg, sub }: KpiTileProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-6"
      style={{ background: bg, boxShadow: '0 4px 20px rgba(0,0,0,.12)' }}>
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,.06)' }} />
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(255,255,255,.2)' }}>{icon}</div>
      <p className="text-4xl font-black text-white mb-0.5">{value}</p>
      <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,.7)' }}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,.5)' }}>{sub}</p>}
    </div>
  );
}

function BarRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="flex justify-between mb-1">
        <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>{value}</span>
      </div>
      <div className="h-2.5 rounded-full" style={{ background: '#f1f5f9' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export function PlatformAnalyticsPage() {
  const { data: tenants = [], isLoading: tL } = useTenants();
  const { data: users   = [], isLoading: uL } = useAdminUsers();
  const { data: subs    = [], isLoading: sL } = useSubscriptions();

  const loading = tL || uL || sL;

  const activeTenants   = tenants.filter(t => t.isActive).length;
  const inactiveTenants = tenants.length - activeTenants;
  const adminUsers      = users.filter(u => u.roles.includes('TenantAdmin')).length;
  const regularUsers    = users.filter(u => u.roles.includes('User') && !u.roles.includes('TenantAdmin')).length;
  const activeSubs      = subs.filter(s => s.status === 'Active').length;

  return (
    <div className="p-8">
      <div className="page-header mb-8">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#fbbf24' }}>Platform</p>
            <h1 className="text-3xl font-black text-white">Platform Analytics</h1>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>System-wide metrics and health overview</p>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.15)' }}>
            <BarChart3 size={26} color="#fbbf24" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="spin rounded-full" style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#d97706' }} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KpiTile label="Total Tenants"   value={tenants.length} icon={<Building2 size={22} color="#fff" />} bg="linear-gradient(135deg,#1e3a8a,#2563eb)" sub={`${activeTenants} active`} />
            <KpiTile label="Total Users"     value={users.length}   icon={<Users size={22} color="#fff" />}     bg="linear-gradient(135deg,#4c1d95,#7c3aed)" sub={`${adminUsers} admins`} />
            <KpiTile label="Subscriptions"   value={subs.length}    icon={<TrendingUp size={22} color="#fff" />} bg="linear-gradient(135deg,#064e3b,#059669)"  sub={`${activeSubs} active`} />
            <KpiTile label="Inactive Tenants" value={inactiveTenants} icon={<BarChart3 size={22} color="#fff" />} bg="linear-gradient(135deg,#881337,#e11d48)" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-3d p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1.5 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#2563eb,#1e3a8a)' }} />
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Tenant Distribution</h2>
              </div>
              <BarRow label="Active Tenants"   value={activeTenants}   total={tenants.length} color="#10b981" />
              <BarRow label="Inactive Tenants" value={inactiveTenants} total={tenants.length} color="#ef4444" />
            </div>

            <div className="card-3d p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1.5 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#7c3aed,#4c1d95)' }} />
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>User Distribution</h2>
              </div>
              <BarRow label="Tenant Admins" value={adminUsers}   total={users.length} color="#f59e0b" />
              <BarRow label="Regular Users" value={regularUsers} total={users.length} color="#6366f1" />
            </div>

            <div className="card-3d p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1.5 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#059669,#064e3b)' }} />
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Tenants by User Count</h2>
              </div>
              {tenants.length === 0
                ? <p className="text-center py-8 text-sm" style={{ color: '#94a3b8' }}>No tenants yet</p>
                : tenants.map(t => {
                    const count = users.filter(u => u.tenantId === t.id).length;
                    return <BarRow key={t.id} label={t.name} value={count} total={users.length || 1} color="#4f46e5" />;
                  })
              }
            </div>
          </div>
        </>
      )}
    </div>
  );
}
