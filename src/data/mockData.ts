import { 
  User, 
  EmployerProfile, 
  JobSeekerProfile, 
  JobPost, 
  Application, 
  Interview, 
  NotificationItem, 
  AuditLog, 
  SystemAnnouncement,
  JobAlertSubscription,
  ChatConversation,
  ChatMessage,
  ProfileViewEvent,
  CompanyReview
} from '../types';

export const ROXAS_MUNICIPALITY = "Roxas, Oriental Mindoro";

// Active Barangays in Roxas for precise local placement
export const ROXAS_BARANGAYS = [
  "Bagumbayan",
  "Cantil",
  "Dangay",
  "Happy Valley",
  "Libertad",
  "Mabuhay",
  "Marugdug",
  "Odiong",
  "Paclasan",
  "San Aquilino",
  "San Isidro",
  "San Jose",
  "San Mariano",
  "San Rafael",
  "San Vicente",
  "Victoria"
];

// Single active municipality array for current Roxas PESO pilot scope
export const ORIENTAL_MINDORO_MUNICIPALITIES = [
  "Roxas"
];

export const JOB_CATEGORIES = [
  "Information Technology & Software",
  "Business, Accounting & Finance",
  "Agriculture & Agribusiness",
  "Tourism, Hotel & Restaurant",
  "Engineering & Construction",
  "Healthcare, Nursing & Medical",
  "Education & Academic Services",
  "Customer Service & Retail",
  "Government & Public Administration",
];

export const SKILLS_DATABASE = [
  "JavaScript", "React.js", "Node.js", "Express.js", "SQL", "PostgreSQL", "HTML/CSS", "Tailwind CSS",
  "Accountancy", "Bookkeeping", "Financial Analysis", "Auditing", "Taxation", "QuickBooks", "Microsoft Excel",
  "Agronomy", "Crop Management", "Pest & Disease Control", "Organic Farming", "Agribusiness Marketing", "Soil Analysis",
  "Port Operations", "Logistics Coordination", "Supply Chain", "Warehouse Management", "Freight Dispatch",
  "Hotel Operations", "Front Desk Reception", "Food & Beverage", "Event Coordination", "Tour Guiding", "Customer Service",
  "Civil Engineering", "AutoCAD", "Structural Design", "Construction Management", "Project Scheduling", "Site Safety",
  "Nursing", "Patient Assessment", "First Aid & CPR", "Medical Records", "Public Health",
  "Secondary Teaching", "Curriculum Design", "Classroom Management", "Educational Technology",
  "Communication", "Problem Solving", "Team Leadership", "Time Management", "Critical Thinking", "Adaptability",
  "Cash Handling", "POS Operation", "Package Handling", "Product Presentation", "Active Selling"
];

// INITIAL USERS: PESO Admin, Employers (Puregold, Tech, Agri, Sales), and Candidate
export const INITIAL_USERS: User[] = [
  // 1. PESO Admin
  {
    id: 'user-peso-admin-01',
    email: 'peso.admin@roxas.gov.ph',
    role: 'admin',
    name: 'Hon. Roberto D. Alvarez',
    phone: '+63 917 890 1234',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    isAccountVerified: true,
    createdAt: '2026-01-10T08:00:00Z',
    password: 'password123'
  } as User & { password?: string },

  // 2. Puregold Employer (Cashier & Bagger)
  {
    id: 'user-emp-puregold-01',
    email: 'puregold.roxas@employer.ph',
    role: 'employer',
    name: 'Eduardo Manalo',
    phone: '+63 928 555 4321',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    isAccountVerified: true,
    createdAt: '2026-01-15T08:00:00Z',
    password: 'password123'
  } as User & { password?: string },

  // 3. Technology Employer (Software & IT)
  {
    id: 'user-emp-tech-01',
    email: 'tech.innovations@employer.ph',
    role: 'employer',
    name: 'Engr. Patrick Dave Villanueva',
    phone: '+63 919 444 8765',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    isAccountVerified: true,
    createdAt: '2026-01-18T08:00:00Z',
    password: 'password123'
  } as User & { password?: string },

  // 4. Agriculture Employer (Agro-Farms & Agri-Ventures)
  {
    id: 'user-emp-agri-01',
    email: 'agri.ventures@employer.ph',
    role: 'employer',
    name: 'Don Ramon S. Ilustre',
    phone: '+63 920 333 9988',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    isAccountVerified: true,
    createdAt: '2026-01-20T08:00:00Z',
    password: 'password123'
  } as User & { password?: string },

  // 5. Commercial Sales Employer (Department Store & Boutique - Saleslady)
  {
    id: 'user-emp-sales-01',
    email: 'sales.central@employer.ph',
    role: 'employer',
    name: 'Clarissa Mae Mendoza',
    phone: '+63 927 666 1122',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    isAccountVerified: true,
    createdAt: '2026-01-22T08:00:00Z',
    password: 'password123'
  } as User & { password?: string },

  // 6. Registered Job Seeker (Juan Dela Cruz)
  {
    id: 'user-seeker-juan-01',
    email: 'juan.delacruz@jobseeker.ph',
    role: 'job_seeker',
    name: 'Juan Dela Cruz',
    phone: '+63 918 111 2233',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    isAccountVerified: true,
    isProfileCompleted: true,
    createdAt: '2026-01-25T08:00:00Z',
    password: 'password123'
  } as User & { password?: string },

  // 7. Completed Job Seeker (poqiq75)
  {
    id: 'user-seeker-poqiq-75',
    email: 'poqiq75@gmail.com',
    role: 'job_seeker',
    name: 'Poqiq Roxas',
    phone: '+63 917 555 7788',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    isAccountVerified: true,
    isProfileCompleted: true,
    createdAt: '2026-02-10T08:00:00Z',
    password: 'password123'
  } as User & { password?: string },

  // 8. Completed Job Seeker (Maria Santos - Retail & Sales)
  {
    id: 'user-seeker-maria-02',
    email: 'maria.santos@jobseeker.ph',
    role: 'job_seeker',
    name: 'Maria Santos',
    phone: '+63 917 888 4433',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    isAccountVerified: true,
    isProfileCompleted: true,
    createdAt: '2026-02-05T08:00:00Z',
    password: 'password123'
  } as User & { password?: string },

  // 9. Completed Job Seeker (Mark Villanueva - Agriculture & Logistics)
  {
    id: 'user-seeker-mark-03',
    email: 'mark.villanueva@jobseeker.ph',
    role: 'job_seeker',
    name: 'Mark Villanueva',
    phone: '+63 920 777 5566',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    isAccountVerified: true,
    isProfileCompleted: true,
    createdAt: '2026-02-08T08:00:00Z',
    password: 'password123'
  } as User & { password?: string }
];

