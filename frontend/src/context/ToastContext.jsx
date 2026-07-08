import { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, X, Bell } from 'lucide-react';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-right-8 duration-300 ${
              toast.type === 'error' || toast.type === 'alert'
                ? 'bg-red-50 dark:bg-red-500/20 border-red-200 dark:border-red-500/50 text-red-900 dark:text-red-100'
                : 'bg-blue-50 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/50 text-blue-900 dark:text-blue-100'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'error' || toast.type === 'alert' ? (
                <AlertCircle className="text-red-400" size={20} />
              ) : (
                <Bell className="text-blue-400" size={20} />
              )}
            </div>
            
            <div className="flex-1 text-sm font-medium leading-relaxed">
              {toast.message}
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={16} className="opacity-70" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
