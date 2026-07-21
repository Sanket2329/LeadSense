import { CheckCircle, Clock, XCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import { useActivityStats } from '../hooks/useActivities';

interface StatBlockProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  accent: string;
  barColor: string;
  total: number;
}

function StatBlock({ label, value, icon, gradient, accent, barColor, total }: StatBlockProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: gradient,
        boxShadow: `0 4px 0 ${accent}, 0 12px 32px rgba(0,0,0,.3)`,
        transition: 'transform .15s, box-shadow .15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = '';
      }}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,.06)' }} />
      <div className="relative flex items-center justify-between mb-5">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,.15)' }}>
          {icon}
        </div>
        <span
          className="rounded-full px-3 py-1"
          style={{ fontSize: 13, fontWeight: 900, background: 'rgba(255,255,255,.15)', color: '#fff' }}
        >
          {pct}%
        </span>
      </div>
      <p className="text-4xl font-black text-white mb-1">{value}</p>
      <p className="text-sm font-semibold mb-4" style={{ color: 'rgba(255,255,255,.65)' }}>{label}</p>
      <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,.2)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

export function StatsPage() {
  const { data: stats, isLoading } = useActivityStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spin rounded-full" style={{ width: 36, height: 36, border: '3px solid #e2d9cc', borderTopColor: '#2563eb' }} />
      </div>
    );
  }

  const total = (stats?.pending ?? 0) + (stats?.completed ?? 0) + (stats?.cancelled ?? 0);

  const cards = [
    { label: 'Pending', value: stats?.pending ?? 0, icon: <Clock size={22} color="#fff" />, gradient: 'linear-gradient(135deg,#78350f,#d97706)', accent: '#92400e', barColor: '#fde68a' },
    { label: 'Completed', value: stats?.completed ?? 0, icon: <CheckCircle size={22} color="#fff" />, gradient: 'linear-gradient(135deg,#064e3b,#059669)', accent: '#065f46', barColor: '#6ee7b7' },
    { label: 'Cancelled', value: stats?.cancelled ?? 0, icon: <XCircle size={22} color="#fff" />, gradient: 'linear-gradient(135deg,#881337,#e11d48)', accent: '#9f1239', barColor: '#fda4af' },
    { label: 'Overdue', value: stats?.overdue ?? 0, icon: <AlertTriangle size={22} color="#fff" />, gradient: 'linear-gradient(135deg,#431407,#ea580c)', accent: '#7c2d12', barColor: '#fdba74' },
  ];

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="page-header mb-8">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#60a5fa' }}>Analytics</p>
            <h1 className="text-3xl font-black text-white">Activity Statistics</h1>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>
              {total} total activities tracked across all leads
            </p>
          </div>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.15)' }}
          >
            <BarChart3 size={26} color="#93c5fd" />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((c) => <StatBlock key={c.label} {...c} total={total} />)}
      </div>

      {/* Distribution bar */}
      {total > 0 && (
        <div
          className="rounded-2xl p-6"
          style={{ background: '#fff', border: '1.5px solid #e2d9cc', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#2563eb,#1e3a8a)' }} />
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0a0a0f' }}>Overall Distribution</h2>
          </div>

          {/* Stacked bar */}
          <div className="flex h-6 rounded-xl overflow-hidden gap-0.5 mb-4" style={{ background: '#f5f0e8' }}>
            {cards.map((c) => {
              const pct = total > 0 ? (c.value / total) * 100 : 0;
              return pct > 0 ? (
                <div
                  key={c.label}
                  className="h-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: c.gradient }}
                  title={`${c.label}: ${c.value}`}
                />
              ) : null;
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-5">
            {cards.map((c) => {
              const pct = total > 0 ? Math.round((c.value / total) * 100) : 0;
              return (
                <div key={c.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ background: c.gradient }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#44403c' }}>{c.label}</span>
                  <span style={{ fontSize: 12, color: '#a8a29e', fontWeight: 600 }}>({c.value} · {pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {total === 0 && (
        <div
          className="rounded-2xl p-14 text-center"
          style={{ background: '#fff', border: '1.5px solid #e2d9cc', boxShadow: 'var(--shadow-card)' }}
        >
          <p style={{ fontSize: 14, color: '#a8a29e', fontWeight: 600 }}>
            No activity data yet. Start logging activities on your leads.
          </p>
        </div>
      )}
    </div>
  );
}
