import React, { useState } from 'react';
import {
  Settings,
  User,
  Building,
  Mail,
  Phone,
  DollarSign,
  MessageCircle,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  AlertTriangle,
  ShieldCheck,
  Users,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Shield,
  CalendarClock,
  FolderGit2,
  Users2,
  AlertCircle,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Currency } from '../../types/crm';
import { TeamManagement } from './TeamManagement';
import { MemberProfileModal } from './MemberProfileModal';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    exportDataJSON,
    importDataJSON,
    clearAllData,
    currentUser,
    users,
    updateUser,
    leads,
    projects,
    followUps,
  } = useCRM();

  const isOwner =
    currentUser?.role === 'Owner' ||
    currentUser?.email?.toLowerCase() === 'dev.mdshahalam@gmail.com';

  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'backup'>('team');

  // Studio profile state (for Owner)
  const [name, setName] = useState(profile.name);
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [defaultCurrency, setDefaultCurrency] = useState<Currency>(profile.defaultCurrency || 'USD');
  const [defaultFollowupDays, setDefaultFollowupDays] = useState(profile.defaultFollowupDays);
  const [whatsappTemplate, setWhatsappTemplate] = useState(profile.whatsappTemplate);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Personal profile state (for Team Leader / Member)
  const [personalName, setPersonalName] = useState(currentUser?.name || '');
  const [personalPassword, setPersonalPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [personalSuccessMsg, setPersonalSuccessMsg] = useState<string | null>(null);
  const [personalErrorMsg, setPersonalErrorMsg] = useState<string | null>(null);
  const [isViewingMyWorkload, setIsViewingMyWorkload] = useState(false);

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

  const handlePersonalProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPersonalErrorMsg(null);
    setPersonalSuccessMsg(null);

    if (!currentUser) return;
    if (!personalName.trim()) {
      setPersonalErrorMsg('Please provide your name.');
      return;
    }

    const updates: Partial<{ name: string; password: string }> = {
      name: personalName.trim(),
    };

    if (personalPassword.trim()) {
      if (personalPassword.trim().length < 6) {
        setPersonalErrorMsg('Password must be at least 6 characters.');
        return;
      }
      if (personalPassword.trim() !== confirmPassword.trim()) {
        setPersonalErrorMsg('Password confirmation does not match.');
        return;
      }
      updates.password = personalPassword.trim();
    }

    updateUser(currentUser.id, updates);
    setPersonalSuccessMsg('Your profile credentials have been updated.');
    setPersonalPassword('');
    setConfirmPassword('');
    setTimeout(() => setPersonalSuccessMsg(null), 3000);
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

  // If the user is NOT an owner (Team Leader or Member):
  // They MUST NOT see the studio profile, role management, or backup option!
  if (!isOwner && currentUser) {
    const supervisor = users.find((u) => u.id === currentUser.teamLeaderId);
    const subordinates = users.filter((u) => u.teamLeaderId === currentUser.id);
    const myLeads = leads.filter((l) => l.assignedTo === currentUser.id);
    const myProjects = projects.filter((p) => p.assignedTo === currentUser.id);
    const myTasks = followUps.filter((f) => f.assignedTo === currentUser.id && !f.completed);

    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            My Account & Profile
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal profile, credentials, and review assigned studio workload.
          </p>
        </div>

        {/* Security / Role Notice */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <span className="font-bold">Team Member Access</span>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              You are signed in as a <strong>{currentUser.role}</strong>. Studio agency configuration, team role assignments, and database backup controls are restricted to the Studio Owner.
            </p>
          </div>
        </div>

        {/* Success / Error Banners */}
        {personalSuccessMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{personalSuccessMsg}</span>
          </div>
        )}
        {personalErrorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{personalErrorMsg}</span>
          </div>
        )}

        {/* Profile Card & Credentials */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl font-bold text-base text-white shadow-xs ${
                  currentUser.role === 'Team Leader'
                    ? 'bg-amber-600'
                    : 'bg-blue-600'
                }`}
              >
                {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">{currentUser.name}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{currentUser.email}</span>
                </div>
              </div>
            </div>

            <span
              className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                currentUser.role === 'Team Leader'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {currentUser.role}
            </span>
          </div>

          {/* Supervisor / Subordinates info */}
          {supervisor && (
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs text-slate-600">
              Assigned Supervisor: <strong className="text-slate-800">{supervisor.name}</strong> ({supervisor.email})
            </div>
          )}
          {currentUser.role === 'Team Leader' && (
            <div className="rounded-xl bg-amber-50/60 p-3 border border-amber-200 text-xs text-amber-800">
              Supervising Team: <strong>{subordinates.length} team member{subordinates.length === 1 ? '' : 's'}</strong>
            </div>
          )}

          {/* Edit Credentials Form */}
          <form onSubmit={handlePersonalProfileSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={personalName}
                  onChange={(e) => setPersonalName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  disabled
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                  value={currentUser.email}
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Email can only be updated by the studio owner.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  New Password (leave empty to keep current)
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden pr-8"
                    value={personalPassword}
                    onChange={(e) => setPersonalPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {personalPassword.trim() && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
              >
                Save My Profile
              </button>
            </div>
          </form>
        </div>

        {/* Workload Snapshot */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">My Assigned Workload</h3>
              <p className="text-xs text-slate-500">Overview of client leads, projects, and active tasks assigned to you</p>
            </div>
            <button
              type="button"
              onClick={() => setIsViewingMyWorkload(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Open Detailed Workload</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
              <span className="text-[11px] text-amber-800 font-semibold block">Pending Tasks</span>
              <span className="text-xl font-bold text-amber-700 mt-1 block">{myTasks.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-600 font-semibold block">Assigned Leads</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">{myLeads.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
              <span className="text-[11px] text-blue-800 font-semibold block">Active Projects</span>
              <span className="text-xl font-bold text-blue-700 mt-1 block">{myProjects.length}</span>
            </div>
          </div>
        </div>

        {/* My Workload Modal */}
        {isViewingMyWorkload && (
          <MemberProfileModal
            user={currentUser}
            isOpen={isViewingMyWorkload}
            onClose={() => setIsViewingMyWorkload(false)}
          />
        )}
      </div>
    );
  }

  // OWNER VIEW: Full access to Team, Profile, and Backup
  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Studio Settings & Role Management
        </h2>
        <p className="text-xs text-slate-500">
          Manage team members, permissions, business credentials, and multi-currency defaults.
        </p>
      </div>

      {/* Tabs (Only visible to Studio Owner) */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'team'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Team Roles & Users</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Studio Profile & Currencies</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'backup'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Download className="h-4 w-4" />
          <span>Data Backup & Portability</span>
        </button>
      </div>

      {/* TAB 1: Team & Roles */}
      {activeTab === 'team' && <TeamManagement />}

      {/* TAB 2: Studio Profile */}
      {activeTab === 'profile' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Freelancer Studio Profile</h3>
            <p className="text-xs text-slate-500">
              Used on proposals, client communications, and invoice headers.
            </p>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Freelancer / Owner Name
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Business / Studio Name
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Contact Email
                </label>
                <input
                  type="email"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Phone / WhatsApp
                </label>
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
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
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
                  Default WhatsApp Follow-up Message
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

      {/* TAB 3: Data Backup & Reset */}
      {activeTab === 'backup' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Data Backup & Portability</h3>
            <p className="text-xs text-slate-500">
              Export and restore all database models including users, leads, clients, projects, and payments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-900">Export Complete JSON Backup</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Downloads all users, leads, clients, projects, payments, follow-ups, and logs as a single JSON file.
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
                Upload a previously exported JSON backup file to restore all entities.
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
