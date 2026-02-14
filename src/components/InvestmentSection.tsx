import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { useMembers } from '../MembersContext';
import { Panel, Button, Modal, Input, Select, TextArea } from './UI';
import { TrendingUp, Plus, Trash2, ChevronRight } from 'lucide-react';
import axios from 'axios';

const investmentTypes = ['Mutual Fund', 'FD', 'Stocks', 'Gold', 'Crypto', 'Other'];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const getInvestmentIcon: Record<string, string> = {
  'Mutual Fund': '📊', FD: '🏦', Stocks: '📈', Gold: '🪙', Crypto: '₿', Other: '💎'
};

/** Clay-style solid card background (white text) */
const INVESTMENT_CARD_BG: Record<string, string> = {
  'Mutual Fund': 'bg-clay-blue',
  FD: 'bg-emerald-600',
  Stocks: 'bg-clay-purple',
  Gold: 'bg-amber-500',
  Crypto: 'bg-clay-orange',
  Other: 'bg-neutral-600'
};

export const InvestmentSection: React.FC = () => {
  const { filteredData: data, refreshData, currentMonth, currentYear } = useApp();
  const { members } = useMembers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const firstMember = members[0]?.name ?? '';
  const [formData, setFormData] = useState({
    type: 'Mutual Fund',
    amount: '',
    owner: firstMember,
    date: new Date().toISOString().split('T')[0],
    returnPercent: '',
    notes: ''
  });

  const memberOptions = useMemo(() => members.map((m) => ({ value: m.name, label: m.name })), [members]);

  const totalInvestments = data.investments.reduce((sum, i) => sum + i.amount, 0);
  const byOwner = useMemo(() => {
    const map: Record<string, number> = {};
    data.investments.forEach((i) => { map[i.owner] = (map[i.owner] || 0) + i.amount; });
    return map;
  }, [data.investments]);
  const ownerNames = useMemo(() => [...new Set(data.investments.map((i) => i.owner))], [data.investments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/investments', {
        ...formData,
        amount: Number(formData.amount),
        returnPercent: formData.returnPercent ? Number(formData.returnPercent) : null,
        month: currentMonth,
        year: currentYear
      });
      setIsModalOpen(false);
      setFormData({ type: 'Mutual Fund', amount: '', owner: firstMember, date: new Date().toISOString().split('T')[0], returnPercent: '', notes: '' });
      refreshData();
    } catch (err) {
      console.error('Error adding investment:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this investment?')) return;
    try {
      await axios.delete(`/api/investments/${id}`);
      refreshData();
    } catch (err) {
      console.error('Error deleting investment:', err);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl">
      <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Investments</h1>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 mt-1">Track investments by type and owner</p>
        </div>
        {members.length > 0 && (
          <Button onClick={() => { setFormData((f) => ({ ...f, owner: members[0]?.name ?? f.owner })); setIsModalOpen(true); }}>
            <Plus className="w-5 h-5" />
            Add investment
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </section>

      {members.length === 0 ? (
        <Panel accent="none" className="text-center py-16 border border-dashed border-border dark:border-border-dark">
          <TrendingUp className="w-14 h-14 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">Add household members first</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">Go to <strong>Household</strong> to add members, then add investments here.</p>
        </Panel>
      ) : (
        <>
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="rounded-2xl bg-clay-purple/10 dark:bg-clay-purple/20 border border-clay-purple/20 p-6 shadow-float">
                <p className="text-sm font-medium text-clay-purple dark:text-purple-300">Total investments</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{formatCurrency(totalInvestments)}</p>
              </div>
              {ownerNames.map((name) => (
                <div key={name} className="rounded-2xl border border-border dark:border-border-dark bg-white dark:bg-neutral-900/80 p-6 shadow-float">
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{name}</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{formatCurrency(byOwner[name] || 0)}</p>
                </div>
              ))}
            </div>
          </section>

          <Panel title="Investment entries" description="All investments for the selected month" accent="blue">
          {data.investments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">No investments this month</p>
              <Button onClick={() => setIsModalOpen(true)}><Plus className="w-5 h-5" /> Add investment</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.investments.map((inv) => (
                <div key={inv.id} className={`rounded-2xl sm:rounded-3xl ${INVESTMENT_CARD_BG[inv.type] || INVESTMENT_CARD_BG.Other} p-5 shadow-float hover:shadow-float-lg transition-all duration-200 group`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-2xl flex-shrink-0">{getInvestmentIcon[inv.type] || '💎'}</span>
                      <span className="text-xs font-medium text-white/90">{inv.type}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(inv.id!)} className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-white/20 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xl font-bold text-white">{formatCurrency(inv.amount)}</p>
                  {inv.returnPercent != null && <p className="text-sm text-white/90 mt-1">Return: {inv.returnPercent}%</p>}
                  <div className="flex items-center justify-between text-sm mt-2 text-white/90">
                    <span className="px-2 py-1 rounded-lg bg-white/20 font-medium">{inv.owner}</span>
                    <span>{new Date(inv.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  {inv.notes && <p className="text-sm text-white/80 mt-2 italic">{inv.notes}</p>}
                </div>
              ))}
            </div>
          )}
          </Panel>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add investment">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select label="Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} options={investmentTypes.map((t) => ({ value: t, label: `${getInvestmentIcon[t] || ''} ${t}` }))} required />
              <Input label="Amount" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required min={0} step="0.01" />
              <Select label="Owner" value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} options={memberOptions} required />
              <Input label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
              <Input label="Expected return %" type="number" value={formData.returnPercent} onChange={(e) => setFormData({ ...formData, returnPercent: e.target.value })} placeholder="Optional" step="0.1" min={0} />
              <TextArea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional" />
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">Add investment</Button>
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
};
