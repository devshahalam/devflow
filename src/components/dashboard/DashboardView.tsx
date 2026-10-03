import React from 'react';
import {
  Users,
  UserPlus,
  PhoneCall,
  Flame,
  Calendar,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Receipt,
  Clock,
  Briefcase,
  CheckCircle2,
  Hourglass,
  ArrowUpRight,
  ChevronRight,
  Plus,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { LeadStatus } from '../../types/crm';

export const DashboardView: React.FC = () => {
  const {
    leads,
    projects,
    payments,
    followUps,
    services,
    kpis,
    formatCurrency,
    setCurrentTab,
    setSelectedLeadId,
    setIsQuickAddOpen,
    getProjectFinancials,
  } = useCRM();

  // Funnel calculation
  const funnelStages: Array<{ status: LeadStatus; label: string }> = [
    { status: 'New Lead', label: 'New Lead' },
    { status: 'Contacted', label: 'Contacted' },
    { status: 'Replied', label: 'Replied' },
    { status: 'Interested', label: 'Interested' },
    { status: 'Proposal', label: 'Proposal' },
    { status: 'Negotiation', label: 'Negotiation' },
    { status: 'Won', label: 'Won Deal' },
  ];

  const funnelCounts = funnelStages.map((stage) => ({
    ...stage,
    count: leads.filter((l) => l.status === stage.status).length,
  }));

  const maxFunnelCount = Math.max(...funnelCounts.map((f) => f.count), 1);

  // Lead Sources Breakdown (Including Google Maps prominently)
  const sources = [
    'Google Maps',
    'Facebook',
    'Instagram',
    'WhatsApp',
    'Cold Email',
    'Referral',
    'Upwork',
    'LinkedIn',
    'Website',
    'Twitter',
  ];

  const sourceStats = sources.map((source) => {
    const matching = leads.filter((l) => l.leadSource === source);
    const wonCount = matching.filter((l) => l.status === 'Won').length;
    return {
      source,
      total: matching.length,
      won: wonCount,
    };
  }).filter((s) => s.total > 0).sort((a, b) => b.total - a.total);

  // Follow-up Breakdown
  const today = '2026-10-02';
  const pendingFollowups = followUps.filter((f) => !f.completed);
  const overdueFlps = pendingFollowups.filter((f) => f.dueDate < today);
  const todayFlps = pendingFollowups.filter((f) => f.dueDate === today);
  const upcomingFlps = pendingFollowups.filter((f) => f.dueDate > today);

  // Active Projects with Pending Invoices
  const activeProjects = projects.filter(
    (p) => p.status !== 'Completed' && p.status !== 'Cancelled'
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Welcome Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
              Freelance Studio Dashboard
            </span>
            <span className="rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.2 text-[10px] font-bold">
              USD + BDT Dual Currency
            </span>
          </div>
          <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">
            Client Acquisition & Project Milestones
          </h2>
          <p className="mt-1 text-xs text-slate-300 max-w-2xl">
            Track leads from Google Maps and social outreach to active project deliverables and multi-currency collections.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add New Lead</span>
          </button>
          <button
            onClick={() => setCurrentTab('followups')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <span>Follow-ups ({overdueFlps.length + todayFlps.length})</span>
          </button>
        </div>
      </div>

      {/* KPI GROUP 1: LEADS METRICS */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Lead Acquisition Funnel
            </h3>
          </div>
          <button
            onClick={() => setCurrentTab('leads')}
            className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>View All Leads</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
            <div className="text-[11px] font-medium text-slate-500">Total Leads</div>
            <div className="mt-1 text-xl font-bold text-slate-900">{kpis.totalLeads}</div>
            <div className="mt-1 text-[10px] text-slate-400">All prospects</div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
            <div className="text-[11px] font-medium text-slate-500">New Leads</div>
            <div className="mt-1 text-xl font-bold text-blue-600">{kpis.newLeads}</div>
            <div className="mt-1 text-[10px] text-blue-500">Awaiting contact</div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
            <div className="text-[11px] font-medium text-slate-500">Contacted</div>
            <div className="mt-1 text-xl font-bold text-slate-900">{kpis.contactedLeads}</div>
            <div className="mt-1 text-[10px] text-slate-400">Outreach sent</div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
            <div className="text-[11px] font-medium text-slate-500">Interested</div>
            <div className="mt-1 text-xl font-bold text-indigo-600">{kpis.interestedLeads}</div>
            <div className="mt-1 text-[10px] text-indigo-500">Warm discussions</div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
            <div className="text-[11px] font-medium text-slate-500">Follow-up Due</div>
            <div className="mt-1 text-xl font-bold text-amber-600">{kpis.followUpsDue}</div>
            <div className="mt-1 text-[10px] text-amber-700">Scheduled today</div>
          </div>
          <div
            className={`rounded-xl border p-3.5 shadow-2xs transition-colors ${
              kpis.overdueFollowUps > 0
                ? 'border-rose-200 bg-rose-50/50'
                : 'border-slate-200/80 bg-white'
            }`}
          >
            <div className="text-[11px] font-medium text-slate-500">Overdue</div>
            <div
              className={`mt-1 text-xl font-bold ${
                kpis.overdueFollowUps > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {kpis.overdueFollowUps}
            </div>
            <div className="mt-1 text-[10px] text-rose-600 font-medium">Needs outreach</div>
          </div>
        </div>
      </div>

      {/* KPI GROUP 2: DUAL CURRENCY FINANCIALS (USD & BDT) */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Multi-Currency Financial Health (USD & BDT)
            </h3>
          </div>
          <button
            onClick={() => setCurrentTab('payments')}
            className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>View Payments</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* USD Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">USD Financials ($)</span>
              <span className="rounded bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5">International</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Invoiced</span>
                <span className="text-base font-bold text-slate-900">{formatCurrency(kpis.totalSalesUSD, 'USD')}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Received</span>
                <span className="text-base font-bold text-emerald-600">{formatCurrency(kpis.amountReceivedUSD, 'USD')}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Pending</span>
                <span className="text-base font-bold text-amber-600">{formatCurrency(kpis.amountPendingUSD, 'USD')}</span>
              </div>
            </div>
          </div>

          {/* BDT Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">BDT Financials (৳)</span>
              <span className="rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5">Bangladesh</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Invoiced</span>
                <span className="text-base font-bold text-slate-900">{formatCurrency(kpis.totalSalesBDT, 'BDT')}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Received</span>
                <span className="text-base font-bold text-emerald-600">{formatCurrency(kpis.amountReceivedBDT, 'BDT')}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Pending</span>
                <span className="text-base font-bold text-amber-600">{formatCurrency(kpis.amountPendingBDT, 'BDT')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CORE HIGHLIGHT: ACTIVE PROJECTS & PENDING INVOICES OVERVIEW */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Active Projects & Pending Invoices
            </h3>
            <p className="text-xs text-slate-500">
              Real-time delivery progress and outstanding balances per project in USD & BDT.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('payments')}
            className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
          >
            <span>+ Record Payment</span>
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2.5 px-3">Project & Client</th>
                <th className="py-2.5 px-3">Service</th>
                <th className="py-2.5 px-3">Currency</th>
                <th className="py-2.5 px-3">Deadline</th>
                <th className="py-2.5 px-3 text-right">Project Value</th>
                <th className="py-2.5 px-3 text-right">Received</th>
                <th className="py-2.5 px-3 text-right">Pending</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeProjects.map((p) => {
                const fin = getProjectFinancials(p.id);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div>{p.projectName}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{p.clientName}</div>
                    </td>
                    <td className="py-3 px-3">{p.serviceName}</td>
                    <td className="py-3 px-3 font-bold text-slate-700">{p.currency}</td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-slate-800">{p.deadline}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900">
                      {formatCurrency(fin.value, p.currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-600">
                      {formatCurrency(fin.received, p.currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-amber-600">
                      {formatCurrency(fin.pending, p.currency)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${
                          fin.status === 'Fully Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : fin.status === 'Partially Paid'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {fin.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHARTS ROW 1: LEAD FUNNEL & SOURCES (Highlighting Google Maps) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Visual Lead Funnel */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pipeline Funnel Progression</h3>
              <p className="text-xs text-slate-500">Conversion stages across active deals</p>
            </div>
            <span className="text-xs font-semibold text-slate-600">
              {leads.filter((l) => l.status === 'Won').length} Won Deals
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {funnelCounts.map((stage, idx) => {
              const percentage = Math.round((stage.count / maxFunnelCount) * 100);
              const isWon = stage.status === 'Won';
              return (
                <div key={stage.status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className={isWon ? 'font-bold text-emerald-700' : 'text-slate-700'}>
                      {idx + 1}. {stage.label}
                    </span>
                    <span className="font-bold text-slate-900">{stage.count} leads</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWon
                          ? 'bg-emerald-500'
                          : stage.status === 'Proposal' || stage.status === 'Negotiation'
                          ? 'bg-blue-600'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${Math.max(percentage, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Sources Distribution */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Acquisition Channels (Google Maps & Socials)</h3>
              <p className="text-xs text-slate-500">Lead distribution by outreach method</p>
            </div>
          </div>

          <div className="mt-5 space-y-3.5">
            {sourceStats.map((src) => {
              const maxLeads = Math.max(...sourceStats.map((s) => s.total), 1);
              const barWidth = Math.round((src.total / maxLeads) * 100);
              const isGoogleMaps = src.source === 'Google Maps';

              return (
                <div key={src.source} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isGoogleMaps ? 'text-blue-600 flex items-center gap-1 font-bold' : 'text-slate-800'}`}>
                        {isGoogleMaps && <MapPin className="h-3.5 w-3.5 text-blue-600" />}
                        {src.source}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({src.won} won)
                      </span>
                    </div>
                    <span className="font-bold text-slate-800">{src.total} leads</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isGoogleMaps ? 'bg-blue-600' : 'bg-indigo-500'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
