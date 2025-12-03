
import { User, Job, UserRole, Application, ApplicationStatus, Company, EmployerSubRole, Invoice, PlanTier } from './types';

// --- CONFIGURATION ---

export const PLANS = {
  [PlanTier.FREE]: {
    name: 'Free Starter',
    price: 0,
    jobLimit: 1,
    talentAccessDays: 7,
    features: ['1 Active Job Listing', '7-Day Talent Pool Access', 'Basic Company Profile']
  },
  [PlanTier.LITE]: {
    name: 'Lite',
    price: 199,
    jobLimit: 3,
    talentAccessDays: 30,
    features: ['3 Active Job Listings', '30-Day Talent Pool Access', 'Standard Support']
  },
  [PlanTier.PROFESSIONAL]: {
    name: 'Professional',
    price: 499,
    jobLimit: 10,
    talentAccessDays: -1, // Unlimited
    features: ['10 Active Job Listings', 'Unlimited Talent Pool Access', 'Priority Support', 'Featured Listings']
  },
  [PlanTier.ENTERPRISE]: {
    name: 'Enterprise',
    price: 999,
    jobLimit: -1, // Unlimited
    talentAccessDays: -1, // Unlimited
    features: ['Unlimited Job Listings', 'Unlimited Talent Pool', 'Dedicated Account Manager', 'API Access', 'SSO']
  }
};

// --- INITIAL DATA SEEDS ---

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'c1',
    name: 'ScaleUp SaaS',
    description: 'Leading the way in GTM efficiency for enterprise software.',
    location: 'San Francisco, CA',
    size: '50-200',
    industry: 'B2B Software',
    techStack: ['Salesforce', 'HubSpot', 'Outreach', 'Gong'],
    revOpsStructure: 'Centralized under CRO',
    ownerId: '2', // Owned by the Employer User
    logo: 'https://ui-avatars.com/api/?name=ScaleUp+SaaS&background=059669&color=fff&size=128&bold=true',
    subscription: {
      planId: PlanTier.PROFESSIONAL,
      status: 'active',
      startDate: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
      renewsAt: new Date(Date.now() + 86400000 * 1).toISOString(), // renews tomorrow
      jobCredits: 10,
      talentAccessExpiresAt: undefined // Unlimited
    }
  },
  {
    id: 'c2',
    name: 'CloudFlow',
    description: 'Cloud infrastructure automation for the modern web.',
    location: 'Remote',
    size: '200-500',
    industry: 'DevOps Tools',
    techStack: ['Salesforce CPQ', 'NetSuite', 'Marketo'],
    revOpsStructure: 'Decentralized (Sales Ops + Marketing Ops)',
    ownerId: '99', // System/orphan for demo
    logo: 'https://ui-avatars.com/api/?name=CloudFlow&background=2563EB&color=fff&size=128&bold=true',
    subscription: {
      planId: PlanTier.FREE,
      status: 'active',
      startDate: new Date().toISOString(),
      jobCredits: 1,
      talentAccessExpiresAt: new Date(Date.now() + 86400000 * 7).toISOString() // 7 days from now
    }
  }
];

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Joshua (Admin)',
    email: 'joshuad.ny@gmail.com',
    password: 'password',
    role: UserRole.ADMIN, // PLATFORM ADMIN
    avatar: 'https://ui-avatars.com/api/?name=Joshua+Admin&background=1e293b&color=fff',
    provider: 'email',
    isActive: true
  },
  {
    id: '2',
    name: 'Sarah Jenkins (Owner)',
    email: 'sarah@scaleup.com',
    password: 'password',
    role: UserRole.EMPLOYER,
    employerSubRole: EmployerSubRole.OWNER,
    companyId: 'c1',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=059669&color=fff',
    provider: 'email',
    isActive: true
  },
  {
    id: '2b',
    name: 'Mike Recruiter',
    email: 'mike@scaleup.com',
    password: 'password',
    role: UserRole.EMPLOYER,
    employerSubRole: EmployerSubRole.RECRUITER,
    companyId: 'c1',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Recruiter&background=047857&color=fff',
    provider: 'email',
    isActive: true
  },
  {
    id: '3',
    name: 'Alex Rivera (Candidate)',
    email: 'alex@example.com',
    password: 'password',
    role: UserRole.CANDIDATE, // CANDIDATE
    avatar: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=0D8ABC&color=fff',
    bio: 'Certified Salesforce Administrator & GTM Systems Engineer looking for high-growth opportunities.',
    title: 'Senior RevOps Analyst',
    skills: ['Salesforce', 'HubSpot', 'SQL', 'Apex', 'Deal Desk'],
    preferences: { isOpenToWork: true, remoteOnly: false, hideProfileFromEmployers: false },
    provider: 'email',
    experience: [
      {
        id: 'exp1',
        title: 'RevOps Analyst',
        company: 'TechStart Inc.',
        location: 'New York, NY',
        startDate: '2022-01-01',
        current: true,
        description: 'Managed Salesforce automation, implemented CPQ, and streamlined the quote-to-cash process.'
      },
      {
        id: 'exp2',
        title: 'Sales Operations Coordinator',
        company: 'OldSchool Corp',
        location: 'Remote',
        startDate: '2020-05-01',
        endDate: '2021-12-31',
        current: false,
        description: 'Supported 50+ sales reps with territory planning and compensation analysis.'
      }
    ],
    savedJobs: [
      { jobId: 'j3', savedAt: new Date().toISOString() }
    ],
    alerts: [
      { id: 'al1', query: 'Salesforce Architect', frequency: 'weekly', active: true },
      { id: 'al2', query: 'Remote RevOps', frequency: 'daily', active: true }
    ],
    isActive: true
  },
  {
    id: '4',
    name: 'Jordan Lee',
    email: 'jordan@example.com',
    password: 'password',
    role: UserRole.CANDIDATE,
    avatar: 'https://ui-avatars.com/api/?name=Jordan+Lee&background=6366f1&color=fff',
    bio: 'Experienced Marketing Operations Manager specializing in Marketo and attribution models.',
    title: 'Marketing Ops Manager',
    skills: ['Marketo', 'Tableau', 'Bizible', 'Salesforce'],
    preferences: { isOpenToWork: true, remoteOnly: true },
    provider: 'email',
    isActive: true
  }
];

