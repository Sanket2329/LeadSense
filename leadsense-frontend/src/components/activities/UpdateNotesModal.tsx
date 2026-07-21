import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useUpdateActivityNotes } from '../../hooks/useActivities';

interface UpdateNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  activityId: string;
  currentNotes: string;
}

export function UpdateNotesModal({
  isOpen,
  onClose,
  leadId,
  activityId,
  currentNotes,
}: UpdateNotesModalProps) {
  const updateNotes = useUpdateActivityNotes();
  const [notes, setNotes] = useState(currentNotes);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Notes are required');
      return;
    }
    await updateNotes.mutateAsync({ leadId, activityId, request: { notes } });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Notes" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setError(''); }}
          error={error}
          rows={5}
          required
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={updateNotes.isPending}>Save Notes</Button>
        </div>
      </form>
    </Modal>
  );
}
