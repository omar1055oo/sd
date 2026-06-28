import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Leaderboard } from './Leaderboard';
import { CreateGoal } from './CreateGoal';
import { GoalList } from './GoalList';
import { History } from './History';
import { Chat } from './Chat';
import { Settings } from './Settings';
import { LogOut, LayoutDashboard, History as HistoryIcon, MessageCircle, Settings as SettingsIcon } from 'lucide-react';

type Tab = 'dashboard' | 'history' | 'chat' | 'settings';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 transition-colors">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Versus</h1>
              <div className="hidden sm:flex space-x-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    activeTab === 'history' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <HistoryIcon className="w-4 h-4 mr-2" />
                  History
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    activeTab === 'chat' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    activeTab === 'settings' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Settings
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4 hidden sm:block">{user?.email}</span>
              <button
                onClick={signOut}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className="sm:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex space-x-2 overflow-x-auto transition-colors">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-2 rounded-md text-sm font-medium flex-1 flex justify-center items-center ${
            activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-2 rounded-md text-sm font-medium flex-1 flex justify-center items-center ${
            activeTab === 'history' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          <HistoryIcon className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">History</span>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-3 py-2 rounded-md text-sm font-medium flex-1 flex justify-center items-center ${
            activeTab === 'chat' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-2 rounded-md text-sm font-medium flex-1 flex justify-center items-center ${
            activeTab === 'settings' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          <SettingsIcon className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <CreateGoal />
              <GoalList />
            </div>
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <Leaderboard />
              </div>
            </div>
          </div>
        ) : activeTab === 'history' ? (
          <History />
        ) : activeTab === 'settings' ? (
          <Settings />
        ) : (
          <Chat />
        )}
      </main>
    </div>
  );
}
