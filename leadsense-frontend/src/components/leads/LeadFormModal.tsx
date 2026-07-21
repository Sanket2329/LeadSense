import { useForm } from '../hooks/useForm';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { LeadSource, LeadSourceLabels } from '../../types';
import type { CreateLeadCommand, LeadResponse } from '../../types';
import { useCreateLead, useUpdateLead } from '../../hooks/useLeads';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: LeadResponse | null;
}

const sourceOptions = Object.entries(LeadSourceLabels).map(([value, label]) => ({
  value: Number(value),
  label,
}));

export function LeadFormModal({ isOpen, onClose, lead }: LeadFormModalProps) {
  const isEdit = !!lead;
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const { values, errors, handleChange, handleSubmit, reset, setValue } = useForm({
    initialValues: {
      firstName: lead?.firstName ?? '',
      lastName: lead?.lastName ?? '',
      email: lead?.email ?? '',
      phoneNumber: lead?.phoneNumber ?? '',
      source: LeadSource.Website as number,
      companyName: '',
      notes: '',
    },
    validate: (vals) => {
      const e: Record<string, string> = {};
      if (!vals.firstName.trim()) e.firstName = 'First name is required';
      if (!vals.lastName.trim()) e.lastName = 'Last name is required';
      if (!vals.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vals.email)) e.email = 'Invalid email';
      if (!vals.phoneNumber.trim()) e.phoneNumber = 'Phone number is required';
      if (!isEdit && !vals.source) e.source = 'Source is required';
      return e;
    },
    onSubmit: async (vals) => {
      if (isEdit && lead) {
        await updateLead.mutateAsync({
          id: lead.id,
          command: {
            firstName: vals.firstName,
            lastName: vals.lastName,
            email: vals.email,
            phoneNumber: vals.phoneNumber,
          },
        });
      } else {
        await createLead.mutateAsync({
          firstName: vals.firstName,
          lastName: vals.lastName,
          email: vals.email,
          phoneNumber: vals.phoneNumber,
          source: Number(vals.source) as LeadSource,
          companyName: vals.companyName || undefined,
          notes: vals.notes || undefined,
        } as CreateLeadCommand);
      }
      reset();
      onClose();
    },
  });

  const isLoading = createLead.isPending || updateLead.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { reset(); onClose(); }}
      title={isEdit ? 'Edit Lead' : 'Add New Lead'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
            placeholder="Jane"
          />
          <Input
            label="Last Name"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
            placeholder="Smith"
          />
        </div>

        <Input
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          required
          placeholder="jane@example.com"
        />

        <Input
          label="Phone Number"
          name="phoneNumber"
          value={values.phoneNumber}
          onChange={handleChange}
          error={errors.phoneNumber}
          required
          placeholder="+91 98765 43210"
        />

        {!isEdit && (
          <>
            <Select
              label="Lead Source"
              name="source"
              value={values.source}
              onChange={(e) => setValue('source', Number(e.target.value))}
              error={errors.source}
              options={sourceOptions}
              placeholder="Select source"
              required
            />

            <Input
              label="Company Name"
              name="companyName"
              value={values.companyName}
              onChange={handleChange}
              placeholder="Acme Corp (optional)"
            />

            <Textarea
              label="Notes"
              name="notes"
              value={values.notes}
              onChange={handleChange}
              placeholder="Any additional notes..."
            />
          </>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={() => { reset(); onClose(); }} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
