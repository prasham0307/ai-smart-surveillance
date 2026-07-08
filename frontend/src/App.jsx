import { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import VideoUploader from './components/VideoUploader';
import ResultsDashboard from './components/ResultsDashboard';
import LiveCamera from './components/LiveCamera';
import Settings from './components/Settings';

function App() {
  const [activeMode, setActiveMode] = useState('dashboard');
  const [videoData, setVideoData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUploadSuccess = (data) => {
    setVideoData(data);
    setActiveMode('upload');
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 flex overflow-hidden relative transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <Sidebar activeMode={activeMode} setActiveMode={setActiveMode} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-8 relative z-10 overflow-y-auto">
        {activeMode === 'dashboard' && (
          <DashboardOverview setActiveMode={setActiveMode} />
        )}

        {activeMode === 'live' && (
          <LiveCamera />
        )}

        {activeMode === 'upload' && (
          !videoData ? (
            <div className="w-full h-full flex flex-col justify-center items-center">
              <div className="text-center mb-10 max-w-2xl animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                  Intelligent Threat Detection
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Upload security footage to automatically detect fires, smoke, and abandoned objects using advanced AI models.
                </p>
              </div>
              
              <VideoUploader 
                onUploadSuccess={handleUploadSuccess} 
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            </div>
          ) : (
            <div className="w-full flex flex-col space-y-4 animate-in fade-in">
              <button 
                onClick={() => setVideoData(null)}
                className="self-start text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center gap-2"
              >
                ← Back to Upload
              </button>
              <ResultsDashboard data={videoData} />
            </div>
          )
        )}
        
        {activeMode === 'history' && (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <p>Incident History module will be connected to the database in Phase 3.</p>
          </div>
        )}

        {activeMode === 'settings' && (
          <Settings />
        )}
      </main>
    </div>
  );
}

export default App;
