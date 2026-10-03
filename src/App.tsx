/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { LoginView } from './components/auth/LoginView';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { QuickAddLeadModal } from './components/leads/QuickAddLeadModal';
import { LeadDetailModal } from './components/leads/LeadDetailModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { LeadsView } from './components/leads/LeadsView';
import { FollowupsView } from './components/followups/FollowupsView';
import { CommunicationsView } from './components/communications/CommunicationsView';
import { ProposalsView } from './components/proposals/ProposalsView';
import { ProjectsView } from './components/projects/ProjectsView';
import { PaymentsView } from './components/payments/PaymentsView';
import { ClientsView } from './components/clients/ClientsView';
import { ServicesView } from './components/services/ServicesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

const MainAppContent: React.FC = () => {
  const { currentTab, currentUser, actionNotice, setActionNotice } = useCRM();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // STRICT LOGIN GATE: If not logged in, render LoginView!
  if (!currentUser) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'leads':
        return <LeadsView />;
      case 'followups':
        return <FollowupsView />;
      case 'communications':
        return <CommunicationsView />;
      case 'proposals':
        return <ProposalsView />;
      case 'projects':
        return <ProjectsView />;
      case 'payments':
        return <PaymentsView />;
      case 'clients':
        return <ClientsView />;
      case 'services':
        return <ServicesView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 overflow-y-auto bg-slate-50/60 pb-12">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <QuickAddLeadModal />
      <LeadDetailModal />
      <GlobalSearchModal />

      {/* System Action Notice Modal */}
      {actionNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">System Notice</h3>
            <p className="text-xs text-slate-700 leading-relaxed">{actionNotice}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setActionNotice(null)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <CRMProvider>
      <MainAppContent />
    </CRMProvider>
  );
}
