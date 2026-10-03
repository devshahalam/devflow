import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
  confirmText = 'Delete',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3 text-rose-600 border-b border-slate-100 pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 shrink-0">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">Please confirm this action</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
