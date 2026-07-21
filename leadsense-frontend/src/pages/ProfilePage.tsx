import { useState } from 'react';
import { User2, Mail, Building2, Shield, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ProfilePage() {
  const { user, roles } = useAuth();
  const [firstName, setFirstName] = useState((user?.firstName as string) ?? '');
  const [lastName,  setLastName]  = useState((user?.lastName as string)  ?? '');
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // UI-only save demo
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const primaryRole = roles[0] ?? 'User';
  const initials = ((firstName?.[0] ?? '') + (lastName?.[0] ?? '')).toUpperCase() || (user?.email?.[0] ?? 'U').toUpperCase();

  return (
    <div className="p-8 max-w-2xl">
      <div className="page-header mb-8">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#60a5fa' }}>Account</p>
            <h1 className="text-3xl font-black text-white">Profile</h1>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>Manage your personal information</p>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.15)' }}>
            <User2 size={26} color="#93c5fd" />
          </div>
        </div>
      </div>

      {/* Avatar card */}
      <div className="card-3d p-6 mb-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0"
          style={{ background: 'linear-gradient(135deg,#4f46e5,#6366f1)', boxShadow: '0 4px 12px rgba(79,70,229,.3)' }}>
          {initials}
        </div>
        <div>
          <h2 className="text-xl font-black" style={{ color: '#0f172a' }}>
            {firstName || lastName ? `${firstName} ${lastName}`.trim() : user?.email}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Shield size={13} style={{ color: '#4f46e5' }} />
            <span className="text-xs font-bold rounded-full px-2.5 py-0.5"
              style={{ background: '#eff6ff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>
              {primaryRole}
            </span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card-3d p-6 mb-6">
        <h3 className="font-black text-base mb-5" style={{ color: '#0f172a' }}>Personal Information</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>First Name</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder="Jane" className="input-3d" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>Last Name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder="Smith" className="input-3d" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>Email</label>
            <input value={user?.email ?? ''} disabled className="input-3d" style={{ opacity: .6, cursor: 'not-allowed' }} />
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Email address cannot be changed here.</p>
          </div>
          <div className="flex items-center justify-between pt-2">
            <button type="submit" className="btn-3d btn-primary flex items-center gap-2">
              <Save size={15} /> {saved ? 'Saved!' : 'Save Changes'}
            </button>
            {saved && <span className="text-sm font-semibold" style={{ color: '#16a34a' }}>Changes saved successfully</span>}
          </div>
        </form>
      </div>

      {/* Company / role info */}
      <div className="card-3d p-6">
        <h3 className="font-black text-base mb-5" style={{ color: '#0f172a' }}>Company Details</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: '#f8fafc' }}>
            <Building2 size={16} style={{ color: '#4f46e5' }} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Tenant ID</p>
              <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                {user?.tenantId ?? '— (Platform account)'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: '#f8fafc' }}>
            <Mail size={16} style={{ color: '#4f46e5' }} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Email</p>
              <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: '#f8fafc' }}>
            <Shield size={16} style={{ color: '#4f46e5' }} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Assigned Roles</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {roles.map(r => (
                  <span key={r} className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{ background: '#eff6ff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>{r}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
