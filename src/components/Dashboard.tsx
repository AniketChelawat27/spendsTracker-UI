import React, { useMemo, useState, useCallback } from 'react';
import { useApp } from '../AppContext';
import { Panel } from './UI';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Sparkles, Zap, Wallet, Shield, Palmtree, Settings2, X } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { FundGoal } from '../types';

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#db2777'];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const Dashboard: React.FC = () => {
  const { filteredData: data, currentMonth, currentYear, viewMode, funds, updateFunds } = useApp();
  const isYearView = viewMode === 'year';
  const [fundsModalOpen, setFundsModalOpen] = useState(false);
  const [editEmergency, setEditEmergency] = useState(funds.emergency);
  const [editVacation, setEditVacation] = useState(funds.vacation);

  const totalSalary = data.salaries.reduce((sum, s) => sum + s.amount, 0);
  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalInvestments = data.investments.reduce((sum, i) => sum + i.amount, 0);
  const otherIncome = data.activities.filter((a) => a.type === 'Income' || a.type === 'Gift').reduce((sum, a) => sum + a.amount, 0);
  const otherOut = data.activities.filter((a) => a.type === 'Loan').reduce((sum, a) => sum + a.amount, 0);

  const totalIncome = totalSalary + otherIncome;
  const totalSpending = totalExpenses + totalInvestments + otherOut;
  const savings = totalIncome - totalSpending;
  const savingsPercent = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : '0';

  const reservedInFunds =
    (funds.emergency.enabled ? funds.emergency.current : 0) +
    (funds.vacation.enabled ? funds.vacation.current : 0);
  const totalAvailable = savings - reservedInFunds;
  const fundsEnabled = funds.emergency.enabled || funds.vacation.enabled;

  const openFundsModal = useCallback(() => {
    setEditEmergency(funds.emergency);
    setEditVacation(funds.vacation);
    setFundsModalOpen(true);
  }, [funds.emergency, funds.vacation]);

  const saveFunds = useCallback(async () => {
    await updateFunds({ emergency: editEmergency, vacation: editVacation });
    setFundsModalOpen(false);
  }, [editEmergency, editVacation, updateFunds]);

  const contributionData = useMemo(() => {
    const names = new Set<string>();
    data.salaries.forEach((s) => names.add(s.person));
    data.expenses.forEach((e) => names.add(e.paidBy));
    data.investments.forEach((i) => names.add(i.owner));
    return [...names].map((name) => ({
      name,
      salary: data.salaries.filter((s) => s.person === name).reduce((sum, s) => sum + s.amount, 0),
      expenses: data.expenses.filter((e) => e.paidBy === name).reduce((sum, e) => sum + e.amount, 0),
      investments: data.investments.filter((i) => i.owner === name).reduce((sum, i) => sum + i.amount, 0)
    }));
  }, [data.salaries, data.expenses, data.investments]);

  const expensesByCategory = useMemo(
    () =>
      Object.entries(
        data.expenses.reduce((acc: Record<string, number>, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value: Number(value) })),
    [data.expenses]
  );

  const investmentsByType = useMemo(
    () =>
      Object.entries(
        data.investments.reduce((acc: Record<string, number>, i) => {
          acc[i.type] = (acc[i.type] || 0) + i.amount;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value: Number(value) })),
    [data.investments]
  );

  const insights = useMemo(() => {
    const out: { type: string; icon: React.ReactNode; text: string }[] = [];
    if (savings > 0) {
      out.push({
        type: 'success',
        icon: <Sparkles className="w-5 h-5" />,
        text: `You saved ${formatCurrency(savings)} ${isYearView ? 'this year' : 'this month'} (${savingsPercent}% of income)`
      });
    } else if (savings < 0) {
      out.push({
        type: 'warning',
        icon: <TrendingDown className="w-5 h-5" />,
        text: `Spending exceeded income by ${formatCurrency(Math.abs(savings))}. Time to cut back.`
      });
    }
    if (totalInvestments > totalExpenses) {
      out.push({
        type: 'success',
        icon: <TrendingUp className="w-5 h-5" />,
        text: 'Investments are higher than expenses'
      });
    }
    const invRatio = totalIncome > 0 ? (totalInvestments / totalIncome) * 100 : 0;
    if (invRatio >= 20) {
      out.push({
        type: 'success',
        icon: <PiggyBank className="w-5 h-5" />,
        text: `${invRatio.toFixed(1)}% of income invested`
      });
    }
    return out;
  }, [savings, savingsPercent, totalExpenses, totalInvestments, totalIncome, isYearView]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const byMonthData = useMemo(() => {
    if (!isYearView) return [];
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
      const salary = data.salaries.filter((s) => s.month === m).reduce((sum, s) => sum + s.amount, 0);
      const otherInc = data.activities.filter((a) => a.month === m && (a.type === 'Income' || a.type === 'Gift')).reduce((sum, a) => sum + a.amount, 0);
      const income = salary + otherInc;
      const expenses = data.expenses.filter((e) => e.month === m).reduce((sum, e) => sum + e.amount, 0);
      const investments = data.investments.filter((i) => i.month === m).reduce((sum, i) => sum + i.amount, 0);
      return {
        month: monthNames[m - 1].slice(0, 3),
        income,
        expenses,
        investments,
        savings: income - expenses - investments
      };
    });
  }, [isYearView, data.salaries, data.expenses, data.investments, data.activities]);

  return (
    <div className="space-y-10 sm:space-y-16 max-w-5xl">
      {/* Hero */}
      <section className="rounded-2xl sm:rounded-3xl bg-[#8c045c] p-6 sm:p-10 text-white shadow-float animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {isYearView ? `${currentYear} overview` : `${monthNames[currentMonth - 1]} overview`}
        </h1>
        <p className="text-white/80 text-sm sm:text-base mt-2 max-w-xl">
          {isYearView ? 'Full year view. Income, expenses, and investments across all months.' : 'Turn data into action. Track income, expenses, and investments in one place.'}
        </p>
      </section>

      {/* Key metrics – testimonial-style: medium blue, orange, light blue, lime green */}
      <section className="animate-fade-in">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-3 sm:mb-4">Key metrics</h2>
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 ${fundsEnabled ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 sm:p-6 shadow-float text-white animate-slide-up animation-delay-75">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-white/90">Total income</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1 truncate">{formatCurrency(totalIncome)}</p>
              </div>
              <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 text-white/70 flex-shrink-0" />
            </div>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 p-4 sm:p-6 shadow-float text-white animate-slide-up animation-delay-150">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-white/90">Total expenses</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1 truncate">{formatCurrency(totalExpenses)}</p>
              </div>
              <TrendingDown className="w-10 h-10 sm:w-12 sm:h-12 text-white/70 flex-shrink-0" />
            </div>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 p-4 sm:p-6 shadow-float text-white animate-slide-up animation-delay-225">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-white/90">Investments</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1 truncate">{formatCurrency(totalInvestments)}</p>
              </div>
              <PiggyBank className="w-10 h-10 sm:w-12 sm:h-12 text-white/70 flex-shrink-0" />
            </div>
          </div>
          <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-float text-white animate-slide-up animation-delay-300 ${savings >= 0 ? 'bg-gradient-to-br from-lime-400 to-lime-600' : 'bg-gradient-to-br from-red-500 to-red-600'}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-white/90">Net savings</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-1 truncate">{formatCurrency(savings)}</p>
                <p className="text-xs text-white/80 mt-0.5">{savingsPercent}% of income</p>
              </div>
              {savings >= 0 ? <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-white/70 flex-shrink-0" /> : <TrendingDown className="w-10 h-10 sm:w-12 sm:h-12 text-white/70 flex-shrink-0" />}
            </div>
          </div>
          {fundsEnabled && (
            <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-float text-white animate-slide-up animation-delay-400 ${totalAvailable >= 0 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-amber-500 to-amber-600'}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-white/90">Total available</p>
                  <p className="text-xl sm:text-2xl font-bold text-white mt-1 truncate">{formatCurrency(totalAvailable)}</p>
                  <p className="text-xs text-white/80 mt-0.5">After reserved funds</p>
                </div>
                <Wallet className="w-10 h-10 sm:w-12 sm:h-12 text-white/70 flex-shrink-0" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Funds: Emergency & Vacation */}
      <section className="animate-slide-up animation-delay-150">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Funds & goals
          </h2>
          <button
            type="button"
            onClick={openFundsModal}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors min-h-[40px] touch-manipulation"
            aria-label="Edit funds"
          >
            <Settings2 className="w-4 h-4" />
            Edit funds
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FundCard
            title="Emergency fund"
            icon={<Shield className="w-5 h-5" />}
            goal={funds.emergency}
            accent="amber"
          />
          <FundCard
            title="Vacation fund"
            icon={<Palmtree className="w-5 h-5" />}
            goal={funds.vacation}
            accent="teal"
          />
        </div>
        {!funds.emergency.enabled && !funds.vacation.enabled && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            Enable emergency or vacation fund above to reserve money and track &quot;Total available&quot; on the dashboard.
          </p>
        )}
      </section>

      {/* Edit funds modal */}
      {fundsModalOpen && (
        <FundsModal
          editEmergency={editEmergency}
          setEditEmergency={setEditEmergency}
          editVacation={editVacation}
          setEditVacation={setEditVacation}
          onSave={saveFunds}
          onClose={() => setFundsModalOpen(false)}
        />
      )}

      {/* Insights – actionable cards */}
      {insights.length > 0 && (
        <section className="animate-slide-up">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-3 sm:mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Insights
          </h2>
          <div className="space-y-3">
            {insights.map((ins, i) => (
              <div
                key={i}
                className={`rounded-xl sm:rounded-2xl border-l-4 p-4 sm:p-5 shadow-soft bg-white dark:bg-neutral-900/80 border border-border dark:border-border-dark ${
                  ins.type === 'success' ? 'border-l-clay-green' : 'border-l-clay-orange'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={ins.type === 'success' ? 'text-clay-green' : 'text-clay-orange'}>{ins.icon}</span>
                  <p className="font-medium text-neutral-800 dark:text-neutral-100">{ins.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Charts */}
      <section className="animate-slide-up">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-3 sm:mb-4">Charts & breakdown</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {isYearView && byMonthData.length > 0 && (
            <Panel title="By month" description={`Income, expenses, and investments for ${currentYear}`} accent="green" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byMonthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                  <Tooltip formatter={(v: number | undefined) => formatCurrency(v ?? 0)} contentStyle={{ borderRadius: 12, border: '1px solid var(--border)' }} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ea580c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="investments" name="Investments" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          )}
          {contributionData.length > 0 && (
            <Panel title="By member" description="Salary, expenses, and investments per household member" accent="blue">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={contributionData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip formatter={(v: number | undefined) => (v != null ? formatCurrency(v) : '')} contentStyle={{ borderRadius: 12, border: '1px solid var(--border)' }} />
                  <Legend />
                  <Bar dataKey="salary" fill="#16a34a" name="Salary" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenses" fill="#d97706" name="Expenses" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="investments" fill="#2563eb" name="Investments" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          )}

          {expensesByCategory.length > 0 && (
            <Panel title="Expenses by category" accent="purple">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {expensesByCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number | undefined) => (v != null ? formatCurrency(v) : '')} />
                </PieChart>
              </ResponsiveContainer>
            </Panel>
          )}

          {investmentsByType.length > 0 && (
            <Panel title="Investments by type" accent="green">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={investmentsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {investmentsByType.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number | undefined) => (v != null ? formatCurrency(v) : '')} />
                </PieChart>
              </ResponsiveContainer>
            </Panel>
          )}

          <Panel title="Income vs spending" description="Compare total income, spending, and savings" accent="orange">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={[
                  { name: 'Income', amount: totalIncome },
                  { name: 'Spending', amount: totalSpending },
                  { name: 'Savings', amount: savings >= 0 ? savings : 0 }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v: number | undefined) => (v != null ? formatCurrency(v) : '')} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  <Cell fill="#16a34a" />
                  <Cell fill="#d97706" />
                  <Cell fill="#2563eb" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>
      </section>
    </div>
  );
};

function FundCard({
  title,
  icon,
  goal,
  accent
}: {
  title: string;
  icon: React.ReactNode;
  goal: FundGoal;
  accent: 'amber' | 'teal';
}) {
  const progress = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0;
  const isAmber = accent === 'amber';
  if (!goal.enabled) {
    return (
      <div className="rounded-xl sm:rounded-2xl border border-dashed border-border dark:border-border-dark bg-white dark:bg-neutral-900/50 p-4 sm:p-5 animate-slide-up-sm">
        <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400">
          {icon}
          <span className="text-sm font-medium">{title} (disabled)</span>
        </div>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">Enable in Edit funds to track.</p>
      </div>
    );
  }
  return (
    <div
      className={`rounded-xl sm:rounded-2xl border p-4 sm:p-5 shadow-soft animate-slide-up-sm ${
        isAmber
          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
          : 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`flex items-center gap-2 text-sm font-semibold ${isAmber ? 'text-amber-800 dark:text-amber-200' : 'text-teal-800 dark:text-teal-200'}`}>
          {icon}
          {title}
        </span>
        <span className="text-sm font-bold text-neutral-800 dark:text-white">
          {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
        </span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-white/60 dark:bg-black/20 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isAmber ? 'bg-amber-500' : 'bg-teal-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function FundsModal({
  editEmergency,
  setEditEmergency,
  editVacation,
  setEditVacation,
  onSave,
  onClose
}: {
  editEmergency: FundGoal;
  setEditEmergency: (g: FundGoal) => void;
  editVacation: FundGoal;
  setEditVacation: (g: FundGoal) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} role="presentation">
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-border dark:border-border-dark shadow-float-lg p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="funds-modal-title"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 id="funds-modal-title" className="text-lg font-semibold text-neutral-900 dark:text-white">Edit funds</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-6">
          <FundFormRow
            label="Emergency fund"
            goal={editEmergency}
            onChange={setEditEmergency}
          />
          <FundFormRow
            label="Vacation fund"
            goal={editVacation}
            onChange={setEditVacation}
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 active:scale-[0.98] transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function FundFormRow({
  label,
  goal,
  onChange
}: {
  label: string;
  goal: FundGoal;
  onChange: (g: FundGoal) => void;
}) {
  return (
    <div className="rounded-xl border border-border dark:border-border-dark p-4 space-y-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={goal.enabled}
          onChange={(e) => onChange({ ...goal, enabled: e.target.checked })}
          className="rounded border-border dark:border-border-dark text-primary-500 focus:ring-primary-500"
        />
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{label}</span>
      </label>
      {goal.enabled && (
        <>
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Target (₹)</label>
            <input
              type="number"
              min={0}
              value={goal.target || ''}
              onChange={(e) => onChange({ ...goal, target: Number(e.target.value) || 0 })}
              className="w-full rounded-lg border border-border dark:border-border-dark bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Current (₹)</label>
            <input
              type="number"
              min={0}
              value={goal.current || ''}
              onChange={(e) => onChange({ ...goal, current: Number(e.target.value) || 0 })}
              className="w-full rounded-lg border border-border dark:border-border-dark bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white"
            />
          </div>
        </>
      )}
    </div>
  );
}
