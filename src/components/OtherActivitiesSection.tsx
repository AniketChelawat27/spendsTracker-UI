import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../AppContext';
import { useMembers } from '../MembersContext';
import { Panel, Button, Modal, EmptyState } from './UI';
import { ActivityForm, type ActivityFormData } from './ActivityForm';
import { ActivityCard } from './ActivityCard';
import { Activity, Plus, ChevronRight } from 'lucide-react';
import axios from 'axios';

const defaultFormData = (firstPerson: string): ActivityFormData => ({
  title: '',
  amount: '',
  type: 'Income',
  person: firstPerson,
  date: new Date().toISOString().split('T')[0],
  notes: ''
});

export const OtherActivitiesSection: React.FC = () => {
  const { filteredData: data, refreshData, currentMonth, currentYear } = useApp();
  const { members } = useMembers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const firstMember = members[0]?.name ?? '';
  const [formData, setFormData] = useState<ActivityFormData>(() => defaultFormData(firstMember));

  const memberOptions = useMemo(
    () => members.map((m) => ({ value: m.name, label: m.name })),
    [members]
  );

  const openModal = useCallback(() => {
    setFormData((f) => ({ ...f, person: members[0]?.name ?? f.person }));
    setIsModalOpen(true);
  }, [members]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setFormData(defaultFormData(firstMember));
  }, [firstMember]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await axios.post('/api/activities', {
          ...formData,
          amount: Number(formData.amount),
          month: currentMonth,
          year: currentYear
        });
        closeModal();
        refreshData();
      } catch (err) {
        console.error('Error adding activity:', err);
      }
    },
    [formData, currentMonth, currentYear, closeModal, refreshData]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm('Delete this activity?')) return;
      try {
        await axios.delete(`/api/activities/${id}`);
        refreshData();
      } catch (err) {
        console.error('Error deleting activity:', err);
      }
    },
    [refreshData]
  );

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl">
      <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Other activities
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 mt-1">
            Income, gifts, loans, transfers
          </p>
        </div>
        {members.length > 0 && (
          <Button onClick={openModal}>
            <Plus className="w-5 h-5" />
            Add activity
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </section>

      {members.length === 0 ? (
        <Panel
          accent="none"
          className="py-16 border border-dashed border-border dark:border-border-dark"
        >
          <EmptyState
            icon={<Activity className="w-14 h-14 text-neutral-300 dark:text-neutral-600" />}
            title="Add household members first"
            description={
              <>
                Go to <strong>Household</strong> to add members, then add activities here.
              </>
            }
          />
        </Panel>
      ) : (
        <>
          <Panel
            title="Activity entries"
            description="Income, gifts, loans, and transfers for the selected month"
            accent="green"
          >
            {data.activities.length === 0 ? (
              <EmptyState
                icon={<Plus className="w-12 h-12 text-neutral-300 dark:text-neutral-600" />}
                title="No activities this month"
                description={null}
              >
                <Button onClick={openModal}>
                  <Plus className="w-5 h-5" />
                  Add activity
                </Button>
              </EmptyState>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.activities.map((act) => (
                  <ActivityCard key={act.id} activity={act} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </Panel>

          <Modal isOpen={isModalOpen} onClose={closeModal} title="Add activity">
            <ActivityForm
              formData={formData}
              setFormData={setFormData}
              memberOptions={memberOptions}
              onSubmit={handleSubmit}
              onCancel={closeModal}
              submitLabel="Add activity"
            />
          </Modal>
        </>
      )}
    </div>
  );
};
