import { useState } from 'react';
import { Users, Plus, Search, Shield, X } from 'lucide-react';
import { useAdminUsers, useCreateAdminUser } from '../hooks/useAdmin';
import { useTenants } from '../hooks/useAdmin';
import { useAuth } from '../context/AuthContext';
import { ROLE_IDS, type CreateUserRequest } from '../api/admin';

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    TenantAdmin: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    User:        { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    SuperAdmin:  { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' },
  };
  const s = styles[role] ?? { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
  return (
    <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {role}
    </span>
  );
}

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const { data: tenants = [] } = useTenants();
  const { user } = useAuth();
  const create = useCreateAdminUser();

  const defaultTenantId = user?.tenantId ?? tenants[0]?.id ?? '';
  const [form, setForm] = useState<CreateUserRequest>({
    tenantId: defaultTenantId,
    firstName: '', lastName: '', email: '', password: '',
    roleId: ROLE_IDS.User,
  });

  function set(key: keyof CreateUserRequest, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await create.mutateAsync(form);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.5)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,.2)' }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <h2 className="font-black text-base" style={{ color: '#0a0a0f' }}>Invite New User</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
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
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>Temporary Password</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
              placeholder="••••••••" className="input-3d" required />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>Role</label>
            <select value={form.roleId} onChange={e => set('roleId', e.target.value)} className="input-3d">
              <option value={ROLE_IDS.TenantAdmin}>Tenant Admin</option>
              <option value={ROLE_IDS.User}>User (Sales)</option>
            </select>
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

export function UsersPage() {
  const { data: users = [], isLoading } = useAdminUsers();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8">
      <div className="page-header mb-8">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#60a5fa' }}>Management</p>
            <h1 className="text-3xl font-black text-white">Users</h1>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>{users.length} team members</p>
          </div>
          <button onClick={() => setCreateOpen(true)} className="btn-3d btn-primary flex items-center gap-2">
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
        <input type="text" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)}
          className="input-3d" style={{ paddingLeft: 42, paddingTop: 12, paddingBottom: 12, fontSize: 14 }} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="spin rounded-full" style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#4f46e5' }} />
        </div>
      ) : filtered.length > 0 ? (
        <div className="card-3d overflow-hidden">
          <table className="w-full" style={{ fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#0f172a', borderBottom: '2px solid #1e293b' }}>
                {['User', 'Email', 'Roles', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-4"
                    style={{ color: '#94a3b8', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} className="table-row-hover"
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg,#4f46e5,#6366f1)' }}>
                        {(u.firstName?.[0] ?? u.email[0]).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold" style={{ color: '#0f172a' }}>{u.firstName} {u.lastName}</p>
                        <p className="text-xs" style={{ color: '#94a3b8' }}>{u.id.slice(0, 8)}…</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4" style={{ color: '#64748b' }}>{u.email}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.length > 0 ? u.roles.map(r => <RoleBadge key={r} role={r} />) : (
                        <span className="text-xs text-slate-400">No role</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card-3d p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: '#f1f5f9' }}>
            <Users size={24} style={{ color: '#94a3b8' }} />
          </div>
          <p className="font-bold text-base mb-1" style={{ color: '#0f172a' }}>
            {search ? 'No users match your search' : 'No users yet'}
          </p>
          {!search && (
            <button onClick={() => setCreateOpen(true)} className="btn-3d btn-primary btn-sm mt-4 inline-flex items-center gap-1.5">
              <Shield size={13} /> Add first user
            </button>
          )}
        </div>
      )}
      {createOpen && <CreateUserModal onClose={() => setCreateOpen(false)} />}
    </div>
  );
}