// INITIAL EMPLOYERS: Puregold, Mindoro Tech, Roxas Highland Agro-Farms, Central Boutique
export const INITIAL_EMPLOYERS: EmployerProfile[] = [
  // 1. Puregold Price Club (Roxas Branch)
  {
    id: 'emp-puregold-01',
    userId: 'user-emp-puregold-01',
    companyName: 'Puregold Price Club (Roxas Branch)',
    representativeName: 'Eduardo Manalo',
    contactNumber: '+63 928 555 4321',
    email: 'puregold.roxas@employer.ph',
    address: 'National Highway, Brgy. Bagumbayan',
    municipality: 'Roxas',
    barangay: 'Bagumbayan',
    industry: 'Customer Service & Retail',
    establishmentType: 'local_established',
    companyDescription: 'Premier nationwide hypermarket retail chain operating in Roxas, Oriental Mindoro, serving local households with groceries, food supply, and retail merchandise.',
    logoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&auto=format&fit=crop&q=80',
    status: 'verified',
    isProfileCompleted: true,
    profileSetupCompletedAt: '2026-01-16T09:00:00Z',
    authorizedBranchManager: 'Eduardo Manalo',
    hrContactPerson: 'Liza Santos (HR Specialist)',
    hrContactNumber: '+63 928 555 4322',
    businessPermitNo: 'BP-ROXAS-2026-0188',
    dtiSecRegistration: 'SEC-CS200612984',
    requirementsSubmitted: true,
    submittedRequirements: ['mayors_permit', 'dti_sec', 'sanitary_permit', 'bir_2303'],
    createdAt: '2026-01-15T08:00:00Z'
  },

  // 2. Mindoro Tech Innovations & Solutions
  {
    id: 'emp-tech-01',
    userId: 'user-emp-tech-01',
    companyName: 'Mindoro Tech Innovations & Solutions',
    representativeName: 'Engr. Patrick Dave Villanueva',
    contactNumber: '+63 919 444 8765',
    email: 'tech.innovations@employer.ph',
    address: '2nd Floor, Commercial Hub, Brgy. Paclasan',
    municipality: 'Roxas',
    barangay: 'Paclasan',
    industry: 'Information Technology & Software',
    establishmentType: 'local_established',
    companyDescription: 'Pioneering IT solutions provider and software consultancy in Southern Oriental Mindoro specializing in cloud workflows, local business digitalization, and web application development.',
    logoUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&auto=format&fit=crop&q=80',
    status: 'verified',
    isProfileCompleted: true,
    profileSetupCompletedAt: '2026-01-19T09:00:00Z',
    authorizedBranchManager: 'Engr. Patrick Dave Villanueva',
    hrContactPerson: 'Rona Marie Cruz',
    hrContactNumber: '+63 919 444 8766',
    businessPermitNo: 'BP-ROXAS-2026-0312',
    dtiSecRegistration: 'DTI-OM-2023-88912',
    requirementsSubmitted: true,
    submittedRequirements: ['mayors_permit', 'dti_sec', 'bir_2303'],
    createdAt: '2026-01-18T08:00:00Z'
  },

  // 3. Roxas Highland Agro-Farms & Agri-Ventures Corp.
  {
    id: 'emp-agri-01',
    userId: 'user-emp-agri-01',
    companyName: 'Roxas Highland Agro-Farms & Agri-Ventures',
    representativeName: 'Don Ramon S. Ilustre',
    contactNumber: '+63 920 333 9988',
    email: 'agri.ventures@employer.ph',
    address: 'KM 14, Sitio Highland, Brgy. San Vicente',
    municipality: 'Roxas',
    barangay: 'San Vicente',
    industry: 'Agriculture & Agribusiness',
    establishmentType: 'local_established',
    companyDescription: 'Sustainable agri-farming enterprise producing high-value hybrid rice, calamansi citrus, dragonfruit orchards, and greenhouse vegetables across Oriental Mindoro.',
    logoUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=200&auto=format&fit=crop&q=80',
    status: 'verified',
    isProfileCompleted: true,
    profileSetupCompletedAt: '2026-01-21T09:00:00Z',
    authorizedBranchManager: 'Don Ramon S. Ilustre',
    hrContactPerson: 'Manuel Dimaano (Farm Administrator)',
    hrContactNumber: '+63 920 333 9989',
    businessPermitNo: 'BP-ROXAS-2026-0095',
    dtiSecRegistration: 'CDA-COOP-ROXAS-041',
    requirementsSubmitted: true,
    submittedRequirements: ['mayors_permit', 'dti_sec', 'sanitary_permit', 'bir_2303'],
    createdAt: '2026-01-20T08:00:00Z'
  },

  // 4. Roxas Central Department Store & Boutique (Saleslady)
  {
    id: 'emp-sales-01',
    userId: 'user-emp-sales-01',
    companyName: 'Roxas Central Department Store & Boutique',
    representativeName: 'Clarissa Mae Mendoza',
    contactNumber: '+63 927 666 1122',
    email: 'sales.central@employer.ph',
    address: 'Poblacion Commercial Strip, Brgy. San Aquilino',
    municipality: 'Roxas',
    barangay: 'San Aquilino',
    industry: 'Customer Service & Retail',
    establishmentType: 'local_established',
    companyDescription: 'Prominent town center department store carrying fashion apparel, footwear, cosmetics, school gear, and homeware, providing friendly retail assistance to local shoppers.',
    logoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&auto=format&fit=crop&q=80',
    status: 'verified',
    isProfileCompleted: true,
    profileSetupCompletedAt: '2026-01-23T09:00:00Z',
    authorizedBranchManager: 'Clarissa Mae Mendoza',
    hrContactPerson: 'Geraldine Ocampo',
    hrContactNumber: '+63 927 666 1123',
    businessPermitNo: 'BP-ROXAS-2026-0442',
    dtiSecRegistration: 'DTI-OM-2022-77123',
    requirementsSubmitted: true,
    submittedRequirements: ['mayors_permit', 'dti_sec', 'bir_2303'],
    createdAt: '2026-01-22T08:00:00Z'
  }
];

