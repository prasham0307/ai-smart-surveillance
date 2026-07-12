import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { History, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function IncidentHistory() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/incidents/', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setIncidents(response.data);
      } catch (err) {
        addToast('Failed to fetch incidents', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, [user.token, addToast]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-3 mb-4">
        <History className="text-accent w-8 h-8" />
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Incident History</h2>
          <p className="text-gray-500 dark:text-gray-400">Permanent record of all AI detections</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-white/10">
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Alert Type</th>
                <th className="p-4 font-medium">Confidence</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading incidents...</td></tr>
              ) : incidents.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">No incidents recorded yet.</td></tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 text-sm text-gray-900 dark:text-gray-200">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        {new Date(inc.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        inc.alert_type.includes('fire') 
                          ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}>
                        {inc.alert_type.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-900 dark:text-gray-200">
                      {(inc.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                        <ShieldAlert size={16} /> {inc.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
