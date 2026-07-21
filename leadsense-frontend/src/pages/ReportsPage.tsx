import { BarChart3, TrendingUp, Target, PieChart } from 'lucide-react';
import { useLeads } from '../hooks/useLeads';
import { useActivityStats } from '../hooks/useActivities';
import { LeadStatus, LeadStatusLabels, LeadSource, LeadSourceLabels } from '../types';

interface BarRowProps { label: string; value: number; total: number; color: string; }
function BarRow({ label, value, total, color }: BarRowProps) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="flex justify-between items-center mb-1.5">
        <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{label}</span>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>{value}</span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>({pct.toFixed(0)}%)</span>
        </div>
      </div>
      <div className="h-3 rounded-full" style={{ background: '#f1f5f9' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export function ReportsPage() {
  const { data: leads = [] } = useLeads();
  const { data: stats } = useActivityStats();

  const totalLeads = leads.length;

  const statusData = (Object.entries(LeadStatus) as [string, number][]).map(([, val]) => ({
    label: LeadStatusLabels[val as keyof typeof LeadStatusLabels],
    value: leads.filter(l => l.status === val).length,
    color: [
      '#3b82f6','#8b5cf6','#06b6d4','#f59e0b','#10b981','#ef4444'
    ][(val as number) - 1] ?? '#94a3b8',
  })).filter(s => s.value > 0);

  const sourceData = (Object.entries(LeadSource) as [string, number][]).map(([, val]) => ({
    label: LeadSourceLabels[val as keyof typeof LeadSourceLabels],
    value: leads.filter(l => l.source === val).length,
    color: ['#6366f1','#8b5cf6','#a78bfa','#7c3aed','#4c1d95','#c4b5fd','#ddd6fe'][(val as number) - 1] ?? '#94a3b8',
  })).filter(s => s.value > 0);

  const conversionRate = totalLeads > 0
    ? ((leads.filter(l => l.status === LeadStatus.Won).length / totalLeads) * 100).toFixed(1)
    : '0.0';

  const kpis = [
    { label: 'Total Leads',   value: totalLeads,                                    color: '#4f46e5', icon: <Target size={20} color="#fff" />,   bg: 'linear-gradient(135deg,#312e81,#4f46e5)' },
    { label: 'Win Rate',      value: `${conversionRate}%`,                          color: '#10b981', icon: <TrendingUp size={20} color="#fff" />, bg: 'linear-gradient(135deg,#064e3b,#059669)' },
    { label: 'Pending Acts',  value: stats?.pending ?? 0,                           color: '#d97706', icon: <BarChart3 size={20} color="#fff" />,  bg: 'linear-gradient(135deg,#78350f,#d97706)' },
    { label: 'Completed Acts',value: stats?.completed ?? 0,                         color: '#3b82f6', icon: <PieChart size={20} color="#fff" />,   bg: 'linear-gradient(135deg,#1e3a8a,#2563eb)' },
  ];

  return (
    <div className="p-8">
      <div className="page-header mb-8">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#60a5fa' }}>Analytics</p>
            <h1 className="text-3xl font-black text-white">Reports</h1>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>Sales performance and pipeline insights</p>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.15)' }}>
            <BarChart3 size={26} color="#93c5fd" />
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(k => (
          <div key={k.label} className="relative overflow-hidden rounded-2xl p-5"
            style={{ background: k.bg, boxShadow: '0 4px 20px rgba(0,0,0,.15)' }}>
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,.06)' }} />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'rgba(255,255,255,.2)' }}>
              {k.icon}
            </div>
            <p className="text-3xl font-black text-white mb-0.5">{k.value}</p>
            <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,.7)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pipeline by status */}
        <div className="card-3d p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#4f46e5,#312e81)' }} />
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Pipeline by Status</h2>
          </div>
          {statusData.length > 0
            ? statusData.map(s => <BarRow key={s.label} label={s.label} value={s.value} total={totalLeads} color={s.color} />)
            : <p className="text-center py-8 text-sm" style={{ color: '#94a3b8' }}>No data yet</p>}
        </div>

        {/* Leads by source */}
        <div className="card-3d p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#7c3aed,#4c1d95)' }} />
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Leads by Source</h2>
          </div>
          {sourceData.length > 0
            ? sourceData.map(s => <BarRow key={s.label} label={s.label} value={s.value} total={totalLeads} color={s.color} />)
            : <p className="text-center py-8 text-sm" style={{ color: '#94a3b8' }}>No data yet</p>}
        </div>
      </div>

      {/* Activity breakdown */}
      {stats && (
        <div className="card-3d p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#0891b2,#0e7490)' }} />
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Activity Breakdown</h2>
          </div>
          <div className="flex h-8 rounded-xl overflow-hidden gap-0.5" style={{ background: '#f1f5f9' }}>
            {[
              { label: 'Pending',   value: stats.pending,   color: '#f59e0b' },
              { label: 'Completed', value: stats.completed, color: '#10b981' },
              { label: 'Cancelled', value: stats.cancelled, color: '#ef4444' },
              { label: 'Overdue',   value: stats.overdue,   color: '#f97316' },
            ].map(s => {
              const total = stats.pending + stats.completed + stats.cancelled + stats.overdue;
              const pct = total > 0 ? (s.value / total) * 100 : 0;
              return pct > 0 ? (
                <div key={s.label} className="h-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: s.color }} title={`${s.label}: ${s.value}`} />
              ) : null;
            })}
          </div>
          <div className="flex flex-wrap gap-5 mt-4">
            {[
              { label: 'Pending',   value: stats.pending,   color: '#f59e0b' },
              { label: 'Completed', value: stats.completed, color: '#10b981' },
              { label: 'Cancelled', value: stats.cancelled, color: '#ef4444' },
              { label: 'Overdue',   value: stats.overdue,   color: '#f97316' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: s.color }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{s.label}</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
