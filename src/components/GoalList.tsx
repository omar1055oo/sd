import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import { CheckCircle2, Circle, Clock, Edit2, Trash2, X, Save, AlertTriangle, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';
import { CATEGORY_LABELS, DIFFICULTY_LABELS, GoalCategory, GoalDifficulty, calculatePoints } from '../lib/points';
import { ConfettiDialog } from './ConfettiDialog';
import { SessionTimer } from './SessionTimer';

export function GoalList() {
  const { user } = useAuth();
  const { goals, profiles, refreshData, activeSessions, onlineUsers, broadcastMessage } = useAppData();
  const { showToast } = useToast();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  
  // Timer state
  const [activeTimerGoalId, setActiveTimerGoalId] = useState<string | null>(null);

  // Edit state
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<GoalCategory>('general');
  const [editDifficulty, setEditDifficulty] = useState<GoalDifficulty>('medium');
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  if (!user) return null;

  const activeGoals = goals.filter(g => g.status === 'pending');
  const myGoals = activeGoals.filter(g => g.user_id === user.id);
  const rivalGoals = activeGoals.filter(g => g.user_id !== user.id);

  const getProfileName = (userId: string) => {
    const p = profiles.find(p => p.id === userId);
    return p?.display_name || p?.email || 'Unknown';
  };

  const handleComplete = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || goal.user_id !== user.id) return;

    // Call Supabase
    const { error } = await supabase.from('goals').update({
      status: 'completed',
      completed_at: new Date().toISOString()
    }).eq('id', goalId);

    if (!error) {
      await supabase.from('points_log').insert({
        user_id: user.id,
        goal_id: goal.id,
        points_earned: goal.total_points
      });
      await refreshData();
    }
    
    setSelectedGoal(null);
  };

  const startEdit = (goal: any) => {
    setEditingGoalId(goal.id);
    setEditTitle(goal.title);
    setEditCategory(goal.category as GoalCategory);
    setEditDifficulty(goal.difficulty as GoalDifficulty);
    setDeletingGoalId(null);
  };

  const cancelEdit = () => {
    setEditingGoalId(null);
  };

  const saveEdit = async () => {
    if (!editingGoalId || !editTitle.trim()) return;
    setIsSaving(true);
    const points = calculatePoints(editCategory, editDifficulty);
    
    const { error } = await supabase.from('goals').update({
      title: editTitle.trim(),
      category: editCategory,
      difficulty: editDifficulty,
      base_points: points.base,
      multiplier: points.multiplier,
      total_points: points.total
    }).eq('id', editingGoalId);

    setIsSaving(false);
    if (!error) {
      setEditingGoalId(null);
      await refreshData();
    }
  };

  const confirmDelete = async (goalId: string) => {
    const { error } = await supabase.from('goals').delete().eq('id', goalId);
    if (!error) {
      setDeletingGoalId(null);
      await refreshData();
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Active Goals</h3>
        {myGoals.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400">You have no active goals.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myGoals.map(goal => {
              const isEditing = editingGoalId === goal.id;
              const isDeleting = deletingGoalId === goal.id;
              
              const myActiveSession = activeSessions[user.id];
              const isMyActiveGoal = myActiveSession?.goal_id === goal.id;

              if (isEditing) {
                return (
                  <div key={goal.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800 space-y-4">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                      placeholder="Goal title"
                      autoFocus
                    />
                    <div className="flex gap-3">
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as GoalCategory)}
                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      <select
                        value={editDifficulty}
                        onChange={(e) => setEditDifficulty(e.target.value as GoalDifficulty)}
                        className="w-32 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                      <button onClick={cancelEdit} className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center">
                        <X className="w-4 h-4 mr-1" /> Cancel
                      </button>
                      <button 
                        onClick={saveEdit} 
                        disabled={isSaving || !editTitle.trim()}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 mr-1" /> {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                );
              }

              if (isDeleting) {
                return (
                  <div key={goal.id} className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center text-red-700 dark:text-red-400">
                      <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span className="font-medium text-sm">Delete "{goal.title}"?</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => setDeletingGoalId(null)}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-medium border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => confirmDelete(goal.id)}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={goal.id} className={`p-4 rounded-xl shadow-sm border flex flex-col gap-3 transition-all group ${isMyActiveGoal ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500'}`}>
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => setSelectedGoal(goal.id)}
                      className="mt-1 text-gray-300 dark:text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-shrink-0"
                    >
                      <Circle className="w-6 h-6" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">{goal.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-medium">
                        {isMyActiveGoal && (
                          <span className="flex items-center text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm border border-blue-100 dark:border-blue-800 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
                            In Session
                          </span>
                        )}
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md whitespace-nowrap">
                          {CATEGORY_LABELS[goal.category as GoalCategory]}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md whitespace-nowrap">
                          {DIFFICULTY_LABELS[goal.difficulty as GoalDifficulty]}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500 flex items-center whitespace-nowrap">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDistanceToNow(new Date(goal.created_at))} ago
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="font-semibold text-amber-600 text-sm whitespace-nowrap bg-amber-50 px-2.5 py-1 rounded-lg">
                        +{goal.total_points} pts
                      </div>
                      <div className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 sm:mt-0">
                        <button 
                          onClick={async () => {
                            const { data: { user: currentUser } } = await supabase.auth.getUser();
                            if (!currentUser) return;
                            
                            const { data, error } = await supabase.from('messages').insert({
                              user_id: currentUser.id,
                              content: `I'm working on "${goal.title}".`,
                              type: 'goal_share',
                              metadata: {
                                goal_id: goal.id,
                                title: goal.title
                              }
                            }).select().single();
                            
                            if (!error && data) {
                              showToast('Goal shared to chat successfully!');
                              broadcastMessage(data);
                            } else {
                              showToast('Failed to share goal', 'error');
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Share to Chat"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                        </button>
                        <button 
                          onClick={() => setActiveTimerGoalId(goal.id)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Start/Resume Session"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => startEdit(goal)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Goal"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingGoalId(goal.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Goal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Rival's Active Goals</h3>
        {rivalGoals.length === 0 ? (
          <div className="text-center py-6 border border-transparent">
            <p className="text-gray-400 text-sm">No active goals to show.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rivalGoals.map(goal => {
              const rivalActiveSession = activeSessions[goal.user_id];
              const isBeingWorkedOn = rivalActiveSession?.goal_id === goal.id;

              return (
                <div key={goal.id} className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${isBeingWorkedOn ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-75 grayscale-[20%]'}`}>
                  <div className="mt-1 text-gray-300">
                    <Circle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-700 text-sm">{goal.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <p className="text-gray-500">{getProfileName(goal.user_id)}</p>
                      {isBeingWorkedOn && (
                        <span className="flex items-center text-blue-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
                          Working on it...
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="font-semibold text-gray-400 text-xs">
                    +{goal.total_points} pts
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {selectedGoal && (
        <ConfettiDialog 
          isOpen={!!selectedGoal} 
          onClose={() => setSelectedGoal(null)} 
          onConfirm={() => handleComplete(selectedGoal)}
          goalTitle={goals.find(g => g.id === selectedGoal)?.title || ''}
        />
      )}

      {activeTimerGoalId && (
        <SessionTimer
          goalId={activeTimerGoalId}
          goalTitle={goals.find(g => g.id === activeTimerGoalId)?.title || ''}
          onComplete={() => {
            setActiveTimerGoalId(null);
            setSelectedGoal(activeTimerGoalId); // Show confetti completion
          }}
          onCancel={() => setActiveTimerGoalId(null)}
        />
      )}
    </div>
  );
}
