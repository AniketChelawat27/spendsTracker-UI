import React from 'react';
import { Moon, Sun, Users, User } from 'lucide-react';
import { useApp } from '../AppContext';
import { useMembers } from '../MembersContext';
import { Select } from './UI';

export const SettingsSection: React.FC = () => {
  const { viewScope, setViewScope, myMemberName, setMyMemberName, isDarkMode, toggleDarkMode } = useApp();
  const { members } = useMembers();

  const handleSetViewScope = (scope: 'household' | 'personal') => {
    setViewScope(scope);
    if (scope === 'personal' && members.length > 0 && !myMemberName) {
      setMyMemberName(members[0].name);
    }
  };

  const memberOptions = members.map((m) => ({ value: m.name, label: m.name }));

  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Appearance and view</p>
      </div>

      <section className="rounded-xl border border-border dark:border-border-dark bg-white/50 dark:bg-neutral-900/50 p-4">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Appearance</p>
        <div className="flex rounded-lg border border-border dark:border-border-dark overflow-hidden bg-neutral-50/50 dark:bg-neutral-800/30">
          <button
            type="button"
            onClick={() => isDarkMode && toggleDarkMode()}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium min-h-[40px] touch-manipulation transition-colors ${
              !isDarkMode
                ? 'bg-white dark:bg-neutral-700 text-primary-700 dark:text-primary-400 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
            aria-label="Light mode"
          >
            <Sun className="w-3.5 h-3.5" />
            Light
          </button>
          <button
            type="button"
            onClick={() => !isDarkMode && toggleDarkMode()}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium min-h-[40px] touch-manipulation transition-colors ${
              isDarkMode
                ? 'bg-white dark:bg-neutral-700 text-primary-700 dark:text-primary-400 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
            aria-label="Dark mode"
          >
            <Moon className="w-3.5 h-3.5" />
            Dark
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-border dark:border-border-dark bg-white/50 dark:bg-neutral-900/50 p-4">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Data view</p>
        <div className="flex rounded-lg border border-border dark:border-border-dark overflow-hidden bg-neutral-50/50 dark:bg-neutral-800/30">
          <button
            type="button"
            onClick={() => handleSetViewScope('household')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium min-h-[40px] touch-manipulation transition-colors ${
              viewScope === 'household'
                ? 'bg-white dark:bg-neutral-700 text-primary-700 dark:text-primary-400 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
            aria-label="Household view"
          >
            <Users className="w-3.5 h-3.5" />
            Household
          </button>
          <button
            type="button"
            onClick={() => handleSetViewScope('personal')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium min-h-[40px] touch-manipulation transition-colors ${
              viewScope === 'personal'
                ? 'bg-white dark:bg-neutral-700 text-primary-700 dark:text-primary-400 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
            aria-label="Personal view"
          >
            <User className="w-3.5 h-3.5" />
            Personal
          </button>
        </div>
        {viewScope === 'personal' && members.length > 0 && (
          <div className="mt-3">
            <Select
              label="I am"
              value={myMemberName}
              onChange={(e) => setMyMemberName(e.target.value)}
              options={memberOptions}
              className="[&_select]:min-h-[40px] [&_select]:py-2 [&_select]:text-sm"
            />
          </div>
        )}
      </section>
    </div>
  );
};
