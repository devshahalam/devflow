import {
  AppUser,
  Client,
  Communication,
  FollowUp,
  FreelancerProfile,
  Lead,
  Payment,
  Project,
  Proposal,
  Service,
} from '../types/crm';

export const initialUsers: AppUser[] = [
  {
    id: 'USR-01',
    name: 'Md Shah Alam',
    email: 'shahalam.wordpress@gmail.com',
    password: 'Anas@2026',
    role: 'Owner',
    createdAt: '2026-08-01T00:00:00Z',
  },
];

export const initialServices: Service[] = [
  {
    id: 'SRV-01',
    name: 'WordPress Website',
    category: 'Full Website',
    defaultPrice: 850,
    currency: 'USD',
    description: 'Custom 5-page business WordPress website with clean UI, responsive layout, and SEO setup.',
  },
  {
    id: 'SRV-02',
    name: 'WordPress Website Redesign',
    category: 'Redesign',
    defaultPrice: 950,
    currency: 'USD',
    description: 'Modern redesign of outdated WordPress sites for higher conversion and speed.',
  },
  {
    id: 'SRV-03',
    name: 'Elementor Website',
    category: 'Page Builder',
    defaultPrice: 700,
    currency: 'USD',
    description: 'Pixel-perfect, easy-to-edit Elementor Pro business website with custom templates.',
  },
  {
    id: 'SRV-04',
    name: 'WooCommerce Store',
    category: 'E-Commerce',
    defaultPrice: 1400,
    currency: 'USD',
    description: 'Full eCommerce store setup with payment gateways, product catalog, and checkout optimization.',
  },
  {
    id: 'SRV-05',
    name: 'Landing Page Design',
    category: 'Conversion',
    defaultPrice: 450,
    currency: 'USD',
    description: 'High-converting single sales or lead-gen landing page with fast load time.',
  },
  {
    id: 'SRV-06',
    name: 'Website Speed Optimization',
    category: 'Performance',
    defaultPrice: 250,
    currency: 'USD',
    description: 'Core Web Vitals optimization, 90+ Google PageSpeed score, caching & image compression.',
  },
  {
    id: 'SRV-07',
    name: 'WordPress Bug Fix & Recovery',
    category: 'Maintenance',
    defaultPrice: 180,
    currency: 'USD',
    description: 'White screen of death, plugin conflict resolution, and emergency recovery.',
  },
  {
    id: 'SRV-08',
    name: 'Custom E-Commerce (Bangladesh)',
    category: 'Local E-Commerce',
    defaultPrice: 35000,
    currency: 'BDT',
    description: 'WooCommerce store with bKash, Nagad, SSLCommerz gateway and Steadfast courier sync.',
  },
];

export const initialProfile: FreelancerProfile = {
  name: 'Md Shah Alam',
  businessName: 'Alam Digital Web Studio',
  email: 'shahalam.wordpress@gmail.com',
  phone: '+880 1712 345678',
  defaultCurrency: 'USD',
  whatsappTemplate: 'Hi {contact}, thank you for connecting! Following up on your website request for {business}. When is a good time for a quick 5-minute chat?',
  defaultFollowupDays: 3,
};

export const initialClients: Client[] = [];
export const initialProjects: Project[] = [];
export const initialPayments: Payment[] = [];
export const initialProposals: Proposal[] = [];
export const initialLeads: Lead[] = [];
export const initialFollowUps: FollowUp[] = [];
export const initialCommunications: Communication[] = [];
