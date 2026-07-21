import { Badge } from '../ui/Badge';
import { ActivityType, ActivityTypeLabels } from '../../types';

const typeVariant: Record<ActivityType, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  [ActivityType.Call]: 'info',
  [ActivityType.Email]: 'default',
  [ActivityType.Meeting]: 'warning',
  [ActivityType.Demo]: 'success',
  [ActivityType.WhatsApp]: 'success',
  [ActivityType.Note]: 'neutral',
  [ActivityType.FollowUp]: 'info',
  [ActivityType.ProposalSent]: 'warning',
  [ActivityType.StatusChange]: 'neutral',
};

export function ActivityTypeBadge({ type }: { type: ActivityType }) {
  return (
    <Badge variant={typeVariant[type]}>
      {ActivityTypeLabels[type]}
    </Badge>
  );
}
