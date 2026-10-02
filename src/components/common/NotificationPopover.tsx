import React, { useRef, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({ isOpen, onClose }) => {
  const { notifications, setCurrentTab } = useCRM();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl py-2"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-semibold text-slate-900">
            Action Reminders ({notifications.length})
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 rounded p-1 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-500" />
            All caught up! No overdue follow-ups or critical warnings.
          </div>
        ) : (
          notifications.map((item) => {
            const isUrgent = item.type === 'urgent';
            const isWarning = item.type === 'warning';
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.actionTab) {
                    setCurrentTab(item.actionTab);
                  }
                  onClose();
                }}
                className="group flex cursor-pointer items-start gap-3 p-3 hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    isUrgent
                      ? 'bg-rose-100 text-rose-600'
                      : isWarning
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {isUrgent ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : isWarning ? (
                    <Clock className="h-3.5 w-3.5" />
                  ) : (
                    <DollarSign className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isUrgent ? 'text-rose-900' : 'text-slate-900'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-600 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-slate-100 p-2 text-center bg-slate-50/50">
        <button
          onClick={() => {
            setCurrentTab('followups');
            onClose();
          }}
          className="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center justify-center gap-1 mx-auto"
        >
          <span>View all follow-ups</span>
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
