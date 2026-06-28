import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Check, X, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import { formatDistanceToNow } from 'date-fns';

interface SessionTimerProps {
  goalId: string;
  goalTitle: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function SessionTimer({ goalId, goalTitle, onComplete, onCancel }: SessionTimerProps) {
  const { setMyActiveSession, broadcastMessage } = useAppData();
  const { showToast } = useToast();
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedSessionStr = localStorage.getItem('versus_active_session');
    if (savedSessionStr) {
      const session = JSON.parse(savedSessionStr);
      if (session.goal_id === goalId) {
        const start = new Date(session.started_at).getTime();
        const end = start + session.duration_minutes * 60000;
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((end - now) / 1000));
        
        setDurationMinutes(session.duration_minutes);
        
        if (remaining > 0) {
          setTimeLeft(remaining);
          setIsRunning(true);
        } else {
          setTimeLeft(0);
          setIsFinished(true);
        }
      }
    }
  }, [goalId]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        const savedSessionStr = localStorage.getItem('versus_active_session');
        if (savedSessionStr) {
           const session = JSON.parse(savedSessionStr);
           if (session.goal_id === goalId) {
             const start = new Date(session.started_at).getTime();
             const end = start + session.duration_minutes * 60000;
             const now = Date.now();
             const remaining = Math.max(0, Math.floor((end - now) / 1000));
             
             if (remaining <= 0) {
               setTimeLeft(0);
               setIsFinished(true);
               setIsRunning(false);
             } else {
               setTimeLeft(remaining);
             }
           }
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, goalId]);

  const handleStart = async () => {
    const session = {
      goal_id: goalId,
      started_at: new Date().toISOString(),
      duration_minutes: durationMinutes
    };
    localStorage.setItem('versus_active_session', JSON.stringify(session));
    await setMyActiveSession(session);
    setTimeLeft(durationMinutes * 60);
    setIsRunning(true);
    setIsFinished(false);
  };

  const handleStop = async () => {
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(durationMinutes * 60);
    localStorage.removeItem('versus_active_session');
    await setMyActiveSession(null);
  };

  const handleFinish = async () => {
    localStorage.removeItem('versus_active_session');
    await setMyActiveSession(null);
    onComplete(); // This should trigger the confetti dialog
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative border border-gray-100 dark:border-gray-700"
      >
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
            <Timer className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Study Session</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-[250px] truncate" title={goalTitle}>
            {goalTitle}
          </p>

          {!isRunning && !isFinished ? (
            <div className="w-full space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (Minutes)
                </label>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                  {[15, 25, 45, 60].map(mins => (
                    <button
                      key={mins}
                      onClick={() => setDurationMinutes(mins)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        durationMinutes === mins 
                          ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-sm' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {mins}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Custom:</span>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">mins</span>
                </div>
              </div>
              
              <button
                onClick={handleStart}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                Start Timer
              </button>
            </div>
          ) : isFinished ? (
            <div className="w-full space-y-4">
              <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white mb-4">
                00:00
              </div>
              <p className="text-gray-800 dark:text-gray-200 font-medium mb-4">Time's up! Did you complete this goal?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { handleStop(); onCancel(); }}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Not Yet
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Finished
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6">
              <div className="relative flex justify-center items-center">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-100 dark:text-gray-700"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 88}
                    strokeDashoffset={
                      2 * Math.PI * 88 * (1 - timeLeft / (durationMinutes * 60))
                    }
                    className="text-blue-600 transition-all duration-1000 ease-linear"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-4xl font-mono font-bold text-gray-900 dark:text-white">
                  {formatTime(timeLeft)}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleStop}
                  className="flex-1 py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Square className="w-4 h-4" fill="currentColor" />
                  Stop
                </button>
                <button
                  onClick={async () => {
                    const { supabase } = await import('../lib/supabase');
                    const { data: { user: currentUser } } = await supabase.auth.getUser();
                    if (!currentUser) return;
                    
                    const { data, error } = await supabase.from('messages').insert({
                      user_id: currentUser.id,
                      content: `I'm studying "${goalTitle}" for ${durationMinutes} mins. Join me!`,
                      type: 'session_invite',
                      metadata: {
                        goal_id: goalId,
                        title: goalTitle,
                        duration_minutes: durationMinutes
                      }
                    }).select().single();

                    if (!error && data) {
                      showToast('Session invite shared to chat!');
                      broadcastMessage(data);
                    } else {
                      showToast('Failed to share invite', 'error');
                    }
                  }}
                  className="flex-1 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2 text-sm"
                  title="Share Invite to Chat"
                >
                  <Timer className="w-4 h-4" />
                  Invite
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Check className="w-4 h-4" />
                  Finish
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
