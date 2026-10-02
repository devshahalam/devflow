import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  Bell,
  User,
  Settings,
  Download,
  RotateCcw,
  Check,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { NotificationPopover } from '../common/NotificationPopover';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    currentTab,
    setCurrentTab,
    profile,
    currentUser,
    logout,
    notifications,
    setIsQuickAddOpen,
    setIsSearchOpen,
    exportDataJSON,
  } = useCRM();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);

  const isOwner =
    currentUser?.role === 'Owner' ||
    currentUser?.email?.toLowerCase() === 'dev.mdshahalam@gmail.com';

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Business Dashboard';
      case 'leads':
        return 'Lead Management';
      case 'followups':
        return 'Follow-up Pipeline';
      case 'communications':
        return 'Communications Log';
      case 'proposals':
        return 'Proposals & Quotes';
      case 'projects':
        return 'Active & Completed Projects';
      case 'payments':
        return 'Payments & Invoicing';
      case 'clients':
        return 'Client Directory';
      case 'services':
        return 'Services & Packages';
      case 'reports':
        return 'Sales & Performance Reports';
      case 'team':
        return 'Team & Staff Management';
      case 'settings':
        return isOwner ? 'Studio & Team Settings' : 'My Account & Profile';
      default:
        return 'Dashboard';
    }
  };

  const handleExportData = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `devflow-crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const urgentCount = notifications.filter((n) => n.type === 'urgent' || n.type === 'warning').length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs sm:px-6">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden focus:outline-hidden"
          aria-label="Open Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {getPageTitle(currentTab)}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 sm:px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100/80 transition-colors"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden sm:inline">Search everything...</span>
          <span className="hidden rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-400 shadow-2xs sm:inline-block border border-slate-200">
            ⌘K
          </span>
        </button>

        {/* Quick Add Button */}
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Add Lead</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-hidden"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {urgentCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
                {urgentCount}
              </span>
            )}
          </button>
          <NotificationPopover isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        {/* User Profile & Role Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 rounded-lg p-1 text-slate-700 hover:bg-slate-100 transition-colors focus:outline-hidden"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 font-semibold text-xs text-white shadow-2xs">
              {(currentUser?.name || profile.name)
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="hidden text-left sm:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1">
                <span>{currentUser?.name || profile.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-blue-600">
                  {currentUser?.role || 'Owner'}
                </span>
              </div>
            </div>
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-12 z-50 w-60 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-2">
                <div className="text-xs font-semibold text-slate-800">
                  {currentUser?.name || profile.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {currentUser?.email || profile.email}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="rounded bg-blue-100 text-blue-800 px-1.5 py-0.2 text-[10px] font-bold">
                    Role: {currentUser?.role || 'Owner'}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setCurrentTab('settings');
                    setIsProfileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  <span>{isOwner ? 'Studio Settings & Roles' : 'My Profile & Account'}</span>
                </button>

                {isOwner && (
                  <button
                    onClick={() => {
                      handleExportData();
                      setIsProfileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    {copiedExport ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Download className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    <span>Export JSON Backup</span>
                  </button>
                )}

                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    logout();
                    setIsProfileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  <span>Sign Out (Lock CRM)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
