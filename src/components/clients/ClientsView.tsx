import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Search,
  Plus,
  MessageCircle,
  Mail,
  Globe,
  DollarSign,
  FolderGit2,
  Calendar,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Facebook,
  Instagram,
  Twitter,
  Receipt,
  Trash2,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Client, Currency, Project, ProjectStatus } from '../../types/crm';

export const ClientsView: React.FC = () => {
  const {
    clients,
    projects,
    payments,
    addClient,
    updateClient,
    deleteClient,
    addProject,
    updateProject,
    deleteProject,
    addPayment,
    deletePayment,
    getClientFinancials,
    getProjectFinancials,
    formatCurrency,
    services,
    selectedClientId,
    setSelectedClientId,
    setCurrentTab,
    currentUser,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');

  // Add Client Modal
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [businessCategory, setBusinessCategory] = useState('E-Commerce');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [country, setCountry] = useState('United States');
  const [city, setCity] = useState('');
  const [newClientCurrency, setNewClientCurrency] = useState<Currency>('USD');
  const [notes, setNotes] = useState('');

  // Add Project for Specific Client Modal
  const [clientForNewProject, setClientForNewProject] = useState<Client | null>(null);
  const [projectName, setProjectName] = useState('');
  const [serviceId, setServiceId] = useState(services[0]?.id || 'SRV-01');
  const [projectValue, setProjectValue] = useState<number>(1000);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().split('T')[0];
  });
  const [projectNotes, setProjectNotes] = useState('');

  // Quick Record Payment for specific project
  const [projectForPayment, setProjectForPayment] = useState<Project | null>(null);
  const [payAmount, setPayAmount] = useState<number>(500);
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [payNotes, setPayNotes] = useState('');

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        c.businessName.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.whatsapp.includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
      );
    });
  }, [clients, searchQuery]);

  const activeClient = clients.find((c) => c.id === selectedClientId);
  const activeClientFin = activeClient ? getClientFinancials(activeClient.id) : null;
  const activeClientProjects = activeClient
    ? projects.filter((p) => p.clientId === activeClient.id)
    : [];
  const activeClientPayments = activeClient
    ? payments.filter((p) => p.clientId === activeClient.id)
    : [];

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    addClient({
      businessName: businessName.trim(),
      contactPerson: contactPerson.trim() || 'Business Owner',
      businessCategory: businessCategory.trim() || 'General Business',
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      website: website.trim(),
      facebook: facebook.trim(),
      instagram: instagram.trim(),
      twitter: twitter.trim(),
      country: country.trim() || 'United States',
      city: city.trim(),
      currency: newClientCurrency,
      notes: notes.trim(),
      leadId: null,
    });

    setIsAddClientOpen(false);
    setBusinessName('');
    setEmail('');
    setWhatsapp('');
  };

  const handleOpenAddProjectForClient = (client: Client) => {
    setClientForNewProject(client);
    setProjectName(`${client.businessName} - New Phase Sprint`);
    const clientCurr = client.currency || 'USD';
    setCurrency(clientCurr);
    setProjectValue(clientCurr === 'BDT' ? 35000 : 1000);
  };

  const handleCreateProjectForClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForNewProject || !projectName.trim()) return;

    const matchedService = services.find((s) => s.id === serviceId);

    addProject({
      clientId: clientForNewProject.id,
      clientName: clientForNewProject.businessName,
      projectName: projectName.trim(),
      serviceId,
      serviceName: matchedService ? matchedService.name : 'WordPress Website',
      projectValue: Number(projectValue) || 0,
      currency,
      startDate: new Date().toISOString().split('T')[0],
      deadline,
      status: 'In Progress',
      notes: projectNotes.trim(),
    });

    setClientForNewProject(null);
    setProjectNotes('');
  };

  const handleOpenPaymentForProject = (project: Project) => {
    const fin = getProjectFinancials(project.id);
    setProjectForPayment(project);
    setPayAmount(fin.pending > 0 ? fin.pending : fin.value);
  };

  const handleRecordProjectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForPayment || !payAmount || payAmount <= 0) return;

    addPayment({
      projectId: projectForPayment.id,
      clientId: projectForPayment.clientId,
      clientName: projectForPayment.clientName,
      projectName: projectForPayment.projectName,
      amount: Number(payAmount),
      currency: projectForPayment.currency,
      paymentDate: payDate,
      paymentMethod: projectForPayment.currency === 'BDT' ? 'bKash / Nagad' : 'Bank Transfer',
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      notes: payNotes.trim(),
    });

    setProjectForPayment(null);
    setPayNotes('');
  };

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Client Directory
          </h2>
          <p className="text-xs text-slate-500">
            Manage long-term client relationships and execute multiple projects under each client account.
          </p>
        </div>
        <button
          onClick={() => setIsAddClientOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>+ Add Client</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by client company, contact, location..."
          className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden shadow-2xs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const clientProjects = projects.filter((p) => p.clientId === client.id);
          const cleanPhone = client.whatsapp.replace(/[^0-9]/g, '');

          // Calculate multi-currency totals
          const usdProjects = clientProjects.filter((p) => p.currency === 'USD');
          const bdtProjects = clientProjects.filter((p) => p.currency === 'BDT');

          const usdTotal = usdProjects.reduce((sum, p) => sum + p.projectValue, 0);
          const bdtTotal = bdtProjects.reduce((sum, p) => sum + p.projectValue, 0);

          return (
            <div
              key={client.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-slate-400">{client.id}</span>
                    <h3
                      className="text-base font-bold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => setSelectedClientId(client.id)}
                    >
                      {client.businessName}
                    </h3>
                    <div className="text-xs text-slate-500 font-medium">
                      {client.contactPerson} · {client.city || client.country}
                    </div>
                  </div>

                  <span className="rounded-md bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold">
                    {clientProjects.length} Projects
                  </span>
                </div>

                {/* Social & Contact Icons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {client.whatsapp && (
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium hover:bg-emerald-100"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  {client.facebook && (
                    <a
                      href={client.facebook.startsWith('http') ? client.facebook : `https://${client.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded border border-slate-200 p-1 text-blue-600 hover:bg-slate-50"
                      title="Facebook"
                    >
                      <Facebook className="h-3 w-3" />
                    </a>
                  )}
                  {client.instagram && (
                    <a
                      href={client.instagram.startsWith('http') ? client.instagram : `https://instagram.com/${client.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded border border-slate-200 p-1 text-pink-600 hover:bg-slate-50"
                      title="Instagram"
                    >
                      <Instagram className="h-3 w-3" />
                    </a>
                  )}
                  {client.website && (
                    <a
                      href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded border border-slate-200 p-1 text-slate-500 hover:bg-slate-50"
                      title="Website"
                    >
                      <Globe className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Contracts Value:</span>
                    <strong className="text-slate-900">
                      {[
                        usdTotal > 0 ? formatCurrency(usdTotal, 'USD') : '',
                        bdtTotal > 0 ? formatCurrency(bdtTotal, 'BDT') : '',
                      ]
                        .filter(Boolean)
                        .join(' + ') || '$0'}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Active Sprints:</span>
                    <span className="font-semibold text-blue-600">
                      {clientProjects.filter((p) => p.status !== 'Completed' && p.status !== 'Cancelled').length} active
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Add project & view profile */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleOpenAddProjectForClient(client)}
                  className="w-full flex items-center justify-center gap-1 rounded-lg bg-blue-50 border border-blue-200 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Add New Project for this Client</span>
                </button>

                <button
                  onClick={() => setSelectedClientId(client.id)}
                  className="w-full flex items-center justify-center gap-1 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>View All Projects & Ledger</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Client Profile Modal */}
      {activeClient && activeClientFin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedClientId(null)}
          />

          <div className="relative flex flex-col w-full max-w-4xl h-[90vh] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="border-b border-slate-100 bg-slate-50/80 p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-slate-400">{activeClient.id}</span>
                <h3 className="text-xl font-bold text-slate-900">{activeClient.businessName}</h3>
                <div className="mt-1 text-xs text-slate-500">
                  {activeClient.contactPerson} · {activeClient.businessCategory} ·{' '}
                  {activeClient.city}, {activeClient.country}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAddProjectForClient(activeClient)}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Add Project</span>
                </button>

                {currentUser?.role === 'Owner' && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Delete client "${activeClient.businessName}"? Note: In accordance with ERP rules, clients with active projects or payment records cannot be deleted directly.`
                        )
                      ) {
                        const success = deleteClient(activeClient.id);
                        if (success) {
                          setSelectedClientId(null);
                        }
                      }
                    }}
                    className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                    title="Delete Client (Owner only)"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Delete Client</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedClientId(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Financial KPI stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">USD Sales</span>
                  <strong className="text-sm font-bold text-slate-900">
                    {formatCurrency(activeClientFin.totalSalesUSD, 'USD')}
                  </strong>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">USD Received</span>
                  <strong className="text-sm font-bold text-emerald-600">
                    {formatCurrency(activeClientFin.totalReceivedUSD, 'USD')}
                  </strong>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">BDT Sales</span>
                  <strong className="text-sm font-bold text-slate-900">
                    {formatCurrency(activeClientFin.totalSalesBDT, 'BDT')}
                  </strong>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">BDT Received</span>
                  <strong className="text-sm font-bold text-emerald-600">
                    {formatCurrency(activeClientFin.totalReceivedBDT, 'BDT')}
                  </strong>
                </div>
              </div>

              {/* Projects List with specific payment actions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Client Projects ({activeClientProjects.length})
                  </h4>
                  <button
                    onClick={() => handleOpenAddProjectForClient(activeClient)}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    + Add Another Project
                  </button>
                </div>

                {activeClientProjects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                    No projects yet for this client.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeClientProjects.map((p) => {
                      const fin = getProjectFinancials(p.id);
                      return (
                        <div
                          key={p.id}
                          className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-mono text-[10px] text-slate-400">{p.id}</span>
                              <h5 className="font-bold text-sm text-slate-900">{p.projectName}</h5>
                              <div className="text-[11px] text-slate-500">
                                {p.serviceName} · Target Deadline: {p.deadline} · Status: {p.status}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Editable Status even after full payment */}
                              <select
                                value={p.status}
                                onChange={(e) =>
                                  updateProject(p.id, { status: e.target.value as ProjectStatus })
                                }
                                className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-800 shadow-2xs focus:border-blue-600 cursor-pointer"
                                title="Change Project Status (Not Started, In Progress, Review, Completed, etc.)"
                              >
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Waiting for Client">Waiting for Client</option>
                                <option value="Review">Review</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>

                              <span
                                className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                                  fin.status === 'Fully Paid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : fin.status === 'Partially Paid'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {fin.status}
                              </span>

                              {currentUser?.role === 'Owner' && (
                                <button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        `Delete project "${p.projectName}"? Note: In ERP accounting, if this project has payment records, payment details must be removed first.`
                                      )
                                    ) {
                                      deleteProject(p.id);
                                    }
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete Project (Owner only)"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Project Value:</span>
                              <strong className="text-slate-900">{formatCurrency(fin.value, p.currency)}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Received:</span>
                              <strong className="text-emerald-600">{formatCurrency(fin.received, p.currency)}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Pending:</span>
                              <strong className={fin.pending > 0 ? 'text-amber-600' : 'text-slate-400'}>
                                {formatCurrency(fin.pending, p.currency)}
                              </strong>
                            </div>
                            {fin.pending > 0 && (
                              <button
                                onClick={() => handleOpenPaymentForProject(p)}
                                className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 shadow-2xs"
                              >
                                + Record Payment
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Payments History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Payment Receipts ({activeClientPayments.length})
                </h4>
                {activeClientPayments.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                    No payment history recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeClientPayments.map((pay) => (
                      <div
                        key={pay.id}
                        className="rounded-xl border border-slate-200 p-3 flex items-center justify-between text-xs bg-slate-50/50"
                      >
                        <div>
                          <span className="font-mono text-slate-800 font-semibold">
                            {pay.invoiceNumber}
                          </span>
                          <span className="text-slate-400 text-[11px] ml-2">
                            {pay.paymentDate} via {pay.paymentMethod}
                          </span>
                          <div className="text-[11px] text-slate-500 font-medium">
                            Project: {pay.projectName}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-600 text-sm">
                            +{formatCurrency(pay.amount, pay.currency)}
                          </span>
                          {currentUser?.role === 'Owner' && (
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Delete payment receipt ${pay.invoiceNumber} (${formatCurrency(
                                      pay.amount,
                                      pay.currency
                                    )})?`
                                  )
                                ) {
                                  deletePayment(pay.id);
                                }
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Payment (Owner only)"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Project for Specific Client */}
      {clientForNewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setClientForNewProject(null)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Add New Project for {clientForNewProject.businessName}
                </h3>
                <p className="text-xs text-slate-500">
                  Create a secondary or repeat project for this existing client
                </p>
              </div>
              <button
                onClick={() => setClientForNewProject(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProjectForClient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WooCommerce Speed Optimization Sprint"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
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
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
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
                    <span>{currency === 'BDT' ? 'BDT (৳) - Bangladesh Client' : 'USD ($) - International / USA'}</span>
                    <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      Fixed
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Agreed Project Value ({currency === 'BDT' ? '৳' : '$'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
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
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Project Scope & Deliverables
                </label>
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={projectNotes}
                  onChange={(e) => setProjectNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setClientForNewProject(null)}
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

      {/* Modal: Quick Record Payment for specific project */}
      {projectForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setProjectForPayment(null)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Record Payment: {projectForPayment.projectName}
            </h3>

            <form onSubmit={handleRecordProjectPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Amount Received ({projectForPayment.currency === 'BDT' ? '৳' : '$'})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Payment Date
                </label>
                <input
                  type="date"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Notes / Ref</label>
                <input
                  type="text"
                  placeholder="e.g. 50% milestone or final settlement"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProjectForPayment(null)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Client */}
      {isAddClientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddClientOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Client Account</h3>
              <button
                onClick={() => setIsAddClientOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nordic Wood Furniture"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Contact Person
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lars Lindqvist"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+1 555 123 4567"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    placeholder="client@domain.com"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600">Facebook</label>
                  <input
                    type="text"
                    placeholder="Page / Profile"
                    className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-900"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600">Instagram</label>
                  <input
                    type="text"
                    placeholder="@handle"
                    className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-900"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600">Twitter / X</label>
                  <input
                    type="text"
                    placeholder="@handle"
                    className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-900"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Country</label>
                  <input
                    type="text"
                    placeholder="United States / Bangladesh"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">City</label>
                  <input
                    type="text"
                    placeholder="Austin / Dhaka"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Client Currency (Fixed for all projects and payments)
                </label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                  value={newClientCurrency}
                  onChange={(e) => setNewClientCurrency(e.target.value as Currency)}
                >
                  <option value="USD">USD ($) - International / USA</option>
                  <option value="BDT">BDT (৳) - Bangladesh Local Client</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Website</label>
                <input
                  type="text"
                  placeholder="https://clientwebsite.com"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddClientOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
