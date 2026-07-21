import { useState } from 'react';
import { ScrollText, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useAuditLogs } from '../hooks/useAuditLogs';

const ACTION_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  CREATE:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  UPDATE:  { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  DELETE:  { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' },
  LOGIN:   { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  INVITE:  { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' },
  ASSIGN:  { bg: '#f0f9ff', color: '#0891b2', border: '#bae6fd' },
  STATUS:  { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
};

function actionColor(action: string) {
  const key = action?.toUpperCase();
  return ACTION_COLORS[key] ?? { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
}

export function AuditLogsPage() {
  const { data: logs = [], isLoading } = useAuditLogs();
  const [search,       setSearch]       = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filtered = logs.filter(log => {
    const q = search.toLowerCase();
    const matchSearch =
      (log.performedByEmail ?? '').toLowerCase().includes(q) ||
      (log.details          ?? '').toLowerCase().includes(q) ||
      (log.entityType       ?? '').toLowerCase().includes(q) ||
      (log.action           ?? '').toLowerCase().includes(q);
    const matchAction =
      actionFilter === 'all' || log.action?.toUpperCase() === actionFilter;
    return matchSearch && matchAction;
  });

  const uniqueActions = [...new Set(logs.map(l => l.action?.toUpperCase()).filter(Boolean))];

  return (
    <div className="p-8">
      <div className="page-header mb-8">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#60a5fa' }}>Security</p>
            <h1 className="text-3xl font-black text-white">Audit Logs</h1>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>
              {isLoading ? 'Loading…' : `${logs.length} recorded action${logs.length !== 1 ? 's' : ''} in your workspace`}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.15)' }}>
            <ScrollText size={26} color="#93c5fd" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1" style={{ minWidth: 220 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search logs…" className="input-3d" style={{ paddingLeft: 38 }} />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: '#94a3b8' }} />
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
            className="input-3d" style={{ width: 'auto' }}>
            <option value="all">All Actions</option>
            {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="spin rounded-full"
            style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#4f46e5' }} />
        </div>
      ) : (
        <div className="card-3d overflow-hidden">
          <table className="w-full" style={{ fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#0f172a', borderBottom: '2px solid #1e293b' }}>
                {['Action', 'Entity', 'Performed By', 'Details', 'Time'].map(h => (
                  <th key={h} className="text-left px-5 py-4"
                    style={{ color: '#94a3b8', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => {
                const ac = actionColor(log.action);
                return (
                  <tr key={log.id} className="table-row-hover"
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <td className="px-5 py-4">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-black uppercase"
                        style={{ background: ac.bg, color: ac.color, border: `1px solid ${ac.border}` }}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: '#475569' }}>
                      {log.entityType}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: '#0f172a' }}>
                      {log.performedByEmail}
                    </td>
                    <td className="px-5 py-4 text-sm truncate max-w-xs" style={{ color: '#64748b' }}>
                      {log.details ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: '#94a3b8' }}>
                      {format(new Date(log.occurredAt), 'dd MMM · HH:mm')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-14 text-center">
              <ScrollText size={28} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
              <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>
                {logs.length === 0 ? 'No audit logs yet' : 'No logs match your filters'}
              </p>
            </div>
          )}
        </div>
      )}

      <p className="text-xs mt-4 text-center" style={{ color: '#94a3b8' }}>
        Showing all available audit log entries for your tenant.
      </p>
    </div>
  );
}
