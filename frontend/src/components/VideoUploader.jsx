import { useState, useRef } from 'react';
import { UploadCloud, FileVideo, AlertCircle, Loader2 } from 'lucide-react';

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
    return (
      <div className="glass-panel w-full max-w-xl rounded-2xl p-12 flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
          <Loader2 size={64} className="text-blue-400 animate-spin relative z-10" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Analyzing Footage...</h3>
          <p className="text-gray-400 text-sm">
            Running DeepMind YOLOv8 engine. This may take a minute depending on video length.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl">
      <div 
        className={`glass-panel w-full rounded-2xl p-8 border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] cursor-pointer
          ${dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}
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
            <div className="p-4 bg-blue-500/10 rounded-full text-blue-400">
              <UploadCloud size={48} />
            </div>
            <div>
              <p className="text-white font-medium text-lg mb-1">Click or drag video to upload</p>
              <p className="text-gray-400 text-sm">Supports MP4, AVI, MKV up to 50MB</p>
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
