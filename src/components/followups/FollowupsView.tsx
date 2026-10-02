import React, { useState } from 'react';
import {
  CalendarClock,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  Plus,
  MessageCircle,
  Mail,
  Phone,
  RotateCw,
  Check,
  ChevronRight,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { FollowUp } from '../../types/crm';

export const FollowupsView: React.FC = () => {
  const {
    followUps,
    completeFollowUp,
    rescheduleFollowUp,
    deleteFollowUp,
    currentUser,
    leads,
    setSelectedLeadId,
    setCurrentTab,
    profile,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'overdue' | 'today' | 'upcoming' | 'completed'>(
    'today'
  );

  const todayStr = '2026-10-02';

  // Modal for completing follow-up and optionally scheduling next
  const [completingFlp, setCompletingFlp] = useState<FollowUp | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [scheduleNext, setScheduleNext] = useState(true);
  const [nextDays, setNextDays] = useState(3);
  const [nextNotes, setNextNotes] = useState('');

  // Reschedule quick picker
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [customRescheduleDate, setCustomRescheduleDate] = useState('');

  // Segregate follow-ups
  const pending = followUps.filter((f) => !f.completed);
  const overdueList = pending.filter((f) => f.dueDate < todayStr);
  const todayList = pending.filter((f) => f.dueDate === todayStr);
  const upcomingList = pending.filter((f) => f.dueDate > todayStr);
  const completedList = followUps.filter((f) => f.completed);

  const getActiveList = () => {
    switch (activeTab) {
      case 'overdue':
        return overdueList;
      case 'today':
        return todayList;
      case 'upcoming':
        return upcomingList;
      case 'completed':
        return completedList;
      default:
        return todayList;
    }
  };

  const currentList = getActiveList();

  const handleFinishCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingFlp) return;

    completeFollowUp(
      completingFlp.id,
      outcomeNotes,
      scheduleNext ? nextDays : 0,
      nextNotes || undefined
    );

    setCompletingFlp(null);
    setOutcomeNotes('');
    setNextNotes('');
  };

  const handleQuickReschedule = (id: string, daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const dateStr = d.toISOString().split('T')[0];
    rescheduleFollowUp(id, dateStr, `Postponed +${daysAhead} days`);
    setReschedulingId(null);
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Follow-up Management
          </h2>
          <p className="text-xs text-slate-500">
            Consistent follow-ups convert up to 80% more freelance clients.
          </p>
        </div>
      </div>

      {/* Segmented Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('overdue')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'overdue'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>🔴 Overdue</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              activeTab === 'overdue' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {overdueList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('today')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'today'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>🟠 Today</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              activeTab === 'today' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {todayList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>🟡 Upcoming (Next 7d)</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              activeTab === 'upcoming' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'
            }`}
          >
            {upcomingList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span>✅ Completed History</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              activeTab === 'completed' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {completedList.length}
          </span>
        </button>
      </div>

      {/* Follow-up Cards List */}
      <div className="space-y-3">
        {currentList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-2xs">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
            <h3 className="mt-2 text-sm font-bold text-slate-900">
              No follow-ups in this section!
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {activeTab === 'overdue'
                ? 'Great job! You have zero overdue follow-ups.'
                : activeTab === 'today'
                ? 'No follow-up calls or messages scheduled for today.'
                : 'All scheduled follow-ups are clear.'}
            </p>
          </div>
        ) : (
          currentList.map((flp) => {
            const lead = leads.find((l) => l.id === flp.leadId);
            const isOverdue = flp.dueDate < todayStr && !flp.completed;
            const isToday = flp.dueDate === todayStr && !flp.completed;

            // WhatsApp link
            const phone = lead ? lead.whatsapp.replace(/[^0-9]/g, '') : '';
            const waUrl = phone ? `https://wa.me/${phone}` : '#';

            return (
              <div
                key={flp.id}
                className={`rounded-xl border p-4 sm:p-5 transition-all shadow-2xs ${
                  flp.completed
                    ? 'border-slate-200 bg-slate-50/60 opacity-80'
                    : isOverdue
                    ? 'border-rose-200 bg-rose-50/20 hover:border-rose-300'
                    : isToday
                    ? 'border-amber-200 bg-amber-50/20 hover:border-amber-300'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Column Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-slate-900">
                        {flp.businessName}
                      </span>
                      <span className="text-xs text-slate-500">· {flp.contactPerson}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-800'
                            : isToday
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {flp.contactMethod}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                        {flp.leadStatus}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                        {flp.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {flp.notes}
                    </p>

                    {flp.outcomeNotes && (
                      <p className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                        <strong className="block text-[11px] font-bold">Outcome:</strong>
                        {flp.outcomeNotes}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>Due Date: <strong className="text-slate-700">{flp.dueDate}</strong></span>
                      {flp.completedAt && (
                        <span>
                          Completed: {new Date(flp.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0">
                    {!flp.completed && (
                      <>
                        <button
                          onClick={() => setCompletingFlp(flp)}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Mark Done & Next</span>
                        </button>

                        <div className="relative">
                          <button
                            onClick={() =>
                              setReschedulingId(reschedulingId === flp.id ? null : flp.id)
                            }
                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <RotateCw className="h-3.5 w-3.5 text-slate-400" />
                            <span>Reschedule</span>
                          </button>

                          {reschedulingId === flp.id && (
                            <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-xl space-y-1">
                              <button
                                onClick={() => handleQuickReschedule(flp.id, 1)}
                                className="w-full text-left rounded px-2 py-1 text-xs hover:bg-slate-100 text-slate-700"
                              >
                                Tomorrow
                              </button>
                              <button
                                onClick={() => handleQuickReschedule(flp.id, 3)}
                                className="w-full text-left rounded px-2 py-1 text-xs hover:bg-slate-100 text-slate-700"
                              >
                                In 3 Days
                              </button>
                              <button
                                onClick={() => handleQuickReschedule(flp.id, 7)}
                                className="w-full text-left rounded px-2 py-1 text-xs hover:bg-slate-100 text-slate-700"
                              >
                                In 1 Week
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-2">
                      {/* Quick Link to Lead */}
                      {flp.leadId && (
                        <button
                          onClick={() => {
                            setSelectedLeadId(flp.leadId);
                            setCurrentTab('leads');
                          }}
                          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                        >
                          <span>Open Lead</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}

                      {currentUser?.role === 'Owner' && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete follow-up task for "${flp.businessName}"?`)) {
                              deleteFollowUp(flp.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Follow-up (Owner only)"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Completion & Next Schedule Modal */}
      {completingFlp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setCompletingFlp(null)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Complete Follow-up: {completingFlp.businessName}
            </h3>

            <form onSubmit={handleFinishCompletion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Follow-up Outcome Notes
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Spoke on WhatsApp, client is reviewing proposal with team"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={scheduleNext}
                    onChange={(e) => setScheduleNext(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Automatically schedule next follow-up</span>
                </label>

                {scheduleNext && (
                  <div className="space-y-2 pt-1 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-600">Follow-up in:</span>
                      <select
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-800"
                        value={nextDays}
                        onChange={(e) => setNextDays(Number(e.target.value))}
                      >
                        <option value={1}>1 Day (Tomorrow)</option>
                        <option value={2}>2 Days</option>
                        <option value={3}>3 Days</option>
                        <option value={5}>5 Days</option>
                        <option value={7}>1 Week</option>
                        <option value={14}>2 Weeks</option>
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Next follow-up objective..."
                        className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        value={nextNotes}
                        onChange={(e) => setNextNotes(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCompletingFlp(null)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                >
                  Mark Completed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
