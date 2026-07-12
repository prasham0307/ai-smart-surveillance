import { useEffect, useRef } from 'react';
import { Activity, Flame, PackageOpen, AlertTriangle, Clock, Radio, PowerOff, ShieldCheck } from 'lucide-react';
import { useLiveStream } from '../context/LiveStreamContext';

export default function LiveCamera() {
  const {
    cameras,
    selectedCameraId,
    setSelectedCameraId,
    isConnected,
    latestFrame,
    alerts,
    framesProcessed,
    connectWebSocket,
    disconnectWebSocket
  } = useLiveStream();

  const alertsEndRef = useRef(null);

  // Auto-scroll alerts only if the user hasn't manually scrolled up
  useEffect(() => {
    const container = alertsEndRef.current?.parentElement;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (isNearBottom) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [alerts]);

  const getAlertIcon = (label) => {
    switch (label.toLowerCase()) {
      case 'fire':
      case 'smoke':
      case 'fire-smoke':
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
      case 'fire-smoke':
        return 'border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-200';
      case 'abandoned object':
        return 'border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-200';
      default:
        return 'border-yellow-500/30 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-200';
    }
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Live Video Section */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {isConnected ? (
              <Radio className="text-red-500 animate-pulse" />
            ) : (
              <Activity className="text-gray-400 dark:text-gray-500" />
            )}
            Live Camera Feed
          </h2>
          <div className="flex items-center gap-4">
            {!isConnected && (
              <select 
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">Default Webcam (0)</option>
                {cameras.map(cam => (
                  <option key={cam.id} value={cam.id}>{cam.name}</option>
                ))}
              </select>
            )}
            {isConnected && (
              <span className="glass-panel px-4 py-1.5 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                {framesProcessed} Frames Processed
              </span>
            )}
            
            <button
              onClick={isConnected ? disconnectWebSocket : connectWebSocket}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isConnected 
                  ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20' 
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              }`}
            >
              {isConnected ? (
                <>
                  <PowerOff size={16} /> Stop Camera
                </>
              ) : (
                <>
                  <Radio size={16} /> Start Live Stream
                </>
              )}
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden aspect-video border border-gray-200 dark:border-white/10 shadow-2xl relative bg-gray-100 dark:bg-black flex items-center justify-center">
          {isConnected ? (
            latestFrame ? (
              <img 
                src={latestFrame} 
                alt="Live Webcam Feed" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400 animate-pulse">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p>Connecting to camera & AI engine...</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-4 text-gray-500">
              <Radio size={48} className="opacity-50" />
              <p className="text-lg">Camera is currently offline</p>
              <p className="text-sm">Select a camera above and start the stream.</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Alerts Timeline */}
      <div className="w-full lg:w-96 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Live Incident Log</h2>
          <span className={`${alerts.length > 0 ? 'bg-red-500 animate-pulse-fast text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'} text-xs font-bold px-2.5 py-1 rounded-full transition-colors`}>
            {alerts.length} Alerts
          </span>
        </div>

        <div className="glass-panel flex-1 rounded-2xl p-4 overflow-y-auto border border-white/10 max-h-[600px]">
          {!isConnected && alerts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 text-sm text-center px-4">
              <Activity size={32} className="mb-2 opacity-50" />
              <p>Start the live stream to begin monitoring for threats.</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-green-500/70 space-y-3">
              <ShieldCheck size={48} className="animate-pulse" />
              <p>Monitoring active. No threats detected.</p>
            </div>
          ) : (
            <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {alerts.map((alert, idx) => (
                <div key={idx} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active animate-in fade-in slide-in-from-top-2 duration-300`}>
                  
                  {/* Icon */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-[#0f1115] bg-gray-50 dark:bg-gray-800 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${getAlertColor(alert.label)}`}>
                    {getAlertIcon(alert.label)}
                  </div>
                  
                  {/* Card */}
                  <div 
                    className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${getAlertColor(alert.label)} backdrop-blur-md cursor-pointer transition-all hover:scale-[1.02]`}
                    onClick={(e) => {
                      const img = e.currentTarget.querySelector('img');
                      if (img) img.classList.toggle('hidden');
                    }}
                  >
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
                    
                    {/* Expandable Thumbnail */}
                    {alert.thumbnail && (
                      <img 
                        src={`data:image/jpeg;base64,${alert.thumbnail}`}
                        alt="Threat snapshot" 
                        className="w-full mt-3 rounded-lg border border-white/20 hidden transition-all"
                      />
                    )}
                  </div>
                </div>
              ))}
              <div ref={alertsEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
