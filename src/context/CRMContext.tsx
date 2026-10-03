import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  AppUser,
  Client,
  Communication,
  FollowUp,
  FreelancerProfile,
  Lead,
  LeadStatus,
  Payment,
  PaymentStatus,
  Project,
  ProjectStatus,
  Proposal,
  ProposalStatus,
  Service,
  Currency,
} from '../types/crm';
import {
  initialLeads,
  initialClients,
  initialProjects,
  initialPayments,
  initialProposals,
  initialCommunications,
  initialFollowUps,
  initialServices,
  initialProfile,
} from '../data/initialData';
import { db } from '../services/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

interface CRMContextType {
  currentUser: AppUser | null;
  logout: () => void;
  login: (email: string, pass: string) => boolean;

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

  // Notification Modal state for action feedback
  actionNotice: string | null;
  setActionNotice: (notice: string | null) => void;

  // CRUD actions
  addLead: (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'paymentStatus'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => boolean;
  convertLeadToClient: (
    leadId: string,
    initialProjectData?: { projectName?: string; projectValue?: number; deadline?: string }
  ) => { client: Client; project?: Project };

  addClient: (clientData: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => boolean;

  addProject: (projectData: Omit<Project, 'id' | 'createdAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => boolean;

  addPayment: (paymentData: Omit<Payment, 'id' | 'createdAt'>) => Payment;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => boolean;

  addProposal: (proposalData: Omit<Proposal, 'id' | 'createdAt'>) => Proposal;
  updateProposal: (id: string, updates: Partial<Proposal>) => void;
  deleteProposal: (id: string) => boolean;

  addCommunication: (commData: Omit<Communication, 'id' | 'createdAt'>) => Communication;
  updateCommunication: (id: string, updates: Partial<Communication>) => void;
  deleteCommunication: (id: string) => boolean;

  addFollowUp: (
    followUpData: Omit<FollowUp, 'id' | 'createdAt' | 'completed' | 'completedAt'>
  ) => FollowUp;
  completeFollowUp: (
    id: string,
    outcomeNotes?: string,
    scheduleNextDays?: number,
    nextNotes?: string
  ) => void;
  rescheduleFollowUp: (id: string, newDate: string, notes?: string) => void;
  deleteFollowUp: (id: string) => void;

  addService: (serviceData: Omit<Service, 'id'>) => Service;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;

  updateProfile: (updates: Partial<FreelancerProfile>) => void;
  resetToSampleData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;

  kpis: {
    totalLeads: number;
    newLeads: number;
    contactedLeads: number;
    interestedLeads: number;
    activeProjects: number;
    totalSalesUSD: number;
    totalSalesBDT: number;
    amountReceivedUSD: number;
    amountReceivedBDT: number;
    amountPendingUSD: number;
    amountPendingBDT: number;
    followUpsDue: number;
    overdueFollowUps: number;
  };
  users: AppUser[];
  assignableUsers: AppUser[];
  addUser: (userData: Omit<AppUser, 'id' | 'createdAt'>) => AppUser;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  deleteUser: (id: string) => boolean;
  isOwner: boolean;
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
  getLeadTimeline: (leadId: string) => Array<{
    id: string;
    type: string;
    title: string;
    date: string;
    description: string;
  }>;
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

const TODAY_DATE = '2026-10-02';
const isOwner = true;

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Single Owner Authentication
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('devflow_logged_in');
    if (saved === 'true') {
      return {
        id: 'USR-01',
        name: 'Md Shah Alam',
        email: 'dev.mdshahalam@gmail.com',
        password: 'Anas@2026',
        role: 'Owner',
        createdAt: new Date().toISOString(),
      };
    }
    return null;
  });

  // Entities state
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [communications, setCommunications] = useState<Communication[]>(initialCommunications);
  const [followUps, setFollowUps] = useState<FollowUp[]>(initialFollowUps);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [profile, setProfile] = useState<FreelancerProfile>(initialProfile);

  const [isLoaded, setIsLoaded] = useState(false);

  // Firestore Real-time Sync (onSnapshot) across devices
  useEffect(() => {
    const unsubLeads = onSnapshot(collection(db, 'leads'), (snapshot) => {
      setLeads(snapshot.empty ? [] : snapshot.docs.map((d) => d.data() as Lead));
    });

    const unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
      setClients(snapshot.empty ? [] : snapshot.docs.map((d) => d.data() as Client));
    });

    const unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      setProjects(snapshot.empty ? [] : snapshot.docs.map((d) => d.data() as Project));
    });

    const unsubPayments = onSnapshot(collection(db, 'payments'), (snapshot) => {
      setPayments(snapshot.empty ? [] : snapshot.docs.map((d) => d.data() as Payment));
    });

    const unsubProposals = onSnapshot(collection(db, 'proposals'), (snapshot) => {
      setProposals(snapshot.empty ? [] : snapshot.docs.map((d) => d.data() as Proposal));
    });

    const unsubComms = onSnapshot(collection(db, 'communications'), (snapshot) => {
      setCommunications(snapshot.empty ? [] : snapshot.docs.map((d) => d.data() as Communication));
    });

    const unsubFollowUps = onSnapshot(collection(db, 'followUps'), (snapshot) => {
      setFollowUps(snapshot.empty ? [] : snapshot.docs.map((d) => d.data() as FollowUp));
    });

    const unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      if (!snapshot.empty) {
        setServices(snapshot.docs.map((d) => d.data() as Service));
      } else {
        initialServices.forEach(async (s) => {
          await setDoc(doc(db, 'services', s.id), s);
        });
      }
    });

    const unsubProfile = onSnapshot(doc(db, 'profile', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as FreelancerProfile);
      } else {
        setDoc(doc(db, 'profile', 'main'), initialProfile);
      }
      setIsLoaded(true);
    });

    return () => {
      unsubLeads();
      unsubClients();
      unsubProjects();
      unsubPayments();
      unsubProposals();
      unsubComms();
      unsubFollowUps();
      unsubServices();
      unsubProfile();
    };
  }, []);

  const login = (email: string, pass: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    if (
      (cleanEmail === 'shahalam.wordpress@gmail.com' || cleanEmail === 'dev.mdshahalam@gmail.com') &&
      pass.trim() === 'Anas@2026'
    ) {
      setCurrentUser({
        id: 'USR-01',
        name: 'Md Shah Alam',
        email: cleanEmail,
        password: pass.trim(),
        role: 'Owner',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('devflow_logged_in', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('devflow_logged_in');
  };

  // Currency helper
  const formatCurrency = (amount: number, curr?: Currency) => {
    const chosenCurr = curr || profile.defaultCurrency || 'USD';
    if (chosenCurr === 'BDT') {
      return `৳${Number(amount || 0).toLocaleString('en-IN')}`;
    }
    return `$${Number(amount || 0).toLocaleString('en-US')}`;
  };

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
      assignedTo: 'USR-01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDoc(doc(db, 'leads', newId), newLead);
    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    const updated = { ...lead, ...updates, updatedAt: new Date().toISOString() };
    setDoc(doc(db, 'leads', id), updated);
  };

  const deleteLead = (id: string): boolean => {
    const lead = leads.find((l) => l.id === id);
    if (lead?.clientId) {
      setActionNotice('This lead was converted into a Client account. Please manage relationship from Clients.');
      return false;
    }
    deleteDoc(doc(db, 'leads', id));
    followUps.filter((f) => f.leadId === id).forEach((f) => deleteDoc(doc(db, 'followUps', f.id)));
    communications.filter((c) => c.leadId === id).forEach((c) => deleteDoc(doc(db, 'communications', c.id)));
    return true;
  };

  const convertLeadToClient = (
    leadId: string,
    initialProjectData?: { projectName?: string; projectValue?: number; deadline?: string }
  ) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) throw new Error('Lead not found');

    const newClientId = `CLI-${String(clients.length + 1).padStart(2, '0')}`;
    const leadCurrency = lead.currency || 'USD';

    const newClient: Client = {
      id: newClientId,
      businessName: lead.businessName,
      contactPerson: lead.contactPerson,
      businessCategory: lead.businessCategory || 'General Business',
      email: lead.email,
      whatsapp: lead.whatsapp,
      website: lead.website,
      country: lead.country || 'United States',
      city: lead.city || '',
      currency: leadCurrency,
      createdAt: new Date().toISOString(),
    };
    setDoc(doc(db, 'clients', newClientId), newClient);

    let newProj: Project | undefined;
    if (lead.serviceId) {
      const projId = `PRJ-${100 + projects.length + 1}`;
      newProj = {
        id: projId,
        clientId: newClientId,
        clientName: newClient.businessName,
        leadId: lead.id,
        projectName: initialProjectData?.projectName || `${lead.businessName} - ${lead.serviceName}`,
        serviceId: lead.serviceId,
        serviceName: lead.serviceName,
        projectValue: initialProjectData?.projectValue || lead.dealValue || 800,
        currency: leadCurrency,
        startDate: TODAY_DATE,
        deadline: initialProjectData?.deadline || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: 'In Progress',
        notes: `Converted from lead ${lead.id}`,
        assignedTo: 'USR-01',
        createdAt: new Date().toISOString(),
      };
      setDoc(doc(db, 'projects', projId), newProj);
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
    setDoc(doc(db, 'clients', newId), newClient);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    const client = clients.find((c) => c.id === id);
    if (!client) return;
    const updated = { ...client, ...updates };
    setDoc(doc(db, 'clients', id), updated);
  };

  const deleteClient = (id: string): boolean => {
    // Cascade delete all client payments, projects, proposals
    payments.filter((p) => p.clientId === id).forEach((p) => deleteDoc(doc(db, 'payments', p.id)));
    projects.filter((p) => p.clientId === id).forEach((p) => deleteDoc(doc(db, 'projects', p.id)));
    proposals.filter((p) => p.clientId === id).forEach((p) => deleteDoc(doc(db, 'proposals', p.id)));
    deleteDoc(doc(db, 'clients', id));
    return true;
  };

  // Project CRUD
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newId = `PRJ-${100 + projects.length + 1}`;
    const newProject: Project = {
      ...projectData,
      id: newId,
      assignedTo: 'USR-01',
      createdAt: new Date().toISOString(),
    };
    setDoc(doc(db, 'projects', newId), newProject);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const proj = projects.find((p) => p.id === id);
    if (!proj) return;
    const updated = { ...proj, ...updates };
    setDoc(doc(db, 'projects', id), updated);
  };

  const deleteProject = (id: string): boolean => {
    // Cascade delete project payments
    payments.filter((p) => p.projectId === id).forEach((p) => deleteDoc(doc(db, 'payments', p.id)));
    deleteDoc(doc(db, 'projects', id));
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
    setDoc(doc(db, 'payments', newId), newPayment);
    return newPayment;
  };

  const updatePayment = (id: string, updates: Partial<Payment>) => {
    const pay = payments.find((p) => p.id === id);
    if (!pay) return;
    const updated = { ...pay, ...updates };
    setDoc(doc(db, 'payments', id), updated);
  };

  const deletePayment = (id: string): boolean => {
    deleteDoc(doc(db, 'payments', id));
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
    setDoc(doc(db, 'proposals', newId), newProp);
    return newProp;
  };

  const updateProposal = (id: string, updates: Partial<Proposal>) => {
    const prop = proposals.find((p) => p.id === id);
    if (!prop) return;
    const updated = { ...prop, ...updates };
    setDoc(doc(db, 'proposals', id), updated);
  };

  const deleteProposal = (id: string): boolean => {
    deleteDoc(doc(db, 'proposals', id));
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
    setDoc(doc(db, 'communications', newId), newComm);
    return newComm;
  };

  const updateCommunication = (id: string, updates: Partial<Communication>) => {
    const comm = communications.find((c) => c.id === id);
    if (!comm) return;
    const updated = { ...comm, ...updates };
    setDoc(doc(db, 'communications', id), updated);
  };

  const deleteCommunication = (id: string): boolean => {
    deleteDoc(doc(db, 'communications', id));
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
      assignedTo: 'USR-01',
      createdAt: new Date().toISOString(),
    };
    setDoc(doc(db, 'followUps', newId), newFlp);
    return newFlp;
  };

  const completeFollowUp = (id: string) => {
    const flp = followUps.find((f) => f.id === id);
    if (!flp) return;
    const updated = { ...flp, completed: true, completedAt: new Date().toISOString() };
    setDoc(doc(db, 'followUps', id), updated);
  };

  const rescheduleFollowUp = (id: string, newDate: string, notes?: string) => {
    const flp = followUps.find((f) => f.id === id);
    if (!flp) return;
    const updated = { ...flp, dueDate: newDate, notes: notes || flp.notes };
    setDoc(doc(db, 'followUps', id), updated);
  };

  const deleteFollowUp = (id: string) => {
    deleteDoc(doc(db, 'followUps', id));
  };

  // Service CRUD
  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newId = `SRV-${String(services.length + 1).padStart(2, '0')}`;
    const newSrv: Service = { ...serviceData, id: newId };
    setDoc(doc(db, 'services', newId), newSrv);
    return newSrv;
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    const srv = services.find((s) => s.id === id);
    if (!srv) return;
    const updated = { ...srv, ...updates };
    setDoc(doc(db, 'services', id), updated);
  };

  const deleteService = (id: string) => {
    deleteDoc(doc(db, 'services', id));
  };

  const updateProfile = (updates: Partial<FreelancerProfile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    setDoc(doc(db, 'profile', 'main'), updated);
  };

  const resetToSampleData = () => {
    // Re-seed Firestore with initial data
    initialLeads.forEach((l) => setDoc(doc(db, 'leads', l.id), l));
    initialClients.forEach((c) => setDoc(doc(db, 'clients', c.id), c));
    initialProjects.forEach((p) => setDoc(doc(db, 'projects', p.id), p));
    initialPayments.forEach((pay) => setDoc(doc(db, 'payments', pay.id), pay));
    initialProposals.forEach((prop) => setDoc(doc(db, 'proposals', prop.id), prop));
    initialCommunications.forEach((c) => setDoc(doc(db, 'communications', c.id), c));
    initialFollowUps.forEach((f) => setDoc(doc(db, 'followUps', f.id), f));
    initialServices.forEach((s) => setDoc(doc(db, 'services', s.id), s));
    setDoc(doc(db, 'profile', 'main'), initialProfile);
  };

  const exportDataJSON = () => {
    return JSON.stringify(
      { leads, clients, projects, payments, proposals, communications, followUps, services, profile },
      null,
      2
    );
  };

  const importDataJSON = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.leads) data.leads.forEach((l: Lead) => setDoc(doc(db, 'leads', l.id), l));
      if (data.clients) data.clients.forEach((c: Client) => setDoc(doc(db, 'clients', c.id), c));
      if (data.projects) data.projects.forEach((p: Project) => setDoc(doc(db, 'projects', p.id), p));
      if (data.payments) data.payments.forEach((pay: Payment) => setDoc(doc(db, 'payments', pay.id), pay));
      if (data.proposals) data.proposals.forEach((prop: Proposal) => setDoc(doc(db, 'proposals', prop.id), prop));
      if (data.communications) data.communications.forEach((c: Communication) => setDoc(doc(db, 'communications', c.id), c));
      if (data.followUps) data.followUps.forEach((f: FollowUp) => setDoc(doc(db, 'followUps', f.id), f));
      if (data.services) data.services.forEach((s: Service) => setDoc(doc(db, 'services', s.id), s));
      if (data.profile) setDoc(doc(db, 'profile', 'main'), data.profile);
      return true;
    } catch {
      return false;
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === 'New Lead').length;
    const contactedLeads = leads.filter((l) => l.status === 'Contacted').length;
    const interestedLeads = leads.filter((l) => l.status === 'Interested' || l.status === 'Proposal' || l.status === 'Negotiation').length;
    const activeProjects = projects.filter(
      (p) => p.status !== 'Completed' && p.status !== 'Cancelled'
    ).length;

    const totalSalesUSD = projects
      .filter((p) => p.currency === 'USD')
      .reduce((sum, p) => sum + p.projectValue, 0);
    const totalSalesBDT = projects
      .filter((p) => p.currency === 'BDT')
      .reduce((sum, p) => sum + p.projectValue, 0);

    const amountReceivedUSD = payments
      .filter((p) => p.currency === 'USD')
      .reduce((sum, p) => sum + p.amount, 0);
    const amountReceivedBDT = payments
      .filter((p) => p.currency === 'BDT')
      .reduce((sum, p) => sum + p.amount, 0);

    const amountPendingUSD = Math.max(0, totalSalesUSD - amountReceivedUSD);
    const amountPendingBDT = Math.max(0, totalSalesBDT - amountReceivedBDT);

    const pendingFollowUps = followUps.filter((f) => !f.completed);
    const followUpsDue = pendingFollowUps.filter((f) => f.dueDate === TODAY_DATE).length;
    const overdueFollowUps = pendingFollowUps.filter((f) => f.dueDate < TODAY_DATE).length;

    return {
      totalLeads,
      newLeads,
      contactedLeads,
      interestedLeads,
      activeProjects,
      totalSalesUSD,
      totalSalesBDT,
      amountReceivedUSD,
      amountReceivedBDT,
      amountPendingUSD,
      amountPendingBDT,
      followUpsDue,
      overdueFollowUps,
    };
  }, [leads, projects, payments, followUps]);

  const getLeadTimeline = (leadId: string) => {
    const leadComms = communications.filter((c) => c.leadId === leadId);
    const leadFollowUps = followUps.filter((f) => f.leadId === leadId);
    const leadProposals = proposals.filter((p) => p.leadId === leadId);

    const events: Array<{ id: string; type: string; title: string; date: string; description: string }> = [];

    leadComms.forEach((c) => {
      events.push({
        id: c.id,
        type: 'communication',
        title: `${c.contactMethod} (${c.messageType})`,
        date: c.date,
        description: c.messageSent + (c.clientResponse ? ` | Reply: ${c.clientResponse}` : ''),
      });
    });

    leadFollowUps.forEach((f) => {
      events.push({
        id: f.id,
        type: 'followup',
        title: `Follow-up Task (${f.priority})`,
        date: f.dueDate,
        description: f.notes + (f.completed ? ' [Completed]' : ''),
      });
    });

    leadProposals.forEach((p) => {
      events.push({
        id: p.id,
        type: 'proposal',
        title: `Proposal: ${p.title} (${formatCurrency(p.proposalAmount, p.currency)})`,
        date: p.sentDate,
        description: `Status: ${p.status} | Scope: ${p.scopeSummary}`,
      });
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const notifications = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'urgent' | 'warning' | 'info' | 'success';
      title: string;
      message: string;
      date: string;
      actionTab?: string;
    }> = [];

    followUps
      .filter((f) => !f.completed)
      .forEach((f) => {
        if (f.dueDate < TODAY_DATE) {
          list.push({
            id: `notif-overdue-${f.id}`,
            type: 'urgent',
            title: `Overdue Follow-up: ${f.businessName}`,
            message: `Task due on ${f.dueDate} is pending (${f.notes}).`,
            date: f.dueDate,
            actionTab: 'followups',
          });
        } else if (f.dueDate === TODAY_DATE) {
          list.push({
            id: `notif-today-${f.id}`,
            type: 'warning',
            title: `Follow-up Due Today: ${f.businessName}`,
            message: `Action required with ${f.contactPerson} via ${f.contactMethod}.`,
            date: f.dueDate,
            actionTab: 'followups',
          });
        }
      });

    return list;
  }, [followUps]);

  return (
    <CRMContext.Provider
      value={{
        currentUser,
        logout,
        login,
        leads,
        allLeads: leads,
        clients,
        projects,
        payments,
        proposals,
        communications,
        followUps,
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
        actionNotice,
        setActionNotice,
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
        resetToSampleData,
        exportDataJSON,
        importDataJSON,
        kpis,
        isOwner,
        users: currentUser ? [currentUser] : [],
        assignableUsers: currentUser ? [currentUser] : [],
        addUser: () => currentUser || {
          id: 'USR-01',
          name: 'Md Shah Alam',
          email: 'dev.mdshahalam@gmail.com',
          password: 'Anas@2026',
          role: 'Owner',
          createdAt: new Date().toISOString(),
        },
        updateUser: () => {},
        deleteUser: () => true,
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
  if (!context) throw new Error('useCRM must be used within a CRMProvider');
  return context;
};
