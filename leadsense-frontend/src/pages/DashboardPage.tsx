import { Link } from 'react-router-dom';
import {
  Users, Clock, CheckCircle, AlertTriangle,
  ArrowRight, TrendingUp, Target, Zap,
  UserCheck, CalendarDays, PhoneCall, Star,
} from 'lucide-react';
import { useActivityStats, useOverdueActivities } from '../hooks/useActivities';
import { useLeads, useMyLeads } from '../hooks/useLeads';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import {
  ActivityTypeLabels, LeadStatus, LeadStatusLabels,
  LeadSource, LeadSourceLabels,
} from '../types';

// ─── Stat card ───────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
  accent: string;
  linkTo?: string;
}
function StatCard({ label, value, icon, gradient, accent, linkTo }: StatCardProps) {
  const inner = (
    <div
      className="relative overflow-hidden rounded-2xl p-5 cursor-pointer"
      style={{
        background: gradient,
        boxShadow: `0 4px 0 ${accent}, 0 8px 32px rgba(0,0,0,.35)`,
        transition: 'transform .15s, box-shadow .15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          `0 6px 0 ${accent}, 0 16px 40px rgba(0,0,0,.4)`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = '';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          `0 4px 0 ${accent}, 0 8px 32px rgba(0,0,0,.35)`;
      }}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full"
        style={{ background: 'rgba(255,255,255,.06)' }} />
      <div className="relative flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,.15)' }}>
          {icon}
        </div>
        {linkTo && <ArrowRight size={15} style={{ color: 'rgba(255,255,255,.4)' }} className="mt-1" />}
      </div>
      <p className="text-3xl font-black text-white mb-0.5">{value}</p>
      <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,.65)' }}>{label}</p>
    </div>
  );
  return linkTo ? <Link to={linkTo} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
}

// ─── SVG Donut chart ─────────────────────────────────────────────────────────
interface DonutSlice { value: number; color: string; label: string }
function DonutChart({ slices, size = 140 }: { slices: DonutSlice[]; size?: number }) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="35" fill="none" stroke="#f1f5f9" strokeWidth="20" />
        <text x="50" y="55" textAnchor="middle"
          style={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}>
          No data
        </text>
      </svg>
    );
  }
  const r = 35;
  const cx = 50; const cy = 50;
  const circumference = 2 * Math.PI * r;
  // Compute cumulative offsets without mutation
  const sliceOffsets = slices.reduce<number[]>((acc, item) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
    return [...acc, prev + (item.value / total) * circumference];
  }, []);

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
      {slices.map((s, i) => {
        const pct = s.value / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const currentOffset = i === 0 ? 0 : sliceOffsets[i - 1];
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="20"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-currentOffset}
          />
        );
      })}
      <circle cx={cx} cy={cy} r="25" fill="#fff" />
    </svg>
  );
}

// ─── Horizontal bar (pipeline / source) ──────────────────────────────────────
interface BarRowProps { label: string; value: number; total: number; color: string; }
function BarRow({ label, value, total, color }: BarRowProps) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="flex justify-between items-center mb-1">
        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#44403c' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#0a0a0f' }}>{value}</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: '#f1f5f9' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── TenantAdmin Dashboard ────────────────────────────────────────────────────
function TenantAdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useActivityStats();
  const { data: leads } = useLeads();
  const { data: overdue } = useOverdueActivities();

  const totalLeads      = leads?.length ?? 0;
  const qualifiedLeads  = leads?.filter(l => l.status === LeadStatus.Qualified).length ?? 0;
  const wonLeads        = leads?.filter(l => l.status === LeadStatus.Won).length ?? 0;
  const lostLeads       = leads?.filter(l => l.status === LeadStatus.Lost).length ?? 0;

  const statusCounts = (Object.entries(LeadStatus) as [string, number][]).map(([, val]) => ({
    label: LeadStatusLabels[val as keyof typeof LeadStatusLabels],
    value: leads?.filter(l => l.status === val).length ?? 0,
    status: val,
  }));

  const pipelineColors: Record<number, string> = {
    [LeadStatus.New]: '#3b82f6', [LeadStatus.Contacted]: '#8b5cf6',
    [LeadStatus.Qualified]: '#06b6d4', [LeadStatus.ProposalSent]: '#f59e0b',
    [LeadStatus.Won]: '#10b981', [LeadStatus.Lost]: '#ef4444',
  };

  const sourceCounts = (Object.entries(LeadSource) as [string, number][]).map(([, val]) => ({
    label: LeadSourceLabels[val as keyof typeof LeadSourceLabels],
    value: leads?.filter(l => l.source === val).length ?? 0,
  })).filter(s => s.value > 0);

  const activitySlices: DonutSlice[] = [
    { value: stats?.pending   ?? 0, color: '#f59e0b', label: 'Pending' },
    { value: stats?.completed ?? 0, color: '#10b981', label: 'Completed' },
    { value: stats?.cancelled ?? 0, color: '#ef4444', label: 'Cancelled' },
    { value: stats?.overdue   ?? 0, color: '#f97316', label: 'Overdue' },
  ];
  const totalActivities = activitySlices.reduce((s, d) => s + d.value, 0);

  const statCards = [
    { label: 'Total Leads',        value: totalLeads,           icon: <Users size={20} color="#fff" />,         gradient: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)', accent: '#1d4ed8',  linkTo: '/leads' },
    { label: 'Qualified Leads',    value: qualifiedLeads,       icon: <Star size={20} color="#fff" />,          gradient: 'linear-gradient(135deg,#134e4a 0%,#0d9488 100%)', accent: '#0f766e',  linkTo: '/leads' },
    { label: 'Won Leads',          value: wonLeads,             icon: <CheckCircle size={20} color="#fff" />,   gradient: 'linear-gradient(135deg,#064e3b 0%,#059669 100%)', accent: '#047857',  linkTo: '/leads' },
    { label: 'Lost Leads',         value: lostLeads,            icon: <AlertTriangle size={20} color="#fff" />, gradient: 'linear-gradient(135deg,#881337 0%,#e11d48 100%)', accent: '#9f1239',  linkTo: '/leads' },
    { label: 'Overdue Activities', value: statsLoading ? '—' : (stats?.overdue ?? 0),   icon: <Clock size={20} color="#fff" />,         gradient: 'linear-gradient(135deg,#431407 0%,#ea580c 100%)', accent: '#c2410c', linkTo: '/overdue' },
    { label: 'Pending Activities', value: statsLoading ? '—' : (stats?.pending ?? 0),   icon: <Zap size={20} color="#fff" />,           gradient: 'linear-gradient(135deg,#78350f 0%,#d97706 100%)', accent: '#b45309', linkTo: '/stats' },
    { label: 'Active Users',       value: '—',                  icon: <UserCheck size={20} color="#fff" />,     gradient: 'linear-gradient(135deg,#4c1d95 0%,#7c3aed 100%)', accent: '#6d28d9',  linkTo: '/users' },
  ];

  return (
    <div className="p-8">
      <div className="page-header mb-8">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#60a5fa' }}>Overview</p>
            <h1 className="text-3xl font-black text-white">Dashboard</h1>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>Company pipeline at a glance</p>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.15)' }}>
            <TrendingUp size={26} color="#93c5fd" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.slice(0, 4).map(c => <StatCard key={c.label} {...c} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {statCards.slice(4).map(c => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card-3d p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#2563eb,#1e3a8a)' }} />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0a0a0f' }}>Pipeline by Status</h2>
            <span className="ml-auto rounded-full px-2.5 py-0.5"
              style={{ fontSize: 11, fontWeight: 800, background: '#0a0a0f', color: '#fff' }}>
              {totalLeads} leads
            </span>
          </div>
          {statusCounts.map(s => (
            <BarRow key={s.status} label={s.label} value={s.value} total={totalLeads} color={pipelineColors[s.status]} />
          ))}
          {totalLeads === 0 && <p style={{ fontSize: 13, color: '#a8a29e', textAlign: 'center', padding: '24px 0' }}>No leads yet</p>}
        </div>

        <div className="card-3d p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#f59e0b,#78350f)' }} />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0a0a0f' }}>Activities</h2>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <DonutChart slices={activitySlices} size={148} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span style={{ fontSize: 22, fontWeight: 900, color: '#0a0a0f' }}>{totalActivities}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Total</span>
              </div>
            </div>
            <div className="w-full space-y-1.5">
              {activitySlices.map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#44403c' }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#0a0a0f' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-3d p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#7c3aed,#4c1d95)' }} />
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0a0a0f' }}>Lead Sources</h2>
            <Target size={14} style={{ color: '#a78bfa', marginLeft: 'auto' }} />
          </div>
          {sourceCounts.length > 0 ? sourceCounts.map((s, i) => {
            const colors = ['#6366f1','#8b5cf6','#a78bfa','#7c3aed','#4c1d95','#ddd6fe','#c4b5fd'];
            return <BarRow key={s.label} label={s.label} value={s.value} total={totalLeads} color={colors[i % colors.length]} />;
          }) : <p style={{ fontSize: 13, color: '#a8a29e', textAlign: 'center', padding: '24px 0' }}>No data yet</p>}
        </div>

        <div className="card-3d overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1.5px solid #e2e8f0' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 rounded-full" style={{ background: 'linear-gradient(180deg,#2563eb,#1e3a8a)' }} />
              <h2 style={{ fontSize: 13, fontWeight: 800, color: '#0a0a0f' }}>Recent Leads</h2>
            </div>
            <Link to="/leads" className="flex items-center gap-1" style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {leads && leads.length > 0 ? leads.slice(0, 4).map((lead, i) => (
            <Link key={lead.id} to={`/leads/${lead.id}`} className="flex items-center gap-3 px-5 py-3 table-row-hover"
              style={{ textDecoration: 'none', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: '#fff' }}>
                {lead.firstName[0]}{lead.lastName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0f' }} className="truncate">{lead.firstName} {lead.lastName}</p>
                <p style={{ fontSize: 11.5, color: '#78716c' }} className="truncate">{lead.email}</p>
              </div>
              <ArrowRight size={13} style={{ color: '#d4c9b8', flexShrink: 0 }} />
            </Link>
          )) : <p className="px-5 py-8 text-center" style={{ fontSize: 13, color: '#a8a29e' }}>No leads yet</p>}

          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1.5px solid #e2e8f0', borderBottom: '1.5px solid #e2e8f0' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 rounded-full" style={{ background: 'linear-gradient(180deg,#e11d48,#881337)' }} />
              <h2 style={{ fontSize: 13, fontWeight: 800, color: '#0a0a0f' }}>Overdue</h2>
              {overdue && overdue.length > 0 && (
                <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 800, background: '#fce7f3', color: '#9d174d' }}>{overdue.length}</span>
              )}
            </div>
            <Link to="/overdue" className="flex items-center gap-1" style={{ fontSize: 11, fontWeight: 700, color: '#e11d48', textDecoration: 'none' }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {overdue && overdue.length > 0 ? overdue.slice(0, 3).map((act, i) => (
            <div key={act.id} className="px-5 py-3" style={{ borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
              <div className="flex items-center justify-between">
                <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 800, background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', textTransform: 'uppercase' }}>
                  {ActivityTypeLabels[act.type]}
                </span>
                {act.scheduledFor && <span style={{ fontSize: 11, color: '#a8a29e', fontWeight: 600 }}>{format(new Date(act.scheduledFor), 'dd MMM')}</span>}
              </div>
              <p style={{ fontSize: 12, color: '#44403c', marginTop: 2 }} className="truncate">{act.notes}</p>
            </div>
          )) : <p className="px-5 py-6 text-center" style={{ fontSize: 13, color: '#a8a29e' }}><Zap size={14} style={{ display: 'inline', marginRight: 4 }} />No overdue activities</p>}
        </div>
      </div>
    </div>
  );
}

// ─── User (Sales Executive) Dashboard ────────────────────────────────────────
function UserDashboard() {
  const { data: stats, isLoading: statsLoading } = useActivityStats();
  const { data: myLeads } = useMyLeads();
  const { data: overdue } = useOverdueActivities();

  const totalMyLeads = myLeads?.length ?? 0;
  const wonLeads     = myLeads?.filter(l => l.status === LeadStatus.Won).length ?? 0;

  const statCards = [
    { label: 'My Leads',           value: totalMyLeads,                            icon: <Users size={20} color="#fff" />,         gradient: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)', accent: '#1d4ed8',  linkTo: '/my-leads' },
    { label: "Today's Tasks",      value: statsLoading ? '—' : (stats?.pending ?? 0),     icon: <Zap size={20} color="#fff" />,           gradient: 'linear-gradient(135deg,#78350f 0%,#d97706 100%)', accent: '#b45309' },
    { label: 'Overdue Activities', value: statsLoading ? '—' : (stats?.overdue ?? 0),     icon: <AlertTriangle size={20} color="#fff" />, gradient: 'linear-gradient(135deg,#881337 0%,#e11d48 100%)', accent: '#9f1239',  linkTo: '/overdue' },
    { label: 'Won Leads',          value: wonLeads,                                icon: <CheckCircle size={20} color="#fff" />,   gradient: 'linear-gradient(135deg,#064e3b 0%,#059669 100%)', accent: '#047857',  linkTo: '/my-leads' },
    { label: 'Pending Calls',      value: '—',                                     icon: <PhoneCall size={20} color="#fff" />,     gradient: 'linear-gradient(135deg,#134e4a 0%,#0d9488 100%)', accent: '#0f766e' },
    { label: 'Upcoming Meetings',  value: '—',                                     icon: <CalendarDays size={20} color="#fff" />,  gradient: 'linear-gradient(135deg,#4c1d95 0%,#7c3aed 100%)', accent: '#6d28d9',  linkTo: '/calendar' },
  ];

  return (
    <div className="p-8">
      <div className="page-header mb-8">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#60a5fa' }}>My Workspace</p>
            <h1 className="text-3xl font-black text-white">Dashboard</h1>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>Your personal sales overview</p>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.15)' }}>
            <TrendingUp size={26} color="#93c5fd" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-3d overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1.5px solid #e2e8f0' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 rounded-full" style={{ background: 'linear-gradient(180deg,#2563eb,#1e3a8a)' }} />
              <h2 style={{ fontSize: 13, fontWeight: 800, color: '#0a0a0f' }}>My Recent Leads</h2>
            </div>
            <Link to="/my-leads" className="flex items-center gap-1" style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {myLeads && myLeads.length > 0 ? myLeads.slice(0, 5).map((lead, i) => (
            <Link key={lead.id} to={`/leads/${lead.id}`} className="flex items-center gap-3 px-5 py-3 table-row-hover"
              style={{ textDecoration: 'none', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: '#fff' }}>
                {lead.firstName[0]}{lead.lastName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0f' }} className="truncate">{lead.firstName} {lead.lastName}</p>
                <p style={{ fontSize: 11.5, color: '#78716c' }} className="truncate">{lead.email}</p>
              </div>
              <ArrowRight size={13} style={{ color: '#d4c9b8', flexShrink: 0 }} />
            </Link>
          )) : <p className="px-5 py-8 text-center" style={{ fontSize: 13, color: '#a8a29e' }}>No leads assigned yet</p>}
        </div>

        <div className="card-3d overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1.5px solid #e2e8f0' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 rounded-full" style={{ background: 'linear-gradient(180deg,#e11d48,#881337)' }} />
              <h2 style={{ fontSize: 13, fontWeight: 800, color: '#0a0a0f' }}>Overdue Activities</h2>
              {overdue && overdue.length > 0 && (
                <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 800, background: '#fce7f3', color: '#9d174d' }}>{overdue.length}</span>
              )}
            </div>
            <Link to="/overdue" className="flex items-center gap-1" style={{ fontSize: 11, fontWeight: 700, color: '#e11d48', textDecoration: 'none' }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {overdue && overdue.length > 0 ? overdue.slice(0, 5).map((act, i) => (
            <div key={act.id} className="px-5 py-3" style={{ borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
              <div className="flex items-center justify-between">
                <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10, fontWeight: 800, background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', textTransform: 'uppercase' }}>
                  {ActivityTypeLabels[act.type]}
                </span>
                {act.scheduledFor && <span style={{ fontSize: 11, color: '#a8a29e', fontWeight: 600 }}>{format(new Date(act.scheduledFor), 'dd MMM')}</span>}
              </div>
              <p style={{ fontSize: 12, color: '#44403c', marginTop: 2 }} className="truncate">{act.notes}</p>
            </div>
          )) : <p className="px-5 py-8 text-center" style={{ fontSize: 13, color: '#a8a29e' }}><Zap size={14} style={{ display: 'inline', marginRight: 4 }} />No overdue activities</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Main exported page: renders by role ────────────────────────────────────
export function DashboardPage() {
  const { roles } = useAuth();
  const isTenantAdmin = roles.includes('TenantAdmin');
  return isTenantAdmin ? <TenantAdminDashboard /> : <UserDashboard />;
}
