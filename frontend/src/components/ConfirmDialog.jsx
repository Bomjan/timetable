import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div 
        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-[slideUp_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
              <AlertCircle size={20} />
            </div>
            <button 
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>
          
          <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-sm text-slate-600">{message}</p>
        </div>
        
        <div className="bg-slate-50 px-5 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm text-sm"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onCancel(); // auto close
            }}
            className="px-4 py-2 bg-red-600 border border-transparent rounded-lg text-white font-medium hover:bg-red-700 transition-colors shadow-sm text-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
