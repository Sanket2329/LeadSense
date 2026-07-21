import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { LeadStatus, LeadStatusLabels } from '../../types';
import type { LeadResponse } from '../../types';
import { useUpdateLeadStatus } from '../../hooks/useLeads';

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadResponse;
  currentStatus?: LeadStatus;
}

const statusOptions = Object.entries(LeadStatusLabels).map(([value, label]) => ({
  value: Number(value),
  label,
}));

export function UpdateStatusModal({ isOpen, onClose, lead, currentStatus }: UpdateStatusModalProps) {
  const [status, setStatus] = useState<LeadStatus>(currentStatus ?? LeadStatus.New);
  const updateStatus = useUpdateLeadStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStatus.mutateAsync({ id: lead.id, command: { status } });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Lead Status" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Update the status for <strong>{lead.firstName} {lead.lastName}</strong>
        </p>
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(Number(e.target.value) as LeadStatus)}
          options={statusOptions}
          required
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={updateStatus.isPending}>
            Update Status
          </Button>
        </div>
      </form>
    </Modal>
  );
}
