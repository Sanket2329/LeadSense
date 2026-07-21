import { Badge } from '../ui/Badge';
import { ActivityStatus, ActivityStatusLabels } from '../../types';

const statusVariant: Record<ActivityStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  [ActivityStatus.Pending]: 'warning',
  [ActivityStatus.Completed]: 'success',
  [ActivityStatus.Cancelled]: 'danger',
};

export function ActivityStatusBadge({ status }: { status: ActivityStatus }) {
  return (
    <Badge variant={statusVariant[status]}>
      {ActivityStatusLabels[status]}
    </Badge>
  );
}
