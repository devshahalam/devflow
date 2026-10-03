import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Plus,
  Calendar,
  MessageCircle,
  Mail,
  Phone,
  Facebook,
  ExternalLink,
  ChevronRight,
  User,
  Trash2,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ContactMethod, MessageType, Communication } from '../../types/crm';
import { ConfirmModal } from '../common/ConfirmModal';

export const CommunicationsView: React.FC = () => {
  const {
    communications,
    leads,
    addCommunication,
    deleteCommunication,
    currentUser,
    setSelectedLeadId,
    setCurrentTab,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [commToDelete, setCommToDelete] = useState<Communication | null>(null);

  // Modal for new interaction
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(leads[0]?.id || '');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('WhatsApp');
  const [messageType, setMessageType] = useState<MessageType>('Introduction');
  const [messageSent, setMessageSent] = useState('');
  const [clientResponse, setClientResponse] = useState('');

  const filteredComms = useMemo(() => {
    return communications
      .filter((c) => {
        const lead = leads.find((l) => l.id === c.leadId);
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          c.messageSent.toLowerCase().includes(q) ||
          (c.clientResponse && c.clientResponse.toLowerCase().includes(q)) ||
          (lead && lead.businessName.toLowerCase().includes(q)) ||
          (lead && lead.contactPerson.toLowerCase().includes(q));

        const matchesMethod = methodFilter === 'All' || c.contactMethod === methodFilter;
        const matchesType = typeFilter === 'All' || c.messageType === typeFilter;

        return matchesQuery && matchesMethod && matchesType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [communications, leads, searchQuery, methodFilter, typeFilter]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !messageSent.trim()) return;

    const lead = leads.find((l) => l.id === selectedLead);

    addCommunication({
      leadId: selectedLead,
      clientId: lead?.clientId || null,
      date: new Date().toISOString(),
      contactMethod,
      messageType,
      messageSent: messageSent.trim(),
      clientResponse: clientResponse.trim() || undefined,
      responseDate: clientResponse.trim() ? new Date().toISOString() : undefined,
    });

    setMessageSent('');
    setClientResponse('');
    setIsAddOpen(false);
  };

  const getMethodIcon = (method: ContactMethod) => {
    switch (method) {
      case 'WhatsApp':
        return <MessageCircle className="h-4 w-4 text-emerald-600" />;
      case 'Email':
        return <Mail className="h-4 w-4 text-blue-600" />;
      case 'Phone':
        return <Phone className="h-4 w-4 text-amber-600" />;
      case 'Facebook':
        return <Facebook className="h-4 w-4 text-indigo-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Communications Log
          </h2>
          <p className="text-xs text-slate-500">
            Complete interaction history with leads, prospects, and paying clients.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>+ Log Communication</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search sent messages, client replies, business names..."
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-600 focus:outline-hidden"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="All">All Channels</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Email">Email</option>
            <option value="Facebook">Facebook</option>
            <option value="Phone">Phone</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Upwork">Upwork</option>
          </select>

          <select
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-600 focus:outline-hidden"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Message Types</option>
            <option value="Introduction">Introduction</option>
            <option value="Service Offer">Service Offer</option>
            <option value="Website Audit">Website Audit</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Price Discussion">Price Discussion</option>
            <option value="Proposal">Proposal</option>
            <option value="Payment">Payment</option>
            <option value="Project Update">Project Update</option>
          </select>
        </div>
      </div>

      {/* Communications Feed */}
      <div className="space-y-3">
        {filteredComms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-2xs">
            <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />
            <h3 className="mt-2 text-sm font-bold text-slate-900">No communications found</h3>
            <p className="mt-1 text-xs text-slate-500">
              No matching messages or logs under these filters.
            </p>
          </div>
        ) : (
          filteredComms.map((comm) => {
            const lead = leads.find((l) => l.id === comm.leadId);
            return (
              <div
                key={comm.id}
                className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-slate-300 transition-colors space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    {getMethodIcon(comm.contactMethod)}
                    <span className="font-semibold text-xs text-slate-900">
                      {comm.contactMethod}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {comm.messageType}
                    </span>
                    {lead && (
                      <button
                        onClick={() => {
                          setSelectedLeadId(lead.id);
                          setCurrentTab('leads');
                        }}
                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>{lead.businessName} ({lead.contactPerson})</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      {new Date(comm.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {currentUser?.role === 'Owner' && (
                      <button
                        onClick={() => setCommToDelete(comm)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Communication"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Message Sent:
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {comm.messageSent}
                    </p>
                  </div>

                  {comm.clientResponse ? (
                    <div className="rounded-lg bg-emerald-50/60 p-3 border border-emerald-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                        Client Response:
                      </span>
                      <p className="text-xs text-emerald-950 leading-relaxed whitespace-pre-wrap">
                        {comm.clientResponse}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-400">
                      Awaiting client reply...
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Log Communication Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Log Communication Interaction
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Select Lead / Client
                </label>
                <select
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={selectedLead}
                  onChange={(e) => setSelectedLead(e.target.value)}
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.businessName} ({l.contactPerson}) - {l.serviceName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Contact Channel
                  </label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value as ContactMethod)}
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Phone">Phone</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Upwork">Upwork</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Message Type
                  </label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value as MessageType)}
                  >
                    <option value="Introduction">Introduction</option>
                    <option value="Service Offer">Service Offer</option>
                    <option value="Website Audit">Website Audit</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Price Discussion">Price Discussion</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Payment">Payment</option>
                    <option value="Project Update">Project Update</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Message Sent
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Outline the pitch, proposal summary, or audit details sent to client..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={messageSent}
                  onChange={(e) => setMessageSent(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Client Response (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="What did the client reply with?"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={clientResponse}
                  onChange={(e) => setClientResponse(e.target.value)}
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
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!commToDelete}
        title="Delete Communication Log"
        message="Are you sure you want to delete this communication interaction record?"
        onConfirm={() => {
          if (commToDelete) deleteCommunication(commToDelete.id);
        }}
        onClose={() => setCommToDelete(null)}
      />
    </div>
  );
};
