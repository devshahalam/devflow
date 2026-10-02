import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Printer,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Proposal, ProposalStatus } from '../../types/crm';

export const ProposalsView: React.FC = () => {
  const {
    proposals,
    leads,
    clients,
    services,
    addProposal,
    updateProposal,
    deleteProposal,
    currentUser,
    profile,
    formatCurrency,
    setSelectedLeadId,
    setCurrentTab,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // New Proposal Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedLeadId, setModalLeadId] = useState(leads[0]?.id || '');
  const [title, setTitle] = useState('');
  const [serviceId, setServiceId] = useState(services[0]?.id || 'SRV-01');
  const [amount, setAmount] = useState<number>(services[0]?.defaultPrice || 850);
  const [sentDate, setSentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState<ProposalStatus>('Sent');
  const [scopeSummary, setScopeSummary] = useState('');
  const [notes, setNotes] = useState('');

  // Proposal Preview modal
  const [previewProposal, setPreviewProposal] = useState<Proposal | null>(null);

  // Conversion statistics
  const totalProposals = proposals.length;
  const acceptedProposals = proposals.filter((p) => p.status === 'Accepted').length;
  const negotiatingProposals = proposals.filter((p) => p.status === 'Negotiating').length;
  const sentProposals = proposals.filter((p) => p.status === 'Sent' || p.status === 'Viewed').length;
  const conversionRate = totalProposals > 0 ? Math.round((acceptedProposals / totalProposals) * 100) : 0;
  const totalValue = proposals.reduce((sum, p) => sum + p.proposalAmount, 0);

  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.serviceName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [proposals, searchQuery, statusFilter]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedLeadId) return;

    const lead = leads.find((l) => l.id === selectedLeadId);
    const service = services.find((s) => s.id === serviceId);

    addProposal({
      leadId: selectedLeadId,
      clientId: lead?.clientId || `CLI-TEMP-${selectedLeadId}`,
      clientName: lead ? lead.businessName : 'Client',
      serviceId,
      serviceName: service ? service.name : 'WordPress Website',
      title: title.trim(),
      proposalAmount: Number(amount) || 0,
      currency: lead?.currency || 'USD',
      sentDate,
      expiryDate,
      status,
      scopeSummary: scopeSummary.trim() || 'Complete delivery of web development milestones as per agreed scope.',
      notes: notes.trim(),
    });

    setIsAddOpen(false);
    setTitle('');
    setScopeSummary('');
  };

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Proposals & Quotes
          </h2>
          <p className="text-xs text-slate-500">
            Send high-converting web project proposals and track client sign-offs.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>+ Create Proposal</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Total Proposals</div>
          <div className="mt-1 text-xl font-bold text-slate-900">{totalProposals}</div>
          <div className="text-[10px] text-slate-400">Total pipeline value: {formatCurrency(totalValue)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Accepted Deals</div>
          <div className="mt-1 text-xl font-bold text-emerald-600">{acceptedProposals}</div>
          <div className="text-[10px] text-emerald-600 font-medium">Won contracts</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Negotiating</div>
          <div className="mt-1 text-xl font-bold text-amber-600">{negotiatingProposals}</div>
          <div className="text-[10px] text-amber-600">Close to closing</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Pending Review</div>
          <div className="mt-1 text-xl font-bold text-blue-600">{sentProposals}</div>
          <div className="text-[10px] text-blue-600">Sent / Viewed</div>
        </div>
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-indigo-900">Conversion Rate</div>
          <div className="mt-1 text-xl font-bold text-indigo-600">{conversionRate}%</div>
          <div className="text-[10px] text-indigo-700">Proposal to Won</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search proposals by title, client name, service..."
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-600 focus:outline-hidden"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Viewed">Viewed</option>
          <option value="Negotiating">Negotiating</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
          <option value="Expired">Expired</option>
        </select>
      </div>

      {/* Proposals Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProposals.map((prop) => {
          const isAccepted = prop.status === 'Accepted';
          const isNegotiating = prop.status === 'Negotiating';
          return (
            <div
              key={prop.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] text-slate-400">{prop.id}</span>
                  <h3 className="text-sm font-bold text-slate-900">{prop.title}</h3>
                  <div className="text-xs text-slate-500 font-medium">
                    {prop.clientName} · {prop.serviceName}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">
                    {formatCurrency(prop.proposalAmount)}
                  </div>
                  {/* Inline Status selector */}
                  <select
                    value={prop.status}
                    onChange={(e) =>
                      updateProposal(prop.id, { status: e.target.value as ProposalStatus })
                    }
                    className="mt-1 rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-800 shadow-2xs focus:border-blue-600"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Viewed">Viewed</option>
                    <option value="Negotiating">Negotiating</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block text-[11px] mb-0.5">
                  Scope of Work:
                </span>
                {prop.scopeSummary}
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                <div>
                  Sent: <strong className="text-slate-600">{prop.sentDate}</strong> · Expires:{' '}
                  <strong className="text-slate-600">{prop.expiryDate}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewProposal(prop)}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Preview & Print</span>
                  </button>

                  {currentUser?.role === 'Owner' && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete proposal "${prop.title}"?`)) {
                          deleteProposal(prop.id);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Proposal (Owner only)"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Proposal Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddOpen(false)}
          />

          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Create Project Proposal / Quote
              </h3>
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
                  Select Lead / Client <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  value={selectedLeadId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setModalLeadId(id);
                    const lead = leads.find((l) => l.id === id);
                    if (lead) {
                      setTitle(`${lead.businessName} - ${lead.serviceName} Proposal`);
                      setAmount(lead.dealValue || 800);
                      setServiceId(lead.serviceId);
                    }
                  }}
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.businessName} ({l.contactPerson}) - {l.serviceName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Proposal Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Clinic Website & Online Patient Booking System"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Service Package
                  </label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                    value={serviceId}
                    onChange={(e) => {
                      setServiceId(e.target.value);
                      const srv = services.find((s) => s.id === e.target.value);
                      if (srv) setAmount(srv.defaultPrice);
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
                    Total Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Sent Date
                  </label>
                  <input
                    type="date"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                    value={sentDate}
                    onChange={(e) => setSentDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Deliverables & Scope Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline key features (e.g. 5 custom pages, WooCommerce integration, mobile responsive guarantee, speed optimization)..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  value={scopeSummary}
                  onChange={(e) => setScopeSummary(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
                  Create Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clean Printable Proposal Preview Modal */}
      {previewProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setPreviewProposal(null)}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                  {profile.businessName}
                </div>
                <div className="text-[11px] text-slate-500">
                  Web Development & Design Proposal
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setPreviewProposal(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs">
              <div>
                <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[10px]">
                  Prepared For:
                </span>
                <div className="mt-1 text-base font-bold text-slate-900">
                  {previewProposal.clientName}
                </div>
                <div className="text-slate-500">{previewProposal.serviceName}</div>
              </div>

              <div className="text-right">
                <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[10px]">
                  Proposal ID:
                </span>
                <div className="mt-1 font-mono text-sm font-semibold text-slate-900">
                  {previewProposal.id}
                </div>
                <div className="text-slate-500">Sent: {previewProposal.sentDate}</div>
                <div className="text-slate-500">Valid Until: {previewProposal.expiryDate}</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <h4 className="text-sm font-bold text-slate-900">{previewProposal.title}</h4>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {previewProposal.scopeSummary}
              </p>
            </div>

            <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Agreed Project Investment:
                </span>
                <span className="text-2xl font-bold text-slate-900">
                  {formatCurrency(previewProposal.proposalAmount)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-600 block">
                  Status: {previewProposal.status}
                </span>
                <span className="text-[11px] text-slate-400">
                  Standard terms: 50% upfront deposit upon acceptance.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