export const MOCK_JOBS: Job[] = [
  {
    id: 'j1',
    title: 'Director of Revenue Operations',
    companyId: 'c1',
    companyName: 'ScaleUp SaaS',
    location: 'Remote',
    type: 'Full-time',
    description: `We are looking for a strategic leader to own our end-to-end revenue process. You will oversee the tech stack (HubSpot, SFDC), align Sales and Marketing, and drive GTM efficiency.
    
**Key Responsibilities:**
- Lead the RevOps function and manage a team of 3 analysts.
- Own the GTM tech stack including Salesforce, HubSpot, Outreach, and Gong.
- Drive annual planning, quota setting, and territory design.`,
    requirements: ['7+ years RevOps experience', 'SFDC Architect Cert', 'Deal Desk management'],
    salaryRange: '$160k - $210k',
    postedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    isActive: true,
    authorId: '2',
    views: 145,
    clicks: 42
  },
  {
    id: 'j2',
    title: 'GTM Systems Engineer',
    companyId: 'c2',
    companyName: 'CloudFlow',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description: `Join our Business Technology team to build scalable automations. You will be responsible for Apex triggers, CPQ configuration, and integrating third-party tools like Gong and Outreach.`,
    requirements: ['Salesforce CPQ', 'Apex/Visualforce', 'Python scripting'],
    salaryRange: '$140k - $170k',
    postedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    isActive: true,
    authorId: '99',
    views: 89,
    clicks: 12
  },
  {
    id: 'j3',
    title: 'Sales Operations Manager',
    companyId: 'c1',
    companyName: 'ScaleUp SaaS',
    location: 'Austin, TX',
    type: 'Full-time',
    description: 'Partner with our VP of Sales to optimize territory planning, compensation analysis, and forecasting accuracy.',
    requirements: ['Excel/SQL wizardry', 'Quota planning', 'Tableau/Looker'],
    salaryRange: '$110k - $140k',
    postedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    isActive: true,
    authorId: '2',
    views: 201,
    clicks: 65
  }
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'a1',
    userId: '3', // Alex
    jobId: 'j1', // Director Role
    candidateName: 'Alex Rivera',
    jobTitle: 'Director of Revenue Operations',
    companyName: 'ScaleUp SaaS',
    status: ApplicationStatus.INTERVIEW,
    appliedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    internalNotes: 'Strong technical background, good culture fit. Scheduled for final round.',
    candidateNotes: 'First interview went well. They asked about CPQ experience.'
  }
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'inv_001', date: '2024-05-01', amount: 299, status: 'PAID', description: 'Growth Plan - May 2024' },
  { id: 'inv_002', date: '2024-04-01', amount: 299, status: 'PAID', description: 'Growth Plan - April 2024' },
  { id: 'inv_003', date: '2024-03-01', amount: 299, status: 'PAID', description: 'Growth Plan - March 2024' },
];
