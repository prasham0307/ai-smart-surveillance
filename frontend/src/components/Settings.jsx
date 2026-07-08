import { useTheme } from '../context/ThemeContext';
import { Settings as SettingsIcon, Moon, Sun, MonitorSmartphone } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-4">
        <SettingsIcon size={28} className="text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h2>
      </div>

      <div className="glass-panel p-8 rounded-2xl max-w-2xl">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-white/10 pb-4">Appearance</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-lg flex items-center gap-2">
              Theme Preference
            </p>
            <p className="text-gray-500 text-sm mt-1">Switch between Light and Dark mode across the entire application.</p>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="relative flex items-center bg-gray-200 dark:bg-gray-800 rounded-full p-1 w-24 h-12 transition-colors duration-300 shadow-inner"
          >
            <div className={`absolute left-1 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center transition-transform duration-300 ${theme === 'dark' ? 'translate-x-12' : 'translate-x-0'}`}>
              {theme === 'dark' ? (
                <Moon size={20} className="text-gray-800" />
              ) : (
                <Sun size={20} className="text-amber-500" />
              )}
            </div>
            
            {/* Icons in background */}
            <div className="w-full flex justify-between px-3 text-gray-400 dark:text-gray-500 pointer-events-none">
              <Sun size={18} />
              <Moon size={18} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
