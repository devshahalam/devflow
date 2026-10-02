import React from 'react';
import {
  LayoutDashboard,
  Users2,
  CalendarClock,
  MessageSquareText,
  FileCheck2,
  FolderGit2,
  Receipt,
  UserCheck,
  Layers,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    currentTab,
    setCurrentTab,
    kpis,
    profile,
    setIsQuickAddOpen,
    formatCurrency,
    currentUser,
    users,
  } = useCRM();

  const isOwner =
    currentUser?.role === 'Owner' ||
    currentUser?.email?.toLowerCase() === 'dev.mdshahalam@gmail.com';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'leads',
      label: 'Leads',
      icon: Users2,
      badge: kpis.newLeads > 0 ? `${kpis.newLeads} new` : undefined,
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'followups',
      label: 'Follow-ups',
      icon: CalendarClock,
      badge:
        kpis.overdueFollowUps > 0
          ? `${kpis.overdueFollowUps} overdue`
          : kpis.followUpsDue > 0
          ? `${kpis.followUpsDue} today`
          : undefined,
      badgeColor:
        kpis.overdueFollowUps > 0
          ? 'bg-rose-100 text-rose-700 font-semibold'
          : 'bg-amber-100 text-amber-800',
    },
    { id: 'communications', label: 'Communications', icon: MessageSquareText },
    { id: 'proposals', label: 'Proposals', icon: FileCheck2 },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderGit2,
      badge: kpis.activeProjects > 0 ? `${kpis.activeProjects}` : undefined,
      badgeColor: 'bg-slate-200 text-slate-700',
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: Receipt,
      badge:
        kpis.amountPendingUSD > 0
          ? `${formatCurrency(kpis.amountPendingUSD, 'USD')}`
          : kpis.amountPendingBDT > 0
          ? `${formatCurrency(kpis.amountPendingBDT, 'BDT')}`
          : undefined,
      badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
    },
    { id: 'clients', label: 'Clients', icon: UserCheck },
    ...(isOwner
      ? [
          {
            id: 'team',
            label: 'Team & Staff',
            icon: Users2,
            badge: users.length > 1 ? `${users.length}` : undefined,
            badgeColor: 'bg-indigo-100 text-indigo-700',
          },
        ]
      : []),
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    {
      id: 'settings',
      label: isOwner ? 'Studio Settings' : 'My Profile',
      icon: isOwner ? Settings : UserCheck,
    },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-xs">
              <span className="text-base font-semibold">DF</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-slate-900 leading-tight">
                {profile.businessName || 'DevFlow CRM'}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Freelance Web Studio
              </span>
            </div>
          </div>
        </div>

        {/* Quick Add Lead Shortcut */}
        <div className="p-3 border-b border-slate-100">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <Plus className="h-4 w-4" />
            <span>+ Quick Add Lead</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
          <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Pipeline & Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                      item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Summary Widget */}
        <div className="border-t border-slate-100 p-3 bg-slate-50/50">
          <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Total Sales</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(kpis.totalSalesUSD, 'USD')}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {kpis.activeProjects} active projects
              </span>
              <span className="text-amber-700">
                {kpis.overdueFollowUps > 0 ? `${kpis.overdueFollowUps} overdue` : 'On track'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
