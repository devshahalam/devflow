import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  ShieldCheck,
  Briefcase,
  Users2,
  CalendarClock,
  FolderGit2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Mail,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Phone,
  Trash2,
  Eye,
  Plus,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { AppUser, Currency, Lead, Project, FollowUp, ContactMethod, Priority } from '../../types/crm';

interface MemberProfileModalProps {
  user: AppUser;
  isOpen: boolean;
  onClose: () => void;
  onSelectAnotherUser?: (user: AppUser) => void;
  onDeleteUser?: (user: AppUser) => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSelectAnotherUser,
  onDeleteUser,
}) => {
  const {
    leads,
    allLeads,
    projects,
    followUps,
    users,
    currentUser,
    formatCurrency,
    setSelectedLeadId,
    setSelectedClientId,
    setCurrentTab,
    completeFollowUp,
    addFollowUp,
    deleteUser,
  } = useCRM();

  // Default to tasks tab so the owner immediately sees all assigned tasks
  const [activeTab, setActiveTab] = useState<'tasks' | 'leads' | 'projects' | 'subordinates'>('tasks');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'overdue' | 'completed'>('all');

  // Task creation state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskContactPerson, setTaskContactPerson] = useState('');
  const [taskMethod, setTaskMethod] = useState<ContactMethod>('WhatsApp');
  const [taskDueDate, setTaskDueDate] = useState('2026-10-03');
  const [taskPriority, setTaskPriority] = useState<Priority>('High');
  const [taskNotes, setTaskNotes] = useState('');
  const [selectedLeadForTask, setSelectedLeadForTask] = useState<string>('');

  // Delete confirmation state
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isOwner = currentUser?.role === 'Owner' || currentUser?.email?.toLowerCase() === 'dev.mdshahalam@gmail.com';
  const supervisor = users.find((u) => u.id === user.teamLeaderId);
  const subordinates = users.filter((u) => u.teamLeaderId === user.id);

  // User's assigned tasks
  const leadSource = allLeads && allLeads.length > 0 ? allLeads : leads;
  const userLeads = leadSource.filter((l) => l.assignedTo === user.id);
  const userProjects = projects.filter((p) => p.assignedTo === user.id);
  const userFollowUps = followUps.filter((f) => f.assignedTo === user.id);

  const todayStr = '2026-10-02';
  const pendingFollowUps = userFollowUps.filter((f) => !f.completed);
  const overdueFollowUps = pendingFollowUps.filter((f) => f.dueDate < todayStr);
  const completedFollowUps = userFollowUps.filter((f) => f.completed);

  // Filtered tasks
  const displayedFollowUps = userFollowUps.filter((f) => {
    if (taskFilter === 'pending') return !f.completed;
    if (taskFilter === 'overdue') return !f.completed && f.dueDate < todayStr;
    if (taskFilter === 'completed') return f.completed;
    return true;
  });

  const activeProjects = userProjects.filter((p) => p.status !== 'Completed' && p.status !== 'Cancelled');
  const completedProjects = userProjects.filter((p) => p.status === 'Completed');

  // Revenue calculation for this member's projects
  const totalValueUSD = userProjects
    .filter((p) => p.currency === 'USD')
    .reduce((sum, p) => sum + p.projectValue, 0);
  const totalValueBDT = userProjects
    .filter((p) => p.currency === 'BDT')
    .reduce((sum, p) => sum + p.projectValue, 0);

  const handleOpenLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    onClose();
  };

  const handleOpenProjectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setCurrentTab('clients');
    onClose();
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addFollowUp({
      leadId: selectedLeadForTask || 'GENERAL',
      businessName: taskTitle.trim(),
      contactPerson: taskContactPerson.trim() || user.name,
      contactMethod: taskMethod,
      dueDate: taskDueDate,
      priority: taskPriority,
      notes: taskNotes.trim() || `Assigned directly to ${user.name} by studio owner.`,
      assignedTo: user.id,
      leadStatus: 'Contacted',
    });

    setIsAddingTask(false);
    setTaskTitle('');
    setTaskContactPerson('');
    setTaskNotes('');
  };

  const handleExecuteDelete = () => {
    if (onDeleteUser) {
      onDeleteUser(user);
      setIsConfirmingDelete(false);
      onClose();
      return;
    }

    const success = deleteUser(user.id);
    if (success) {
      setIsConfirmingDelete(false);
      onClose();
    } else {
      setDeleteError("Unable to remove user. Please verify you are logged in as the Studio Owner.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative flex flex-col w-full max-w-4xl h-[90vh] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Top Header Card */}
        <div className="border-b border-slate-100 bg-slate-50/80 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl font-bold text-lg text-white shadow-md ${
                  user.role === 'Team Leader'
                    ? 'bg-amber-600 shadow-amber-600/20'
                    : user.role === 'Owner'
                    ? 'bg-purple-600 shadow-purple-600/20'
                    : 'bg-blue-600 shadow-blue-600/20'
                }`}
              >
                {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    {user.name}
                  </h2>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                      user.role === 'Owner'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'Team Leader'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role}
                  </span>
                  <span className="font-mono text-xs text-slate-400">{user.id}</span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {user.email}
                  </span>
                  {supervisor && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>
                        Supervisor:{' '}
                        <strong className="text-slate-800 font-semibold">{supervisor.name}</strong>
                      </span>
                    </>
                  )}
                  {user.role === 'Team Leader' && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-800 font-medium">
                        Supervising {subordinates.length} team member{subordinates.length === 1 ? '' : 's'}
                      </span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOwner && user.role !== 'Owner' && (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs"
                  title="Remove User from Studio"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove User</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                aria-label="Close Profile"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div
              onClick={() => setActiveTab('tasks')}
              className={`rounded-xl border p-3 shadow-2xs cursor-pointer transition-colors ${
                activeTab === 'tasks' ? 'border-blue-400 bg-blue-50/40' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Assigned Tasks / Follow-ups
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-amber-700">{pendingFollowUps.length} pending</span>
                {overdueFollowUps.length > 0 && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                    {overdueFollowUps.length} overdue
                  </span>
                )}
              </div>
            </div>

            <div
              onClick={() => setActiveTab('leads')}
              className={`rounded-xl border p-3 shadow-2xs cursor-pointer transition-colors ${
                activeTab === 'leads' ? 'border-blue-400 bg-blue-50/40' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Assigned Leads
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-slate-900">{userLeads.length}</span>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  ({userLeads.filter((l) => l.status === 'Won').length} won)
                </span>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('projects')}
              className={`rounded-xl border p-3 shadow-2xs cursor-pointer transition-colors ${
                activeTab === 'projects' ? 'border-blue-400 bg-blue-50/40' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Active Projects
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-blue-600">{activeProjects.length}</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  ({completedProjects.length} completed)
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Assigned Deal Value
              </span>
              <div className="mt-1 text-sm font-bold text-slate-900 truncate">
                {[
                  totalValueUSD > 0 ? formatCurrency(totalValueUSD, 'USD') : '',
                  totalValueBDT > 0 ? formatCurrency(totalValueBDT, 'BDT') : '',
                ]
                  .filter(Boolean)
                  .join(' + ') || '$0'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`border-b-2 py-3 px-4 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'tasks'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CalendarClock className="h-4 w-4" />
              <span>Assigned Tasks ({userFollowUps.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`border-b-2 py-3 px-4 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'leads'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users2 className="h-4 w-4" />
              <span>Assigned Leads ({userLeads.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`border-b-2 py-3 px-4 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'projects'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FolderGit2 className="h-4 w-4" />
              <span>Assigned Projects ({userProjects.length})</span>
            </button>

            {user.role === 'Team Leader' && (
              <button
                onClick={() => setActiveTab('subordinates')}
                className={`border-b-2 py-3 px-4 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'subordinates'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Shield className="h-4 w-4 text-amber-600" />
                <span>Supervised Members ({subordinates.length})</span>
              </button>
            )}
          </div>

          {activeTab === 'tasks' && isOwner && (
            <button
              type="button"
              onClick={() => setIsAddingTask(true)}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Assign Task</span>
            </button>
          )}
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/40 space-y-4">
          {/* TAB 1: Assigned Tasks & Follow-ups */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {/* Task filters */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setTaskFilter('all')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                      taskFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All Tasks ({userFollowUps.length})
                  </button>
                  <button
                    onClick={() => setTaskFilter('pending')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                      taskFilter === 'pending'
                        ? 'bg-amber-600 text-white'
                        : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    Pending ({pendingFollowUps.length})
                  </button>
                  <button
                    onClick={() => setTaskFilter('overdue')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                      taskFilter === 'overdue'
                        ? 'bg-rose-600 text-white'
                        : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    Overdue ({overdueFollowUps.length})
                  </button>
                  <button
                    onClick={() => setTaskFilter('completed')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                      taskFilter === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    Completed ({completedFollowUps.length})
                  </button>
                </div>

                <span className="text-[11px] text-slate-500">
                  Showing {displayedFollowUps.length} task item{displayedFollowUps.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Task List */}
              {displayedFollowUps.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
                  <CalendarClock className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  No tasks found in this view for {user.name}.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {displayedFollowUps.map((flp) => {
                    const isOverdue = !flp.completed && flp.dueDate < todayStr;
                    return (
                      <div
                        key={flp.id}
                        className={`rounded-xl border p-4 text-xs bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          flp.completed
                            ? 'border-slate-200 opacity-75'
                            : isOverdue
                            ? 'border-rose-300 bg-rose-50/20'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="text-slate-900 text-sm">{flp.businessName}</strong>
                            <span className="text-slate-500">· {flp.contactPerson}</span>
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                              {flp.contactMethod}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                flp.priority === 'Urgent'
                                  ? 'bg-rose-100 text-rose-800'
                                  : flp.priority === 'High'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {flp.priority} Priority
                            </span>
                            {isOverdue && (
                              <span className="rounded bg-rose-100 text-rose-800 px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Overdue
                              </span>
                            )}
                            {flp.completed && (
                              <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700">{flp.notes}</p>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-0.5">
                            <span>Due: <strong className="text-slate-700">{flp.dueDate}</strong></span>
                            {flp.completedAt && (
                              <span className="text-emerald-700">· Done: {new Date(flp.completedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!flp.completed && (
                            <button
                              type="button"
                              onClick={() => completeFollowUp(flp.id, 'Marked done by studio owner')}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-2xs transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Mark Done</span>
                            </button>
                          )}
                          {flp.leadId && flp.leadId !== 'GENERAL' && (
                            <button
                              type="button"
                              onClick={() => handleOpenLead(flp.leadId)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              Open Lead
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Assigned Leads */}
          {activeTab === 'leads' && (
            <div className="space-y-3">
              {userLeads.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
                  <Users2 className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  No leads are currently assigned to {user.name}.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                  {userLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400">{lead.id}</span>
                          <h4 className="font-bold text-sm text-slate-900">{lead.businessName}</h4>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              lead.status === 'Won'
                                ? 'bg-emerald-100 text-emerald-800'
                                : lead.status === 'Interested'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {lead.status}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                            {lead.priority}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Contact: <strong>{lead.contactPerson}</strong> · Source: {lead.leadSource} · Service:{' '}
                          {lead.serviceName}
                        </div>
                        {lead.nextFollowUpDate && (
                          <div className="text-[11px] text-amber-700 flex items-center gap-1 font-medium">
                            <Clock className="h-3 w-3" />
                            <span>Next Follow-up: {lead.nextFollowUpDate}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {lead.dealValue && lead.dealValue > 0 ? (
                          <span className="font-bold text-xs text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            {formatCurrency(lead.dealValue, lead.currency)}
                          </span>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => handleOpenLead(lead.id)}
                          className="flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Lead</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Assigned Projects */}
          {activeTab === 'projects' && (
            <div className="space-y-3">
              {userProjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
                  <FolderGit2 className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  No client projects are currently assigned to {user.name}.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {userProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3 hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono text-[10px] text-slate-400">{proj.id}</span>
                          <h4 className="font-bold text-sm text-slate-900">{proj.projectName}</h4>
                          <div className="text-xs text-slate-500 font-medium">{proj.clientName}</div>
                        </div>

                        <span
                          className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                            proj.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : proj.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {proj.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Service:</span>
                          <span className="font-semibold text-slate-700">{proj.serviceName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Value:</span>
                          <strong className="text-slate-900">
                            {formatCurrency(proj.projectValue, proj.currency)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Deadline:</span>
                          <span className="font-semibold text-slate-700">{proj.deadline}</span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenProjectClient(proj.clientId)}
                          className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <span>Open Client Ledger</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Supervised Members (for Team Leader) */}
          {activeTab === 'subordinates' && user.role === 'Team Leader' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500 mb-2">
                Team members assigned under supervisor <strong>{user.name}</strong>:
              </div>

              {subordinates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
                  <Shield className="mx-auto h-8 w-8 text-amber-400 mb-2" />
                  No members are currently assigned under this Team Leader.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {subordinates.map((sub) => {
                    const subLeads = leadSource.filter((l) => l.assignedTo === sub.id);
                    const subProjects = projects.filter((p) => p.assignedTo === sub.id);
                    const subTasks = followUps.filter((f) => f.assignedTo === sub.id && !f.completed);

                    return (
                      <div
                        key={sub.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2 hover:border-slate-300 transition-all flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs">
                              {sub.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-slate-900">{sub.name}</h5>
                              <span className="text-[11px] text-slate-500">{sub.email}</span>
                            </div>
                          </div>
                          <span className="rounded bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5">
                            Member
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                          <span>
                            Tasks: <strong>{subTasks.length}</strong>
                          </span>
                          <span>
                            Leads: <strong>{subLeads.length}</strong>
                          </span>
                          <span>
                            Projects: <strong>{subProjects.length}</strong>
                          </span>
                        </div>

                        {onSelectAnotherUser && (
                          <button
                            type="button"
                            onClick={() => onSelectAnotherUser(sub)}
                            className="w-full mt-2 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 py-1 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1"
                          >
                            <span>Inspect {sub.name}'s Profile & Tasks</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Task Quick Drawer / Modal */}
        {isAddingTask && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs"
              onClick={() => setIsAddingTask(false)}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Assign Task to {user.name}</h3>
                  <p className="text-[11px] text-slate-500">Create a follow-up action item for this team user</p>
                </div>
                <button
                  onClick={() => setIsAddingTask(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700">Task Title / Business</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Follow up on proposal revision"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700">Contact Person</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      value={taskContactPerson}
                      onChange={(e) => setTaskContactPerson(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700">Contact Method</label>
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      value={taskMethod}
                      onChange={(e) => setTaskMethod(e.target.value as ContactMethod)}
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Phone">Phone</option>
                      <option value="Email">Email</option>
                      <option value="Upwork">Upwork</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700">Due Date</label>
                    <input
                      type="date"
                      required
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700">Priority</label>
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Link to Lead (Optional)</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                    value={selectedLeadForTask}
                    onChange={(e) => setSelectedLeadForTask(e.target.value)}
                  >
                    <option value="">No linked lead (General task)</option>
                    {userLeads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.businessName} ({l.contactPerson})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Task Instructions / Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Specific instructions for this team member..."
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-700 shadow-2xs"
                  >
                    Assign Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Direct Delete Confirmation Modal */}
        {isConfirmingDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs"
              onClick={() => setIsConfirmingDelete(false)}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600 border-b border-slate-100 pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 shrink-0">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Remove Team User</h3>
                  <p className="text-xs text-slate-500">Confirm account removal from studio</p>
                </div>
              </div>

              {deleteError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1 text-xs">
                <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                <div className="text-slate-500">{user.email}</div>
                <div className="pt-1 flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      user.role === 'Team Leader'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{user.id}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to remove <strong>{user.name}</strong> from your studio team? All their assigned tasks, leads ({userLeads.length}), and active projects ({userProjects.length}) will be safely transferred to your Owner account.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDelete}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Confirm & Remove User</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
