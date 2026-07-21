import { useState } from 'react';
import { Mail, Plus, Send, Clock, CheckCircle, X } from 'lucide-react';

interface MockInvite {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired';
  sentAt: string;
}

const MOCK_INVITES: MockInvite[] = [
  { id: '1', email: 'alice@acme.com',   role: 'User',        status: 'pending',  sentAt: '2026-06-20T10:00:00Z' },
  { id: '2', email: 'bob@acme.com',     role: 'TenantAdmin', status: 'accepted', sentAt: '2026-06-18T14:30:00Z' },
  { id: '3', email: 'carol@acme.com',   role: 'User',        status: 'expired',  sentAt: '2026-06-10T09:00:00Z' },
];

function StatusBadge({ status }: { status: MockInvite['status'] }) {
  const styles = {
    pending:  { bg: '#fffbeb', color: '#d97706', border: '#fde68a', icon: <Clock size={10} /> },
    accepted: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', icon: <CheckCircle size={10} /> },
    expired:  { bg: '#f8fafc', color: '#94a3b8', border: '#e2e8f0', icon: <X size={10} /> },
  }[status];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold capitalize"
      style={{ background: styles.bg, color: styles.color, border: `1px solid ${styles.border}` }}>
      {styles.icon}{status}
    </span>
  );
}

function SendInviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('User');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 800));
    setSending(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.5)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,.2)' }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <h2 className="font-black text-base" style={{ color: '#0f172a' }}>Send Invitation</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="colleague@company.com" className="input-3d" required autoFocus />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="input-3d">
              <option value="TenantAdmin">Tenant Admin</option>
              <option value="User">User (Sales)</option>
            </select>
          </div>
          <div className="rounded-xl p-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p className="text-xs" style={{ color: '#64748b' }}>
              An invitation email will be sent. The link expires in <strong>7 days</strong>.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-3d btn-beige btn-sm">Cancel</button>
            <button type="submit" disabled={sending} className="btn-3d btn-primary btn-sm flex items-center gap-1.5">
              {sending ? 'Sending…' : <><Send size={13} /> Send Invite</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function InvitationsPage() {
  const [invites] = useState<MockInvite[]>(MOCK_INVITES);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-8">
      <div className="page-header mb-8">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#60a5fa' }}>Team</p>
            <h1 className="text-3xl font-black text-white">Invitations</h1>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>Invite team members to join your workspace</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-3d btn-primary flex items-center gap-2">
            <Plus size={16} /> Send Invite
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {([
          { label: 'Pending',  value: invites.filter(i => i.status === 'pending').length,  color: '#d97706', bg: '#fffbeb' },
          { label: 'Accepted', value: invites.filter(i => i.status === 'accepted').length, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Expired',  value: invites.filter(i => i.status === 'expired').length,  color: '#94a3b8', bg: '#f8fafc' },
        ]).map(s => (
          <div key={s.label} className="card-3d p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
              <Mail size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-black" style={{ color: '#0f172a' }}>{s.value}</p>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card-3d overflow-hidden">
        <table className="w-full" style={{ fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: '#0f172a', borderBottom: '2px solid #1e293b' }}>
              {['Email', 'Role', 'Status', 'Sent'].map(h => (
                <th key={h} className="text-left px-5 py-4"
                  style={{ color: '#94a3b8', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invites.map((inv, i) => (
              <tr key={inv.id} className="table-row-hover" style={{ borderBottom: i < invites.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Mail size={14} style={{ color: '#94a3b8' }} />
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{inv.email}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{ background: inv.role === 'TenantAdmin' ? '#eff6ff' : '#f0fdf4', color: inv.role === 'TenantAdmin' ? '#2563eb' : '#16a34a', border: `1px solid ${inv.role === 'TenantAdmin' ? '#bfdbfe' : '#bbf7d0'}` }}>
                    {inv.role}
                  </span>
                </td>
                <td className="px-5 py-4"><StatusBadge status={inv.status} /></td>
                <td className="px-5 py-4" style={{ color: '#64748b', fontSize: 12 }}>
                  {new Date(inv.sentAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && <SendInviteModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
