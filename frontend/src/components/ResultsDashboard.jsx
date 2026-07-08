import { useRef } from 'react';
import { AlertTriangle, Activity, Flame, PackageOpen, Clock, ShieldCheck } from 'lucide-react';
import CustomVideoPlayer from './CustomVideoPlayer';

export default function ResultsDashboard({ data }) {
  const playerRef = useRef(null);
  
  // Extract just the filename from the path sent by backend
  const videoFileName = data.annotated_video_path.split('\\').pop().split('/').pop();
  const videoUrl = `http://localhost:8000/outputs/${videoFileName}`;

  const getAlertIcon = (label) => {
    switch (label.toLowerCase()) {
      case 'fire':
      case 'smoke':
        return <Flame size={18} className="text-red-500" />;
      case 'abandoned object':
        return <PackageOpen size={18} className="text-amber-500" />;
      default:
        return <AlertTriangle size={18} className="text-yellow-500" />;
    }
  };

  const getAlertColor = (label) => {
    switch (label.toLowerCase()) {
      case 'fire':
      case 'smoke':
        return 'border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-200';
      case 'abandoned object':
        return 'border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-200';
      default:
        return 'border-yellow-500/30 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-200';
    }
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Video Player Section */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="text-blue-400" />
            Detection Results
          </h2>
          <div className="glass-panel px-4 py-1.5 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
            {data.frames_processed} Frames Analyzed
          </div>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden aspect-video border border-gray-200 dark:border-white/10 shadow-2xl relative">
          <CustomVideoPlayer ref={playerRef} src={videoUrl} />
        </div>
      </div>

      {/* Alerts Timeline Section */}
      <div className="w-full lg:w-96 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Incident Log</h2>
          <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse-fast">
            {data.alerts.length} Alerts
          </span>
        </div>

        <div className="glass-panel flex-1 rounded-2xl p-4 overflow-y-auto border border-gray-200 dark:border-white/10 max-h-[600px]">
          {data.alerts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3">
              <ShieldCheck size={48} className="text-green-500/50" />
              <p>No threats detected in this footage.</p>
            </div>
          ) : (
            <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 dark:before:via-white/10 before:to-transparent">
              {data.alerts.map((alert, idx) => (
                <div 
                  key={idx} 
                  onClick={() => playerRef.current?.seekTo(alert.video_time_seconds)}
                  className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active cursor-pointer hover:scale-[1.02] transition-transform duration-200`}
                >
                  
                  {/* Icon */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-[#0f1115] bg-gray-50 dark:bg-gray-800 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${getAlertColor(alert.label)}`}>
                    {getAlertIcon(alert.label)}
                  </div>
                  
                  {/* Card */}
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${getAlertColor(alert.label)} backdrop-blur-md`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold uppercase tracking-wider text-xs">
                        {alert.label}
                      </span>
                      <span className="text-xs opacity-70 flex items-center gap-1">
                        <Clock size={12} />
                        {alert.video_time_seconds}s
                      </span>
                    </div>
                    <p className="text-sm opacity-90">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
