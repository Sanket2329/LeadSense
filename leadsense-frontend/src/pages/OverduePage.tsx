import { useState } from 'react';
import { format } from 'date-fns';
import { AlertTriangle, Clock } from 'lucide-react';
import { useOverdueActivities } from '../hooks/useActivities';
import { ActivityTypeLabels } from '../types';
import { EmptyState } from '../components/ui/EmptyState';

export function OverduePage() {
  const { data: overdue, isLoading } = useOverdueActivities();
  // useState initializer runs once before render — accepted by react-hooks/purity
  const [now] = useState<number>(() => Date.now());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spin rounded-full" style={{ width: 36, height: 36, border: '3px solid #e2d9cc', borderTopColor: '#e11d48' }} />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page header */}
      <div
        className="relative overflow-hidden rounded-2xl p-7 mb-8"
        style={{
          background: 'linear-gradient(110deg,#4c0519 0%,#881337 50%,#e11d48 100%)',
          boxShadow: '0 4px 0 #4c0519, 0 16px 48px rgba(76,5,25,.5)',
        }}
      >
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,.05)' }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#fda4af' }}>Urgent</p>
            <h1 className="text-3xl font-black text-white">Overdue Activities</h1>
            <p className="mt-1 text-sm" style={{ color: '#fecdd3' }}>
              {overdue?.length ?? 0} activities need immediate attention
            </p>
          </div>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,.12)', border: '1.5px solid rgba(255,255,255,.2)' }}
          >
            <AlertTriangle size={26} color="#fda4af" />
          </div>
        </div>
      </div>

      {overdue && overdue.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {overdue.map((activity) => {
            const hoursOverdue = activity.scheduledFor
              ? Math.round((now - new Date(activity.scheduledFor).getTime()) / (1000 * 60 * 60))
              : 0;
            const daysOverdue = Math.floor(hoursOverdue / 24);

            return (
              <div
                key={activity.id}
                className="relative overflow-hidden rounded-2xl p-5"
                style={{
                  background: '#fff',
                  border: '1.5px solid #fecdd3',
                  boxShadow: '0 3px 0 #fca5a5, 0 8px 24px rgba(225,29,72,.1)',
                  transition: 'transform .15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = '')}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: 'linear-gradient(180deg,#e11d48,#881337)' }} />
                <div className="pl-3 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className="rounded-full px-3 py-1"
                        style={{ fontSize: 11, fontWeight: 800, background: '#fff1f2', color: '#e11d48', border: '1.5px solid #fecdd3', textTransform: 'uppercase', letterSpacing: '.04em' }}
                      >
                        {ActivityTypeLabels[activity.type]}
                      </span>
                      <span
                        className="flex items-center gap-1 rounded-full px-3 py-1"
                        style={{ fontSize: 11, fontWeight: 800, background: '#0a0a0f', color: '#fff' }}
                      >
                        <Clock size={10} />
                        {daysOverdue > 0 ? `${daysOverdue}d overdue` : `${hoursOverdue}h overdue`}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: '#1c1917', lineHeight: 1.6 }}>{activity.notes}</p>
                  </div>
                  {activity.scheduledFor && (
                    <div
                      className="text-right shrink-0 rounded-xl px-3 py-2"
                      style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}
                    >
                      <p style={{ fontSize: 11, color: '#9f1239', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>Due</p>
                      <p style={{ fontSize: 15, fontWeight: 800, color: '#e11d48' }}>
                        {format(new Date(activity.scheduledFor), 'dd MMM')}
                      </p>
                      <p style={{ fontSize: 11, color: '#fb7185', fontWeight: 600 }}>
                        {format(new Date(activity.scheduledFor), 'HH:mm')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-3d">
          <EmptyState
            title="No overdue activities"
            description="You're all caught up! Every scheduled activity is on track."
            icon={<AlertTriangle size={30} />}
          />
        </div>
      )}
    </div>
  );
}
