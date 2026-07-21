import { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, Pencil, CalendarClock } from 'lucide-react';
import type { LeadActivityResponse } from '../../types';
import { ActivityStatus } from '../../types';
import { ActivityTypeBadge } from './ActivityTypeBadge';
import { ActivityStatusBadge } from './ActivityStatusBadge';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { RescheduleModal } from './RescheduleModal';
import { UpdateNotesModal } from './UpdateNotesModal';
import { useCompleteActivity, useCancelActivity } from '../../hooks/useActivities';

interface ActivityCardProps {
  activity: LeadActivityResponse;
  leadId: string;
}

const statusBorder: Record<number, string> = {
  [ActivityStatus.Pending]: '#fde68a',
  [ActivityStatus.Completed]: '#6ee7b7',
  [ActivityStatus.Cancelled]: '#fca5a5',
};
const statusAccent: Record<number, string> = {
  [ActivityStatus.Pending]: '#d97706',
  [ActivityStatus.Completed]: '#059669',
  [ActivityStatus.Cancelled]: '#e11d48',
};

export function ActivityCard({ activity, leadId }: ActivityCardProps) {
  const complete = useCompleteActivity();
  const cancel = useCancelActivity();
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [editNotesOpen, setEditNotesOpen] = useState(false);

  const isPending = activity.status === ActivityStatus.Pending;
  const isCompleted = activity.status === ActivityStatus.Completed;

  const border = statusBorder[activity.status] ?? '#e2d9cc';
  const accent = statusAccent[activity.status] ?? '#a8a29e';

  const actionBtn = (icon: React.ReactNode, onClick: () => void, label: string, hoverBg: string, hoverColor: string) => (
    <button
      key={label}
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        width: 30, height: 30, borderRadius: 8, border: 'none', background: 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#a8a29e', cursor: 'pointer', transition: 'all .12s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = hoverColor; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a8a29e'; }}
    >
      {icon}
    </button>
  );

  return (
    <>
      <div
        className="relative rounded-xl p-4"
        style={{
          background: '#fff',
          border: `1.5px solid ${border}`,
          boxShadow: `0 2px 0 ${border}, 0 6px 20px rgba(0,0,0,.06)`,
          transition: 'transform .12s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
        onMouseLeave={e => (e.currentTarget.style.transform = '')}
      >
        {/* Left accent bar */}
        <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full" style={{ background: accent }} />

        <div className="pl-3">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <ActivityTypeBadge type={activity.type} />
              <ActivityStatusBadge status={activity.status} />
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              {isPending && (
                <>
                  {actionBtn(<CalendarClock size={14} />, () => setRescheduleOpen(true), 'Reschedule', '#eff6ff', '#2563eb')}
                  {actionBtn(<CheckCircle size={14} />, () => setConfirmComplete(true), 'Complete', '#f0fdf4', '#16a34a')}
                  {actionBtn(<XCircle size={14} />, () => setConfirmCancel(true), 'Cancel', '#fff1f2', '#e11d48')}
                </>
              )}
              {actionBtn(<Pencil size={14} />, () => setEditNotesOpen(true), 'Edit notes', '#f5f0e8', '#78716c')}
            </div>
          </div>

          {/* Notes */}
          <p style={{ fontSize: 13.5, color: '#1c1917', lineHeight: 1.6 }}>{activity.notes}</p>

          {/* Dates */}
          <div className="flex flex-wrap gap-4 mt-2.5">
            {activity.scheduledFor && (
              <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: '#78716c', fontWeight: 600 }}>
                <Clock size={11} style={{ color: '#a8a29e' }} />
                Scheduled: {format(new Date(activity.scheduledFor), 'dd MMM yyyy, HH:mm')}
              </span>
            )}
            {activity.completedOn && isCompleted && (
              <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
                <CheckCircle size={11} />
                Completed: {format(new Date(activity.completedOn), 'dd MMM yyyy, HH:mm')}
              </span>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmComplete}
        onClose={() => setConfirmComplete(false)}
        onConfirm={() => { complete.mutate({ leadId, activityId: activity.id }); setConfirmComplete(false); }}
        title="Complete Activity"
        message="Mark this activity as completed? This cannot be undone."
        confirmLabel="Mark Complete"
        variant="primary"
        loading={complete.isPending}
      />
      <ConfirmDialog
        isOpen={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => { cancel.mutate({ leadId, activityId: activity.id }); setConfirmCancel(false); }}
        title="Cancel Activity"
        message="Are you sure you want to cancel this activity?"
        confirmLabel="Cancel Activity"
        variant="danger"
        loading={cancel.isPending}
      />
      <RescheduleModal isOpen={rescheduleOpen} onClose={() => setRescheduleOpen(false)} leadId={leadId} activityId={activity.id} currentScheduledFor={activity.scheduledFor} />
      <UpdateNotesModal isOpen={editNotesOpen} onClose={() => setEditNotesOpen(false)} leadId={leadId} activityId={activity.id} currentNotes={activity.notes} />
    </>
  );
}
