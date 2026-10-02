import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building,
  Download,
  X,
  ChevronRight,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Currency, Payment, PaymentMethod } from '../../types/crm';

export const PaymentsView: React.FC = () => {
  const {
    payments,
    projects,
    clients,
    addPayment,
    deletePayment,
    formatCurrency,
    getClientFinancials,
    getProjectFinancials,
    kpis,
    currentUser,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [currencyFilter, setCurrencyFilter] = useState<string>('All');

  // ONLY clients who have at least one project with pending due (due > 0).
  // When all projects of a client are cleared/paid, that client's profile is NOT shown in Add Payment!
  const clientsWithPending = useMemo(() => {
    return clients.filter((c) => {
      const clientProjects = projects.filter((p) => p.clientId === c.id);
      return clientProjects.some((p) => {
        const fin = getProjectFinancials(p.id);
        return fin.pending > 0;
      });
    });
  }, [clients, projects, getProjectFinancials]);

  // Record Payment Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [amount, setAmount] = useState<number>(500);
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Pending projects under the chosen client
  const clientPendingProjects = useMemo(() => {
    if (!selectedClientId) return [];
    return projects.filter(
      (p) => p.clientId === selectedClientId && getProjectFinancials(p.id).pending > 0
    );
  }, [projects, selectedClientId, getProjectFinancials]);

  const activeModalProject = projects.find((p) => p.id === selectedProjectId);
  const activeModalFin = activeModalProject ? getProjectFinancials(activeModalProject.id) : null;

  const handleOpenRecordPayment = (defaultProjId?: string) => {
    let targetClientId = '';
    let targetProjId = '';

    if (defaultProjId) {
      const targetProj = projects.find((p) => p.id === defaultProjId);
      if (targetProj && getProjectFinancials(targetProj.id).pending > 0) {
        targetClientId = targetProj.clientId;
        targetProjId = targetProj.id;
      }
    }

    if (!targetClientId && clientsWithPending.length > 0) {
      targetClientId = clientsWithPending[0].id;
      const firstClientProjects = projects.filter(
        (p) => p.clientId === targetClientId && getProjectFinancials(p.id).pending > 0
      );
      if (firstClientProjects.length > 0) {
        targetProjId = firstClientProjects[0].id;
      }
    }

    setSelectedClientId(targetClientId);
    setSelectedProjectId(targetProjId);

    if (targetProjId) {
      const p = projects.find((proj) => proj.id === targetProjId);
      if (p) {
        const fin = getProjectFinancials(p.id);
        setAmount(fin.pending > 0 ? fin.pending : 500);
        setPaymentMethod(p.currency === 'BDT' ? 'bKash / Nagad' : 'Bank Transfer');
      }
    }

    setInvoiceNumber(`INV-2026-${String(payments.length + 1).padStart(3, '0')}`);
    setIsAddOpen(true);
  };

  const handleClientSelectChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const availableProjects = projects.filter(
      (p) => p.clientId === clientId && getProjectFinancials(p.id).pending > 0
    );
    if (availableProjects.length > 0) {
      const firstProj = availableProjects[0];
      setSelectedProjectId(firstProj.id);
      const fin = getProjectFinancials(firstProj.id);
      setAmount(fin.pending > 0 ? fin.pending : 500);
      setPaymentMethod(firstProj.currency === 'BDT' ? 'bKash / Nagad' : 'Bank Transfer');
    } else {
      setSelectedProjectId('');
    }
  };

  const handleProjectSelectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    const targetProj = projects.find((p) => p.id === projectId);
    if (targetProj) {
      const fin = getProjectFinancials(targetProj.id);
      setAmount(fin.pending > 0 ? fin.pending : 500);
      setPaymentMethod(targetProj.currency === 'BDT' ? 'bKash / Nagad' : 'Bank Transfer');
    }
  };

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !amount || amount <= 0) return;

    const project = projects.find((p) => p.id === selectedProjectId);
    if (!project) return;

    addPayment({
      projectId: project.id,
      clientId: project.clientId,
      clientName: project.clientName,
      projectName: project.projectName,
      amount: Number(amount),
      currency: project.currency,
      paymentDate,
      paymentMethod,
      invoiceNumber: invoiceNumber.trim() || `INV-${Date.now()}`,
      notes: notes.trim(),
    });

    setIsAddOpen(false);
    setNotes('');
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((pay) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        pay.clientName.toLowerCase().includes(q) ||
        pay.projectName.toLowerCase().includes(q) ||
        pay.invoiceNumber.toLowerCase().includes(q) ||
        pay.paymentMethod.toLowerCase().includes(q);

      const matchesMethod = methodFilter === 'All' || pay.paymentMethod === methodFilter;
      const matchesCurrency = currencyFilter === 'All' || pay.currency === currencyFilter;
      return matchesQuery && matchesMethod && matchesCurrency;
    }).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [payments, searchQuery, methodFilter, currencyFilter]);

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Payments & Invoicing
          </h2>
          <p className="text-xs text-slate-500">
            Record project-specific installment receipts in USD and BDT with automatic balance clearance.
          </p>
        </div>
        <button
          onClick={() => handleOpenRecordPayment()}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>+ Record Payment</span>
        </button>
      </div>

      {/* KPI Financial Cards (USD & BDT Dual Display) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Total Invoiced (USD)</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(kpis.totalSalesUSD, 'USD')}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            Rec: {formatCurrency(kpis.amountReceivedUSD, 'USD')}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Pending Receivables (USD)</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {formatCurrency(kpis.amountPendingUSD, 'USD')}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">International projects</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Total Invoiced (BDT)</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(kpis.totalSalesBDT, 'BDT')}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            Rec: {formatCurrency(kpis.amountReceivedBDT, 'BDT')}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Pending Receivables (BDT)</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {formatCurrency(kpis.amountPendingBDT, 'BDT')}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Bangladesh clients</div>
        </div>
      </div>

      {/* Project Balances Overview Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Individual Project Payment Accounts
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Each project tracks its unique installments and remaining balance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => {
            const fin = getProjectFinancials(proj.id);
            const isFullyPaid = fin.status === 'Fully Paid';
            return (
              <div
                key={proj.id}
                className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900 truncate max-w-[200px]">
                      {proj.projectName}
                    </h4>
                    <div className="text-[11px] text-slate-500">{proj.clientName}</div>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      isFullyPaid
                        ? 'bg-emerald-100 text-emerald-800'
                        : fin.status === 'Partially Paid'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {fin.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total:</span>
                    <strong className="text-slate-800">{formatCurrency(fin.value, proj.currency)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Received:</span>
                    <strong className="text-emerald-600">{formatCurrency(fin.received, proj.currency)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Pending:</span>
                    <strong className={fin.pending > 0 ? 'text-amber-600' : 'text-slate-400'}>
                      {formatCurrency(fin.pending, proj.currency)}
                    </strong>
                  </div>
                </div>

                {fin.pending > 0 && (
                  <button
                    onClick={() => handleOpenRecordPayment(proj.id)}
                    className="w-full text-center rounded-lg bg-emerald-50 border border-emerald-200 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    + Record Installment ({formatCurrency(fin.pending, proj.currency)})
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900">Payment Transactions Ledger</h3>

          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 font-semibold"
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
            >
              <option value="All">All Currencies</option>
              <option value="USD">USD ($)</option>
              <option value="BDT">BDT (৳)</option>
            </select>

            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice #, client..."
                className="rounded-lg border border-slate-200 pl-8 pr-3 py-1 text-xs text-slate-900 focus:outline-hidden"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Client & Project</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount Received</th>
                <th className="py-3 px-4">Notes</th>
                {currentUser?.role === 'Owner' && (
                  <th className="py-3 px-4 text-center w-16">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {pay.invoiceNumber}
                  </td>
                  <td className="py-3 px-4">{pay.paymentDate}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{pay.clientName}</div>
                    <div className="text-[11px] text-slate-500">{pay.projectName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {pay.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600 text-sm">
                    +{formatCurrency(pay.amount, pay.currency)}
                  </td>
                  <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                    {pay.notes || '-'}
                  </td>
                  {currentUser?.role === 'Owner' && (
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Delete payment receipt ${pay.invoiceNumber} (${formatCurrency(
                                pay.amount,
                                pay.currency
                              )})? This will return the balance to pending.`
                            )
                          ) {
                            deletePayment(pay.id);
                          }
                        }}
                        className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Payment (Owner only)"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Record Client Payment</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-4">
              {clientsWithPending.length === 0 ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block font-bold">All Payments Cleared!</strong>
                    <span>
                      Every client project has been fully paid. No clients currently have outstanding dues to collect.
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Select Client with Due Balance <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Only clients with remaining unpaid balance are listed here. Cleared clients are excluded.
                    </p>
                    <select
                      required
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                      value={selectedClientId}
                      onChange={(e) => handleClientSelectChange(e.target.value)}
                    >
                      {clientsWithPending.map((c) => {
                        const clientProjs = projects.filter((p) => p.clientId === c.id);
                        const totalPending = clientProjs.reduce(
                          (sum, p) => sum + getProjectFinancials(p.id).pending,
                          0
                        );
                        return (
                          <option key={c.id} value={c.id}>
                            {c.businessName} ({c.contactPerson}) — Total Due: {formatCurrency(totalPending, c.currency)}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Select Project with Outstanding Due <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                      value={selectedProjectId}
                      onChange={(e) => handleProjectSelectChange(e.target.value)}
                    >
                      {clientPendingProjects.map((p) => {
                        const fin = getProjectFinancials(p.id);
                        return (
                          <option key={p.id} value={p.id}>
                            {p.projectName} (Due: {formatCurrency(fin.pending, p.currency)})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </>
              )}

              {activeModalFin && activeModalProject && (
                <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs flex justify-between">
                  <div>
                    <span className="text-blue-700 block text-[11px]">Total Project Value:</span>
                    <strong className="text-blue-950 font-bold">
                      {formatCurrency(activeModalFin.value, activeModalProject.currency)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-emerald-700 block text-[11px]">Already Received:</span>
                    <strong className="text-emerald-900 font-bold">
                      {formatCurrency(activeModalFin.received, activeModalProject.currency)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-amber-800 block text-[11px]">Remaining Pending:</span>
                    <strong className="text-amber-900 font-bold">
                      {formatCurrency(activeModalFin.pending, activeModalProject.currency)}
                    </strong>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Payment Amount ({activeModalProject?.currency === 'BDT' ? '৳' : '$'}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 font-bold"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
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
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Payment Method
                  </label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  >
                    <option value="bKash / Nagad">bKash / Nagad</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Stripe">Stripe</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Wise">Wise</option>
                    <option value="Payoneer">Payoneer</option>
                    <option value="Cash">Cash</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Payment Notes / Receipt Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. 50% milestone deposit received"
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
                  disabled={clientsWithPending.length === 0 || !selectedProjectId}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Payment Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
