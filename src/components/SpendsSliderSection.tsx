import React, { useRef } from 'react';
import { useApp } from '../AppContext';
import { useMembers } from '../MembersContext';
import type { Expense } from '../types';
import { formatCurrency } from '../utils/format';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

const getCategoryIcon: Record<string, string> = {
  Food: '🍽️',
  Rent: '🏠',
  Travel: '✈️',
  Shopping: '🛍️',
  Bills: '💡',
  Medical: '⚕️',
  Other: '📦'
};

const CARD_BG: Record<string, string> = {
  Food: 'bg-clay-orange',
  Rent: 'bg-clay-blue',
  Travel: 'bg-clay-purple',
  Shopping: 'bg-clay-pink',
  Bills: 'bg-amber-500',
  Medical: 'bg-red-500',
  Other: 'bg-neutral-600'
};

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function SpendCard({ expense }: { expense: Expense }) {
  const bg = CARD_BG[expense.category] ?? CARD_BG.Other;
  const icon = getCategoryIcon[expense.category] ?? '📦';
  const description = expense.notes?.trim() || expense.title;
  const dateStr = new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div
      className={`${bg} rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-float flex flex-col min-h-[200px] sm:min-h-[220px] flex-shrink-0`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl" aria-hidden>{icon}</span>
        <span className="font-bold text-white uppercase tracking-wide text-sm">{expense.category}</span>
      </div>
      <p className="text-white/95 text-sm sm:text-base leading-relaxed flex-1 line-clamp-3 mb-3">
        &ldquo;{description}&rdquo;
      </p>
      <p className="text-white font-bold text-lg mb-3">{formatCurrency(expense.amount)}</p>
      <div className="border-t border-white/30 border-dashed pt-3 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {getInitial(expense.paidBy)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white truncate">{expense.paidBy}</p>
            <p className="text-xs text-white/80">{dateStr}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const SpendsSliderSection: React.FC = () => {
  const { filteredData: data } = useApp();
  const { members } = useMembers();
  const scrollRef = useRef<HTMLDivElement>(null);

  const expenses = data.expenses;

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  const hasExpenses = expenses.length > 0;

  if (members.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in max-w-5xl">
        <section>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Spend cards
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 mt-1">
            Your expenses as slider cards
          </p>
        </section>
        <div className="rounded-2xl border border-dashed border-border dark:border-border-dark bg-white dark:bg-neutral-900/50 p-12 text-center">
          <ShoppingBag className="w-14 h-14 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">Add household members first</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Go to <strong>Household</strong> to add members, then add expenses in <strong>Expenses</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl">
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            What you spent...
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 mt-1">
            Browse spends by card. Paid by and date on each card.
          </p>
        </div>
        {hasExpenses && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="p-2.5 rounded-xl border border-border dark:border-border-dark bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="p-2.5 rounded-xl border border-border dark:border-border-dark bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {!hasExpenses ? (
        <div className="rounded-2xl border border-dashed border-border dark:border-border-dark bg-white dark:bg-neutral-900/50 p-12 text-center">
          <ShoppingBag className="w-14 h-14 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400 mb-2">No spends this month</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Add expenses in the <strong>Expenses</strong> tab to see them here.</p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden scroll-smooth pb-2 px-1 sm:px-0"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          {/* Mobile: 2-row grid; Desktop: single row flex */}
          <div className="inline-grid grid-rows-2 grid-flow-col auto-cols-[minmax(260px,1fr)] gap-4 md:flex md:flex-row md:gap-5 md:inline-flex w-max">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="snap-start w-[260px] sm:w-[280px] md:w-[320px] md:min-w-[300px] md:max-w-[360px] md:flex-shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                <SpendCard expense={exp} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