// INITIAL JOB POSTS: Puregold (Cashier, Bagger), Tech (Developer, Support), Agri (Supervisor, Harvester), Sales (Saleslady, Promodiser)
export const INITIAL_JOB_POSTS: JobPost[] = [
  // 1. PUREGOLD: Cashier
  {
    id: 'job-puregold-cashier',
    employerId: 'emp-puregold-01',
    companyName: 'Puregold Price Club (Roxas Branch)',
    companyLogo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&auto=format&fit=crop&q=80',
    companyMunicipality: 'Roxas',
    companyVerified: true,
    title: 'Supermarket Cashier (POS Operator)',
    category: 'Customer Service & Retail',
    description: 'We are seeking dependable and customer-friendly Supermarket Cashiers to operate our Point of Sale (POS) checkout stations. Responsibilities include item scanning, collecting cash/digital payments, issuing accurate change and receipts, and maintaining high checkout accuracy.',
    responsibilities: [
      'Accurately scan grocery items and operate electronic cash registers / POS terminals',
      'Process payments via cash, GCash, debit/credit cards, and loyalty gift certificates',
      'Balance cash drawer at start and end of shifts and maintain receipt tape rolls',
      'Provide warm, courteous greetings and assist shoppers with membership inquiries'
    ],
    employmentType: 'Full-time',
    workLocation: 'Puregold Roxas, Brgy. Bagumbayan',
    municipality: 'Roxas',
    vacanciesCount: 4,
    salaryRange: '₱12,000 - ₱15,500 / month',
    applicationDeadline: '2026-11-30',
    postedDate: '2026-02-01',
    status: 'active',
    targetApplicantType: 'High School Graduate',
    deploymentLocationType: 'local',
    minEducationalAttainment: 'High School Graduate',
    preferredDegree: 'High School / Vocational / College Level',
    degreeImportance: 'optional',
    requiredSkills: ['Cash Handling', 'POS Operation', 'Customer Service', 'Basic Math'],
    preferredSkills: ['Inventory Counting', 'Barcode Scanning', 'Communication'],
    minExperienceYears: 0,
    experienceImportance: 'optional',
    requiredCertifications: [],
    technicalSkills: ['POS Terminal Operation', 'Cash Counting', 'Receipt Verification'],
    softSkills: ['Honesty', 'Friendly Demeanor', 'Punctuality', 'Attention to Detail'],
    otherQualifications: 'Good moral character, willing to work in shifting schedules including weekends.',
    requirements: [
      { id: 'req-pg-c-1', category: 'education', title: 'Minimum Education', importance: 'required', value: 'High School Graduate' },
      { id: 'req-pg-c-2', category: 'skill', title: 'Cash Handling & POS', importance: 'required', value: 'Cash Handling' },
      { id: 'req-pg-c-3', category: 'skill', title: 'Customer Courtesy', importance: 'required', value: 'Customer Service' }
    ]
  },

  // 2. PUREGOLD: Grocery Bagger
  {
    id: 'job-puregold-bagger',
    employerId: 'emp-puregold-01',
    companyName: 'Puregold Price Club (Roxas Branch)',
    companyLogo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&auto=format&fit=crop&q=80',
    companyMunicipality: 'Roxas',
    companyVerified: true,
    title: 'Grocery Bagger & Courtesy Clerk',
    category: 'Customer Service & Retail',
    description: 'Looking for energetic and service-oriented individuals to assist customers at checkout lanes. Responsible for carefully packaging groceries by category and weight, assisting senior citizens and shoppers with their cart loads, and retrieving shopping carts.',
    responsibilities: [
      'Carefully bag groceries into designated biodegradable bags ensuring eggs and bread are on top',
      'Assist customers with push carts toward vehicles, motorcycles, or local tricycles',
      'Conduct regular sweeps of the parking and entrance areas to return shopping carts',
      'Support retail stockers with shelf replenishment and floor cleanliness during downtime'
    ],
    employmentType: 'Full-time',
    workLocation: 'Puregold Roxas, Brgy. Bagumbayan',
    municipality: 'Roxas',
    vacanciesCount: 6,
    salaryRange: '₱11,500 - ₱13,500 / month',
    applicationDeadline: '2026-11-30',
    postedDate: '2026-02-02',
    status: 'active',
    targetApplicantType: 'Out-of-School Youth',
    deploymentLocationType: 'local',
    minEducationalAttainment: 'High School Graduate',
    preferredDegree: 'High School Graduate or Out-of-School Youth',
    degreeImportance: 'optional',
    requiredSkills: ['Package Handling', 'Customer Courteousness', 'Physical Stamina', 'Teamwork'],
    preferredSkills: ['Stock Stacking', 'Merchandising'],
    minExperienceYears: 0,
    experienceImportance: 'optional',
    requiredCertifications: [],
    technicalSkills: ['Item Weight Distribution', 'Cart Management'],
    softSkills: ['Helpfulness', 'Physical Agility', 'Polite Communication', 'Reliability'],
    otherQualifications: 'Physically fit, active, and eager to learn retail supermarket operations.',
    requirements: [
      { id: 'req-pg-b-1', category: 'education', title: 'Minimum Education', importance: 'required', value: 'High School Level / Graduate' },
      { id: 'req-pg-b-2', category: 'skill', title: 'Customer Courteousness', importance: 'required', value: 'Customer Courteousness' },
      { id: 'req-pg-b-3', category: 'skill', title: 'Physical Stamina', importance: 'required', value: 'Physical Stamina' }
    ]
  },

  // 3. TECHNOLOGY: Junior Full-Stack Web Developer
  {
    id: 'job-tech-developer',
    employerId: 'emp-tech-01',
    companyName: 'Mindoro Tech Innovations & Solutions',
    companyLogo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&auto=format&fit=crop&q=80',
    companyMunicipality: 'Roxas',
    companyVerified: true,
    title: 'Junior Full-Stack Web Developer',
    category: 'Information Technology & Software',
    description: 'We are expanding our software engineering team in Roxas! You will build and maintain modern web applications, client portals, and cloud integrations using React, TypeScript, Node.js, and SQL databases.',
    responsibilities: [
      'Build responsive, intuitive UI components using React, TypeScript, and Tailwind CSS',
      'Implement RESTful backend API routes, middleware, and database schemas with Node.js & SQL',
      'Collaborate with UI designers, project managers, and local clients to deliver software features',
      'Participate in agile sprint reviews, git version control, and automated software testing'
    ],
    employmentType: 'Full-time',
    workLocation: 'Paclasan Commercial Hub, Roxas (Hybrid)',
    municipality: 'Roxas',
    vacanciesCount: 2,
    salaryRange: '₱22,000 - ₱30,000 / month',
    applicationDeadline: '2026-11-15',
    postedDate: '2026-02-05',
    status: 'active',
    targetApplicantType: 'College Graduate',
    deploymentLocationType: 'local',
    minEducationalAttainment: "Bachelor's Degree",
    preferredDegree: 'BS Computer Science or BS Information Technology',
    degreeImportance: 'required',
    requiredSkills: ['React.js', 'JavaScript', 'TypeScript', 'Node.js', 'SQL', 'HTML/CSS'],
    preferredSkills: ['Tailwind CSS', 'Git', 'PostgreSQL', 'REST APIs'],
    minExperienceYears: 1,
    experienceImportance: 'preferred',
    requiredCertifications: [],
    technicalSkills: ['React.js', 'TypeScript', 'Node.js', 'Express.js', 'SQL', 'Git'],
    softSkills: ['Problem Solving', 'Critical Thinking', 'Team Collaboration', 'Fast Learner'],
    requirements: [
      { id: 'req-tech-d-1', category: 'degree', title: 'BS CS / BS IT Degree', importance: 'required', value: 'BS Computer Science or BSIT' },
      { id: 'req-tech-d-2', category: 'skill', title: 'React & TypeScript', importance: 'required', value: 'React.js' },
      { id: 'req-tech-d-3', category: 'skill', title: 'Backend & SQL', importance: 'required', value: 'Node.js' }
    ]
  },

  // 4. TECHNOLOGY: IT Support & Systems Specialist
  {
    id: 'job-tech-support',
    employerId: 'emp-tech-01',
    companyName: 'Mindoro Tech Innovations & Solutions',
    companyLogo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&auto=format&fit=crop&q=80',
    companyMunicipality: 'Roxas',
    companyVerified: true,
    title: 'IT Support & Systems Specialist',
    category: 'Information Technology & Software',
    description: 'Provide frontline technical support, hardware setup, network LAN diagnostics, and software troubleshooting for commercial establishments and institutions in Roxas and nearby municipalities.',
    responsibilities: [
      'Install, assemble, and configure workstation PCs, printers, and network switches',
      'Diagnose hardware and software faults across Windows and Linux environments',
      'Set up structured LAN cabling, WiFi access points, and router security configurations',
      'Provide friendly desk-side and remote IT support to client staff'
    ],
    employmentType: 'Full-time',
    workLocation: 'Paclasan, Roxas (On-site & Field)',
    municipality: 'Roxas',
    vacanciesCount: 3,
    salaryRange: '₱16,000 - ₱20,000 / month',
    applicationDeadline: '2026-11-20',
    postedDate: '2026-02-06',
    status: 'active',
    targetApplicantType: 'College Graduate',
    deploymentLocationType: 'local',
    minEducationalAttainment: "Bachelor's Degree",
    preferredDegree: 'BSIT, Computer Engineering, or Associate in Computer Technology',
    degreeImportance: 'preferred',
    requiredSkills: ['Hardware Troubleshooting', 'Network Configuration', 'Technical Support', 'Windows OS'],
    preferredSkills: ['LAN Cabling', 'Router Setup', 'CCTV Maintenance'],
    minExperienceYears: 0,
    experienceImportance: 'optional',
    requiredCertifications: [],
    technicalSkills: ['Computer Assembly', 'Network Diagnostics', 'Printer Configuration'],
    softSkills: ['Patience', 'Customer Orientation', 'Clear Communication'],
    requirements: [
      { id: 'req-tech-s-1', category: 'education', title: 'Degree in Tech', importance: 'preferred', value: 'Associate or BS in IT/CompEng' },
      { id: 'req-tech-s-2', category: 'skill', title: 'Hardware Diagnostics', importance: 'required', value: 'Hardware Troubleshooting' }
    ]
  },

  // 5. AGRICULTURE: Agricultural Field Supervisor
  {
    id: 'job-agri-supervisor',
    employerId: 'emp-agri-01',
    companyName: 'Roxas Highland Agro-Farms & Agri-Ventures',
    companyLogo: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=200&auto=format&fit=crop&q=80',
    companyMunicipality: 'Roxas',
    companyVerified: true,
    title: 'Agricultural Field Supervisor & Farm Operations Lead',
    category: 'Agriculture & Agribusiness',
    description: 'Lead day-to-day operations across our agricultural landholdings in San Vicente, Roxas. Supervise crop cultivation, irrigation schedules, pest management, and harvest coordination for rice, citrus, and vegetables.',
    responsibilities: [
      'Direct daily assignments for agricultural field teams and equipment operators',
      'Oversee fertilization regimens, organic pest control, and drip irrigation scheduling',
      'Monitor crop health, soil nutrient levels, and yield forecasts in coordination with MAO',
      'Maintain farm production logs, harvest weights, and compliance with Good Agricultural Practices (GAP)'
    ],
    employmentType: 'Full-time',
    workLocation: 'KM 14, Sitio Highland, Brgy. San Vicente, Roxas',
    municipality: 'Roxas',
    vacanciesCount: 2,
    salaryRange: '₱18,000 - ₱24,000 / month',
    applicationDeadline: '2026-11-25',
    postedDate: '2026-02-08',
    status: 'active',
    targetApplicantType: 'College Graduate',
    deploymentLocationType: 'local',
    minEducationalAttainment: "Bachelor's Degree",
    preferredDegree: 'BS Agriculture, Agronomy, or Agribusiness Management',
    degreeImportance: 'required',
    requiredSkills: ['Agronomy', 'Crop Management', 'Farm Supervision', 'Pest & Disease Control', 'Soil Analysis'],
    preferredSkills: ['Organic Farming', 'Drip Irrigation', 'GAP Certification'],
    minExperienceYears: 1,
    experienceImportance: 'preferred',
    requiredCertifications: [],
    technicalSkills: ['Soil Nutrient Testing', 'Irrigation Engineering', 'Crop Yield Auditing'],
    softSkills: ['Leadership', 'Responsibility', 'Team Coordination'],
    requirements: [
      { id: 'req-agri-s-1', category: 'degree', title: 'BS Agriculture Degree', importance: 'required', value: 'BS Agriculture or Agronomy' },
      { id: 'req-agri-s-2', category: 'skill', title: 'Crop Management', importance: 'required', value: 'Crop Management' }
    ]
  },

  // 6. AGRICULTURE: Organic Greenhouse Harvester
  {
    id: 'job-agri-harvester',
    employerId: 'emp-agri-01',
    companyName: 'Roxas Highland Agro-Farms & Agri-Ventures',
    companyLogo: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=200&auto=format&fit=crop&q=80',
    companyMunicipality: 'Roxas',
    companyVerified: true,
    title: 'Organic Greenhouse Harvester & Sorting Technician',
    category: 'Agriculture & Agribusiness',
    description: 'Join our sustainable agricultural production team. Responsibilities include gentle hand-harvesting of vine vegetables and fruits, post-harvest sorting, washing, grading by size and quality, and crate packing.',
    responsibilities: [
      'Harvest mature produce following ripeness guidelines without damaging plants',
      'Sort and grade harvested crops according to quality standards and market sizing',
      'Package produce carefully in sanitized transport crates for local and regional delivery',
      'Keep greenhouse rows and packing facilities clean, sanitized, and pest-free'
    ],
    employmentType: 'Full-time',
    workLocation: 'San Vicente Agro-Park, Roxas',
    municipality: 'Roxas',
    vacanciesCount: 5,
    salaryRange: '₱11,000 - ₱14,000 / month',
    applicationDeadline: '2026-11-28',
    postedDate: '2026-02-09',
    status: 'active',
    targetApplicantType: 'Out-of-School Youth',
    deploymentLocationType: 'local',
    minEducationalAttainment: 'High School Graduate',
    preferredDegree: 'High School Graduate or Out-of-School Youth',
    degreeImportance: 'optional',
    requiredSkills: ['Crop Harvesting', 'Produce Grading', 'Physical Stamina', 'Attention to Detail'],
    preferredSkills: ['Post-Harvest Handling', 'Crate Stacking'],
    minExperienceYears: 0,
    experienceImportance: 'optional',
    requiredCertifications: [],
    technicalSkills: ['Harvest Sorting', 'Produce Inspection'],
    softSkills: ['Diligence', 'Physical Endurance', 'Punctuality'],
    requirements: [
      { id: 'req-agri-h-1', category: 'education', title: 'High School / OSY', importance: 'required', value: 'High School Graduate or OSY' },
      { id: 'req-agri-h-2', category: 'skill', title: 'Attention to Detail', importance: 'required', value: 'Attention to Detail' }
    ]
  },

  // 7. SALES: Retail Saleslady (Apparel & Footwear)
  {
    id: 'job-sales-lady',
    employerId: 'emp-sales-01',
    companyName: 'Roxas Central Department Store & Boutique',
    companyLogo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&auto=format&fit=crop&q=80',
    companyMunicipality: 'Roxas',
    companyVerified: true,
    title: 'Retail Saleslady / Store Sales Associate (Apparel & Footwear)',
    category: 'Customer Service & Retail',
    description: 'We are seeking an enthusiastic, friendly female Retail Saleslady to assist shoppers in our clothing, footwear, and boutique cosmetics section. You will welcome customers, help with size fitting, present new fashion arrivals, and ensure neat merchandise displays.',
    responsibilities: [
      'Warmly greet customers entering the fashion boutique and identify their shopping preferences',
      'Assist clients in selecting clothes, finding proper sizes, and trying on footwear',
      'Maintain organized, aesthetic displays on clothing racks, display tables, and mannequins',
      'Help achieve weekly store sales targets through active selling and promotional bundles'
    ],
    employmentType: 'Full-time',
    workLocation: 'San Aquilino Commercial Center, Roxas',
    municipality: 'Roxas',
    vacanciesCount: 4,
    salaryRange: '₱12,000 - ₱14,500 / month + Commission',
    applicationDeadline: '2026-11-20',
    postedDate: '2026-02-10',
    status: 'active',
    targetApplicantType: 'High School Graduate',
    deploymentLocationType: 'local',
    minEducationalAttainment: 'High School Graduate',
    preferredDegree: 'High School Graduate or College Level',
    degreeImportance: 'optional',
    requiredSkills: ['Customer Assistance', 'Product Presentation', 'Active Selling', 'Friendly Communication'],
    preferredSkills: ['Fashion Styling Advice', 'Visual Merchandising', 'Inventory Tagging'],
    minExperienceYears: 0,
    experienceImportance: 'optional',
    requiredCertifications: [],
    technicalSkills: ['Garment Sizing', 'Display Presentation', 'Inventory Tagging'],
    softSkills: ['Pleasant Personality', 'High Energy', 'Good Communication', 'Reliability'],
    otherQualifications: 'Pleasant and approachable personality, neat grooming, passionate about customer service.',
    requirements: [
      { id: 'req-sales-l-1', category: 'education', title: 'Minimum Education', importance: 'required', value: 'High School Graduate' },
      { id: 'req-sales-l-2', category: 'skill', title: 'Friendly Communication', importance: 'required', value: 'Friendly Communication' },
      { id: 'req-sales-l-3', category: 'skill', title: 'Active Selling', importance: 'required', value: 'Active Selling' }
    ]
  },

  // 8. SALES: Store Promodiser & Brand Ambassador
  {
    id: 'job-sales-promodiser',
    employerId: 'emp-sales-01',
    companyName: 'Roxas Central Department Store & Boutique',
    companyLogo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&auto=format&fit=crop&q=80',
    companyMunicipality: 'Roxas',
    companyVerified: true,
    title: 'Store Promodiser & Customer Brand Ambassador',
    category: 'Customer Service & Retail',
    description: 'Actively engage shoppers with product demonstrations, explain promotional discounts and seasonal sales, monitor shelf inventory depletion, and ensure high brand visibility on the retail sales floor.',
    responsibilities: [
      'Conduct engaging demonstrations and product explanations at promotional display booths',
      'Distribute promotional brochures and explain ongoing store bundle discounts to visitors',
      'Track fast-moving retail items and notify store supervisors when replenishment is needed',
      'Keep promotional booth stands clean, well-lit, and fully stocked with tester samples'
    ],
    employmentType: 'Full-time',
    workLocation: 'San Aquilino Commercial Center, Roxas',
    municipality: 'Roxas',
    vacanciesCount: 3,
    salaryRange: '₱12,500 - ₱15,000 / month',
    applicationDeadline: '2026-11-22',
    postedDate: '2026-02-11',
    status: 'active',
    targetApplicantType: 'High School Graduate',
    deploymentLocationType: 'local',
    minEducationalAttainment: 'High School Graduate',
    preferredDegree: 'High School Graduate or Vocational',
    degreeImportance: 'optional',
    requiredSkills: ['Brand Promotion', 'Customer Engagement', 'Product Demo', 'Stock Replenishment'],
    preferredSkills: ['Visual Merchandising', 'Sales Reporting'],
    minExperienceYears: 0,
    experienceImportance: 'optional',
    requiredCertifications: [],
    technicalSkills: ['Product Demonstration', 'Stock Rotation'],
    softSkills: ['Outgoing Personality', 'Confidence', 'Persuasiveness'],
    requirements: [
      { id: 'req-sales-p-1', category: 'education', title: 'Education', importance: 'required', value: 'High School Graduate' },
      { id: 'req-sales-p-2', category: 'skill', title: 'Customer Engagement', importance: 'required', value: 'Customer Engagement' }
    ]
  }
];

