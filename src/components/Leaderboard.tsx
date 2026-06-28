import React from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { motion } from 'motion/react';

export function Leaderboard() {
  const { profiles, onlineUsers } = useAppData();

  if (profiles.length === 0) return null;

  // Assuming max 2 profiles for the "Versus" concept
  const sortedProfiles = [...profiles].sort((a, b) => b.total_points - a.total_points);
  
  const topScore = sortedProfiles[0]?.total_points || 1; // Prevent division by zero
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center justify-between">
        <span>Leaderboard</span>
        <span className="text-xs font-medium px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
          Live
        </span>
      </h2>
      
      <div className="space-y-6">
        {sortedProfiles.map((profile, index) => {
          const progressPercentage = Math.max(5, (profile.total_points / topScore) * 100);
          const isOnline = onlineUsers.includes(profile.id);
          
          return (
            <motion.div 
              key={profile.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`font-bold w-4 text-center ${index === 0 ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
                    {index + 1}
                  </span>
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex-shrink-0">
                      <img src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`} alt={profile.display_name || ''} className="w-full h-full object-cover" />
                    </div>
                    {isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    )}
                  </div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{profile.display_name || profile.email}</span>
                </div>
                <div className="font-mono font-semibold text-gray-900 dark:text-white">
                  {profile.total_points.toLocaleString()} <span className="text-gray-400 dark:text-gray-500 text-sm font-sans font-normal">pts</span>
                </div>
              </div>
              
              <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-gray-400'}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {profiles.length > 1 && (
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Current Lead</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              +{sortedProfiles[0].total_points - sortedProfiles[1].total_points} pts
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
