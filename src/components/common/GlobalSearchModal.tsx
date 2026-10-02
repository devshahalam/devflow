import React, { useEffect, useState, useMemo } from 'react';
import { Search, X, Users, FolderGit, UserCheck, ArrowRight, DollarSign } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    leads,
    clients,
    projects,
    setSelectedLeadId,
    setSelectedClientId,
    setCurrentTab,
    formatCurrency,
  } = useCRM();

  const [query, setQuery] = useState('');

  // Handle keyboard shortcut Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { leads: [], clients: [], projects: [] };
    }

    const matchedLeads = leads.filter(
      (l) =>
        l.businessName.toLowerCase().includes(q) ||
        l.contactPerson.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.whatsapp.includes(q) ||
        l.serviceName.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
    );

    const matchedClients = clients.filter(
      (c) =>
        c.businessName.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.whatsapp.includes(q) ||
        c.id.toLowerCase().includes(q)
    );

    const matchedProjects = projects.filter(
      (p) =>
        p.projectName.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.serviceName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );

    return {
      leads: matchedLeads.slice(0, 5),
      clients: matchedClients.slice(0, 5),
      projects: matchedProjects.slice(0, 5),
    };
  }, [query, leads, clients, projects]);

  if (!isSearchOpen) return null;

  const totalResults =
    searchResults.leads.length + searchResults.clients.length + searchResults.projects.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-20">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl transition-all">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-100 px-4 py-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, clients, projects, emails, phone numbers... (Press Esc to close)"
            className="ml-3 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="mr-2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="hidden rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 sm:inline-block">
            ESC
          </span>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Type to quickly find any lead, client, project, or invoice...
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching records found for "{query}".
            </div>
          ) : (
            <div className="space-y-4">
              {/* Leads Results */}
              {searchResults.leads.length > 0 && (
                <div>
                  <div className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-blue-500" />
                    <span>Leads ({searchResults.leads.length})</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.leads.map((lead) => (
                      <button
                        key={lead.id}
                        onClick={() => {
                          setSelectedLeadId(lead.id);
                          setCurrentTab('leads');
                          setIsSearchOpen(false);
                        }}
                        className="group flex w-full items-center justify-between rounded-lg p-2 text-left text-xs hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 group-hover:text-blue-600 flex items-center gap-2">
                            <span>{lead.businessName}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {lead.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {lead.contactPerson} · {lead.serviceName} · {lead.status}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-600">
                          <span className="font-semibold text-slate-700">
                            {formatCurrency(lead.dealValue || 0, lead.currency)}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clients Results */}
              {searchResults.clients.length > 0 && (
                <div>
                  <div className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Clients ({searchResults.clients.length})</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.clients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => {
                          setSelectedClientId(client.id);
                          setCurrentTab('clients');
                          setIsSearchOpen(false);
                        }}
                        className="group flex w-full items-center justify-between rounded-lg p-2 text-left text-xs hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 group-hover:text-emerald-600">
                            {client.businessName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {client.contactPerson} · {client.email} · {client.city}
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Results */}
              {searchResults.projects.length > 0 && (
                <div>
                  <div className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FolderGit className="h-3.5 w-3.5 text-purple-500" />
                    <span>Projects ({searchResults.projects.length})</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.projects.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => {
                          setCurrentTab('projects');
                          setIsSearchOpen(false);
                        }}
                        className="group flex w-full items-center justify-between rounded-lg p-2 text-left text-xs hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 group-hover:text-purple-600">
                            {proj.projectName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {proj.clientName} · Due {proj.deadline} · {proj.status}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-purple-600">
                          <span className="font-semibold text-slate-700">
                            {formatCurrency(proj.projectValue)}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
