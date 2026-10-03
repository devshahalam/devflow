import React, { useState } from 'react';
import {
  Settings,
  User,
  Building,
  Mail,
  Phone,
  DollarSign,
  Download,
  Upload,
  Check,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Currency } from '../../types/crm';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    exportDataJSON,
    importDataJSON,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'profile' | 'backup'>('profile');

  // Studio profile state
  const [name, setName] = useState(profile.name);
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [defaultCurrency, setDefaultCurrency] = useState<Currency>(profile.defaultCurrency || 'USD');
  const [defaultFollowupDays, setDefaultFollowupDays] = useState(profile.defaultFollowupDays);
  const [whatsappTemplate, setWhatsappTemplate] = useState(profile.whatsappTemplate);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      businessName: businessName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      defaultCurrency,
      defaultFollowupDays: Number(defaultFollowupDays) || 3,
      whatsappTemplate: whatsappTemplate.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `devflow-crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          setImportStatus('Backup restored successfully!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Failed to parse JSON backup file. Please check format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Studio Settings & Configuration
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your freelance agency profile, default currencies, WhatsApp follow-up templates, and database backups.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building className="h-4 w-4" />
          <span>Studio Profile & Currencies</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'backup'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Download className="h-4 w-4" />
          <span>Data Backup & Portability</span>
        </button>
      </div>

      {/* TAB 1: Profile */}
      {activeTab === 'profile' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Agency & Freelancer Profile</h3>
            <p className="text-xs text-slate-500">
              Details used on proposals, invoices, and client communications.
            </p>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Studio / Agency Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Owner / Lead Developer</label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Business Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Phone / WhatsApp</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Default Currency
                </label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value as Currency)}
                >
                  <option value="USD">USD ($) - International Standard</option>
                  <option value="BDT">BDT (৳) - Bangladesh Standard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Default Follow-up Interval
                </label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={defaultFollowupDays}
                  onChange={(e) => setDefaultFollowupDays(Number(e.target.value))}
                >
                  <option value={1}>1 Day (Next Day)</option>
                  <option value={2}>2 Days</option>
                  <option value={3}>3 Days (Recommended)</option>
                  <option value={5}>5 Days</option>
                  <option value={7}>7 Days (1 Week)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Default WhatsApp Follow-up Message Template
                </label>
                <span className="text-[10px] text-slate-400">
                  Placeholders: {'{contact}'}, {'{business}'}
                </span>
              </div>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden font-mono"
                value={whatsappTemplate}
                onChange={(e) => setWhatsappTemplate(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {savedSuccess ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <Check className="h-4 w-4" />
                  <span>Profile saved successfully!</span>
                </span>
              ) : (
                <span />
              )}
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Backup */}
      {activeTab === 'backup' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Data Backup & Portability</h3>
            <p className="text-xs text-slate-500">
              Export and restore all database records including leads, clients, projects, payments, proposals, and communications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-900">Export Complete JSON Backup</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Downloads all leads, clients, projects, payments, proposals, follow-ups, and logs as a single JSON file.
              </p>
              <button
                onClick={handleExportBackup}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Download JSON Backup</span>
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-900">Restore Backup File</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Upload a previously exported JSON backup file to restore all CRM records.
              </p>
              <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer">
                <Upload className="h-3.5 w-3.5 text-slate-500" />
                <span>Choose Backup JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
              {importStatus && (
                <div className="text-[11px] font-medium text-emerald-600 mt-1">
                  {importStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
