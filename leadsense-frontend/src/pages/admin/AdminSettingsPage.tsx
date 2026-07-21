import { useState } from 'react';
import { Settings, Globe, Shield, Bell, Save } from 'lucide-react';

// Hoisted outside component to satisfy react-hooks/static-components rule
interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  description: string;
}
function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
      <div>
        <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{description}</p>
      </div>
      <button type="button" role="switch" aria-checked={checked} onClick={onChange}
        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
        style={{ background: checked ? '#d97706' : '#e2e8f0' }}>
        <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }} />
      </button>
    </div>
  );
}

export function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState('LeadSense');
  const [maxTenants,   setMaxTenants]   = useState('100');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [alertOnFailedLogins, setAlertOnFailedLogins] = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="page-header mb-8">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#fbbf24' }}>Platform</p>
            <h1 className="text-3xl font-black text-white">Platform Settings</h1>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>Global configuration for the entire system</p>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.15)' }}>
            <Settings size={26} color="#fbbf24" />
          </div>
        </div>
      </div>

      {/* Warning banner */}
      <div className="rounded-xl px-4 py-3 mb-6 flex items-center gap-3"
        style={{ background: '#fffbeb', border: '1.5px solid #fde68a' }}>
        <Shield size={15} color="#d97706" />
        <p className="text-sm font-semibold" style={{ color: '#92400e' }}>
          Changes here affect the entire platform. Apply with caution.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Platform identity */}
        <div className="card-3d p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe size={16} style={{ color: '#d97706' }} />
            <h2 className="font-black text-base" style={{ color: '#0f172a' }}>Platform Identity</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>
                Platform Name
              </label>
              <input value={platformName} onChange={e => setPlatformName(e.target.value)}
                className="input-3d" placeholder="LeadSense" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>
                Max Tenants Allowed
              </label>
              <input type="number" value={maxTenants} onChange={e => setMaxTenants(e.target.value)}
                className="input-3d" min="1" />
            </div>
          </div>
        </div>

        {/* System toggles */}
        <div className="card-3d p-6">
          <div className="flex items-center gap-2 mb-2">
            <Settings size={16} style={{ color: '#d97706' }} />
            <h2 className="font-black text-base" style={{ color: '#0f172a' }}>System Toggles</h2>
          </div>
          <Toggle
            checked={maintenanceMode}
            onChange={() => setMaintenanceMode(v => !v)}
            label="Maintenance Mode"
            description="Blocks all tenant logins and shows a maintenance page"
          />
          <div style={{ paddingBottom: 4 }} />
        </div>

        {/* Security alerts */}
        <div className="card-3d p-6">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={16} style={{ color: '#d97706' }} />
            <h2 className="font-black text-base" style={{ color: '#0f172a' }}>Security Alerts</h2>
          </div>
          <Toggle
            checked={alertOnFailedLogins}
            onChange={() => setAlertOnFailedLogins(v => !v)}
            label="Alert on Repeated Failed Logins"
            description="Log a high-severity audit event after 5 failed login attempts"
          />
          <div style={{ paddingBottom: 4 }} />
        </div>

        <div className="flex items-center justify-between">
          <button type="submit" className="btn-3d flex items-center gap-2"
            style={{ background: '#d97706', color: '#fff', border: 'none', boxShadow: '0 3px 0 #92400e' }}>
            <Save size={15} /> {saved ? 'Saved!' : 'Save Settings'}
          </button>
          {saved && <span className="text-sm font-semibold" style={{ color: '#16a34a' }}>Settings saved successfully</span>}
        </div>
      </form>
    </div>
  );
}
