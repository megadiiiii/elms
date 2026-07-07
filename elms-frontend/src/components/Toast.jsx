import React, { useEffect } from 'react';
import { t } from '../api/translation';

const Toast = ({ show, message, type = 'success', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex items-start gap-3 animate-fade-in">
      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
        isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
      }`}>
        <span className="material-symbols-outlined text-xl">
          {isSuccess ? 'check_circle' : 'error'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-700">
          {isSuccess ? t('toastSuccess') : t('toastError')}
        </p>
        <p className="text-[11px] font-medium text-slate-400 mt-0.5 leading-relaxed">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0 mt-0.5"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
};

export default Toast;
