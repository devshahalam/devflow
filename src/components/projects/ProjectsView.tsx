import React, { useState, useMemo } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Receipt,
  User,
  X,
  Trash2,
  Pencil,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Currency, Project, ProjectStatus } from '../../types/crm';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    clients,
    services,
    addProject,
    updateProject,
    deleteProject,
    getProjectFinancials,
    formatCurrency,
    profile,
    setCurrentTab,
    setSelectedClientId,
    currentUser,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currencyFilter, setCurrencyFilter] = useState<string>('All');

  // Add project modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedClientId, setModalClientId] = useState(clients[0]?.id || '');
  const [projectName, setProjectName] = useState('');
  const [serviceId, setServiceId] = useState(services[0]?.id || 'SRV-01');
  const [projectValue, setProjectValue] = useState<number>(1000);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState<ProjectStatus>('In Progress');
  const [notes, setNotes] = useState('');

  // Edit project modal state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectValue, setEditProjectValue] = useState<number>(1000);
  const [editDeadline, setEditDeadline] = useState('');
  const [editStatus, setEditStatus] = useState<ProjectStatus>('In Progress');
  const [editNotes, setEditNotes] = useState('');

  const handleOpenEdit = (proj: Project) => {
    setEditingProject(proj);
    setEditProjectName(proj.projectName);
    setEditProjectValue(proj.projectValue);
    setEditDeadline(proj.deadline);
    setEditStatus(proj.status);
    setEditNotes(proj.notes || '');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editProjectName.trim()) return;

    updateProject(editingProject.id, {
      projectName: editProjectName.trim(),
      projectValue: Number(editProjectValue) || 0,
      deadline: editDeadline,
      status: editStatus,
      notes: editNotes.trim(),
    });

    setEditingProject(null);
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const clientCurrency: Currency = selectedClient?.currency || 'USD';

  const todayStr = '2026-10-02';

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.projectName.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.serviceName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesCurrency = currencyFilter === 'All' || p.currency === currencyFilter;
      return matchesQuery && matchesStatus && matchesCurrency;
    });
  }, [projects, searchQuery, statusFilter, currencyFilter]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !selectedClientId) return;

    const client = clients.find((c) => c.id === selectedClientId);
    const service = services.find((s) => s.id === serviceId);
    const currency = client?.currency || 'USD';

    addProject({
      clientId: selectedClientId,
      clientName: client ? client.businessName : 'Client',
      projectName: projectName.trim(),
      serviceId,
      serviceName: service ? service.name : 'WordPress Website',
      projectValue: Number(projectValue) || 0,
      currency,
      startDate,
      deadline,
      status,
      assignedTo: 'USR-01',
      notes: notes.trim(),
    });

    setIsAddOpen(false);
    setProjectName('');
  };

  const getDaysDiff = (deadlineStr: string) => {
    const diff = Math.ceil(
      (new Date(deadlineStr).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24)
    );
    return diff;
  };

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Project Delivery Management
          </h2>
          <p className="text-xs text-slate-500">
            Keep track of development sprints, milestone deadlines, and invoice collections in USD & BDT.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>+ New Project</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name, client, service..."
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Currency Filter */}
          <select
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 font-semibold"
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
          >
            <option value="All">All Currencies (USD + BDT)</option>
            <option value="USD">USD ($) Only</option>
            <option value="BDT">BDT (৳) Only</option>
          </select>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['All', 'In Progress', 'Waiting for Client', 'Review', 'Completed'] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    statusFilter === tab
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((proj) => {
          const fin = getProjectFinancials(proj.id);
          const daysDiff = getDaysDiff(proj.deadline);
          const isCompleted = proj.status === 'Completed';

          return (
            <div
              key={proj.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400">{proj.id}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                      {proj.currency}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{proj.projectName}</h3>
                  <button
                    onClick={() => {
                      setSelectedClientId(proj.clientId);
                      setCurrentTab('clients');
                    }}
                    className="mt-0.5 text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>{proj.clientName}</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Inline Status Selector & Delete */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={proj.status}
                    onChange={(e) =>
                      updateProject(proj.id, { status: e.target.value as ProjectStatus })
                    }
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-600"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting for Client">Waiting for Client</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={() => handleOpenEdit(proj)}
                    className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit Project Scope & Value"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      deleteProject(proj.id);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Progress and Financials Bar */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Payment Milestone:</span>
                  <span
                    className={`font-semibold ${
                      fin.status === 'Fully Paid'
                        ? 'text-emerald-700'
                        : fin.status === 'Partially Paid'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {fin.status} ({Math.round((fin.received / (fin.value || 1)) * 100)}%)
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((fin.received / (fin.value || 1)) * 100)
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="text-[11px] text-slate-400">Total:</span>{' '}
                    <strong className="text-slate-800">{formatCurrency(fin.value, proj.currency)}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Received:</span>{' '}
                    <strong className="text-emerald-600">{formatCurrency(fin.received, proj.currency)}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Pending:</span>{' '}
                    <strong className="text-amber-600">{formatCurrency(fin.pending, proj.currency)}</strong>
                  </div>
                </div>
              </div>

              {/* Deadline & Quick Action Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-500">Deadline:</span>
                  <span className="font-semibold text-slate-900">{proj.deadline}</span>
                  {!isCompleted && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ml-1 ${
                        daysDiff < 0
                          ? 'bg-rose-100 text-rose-700'
                          : daysDiff <= 3
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {daysDiff < 0
                        ? `${Math.abs(daysDiff)}d overdue`
                        : daysDiff === 0
                        ? 'Today!'
                        : `${daysDiff}d left`}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setCurrentTab('payments')}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  <span>Record Payment</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Project Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Client Project</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Select Client <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  value={selectedClientId}
                  onChange={(e) => {
                    setModalClientId(e.target.value);
                    const c = clients.find((client) => client.id === e.target.value);
                    if (c) setProjectName(`${c.businessName} Website Sprint`);
                  }}
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.businessName} ({c.contactPerson})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Dental Redesign & Booking"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Service
                  </label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                    value={serviceId}
                    onChange={(e) => {
                      setServiceId(e.target.value);
                      const s = services.find((srv) => srv.id === e.target.value);
                      if (s) {
                        setProjectValue(s.defaultPrice);
                      }
                    }}
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Currency (Inherited from Client)
                  </label>
                  <div className="mt-1 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800">
                    <span>{clientCurrency === 'BDT' ? 'BDT (৳) - Bangladesh Client' : 'USD ($) - International / USA'}</span>
                    <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      Fixed
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Project Value ({clientCurrency === 'BDT' ? '৳' : '$'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 font-bold"
                    value={projectValue}
                    onChange={(e) => setProjectValue(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Project Notes & Milestones
                </label>
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setEditingProject(null)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Edit Project: {editingProject.id}
              </h3>
              <button
                onClick={() => setEditingProject(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Project Title / Scope <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Project Value ({editingProject.currency === 'BDT' ? '৳' : '$'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 font-bold"
                    value={editProjectValue}
                    onChange={(e) => setEditProjectValue(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Status</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ProjectStatus)}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting for Client">Waiting for Client</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Project Notes & Milestones
                </label>
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
