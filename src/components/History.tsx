import React, { useState } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import { format, isThisWeek, isThisMonth } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
import { CATEGORY_LABELS, GoalCategory } from '../lib/points';

type FilterType = 'all' | 'week' | 'month';

export function History() {
  const { goals, profiles } = useAppData();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<FilterType>('all');

  const completedGoals = goals.filter(g => g.status === 'completed' && g.completed_at);

  const filteredGoals = completedGoals.filter(goal => {
    if (!goal.completed_at) return false;
    const date = new Date(goal.completed_at);
    if (filter === 'week') return isThisWeek(date);
    if (filter === 'month') return isThisMonth(date);
    return true;
  });

  const getProfileName = (userId: string) => {
    const p = profiles.find(p => p.id === userId);
    return p?.display_name || p?.email || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">History & Logs</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['all', 'week', 'month'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'all' ? 'All Time' : `This ${f}`}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {filteredGoals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No completed goals found for this period.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredGoals.map((goal) => (
              <li key={goal.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors group">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0 text-green-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{goal.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium text-gray-700">{getProfileName(goal.user_id)}</span>
                        <span>•</span>
                        <span>{format(new Date(goal.completed_at!), 'MMM d, h:mm a')}</span>
                        <span>•</span>
                        <span>{CATEGORY_LABELS[goal.category as GoalCategory]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-sm font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                      +{goal.total_points}
                    </div>
                    <button
                      onClick={async () => {
                        const { supabase } = await import('../lib/supabase');
                        const { data: { user: currentUser } } = await supabase.auth.getUser();
                        if (!currentUser) return;
                        
                        const { error } = await supabase.from('messages').insert({
                          user_id: currentUser.id,
                          content: `I completed "${goal.title}" and earned ${goal.total_points} points!`,
                          type: 'achievement',
                          metadata: {
                            goal_id: goal.id,
                            title: goal.title,
                            points: goal.total_points
                          }
                        });

                        if (!error) {
                          showToast('Achievement shared to chat!');
                        } else {
                          showToast('Failed to share achievement', 'error');
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Share in Chat
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
