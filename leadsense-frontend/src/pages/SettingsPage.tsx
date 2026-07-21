import { useState } from 'react';
import { Settings, Bell, Shield, Palette, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
        style={{ background: checked ? '#4f46e5' : '#e2e8f0' }}
      >
        <span
          className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

export function SettingsPage() {
  const { roles } = useAuth();
  const isTenantAdmin = roles.includes('TenantAdmin');

  const [notifications, setNotifications] = useState({
    overdueAlerts: true,
    newLeadAssigned: true,
    weeklyReport: false,
    activityReminders: true,
  });
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
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#60a5fa' }}>
              {isTenantAdmin ? 'Administration' : 'Preferences'}
            </p>
            <h1 className="text-3xl font-black text-white">Settings</h1>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>Configure your workspace preferences</p>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.15)' }}>
            <Settings size={26} color="#93c5fd" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Notifications */}
        <div className="card-3d p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell size={16} style={{ color: '#4f46e5' }} />
            <h2 className="font-black text-base" style={{ color: '#0f172a' }}>Notifications</h2>
          </div>
          <Toggle
            checked={notifications.overdueAlerts}
            onChange={() => setNotifications(n => ({ ...n, overdueAlerts: !n.overdueAlerts }))}
            label="Overdue Activity Alerts"
            description="Get notified when activities pass their scheduled date"
          />
          <Toggle
            checked={notifications.newLeadAssigned}
            onChange={() => setNotifications(n => ({ ...n, newLeadAssigned: !n.newLeadAssigned }))}
            label="New Lead Assigned"
            description="Notify when a lead is assigned to you"
          />
          <Toggle
            checked={notifications.activityReminders}
            onChange={() => setNotifications(n => ({ ...n, activityReminders: !n.activityReminders }))}
            label="Activity Reminders"
            description="Reminders 30 minutes before scheduled activities"
          />
          <Toggle
            checked={notifications.weeklyReport}
            onChange={() => setNotifications(n => ({ ...n, weeklyReport: !n.weeklyReport }))}
            label="Weekly Summary Report"
            description="Receive a weekly digest of your pipeline performance"
          />
        </div>

        {/* Security */}
        <div className="card-3d p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={16} style={{ color: '#4f46e5' }} />
            <h2 className="font-black text-base" style={{ color: '#0f172a' }}>Security</h2>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p className="text-sm font-bold mb-1" style={{ color: '#0f172a' }}>Change Password</p>
              <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>Use a strong, unique password for your account</p>
              <button type="button" className="btn-3d btn-beige btn-sm">Change Password</button>
            </div>
            {isTenantAdmin && (
              <div className="p-4 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p className="text-sm font-bold mb-1" style={{ color: '#0f172a' }}>Session Management</p>
                <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>Manage active sessions across devices</p>
                <button type="button" className="btn-3d btn-beige btn-sm">View Active Sessions</button>
              </div>
            )}
          </div>
        </div>

        {/* Appearance */}
        <div className="card-3d p-6">
          <div className="flex items-center gap-2 mb-5">
            <Palette size={16} style={{ color: '#4f46e5' }} />
            <h2 className="font-black text-base" style={{ color: '#0f172a' }}>Appearance</h2>
          </div>
          <div className="flex gap-3">
            {(['Light', 'System'] as const).map(theme => (
              <button key={theme} type="button"
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                style={theme === 'Light'
                  ? { background: '#4f46e5', color: '#fff', border: '2px solid #4f46e5' }
                  : { background: '#f8fafc', color: '#64748b', border: '2px solid #e2e8f0' }}>
                {theme}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button type="submit" className="btn-3d btn-primary flex items-center gap-2">
            <Save size={15} /> {saved ? 'Saved!' : 'Save Settings'}
          </button>
          {saved && <span className="text-sm font-semibold" style={{ color: '#16a34a' }}>Settings saved</span>}
        </div>
      </form>
    </div>
  );
}
