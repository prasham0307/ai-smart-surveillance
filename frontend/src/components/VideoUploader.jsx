import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileVideo, AlertCircle, Loader2, Terminal } from 'lucide-react';

function TerminalScroller() {
  const [logs, setLogs] = useState([]);
  
  const mockLogs = [
    "[SYSTEM] Initiating DeepMind Video Processor...",
    "[WORKER] Extracting raw frames from video stream...",
    "[AI_ENGINE] Loading YOLOv8 weights for object detection...",
    "[AI_ENGINE] Loading Fire/Smoke fine-tuned weights...",
    "[PIPELINE] Processing frame batch 1-250...",
    "[TRACKER] Applying 5s grace-period logic to stationary objects...",
    "[PIPELINE] Processing frame batch 251-500...",
    "[ANALYSIS] Threat analysis complete. Rendering bounding boxes...",
    "[ENCODER] Compressing annotated MP4 file...",
    "[SYSTEM] Uploading results to dashboard..."
  ];

  useEffect(() => {
    let currentIndex = 0;
    let batchNumber = 500;
    setLogs([mockLogs[0]]);
    
    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex < mockLogs.length) {
        setLogs(prev => [...prev.slice(-9), mockLogs[currentIndex]]);
      } else {
        // Infinite loop for long CPU processing times
        batchNumber += 250;
        setLogs(prev => [...prev.slice(-9), `[PIPELINE] Processing frame batch ${batchNumber - 249}-${batchNumber}...`]);
      }
    }, 2500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel w-full max-w-xl rounded-2xl p-8 flex flex-col space-y-6 bg-[#0a0a0a]">
      <div className="flex items-center gap-3 mb-2 border-b border-white/10 pb-4">
        <Terminal className="text-blue-400" />
        <h3 className="text-lg font-bold text-white">AI Analysis in Progress</h3>
      </div>
      
      <div className="flex-1 font-mono text-sm space-y-2 h-48 overflow-y-hidden relative">
        {logs.map((log, i) => (
          <div key={i} className={`animate-in fade-in slide-in-from-bottom-2 ${i === logs.length - 1 ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
            <span className="text-green-500/70 mr-2">❯</span> {log}
          </div>
        ))}
        {logs.length < mockLogs.length && (
          <div className="text-blue-400 animate-pulse mt-2">
            <span className="text-green-500/70 mr-2">❯</span> _
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideoUploader({ onUploadSuccess, isProcessing, setIsProcessing }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    setError(null);
    if (!selectedFile.type.startsWith('video/')) {
      setError('Please upload a valid video file (.mp4, .avi, etc).');
      return;
    }
    setFile(selectedFile);
  };

  const uploadVideo = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Server error occurred during upload.');
      }

      const data = await response.json();
      onUploadSuccess(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to the backend server.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return <TerminalScroller />;
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div 
        className={`glass-panel w-full rounded-2xl p-8 border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] cursor-pointer
          ${dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 hover:bg-gray-50 dark:hover:bg-white/5'}
          ${file ? 'border-green-500/50 bg-green-500/5' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept="video/*" 
          className="hidden" 
          onChange={handleChange}
        />
        
        {file ? (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-green-500/20 rounded-full text-green-400">
              <FileVideo size={48} />
            </div>
            <div>
              <p className="text-white font-medium text-lg">{file.name}</p>
              <p className="text-gray-400 text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-4 pointer-events-none">
            <div className="p-4 bg-blue-500/10 rounded-full text-blue-500 dark:text-blue-400">
              <UploadCloud size={48} />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-medium text-lg mb-1">Click or drag video to upload</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Supports MP4, AVI, MKV up to 50MB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-3 text-red-400">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {file && (
        <button 
          onClick={uploadVideo}
          className="w-full mt-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-[0.98]"
        >
          Run AI Detection
        </button>
      )}
    </div>
  );
}
