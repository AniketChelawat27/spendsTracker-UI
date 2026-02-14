import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { useMembers } from '../MembersContext';
import { Panel, Button, Modal, Input, Select, DataTable } from './UI';
import { DollarSign, Plus, Trash2, ChevronRight } from 'lucide-react';
import axios from 'axios';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const SalarySection: React.FC = () => {
  const { filteredData: data, refreshData, currentMonth, currentYear } = useApp();
  const { members } = useMembers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const firstMemberName = members[0]?.name ?? '';
  const [formData, setFormData] = useState({
    person: firstMemberName,
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const memberOptions = useMemo(
    () => members.map((m) => ({ value: m.name, label: m.name })),
    [members]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/salaries', {
        ...formData,
        amount: Number(formData.amount),
        month: currentMonth,
        year: currentYear
      });
      setIsModalOpen(false);
      setFormData({ person: firstMemberName, amount: '', date: new Date().toISOString().split('T')[0] });
      refreshData();
    } catch (err) {
      console.error('Error adding salary:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this salary entry?')) return;
    try {
      await axios.delete(`/api/salaries/${id}`);
      refreshData();
    } catch (err) {
      console.error('Error deleting salary:', err);
    }
  };

  const totalSalary = data.salaries.reduce((sum, s) => sum + s.amount, 0);
  const byPerson = useMemo(() => {
    const map: Record<string, number> = {};
    data.salaries.forEach((s) => { map[s.person] = (map[s.person] || 0) + s.amount; });
    return map;
  }, [data.salaries]);

  const personNames = useMemo(() => [...new Set(data.salaries.map((s) => s.person))], [data.salaries]);

  const tableRows = useMemo(
    () =>
      data.salaries.map((s) => ({
        member: (
          <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium bg-clay-green/15 text-clay-green dark:bg-clay-green/25 dark:text-green-300">
            {s.person}
          </span>
        ),
        amount: <span className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(s.amount)}</span>,
        date: (
          <span className="text-neutral-500 dark:text-neutral-400">
            {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )
      })),
    [data.salaries]
  );

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl">
      <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Salary income
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 mt-1">Track monthly salary by household member</p>
        </div>
        {members.length > 0 && (
          <Button onClick={() => { setFormData((f) => ({ ...f, person: members[0]?.name ?? f.person })); setIsModalOpen(true); }}>
            <Plus className="w-5 h-5" />
            Add salary
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </section>

      {members.length === 0 ? (
        <Panel accent="none" className="text-center py-16 border border-dashed border-border dark:border-border-dark">
          <DollarSign className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-5" />
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-2">Add household members first</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            Go to <strong>Household</strong> in the sidebar, add members (e.g. your name, Father), then come back here to add salaries.
          </p>
        </Panel>
      ) : (
        <>
          {/* Summary cards – Clay-style colored panels */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="rounded-2xl bg-clay-green/10 dark:bg-clay-green/20 border border-clay-green/20 p-6 shadow-float">
                <p className="text-sm font-medium text-clay-green dark:text-green-300">Total salary</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{formatCurrency(totalSalary)}</p>
              </div>
              {personNames.map((name) => (
                <div
                  key={name}
                  className="rounded-2xl border border-border dark:border-border-dark bg-white dark:bg-neutral-900/80 p-6 shadow-float"
                >
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{name}</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{formatCurrency(byPerson[name] || 0)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Data table – spreadsheet-style */}
          <Panel
            title="Salary entries"
            description="All salary entries for the selected month"
            accent="blue"
          >
            {data.salaries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-500 dark:text-neutral-400 mb-4">No salary entries for this month</p>
                <Button onClick={() => { setFormData((f) => ({ ...f, person: members[0]?.name ?? f.person })); setIsModalOpen(true); }}>
                  <Plus className="w-5 h-5" /> Add first salary
                </Button>
              </div>
            ) : (
              <DataTable
                columns={[
                  { key: 'member', label: 'Member' },
                  { key: 'amount', label: 'Amount' },
                  { key: 'date', label: 'Date' }
                ]}
                rows={tableRows}
                onRowAction={(i) => (
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(data.salaries[i].id!)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              />
            )}
          </Panel>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add salary">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Select
                label="Member"
                value={formData.person}
                onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                options={memberOptions}
                required
              />
              <Input label="Amount" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0" required min={0} step="0.01" />
              <Input label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">Add salary</Button>
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
};
