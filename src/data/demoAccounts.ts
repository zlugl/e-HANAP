import { UserRole } from '../types';

export interface DemoAccountMeta {
  id: string;
  userId: string;
  role: UserRole;
  name: string;
  email: string;
  password: string;
  roleLabel: string;
  badge: string;
  badgeColor: 'amber' | 'blue' | 'emerald' | 'indigo' | 'purple';
  subtitle: string;
  description: string;
  avatar: string;
  industryCategory?: string;
  companyName?: string;
  sampleVacancies?: string[];
  highlights: string[];
  flowSteps: string[];
}

export const DEMO_ACCOUNTS: DemoAccountMeta[] = [
  // 1. PESO ADMIN DEMO ACCOUNT
  {
    id: 'demo-peso-admin',
    userId: 'user-peso-admin-01',
    role: 'admin',
    name: 'Hon. Roberto D. Alvarez',
    email: 'peso.admin@roxas.gov.ph',
    password: 'password123',
    roleLabel: 'Municipal PESO Administrator',
    badge: 'Single LGU/PESO Monitor Account',
    badgeColor: 'amber',
    subtitle: 'Public Employment Service Office — Roxas, Oriental Mindoro',
    description: 'The sole centralized administrator account for municipal labor market oversight, employer compliance review, referral slip issuance, and LRA coordination.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    companyName: 'Municipal PESO Roxas Office',
    industryCategory: 'Government & Public Administration',
    highlights: [
      'Employer Accreditation Verification & Document Auditing',
      'Official PESO Referral Slip Issuance with Barcode/QR',
      'LRA Event Planning & Multi-Establishment Job Fairs',
      'Municipal Employment Demographics & TESDA Skills Gap Reports'
    ],
    flowSteps: [
      'Review pending employer permits (Mayor’s Permit, DTI, BIR)',
      'Generate official Referral Slips for verified candidates',
      'Track Local Recruitment Activities (LRA) across barangays',
      'Audit algorithmic Decision Tree matches and hire endorsements'
    ]
  },

  // 2. EMPLOYER DEMO ACCOUNT: PUREGOLD (Retail & Supermarket — Cashier & Bagger)
  {
    id: 'demo-emp-puregold',
    userId: 'user-emp-puregold-01',
    role: 'employer',
    name: 'Eduardo Manalo',
    email: 'puregold.roxas@employer.ph',
    password: 'password123',
    roleLabel: 'Employer: Retail & Supermarket (Puregold)',
    badge: 'Puregold Price Club (Roxas)',
    badgeColor: 'emerald',
    subtitle: 'Puregold Price Club Inc. — Roxas Commercial District Branch',
    description: 'Major hypermarket chain in Roxas hiring for essential frontline retail positions: Point of Sale (POS) Cashiers and Grocery Baggers / Courtesy Clerks.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    companyName: 'Puregold Price Club (Roxas Branch)',
    industryCategory: 'Customer Service & Retail',
    sampleVacancies: ['Supermarket Cashier (POS Operator)', 'Grocery Bagger & Courtesy Clerk'],
    highlights: [
      'Active Openings: Supermarket Cashier & Grocery Bagger',
      'PESO-Accredited Business Permit: BP-ROXAS-2026-0188',
      'Welcoming High School Grads & Out-of-School Youth (OSY)',
      'Direct interview scheduling and instant status updates'
    ],
    flowSteps: [
      'Post and manage Supermarket Cashier & Bagger vacancies',
      'Review ranked applicant profiles by Decision Tree alignment',
      'Request PESO Referral Slips and schedule in-store interviews',
      'Mark candidates as Hired to sync with LGU employment figures'
    ]
  },

  // 3. EMPLOYER DEMO ACCOUNT: TECHNOLOGY (Software & IT Solutions)
  {
    id: 'demo-emp-tech',
    userId: 'user-emp-tech-01',
    role: 'employer',
    name: 'Engr. Patrick Dave Villanueva',
    email: 'tech.innovations@employer.ph',
    password: 'password123',
    roleLabel: 'Employer: Technology & Software',
    badge: 'Mindoro Tech Innovations',
    badgeColor: 'indigo',
    subtitle: 'Mindoro Tech Innovations & Solutions — Paclasan, Roxas',
    description: 'Regional software development and IT infrastructure studio hiring Full-Stack Web Developers and Technical Support Specialists in Oriental Mindoro.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    companyName: 'Mindoro Tech Innovations & Solutions',
    industryCategory: 'Information Technology & Software',
    sampleVacancies: ['Junior Full-Stack Web Developer', 'IT Support & Systems Specialist'],
    highlights: [
      'Active Openings: Web Developer & IT Support Specialist',
      'Targeting BS Computer Science & BSIT graduates',
      'Hybrid work setup (Paclasan Office + Remote days)',
      'Automated technical skill validation with ATS resume parsing'
    ],
    flowSteps: [
      'Examine candidate tech stacks (React, TypeScript, Node.js, SQL)',
      'Review ATS resume scan breakdown and match percentages',
      'Schedule technical interviews or coding assessments',
      'Issue job offers and manage digital onboarding files'
    ]
  },

  // 4. EMPLOYER DEMO ACCOUNT: AGRICULTURE (Highland Farms & Agri-Ventures)
  {
    id: 'demo-emp-agri',
    userId: 'user-emp-agri-01',
    role: 'employer',
    name: 'Don Ramon S. Ilustre',
    email: 'agri.ventures@employer.ph',
    password: 'password123',
    roleLabel: 'Employer: Agriculture & Agribusiness',
    badge: 'Roxas Highland Agro-Farms',
    badgeColor: 'emerald',
    subtitle: 'Roxas Highland Agro-Farms & Agri-Ventures Corp. — San Vicente',
    description: 'Sustainable agricultural producer operating hybrid rice fields, calamansi orchards, and greenhouse vegetable facilities in Roxas, Oriental Mindoro.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    companyName: 'Roxas Highland Agro-Farms & Agri-Ventures',
    industryCategory: 'Agriculture & Agribusiness',
    sampleVacancies: ['Agricultural Field Supervisor', 'Greenhouse Harvester & Sorting Technician'],
    highlights: [
      'Active Openings: Farm Operations Supervisor & Crop Harvester',
      'Sustainable organic farming and export-grade produce',
      'Priority hiring for local farming communities & OSY youth',
      'Coordination with Municipal Agriculture Office (MAO) & PESO'
    ],
    flowSteps: [
      'Manage agricultural job posts with seasonal demand tags',
      'Review candidates with agricultural degrees or hands-on farm experience',
      'Coordinate community walk-in recruitment with PESO officers',
      'Record hired agricultural workforce for municipal agricultural statistics'
    ]
  },

  // 5. EMPLOYER DEMO ACCOUNT: SALES & COMMERCIAL (Department Store & Boutique — Saleslady)
  {
    id: 'demo-emp-sales',
    userId: 'user-emp-sales-01',
    role: 'employer',
    name: 'Clarissa Mae Mendoza',
    email: 'sales.central@employer.ph',
    password: 'password123',
    roleLabel: 'Employer: Retail & Sales (Saleslady Boutique)',
    badge: 'Roxas Central Boutique',
    badgeColor: 'purple',
    subtitle: 'Roxas Central Department Store & Fashion Boutique — Poblacion',
    description: 'Town center fashion retail establishment hiring Retail Salesladies and Store Promodisers for footwear, cosmetics, and apparel departments.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    companyName: 'Roxas Central Department Store & Boutique',
    industryCategory: 'Customer Service & Retail',
    sampleVacancies: ['Retail Saleslady / Store Sales Associate', 'Store Promodiser & Brand Ambassador'],
    highlights: [
      'Active Openings: Retail Saleslady & Store Promodiser',
      'Located at town commercial strip in San Aquilino / Poblacion',
      'Attractive daily allowance + monthly sales commission incentives',
      'Open to High School graduates with friendly customer demeanor'
    ],
    flowSteps: [
      'Manage Saleslady and Store Promodiser postings',
      'Screen customer-service skills and verbal communication readiness',
      'Organize quick in-person walk-in interviews at the boutique',
      'Endorse candidate selections to PESO for official placement documentation'
    ]
  }
];

export function getDemoAccountByEmail(email: string): DemoAccountMeta | undefined {
  return DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase().trim());
}

export function getDemoAccountById(id: string): DemoAccountMeta | undefined {
  return DEMO_ACCOUNTS.find(a => a.id === id || a.userId === id);
}