// INITIAL JOB SEEKER: Juan Dela Cruz
export const INITIAL_JOB_SEEKERS: JobSeekerProfile[] = [
  {
    id: 'seeker-juan-01',
    userId: 'user-seeker-juan-01',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    email: 'juan.delacruz@jobseeker.ph',
    contactNumber: '+63 918 111 2233',
    dateOfBirth: '2001-08-15',
    sex: 'Male',
    civilStatus: 'Single',
    address: 'Sitio Riverside, Brgy. Bagumbayan',
    municipality: 'Roxas',
    barangay: 'Bagumbayan',
    professionalSummary: 'Dependable graduate eager to contribute customer service and POS cashiering competencies.',
    educationalAttainment: "College Graduate",
    primaryDegree: 'BS Information Technology',
    educationCategory: 'College Graduate',
    employmentStatus: 'unemployed',
    profileCompleteness: 92,
    technicalSkills: ['Cash Handling', 'Customer Service', 'POS Operation', 'React.js', 'JavaScript', 'Hardware Troubleshooting'],
    softSkills: ['Friendly Communication', 'Punctuality', 'Problem Solving', 'Team Player'],
    tradeSkills: ['Computer Hardware Servicing', 'Cashiering'],
    practicalSkills: ['POS Terminal Operation', 'Customer Assistance', 'Inventory Checking'],
    education: [
      {
        id: 'edu-1',
        degreeCourse: 'BS Information Technology',
        school: 'Mindoro State University (MinSU)',
        yearGraduated: 2024,
        educationalAttainment: "Bachelor's Degree",
        honors: 'Dean’s Lister'
      }
    ],
    workExperience: [
      {
        id: 'exp-1',
        company: 'Roxas Local Retail & Services',
        position: 'Front Desk & Cashier Assistant',
        startDate: '2024-06-01',
        endDate: '2025-08-01',
        isCurrent: false,
        responsibilities: 'Handled customer cash and POS card payments, assisted with inventory counting, and provided IT printer setup.',
        yearsOfExperience: 1
      }
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'TESDA National Certificate II in Computer Systems Servicing',
        issuingOrganization: 'TESDA Oriental Mindoro',
        dateObtained: '2023-11-10'
      }
    ],
    resumes: [
      {
        id: 'res-1',
        fileName: 'Juan_Resume.pdf',
        fileSize: '1.2 MB',
        fileType: 'pdf',
        uploadedAt: '2026-01-25T08:00:00Z',
        validationStatus: 'validated',
        extractedSkills: ['Cash Handling', 'Customer Service', 'POS Operation', 'React.js'],
        extractedEducation: "College Graduate",
        extractedDegree: 'BS Information Technology',
        extractedExperienceYears: 1,
        atsScore: 90
      }
    ],
    jobPreferences: {
      categories: ['Customer Service & Retail', 'Information Technology & Software'],
      municipalities: ['Roxas'],
      employmentTypes: ['Full-time'],
      minSalary: '12000'
    },
    geographicMobility: 'local_only',
    isProfileCompleted: true,
    profileSetupCompletedAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-02-15T08:00:00Z'
  },
  {
    id: 'seeker-poqiq-75',
    userId: 'user-seeker-poqiq-75',
    firstName: 'Poqiq',
    lastName: 'Roxas',
    email: 'poqiq75@gmail.com',
    contactNumber: '+63 917 555 7788',
    dateOfBirth: '2000-05-20',
    sex: 'Female',
    civilStatus: 'Single',
    address: 'Brgy. Bagumbayan, Roxas, Oriental Mindoro',
    municipality: 'Roxas',
    barangay: 'Bagumbayan',
    professionalSummary: 'Detail-oriented professional with qualifications in Information Technology and Customer Service.',
    educationalAttainment: "College Graduate",
    primaryDegree: 'BS Information Technology',
    educationCategory: 'College Graduate',
    employmentStatus: 'unemployed',
    profileCompleteness: 95,
    technicalSkills: ['Computer Literacy', 'Cash Handling', 'POS Operation', 'Customer Service', 'Web Development'],
    softSkills: ['Communication', 'Teamwork', 'Problem Solving', 'Adaptability'],
    tradeSkills: ['Computer Hardware Servicing', 'Cashiering'],
    practicalSkills: ['POS Terminal Operation', 'Customer Assistance', 'Technical Support'],
    education: [
      {
        id: 'edu-poqiq-1',
        degreeCourse: 'BS Information Technology',
        school: 'Mindoro State University (MinSU)',
        yearGraduated: 2024,
        educationalAttainment: "Bachelor's Degree",
      }
    ],
    workExperience: [
      {
        id: 'exp-poqiq-1',
        company: 'Roxas IT & Services',
        position: 'Customer Service & Technical Associate',
        startDate: '2024-06-01',
        endDate: 'Present',
        isCurrent: true,
        responsibilities: 'Provided technical assistance and customer care.',
        yearsOfExperience: 1
      }
    ],
    certifications: [],
    resumes: [
      {
        id: 'res-poqiq-1',
        fileName: 'Poqiq_Resume.pdf',
        fileSize: '1.1 MB',
        fileType: 'pdf',
        uploadedAt: '2026-02-10T08:00:00Z',
        validationStatus: 'validated',
        extractedSkills: ['Computer Literacy', 'Cash Handling', 'Customer Service', 'Web Development'],
        extractedEducation: "College Graduate",
        extractedDegree: 'BS Information Technology',
        extractedExperienceYears: 1,
        atsScore: 92
      }
    ],
    jobPreferences: {
      categories: ['Customer Service & Retail', 'Information Technology & Software'],
      municipalities: ['Roxas'],
      employmentTypes: ['Full-time'],
      minSalary: '12000'
    },
    geographicMobility: 'local_only',
    isProfileCompleted: true,
    profileSetupCompletedAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-02-10T08:00:00Z'
  },
  {
    id: 'seeker-maria-02',
    userId: 'user-seeker-maria-02',
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria.santos@jobseeker.ph',
    contactNumber: '+63 917 888 4433',
    dateOfBirth: '2001-03-12',
    sex: 'Female',
    civilStatus: 'Single',
    address: 'Brgy. San Mariano, Roxas, Oriental Mindoro',
    municipality: 'Roxas',
    barangay: 'San Mariano',
    professionalSummary: 'Enthusiastic and customer-focused sales professional with experience in retail merchandise presentation and active customer service.',
    educationalAttainment: 'College Graduate',
    primaryDegree: 'BS Business Administration',
    educationCategory: 'College Graduate',
    employmentStatus: 'unemployed',
    profileCompleteness: 94,
    technicalSkills: ['Cash Handling', 'POS Operation', 'Product Presentation', 'Active Selling', 'Inventory Management'],
    softSkills: ['Friendly Communication', 'Punctuality', 'Interpersonal Skills', 'Customer Care'],
    tradeSkills: ['Retail Merchandising', 'Cashiering'],
    practicalSkills: ['POS Terminal Operation', 'Customer Assistance', 'Stock Organization'],
    education: [
      {
        id: 'edu-maria-1',
        degreeCourse: 'BS Business Administration',
        school: 'Mindoro State University (MinSU)',
        yearGraduated: 2024,
        educationalAttainment: "Bachelor's Degree"
      }
    ],
    workExperience: [
      {
        id: 'exp-maria-1',
        company: 'Roxas Commercial Boutique',
        position: 'Sales Associate & Cashier',
        startDate: '2024-05-01',
        endDate: '2025-07-01',
        isCurrent: false,
        responsibilities: 'Assisted shoppers, maintained inventory displays, and processed cash and digital payments.',
        yearsOfExperience: 1
      }
    ],
    certifications: [],
    resumes: [
      {
        id: 'res-maria-1',
        fileName: 'Maria_Santos_Resume.pdf',
        fileSize: '1.0 MB',
        fileType: 'pdf',
        uploadedAt: '2026-02-05T08:00:00Z',
        validationStatus: 'validated',
        extractedSkills: ['Cash Handling', 'POS Operation', 'Product Presentation', 'Active Selling'],
        extractedEducation: 'College Graduate',
        extractedDegree: 'BS Business Administration',
        extractedExperienceYears: 1,
        atsScore: 91
      }
    ],
    jobPreferences: {
      categories: ['Customer Service & Retail'],
      municipalities: ['Roxas'],
      employmentTypes: ['Full-time'],
      minSalary: '13000'
    },
    geographicMobility: 'local_only',
    isProfileCompleted: true,
    profileSetupCompletedAt: '2026-02-05T08:00:00Z',
    updatedAt: '2026-02-05T08:00:00Z'
  },
  {
    id: 'seeker-mark-03',
    userId: 'user-seeker-mark-03',
    firstName: 'Mark',
    lastName: 'Villanueva',
    email: 'mark.villanueva@jobseeker.ph',
    contactNumber: '+63 920 777 5566',
    dateOfBirth: '1999-11-25',
    sex: 'Male',
    civilStatus: 'Single',
    address: 'Brgy. Cantil, Roxas, Oriental Mindoro',
    municipality: 'Roxas',
    barangay: 'Cantil',
    professionalSummary: 'Agronomy graduate with strong background in farm operations, crop monitoring, logistics, and field supervisory management.',
    educationalAttainment: 'College Graduate',
    primaryDegree: 'BS Agriculture',
    educationCategory: 'College Graduate',
    employmentStatus: 'unemployed',
    profileCompleteness: 95,
    technicalSkills: ['Agronomy', 'Crop Management', 'Pest & Disease Control', 'Warehouse Management', 'Logistics Coordination'],
    softSkills: ['Team Leadership', 'Problem Solving', 'Time Management', 'Critical Thinking'],
    tradeSkills: ['Agricultural Machine Operation', 'Harvest Logistics'],
    practicalSkills: ['Field Supervision', 'Harvest Scheduling', 'Safety Protocol Enforcement'],
    education: [
      {
        id: 'edu-mark-1',
        degreeCourse: 'BS Agriculture (Major in Agronomy)',
        school: 'Mindoro State University (MinSU)',
        yearGraduated: 2023,
        educationalAttainment: "Bachelor's Degree"
      }
    ],
    workExperience: [
      {
        id: 'exp-mark-1',
        company: 'Mindoro Agro-Growers Cooperative',
        position: 'Assistant Farm Supervisor',
        startDate: '2023-08-01',
        endDate: '2025-09-01',
        isCurrent: false,
        responsibilities: 'Supervised 15 field workers, oversaw harvest schedules and logistics dispatch.',
        yearsOfExperience: 2
      }
    ],
    certifications: [
      {
        id: 'cert-mark-1',
        name: 'Agricultural Crops Production NC II',
        issuingOrganization: 'TESDA Oriental Mindoro',
        dateObtained: '2023-06-15'
      }
    ],
    resumes: [
      {
        id: 'res-mark-1',
        fileName: 'Mark_Villanueva_Resume.pdf',
        fileSize: '1.3 MB',
        fileType: 'pdf',
        uploadedAt: '2026-02-08T08:00:00Z',
        validationStatus: 'validated',
        extractedSkills: ['Agronomy', 'Crop Management', 'Field Supervision', 'Warehouse Management'],
        extractedEducation: 'College Graduate',
        extractedDegree: 'BS Agriculture',
        extractedExperienceYears: 2,
        atsScore: 93
      }
    ],
    jobPreferences: {
      categories: ['Agriculture & Agri-Business', 'Logistics & Warehousing'],
      municipalities: ['Roxas'],
      employmentTypes: ['Full-time'],
      minSalary: '16000'
    },
    geographicMobility: 'local_only',
    isProfileCompleted: true,
    profileSetupCompletedAt: '2026-02-08T08:00:00Z',
    updatedAt: '2026-02-08T08:00:00Z'
  }
];

