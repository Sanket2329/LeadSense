import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Tag, Mail, Phone, Filter } from 'lucide-react';
import { useLeads, useDeleteLead } from '../hooks/useLeads';
import { useLeadActivities } from '../hooks/useActivities';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LeadFormModal } from '../components/leads/LeadFormModal';
import { UpdateStatusModal } from '../components/leads/UpdateStatusModal';
import { LeadStatusBadge } from '../components/leads/LeadStatusBadge';
import { CreateActivityModal } from '../components/activities/CreateActivityModal';
import { ActivityCard } from '../components/activities/ActivityCard';
import { ActivityStatus, ActivityStatusLabels } from '../types';

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: leads } = useLeads();
  const lead = leads?.find((l) => l.id === id);
  const { data: activities, isLoading: activitiesLoading } = useLeadActivities(id!);
  const deleteLead = useDeleteLead();

  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'all'>('all');

  if (!lead) {
    return (
      <div className="p-8">
        <EmptyState
          title="Lead not found"
          description="This lead doesn't exist or was deleted"
          action={<Link to="/leads"><Button variant="ghost">← Back to Leads</Button></Link>}
        />
      </div>
    );
  }

  const filteredActivities = activities?.filter((a) =>
    statusFilter === 'all' ? true : a.status === statusFilter
  );

  const filterOptions: Array<{ value: ActivityStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All Activities' },
    { value: ActivityStatus.Pending, label: 'Pending' },
    { value: ActivityStatus.Completed, label: 'Completed' },
    { value: ActivityStatus.Cancelled, label: 'Cancelled' },
  ];

  return (
    <div className="p-8" style={{ maxWidth: 880 }}>
      {/* Back */}
      <Link
        to="/leads"
        className="inline-flex items-center gap-1.5 mb-6"
        style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textDecoration: 'none', transition: 'color .12s' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#2563eb')}
        onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
      >
        <ArrowLeft size={14} />
        Back to Leads
      </Link>

      {/* Lead hero card */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6 p-6"
        style={{
          background: 'linear-gradient(110deg,#0a0a0f 0%,#0f172a 60%,#1e3a8a 100%)',
          border: '1.5px solid #1e3a8a',
          boxShadow: '0 4px 0 #0a0a0f, 0 16px 48px rgba(15,23,42,.5)',
        }}
      >
        {/* decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full" style={{ background: 'rgba(37,99,235,.12)' }} />
        <div className="absolute right-20 -bottom-12 w-28 h-28 rounded-full" style={{ background: 'rgba(255,255,255,.03)' }} />

        <div className="relative flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', boxShadow: '0 3px 0 #1d4ed8, 0 8px 24px rgba(37,99,235,.5)' }}
          >
            {lead.firstName[0]}{lead.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-white mb-2">{lead.firstName} {lead.lastName}</h1>
            <div className="flex flex-wrap gap-4 items-center">
              <span className="flex items-center gap-1.5" style={{ fontSize: 13, color: '#93c5fd' }}>
                <Mail size={13} /> {lead.email}
              </span>
              <span className="flex items-center gap-1.5" style={{ fontSize: 13, color: '#93c5fd' }}>
                <Phone size={13} /> {lead.phoneNumber}
              </span>
              <LeadStatusBadge status={lead.status} />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setStatusOpen(true)}
              className="btn-3d btn-beige btn-sm flex items-center gap-1.5"
            >
              <Tag size={13} /> Status
            </button>
            <button
              onClick={() => setEditOpen(true)}
              className="btn-3d btn-sm flex items-center gap-1.5"
              style={{ background: 'rgba(255,255,255,.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,.2)', boxShadow: 'none' }}
            >
              <Pencil size={13} /> Edit
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="btn-3d btn-danger btn-sm flex items-center gap-1.5"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Activities section */}
      <div>
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#2563eb,#1e3a8a)' }} />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0a0a0f' }}>Activities</h2>
            </div>
            {activities && (
              <span
                className="rounded-full px-2.5 py-0.5"
                style={{ fontSize: 12, fontWeight: 800, background: '#0a0a0f', color: '#fff' }}
              >
                {activities.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Filter size={13} style={{ color: '#a8a29e' }} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ActivityStatus | 'all')}
                className="input-3d"
                style={{ padding: '6px 10px', fontSize: 12.5, fontWeight: 600 }}
                aria-label="Filter by status"
              >
                {filterOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <Button size="sm" onClick={() => setActivityOpen(true)}>
              <Plus size={13} /> Log Activity
            </Button>
          </div>
        </div>

        {activitiesLoading ? (
          <div className="flex justify-center py-16">
            <div className="spin rounded-full" style={{ width: 36, height: 36, border: '3px solid #e2d9cc', borderTopColor: '#2563eb' }} />
          </div>
        ) : filteredActivities && filteredActivities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} leadId={id!} />
            ))}
          </div>
        ) : (
          <div className="card-3d">
            <EmptyState
              title="No activities"
              description={
                statusFilter === 'all'
                  ? 'Log calls, emails and meetings to track this lead'
                  : `No ${ActivityStatusLabels[statusFilter as ActivityStatus].toLowerCase()} activities`
              }
              action={
                statusFilter === 'all' ? (
                  <Button size="sm" onClick={() => setActivityOpen(true)}>
                    <Plus size={13} /> Log first activity
                  </Button>
                ) : undefined
              }
            />
          </div>
        )}
      </div>

      <LeadFormModal isOpen={editOpen} onClose={() => setEditOpen(false)} lead={lead} />
      <UpdateStatusModal isOpen={statusOpen} onClose={() => setStatusOpen(false)} lead={lead} currentStatus={lead.status} />
      <CreateActivityModal isOpen={activityOpen} onClose={() => setActivityOpen(false)} leadId={id!} />
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => { await deleteLead.mutateAsync(lead.id); navigate('/leads'); }}
        title="Delete Lead"
        message={`Permanently delete ${lead.firstName} ${lead.lastName} and all their activities?`}
        confirmLabel="Delete Lead"
        loading={deleteLead.isPending}
      />
    </div>
  );
}
