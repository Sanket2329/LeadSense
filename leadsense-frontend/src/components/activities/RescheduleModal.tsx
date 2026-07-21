import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useRescheduleActivity } from '../../hooks/useActivities';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  activityId: string;
  currentScheduledFor?: string | null;
}

export function RescheduleModal({
  isOpen,
  onClose,
  leadId,
  activityId,
  currentScheduledFor,
}: RescheduleModalProps) {
  const reschedule = useRescheduleActivity();

  const toLocalInput = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const [scheduledFor, setScheduledFor] = useState(toLocalInput(currentScheduledFor));
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledFor) {
      setError('Please select a date and time');
      return;
    }
    await reschedule.mutateAsync({
      leadId,
      activityId,
      request: { scheduledFor: new Date(scheduledFor).toISOString() },
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reschedule Activity" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New Date & Time"
          type="datetime-local"
          value={scheduledFor}
          onChange={(e) => { setScheduledFor(e.target.value); setError(''); }}
          error={error}
          required
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={reschedule.isPending}>Reschedule</Button>
        </div>
      </form>
    </Modal>
  );
}
