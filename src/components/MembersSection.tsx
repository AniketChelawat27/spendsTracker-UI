import React, { useState } from 'react';
import { useMembers } from '../MembersContext';
import { Button, Input, Panel } from './UI';
import { Users, Trash2, Loader2, UserPlus, ChevronRight } from 'lucide-react';

/* Clay-style solid blocks: card background + white text */
const MEMBER_CARD_BG = [
  'bg-clay-blue',
  'bg-clay-purple',
  'bg-clay-green',
  'bg-clay-orange',
];

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export const MembersSection: React.FC = () => {
  const { members, loading, addMember, removeMember } = useMembers();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await addMember(trimmed);
      setName('');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-10 h-10 text-clay-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-fade-in max-w-5xl">
      <section>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
          Household members
        </h1>
        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 mt-2 max-w-xl">
          Add everyone who shares this budget. Assign salaries, expenses, and investments to each person.
        </p>
      </section>

      {/* Add member – form card */}
      <Panel title="Add a member" description="Enter a name to add to your household" accent="blue">
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aniket, Father, Mother"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={submitting || !name.trim()} className="min-w-[120px]">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Add member
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Panel>

      {/* Member cards – testimonial style */}
      {members.length === 0 ? (
        <Panel accent="none" className="text-center py-16 border border-dashed border-border dark:border-border-dark">
          <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-5">
            <Users className="w-10 h-10 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-2">No members yet</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Add your first household member above. You’ll then be able to assign entries to each person in Salary, Expenses, and more.
          </p>
        </Panel>
      ) : (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">Your household</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {members.map((m, i) => (
              <div
                key={m.id}
                className={`rounded-2xl sm:rounded-3xl ${MEMBER_CARD_BG[i % MEMBER_CARD_BG.length]} p-6 shadow-float hover:shadow-float-lg transition-all duration-200 group`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                      {getInitial(m.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{m.name}</p>
                      <p className="text-sm text-white/80">Household member</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.confirm(`Remove "${m.name}"?`) && removeMember(m.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-white/20 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
