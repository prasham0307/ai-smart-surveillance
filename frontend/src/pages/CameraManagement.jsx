import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Camera, Plus, Trash2, Video } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function CameraManagement() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCamera, setNewCamera] = useState({ name: '', rtsp_url: '', location: '' });
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/cameras/', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCameras(response.data);
    } catch (err) {
      addToast('Failed to fetch cameras', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCamera = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/cameras/', newCamera, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      addToast('Camera added successfully', 'success');
      setNewCamera({ name: '', rtsp_url: '', location: '' });
      fetchCameras();
    } catch (err) {
      addToast('Failed to add camera. Are you a Super Admin?', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this camera?')) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/cameras/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      addToast('Camera deleted', 'success');
      fetchCameras();
    } catch (err) {
      addToast('Failed to delete camera', 'error');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-3 mb-4">
        <Camera className="text-accent w-8 h-8" />
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Camera Management</h2>
          <p className="text-gray-500 dark:text-gray-400">Add or remove RTSP IP Camera streams (Super Admin Only)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-2xl border border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add New Camera</h3>
            <form onSubmit={handleAddCamera} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Camera Name</label>
                <input 
                  required value={newCamera.name} onChange={e => setNewCamera({...newCamera, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2 text-gray-900 dark:text-white"
                  placeholder="e.g. Lobby Entrance"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">RTSP Stream URL</label>
                <input 
                  required value={newCamera.rtsp_url} onChange={e => setNewCamera({...newCamera, rtsp_url: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2 text-gray-900 dark:text-white"
                  placeholder="rtsp://admin:pass@192.168.1.10:554/stream1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input 
                  value={newCamera.location} onChange={e => setNewCamera({...newCamera, location: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2 text-gray-900 dark:text-white"
                  placeholder="e.g. First Floor"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-accent hover:bg-blue-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                <Plus size={18} /> Add Stream
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <p className="text-gray-500">Loading cameras...</p>
          ) : cameras.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-2xl border border-gray-200 dark:border-white/10 text-gray-500">
              No custom cameras added yet. The system will default to your laptop webcam (0).
            </div>
          ) : (
            cameras.map(cam => (
              <div key={cam.id} className="glass-panel p-5 rounded-2xl border border-gray-200 dark:border-white/10 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
                    <Video size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{cam.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{cam.rtsp_url}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(cam.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
