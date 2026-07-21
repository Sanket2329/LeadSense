import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, ArrowRight, Tag, Pencil, Trash2, Plus } from 'lucide-react';
import { useMyLeads, useDeleteLead } from '../hooks/useLeads';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LeadFormModal } from '../components/leads/LeadFormModal';
import { UpdateStatusModal } from '../components/leads/UpdateStatusModal';
import { LeadStatusBadge } from '../components/leads/LeadStatusBadge';
import type { LeadResponse } from '../types';

const AVATAR_COLORS = [
  ['#1e3a8a', '#2563eb', '#1d4ed8'],
  ['#064e3b', '#059669', '#047857'],
  ['#78350f', '#d97706', '#b45309'],
  ['#4c1d95', '#7c3aed', '#6d28d9'],
  ['#831843', '#db2777', '#be185d'],
];

export function MyLeadsPage() {
  const { data: leads = [], isLoading } = useMyLeads();
  const deleteLead = useDeleteLead();
  const [search,      setSearch]      = useState('');
  const [createOpen,  setCreateOpen]  = useState(false);
  const [editLead,    setEditLead]    = useState<LeadResponse | null>(null);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);
  const [statusLead,  setStatusLead]  = useState<LeadResponse | null>(null);

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    return (
      l.firstName.toLowerCase().includes(q) ||
      l.lastName.toLowerCase().includes(q)  ||
      l.email.toLowerCase().includes(q)     ||
      l.phoneNumber.includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spin rounded-full" style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#4f46e5' }} />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="page-header mb-8">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#60a5fa' }}>My Pipeline</p>
            <h1 className="text-3xl font-black text-white">My Leads</h1>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>
              {leads.length} lead{leads.length !== 1 ? 's' : ''} assigned to you
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="lg">
            <Plus size={17} /> Add Lead
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
        <input
          type="text"
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-3d"
          style={{ paddingLeft: 42, paddingTop: 12, paddingBottom: 12, fontSize: 14 }}
        />
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="overflow-hidden"
          style={{ background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-card)' }}>
          <table className="w-full" style={{ fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#0f172a', borderBottom: '2px solid #1e293b' }}>
                {['Lead', 'Email', 'Status', 'Actions'].map((h, i) => (
                  <th key={h} className={`text-left px-5 py-4 ${i === 1 ? 'hidden md:table-cell' : ''}`}
                    style={{ color: '#94a3b8', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase',
                      textAlign: i === 3 ? 'right' : 'left' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, idx) => {
                const [from, to, shadow] = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <tr key={lead.id} className="table-row-hover"
                    style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 text-white"
                          style={{ background: `linear-gradient(135deg,${from},${to})`, boxShadow: `0 2px 0 ${shadow}` }}>
                          {lead.firstName[0]}{lead.lastName[0]}
                        </div>
                        <Link to={`/leads/${lead.id}`}
                          style={{ fontWeight: 700, color: '#0f172a', textDecoration: 'none', fontSize: 14 }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#4f46e5')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#0f172a')}>
                          {lead.firstName} {lead.lastName}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell" style={{ color: '#64748b' }}>{lead.email}</td>
                    <td className="px-5 py-4"><LeadStatusBadge status={lead.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/leads/${lead.id}`} title="View" aria-label="View details"
                          style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textDecoration: 'none', transition: 'all .12s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#eff6ff'; (e.currentTarget as HTMLElement).style.color = '#4f46e5'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}>
                          <ArrowRight size={14} />
                        </Link>
                        {[
                          { icon: <Tag size={14} />,    fn: () => setStatusLead(lead),   label: 'Status', hb: '#f0fdf4', hc: '#16a34a' },
                          { icon: <Pencil size={14} />, fn: () => setEditLead(lead),     label: 'Edit',   hb: '#fefce8', hc: '#d97706' },
                          { icon: <Trash2 size={14} />, fn: () => setDeletingId(lead.id),label: 'Delete', hb: '#fff1f2', hc: '#e11d48' },
                        ].map(({ icon, fn, label, hb, hc }) => (
                          <button key={label} onClick={fn} title={label} aria-label={label}
                            style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', transition: 'all .12s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = hb; e.currentTarget.style.color = hc; }}
                            onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#94a3b8'; }}>
                            {icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card-3d">
          <EmptyState
            title={search ? 'No leads match your search' : 'No leads assigned to you'}
            description={search ? 'Try a different search term' : 'Ask your manager to assign leads, or create your own'}
            icon={<Users size={30} />}
            action={!search ? <Button onClick={() => setCreateOpen(true)}><Plus size={15} />Add a lead</Button> : undefined}
          />
        </div>
      )}

      <LeadFormModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      {editLead   && <LeadFormModal isOpen onClose={() => setEditLead(null)} lead={editLead} />}
      {statusLead && <UpdateStatusModal isOpen onClose={() => setStatusLead(null)} lead={statusLead} currentStatus={statusLead.status} />}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={async () => { if (deletingId) { await deleteLead.mutateAsync(deletingId); setDeletingId(null); } }}
        title="Delete Lead"
        message="Permanently delete this lead and all their activities? This cannot be undone."
        confirmLabel="Delete Lead"
        loading={deleteLead.isPending}
      />
    </div>
  );
}
