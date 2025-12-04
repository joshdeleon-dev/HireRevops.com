
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

export const MOCK_COMPANIES: Company[] = [];

export const MOCK_USERS: User[] = [];

export const MOCK_JOBS: Job[] = [];

export const MOCK_APPLICATIONS: Application[] = [];

export const MOCK_INVOICES: Invoice[] = [];