// INITIAL APPLICATIONS
export const INITIAL_APPLICATIONS: Application[] = [
  // 1. Puregold Cashier (Juan Dela Cruz)
  {
    id: 'app-puregold-01',
    jobId: 'job-puregold-cashier',
    jobSeekerId: 'seeker-juan-01',
    employerId: 'emp-puregold-01',
    appliedDate: '2026-02-12T10:30:00Z',
    resumeId: 'res-1',
    currentStatus: 'under_review',
    decisionTreeOutcome: 'HIGHLY QUALIFIED',
    matchScore: 94,
    matchResult: {
      jobId: 'job-puregold-cashier',
      jobSeekerId: 'seeker-juan-01',
      overallMatch: 94,
      outcome: 'HIGHLY QUALIFIED',
      educationMatchScore: 30,
      degreeAlignmentScore: 10,
      skillsMatchScore: 30,
      experienceMatchScore: 15,
      certificationsMatchScore: 9,
      matchedReasons: [
        'Exceeds education requirement (College Graduate)',
        'Core cashiering and POS competencies validated',
        'Direct resident of Roxas (Brgy. Bagumbayan)'
      ],
      missingQualifications: [],
      decisionReason: 'Strong algorithmic match for supermarket checkout counter operations.'
    },
    statusHistory: [
      {
        status: 'applied',
        updatedAt: '2026-02-12T10:30:00Z',
        updatedBy: 'user-seeker-juan-01',
        notes: 'Submitted application via eHANAP Seeker Portal'
      },
      {
        status: 'under_review',
        updatedAt: '2026-02-13T09:00:00Z',
        updatedBy: 'user-emp-puregold-01',
        notes: 'Reviewed by Puregold Store Operations Manager'
      }
    ]
  },
  // 2. Mindoro Tech Developer (Poqiq Roxas)
  {
    id: 'app-tech-dev-01',
    jobId: 'job-tech-developer',
    jobSeekerId: 'seeker-poqiq-75',
    employerId: 'emp-tech-01',
    appliedDate: '2026-02-14T11:00:00Z',
    resumeId: 'res-poqiq-1',
    currentStatus: 'under_review',
    decisionTreeOutcome: 'HIGHLY QUALIFIED',
    matchScore: 95,
    matchResult: {
      jobId: 'job-tech-developer',
      jobSeekerId: 'seeker-poqiq-75',
      overallMatch: 95,
      outcome: 'HIGHLY QUALIFIED',
      educationMatchScore: 30,
      degreeAlignmentScore: 10,
      skillsMatchScore: 30,
      experienceMatchScore: 15,
      certificationsMatchScore: 10,
      matchedReasons: [
        'BS Information Technology graduate from MinSU',
        'Validated frontend competencies (React.js, JavaScript, Web Development)',
        'Roxas resident with immediate start readiness'
      ],
      missingQualifications: [],
      decisionReason: 'Outstanding alignment with Mindoro Software Solutions development stack.'
    },
    statusHistory: [
      {
        status: 'applied',
        updatedAt: '2026-02-14T11:00:00Z',
        updatedBy: 'user-seeker-poqiq-75',
        notes: 'Applied via eHANAP portal'
      },
      {
        status: 'under_review',
        updatedAt: '2026-02-15T09:30:00Z',
        updatedBy: 'user-emp-tech-01',
        notes: 'ATS screening completed with high score'
      }
    ]
  },
  // 3. Mindoro Tech Support (Juan Dela Cruz)
  {
    id: 'app-tech-sup-01',
    jobId: 'job-tech-support',
    jobSeekerId: 'seeker-juan-01',
    employerId: 'emp-tech-01',
    appliedDate: '2026-02-13T14:15:00Z',
    resumeId: 'res-1',
    currentStatus: 'for_interview',
    decisionTreeOutcome: 'HIGHLY QUALIFIED',
    matchScore: 92,
    matchResult: {
      jobId: 'job-tech-support',
      jobSeekerId: 'seeker-juan-01',
      overallMatch: 92,
      outcome: 'HIGHLY QUALIFIED',
      educationMatchScore: 30,
      degreeAlignmentScore: 10,
      skillsMatchScore: 28,
      experienceMatchScore: 14,
      certificationsMatchScore: 10,
      matchedReasons: [
        'BS IT graduate with TESDA NC II in Computer Systems Servicing',
        'Demonstrated hardware diagnostics and network troubleshooting experience',
        'Local resident of Brgy. Bagumbayan'
      ],
      missingQualifications: [],
      decisionReason: 'Strong technical support and field troubleshooting qualifications.'
    },
    statusHistory: [
      {
        status: 'applied',
        updatedAt: '2026-02-13T14:15:00Z',
        updatedBy: 'user-seeker-juan-01',
        notes: 'Applied for IT Support role'
      },
      {
        status: 'under_review',
        updatedAt: '2026-02-14T10:00:00Z',
        updatedBy: 'user-emp-tech-01',
        notes: 'Shortlisted by Lead Technical Engineer'
      },
      {
        status: 'for_interview',
        updatedAt: '2026-02-15T15:00:00Z',
        updatedBy: 'user-emp-tech-01',
        notes: 'Invited for technical interview and skills assessment'
      }
    ]
  },
  // 4. Central Mall Sales Lady (Maria Santos)
  {
    id: 'app-sales-01',
    jobId: 'job-sales-lady',
    jobSeekerId: 'seeker-maria-02',
    employerId: 'emp-sales-01',
    appliedDate: '2026-02-11T13:45:00Z',
    resumeId: 'res-maria-1',
    currentStatus: 'under_review',
    decisionTreeOutcome: 'HIGHLY QUALIFIED',
    matchScore: 93,
    matchResult: {
      jobId: 'job-sales-lady',
      jobSeekerId: 'seeker-maria-02',
      overallMatch: 93,
      outcome: 'HIGHLY QUALIFIED',
      educationMatchScore: 30,
      degreeAlignmentScore: 10,
      skillsMatchScore: 30,
      experienceMatchScore: 14,
      certificationsMatchScore: 9,
      matchedReasons: [
        'BS Business Administration graduate',
        'Retail store customer care and active selling background',
        'Resident of Roxas (Brgy. San Mariano)'
      ],
      missingQualifications: [],
      decisionReason: 'Excellent match for commercial boutique and customer-facing merchandising.'
    },
    statusHistory: [
      {
        status: 'applied',
        updatedAt: '2026-02-11T13:45:00Z',
        updatedBy: 'user-seeker-maria-02',
        notes: 'Applied via eHANAP Seeker Portal'
      },
      {
        status: 'under_review',
        updatedAt: '2026-02-12T11:00:00Z',
        updatedBy: 'user-emp-sales-01',
        notes: 'Screened by Central Mall HR'
      }
    ]
  },
  // 5. Roxas Agro-Industrial Supervisor (Mark Villanueva)
  {
    id: 'app-agri-01',
    jobId: 'job-agri-supervisor',
    jobSeekerId: 'seeker-mark-03',
    employerId: 'emp-agri-01',
    appliedDate: '2026-02-10T16:00:00Z',
    resumeId: 'res-mark-1',
    currentStatus: 'under_review',
    decisionTreeOutcome: 'HIGHLY QUALIFIED',
    matchScore: 96,
    matchResult: {
      jobId: 'job-agri-supervisor',
      jobSeekerId: 'seeker-mark-03',
      overallMatch: 96,
      outcome: 'HIGHLY QUALIFIED',
      educationMatchScore: 30,
      degreeAlignmentScore: 10,
      skillsMatchScore: 30,
      experienceMatchScore: 16,
      certificationsMatchScore: 10,
      matchedReasons: [
        'BS Agriculture graduate (Major in Agronomy)',
        'TESDA NC II Agricultural Crops Production certified',
        'Proven supervisory leadership in coop farm operations'
      ],
      missingQualifications: [],
      decisionReason: 'Exceptional qualification profile for agricultural farm supervision.'
    },
    statusHistory: [
      {
        status: 'applied',
        updatedAt: '2026-02-10T16:00:00Z',
        updatedBy: 'user-seeker-mark-03',
        notes: 'Submitted application'
      },
      {
        status: 'under_review',
        updatedAt: '2026-02-11T09:30:00Z',
        updatedBy: 'user-emp-agri-01',
        notes: 'Application reviewed by Don Ramon Ilustre'
      }
    ]
  }
];

