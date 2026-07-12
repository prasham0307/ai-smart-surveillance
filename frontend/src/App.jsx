import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import VideoUploader from './components/VideoUploader';
import ResultsDashboard from './components/ResultsDashboard';
import LiveCamera from './components/LiveCamera';
import Settings from './components/Settings';
import Login from './pages/Login';
import IncidentHistory from './pages/IncidentHistory';
import CameraManagement from './pages/CameraManagement';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function App() {
  const [videoData, setVideoData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { loading } = useAuth();
  const location = useLocation();

  const handleUploadSuccess = (data) => {
    setVideoData(data);
  };

  if (loading) return <div className="h-screen bg-gray-50 dark:bg-[#0a0a0a]"></div>;

  const isLoginPage = location.pathname === '/login';

  return (
    <div className="h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 flex overflow-hidden relative transition-colors duration-300">
      
      {!isLoginPage && <Sidebar />}

      <main className="flex-1 flex flex-col p-8 relative z-10 overflow-y-auto">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><DashboardOverview /></ProtectedRoute>} />
          <Route path="/live" element={<ProtectedRoute><LiveCamera /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><IncidentHistory /></ProtectedRoute>} />
          <Route path="/cameras" element={<ProtectedRoute><CameraManagement /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          
          <Route path="/upload" element={
            <ProtectedRoute>
              {!videoData ? (
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
              )}
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;
