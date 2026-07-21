import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ActivityType, ActivityTypeLabels } from '../../types';
import { useForm } from '../hooks/useForm';
import { useCreateActivity } from '../../hooks/useActivities';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
}

const typeOptions = Object.entries(ActivityTypeLabels).map(([value, label]) => ({
  value: Number(value),
  label,
}));

export function CreateActivityModal({ isOpen, onClose, leadId }: CreateActivityModalProps) {
  const createActivity = useCreateActivity();

  const { values, errors, handleChange, handleSubmit, reset, setValue } = useForm({
    initialValues: {
      type: ActivityType.Call as number,
      notes: '',
      scheduledFor: '',
    },
    validate: (vals) => {
      const e: Record<string, string> = {};
      if (!vals.type) e.type = 'Type is required';
      if (!String(vals.notes).trim()) e.notes = 'Notes are required';
      return e;
    },
    onSubmit: async (vals) => {
      await createActivity.mutateAsync({
        leadId,
        command: {
          type: Number(vals.type) as ActivityType,
          notes: String(vals.notes),
          scheduledFor: vals.scheduledFor ? new Date(vals.scheduledFor).toISOString() : undefined,
        },
      });
      reset();
      onClose();
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { reset(); onClose(); }}
      title="Log Activity"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Select
          label="Activity Type"
          value={values.type}
          onChange={(e) => setValue('type', Number(e.target.value))}
          options={typeOptions}
          error={errors.type}
          required
        />

        <Textarea
          label="Notes"
          name="notes"
          value={String(values.notes)}
          onChange={handleChange}
          error={errors.notes}
          placeholder="Describe the activity..."
          required
          rows={4}
        />

        <Input
          label="Schedule For (optional)"
          name="scheduledFor"
          type="datetime-local"
          value={String(values.scheduledFor)}
          onChange={handleChange}
          helpText="Leave empty to mark as immediately completed"
        />

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" type="button" onClick={() => { reset(); onClose(); }}>
            Cancel
          </Button>
          <Button type="submit" loading={createActivity.isPending}>
            Log Activity
          </Button>
        </div>
      </form>
    </Modal>
  );
}
