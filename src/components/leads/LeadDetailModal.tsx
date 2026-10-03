import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  Calendar,
  DollarSign,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Edit2,
  Trash2,
  FileCheck2,
  FolderGit2,
  AlertCircle,
  Check,
  Facebook,
  Instagram,
  Twitter,
  MapPin,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import {
  ContactMethod,
  Currency,
  LeadSource,
  LeadStatus,
  MessageType,
  Priority,
} from '../../types/crm';
import { ConvertLeadModal } from './ConvertLeadModal';

export const LeadDetailModal: React.FC = () => {
  const {
    leads,
    selectedLeadId,
    setSelectedLeadId,
    updateLead,
    deleteLead,
    communications,
    addCommunication,
    followUps,
    addFollowUp,
    completeFollowUp,
    proposals,
    projects,
    profile,
    getLeadTimeline,
    setCurrentTab,
    setSelectedClientId,
    formatCurrency,
    assignableUsers,
    users,
    currentUser,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<
    'timeline' | 'communications' | 'followups' | 'proposals' | 'edit'
  >('timeline');

  const [isConvertOpen, setIsConvertOpen] = useState(false);

  // New communication input states
  const [showAddComm, setShowAddComm] = useState(false);
  const [commMethod, setCommMethod] = useState<ContactMethod>('WhatsApp');
  const [commType, setCommType] = useState<MessageType>('Follow-up');
  const [commMessage, setCommMessage] = useState('');
  const [commResponse, setCommResponse] = useState('');

  // New follow-up input states
  const [showAddFlp, setShowAddFlp] = useState(false);
  const [flpDate, setFlpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [flpNotes, setFlpNotes] = useState('');
  const [flpMethod, setFlpMethod] = useState<ContactMethod>('WhatsApp');

  const lead = leads.find((l) => l.id === selectedLeadId);

  if (!lead) return null;

  const timeline = getLeadTimeline(lead.id);
  const leadComms = communications.filter((c) => c.leadId === lead.id);
  const leadFlps = followUps.filter((f) => f.leadId === lead.id);
  const leadProposals = proposals.filter((p) => p.leadId === lead.id);
  const leadProjects = projects.filter((p) => p.leadId === lead.id);

  // WhatsApp quick link
  const cleanPhone = lead.whatsapp.replace(/[^0-9]/g, '');
  const waMessage = encodeURIComponent(
    profile.whatsappTemplate
      .replace('{contact}', lead.contactPerson)
      .replace('{business}', lead.businessName)
  );
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${waMessage}`
    : `https://wa.me/?text=${waMessage}`;

  const mailtoUrl = `mailto:${lead.email}?subject=${encodeURIComponent(
    `Web Development for ${lead.businessName}`
  )}`;

  const handleCreateComm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commMessage.trim()) return;

    addCommunication({
      leadId: lead.id,
      clientId: lead.clientId,
      date: new Date().toISOString(),
      contactMethod: commMethod,
      messageType: commType,
      messageSent: commMessage.trim(),
      clientResponse: commResponse.trim() || undefined,
      responseDate: commResponse.trim() ? new Date().toISOString() : undefined,
    });

    setCommMessage('');
    setCommResponse('');
    setShowAddComm(false);
  };

  const handleCreateFlp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flpDate) return;

    addFollowUp({
      leadId: lead.id,
      clientId: lead.clientId,
      businessName: lead.businessName,
      contactPerson: lead.contactPerson,
      contactMethod: flpMethod,
      dueDate: flpDate,
      notes: flpNotes.trim() || `Follow up regarding ${lead.serviceName}`,
      priority: lead.priority,
      leadStatus: lead.status,
    });

    setFlpNotes('');
    setShowAddFlp(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setSelectedLeadId(null)}
      />

      <div className="relative flex flex-col w-full max-w-4xl h-[92vh] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Top Header Card */}
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {lead.businessName}
                </h2>
                <span className="font-mono text-xs text-slate-400">{lead.id}</span>
                {lead.clientId && (
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    Converted Client ({lead.clientId})
                  </span>
                )}
                {lead.leadSource === 'Google Maps' && (
                  <span className="rounded-md bg-blue-100 text-blue-800 px-2 py-0.5 text-[11px] font-bold flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>Google Maps Lead</span>
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{lead.contactPerson}</span>
                <span aria-hidden="true">·</span>
                <span>{lead.businessCategory || 'Small Business'}</span>
                <span aria-hidden="true">·</span>
                <span>{lead.city ? `${lead.city}, ${lead.country}` : lead.country}</span>
                <span aria-hidden="true">·</span>
                <span>Source: {lead.leadSource}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentUser?.role === 'Owner' && (
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete lead ${lead.businessName}?`)) {
                      deleteLead(lead.id);
                      setSelectedLeadId(null);
                    }
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  title="Delete Lead (Owner only)"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setSelectedLeadId(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Inline Quick Status & Financial Badges */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 pt-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-500">Status:</span>
                <select
                  value={lead.status}
                  onChange={(e) => updateLead(lead.id, { status: e.target.value as LeadStatus })}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-600 focus:outline-hidden"
                >
                  <option value="New Lead">New Lead</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Replied">Replied</option>
                  <option value="Interested">Interested</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              {/* Priority Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-500">Priority:</span>
                <select
                  value={lead.priority}
                  onChange={(e) => updateLead(lead.id, { priority: e.target.value as Priority })}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 shadow-2xs focus:border-blue-600 focus:outline-hidden"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              {/* Deal Value */}
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-800 bg-slate-100/80 px-2.5 py-1 rounded-md">
                <span className="text-slate-500">Budget:</span>
                <span>
                  {lead.dealValue && lead.dealValue > 0
                    ? formatCurrency(lead.dealValue, lead.currency)
                    : 'To be discussed'}
                </span>
              </div>

              {/* Assigned Team Member */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-500">Assigned:</span>
                <select
                  value={lead.assignedTo || ''}
                  onChange={(e) => updateLead(lead.id, { assignedTo: e.target.value })}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-600 focus:outline-hidden"
                >
                  <option value="">Unassigned</option>
                  {assignableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {lead.whatsapp && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}

              {lead.email && (
                <a
                  href={mailtoUrl}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span>Email</span>
                </a>
              )}

              {lead.facebook && (
                <a
                  href={lead.facebook.startsWith('http') ? lead.facebook : `https://${lead.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-blue-600 shadow-2xs hover:bg-slate-50 transition-colors"
                  title="Facebook"
                >
                  <Facebook className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Facebook</span>
                </a>
              )}

              {lead.instagram && (
                <a
                  href={
                    lead.instagram.startsWith('http')
                      ? lead.instagram
                      : `https://instagram.com/${lead.instagram.replace('@', '')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-pink-600 shadow-2xs hover:bg-slate-50 transition-colors"
                  title="Instagram"
                >
                  <Instagram className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Instagram</span>
                </a>
              )}

              {lead.twitter && (
                <a
                  href={
                    lead.twitter.startsWith('http')
                      ? lead.twitter
                      : `https://x.com/${lead.twitter.replace('@', '')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-2xs hover:bg-slate-50 transition-colors"
                  title="Twitter / X"
                >
                  <Twitter className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Twitter</span>
                </a>
              )}

              {lead.website && (
                <a
                  href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
                  title="Visit Website"
                >
                  <Globe className="h-3.5 w-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Website</span>
                </a>
              )}

              {/* Convert to Client Button */}
              {!lead.clientId && (
                <button
                  onClick={() => setIsConvertOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Convert to Client</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`border-b-2 py-3 px-4 text-xs font-semibold transition-colors ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Chronological Timeline ({timeline.length})
          </button>
          <button
            onClick={() => setActiveTab('communications')}
            className={`border-b-2 py-3 px-4 text-xs font-semibold transition-colors ${
              activeTab === 'communications'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Communications ({leadComms.length})
          </button>
          <button
            onClick={() => setActiveTab('followups')}
            className={`border-b-2 py-3 px-4 text-xs font-semibold transition-colors ${
              activeTab === 'followups'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Follow-ups ({leadFlps.length})
          </button>
          <button
            onClick={() => setActiveTab('proposals')}
            className={`border-b-2 py-3 px-4 text-xs font-semibold transition-colors ${
              activeTab === 'proposals'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Proposals & Projects ({leadProposals.length + leadProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`border-b-2 py-3 px-4 text-xs font-semibold transition-colors ${
              activeTab === 'edit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Lead Information
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          {/* TAB 1: Chronological Relationship Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Client Journey & Activity History
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('communications');
                      setShowAddComm(true);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Log Message</span>
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    onClick={() => {
                      setActiveTab('followups');
                      setShowAddFlp(true);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Schedule Follow-up</span>
                  </button>
                </div>
              </div>

              {timeline.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No timeline entries yet. Log a message or follow-up to start.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:bottom-0 before:top-2 before:left-[11px] before:w-[2px] before:bg-slate-200">
                  {timeline.map((evt) => {
                    let dotColor = 'bg-blue-600';
                    if (evt.type === 'response') dotColor = 'bg-emerald-600';
                    if (evt.type === 'won') dotColor = 'bg-indigo-600';
                    if (evt.type === 'payment') dotColor = 'bg-emerald-500';
                    if (evt.type === 'proposal') dotColor = 'bg-purple-600';
                    if (evt.type === 'followup') dotColor = 'bg-amber-500';

                    return (
                      <div key={evt.id} className="relative group">
                        <div
                          className={`absolute -left-[19px] top-1.5 h-3 w-3 rounded-full border-2 border-white ${dotColor} shadow-2xs`}
                        />

                        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-slate-300 transition-colors">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-900">{evt.title}</span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(evt.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                            {evt.description}
                          </p>
                          {(evt as any).amount && (
                            <div className="mt-2 text-xs font-semibold text-emerald-600">
                              {formatCurrency((evt as any).amount, (evt as any).currency || lead.currency)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Communications */}
          {activeTab === 'communications' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Communication Logs ({leadComms.length})
                </h3>
                <button
                  onClick={() => setShowAddComm(!showAddComm)}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{showAddComm ? 'Cancel' : 'Log New Communication'}</span>
                </button>
              </div>

              {showAddComm && (
                <form
                  onSubmit={handleCreateComm}
                  className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 space-y-3"
                >
                  <div className="font-semibold text-xs text-blue-900">
                    Record New Interaction
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Contact Method
                      </label>
                      <select
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        value={commMethod}
                        onChange={(e) => setCommMethod(e.target.value as ContactMethod)}
                      >
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Email">Email</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Twitter">Twitter / X</option>
                        <option value="Phone">Phone</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Upwork">Upwork</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Message Type
                      </label>
                      <select
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        value={commType}
                        onChange={(e) => setCommType(e.target.value as MessageType)}
                      >
                        <option value="Introduction">Introduction</option>
                        <option value="Service Offer">Service Offer</option>
                        <option value="Website Audit">Website Audit</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Price Discussion">Price Discussion</option>
                        <option value="Proposal">Proposal</option>
                        <option value="Payment">Payment</option>
                        <option value="Project Update">Project Update</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Message Sent / Summary <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. Sent video audit explaining their mobile page load issues."
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                      value={commMessage}
                      onChange={(e) => setCommMessage(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Client Response (if received)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Client replied on Instagram DM asking for price list."
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                      value={commResponse}
                      onChange={(e) => setCommResponse(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddComm(false)}
                      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Save Communication
                    </button>
                  </div>
                </form>
              )}

              {leadComms.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                  No communications logged yet for this lead.
                </div>
              ) : (
                <div className="space-y-3">
                  {leadComms.map((comm) => (
                    <div
                      key={comm.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {comm.contactMethod}
                          </span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                            {comm.messageType}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(comm.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <strong className="text-slate-900 block mb-0.5">Sent:</strong>
                        {comm.messageSent}
                      </div>

                      {comm.clientResponse && (
                        <div className="text-xs text-emerald-900 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100">
                          <strong className="text-emerald-950 block mb-0.5">Client Replied:</strong>
                          {comm.clientResponse}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Follow-ups */}
          {activeTab === 'followups' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Follow-up Tasks
                </h3>
                <button
                  onClick={() => setShowAddFlp(!showAddFlp)}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Schedule Follow-up</span>
                </button>
              </div>

              {showAddFlp && (
                <form
                  onSubmit={handleCreateFlp}
                  className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 space-y-3"
                >
                  <div className="font-semibold text-xs text-blue-900">
                    Schedule Follow-up
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Target Date
                      </label>
                      <input
                        type="date"
                        required
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        value={flpDate}
                        onChange={(e) => setFlpDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">
                        Preferred Channel
                      </label>
                      <select
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        value={flpMethod}
                        onChange={(e) => setFlpMethod(e.target.value as ContactMethod)}
                      >
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Email">Email</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Twitter">Twitter / X</option>
                        <option value="Phone">Phone</option>
                        <option value="LinkedIn">LinkedIn</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Follow-up Objective & Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Check if client reviewed the proposal"
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                      value={flpNotes}
                      onChange={(e) => setFlpNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddFlp(false)}
                      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Save Follow-up
                    </button>
                  </div>
                </form>
              )}

              {leadFlps.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                  No follow-ups recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {leadFlps.map((flp) => (
                    <div
                      key={flp.id}
                      className={`rounded-xl border p-3.5 transition-colors ${
                        flp.completed
                          ? 'border-slate-200 bg-slate-50/50 opacity-70'
                          : flp.dueDate < '2026-10-02'
                          ? 'border-rose-200 bg-rose-50/40'
                          : flp.dueDate === '2026-10-02'
                          ? 'border-amber-200 bg-amber-50/40'
                          : 'border-slate-200 bg-white shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900">
                              {flp.contactMethod}: Due {flp.dueDate}
                            </span>
                            {flp.completed ? (
                              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-medium">
                                Completed
                              </span>
                            ) : flp.dueDate < '2026-10-02' ? (
                              <span className="text-[10px] text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded font-semibold">
                                Overdue
                              </span>
                            ) : flp.dueDate === '2026-10-02' ? (
                              <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-medium">
                                Today
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs text-slate-600">{flp.notes}</p>
                          {flp.outcomeNotes && (
                            <p className="mt-1 text-xs text-emerald-800 italic">
                              Outcome: {flp.outcomeNotes}
                            </p>
                          )}
                        </div>

                        {!flp.completed && (
                          <button
                            onClick={() => {
                              const outcome = prompt('Outcome notes for this follow-up:');
                              completeFollowUp(flp.id, outcome || undefined);
                            }}
                            className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Mark Done</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Proposals & Projects */}
          {activeTab === 'proposals' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Proposals Sent ({leadProposals.length})
                  </h3>
                  <button
                    onClick={() => {
                      setCurrentTab('proposals');
                      setSelectedLeadId(null);
                    }}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    + Manage Proposals
                  </button>
                </div>
                {leadProposals.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                    No proposals sent yet for this lead.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leadProposals.map((prop) => (
                      <div
                        key={prop.id}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-900">{prop.title}</span>
                          <span className="font-bold text-slate-900">
                            {formatCurrency(prop.proposalAmount, prop.currency)}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                          {prop.serviceName} · Sent {prop.sentDate} · Status: {prop.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Active Projects ({leadProjects.length})
                  </h3>
                  <button
                    onClick={() => {
                      setCurrentTab('projects');
                      setSelectedLeadId(null);
                    }}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    + Manage Projects
                  </button>
                </div>
                {leadProjects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                    No project created yet. Convert lead to start a project.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leadProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-900">{proj.projectName}</span>
                          <span className="font-bold text-emerald-600">
                            {formatCurrency(proj.projectValue, proj.currency)}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                          Deadline: {proj.deadline} · Status: {proj.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Edit Lead Information */}
          {activeTab === 'edit' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Lead Details & Editable Attributes
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Business Name
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      value={lead.businessName}
                      onChange={(e) => updateLead(lead.id, { businessName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      value={lead.contactPerson}
                      onChange={(e) => updateLead(lead.id, { contactPerson: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Facebook
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-900"
                      value={lead.facebook || ''}
                      onChange={(e) => updateLead(lead.id, { facebook: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Instagram
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-900"
                      value={lead.instagram || ''}
                      onChange={(e) => updateLead(lead.id, { instagram: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Twitter / X
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-900"
                      value={lead.twitter || ''}
                      onChange={(e) => updateLead(lead.id, { twitter: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      WhatsApp / Phone
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      value={lead.whatsapp}
                      onChange={(e) => updateLead(lead.id, { whatsapp: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      value={lead.email}
                      onChange={(e) => updateLead(lead.id, { email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Currency
                    </label>
                    <select
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-900"
                      value={lead.currency || 'USD'}
                      onChange={(e) => updateLead(lead.id, { currency: e.target.value as Currency })}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="BDT">BDT (৳)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Budget / Deal Value
                    </label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-900"
                      value={lead.dealValue || 0}
                      onChange={(e) => updateLead(lead.id, { dealValue: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Lead Source
                    </label>
                    <select
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-900"
                      value={lead.leadSource}
                      onChange={(e) => updateLead(lead.id, { leadSource: e.target.value as LeadSource })}
                    >
                      <option value="Google Maps">Google Maps</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Twitter">Twitter / X</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Cold Email">Cold Email</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Upwork">Upwork</option>
                      <option value="Fiverr">Fiverr</option>
                      <option value="Referral">Referral</option>
                      <option value="Website">Website</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600">
                    Lead Notes & Project Brief
                  </label>
                  <textarea
                    rows={3}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-900"
                    value={lead.notes || ''}
                    onChange={(e) => updateLead(lead.id, { notes: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Convert Lead Modal */}
      {isConvertOpen && (
        <ConvertLeadModal
          lead={lead}
          isOpen={isConvertOpen}
          onClose={() => setIsConvertOpen(false)}
          onSuccess={(clientId) => {
            setIsConvertOpen(false);
            setSelectedLeadId(null);
            setSelectedClientId(clientId);
            setCurrentTab('clients');
          }}
        />
      )}
    </div>
  );
};
