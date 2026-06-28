import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Leaderboard } from './Leaderboard';
import { CreateGoal } from './CreateGoal';
import { GoalList } from './GoalList';
import { History } from './History';
import { Chat } from './Chat';
import { LogOut, LayoutDashboard, History as HistoryIcon, MessageCircle } from 'lucide-react';

type Tab = 'dashboard' | 'history' | 'chat';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50/50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Versus</h1>
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
      <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-2 flex space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-2 rounded-md text-sm font-medium flex-1 flex justify-center items-center ${
            activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-2 rounded-md text-sm font-medium flex-1 flex justify-center items-center ${
            activeTab === 'history' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
          }`}
        >
          <HistoryIcon className="w-4 h-4 mr-2" />
          History
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-3 py-2 rounded-md text-sm font-medium flex-1 flex justify-center items-center ${
            activeTab === 'chat' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
          }`}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat
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
        ) : (
          <Chat />
        )}
      </main>
    </div>
  );
}
