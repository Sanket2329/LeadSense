import { Badge } from '../ui/Badge';
import { LeadStatus, LeadStatusLabels } from '../../types';

const statusVariant: Record<LeadStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  [LeadStatus.New]: 'info',
  [LeadStatus.Contacted]: 'default',
  [LeadStatus.Qualified]: 'warning',
  [LeadStatus.ProposalSent]: 'neutral',
  [LeadStatus.Won]: 'success',
  [LeadStatus.Lost]: 'danger',
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant={statusVariant[status]}>
      {LeadStatusLabels[status]}
    </Badge>
  );
}
