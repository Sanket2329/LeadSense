import { useState } from 'react';
import { CreditCard, Star, Zap, Crown, X } from 'lucide-react';
import { format } from 'date-fns';
import { usePlans, useSubscriptions, useTenants, useAssignPlan } from '../../hooks/useAdmin';

function TierBadge({ tier }: { tier: string }) {
  const s = tier === 'Free'
    ? { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' }
    : tier === 'Pro'
      ? { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' }
      : { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' };
  const icon = tier === 'Free' ? <Zap size={12} /> : tier === 'Pro' ? <Star size={12} /> : <Crown size={12} />;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {icon}{tier}
    </span>
  );
}

function AssignModal({ onClose }: { onClose: () => void }) {
  const { data: tenants = [] } = useTenants();
  const { data: plans   = [] } = usePlans();
  const assign = useAssignPlan();
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? '');
  const [planId,   setPlanId]   = useState(plans[0]?.id ?? '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await assign.mutateAsync({ tenantId, planId });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.5)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,.2)' }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <h2 className="font-black text-base" style={{ color: '#0f172a' }}>Assign Plan to Tenant</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>Tenant</label>
            <select value={tenantId} onChange={e => setTenantId(e.target.value)} className="input-3d" required>
              {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>Plan</label>
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

export function AdminSubscriptionsPage() {
  const { data: plans   = [], isLoading: pL } = usePlans();
  const { data: subs    = [], isLoading: sL } = useSubscriptions();
  const { data: tenants = [] } = useTenants();
  const [modal, setModal] = useState(false);

  const loading = pL || sL;
  const tenantMap = Object.fromEntries(tenants.map(t => [t.id, t.name]));

  return (
    <div className="p-8">
      <div className="page-header mb-8">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#fbbf24' }}>Billing</p>
            <h1 className="text-3xl font-black text-white">Subscriptions</h1>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>Manage plans and tenant subscriptions</p>
          </div>
          <button onClick={() => setModal(true)} className="btn-3d flex items-center gap-2"
            style={{ background: '#d97706', color: '#fff', border: 'none', boxShadow: '0 3px 0 #92400e' }}>
            <CreditCard size={15} /> Assign Plan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="spin rounded-full" style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#d97706' }} />
        </div>
      ) : (
        <>
          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {plans.map(plan => {
              const activeSubs = subs.filter(s => s.plan.id === plan.id && s.status === 'Active').length;
              return (
                <div key={plan.id} className="card-3d p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: plan.tier === 'Enterprise' ? '#faf5ff' : plan.tier === 'Pro' ? '#eff6ff' : '#f0fdf4' }}>
                      {plan.tier === 'Free' ? <Zap size={20} color="#16a34a" /> : plan.tier === 'Pro' ? <Star size={20} color="#2563eb" /> : <Crown size={20} color="#7c3aed" />}
                    </div>
                    <TierBadge tier={plan.tier} />
                  </div>
                  <h3 className="text-xl font-black mb-1" style={{ color: '#0f172a' }}>{plan.name}</h3>
                  <p className="text-3xl font-black mb-4" style={{ color: plan.tier === 'Enterprise' ? '#7c3aed' : plan.tier === 'Pro' ? '#2563eb' : '#16a34a' }}>
                    {plan.pricePerMonth === 0 ? 'Free' : `$${plan.pricePerMonth}`}
                    {plan.pricePerMonth > 0 && <span className="text-sm font-bold" style={{ color: '#94a3b8' }}>/mo</span>}
                  </p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span style={{ color: '#64748b' }}>Users</span>
                      <span className="font-bold" style={{ color: '#0f172a' }}>{plan.maxUsers >= 2147483647 ? 'Unlimited' : plan.maxUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#64748b' }}>Leads</span>
                      <span className="font-bold" style={{ color: '#0f172a' }}>{plan.maxLeads >= 2147483647 ? 'Unlimited' : plan.maxLeads.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="rounded-xl px-3 py-2 flex items-center justify-between" style={{ background: '#f8fafc' }}>
                    <span className="text-xs font-bold" style={{ color: '#64748b' }}>Active tenants</span>
                    <span className="font-black" style={{ color: '#0f172a' }}>{activeSubs}</span>
                  </div>
                </div>
              );
            })}
            {plans.length === 0 && (
              <div className="md:col-span-3 card-3d p-14 text-center">
                <CreditCard size={28} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
                <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>No plans seeded yet</p>
              </div>
            )}
          </div>

          {/* Subscriptions table */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#0891b2,#0e7490)' }} />
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Active Subscriptions</h2>
            <span className="rounded-full px-2.5 py-0.5 text-xs font-black" style={{ background: '#0f172a', color: '#fff' }}>{subs.length}</span>
          </div>

          {subs.length === 0 ? (
            <div className="card-3d p-10 text-center">
              <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>No subscriptions yet</p>
            </div>
          ) : (
            <div className="card-3d overflow-hidden">
              <table className="w-full" style={{ fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: '#0f172a', borderBottom: '2px solid #1e293b' }}>
                    {['Tenant', 'Plan', 'Status', 'Started', 'Ends'].map(h => (
                      <th key={h} className="text-left px-5 py-4"
                        style={{ color: '#94a3b8', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subs.map((sub, i) => (
                    <tr key={sub.id} className="table-row-hover" style={{ borderBottom: i < subs.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td className="px-5 py-4 font-bold" style={{ color: '#0f172a' }}>
                        {tenantMap[sub.tenantId] ?? sub.tenantId.slice(0, 8) + '…'}
                      </td>
                      <td className="px-5 py-4"><TierBadge tier={sub.plan.tier} /></td>
                      <td className="px-5 py-4">
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                          style={sub.status === 'Active'
                            ? { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }
                            : sub.status === 'Trialing'
                              ? { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }
                              : { background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: '#64748b' }}>{format(new Date(sub.startedAt), 'dd MMM yyyy')}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: '#64748b' }}>{sub.endsAt ? format(new Date(sub.endsAt), 'dd MMM yyyy') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {modal && <AssignModal onClose={() => setModal(false)} />}
    </div>
  );
}
