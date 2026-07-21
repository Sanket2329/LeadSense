import { useState } from 'react';
import {
  Building2, Users, Plus, Shield, CheckCircle,
  Search, ChevronRight, Globe, Crown,
  TrendingUp, Activity, RefreshCw, X, CreditCard, Zap, Star,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  useTenants, useAdminUsers, useCreateTenant,
  useCreateAdminUser, usePlans, useSubscriptions, useAssignPlan,
} from '../hooks/useAdmin';
import {
  ROLE_IDS,
  type CreateTenantRequest,
  type CreateUserRequest,
} from '../api/admin';

type Tab = 'overview' | 'tenants' | 'users' | 'plans';

// ─── Small reusable components ────────────────────────────────────────────────
function StatTile({ label, value, icon, color }: {
  label: string; value: number | string; icon: React.ReactNode; color: string;
}) {
  return (
    <div className="card-3d p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: color }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: '#0a0a0f' }}>{value}</p>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>{label}</p>
      </div>
    </div>
  );
}

function Badge({ text, variant }: { text: string; variant: 'green' | 'red' | 'blue' | 'purple' }) {
  const styles = {
    green:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    red:    { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' },
    blue:   { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    purple: { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' },
  }[variant];
  return (
    <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
      style={{ background: styles.bg, color: styles.color, border: `1px solid ${styles.border}` }}>
      {text}
    </span>
  );
}

// ─── Create Tenant Modal ─────────────────────────────────────────────────────
function CreateTenantModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const create = useCreateTenant();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await create.mutateAsync({ name: name.trim() } as CreateTenantRequest);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.6)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 4px 0 #0a0a0f, 0 24px 60px rgba(0,0,0,.45)' }}>
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1.5px solid #f1f5f9' }}>
          <h2 className="font-black text-base" style={{ color: '#0a0a0f' }}>Create New Tenant</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>
              Company / Organisation Name
            </label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Acme Corp" className="input-3d" required autoFocus />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-3d btn-beige btn-sm">Cancel</button>
            <button type="submit" disabled={create.isPending} className="btn-3d btn-primary btn-sm">
              {create.isPending ? 'Creating…' : 'Create Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Create User Modal ───────────────────────────────────────────────────────
function CreateUserModal({ tenants, onClose }: {
  tenants: { id: string; name: string }[];
  onClose: () => void;
}) {
  const create = useCreateAdminUser();
  const [form, setForm] = useState<CreateUserRequest>({
    tenantId: tenants[0]?.id ?? '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleId: ROLE_IDS.TenantAdmin,
  });

  function set(key: keyof CreateUserRequest, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await create.mutateAsync(form);
    onClose();
  }

  const roles = [
    { id: ROLE_IDS.TenantAdmin, label: 'Tenant Admin' },
    { id: ROLE_IDS.User,        label: 'User' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.6)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 4px 0 #0a0a0f, 0 24px 60px rgba(0,0,0,.45)' }}>
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1.5px solid #f1f5f9' }}>
          <h2 className="font-black text-base" style={{ color: '#0a0a0f' }}>Create User</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {(['firstName', 'lastName'] as const).map(k => (
              <div key={k}>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>
                  {k === 'firstName' ? 'First Name' : 'Last Name'}
                </label>
                <input value={form[k]} onChange={e => set(k, e.target.value)}
                  placeholder={k === 'firstName' ? 'Jane' : 'Smith'} className="input-3d" required />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="jane@company.com" className="input-3d" required />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>Password</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
              placeholder="Temporary password" className="input-3d" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>Tenant</label>
              <select value={form.tenantId} onChange={e => set('tenantId', e.target.value)} className="input-3d" required>
                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>Role</label>
              <select value={form.roleId} onChange={e => set('roleId', e.target.value)} className="input-3d">
                {roles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-3d btn-beige btn-sm">Cancel</button>
            <button type="submit" disabled={create.isPending} className="btn-3d btn-primary btn-sm">
              {create.isPending ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────
function OverviewTab({ tenants, users }: {
  tenants: import('../api/admin').TenantResponse[];
  users: import('../api/admin').AdminUserResponse[];
}) {
  const activeTenants   = tenants.filter(t => t.isActive).length;
  const inactiveTenants = tenants.length - activeTenants;
  const adminUsers      = users.filter(u => u.roles.includes('TenantAdmin')).length;
  const regularUsers    = users.filter(u => u.roles.includes('User') && !u.roles.includes('TenantAdmin')).length;

  return (
    <div className="space-y-6">
      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Total Tenants"   value={tenants.length} color="linear-gradient(135deg,#1e3a8a,#2563eb)"
          icon={<Building2 size={22} color="#fff" />} />
        <StatTile label="Active Tenants"  value={activeTenants}  color="linear-gradient(135deg,#064e3b,#059669)"
          icon={<CheckCircle size={22} color="#fff" />} />
        <StatTile label="Total Users"     value={users.length}   color="linear-gradient(135deg,#4c1d95,#7c3aed)"
          icon={<Users size={22} color="#fff" />} />
        <StatTile label="Tenant Admins"   value={adminUsers}     color="linear-gradient(135deg,#78350f,#d97706)"
          icon={<Crown size={22} color="#fff" />} />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenant health */}
        <div className="card-3d p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#2563eb,#1e3a8a)' }} />
            <h3 className="font-black text-sm" style={{ color: '#0a0a0f' }}>Tenant Health</h3>
          </div>
          {tenants.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: '#a8a29e' }}>No tenants yet</p>
          ) : (
            <div className="space-y-1.5">
              {tenants.slice(0, 6).map(t => (
                <div key={t.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                  style={{ background: '#f8fafc' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
                      style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)' }}>
                      {t.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#0a0a0f' }}>{t.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#94a3b8' }}>
                      {users.filter(u => u.tenantId === t.id).length} users
                    </span>
                    {t.isActive
                      ? <Badge text="Active"   variant="green" />
                      : <Badge text="Inactive" variant="red" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform stats */}
        <div className="card-3d p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#7c3aed,#4c1d95)' }} />
            <h3 className="font-black text-sm" style={{ color: '#0a0a0f' }}>Platform Breakdown</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Active tenants',   value: activeTenants,   total: tenants.length, color: '#10b981' },
              { label: 'Inactive tenants', value: inactiveTenants, total: tenants.length, color: '#ef4444' },
              { label: 'Tenant admins',    value: adminUsers,      total: users.length,   color: '#f59e0b' },
              { label: 'Regular users',    value: regularUsers,    total: users.length,   color: '#6366f1' },
            ].map(row => {
              const pct = row.total > 0 ? (row.value / row.total) * 100 : 0;
              return (
                <div key={row.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: '#44403c' }}>{row.label}</span>
                    <span className="text-xs font-black" style={{ color: '#0a0a0f' }}>{row.value}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: '#f1f5f9' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: row.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tenants Tab ─────────────────────────────────────────────────────────────
function TenantsTab({ tenants, users, onCreateTenant }: {
  tenants: import('../api/admin').TenantResponse[];
  users:   import('../api/admin').AdminUserResponse[];
  onCreateTenant: () => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tenants…" className="input-3d" style={{ paddingLeft: 38 }} />
        </div>
        <button onClick={onCreateTenant} className="btn-3d btn-primary btn-sm flex items-center gap-1.5">
          <Plus size={14} /> New Tenant
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card-3d p-14 text-center">
          <Building2 size={32} style={{ color: '#d4c9b8', margin: '0 auto 12px' }} />
          <p className="text-sm font-bold" style={{ color: '#a8a29e' }}>
            {search ? 'No tenants match your search' : 'No tenants yet — create the first one'}
          </p>
        </div>
      ) : (
        <div className="card-3d overflow-hidden">
          <table className="w-full" style={{ fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#0a0a0f', borderBottom: '2px solid #1a1a2e' }}>
                {['Organisation', 'Users', 'Status', 'Created'].map(h => (
                  <th key={h} className="text-left px-5 py-4"
                    style={{ color: '#94a3b8', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const tenantUsers = users.filter(u => u.tenantId === t.id);
                const admins = tenantUsers.filter(u => u.roles.includes('TenantAdmin'));
                return (
                  <tr key={t.id} className="table-row-hover"
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f5f0e8' : 'none' }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                          style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', boxShadow: '0 2px 0 #1d4ed8' }}>
                          {t.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold" style={{ color: '#0a0a0f' }}>{t.name}</p>
                          <p className="text-xs font-mono" style={{ color: '#94a3b8' }}>{t.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black" style={{ color: '#0a0a0f' }}>{tenantUsers.length}</span>
                        {admins.length > 0 && (
                          <span className="text-xs" style={{ color: '#94a3b8' }}>({admins.length} admin)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {t.isActive
                        ? <Badge text="Active"   variant="green" />
                        : <Badge text="Inactive" variant="red" />}
                    </td>
                    <td className="px-5 py-4" style={{ color: '#78716c', fontSize: 12 }}>
                      {format(new Date(t.createdAt), 'dd MMM yyyy')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Users Tab ───────────────────────────────────────────────────────────────
function UsersTab({ users, tenants, onCreateUser }: {
  users:   import('../api/admin').AdminUserResponse[];
  tenants: import('../api/admin').TenantResponse[];
  onCreateUser: () => void;
}) {
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const tenantMap = Object.fromEntries(tenants.map(t => [t.id, t.name]));

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch =
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q)  ||
      u.email.toLowerCase().includes(q);
    const matchRole =
      roleFilter === 'all' || u.roles.includes(roleFilter);
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1" style={{ minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users…" className="input-3d" style={{ paddingLeft: 38 }} />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-3d"
          style={{ width: 'auto', paddingLeft: 12, paddingRight: 28 }}>
          <option value="all">All Roles</option>
          <option value="SuperAdmin">SuperAdmin</option>
          <option value="TenantAdmin">TenantAdmin</option>
          <option value="User">User</option>
        </select>
        <button onClick={onCreateUser} className="btn-3d btn-primary btn-sm flex items-center gap-1.5">
          <Plus size={14} /> New User
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card-3d p-14 text-center">
          <Users size={32} style={{ color: '#d4c9b8', margin: '0 auto 12px' }} />
          <p className="text-sm font-bold" style={{ color: '#a8a29e' }}>
            {search || roleFilter !== 'all' ? 'No users match your filters' : 'No users yet'}
          </p>
        </div>
      ) : (
        <div className="card-3d overflow-hidden">
          <table className="w-full" style={{ fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#0a0a0f', borderBottom: '2px solid #1a1a2e' }}>
                {['User', 'Email', 'Tenant', 'Roles'].map(h => (
                  <th key={h} className="text-left px-5 py-4"
                    style={{ color: '#94a3b8', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const roleBadge = (role: string) => {
                  if (role === 'SuperAdmin')  return <Badge key={role} text="SuperAdmin"  variant="purple" />;
                  if (role === 'TenantAdmin') return <Badge key={role} text="TenantAdmin" variant="blue" />;
                  return <Badge key={role} text="User" variant="green" />;
                };
                return (
                  <tr key={u.id} className="table-row-hover"
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f5f0e8' : 'none' }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                          style={{ background: 'linear-gradient(135deg,#4c1d95,#7c3aed)', boxShadow: '0 2px 0 #6d28d9' }}>
                          {u.firstName?.[0]?.toUpperCase() ?? u.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold" style={{ color: '#0a0a0f' }}>
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-xs font-mono" style={{ color: '#94a3b8' }}>{u.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell" style={{ color: '#78716c' }}>{u.email}</td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      {u.tenantId ? (
                        <span className="text-sm font-semibold" style={{ color: '#44403c' }}>
                          {tenantMap[u.tenantId] ?? '—'}
                        </span>
                      ) : (
                        <Badge text="Platform" variant="purple" />
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length > 0 ? u.roles.map(roleBadge) : <Badge text="No role" variant="red" />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Assign Plan Modal ───────────────────────────────────────────────────────
function AssignPlanModal({ tenants, plans, onClose }: {
  tenants: import('../api/admin').TenantResponse[];
  plans:   import('../api/admin').PlanResponse[];
  onClose: () => void;
}) {
  const assign = useAssignPlan();
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? '');
  const [planId,   setPlanId]   = useState(plans[0]?.id ?? '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await assign.mutateAsync({ tenantId, planId });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.6)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 4px 0 #0a0a0f, 0 24px 60px rgba(0,0,0,.45)' }}>
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1.5px solid #f1f5f9' }}>
          <h2 className="font-black text-base" style={{ color: '#0a0a0f' }}>Assign Plan to Tenant</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>
              Tenant
            </label>
            <select value={tenantId} onChange={e => setTenantId(e.target.value)} className="input-3d" required>
              {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>
              Plan
            </label>
            <select value={planId} onChange={e => setPlanId(e.target.value)} className="input-3d" required>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.pricePerMonth}/mo</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-3d btn-beige btn-sm">Cancel</button>
            <button type="submit" disabled={assign.isPending} className="btn-3d btn-primary btn-sm">
              {assign.isPending ? 'Assigning…' : 'Assign Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Plans Tab ────────────────────────────────────────────────────────────────
function PlansTab({ plans, subscriptions, tenants, onAssign }: {
  plans:         import('../api/admin').PlanResponse[];
  subscriptions: import('../api/admin').SubscriptionResponse[];
  tenants:       import('../api/admin').TenantResponse[];
  onAssign:      () => void;
}) {
  const tierColor = (tier: string) => {
    if (tier === 'Free')       return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
    if (tier === 'Pro')        return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
    return                            { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' };
  };
  const tierIcon = (tier: string) => {
    if (tier === 'Free') return <Zap size={20} color="#16a34a" />;
    if (tier === 'Pro')  return <Star size={20} color="#2563eb" />;
    return                      <Crown size={20} color="#7c3aed" />;
  };
  const subStatusColor = (status: string) =>
    status === 'Active'   ? 'green' :
    status === 'Trialing' ? 'blue'  :
    status === 'Cancelled'? 'red'   : 'green';

  const tenantMap = Object.fromEntries(tenants.map(t => [t.id, t.name]));

  return (
    <div className="space-y-8">
      {/* Plan cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#7c3aed,#4c1d95)' }} />
            <h3 className="font-black text-sm" style={{ color: '#0a0a0f' }}>Available Plans</h3>
          </div>
          <button onClick={onAssign} className="btn-3d btn-primary btn-sm flex items-center gap-1.5">
            <CreditCard size={13} /> Assign to Tenant
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map(plan => {
            const c = tierColor(plan.tier);
            const activeSubs = subscriptions.filter(s => s.plan.id === plan.id && s.status === 'Active').length;
            return (
              <div key={plan.id} className="relative overflow-hidden rounded-2xl p-6"
                style={{ background: '#fff', border: `2px solid ${c.border}`, boxShadow: '0 2px 0 #e2e8f0, 0 8px 24px rgba(0,0,0,.06)' }}>
                {/* Tier badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: c.bg }}>
                    {tierIcon(plan.tier)}
                  </div>
                  <span className="text-xs font-black rounded-full px-3 py-1"
                    style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                    {plan.tier}
                  </span>
                </div>

                {/* Name & Price */}
                <h3 className="text-xl font-black mb-1" style={{ color: '#0a0a0f' }}>{plan.name}</h3>
                <p className="text-3xl font-black mb-4" style={{ color: c.color }}>
                  {plan.pricePerMonth === 0 ? 'Free' : `$${plan.pricePerMonth}`}
                  {plan.pricePerMonth > 0 && <span className="text-sm font-bold" style={{ color: '#94a3b8' }}>/mo</span>}
                </p>

                {/* Limits */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Users</span>
                    <span style={{ color: '#0a0a0f', fontWeight: 800 }}>
                      {plan.maxUsers === 2147483647 ? 'Unlimited' : plan.maxUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Leads</span>
                    <span style={{ color: '#0a0a0f', fontWeight: 800 }}>
                      {plan.maxLeads === 2147483647 ? 'Unlimited' : plan.maxLeads.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Active subscribers */}
                <div className="rounded-xl px-3 py-2 flex items-center justify-between"
                  style={{ background: '#f8fafc' }}>
                  <span className="text-xs font-bold" style={{ color: '#64748b' }}>Active tenants</span>
                  <span className="text-sm font-black" style={{ color: '#0a0a0f' }}>{activeSubs}</span>
                </div>
              </div>
            );
          })}
          {plans.length === 0 && (
            <div className="md:col-span-3 card-3d p-14 text-center">
              <CreditCard size={32} style={{ color: '#d4c9b8', margin: '0 auto 12px' }} />
              <p className="text-sm font-bold" style={{ color: '#a8a29e' }}>
                No plans yet. Restart the backend to seed Free, Pro, and Enterprise plans.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Subscriptions table */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#0891b2,#0e7490)' }} />
          <h3 className="font-black text-sm" style={{ color: '#0a0a0f' }}>Active Subscriptions</h3>
          <span className="rounded-full px-2.5 py-0.5 text-xs font-black"
            style={{ background: '#0a0a0f', color: '#fff' }}>{subscriptions.length}</span>
        </div>

        {subscriptions.length === 0 ? (
          <div className="card-3d p-10 text-center">
            <p className="text-sm font-bold" style={{ color: '#a8a29e' }}>
              No subscriptions yet. Assign a plan to a tenant above.
            </p>
          </div>
        ) : (
          <div className="card-3d overflow-hidden">
            <table className="w-full" style={{ fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#0a0a0f', borderBottom: '2px solid #1a1a2e' }}>
                  {['Tenant', 'Plan', 'Status', 'Started', 'Ends'].map(h => (
                    <th key={h} className="text-left px-5 py-4"
                      style={{ color: '#94a3b8', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub, i) => {
                  const c = tierColor(sub.plan.tier);
                  return (
                    <tr key={sub.id} className="table-row-hover"
                      style={{ borderBottom: i < subscriptions.length - 1 ? '1px solid #f5f0e8' : 'none' }}>
                      <td className="px-5 py-4">
                        <span className="font-bold" style={{ color: '#0a0a0f' }}>
                          {tenantMap[sub.tenantId] ?? sub.tenantId.slice(0, 8) + '…'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                          style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                          {sub.plan.name}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge text={sub.status} variant={subStatusColor(sub.status) as 'green'|'blue'|'red'|'purple'} />
                      </td>
                      <td className="px-5 py-4" style={{ color: '#78716c', fontSize: 12 }}>
                        {format(new Date(sub.startedAt), 'dd MMM yyyy')}
                      </td>
                      <td className="px-5 py-4" style={{ color: '#78716c', fontSize: 12 }}>
                        {sub.endsAt ? format(new Date(sub.endsAt), 'dd MMM yyyy') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main SuperAdminPage ──────────────────────────────────────────────────────
export function SuperAdminPage() {
  const [tab,         setTab]         = useState<Tab>('overview');
  const [tenantModal, setTenantModal] = useState(false);
  const [userModal,   setUserModal]   = useState(false);
  const [planModal,   setPlanModal]   = useState(false);

  const { data: tenants       = [], isLoading: tenantsLoading,       refetch: refetchTenants       } = useTenants();
  const { data: users         = [], isLoading: usersLoading,         refetch: refetchUsers         } = useAdminUsers();
  const { data: plans         = [], isLoading: plansLoading,         refetch: refetchPlans         } = usePlans();
  const { data: subscriptions = [], isLoading: subscriptionsLoading, refetch: refetchSubscriptions } = useSubscriptions();

  const loading = tenantsLoading || usersLoading || plansLoading || subscriptionsLoading;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp size={15} /> },
    { id: 'tenants',  label: 'Tenants',  icon: <Building2 size={15} /> },
    { id: 'users',    label: 'Users',    icon: <Users size={15} />     },
    { id: 'plans',    label: 'Plans',    icon: <CreditCard size={15} />},
  ];

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="page-header mb-8">
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#f59e0b' }}>
              Platform Control
            </p>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Shield size={28} color="#fbbf24" />
              Super Admin
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>
              Manage all tenants, users and platform configuration
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { refetchTenants(); refetchUsers(); refetchPlans(); refetchSubscriptions(); }}
              className="btn-3d btn-beige btn-sm flex items-center gap-1.5"
              title="Refresh data"
            >
              <RefreshCw size={13} /> Refresh
            </button>
            <button onClick={() => setTenantModal(true)}
              className="btn-3d btn-primary btn-sm flex items-center gap-1.5">
              <Building2 size={13} /> New Tenant
            </button>
            <button onClick={() => setUserModal(true)}
              className="btn-3d btn-sm flex items-center gap-1.5"
              style={{ background: '#7c3aed', color: '#fff', boxShadow: '0 3px 0 #5b21b6', border: 'none' }}>
              <Users size={13} /> New User
            </button>
          </div>
        </div>
      </div>

      {/* Platform warning bar */}
      <div className="rounded-xl px-4 py-3 mb-6 flex items-center gap-3"
        style={{ background: '#fffbeb', border: '1.5px solid #fde68a' }}>
        <Shield size={16} color="#d97706" />
        <p className="text-sm font-semibold" style={{ color: '#92400e' }}>
          You are in the <strong>SuperAdmin</strong> console. Actions here affect the entire platform.
          Proceed with caution.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 rounded-xl"
        style={{ background: '#f1f5f9', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
            style={tab === t.id
              ? { background: '#0a0a0f', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,.2)' }
              : { background: 'transparent', color: '#64748b' }}>
            {t.icon} {t.label}
            {t.id === 'tenants' && (
              <span className="rounded-full px-1.5 text-xs font-black"
                style={{ background: tab === 'tenants' ? 'rgba(255,255,255,.2)' : '#e2e8f0',
                  color: tab === 'tenants' ? '#fff' : '#475569' }}>
                {tenants.length}
              </span>
            )}
            {t.id === 'users' && (
              <span className="rounded-full px-1.5 text-xs font-black"
                style={{ background: tab === 'users' ? 'rgba(255,255,255,.2)' : '#e2e8f0',
                  color: tab === 'users' ? '#fff' : '#475569' }}>
                {users.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="spin rounded-full" style={{ width: 36, height: 36, border: '3px solid #e2d9cc', borderTopColor: '#2563eb' }} />
        </div>
      ) : (
        <>
          {tab === 'overview' && <OverviewTab tenants={tenants} users={users} />}
          {tab === 'tenants'  && (
            <TenantsTab tenants={tenants} users={users} onCreateTenant={() => setTenantModal(true)} />
          )}
          {tab === 'users'    && (
            <UsersTab users={users} tenants={tenants} onCreateUser={() => setUserModal(true)} />
          )}
          {tab === 'plans'    && (
            <PlansTab
              plans={plans}
              subscriptions={subscriptions}
              tenants={tenants}
              onAssign={() => setPlanModal(true)}
            />
          )}
        </>
      )}

      {/* Platform activity footer */}
      <div className="mt-8 rounded-xl px-5 py-4 flex items-center justify-between flex-wrap gap-3"
        style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <div className="flex items-center gap-2">
          <Activity size={14} color="#94a3b8" />
          <span className="text-xs font-semibold" style={{ color: '#64748b' }}>Platform Status</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
            <span className="text-xs font-semibold" style={{ color: '#64748b' }}>API Online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe size={12} color="#94a3b8" />
            <span className="text-xs font-semibold" style={{ color: '#64748b' }}>
              {tenants.length} tenant{tenants.length !== 1 ? 's' : ''} · {users.length} user{users.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ChevronRight size={12} color="#94a3b8" />
            <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>
              {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      {tenantModal && <CreateTenantModal onClose={() => setTenantModal(false)} />}
      {userModal   && tenants.length > 0 && (
        <CreateUserModal tenants={tenants} onClose={() => setUserModal(false)} />
      )}
      {planModal   && plans.length > 0 && tenants.length > 0 && (
        <AssignPlanModal plans={plans} tenants={tenants} onClose={() => setPlanModal(false)} />
      )}
      {userModal && tenants.length === 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,.6)' }}>
          <div className="card-3d p-8 text-center max-w-sm w-full">
            <Building2 size={32} style={{ color: '#d97706', margin: '0 auto 12px' }} />
            <p className="font-black text-base mb-2" style={{ color: '#0a0a0f' }}>No tenants yet</p>
            <p className="text-sm mb-4" style={{ color: '#78716c' }}>
              Create at least one tenant before adding users.
            </p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setUserModal(false)} className="btn-3d btn-beige btn-sm">Close</button>
              <button onClick={() => { setUserModal(false); setTenantModal(true); }}
                className="btn-3d btn-primary btn-sm">
                Create Tenant First
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
