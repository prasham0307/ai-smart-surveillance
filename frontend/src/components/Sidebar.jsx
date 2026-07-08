import { ShieldCheck, Video, UploadCloud, History, Settings as SettingsIcon, Activity } from 'lucide-react';

export default function Sidebar({ activeMode, setActiveMode }) {
  const menuItems = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard Overview' },
    { id: 'live', icon: Video, label: 'Live Cameras' },
    { id: 'upload', icon: UploadCloud, label: 'Upload Footage' },
    { id: 'history', icon: History, label: 'Incident History' },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-gray-200 dark:border-white/5 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="p-6">
        {/* Logo Area */}
        <div className="flex items-center space-x-3 mb-10">
          <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] dark:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">AI Surveillance</h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase">Deepmind System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-4 px-3">Main Menu</p>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMode === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveMode(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200 border border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Settings */}
      <div className="p-6 border-t border-gray-200 dark:border-white/5">
        <button 
          onClick={() => setActiveMode('settings')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border group ${
            activeMode === 'settings'
              ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200 border-transparent'
          }`}
        >
          <SettingsIcon size={18} className={activeMode === 'settings' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'} />
          <span>System Settings</span>
        </button>
      </div>
    </aside>
  );
}
