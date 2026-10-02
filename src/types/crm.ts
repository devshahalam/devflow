export type LeadStatus =
  | 'New Lead'
  | 'Contacted'
  | 'Replied'
  | 'Interested'
  | 'Proposal'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type LeadSource =
  | 'Google Maps'
  | 'Facebook'
  | 'Instagram'
  | 'WhatsApp'
  | 'Cold Email'
  | 'Cold Call'
  | 'Upwork'
  | 'Fiverr'
  | 'LinkedIn'
  | 'Twitter'
  | 'Referral'
  | 'Website'
  | 'Other';

export type ContactMethod =
  | 'WhatsApp'
  | 'Facebook'
  | 'Instagram'
  | 'Twitter'
  | 'Email'
  | 'Phone'
  | 'LinkedIn'
  | 'Upwork'
  | 'Other';

export type MessageType =
  | 'Introduction'
  | 'Service Offer'
  | 'Website Audit'
  | 'Follow-up'
  | 'Price Discussion'
  | 'Proposal'
  | 'Payment'
  | 'Project Update'
  | 'Other';

export type ProposalStatus =
  | 'Draft'
  | 'Sent'
  | 'Viewed'
  | 'Negotiating'
  | 'Accepted'
  | 'Rejected'
  | 'Expired';

export type ProjectStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Waiting for Client'
  | 'Review'
  | 'Completed'
  | 'Cancelled';

export type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Fully Paid' | 'Overdue';

export type PaymentMethod =
  | 'Bank Transfer'
  | 'bKash / Nagad'
  | 'Stripe'
  | 'PayPal'
  | 'Wise'
  | 'Payoneer'
  | 'Cash'
  | 'Other';

export type Currency = 'USD' | 'BDT';

export type UserRole = 'Owner' | 'Team Leader' | 'Member';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  teamLeaderId?: string;
  assignedLeadsCount?: number;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  defaultPrice: number;
  currency?: Currency;
  description: string;
}

export interface Communication {
  id: string;
  leadId: string;
  clientId?: string | null;
  date: string; // ISO string
  contactMethod: ContactMethod;
  messageType: MessageType;
  messageSent: string;
  clientResponse?: string;
  responseDate?: string;
  notes?: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  clientId?: string | null;
  businessName: string;
  contactPerson: string;
  contactMethod: ContactMethod;
  dueDate: string; // YYYY-MM-DD
  notes: string;
  completed: boolean;
  completedAt?: string;
  outcomeNotes?: string;
  priority: Priority;
  leadStatus: LeadStatus;
  assignedTo?: string;
  createdAt: string;
}

export interface Proposal {
  id: string;
  leadId?: string | null;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  title: string;
  proposalAmount: number;
  currency: Currency;
  sentDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  status: ProposalStatus;
  scopeSummary: string;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  projectId: string;
  clientId: string;
  clientName: string;
  projectName: string;
  amount: number;
  currency: Currency;
  paymentDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  invoiceNumber: string;
  notes?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  leadId?: string | null;
  projectName: string;
  serviceId: string;
  serviceName: string;
  projectValue: number;
  currency: Currency;
  startDate: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD
  status: ProjectStatus;
  notes?: string;
  assignedTo?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  leadId?: string | null;
  businessName: string;
  contactPerson: string;
  businessCategory: string;
  email: string;
  whatsapp: string;
  website: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  country: string;
  city: string;
  currency: Currency;
  notes?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  businessName: string;
  contactPerson: string;
  businessCategory: string;
  country: string;
  city: string;
  email: string;
  whatsapp: string;
  facebook: string;
  facebookProfile?: string;
  instagram?: string;
  twitter?: string;
  website: string;
  leadSource: LeadSource;
  serviceId: string;
  serviceName: string;
  status: LeadStatus;
  priority: Priority;
  dealValue?: number; // Optional on initial contact!
  currency: Currency;
  paymentStatus: PaymentStatus;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  contactMethod?: ContactMethod;
  notes?: string;
  clientId?: string | null;
  assignedTo?: string; // AppUser ID
  createdAt: string;
  updatedAt: string;
}

export interface FreelancerProfile {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  defaultCurrency: Currency;
  whatsappTemplate: string;
  defaultFollowupDays: number;
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'contact' | 'response' | 'followup' | 'proposal' | 'won' | 'project' | 'payment' | 'note';
  title: string;
  description: string;
  badge?: string;
  amount?: number;
  currency?: Currency;
}
