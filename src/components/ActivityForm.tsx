import React from 'react';
import { ACTIVITY_TYPES, getActivityIcon } from '../constants/activities';
import { Button, Input, Select, TextArea } from './UI';

export interface ActivityFormData {
  title: string;
  amount: string;
  type: string;
  person: string;
  date: string;
  notes: string;
}

interface ActivityFormOptions {
  value: string;
  label: string;
}

interface ActivityFormProps {
  formData: ActivityFormData;
  setFormData: React.Dispatch<React.SetStateAction<ActivityFormData>>;
  memberOptions: ActivityFormOptions[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel?: string;
}

const typeOptions = ACTIVITY_TYPES.map((t) => ({ value: t, label: `${getActivityIcon(t)} ${t}` }));

export const ActivityForm: React.FC<ActivityFormProps> = ({
  formData,
  setFormData,
  memberOptions,
  onSubmit,
  onCancel,
  submitLabel = 'Add activity'
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <Input
      label="Title"
      value={formData.title}
      onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
      placeholder="e.g. Freelance income"
      required
    />
    <Select
      label="Type"
      value={formData.type}
      onChange={(e) => setFormData((f) => ({ ...f, type: e.target.value }))}
      options={typeOptions}
      required
    />
    <Input
      label="Amount"
      type="number"
      value={formData.amount}
      onChange={(e) => setFormData((f) => ({ ...f, amount: e.target.value }))}
      required
      min={0}
      step="0.01"
    />
    <Select
      label="Person"
      value={formData.person}
      onChange={(e) => setFormData((f) => ({ ...f, person: e.target.value }))}
      options={memberOptions}
      required
    />
    <Input
      label="Date"
      type="date"
      value={formData.date}
      onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))}
      required
    />
    <TextArea
      label="Notes"
      value={formData.notes}
      onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
      placeholder="Optional"
    />
    <div className="flex gap-3 pt-2">
      <Button type="submit" className="flex-1">
        {submitLabel}
      </Button>
      <Button type="button" variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  </form>
);
