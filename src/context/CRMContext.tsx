import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  initialClients,
  initialCommunications,
  initialFollowUps,
  initialLeads,
  initialPayments,
  initialProfile,
  initialProjects,
  initialProposals,
  initialServices,
  initialUsers,
} from '../data/initialData';
import {
  AppUser,
  Client,
  Communication,
  Currency,
  FollowUp,
  FreelancerProfile,
  Lead,
  LeadStatus,
  Payment,
  PaymentStatus,
  Project,
  Proposal,
  Service,
  TimelineEvent,
  UserRole,
} from '../types/crm';

interface CRMContextType {
  // Auth state & actions
  currentUser: AppUser | null;
  users: AppUser[];
  assignableUsers: AppUser[];
  subordinateUsers: AppUser[];
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  addUser: (userData: Omit<AppUser, 'id' | 'createdAt'>) => AppUser;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  deleteUser: (id: string) => boolean;

  leads: Lead[];
  allLeads: Lead[];
  clients: Client[];
  projects: Project[];
  payments: Payment[];
  proposals: Proposal[];
  communications: Communication[];
  followUps: FollowUp[];
  services: Service[];
  profile: FreelancerProfile;

  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedLeadId: string | null;
  setSelectedLeadId: (id: string | null) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Lead actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'paymentStatus'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => boolean;
  convertLeadToClient: (
    leadId: string,
    initialProject?: { projectName?: string; projectValue?: number; deadline?: string }
  ) => { client: Client; project?: Project };

  // Client actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => boolean;

  // Project actions
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => boolean;

  // Payment actions
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Payment;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => boolean;

  // Proposal actions
  addProposal: (proposal: Omit<Proposal, 'id' | 'createdAt'>) => Proposal;
  updateProposal: (id: string, updates: Partial<Proposal>) => void;
  deleteProposal: (id: string) => boolean;

  // Communication actions
  addCommunication: (comm: Omit<Communication, 'id' | 'createdAt'>) => Communication;
  updateCommunication: (id: string, updates: Partial<Communication>) => void;
  deleteCommunication: (id: string) => boolean;

  // Follow-up actions
  addFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt' | 'completed' | 'completedAt'>) => FollowUp;
  completeFollowUp: (
    id: string,
    outcomeNotes?: string,
    scheduleNextDays?: number,
    nextNotes?: string
  ) => void;
  rescheduleFollowUp: (id: string, newDate: string, notes?: string) => void;
  deleteFollowUp: (id: string) => boolean;

  // Service actions
  addService: (service: Omit<Service, 'id'>) => Service;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => boolean;

  // Profile actions
  updateProfile: (updates: Partial<FreelancerProfile>) => void;

  // Data management
  clearAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;

  // Computed & helpers
  kpis: {
    totalLeads: number;
    newLeads: number;
    contactedLeads: number;
    interestedLeads: number;
    followUpsDue: number;
    overdueFollowUps: number;
    totalSalesUSD: number;
    totalSalesBDT: number;
    amountReceivedUSD: number;
    amountReceivedBDT: number;
    amountPendingUSD: number;
    amountPendingBDT: number;
    activeProjects: number;
    completedProjects: number;
    waitingForClientProjects: number;
    upcomingDeadlines: number;
  };
  getProjectFinancials: (projectId: string) => {
    value: number;
    received: number;
    pending: number;
    currency: Currency;
    status: PaymentStatus;
  };
  getClientFinancials: (clientId: string) => {
    totalSalesUSD: number;
    totalSalesBDT: number;
    totalReceivedUSD: number;
    totalReceivedBDT: number;
    totalPendingUSD: number;
    totalPendingBDT: number;
    activeProjects: number;
    projects: Project[];
  };
  getLeadTimeline: (leadId: string) => TimelineEvent[];
  notifications: Array<{
    id: string;
    type: 'urgent' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    date: string;
    actionTab?: string;
    actionId?: string;
  }>;
  formatCurrency: (amount: number, curr?: Currency) => string;
}

const CRMContext = createContext<CRMContextType | null>(null);

const STORAGE_KEYS = {
  auth: 'devflow_auth_user_v2',
  users: 'devflow_crm_users_v2',
  leads: 'devflow_crm_leads_v3',
  clients: 'devflow_crm_clients_v3',
  projects: 'devflow_crm_projects_v3',
  payments: 'devflow_crm_payments_v3',
  proposals: 'devflow_crm_proposals_v3',
  communications: 'devflow_crm_communications_v3',
  followUps: 'devflow_crm_followups_v3',
  services: 'devflow_crm_services_v3',
  profile: 'devflow_crm_profile_v3',
};

