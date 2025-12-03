
export enum UserRole {
  ADMIN = 'ADMIN', // Platform Super Admin
  EMPLOYER = 'EMPLOYER', // Company Owner/Recruiter
  CANDIDATE = 'CANDIDATE' // Job Seeker
}

export enum EmployerSubRole {
  OWNER = 'OWNER',
  RECRUITER = 'RECRUITER',
  HIRING_MANAGER = 'HIRING_MANAGER'
}

export enum PlanTier {
  FREE = 'FREE',
  LITE = 'LITE',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE'
}

export interface SubscriptionDetails {
  planId: PlanTier;
  status: 'active' | 'canceled' | 'past_due';
  startDate: string;
  renewsAt?: string;
  jobCredits: number; // -1 for unlimited
  talentAccessExpiresAt?: string; // ISO date, or null if unlimited
}

export interface Company {
  id: string;
  name: string;
  description: string;
  website?: string;
  logo?: string;
  location?: string;
  size?: string;
  industry?: string;
  techStack?: string[]; // e.g. Salesforce, HubSpot
  revOpsStructure?: string; // e.g. "Centralized under CRO"
  ownerId: string; // The user ID of the employer who owns this profile
  subscription: SubscriptionDetails;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface JobAlert {
  id: string;
  query: string; // e.g. "RevOps Manager"
  frequency: 'daily' | 'weekly' | 'instant';
  active: boolean;
}

export interface SavedJob {
  jobId: string;
  savedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  password?: string;
  provider: 'google' | 'email';
  isActive?: boolean; // For activating/deactivating users
  
  // Employer Specific
  companyId?: string;
  employerSubRole?: EmployerSubRole;

  // Candidate Specific
  bio?: string;
  title?: string; // e.g. "Senior RevOps Analyst"
  skills?: string[];
  resumeUrl?: string; // Mock URL
  experience?: Experience[];
  savedJobs?: SavedJob[];
  alerts?: JobAlert[];
  preferences?: {
    isOpenToWork: boolean;
    remoteOnly?: boolean;
    hideProfileFromEmployers?: boolean;
  };
}

export interface Job {
  id: string;
  title: string;
  companyId: string; // Link to Company entity
  companyName: string; // Denormalized for easy display
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  description: string;
  requirements?: string[];
  salaryRange?: string;
  postedAt: string;
  isActive: boolean;
  authorId: string; // ID of the employer who posted it
  views?: number; // For analytics
  clicks?: number; // For analytics
  applicantsCount?: number; // Denormalized count
  directApplyUrl?: string; // External link for application
}

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  REVIEWING = 'REVIEWING',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: ApplicationStatus;
  appliedAt: string;
  
  // Employer Internal Data
  internalNotes?: string;
  rating?: number; // 1-5 stars

  // Candidate Data
  candidateNotes?: string; // Private notes for the candidate

  // Denormalized for easier display in dashboards
  candidateName?: string;
  candidateEmail?: string;
  jobTitle?: string;
  companyName?: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'PAID' | 'PENDING';
  description: string;
}

export type ViewState = 
  | 'HOME' 
  | 'JOB_DETAILS'
  | 'LOGIN' 
  | 'SIGNUP_CHOICE'
  | 'SIGNUP_CANDIDATE' 
  | 'SIGNUP_EMPLOYER' 
  | 'ADMIN_DASHBOARD'      // Super Admin
  | 'EMPLOYER_DASHBOARD'   // Employer
  | 'USER_DASHBOARD'       // Candidate
  | 'PRICING';             // Subscription Plans
