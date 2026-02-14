import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { useMembers } from '../MembersContext';
import { Panel, Button, Modal, Input, Select, TextArea } from './UI';
import { ShoppingBag, Plus, Trash2, Filter, ChevronRight } from 'lucide-react';
import axios from 'axios';

const categories = ['Food', 'Rent', 'Travel', 'Shopping', 'Bills', 'Medical', 'Other'];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const getCategoryIcon: Record<string, string> = {
  Food: '🍽️', Rent: '🏠', Travel: '✈️', Shopping: '🛍️', Bills: '💡', Medical: '⚕️', Other: '📦'
};

/** Clay-style solid card background (white text) */
const EXPENSE_CARD_BG: Record<string, string> = {
  Food: 'bg-clay-orange',
  Rent: 'bg-clay-blue',
  Travel: 'bg-clay-purple',
  Shopping: 'bg-clay-pink',
  Bills: 'bg-amber-500',
  Medical: 'bg-red-500',
  Other: 'bg-neutral-600'
};

export const ExpenseSection: React.FC = () => {
  const { filteredData: data, refreshData, currentMonth, currentYear } = useApp();
  const { members } = useMembers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPerson, setFilterPerson] = useState('All');
  const firstMember = members[0]?.name ?? '';
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    paidBy: firstMember,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const memberOptions = useMemo(() => members.map((m) => ({ value: m.name, label: m.name })), [members]);
  const filterPersonOptions = useMemo(
    () => [{ value: 'All', label: 'All members' }, ...memberOptions],
    [memberOptions]
  );

  const filteredExpenses = useMemo(
    () =>
      data.expenses.filter((e) => {
        const cat = filterCategory === 'All' || e.category === filterCategory;
        const person = filterPerson === 'All' || e.paidBy === filterPerson;
        return cat && person;
      }),
    [data.expenses, filterCategory, filterPerson]
  );

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const byPerson = useMemo(() => {
    const map: Record<string, number> = {};
    data.expenses.forEach((e) => { map[e.paidBy] = (map[e.paidBy] || 0) + e.amount; });
    return map;
  }, [data.expenses]);
  const personNames = useMemo(() => [...new Set(data.expenses.map((e) => e.paidBy))], [data.expenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/expenses', {
        ...formData,
        amount: Number(formData.amount),
        month: currentMonth,
        year: currentYear
      });
      setIsModalOpen(false);
      setFormData({ title: '', amount: '', category: 'Food', paidBy: firstMember, date: new Date().toISOString().split('T')[0], notes: '' });
      refreshData();
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await axios.delete(`/api/expenses/${id}`);
      refreshData();
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl">
      <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Expenses</h1>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 mt-1">Track spending by category and member</p>
        </div>
        {members.length > 0 && (
          <Button onClick={() => { setFormData((f) => ({ ...f, paidBy: members[0]?.name ?? f.paidBy })); setIsModalOpen(true); }}>
            <Plus className="w-5 h-5" />
            Add expense
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </section>

      {members.length === 0 ? (
        <Panel accent="none" className="text-center py-16 border border-dashed border-border dark:border-border-dark">
          <ShoppingBag className="w-14 h-14 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">Add household members first</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">Go to <strong>Household</strong> to add members, then add expenses here.</p>
        </Panel>
      ) : (
        <>
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="rounded-2xl bg-clay-orange/10 dark:bg-clay-orange/20 border border-clay-orange/20 p-6 shadow-float">
                <p className="text-sm font-medium text-clay-orange dark:text-orange-300">Total expenses</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{formatCurrency(totalExpenses)}</p>
              </div>
              {personNames.map((name) => (
                <div key={name} className="rounded-2xl border border-border dark:border-border-dark bg-white dark:bg-neutral-900/80 p-6 shadow-float">
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{name}</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{formatCurrency(byPerson[name] || 0)}</p>
                </div>
              ))}
            </div>
          </section>

          <Panel title="Filter & entries" accent="purple">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Filter className="w-5 h-5 text-neutral-500" />
            <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} options={[{ value: 'All', label: 'All categories' }, ...categories.map((c) => ({ value: c, label: `${getCategoryIcon[c] ?? ''} ${c}` }))]} className="min-w-[180px]" />
            <Select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)} options={filterPersonOptions} className="min-w-[180px]" />
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">No expenses for this month</p>
              <Button onClick={() => setIsModalOpen(true)}><Plus className="w-5 h-5" /> Add expense</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExpenses.map((exp) => (
                <div key={exp.id} className={`rounded-2xl sm:rounded-3xl ${EXPENSE_CARD_BG[exp.category] || EXPENSE_CARD_BG.Other} p-5 shadow-float hover:shadow-float-lg transition-all duration-200 group`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-2xl flex-shrink-0">{getCategoryIcon[exp.category] || '📦'}</span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white truncate">{exp.title}</h3>
                        <span className="text-xs font-medium text-white/80">{exp.category}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(exp.id!)} className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-white/20 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xl font-bold text-white">{formatCurrency(exp.amount)}</p>
                  <div className="flex items-center justify-between text-sm mt-2 text-white/90">
                    <span className="px-2 py-1 rounded-lg bg-white/20 font-medium">{exp.paidBy}</span>
                    <span>{new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  {exp.notes && <p className="text-sm text-white/80 mt-2 italic">{exp.notes}</p>}
                </div>
              ))}
            </div>
          )}
          </Panel>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add expense">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Grocery" required />
              <Input label="Amount" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required min={0} step="0.01" />
              <Select label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} options={categories.map((c) => ({ value: c, label: `${getCategoryIcon[c] || ''} ${c}` }))} required />
              <Select label="Paid by" value={formData.paidBy} onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })} options={memberOptions} required />
              <Input label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
              <TextArea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional" />
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">Add expense</Button>
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
};