const TODAY_DATE = '2026-10-02';

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & UI state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.auth);
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.users);
    return saved ? JSON.parse(saved) : initialUsers;
  });

  // Entities state with LocalStorage hydration
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.leads);
    return saved ? JSON.parse(saved) : initialLeads;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.clients);
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.projects);
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.payments);
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.proposals);
    return saved ? JSON.parse(saved) : initialProposals;
  });

  const [communications, setCommunications] = useState<Communication[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.communications);
    return saved ? JSON.parse(saved) : initialCommunications;
  });

  const [followUps, setFollowUps] = useState<FollowUp[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.followUps);
    return saved ? JSON.parse(saved) : initialFollowUps;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.services);
    return saved ? JSON.parse(saved) : initialServices;
  });

  const [profile, setProfile] = useState<FreelancerProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.profile);
    return saved ? JSON.parse(saved) : initialProfile;
  });

  // Persist to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.auth);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify(leads));
  }, [leads]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));
  }, [clients]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
  }, [projects]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments));
  }, [payments]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.proposals, JSON.stringify(proposals));
  }, [proposals]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.communications, JSON.stringify(communications));
  }, [communications]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.followUps, JSON.stringify(followUps));
  }, [followUps]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(services));
  }, [services]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  }, [profile]);

  // Auth Functions
  const login = (email: string, pass: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === pass.trim()
    );
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (userData: Omit<AppUser, 'id' | 'createdAt'>) => {
    const newId = `USR-${String(users.length + 1).padStart(2, '0')}`;
    const newUser: AppUser = {
      ...userData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<AppUser>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteUser = (id: string): boolean => {
    const isOwnerUser =
      currentUser?.role === 'Owner' ||
      currentUser?.email?.toLowerCase() === 'dev.mdshahalam@gmail.com';

    if (!isOwnerUser) {
      return false;
    }
    // Prevent owner from deleting own current session
    if (id === currentUser?.id) {
      return false;
    }

    // Protect primary owner account from deletion
    const targetUser = users.find((u) => u.id === id);
    if (targetUser?.email?.toLowerCase() === 'dev.mdshahalam@gmail.com') {
      return false;
    }

    const ownerUser = users.find((u) => u.role === 'Owner') || currentUser;
    const fallbackOwnerId = ownerUser?.id || currentUser?.id || 'USR-01';

    // 1. Remove user from users list and clear teamLeaderId if a leader was deleted
    const updatedUsers = users
      .filter((u) => u.id !== id)
      .map((u) => (u.teamLeaderId === id ? { ...u, teamLeaderId: undefined } : u));
    setUsers(updatedUsers);
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(updatedUsers));

    // 2. Reassign any orphaned leads to the Owner
    const updatedLeads = leads.map((l) =>
      l.assignedTo === id ? { ...l, assignedTo: fallbackOwnerId } : l
    );
    setLeads(updatedLeads);
    localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify(updatedLeads));

    // 3. Reassign any orphaned projects to the Owner
    const updatedProjects = projects.map((p) =>
      p.assignedTo === id ? { ...p, assignedTo: fallbackOwnerId } : p
    );
    setProjects(updatedProjects);
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(updatedProjects));

    // 4. Reassign any orphaned follow-ups to the Owner
    const updatedFollowUps = followUps.map((f) =>
      f.assignedTo === id ? { ...f, assignedTo: fallbackOwnerId } : f
    );
    setFollowUps(updatedFollowUps);
    localStorage.setItem(STORAGE_KEYS.followUps, JSON.stringify(updatedFollowUps));

    return true;
  };

  // Currency helper formatting
  const formatCurrency = (amount: number, curr?: Currency) => {
    const chosenCurr = curr || profile.defaultCurrency || 'USD';
    if (chosenCurr === 'BDT') {
      return `৳${Number(amount || 0).toLocaleString('en-IN')}`;
    }
    return `$${Number(amount || 0).toLocaleString('en-US')}`;
  };

  // Financial helpers per project
  const getProjectFinancials = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    const value = project ? project.projectValue : 0;
    const currency = project?.currency || 'USD';
    const received = payments
      .filter((p) => p.projectId === projectId)
      .reduce((sum, p) => sum + p.amount, 0);
    const pending = Math.max(0, value - received);
    let status: PaymentStatus = 'Unpaid';
    if (received >= value && value > 0) {
      status = 'Fully Paid';
    } else if (received > 0) {
      status = 'Partially Paid';
    }
    return { value, received, pending, currency, status };
  };

  const getClientFinancials = (clientId: string) => {
    const clientProjects = projects.filter((p) => p.clientId === clientId);

    const totalSalesUSD = clientProjects
      .filter((p) => p.currency === 'USD')
      .reduce((sum, p) => sum + p.projectValue, 0);
    const totalSalesBDT = clientProjects
      .filter((p) => p.currency === 'BDT')
      .reduce((sum, p) => sum + p.projectValue, 0);

    const totalReceivedUSD = payments
      .filter((p) => p.clientId === clientId && p.currency === 'USD')
      .reduce((sum, p) => sum + p.amount, 0);
    const totalReceivedBDT = payments
      .filter((p) => p.clientId === clientId && p.currency === 'BDT')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPendingUSD = Math.max(0, totalSalesUSD - totalReceivedUSD);
    const totalPendingBDT = Math.max(0, totalSalesBDT - totalReceivedBDT);

    const activeProjects = clientProjects.filter(
      (p) => p.status !== 'Completed' && p.status !== 'Cancelled'
    ).length;

    return {
      totalSalesUSD,
      totalSalesBDT,
      totalReceivedUSD,
      totalReceivedBDT,
      totalPendingUSD,
      totalPendingBDT,
      activeProjects,
      projects: clientProjects,
    };
  };

  // Lead CRUD
  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'paymentStatus'>) => {
    const newId = `LEAD-${String(leads.length + 1).padStart(2, '0')}`;
    const newLead: Lead = {
      ...leadData,
      id: newId,
      dealValue: leadData.dealValue !== undefined ? leadData.dealValue : 0,
      currency: leadData.currency || 'USD',
      paymentStatus: 'Unpaid',
      assignedTo: leadData.assignedTo || currentUser?.id || 'USR-01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);

    if (leadData.nextFollowUpDate) {
      const flpId = `FLP-${String(followUps.length + 1).padStart(2, '0')}`;
      const newFlp: FollowUp = {
        id: flpId,
        leadId: newId,
        businessName: leadData.businessName,
        contactPerson: leadData.contactPerson,
        contactMethod: leadData.contactMethod || 'WhatsApp',
        dueDate: leadData.nextFollowUpDate,
        notes: leadData.notes || 'Initial follow-up',
        completed: false,
        priority: leadData.priority,
        leadStatus: leadData.status,
        assignedTo: newLead.assignedTo,
        createdAt: new Date().toISOString(),
      };
      setFollowUps((prev) => [newFlp, ...prev]);
    }

    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === id) {
          return {
            ...lead,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return lead;
      })
    );
  };

  const deleteLead = (id: string): boolean => {
    if (currentUser?.role !== 'Owner') {
      alert('Action Denied: Only the Owner has permission to delete leads.');
      return false;
    }
    const lead = leads.find((l) => l.id === id);
    if (lead?.clientId) {
      alert(
        'Action Denied: This lead was converted into a Client profile. To maintain relationship history, please manage this account from the Clients section.'
      );
      return false;
    }
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setFollowUps((prev) => prev.filter((flp) => flp.leadId !== id));
    setCommunications((prev) => prev.filter((comm) => comm.leadId !== id));
    return true;
  };

  const convertLeadToClient = (
    leadId: string,
    initialProjectData?: { projectName?: string; projectValue?: number; deadline?: string }
  ) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) throw new Error('Lead not found');

    const leadCurrency: Currency = lead.currency || 'USD';

    const newClientId = `CLI-${String(clients.length + 1).padStart(2, '0')}`;
    const newClient: Client = {
      id: newClientId,
      leadId: lead.id,
      businessName: lead.businessName,
      contactPerson: lead.contactPerson,
      businessCategory: lead.businessCategory,
      email: lead.email,
      whatsapp: lead.whatsapp,
      website: lead.website,
      facebook: lead.facebook,
      instagram: lead.instagram,
      twitter: lead.twitter,
      country: lead.country,
      city: lead.city,
      currency: leadCurrency, // Permanent client currency inherited from lead!
      notes: lead.notes,
      createdAt: new Date().toISOString(),
    };

    setClients((prev) => [newClient, ...prev]);

    let newProj: Project | undefined;
    if (initialProjectData) {
      const projId = `PRJ-${100 + projects.length + 1}`;
      newProj = {
        id: projId,
        clientId: newClientId,
        clientName: newClient.businessName,
        leadId: lead.id,
        projectName:
          initialProjectData.projectName || `${lead.businessName} - ${lead.serviceName}`,
        serviceId: lead.serviceId,
        serviceName: lead.serviceName,
        projectValue: initialProjectData.projectValue || lead.dealValue || 800,
        currency: leadCurrency, // Inherited from client/lead
        startDate: TODAY_DATE,
        deadline:
          initialProjectData.deadline ||
          new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: 'In Progress',
        notes: `Converted from lead ${lead.id}`,
        assignedTo: lead.assignedTo || currentUser?.id,
        createdAt: new Date().toISOString(),
      };
      setProjects((prev) => [newProj!, ...prev]);
    }

    updateLead(leadId, {
      status: 'Won',
      clientId: newClientId,
      dealValue: initialProjectData?.projectValue || lead.dealValue,
      currency: leadCurrency,
    });

    return { client: newClient, project: newProj };
  };

  // Client CRUD
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newId = `CLI-${String(clients.length + 1).padStart(2, '0')}`;
    const newClient: Client = {
      ...clientData,
      id: newId,
      currency: clientData.currency || 'USD',
      createdAt: new Date().toISOString(),
    };
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteClient = (id: string): boolean => {
    if (currentUser?.role !== 'Owner') {
      alert('Action Denied: Only the Owner has permission to delete clients.');
      return false;
    }

    // ERP Integrity Rule: Cannot delete client if payment records exist
    const clientPayments = payments.filter((p) => p.clientId === id);
    if (clientPayments.length > 0) {
      alert(
        `Action Denied: Cannot delete this client because they have ${clientPayments.length} existing payment record(s). In accordance with accounting integrity, please delete the payment records first, then the projects, and finally the client.`
      );
      return false;
    }

    // ERP Integrity Rule: Cannot delete client if projects exist
    const clientProjects = projects.filter((p) => p.clientId === id);
    if (clientProjects.length > 0) {
      alert(
        `Action Denied: Cannot delete this client because they have ${clientProjects.length} recorded project(s). Please delete all projects under this client first.`
      );
      return false;
    }

    setClients((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  // Project CRUD
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newId = `PRJ-${100 + projects.length + 1}`;
    const newProject: Project = {
      ...projectData,
      id: newId,
      assignedTo: projectData.assignedTo || currentUser?.id,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProject = (id: string): boolean => {
    if (currentUser?.role !== 'Owner') {
      alert('Action Denied: Only the Owner has permission to delete projects.');
      return false;
    }

    // ERP Integrity Rule: Cannot delete project if payments exist
    const projectPayments = payments.filter((p) => p.projectId === id);
    if (projectPayments.length > 0) {
      alert(
        `Action Denied: Cannot delete this project because it has ${projectPayments.length} payment record(s) attached (${projectPayments
          .map((pay) => pay.invoiceNumber)
          .join(', ')}). You must delete the payment records first before deleting the project.`
      );
      return false;
    }

    setProjects((prev) => prev.filter((p) => p.id !== id));
    return true;
  };

  // Payment CRUD
  const addPayment = (paymentData: Omit<Payment, 'id' | 'createdAt'>) => {
    const newId = `PAY-${String(payments.length + 1).padStart(2, '0')}`;
    const newPayment: Payment = {
      ...paymentData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setPayments((prev) => [newPayment, ...prev]);

    const project = projects.find((p) => p.id === paymentData.projectId);
    if (project && project.leadId) {
      const existingPaymentsSum = payments
        .filter((p) => p.projectId === project.id)
        .reduce((sum, p) => sum + p.amount, 0);
      const totalRec = existingPaymentsSum + paymentData.amount;
      const paymentStatus: PaymentStatus =
        totalRec >= project.projectValue ? 'Fully Paid' : 'Partially Paid';
      updateLead(project.leadId, { paymentStatus });
    }

    return newPayment;
  };

  const updatePayment = (id: string, updates: Partial<Payment>) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deletePayment = (id: string): boolean => {
    if (currentUser?.role !== 'Owner') {
      alert('Action Denied: Only the Owner has permission to delete payment records.');
      return false;
    }
    setPayments((prev) => prev.filter((pay) => pay.id !== id));
    return true;
  };

  // Proposal CRUD
  const addProposal = (proposalData: Omit<Proposal, 'id' | 'createdAt'>) => {
    const newId = `PROP-${String(proposals.length + 1).padStart(2, '0')}`;
    const newProp: Proposal = {
      ...proposalData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setProposals((prev) => [newProp, ...prev]);

    if (proposalData.leadId) {
      updateLead(proposalData.leadId, {
        status: 'Proposal',
        dealValue: proposalData.proposalAmount,
        currency: proposalData.currency,
      });
    }

    return newProp;
  };

  const updateProposal = (id: string, updates: Partial<Proposal>) => {
    setProposals((prev) =>
      prev.map((prop) => {
        if (prop.id === id) {
          const updated = { ...prop, ...updates };
          if (updates.status === 'Accepted' && prop.leadId) {
            updateLead(prop.leadId, { status: 'Won' });
          }
          return updated;
        }
        return prop;
      })
    );
  };

  const deleteProposal = (id: string): boolean => {
    if (currentUser?.role !== 'Owner') {
      alert('Action Denied: Only the Owner has permission to delete proposals.');
      return false;
    }
    setProposals((prev) => prev.filter((p) => p.id !== id));
    return true;
  };

  // Communication CRUD
  const addCommunication = (commData: Omit<Communication, 'id' | 'createdAt'>) => {
    const newId = `COM-${String(communications.length + 1).padStart(2, '0')}`;
    const newComm: Communication = {
      ...commData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setCommunications((prev) => [newComm, ...prev]);

    if (commData.leadId) {
      const lead = leads.find((l) => l.id === commData.leadId);
      if (lead) {
        let newStatus: LeadStatus = lead.status;
        if (lead.status === 'New Lead') {
          newStatus = commData.clientResponse ? 'Replied' : 'Contacted';
        } else if (commData.clientResponse && lead.status === 'Contacted') {
          newStatus = 'Replied';
        }
        updateLead(commData.leadId, {
          lastContactDate: commData.date.split('T')[0],
          contactMethod: commData.contactMethod,
          status: newStatus,
        });
      }
    }

    return newComm;
  };

  const updateCommunication = (id: string, updates: Partial<Communication>) => {
    setCommunications((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCommunication = (id: string): boolean => {
    if (currentUser?.role !== 'Owner') {
      alert('Action Denied: Only the Owner has permission to delete communication logs.');
      return false;
    }
    setCommunications((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  // Follow-up CRUD
  const addFollowUp = (
    followUpData: Omit<FollowUp, 'id' | 'createdAt' | 'completed' | 'completedAt'>
  ) => {
    const newId = `FLP-${String(followUps.length + 1).padStart(2, '0')}`;
    const newFlp: FollowUp = {
      ...followUpData,
      id: newId,
      completed: false,
      assignedTo: followUpData.assignedTo || currentUser?.id,
      createdAt: new Date().toISOString(),
    };
    setFollowUps((prev) => [newFlp, ...prev]);

    if (followUpData.leadId) {
      updateLead(followUpData.leadId, {
        nextFollowUpDate: followUpData.dueDate,
      });
    }

    return newFlp;
  };

  const completeFollowUp = (
    id: string,
    outcomeNotes?: string,
    scheduleNextDays?: number,
    nextNotes?: string
  ) => {
    const targetFlp = followUps.find((f) => f.id === id);
    if (!targetFlp) return;

    setFollowUps((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              completed: true,
              completedAt: new Date().toISOString(),
              outcomeNotes: outcomeNotes || f.outcomeNotes,
            }
          : f
      )
    );

    if (scheduleNextDays && scheduleNextDays > 0) {
      const nextDateObj = new Date();
      nextDateObj.setDate(nextDateObj.getDate() + scheduleNextDays);
      const nextDate = nextDateObj.toISOString().split('T')[0];

      const newId = `FLP-${String(followUps.length + 1).padStart(2, '0')}`;
      const nextFlp: FollowUp = {
        id: newId,
        leadId: targetFlp.leadId,
        clientId: targetFlp.clientId,
        businessName: targetFlp.businessName,
        contactPerson: targetFlp.contactPerson,
        contactMethod: targetFlp.contactMethod,
        dueDate: nextDate,
        notes: nextNotes || `Follow-up after ${targetFlp.notes}`,
        completed: false,
        priority: targetFlp.priority,
        leadStatus: targetFlp.leadStatus,
        assignedTo: targetFlp.assignedTo,
        createdAt: new Date().toISOString(),
      };
      setFollowUps((prev) => [nextFlp, ...prev]);

      if (targetFlp.leadId) {
        updateLead(targetFlp.leadId, { nextFollowUpDate: nextDate });
      }
    }
  };

  const rescheduleFollowUp = (id: string, newDate: string, notes?: string) => {
    setFollowUps((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            dueDate: newDate,
            notes: notes ? `${f.notes} [Rescheduled: ${notes}]` : f.notes,
            completed: false,
          };
        }
        return f;
      })
    );

    const flp = followUps.find((f) => f.id === id);
    if (flp && flp.leadId) {
      updateLead(flp.leadId, { nextFollowUpDate: newDate });
    }
  };

  const deleteFollowUp = (id: string): boolean => {
    if (currentUser?.role !== 'Owner') {
      alert('Action Denied: Only the Owner has permission to delete follow-ups.');
      return false;
    }
    setFollowUps((prev) => prev.filter((f) => f.id !== id));
    return true;
  };

  // Service CRUD
  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newId = `SRV-${String(services.length + 1).padStart(2, '0')}`;
    const newSrv: Service = { ...serviceData, id: newId };
    setServices((prev) => [...prev, newSrv]);
    return newSrv;
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteService = (id: string): boolean => {
    if (currentUser?.role !== 'Owner') {
      alert('Action Denied: Only the Owner has permission to delete services.');
      return false;
    }
    setServices((prev) => prev.filter((s) => s.id !== id));
    return true;
  };

  const updateProfile = (updates: Partial<FreelancerProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const resetToSampleData = () => {
    // Deprecated per user request
  };

  const clearAllData = () => {
    if (currentUser?.role !== 'Owner') {
      alert('Action Denied: Only the Owner has permission to clear CRM data.');
      return;
    }
    setLeads([]);
    setClients([]);
    setProjects([]);
    setPayments([]);
    setProposals([]);
    setCommunications([]);
    setFollowUps([]);
  };

  const exportDataJSON = () => {
    const backup = {
      users,
      leads,
      clients,
      projects,
      payments,
      proposals,
      communications,
      followUps,
      services,
      profile,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDataJSON = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.users && Array.isArray(data.users)) setUsers(data.users);
      if (data.leads && Array.isArray(data.leads)) setLeads(data.leads);
      if (data.clients && Array.isArray(data.clients)) setClients(data.clients);
      if (data.projects && Array.isArray(data.projects)) setProjects(data.projects);
      if (data.payments && Array.isArray(data.payments)) setPayments(data.payments);
      if (data.proposals && Array.isArray(data.proposals)) setProposals(data.proposals);
      if (data.communications && Array.isArray(data.communications))
        setCommunications(data.communications);
      if (data.followUps && Array.isArray(data.followUps)) setFollowUps(data.followUps);
      if (data.services && Array.isArray(data.services)) setServices(data.services);
      if (data.profile) setProfile(data.profile);
      return true;
    } catch {
      return false;
    }
  };

  // Role-based visibility and team hierarchy
  const isOwner =
    currentUser?.role === 'Owner' ||
    currentUser?.email?.toLowerCase() === 'dev.mdshahalam@gmail.com';
  const isTeamLeader = currentUser?.role === 'Team Leader';

  // Subordinate member IDs under current Team Leader
  const subordinateUsers = useMemo(() => {
    if (!currentUser || currentUser.role !== 'Team Leader') return [];
    return users.filter((u) => u.teamLeaderId === currentUser.id);
  }, [currentUser, users]);

  const subordinateUserIds = useMemo(() => {
    return new Set<string>(subordinateUsers.map((u) => u.id));
  }, [subordinateUsers]);

  // List of users the current user is allowed to assign tasks/leads to
  const assignableUsers = useMemo(() => {
    if (!currentUser) return [];
    if (isOwner) return users;
    if (isTeamLeader) {
      return [currentUser, ...subordinateUsers];
    }
    // Member: can only assign to themselves
    return [currentUser];
  }, [currentUser, isOwner, isTeamLeader, users, subordinateUsers]);

  // Can the current user view/access an item based on role & assignment?
  const canUserAccess = (assignedToId?: string) => {
    if (!currentUser) return false;
    if (isOwner) return true;
    if (!assignedToId) return true; // Unassigned items are visible for pickup
    if (isTeamLeader) {
      return assignedToId === currentUser.id || subordinateUserIds.has(assignedToId);
    }
    // Member: only their assigned items
    return assignedToId === currentUser.id;
  };

  // All accessible leads based on role (including historical converted leads)
  const accessibleLeads = useMemo(() => {
    return leads.filter((l) => canUserAccess(l.assignedTo));
  }, [leads, currentUser, isOwner, isTeamLeader, subordinateUserIds]);

  const accessibleLeadIds = useMemo(() => {
    return new Set(accessibleLeads.map((l) => l.id));
  }, [accessibleLeads]);

  // Active Leads pipeline: Leads converted to clients are removed from the leads list
  const visibleLeads = useMemo(() => {
    return accessibleLeads.filter((l) => !l.clientId);
  }, [accessibleLeads]);

  const visibleProjects = useMemo(() => {
    return projects.filter((p) => canUserAccess(p.assignedTo));
  }, [projects, currentUser, isOwner, isTeamLeader, subordinateUserIds]);

  const visibleProjectIds = useMemo(() => {
    return new Set(visibleProjects.map((p) => p.id));
  }, [visibleProjects]);

  const visibleFollowUps = useMemo(() => {
    return followUps.filter((f) => {
      if (canUserAccess(f.assignedTo)) return true;
      if (accessibleLeadIds.has(f.leadId)) return true;
      return false;
    });
  }, [followUps, accessibleLeadIds, currentUser, isOwner, isTeamLeader, subordinateUserIds]);

  const visibleCommunications = useMemo(() => {
    return communications.filter((c) => accessibleLeadIds.has(c.leadId));
  }, [communications, accessibleLeadIds]);

  const visibleProposals = useMemo(() => {
    return proposals.filter((p) => !p.leadId || accessibleLeadIds.has(p.leadId));
  }, [proposals, accessibleLeadIds]);

  const visiblePayments = useMemo(() => {
    return payments.filter((pay) => visibleProjectIds.has(pay.projectId));
  }, [payments, visibleProjectIds]);

  // KPIs
  const kpis = useMemo(() => {
    const totalLeads = visibleLeads.length;
    const newLeads = visibleLeads.filter((l) => l.status === 'New Lead').length;
    const contactedLeads = visibleLeads.filter((l) => l.status === 'Contacted').length;
    const interestedLeads = visibleLeads.filter((l) => l.status === 'Interested').length;

    const pendingFollowUps = visibleFollowUps.filter((f) => !f.completed);
    const overdueFollowUps = pendingFollowUps.filter((f) => f.dueDate < TODAY_DATE).length;
    const followUpsDue = pendingFollowUps.filter((f) => f.dueDate === TODAY_DATE).length;

    // Multi-currency calculation
    const totalSalesUSD = visibleProjects
      .filter((p) => p.currency === 'USD')
      .reduce((acc, p) => acc + p.projectValue, 0);
    const totalSalesBDT = visibleProjects
      .filter((p) => p.currency === 'BDT')
      .reduce((acc, p) => acc + p.projectValue, 0);

    const amountReceivedUSD = visiblePayments
      .filter((p) => p.currency === 'USD')
      .reduce((acc, p) => acc + p.amount, 0);
    const amountReceivedBDT = visiblePayments
      .filter((p) => p.currency === 'BDT')
      .reduce((acc, p) => acc + p.amount, 0);

    const amountPendingUSD = Math.max(0, totalSalesUSD - amountReceivedUSD);
    const amountPendingBDT = Math.max(0, totalSalesBDT - amountReceivedBDT);

    const activeProjects = visibleProjects.filter(
      (p) => p.status === 'In Progress' || p.status === 'Review'
    ).length;
    const completedProjects = visibleProjects.filter((p) => p.status === 'Completed').length;
    const waitingForClientProjects = visibleProjects.filter(
      (p) => p.status === 'Waiting for Client'
    ).length;

    const upcomingDeadlines = visibleProjects.filter((p) => {
      if (p.status === 'Completed' || p.status === 'Cancelled') return false;
      const diffDays = Math.ceil(
        (new Date(p.deadline).getTime() - new Date(TODAY_DATE).getTime()) / (1000 * 3600 * 24)
      );
      return diffDays >= 0 && diffDays <= 7;
    }).length;

    return {
      totalLeads,
      newLeads,
      contactedLeads,
      interestedLeads,
      followUpsDue,
      overdueFollowUps,
      totalSalesUSD,
      totalSalesBDT,
      amountReceivedUSD,
      amountReceivedBDT,
      amountPendingUSD,
      amountPendingBDT,
      activeProjects,
      completedProjects,
      waitingForClientProjects,
      upcomingDeadlines,
    };
  }, [visibleLeads, visibleFollowUps, visibleProjects, visiblePayments]);

  // Lead Timeline generator
  const getLeadTimeline = (leadId: string): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return [];

    events.push({
      id: `evt-created-${lead.id}`,
      date: lead.createdAt,
      type: 'note',
      title: 'Lead Added',
      description: `Added lead via ${lead.leadSource} for ${lead.serviceName}`,
    });

    const comms = communications.filter((c) => c.leadId === leadId);
    comms.forEach((c) => {
      events.push({
        id: `evt-comm-${c.id}`,
        date: c.date,
        type: 'contact',
        title: `${c.contactMethod}: ${c.messageType} sent`,
        description: c.messageSent,
      });

      if (c.clientResponse) {
        events.push({
          id: `evt-comm-resp-${c.id}`,
          date: c.responseDate || c.date,
          type: 'response',
          title: 'Client Replied',
          description: c.clientResponse,
        });
      }
    });

    const props = proposals.filter((p) => p.leadId === leadId);
    props.forEach((p) => {
      events.push({
        id: `evt-prop-${p.id}`,
        date: `${p.sentDate}T12:00:00Z`,
        type: 'proposal',
        title: `Proposal Sent: ${p.title}`,
        description: `${p.serviceName} - Status: ${p.status}`,
        amount: p.proposalAmount,
        currency: p.currency,
      });

      if (p.status === 'Accepted') {
        events.push({
          id: `evt-prop-acc-${p.id}`,
          date: `${p.sentDate}T16:00:00Z`,
          type: 'won',
          title: 'Client Accepted Proposal',
          description: `Deal won for ${formatCurrency(p.proposalAmount, p.currency)}`,
          amount: p.proposalAmount,
          currency: p.currency,
        });
      }
    });

    const projs = projects.filter((p) => p.leadId === leadId);
    projs.forEach((p) => {
      events.push({
        id: `evt-proj-${p.id}`,
        date: `${p.startDate}T09:00:00Z`,
        type: 'project',
        title: `Project Started: ${p.projectName}`,
        description: `Target deadline: ${p.deadline} (${p.status})`,
        amount: p.projectValue,
        currency: p.currency,
      });

      const projPayments = payments.filter((pay) => pay.projectId === p.id);
      projPayments.forEach((pay) => {
        events.push({
          id: `evt-pay-${pay.id}`,
          date: `${pay.paymentDate}T15:00:00Z`,
          type: 'payment',
          title: `Payment Received: ${pay.invoiceNumber}`,
          description: `Received via ${pay.paymentMethod}. ${pay.notes || ''}`,
          amount: pay.amount,
          currency: pay.currency,
        });
      });
    });

    const flps = followUps.filter((f) => f.leadId === leadId && f.completed);
    flps.forEach((f) => {
      events.push({
        id: `evt-flp-${f.id}`,
        date: f.completedAt || `${f.dueDate}T12:00:00Z`,
        type: 'followup',
        title: `Completed Follow-up (${f.contactMethod})`,
        description: f.outcomeNotes || f.notes,
      });
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Dynamic Business Notifications
  const notifications = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'urgent' | 'warning' | 'info' | 'success';
      title: string;
      message: string;
      date: string;
      actionTab?: string;
      actionId?: string;
    }> = [];

    const overdueFlps = followUps.filter((f) => !f.completed && f.dueDate < TODAY_DATE);
    if (overdueFlps.length > 0) {
      list.push({
        id: 'notif-overdue-flp',
        type: 'urgent',
        title: `${overdueFlps.length} Follow-up${overdueFlps.length > 1 ? 's' : ''} Overdue`,
        message: `${overdueFlps[0].businessName} and ${overdueFlps.length - 1} other(s) need immediate attention.`,
        date: 'Action needed',
        actionTab: 'followups',
      });
    }

    const todayFlps = followUps.filter((f) => !f.completed && f.dueDate === TODAY_DATE);
    if (todayFlps.length > 0) {
      list.push({
        id: 'notif-today-flp',
        type: 'warning',
        title: `${todayFlps.length} Follow-up${todayFlps.length > 1 ? 's' : ''} Due Today`,
        message: `Scheduled contact with ${todayFlps.map((f) => f.businessName).slice(0, 2).join(', ')}${todayFlps.length > 2 ? '...' : ''}.`,
        date: 'Today',
        actionTab: 'followups',
      });
    }

    if (kpis.amountPendingUSD > 0 || kpis.amountPendingBDT > 0) {
      const pendingText = [
        kpis.amountPendingUSD > 0 ? formatCurrency(kpis.amountPendingUSD, 'USD') : '',
        kpis.amountPendingBDT > 0 ? formatCurrency(kpis.amountPendingBDT, 'BDT') : '',
      ]
        .filter(Boolean)
        .join(' + ');

      list.push({
        id: 'notif-pending-payments',
        type: 'info',
        title: `${pendingText} Pending Payments`,
        message: 'Remaining balance awaiting milestone completion across active client projects.',
        date: 'Invoices',
        actionTab: 'payments',
      });
    }

    projects
      .filter((p) => p.status !== 'Completed' && p.status !== 'Cancelled')
      .forEach((p) => {
        const diffDays = Math.ceil(
          (new Date(p.deadline).getTime() - new Date(TODAY_DATE).getTime()) / (1000 * 3600 * 24)
        );
        if (diffDays <= 3 && diffDays >= 0) {
          list.push({
            id: `notif-deadline-${p.id}`,
            type: diffDays <= 1 ? 'urgent' : 'warning',
            title: `Deadline Approaching: ${p.projectName}`,
            message: `Due in ${diffDays === 0 ? 'today' : `${diffDays} day(s)`} on ${p.deadline}.`,
            date: p.deadline,
            actionTab: 'projects',
          });
        }
      });

    return list;
  }, [followUps, kpis.amountPendingUSD, kpis.amountPendingBDT, projects]);

  return (
    <CRMContext.Provider
      value={{
        currentUser,
        users,
        assignableUsers,
        subordinateUsers,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        leads: visibleLeads,
        allLeads: accessibleLeads,
        clients,
        projects: visibleProjects,
        payments: visiblePayments,
        proposals: visibleProposals,
        communications: visibleCommunications,
        followUps: visibleFollowUps,
        services,
        profile,
        currentTab,
        setCurrentTab,
        selectedLeadId,
        setSelectedLeadId,
        selectedClientId,
        setSelectedClientId,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isSearchOpen,
        setIsSearchOpen,
        addLead,
        updateLead,
        deleteLead,
        convertLeadToClient,
        addClient,
        updateClient,
        deleteClient,
        addProject,
        updateProject,
        deleteProject,
        addPayment,
        updatePayment,
        deletePayment,
        addProposal,
        updateProposal,
        deleteProposal,
        addCommunication,
        updateCommunication,
        deleteCommunication,
        addFollowUp,
        completeFollowUp,
        rescheduleFollowUp,
        deleteFollowUp,
        addService,
        updateService,
        deleteService,
        updateProfile,
        clearAllData,
        exportDataJSON,
        importDataJSON,
        kpis,
        getProjectFinancials,
        getClientFinancials,
        getLeadTimeline,
        notifications,
        formatCurrency,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
