import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  Calendar,
  Filter,
  PieChart,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const ReportsView: React.FC = () => {
  const {
    leads,
    projects,
    payments,
    followUps,
    services,
    formatCurrency,
    kpis,
    profile,
  } = useCRM();

  const [timeRange, setTimeRange] = useState<'All' | 'ThisMonth' | 'Last30Days'>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [serviceFilter, setServiceFilter] = useState<string>('All');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('All');

  // Filtered Leads according to report filters
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSource = sourceFilter === 'All' || l.leadSource === sourceFilter;
      const matchService = serviceFilter === 'All' || l.serviceName === serviceFilter;
      return matchSource && matchService;
    });
  }, [leads, sourceFilter, serviceFilter]);

  const totalWon = filteredLeads.filter((l) => l.status === 'Won').length;
  const totalLost = filteredLeads.filter((l) => l.status === 'Lost').length;
  const totalActivePipeline = filteredLeads.length - totalWon - totalLost;
  const winRate =
    totalWon + totalLost > 0 ? Math.round((totalWon / (totalWon + totalLost)) * 100) : 100;

  // Dynamic Monthly Sales & Income Trends based on actual projects and payments
  const monthlyData = useMemo(() => {
    const monthMap: Record<string, { label: string; salesUSD: number; receivedUSD: number; salesBDT: number; receivedBDT: number; leadsCount: number }> = {};

    const getMonthKey = (dateStr: string) => {
      if (!dateStr) return '2026-10';
      return dateStr.slice(0, 7);
    };

    const formatMonthLabel = (yearMonth: string) => {
      try {
        const [y, m] = yearMonth.split('-');
        const date = new Date(Number(y), Number(m) - 1, 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } catch {
        return yearMonth;
      }
    };

    projects.forEach((p) => {
      const mKey = getMonthKey(p.createdAt || p.startDate);
      if (!monthMap[mKey]) {
        monthMap[mKey] = { label: formatMonthLabel(mKey), salesUSD: 0, receivedUSD: 0, salesBDT: 0, receivedBDT: 0, leadsCount: 0 };
      }
      if (p.currency === 'BDT') {
        monthMap[mKey].salesBDT += p.projectValue;
      } else {
        monthMap[mKey].salesUSD += p.projectValue;
      }
    });

    payments.forEach((pay) => {
      const mKey = getMonthKey(pay.paymentDate || pay.createdAt);
      if (!monthMap[mKey]) {
        monthMap[mKey] = { label: formatMonthLabel(mKey), salesUSD: 0, receivedUSD: 0, salesBDT: 0, receivedBDT: 0, leadsCount: 0 };
      }
      if (pay.currency === 'BDT') {
        monthMap[mKey].receivedBDT += pay.amount;
      } else {
        monthMap[mKey].receivedUSD += pay.amount;
      }
    });

    leads.forEach((l) => {
      const mKey = getMonthKey(l.createdAt);
      if (monthMap[mKey]) {
        monthMap[mKey].leadsCount += 1;
      } else {
        monthMap[mKey] = { label: formatMonthLabel(mKey), salesUSD: 0, receivedUSD: 0, salesBDT: 0, receivedBDT: 0, leadsCount: 1 };
      }
    });

    const sortedKeys = Object.keys(monthMap).sort();
    if (sortedKeys.length === 0) {
      return [{ label: 'Current Month', salesUSD: 0, receivedUSD: 0, salesBDT: 0, receivedBDT: 0, leadsCount: 0 }];
    }

    return sortedKeys.map((k) => monthMap[k]);
  }, [projects, payments, leads]);

  const availableMonths = useMemo(() => {
    return monthlyData.map((m) => m.label);
  }, [monthlyData]);

  const filteredMonthlyData = useMemo(() => {
    if (selectedMonthFilter === 'All') return monthlyData;
    return monthlyData.filter((m) => m.label === selectedMonthFilter);
  }, [monthlyData, selectedMonthFilter]);

  // Revenue by Service breakdown
  const serviceRevenue = services.map((s) => {
    const projRev = projects
      .filter((p) => p.serviceId === s.id || p.serviceName === s.name)
      .reduce((sum, p) => sum + p.projectValue, 0);
    const count = leads.filter(
      (l) => l.serviceId === s.id || l.serviceName === s.name
    ).length;
    return { name: s.name, revenue: projRev, count };
  }).filter((s) => s.revenue > 0).sort((a, b) => b.revenue - a.revenue);

  // Revenue by Source breakdown
  const sources = [
    'WhatsApp',
    'Cold Email',
    'Facebook',
    'Referral',
    'Upwork',
    'LinkedIn',
    'Website',
    'Cold Call',
  ];
  const sourceRevenue = sources.map((src) => {
    const leadsInSource = leads.filter((l) => l.leadSource === src && l.status === 'Won');
    const rev = leadsInSource.reduce((sum, l) => sum + (l.dealValue || 0), 0);
    return { source: src, revenue: rev, count: leads.filter((l) => l.leadSource === src).length };
  }).filter((s) => s.count > 0).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Sales & Performance Reports
          </h2>
          <p className="text-xs text-slate-500">
            Analytics to evaluate client conversion rates, top channels, and revenue health.
          </p>
        </div>

        {/* Global report filter toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="All">All Lead Sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
          >
            <option value="All">All Services</option>
            {services.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Highlights Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Won vs Lost Win Rate</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{winRate}%</div>
          <div className="mt-1 text-[11px] text-slate-500">
            {totalWon} Won · {totalLost} Lost · {totalActivePipeline} In Progress
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Total Billed Revenue (USD)</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(kpis.totalSalesUSD, 'USD')}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            {formatCurrency(kpis.amountReceivedUSD, 'USD')} collected
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Pending Receivables (USD)</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {formatCurrency(kpis.amountPendingUSD, 'USD')}
          </div>
          <div className="mt-1 text-[11px] text-amber-700">Awaiting milestone sign-off</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Total Billed (BDT)</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(kpis.totalSalesBDT, 'BDT')}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Pending: {formatCurrency(kpis.amountPendingBDT, 'BDT')}
          </div>
        </div>
      </div>

      {/* Visual Chart 1: Monthly Growth Trends (Row-wise with Month Dropdown Filter) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly Sales & Income Trends</h3>
            <p className="text-xs text-slate-500">
              Contract value booked vs cash collections received per month (Row-wise view)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter Month:</span>
            <select
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 font-semibold"
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(e.target.value)}
            >
              <option value="All">All Months (Default)</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {filteredMonthlyData.map((m) => {
            const usdPending = Math.max(0, m.salesUSD - m.receivedUSD);
            const bdtPending = Math.max(0, m.salesBDT - m.receivedBDT);

            return (
              <div
                key={m.label}
                className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                {/* Month & Leads Info */}
                <div className="flex items-center gap-3 min-w-[160px]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold text-xs">
                    📅
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{m.label}</div>
                    <div className="text-xs text-slate-500 font-medium">{m.leadsCount} new leads</div>
                  </div>
                </div>

                {/* USD Financials Row Item */}
                <div className="flex-1 rounded-lg bg-slate-50 p-3 border border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">USD Invoiced</span>
                    <strong className="text-xs font-bold text-slate-900">{formatCurrency(m.salesUSD, 'USD')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">USD Received</span>
                    <strong className="text-xs font-bold text-emerald-600">{formatCurrency(m.receivedUSD, 'USD')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">USD Pending</span>
                    <strong className="text-xs font-bold text-amber-600">{formatCurrency(usdPending, 'USD')}</strong>
                  </div>
                </div>

                {/* BDT Financials Row Item */}
                <div className="flex-1 rounded-lg bg-slate-50 p-3 border border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">BDT Invoiced</span>
                    <strong className="text-xs font-bold text-slate-900">{formatCurrency(m.salesBDT, 'BDT')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">BDT Received</span>
                    <strong className="text-xs font-bold text-emerald-600">{formatCurrency(m.receivedBDT, 'BDT')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">BDT Pending</span>
                    <strong className="text-xs font-bold text-amber-600">{formatCurrency(bdtPending, 'BDT')}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 2: Revenue By Service & By Channel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue by Service */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Revenue Generated by Service</h3>
            <p className="text-xs text-slate-500">High-performing offerings by billable total</p>
          </div>

          <div className="space-y-3">
            {serviceRevenue.map((item) => {
              const maxRev = Math.max(...serviceRevenue.map((s) => s.revenue), 1);
              const barWidth = Math.round((item.revenue / maxRev) * 100);
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">{item.count} leads</span>
                      <strong className="text-slate-900">{formatCurrency(item.revenue)}</strong>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by Lead Source */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Revenue by Outreach Source</h3>
            <p className="text-xs text-slate-500">Where highest-value clients originate from</p>
          </div>

          <div className="space-y-3">
            {sourceRevenue.map((item) => {
              const maxRev = Math.max(...sourceRevenue.map((s) => s.revenue), 1);
              const barWidth = Math.round((item.revenue / maxRev) * 100);
              return (
                <div key={item.source} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.source}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">{item.count} leads</span>
                      <strong className="text-emerald-700">
                        {formatCurrency(item.revenue)}
                      </strong>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
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
