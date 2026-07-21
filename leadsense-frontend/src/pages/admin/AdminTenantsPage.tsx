/**
 * Standalone SuperAdmin → Tenants page.
 * Re-uses the same TenantsTab UI from SuperAdminPage but as a dedicated route.
 */
import { useState } from 'react';
import { Building2, Plus, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { useTenants, useAdminUsers, useCreateTenant } from '../../hooks/useAdmin';
import type { CreateTenantRequest } from '../../api/admin';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.5)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,.2)' }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <h2 className="font-black text-base" style={{ color: '#0f172a' }}>Create New Tenant</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>
              Organisation Name
            </label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Acme Corp" className="input-3d" required autoFocus />
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

export function AdminTenantsPage() {
  const { data: tenants = [], isLoading } = useTenants();
  const { data: users   = [] } = useAdminUsers();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);

  const filtered = tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8">
      <div className="page-header mb-8">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#fbbf24' }}>Platform</p>
            <h1 className="text-3xl font-black text-white">Tenants</h1>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>{tenants.length} registered organisations</p>
          </div>
          <button onClick={() => setModal(true)} className="btn-3d flex items-center gap-2"
            style={{ background: '#d97706', color: '#fff', border: 'none', boxShadow: '0 3px 0 #92400e' }}>
            <Plus size={16} /> New Tenant
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tenants…"
          className="input-3d" style={{ paddingLeft: 42, paddingTop: 12, paddingBottom: 12, fontSize: 14 }} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="spin rounded-full" style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#d97706' }} />
        </div>
      ) : filtered.length > 0 ? (
        <div className="card-3d overflow-hidden">
          <table className="w-full" style={{ fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#0f172a', borderBottom: '2px solid #1e293b' }}>
                {['Organisation', 'Users', 'Status', 'Created'].map(h => (
                  <th key={h} className="text-left px-5 py-4"
                    style={{ color: '#94a3b8', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const count  = users.filter(u => u.tenantId === t.id).length;
                const admins = users.filter(u => u.tenantId === t.id && u.roles.includes('TenantAdmin')).length;
                return (
                  <tr key={t.id} className="table-row-hover" style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                          style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)' }}>
                          {t.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold" style={{ color: '#0f172a' }}>{t.name}</p>
                          <p className="text-xs font-mono" style={{ color: '#94a3b8' }}>{t.id.slice(0,8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-black" style={{ color: '#0f172a' }}>{count}</span>
                      {admins > 0 && <span className="text-xs ml-1" style={{ color: '#94a3b8' }}>({admins} admin)</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                        style={t.isActive
                          ? { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }
                          : { background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: '#64748b' }}>
                      {format(new Date(t.createdAt), 'dd MMM yyyy')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card-3d p-16 text-center">
          <Building2 size={28} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
          <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>
            {search ? 'No tenants match your search' : 'No tenants yet — create the first one'}
          </p>
        </div>
      )}

      {modal && <CreateTenantModal onClose={() => setModal(false)} />}
    </div>
  );
}
