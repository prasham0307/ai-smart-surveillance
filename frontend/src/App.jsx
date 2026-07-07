import { useState } from 'react';
import VideoUploader from './components/VideoUploader';
import ResultsDashboard from './components/ResultsDashboard';
import { ShieldCheck } from 'lucide-react';

function App() {
  const [videoData, setVideoData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation */}
      <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">AI Surveillance</h1>
            <p className="text-xs text-gray-400 font-medium tracking-wider uppercase">Deepmind System</p>
          </div>
        </div>
        
        {videoData && (
          <button 
            onClick={() => setVideoData(null)}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg border border-white/10"
          >
            Upload New Video
          </button>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center p-6 relative z-10 w-full max-w-7xl mx-auto">
        {!videoData ? (
          <div className="w-full flex-1 flex flex-col justify-center items-center py-12">
            <div className="text-center mb-10 max-w-2xl">
              <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
                Intelligent Threat Detection
              </h2>
              <p className="text-gray-400 text-lg">
                Upload security footage to automatically detect fires, smoke, and abandoned objects using advanced AI models.
              </p>
            </div>
            
            <VideoUploader 
              onUploadSuccess={setVideoData} 
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          </div>
        ) : (
          <ResultsDashboard data={videoData} />
        )}
      </main>
    </div>
  );
}

export default App;
