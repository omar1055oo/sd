import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { CATEGORY_LABELS, DIFFICULTY_LABELS, calculatePoints, GoalCategory, GoalDifficulty } from '../lib/points';

export function CreateGoal() {
  const { user } = useAuth();
  const { refreshData } = useAppData();
  const [isExpanding, setIsExpanding] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('general');
  const [difficulty, setDifficulty] = useState<GoalDifficulty>('medium');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const points = calculatePoints(category, difficulty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    const { error } = await supabase.from('goals').insert({
      user_id: user.id,
      title: title.trim(),
      category,
      difficulty,
      base_points: points.base,
      multiplier: points.multiplier,
      total_points: points.total,
      status: 'pending'
    });
    
    setLoading(false);

    if (error) {
      console.error('Error inserting goal:', error);
      setErrorMsg(error.message);
      return;
    }

    await refreshData();
    
    setTitle('');
    setCategory('general');
    setDifficulty('medium');
    setIsExpanding(false);
    setLoading(false);
  };

  if (!isExpanding) {
    return (
      <button 
        onClick={() => setIsExpanding(true)}
        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-medium"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create New Goal
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Goal</h3>
      
      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you want to accomplish?"
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400 dark:placeholder-gray-500"
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GoalCategory)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as GoalDifficulty)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Reward: </span>
            <span className="font-semibold text-amber-600 dark:text-amber-500">+{points.total} pts</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsExpanding(false)}
              className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Add Goal'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
