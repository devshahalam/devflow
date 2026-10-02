import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Download,
  Trash2,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Mail,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  MapPin,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import {
  Lead,
  LeadSource,
  LeadStatus,
  PaymentStatus,
  Priority,
} from '../../types/crm';

export const LeadsView: React.FC = () => {
  const {
    leads,
    services,
    setSelectedLeadId,
    setIsQuickAddOpen,
    updateLead,
    deleteLead,
    formatCurrency,
    profile,
    currentUser,
  } = useCRM();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [currencyFilter, setCurrencyFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Sorting
  const [sortBy, setSortBy] = useState<keyof Lead>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Bulk Selection
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Column Visibility
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    businessCategory: false,
    country: true,
    leadSource: true,
    service: true,
    nextFollowup: true,
  });

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          lead.businessName.toLowerCase().includes(q) ||
          lead.contactPerson.toLowerCase().includes(q) ||
          lead.email.toLowerCase().includes(q) ||
          lead.whatsapp.includes(q) ||
          lead.website.toLowerCase().includes(q) ||
          lead.id.toLowerCase().includes(q);

        const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
        const matchesSource = sourceFilter === 'All' || lead.leadSource === sourceFilter;
        const matchesCurrency = currencyFilter === 'All' || lead.currency === currencyFilter;
        const matchesPriority = priorityFilter === 'All' || lead.priority === priorityFilter;

        return matchesQuery && matchesStatus && matchesSource && matchesCurrency && matchesPriority;
      })
      .sort((a, b) => {
        let valA = a[sortBy] ?? '';
        let valB = b[sortBy] ?? '';

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }

        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    leads,
    searchQuery,
    statusFilter,
    sourceFilter,
    currencyFilter,
    priorityFilter,
    sortBy,
    sortOrder,
  ]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage) || 1;
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: keyof Lead) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeadIds(paginatedLeads.map((l) => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = (status: LeadStatus) => {
    selectedLeadIds.forEach((id) => updateLead(id, { status }));
    setSelectedLeadIds([]);
  };

  const handleBulkDelete = () => {
    if (currentUser?.role !== 'Owner') {
      alert('Action Denied: Only the Owner has permission to delete leads.');
      return;
    }
    if (confirm(`Delete ${selectedLeadIds.length} selected leads?`)) {
      selectedLeadIds.forEach((id) => deleteLead(id));
      setSelectedLeadIds([]);
    }
  };

  const exportLeadsCSV = () => {
    const headers = [
      'Lead ID',
      'Business Name',
      'Contact Person',
      'Email',
      'WhatsApp',
      'Source',
      'Service',
      'Currency',
      'Estimated Budget',
      'Status',
      'Next Follow-up',
    ];

    const rows = filteredLeads.map((l) => [
      l.id,
      `"${l.businessName.replace(/"/g, '""')}"`,
      `"${l.contactPerson.replace(/"/g, '""')}"`,
      l.email,
      l.whatsapp,
      l.leadSource,
      `"${l.serviceName.replace(/"/g, '""')}"`,
      l.currency,
      l.dealValue || 0,
      l.status,
      l.nextFollowUpDate || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Leads Pipeline
          </h2>
          <p className="text-xs text-slate-500">
            Manage prospects from Google Maps, social media, and cold outreach.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportLeadsCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Lead</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by business, contact, email, phone, ID..."
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Currency Filter */}
            <select
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:border-blue-600 focus:outline-hidden"
              value={currencyFilter}
              onChange={(e) => {
                setCurrencyFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Currencies</option>
              <option value="USD">USD ($)</option>
              <option value="BDT">BDT (৳)</option>
            </select>

            {/* Source Filter (with Google Maps) */}
            <select
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-600 focus:outline-hidden"
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Sources</option>
              <option value="Google Maps">📍 Google Maps</option>
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

            {/* Status Filter */}
            <select
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-600 focus:outline-hidden"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Statuses</option>
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
        </div>

        {/* Bulk Action Bar */}
        {selectedLeadIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs">
            <span className="font-semibold text-blue-900">
              {selectedLeadIds.length} lead(s) selected
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Mark as:</span>
              <button
                onClick={() => handleBulkStatusChange('Contacted')}
                className="rounded bg-white px-2 py-1 text-slate-700 font-medium hover:bg-slate-100 shadow-2xs"
              >
                Contacted
              </button>
              <button
                onClick={() => handleBulkStatusChange('Won')}
                className="rounded bg-emerald-600 px-2 py-1 text-white font-medium hover:bg-emerald-700 shadow-2xs"
              >
                Won
              </button>
              {currentUser?.role === 'Owner' && (
                <button
                  onClick={handleBulkDelete}
                  className="rounded bg-rose-600 px-2 py-1 text-white font-medium hover:bg-rose-700 shadow-2xs ml-2"
                >
                  <Trash2 className="h-3 w-3 inline mr-1" />
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Leads Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="w-8 py-3 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedLeads.length > 0 &&
                      paginatedLeads.every((l) => selectedLeadIds.includes(l.id))
                    }
                    onChange={handleSelectAll}
                    className="rounded text-blue-600"
                  />
                </th>
                <th
                  className="cursor-pointer py-3 px-3 hover:text-slate-900"
                  onClick={() => handleSort('businessName')}
                >
                  <div className="flex items-center gap-1">
                    <span>Business & Contact</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3">Service</th>
                <th
                  className="cursor-pointer py-3 px-3 hover:text-slate-900"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Follow-up</th>
                <th className="py-3 px-3 text-right">Budget</th>
                <th className="py-3 px-3 text-center">Social & Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLeads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);
                const isFollowupToday = lead.nextFollowUpDate === '2026-10-02';
                const isFollowupOverdue =
                  lead.nextFollowUpDate && lead.nextFollowUpDate < '2026-10-02';

                return (
                  <tr
                    key={lead.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isSelected ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(lead.id)}
                        className="rounded text-blue-600"
                      />
                    </td>

                    <td className="py-3 px-3">
                      <div
                        className="cursor-pointer group"
                        onClick={() => setSelectedLeadId(lead.id)}
                      >
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                          <span>{lead.businessName}</span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {lead.id}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {lead.contactPerson}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-800">{lead.country}</div>
                      {lead.city && (
                        <div className="text-[10px] text-slate-400">{lead.city}</div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {lead.leadSource === 'Google Maps' ? (
                        <span className="font-semibold text-blue-700 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>Google Maps</span>
                        </span>
                      ) : (
                        <span className="font-medium text-slate-700">{lead.leadSource}</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-800 max-w-[140px] truncate">
                      {lead.serviceName}
                    </td>

                    <td className="py-3 px-3">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          updateLead(lead.id, { status: e.target.value as LeadStatus })
                        }
                        className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-800 shadow-2xs focus:border-blue-600 focus:outline-hidden"
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
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px]">
                      {lead.nextFollowUpDate ? (
                        <span
                          className={
                            isFollowupOverdue
                              ? 'text-rose-600 font-bold'
                              : isFollowupToday
                              ? 'text-amber-700 font-bold'
                              : 'text-slate-700'
                          }
                        >
                          {lead.nextFollowUpDate}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-semibold text-slate-900">
                      {lead.dealValue && lead.dealValue > 0 ? (
                        formatCurrency(lead.dealValue, lead.currency)
                      ) : (
                        <span className="text-[10px] text-slate-400 font-normal italic">
                          To be set
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {lead.facebook && (
                          <a
                            href={lead.facebook.startsWith('http') ? lead.facebook : `https://${lead.facebook}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 p-0.5"
                            title="Facebook"
                          >
                            <Facebook className="h-3.5 w-3.5" />
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
                            className="text-pink-600 hover:text-pink-800 p-0.5"
                            title="Instagram"
                          >
                            <Instagram className="h-3.5 w-3.5" />
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
                            className="text-slate-800 hover:text-black p-0.5"
                            title="Twitter / X"
                          >
                            <Twitter className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {lead.whatsapp && (
                          <a
                            href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-800 p-0.5"
                            title="WhatsApp"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="rounded p-0.5 text-slate-400 hover:text-slate-900"
                          title="Open Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 bg-slate-50/50 text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredLeads.length)} of{' '}
            {filteredLeads.length} leads
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
