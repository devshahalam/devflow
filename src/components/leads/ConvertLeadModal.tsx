import React, { useState } from 'react';
import { X, CheckCircle2, FolderGit, Calendar, DollarSign } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Currency, Lead } from '../../types/crm';

interface ConvertLeadModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (clientId: string) => void;
}

export const ConvertLeadModal: React.FC<ConvertLeadModalProps> = ({
  lead,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { convertLeadToClient, formatCurrency } = useCRM();

  const [projectName, setProjectName] = useState(
    `${lead.businessName} - ${lead.serviceName}`
  );
  const currency: Currency = lead.currency || 'USD';
  const [projectValue, setProjectValue] = useState<number>(
    lead.dealValue && lead.dealValue > 0 ? lead.dealValue : currency === 'BDT' ? 35000 : 1000
  );
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21); // 3 weeks
    return d.toISOString().split('T')[0];
  });

  if (!isOpen) return null;

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    const result = convertLeadToClient(lead.id, {
      projectName: projectName.trim(),
      projectValue: Number(projectValue) || 0,
      deadline,
    });
    onSuccess(result.client.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
            <h2 className="text-base font-bold text-slate-900">
              Convert Lead → Client + First Project
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500 leading-relaxed">
          Converting <strong className="text-slate-800">{lead.businessName}</strong> creates their permanent Client profile. You can now define the official project value and currency.
        </p>

        <form onSubmit={handleConvert} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Initial Project Name
            </label>
            <input
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Project Currency (Inherited from Lead)
              </label>
              <div className="mt-1 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800">
                <span>{currency === 'BDT' ? 'BDT (৳) - Bangladesh Client' : 'USD ($) - International / USA'}</span>
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  Fixed
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Agreed Project Value ({currency === 'BDT' ? '৳' : '$'})
              </label>
              <input
                type="number"
                min="1"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 font-bold focus:border-blue-600 focus:outline-hidden"
                value={projectValue}
                onChange={(e) => setProjectValue(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Target Deadline
            </label>
            <input
              type="date"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-[11px] text-emerald-800">
            <strong>What happens now:</strong>
            <ul className="mt-1 list-disc list-inside space-y-0.5 text-emerald-700">
              <li>Lead status is marked as <strong>Won</strong></li>
              <li>Permanent client profile is established in <strong>Clients</strong></li>
              <li>First project is opened for {formatCurrency(projectValue, currency)} with milestone tracking</li>
              <li>You can add more projects for this client at any time!</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              Confirm & Start Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
