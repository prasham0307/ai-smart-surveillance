import { ShieldCheck, Video, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardOverview() {
  const navigate = useNavigate();
  const stats = [
    { label: 'System Health', value: 'Optimal', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
    { label: 'Active Cameras', value: '1', icon: Video, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Incidents Today', value: '14', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Critical Threats', value: '2', icon: ShieldCheck, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Command Center</h2>
          <p className="text-gray-500 dark:text-gray-400">Overview of your security infrastructure and AI models.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/upload')}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-colors"
          >
            Upload Footage
          </button>
          <button 
            onClick={() => navigate('/live')}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          >
            Open Live Camera
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`glass-panel p-6 rounded-2xl border flex items-start justify-between ${stat.bg}`}>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-white dark:bg-black/20 ${stat.color} shadow-sm dark:shadow-none`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Hero Graphic / Map Placeholder */}
      <div className="glass-panel w-full aspect-[21/9] rounded-2xl border border-gray-200 dark:border-white/5 flex items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 dark:from-blue-900/20 to-transparent" />
        
        <div className="text-center z-10">
          <ShieldCheck size={64} className="mx-auto mb-4 text-blue-300 dark:text-blue-500/50 group-hover:text-blue-400 transition-colors duration-500" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-300">All Systems Nominal</h3>
          <p className="text-sm text-gray-500 mt-2">AI detection pipelines are running smoothly.</p>
        </div>
      </div>

    </div>
  );
}
