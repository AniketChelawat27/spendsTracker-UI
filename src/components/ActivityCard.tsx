import React from 'react';
import { Trash2 } from 'lucide-react';
import type { OtherActivity } from '../types';
import { formatCurrency } from '../utils/format';
import { getActivityIcon, getActivityCardBg } from '../constants/activities';
import { Button } from './UI';

const isCredit = (type: string) => type === 'Income' || type === 'Gift';

interface ActivityCardProps {
  activity: OtherActivity;
  onDelete: (id: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onDelete }) => (
  <div className={`rounded-2xl sm:rounded-3xl ${getActivityCardBg(activity.type)} p-4 sm:p-5 shadow-float hover:shadow-float-lg transition-all duration-200 group`}>
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-2xl flex-shrink-0">{getActivityIcon(activity.type)}</span>
        <div className="min-w-0">
          <h3 className="font-bold text-white truncate">{activity.title}</h3>
          <span className="text-xs font-medium text-white/80">{activity.type}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => activity.id && onDelete(activity.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-white/20 flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
    <p className="text-xl font-bold text-white">
      {isCredit(activity.type) ? '+' : '-'}
      {formatCurrency(activity.amount)}
    </p>
    <div className="flex items-center justify-between text-sm mt-2 text-white/90">
      <span className="px-2 py-1 rounded-lg bg-white/20 font-medium">{activity.person}</span>
      <span>{new Date(activity.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
    </div>
    {activity.notes && <p className="text-sm text-white/80 mt-2 italic">{activity.notes}</p>}
  </div>
);
