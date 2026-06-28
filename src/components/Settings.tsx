import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Monitor, Globe } from 'lucide-react';

export function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 space-y-8">
            
            {/* Theme Section */}
            <section>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <Sun className="w-4 h-4 mr-2" />
                Appearance
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    theme === 'light' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Sun className="w-6 h-6 mb-2" />
                  <span className="font-medium">Light</span>
                </button>
                
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    theme === 'dark' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Moon className="w-6 h-6 mb-2" />
                  <span className="font-medium">Dark</span>
                </button>
                
                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    theme === 'system' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Monitor className="w-6 h-6 mb-2" />
                  <span className="font-medium">System</span>
                </button>
              </div>
            </section>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* Language Section */}
            <section>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                Language
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Display Language</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred language for the interface.</p>
                  </div>
                  <select 
                    className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    defaultValue="en"
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