export const INITIAL_INTERVIEWS: Interview[] = [
  {
    id: 'int-puregold-01',
    applicationId: 'app-puregold-01',
    jobId: 'job-puregold-cashier',
    jobTitle: 'Supermarket Cashier (POS Operator)',
    employerId: 'emp-puregold-01',
    companyName: 'Puregold Price Club (Roxas Branch)',
    jobSeekerId: 'seeker-juan-01',
    applicantName: 'Juan Dela Cruz',
    interviewType: 'face_to_face',
    date: '2026-02-25',
    time: '14:00',
    locationOrLink: 'Puregold Roxas HR Office, Brgy. Bagumbayan',
    contactPerson: 'Eduardo Manalo (Store Operations Manager)',
    contactPhone: '+63 928 555 4321',
    status: 'scheduled',
    instructions: 'Please bring 1 valid government ID and 2 copies of your printed resume.',
    createdAt: '2026-02-14T08:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    recipientId: 'user-seeker-juan-01',
    recipientRole: 'job_seeker',
    title: 'Interview Scheduled with Puregold',
    message: 'Your application for Supermarket Cashier (POS Operator) has been selected for an in-store interview!',
    type: 'action',
    read: false,
    createdAt: '2026-02-14T08:00:00Z',
    link: 'seeker-applications'
  },
  {
    id: 'notif-02',
    recipientId: 'user-emp-puregold-01',
    recipientRole: 'employer',
    title: 'New Applicant Match for Cashier',
    message: 'Juan Dela Cruz applied with a 94% Decision Tree qualification score.',
    type: 'info',
    read: false,
    createdAt: '2026-02-12T10:30:00Z',
    link: 'employer-dashboard'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-01',
    timestamp: '2026-02-01T08:00:00Z',
    userId: 'user-peso-admin-01',
    userName: 'Hon. Roberto D. Alvarez',
    userRole: 'admin',
    action: 'EMPLOYER_ACCREDITED',
    entity: 'EmployerProfile',
    entityId: 'emp-puregold-01',
    details: 'Verified Mayor’s Permit and accredited Puregold Price Club (Roxas Branch)'
  },
  {
    id: 'audit-02',
    timestamp: '2026-02-05T09:00:00Z',
    userId: 'user-peso-admin-01',
    userName: 'Hon. Roberto D. Alvarez',
    userRole: 'admin',
    action: 'JOB_APPROVED',
    entity: 'JobPost',
    entityId: 'job-puregold-cashier',
    details: 'Approved Cashier opening under LGU Roxas Employment Standards'
  }
];

export const INITIAL_ANNOUNCEMENTS: SystemAnnouncement[] = [
  {
    id: 'ann-01',
    title: 'PESO Roxas Local Hiring Blitz: Supermarket, Tech, Agriculture & Retail Now Open',
    content: 'The Municipal Public Employment Service Office (PESO) of Roxas has verified new job openings across Puregold (Cashier & Bagger), Mindoro Tech, Roxas Highland Agro-Farms, and Roxas Central Boutique. Local job seekers are encouraged to explore and apply directly!',
    targetRole: 'all',
    datePosted: '2026-02-01',
    isImportant: true
  }
];

export const INITIAL_JOB_SUBSCRIPTIONS: JobAlertSubscription[] = [];
export const INITIAL_BOOKMARKED_JOB_IDS: string[] = ['job-puregold-cashier', 'job-sales-lady'];
export const INITIAL_COMPANY_REVIEWS: CompanyReview[] = [];
export const INITIAL_CONVERSATIONS: ChatConversation[] = [];
export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];
export const INITIAL_PROFILE_VIEWS: ProfileViewEvent[] = [];
