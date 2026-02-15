import React from 'react';
import { LogOut, Menu, Calendar, CalendarDays } from 'lucide-react';
import { useApp } from '../AppContext';
import { useAuth } from '../AuthContext';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { currentMonth, currentYear, setCurrentMonth, setCurrentYear, viewMode, setViewMode } = useApp();
  const { user, signOut } = useAuth();

  return (
    <header
      className="sticky top-0 z-30 min-h-[52px] sm:h-14 border-b border-border dark:border-border-dark bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md safe-area-top"
      style={{ paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}
    >
      <div className="h-full px-3 sm:px-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden p-2.5 -ml-1 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation transition-transform"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex rounded-lg border border-border dark:border-border-dark overflow-hidden flex-shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-sm font-medium min-h-[44px] sm:min-h-[38px] touch-manipulation transition-colors ${
                viewMode === 'month'
                  ? 'bg-primary-500/15 text-primary-700 dark:text-primary-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="View by month"
              aria-label="View by month"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Month</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('year')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-sm font-medium min-h-[44px] sm:min-h-[38px] touch-manipulation transition-colors ${
                viewMode === 'year'
                  ? 'bg-primary-500/15 text-primary-700 dark:text-primary-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="View by year"
              aria-label="View by year"
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Year</span>
            </button>
          </div>
          {viewMode === 'month' && (
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-transparent border border-border dark:border-border-dark rounded-lg px-2.5 sm:px-3 py-2 min-h-[44px] sm:min-h-0 cursor-pointer focus:ring-2 focus:ring-primary-500/50 outline-none touch-manipulation flex-1 sm:flex-none max-w-[130px] sm:max-w-none"
              aria-label="Select month"
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>{month}</option>
              ))}
            </select>
          )}
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-transparent border border-border dark:border-border-dark rounded-lg px-2.5 sm:px-3 py-2 min-h-[44px] sm:min-h-0 cursor-pointer focus:ring-2 focus:ring-primary-500/50 outline-none touch-manipulation w-[72px] sm:w-auto"
            aria-label="Select year"
          >
            {[2024, 2025, 2026, 2027].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="hidden lg:flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <span className="hidden sm:inline text-sm text-neutral-500 dark:text-neutral-400 max-w-[140px] min-w-0 truncate" title={user?.email ?? ''}>
            {user?.email ?? ''}
          </span>
          <button
            type="button"
            onClick={() => signOut()}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors min-h-[44px] touch-manipulation"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
