
import { User, Job, Application, UserRole, ApplicationStatus, Company, SavedJob, JobAlert, Experience, PlanTier } from '../types';
import { MOCK_USERS, MOCK_JOBS, MOCK_APPLICATIONS, MOCK_COMPANIES, PLANS } from '../constants';

const STORAGE_KEYS = {
  USERS: 'hirerevops_users_v2', 
  JOBS: 'hirerevops_jobs_v2',
  APPLICATIONS: 'hirerevops_applications_v2',
  COMPANIES: 'hirerevops_companies_v2',
  CURRENT_USER: 'hirerevops_current_user_id_v2'
};

// Initialize DB with mock data if empty
const initialize = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(MOCK_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(MOCK_JOBS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(MOCK_APPLICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(MOCK_COMPANIES));
  }
};

initialize();

// --- USERS ---
export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
};

export const addUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const updateUser = (updatedUser: User): void => {
  const users = getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getUserById = (id: string): User | undefined => {
  return getUsers().find(u => u.id === id);
};

export const getUserByEmail = (email: string): User | undefined => {
  return getUsers().find(u => u.email === email);
};

export const deleteUser = (id: string): void => {
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

// New: Get Team Members
export const getTeamMembers = (companyId: string): User[] => {
  return getUsers().filter(u => u.role === UserRole.EMPLOYER && u.companyId === companyId);
};

// New: Search Candidates
export const searchCandidates = (query: string): User[] => {
  const candidates = getUsers().filter(u => u.role === UserRole.CANDIDATE && u.preferences?.isOpenToWork);
  if (!query) return candidates;
  const q = query.toLowerCase();
  return candidates.filter(u => 
    u.name.toLowerCase().includes(q) || 
    u.title?.toLowerCase().includes(q) || 
    u.skills?.some(s => s.toLowerCase().includes(q))
  );
};

// --- CANDIDATE FEATURES ---

export const toggleSavedJob = (userId: string, jobId: string): User | null => {
  const user = getUserById(userId);
  if (!user) return null;
  
  let savedJobs = user.savedJobs || [];
  const exists = savedJobs.find(s => s.jobId === jobId);
  
  if (exists) {
    savedJobs = savedJobs.filter(s => s.jobId !== jobId);
  } else {
    savedJobs.push({ jobId, savedAt: new Date().toISOString() });
  }
  
  const updatedUser = { ...user, savedJobs };
  updateUser(updatedUser);
  return updatedUser;
};

export const addJobAlert = (userId: string, alert: JobAlert): User | null => {
  const user = getUserById(userId);
  if (!user) return null;
  const alerts = user.alerts || [];
  alerts.push(alert);
  const updatedUser = { ...user, alerts };
  updateUser(updatedUser);
  return updatedUser;
};

export const removeJobAlert = (userId: string, alertId: string): User | null => {
  const user = getUserById(userId);
  if (!user) return null;
  const alerts = (user.alerts || []).filter(a => a.id !== alertId);
  const updatedUser = { ...user, alerts };
  updateUser(updatedUser);
  return updatedUser;
};

export const addExperience = (userId: string, exp: Experience): User | null => {
  const user = getUserById(userId);
  if (!user) return null;
  const experience = user.experience || [];
  experience.push(exp);
  // Sort by start date desc
  experience.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  const updatedUser = { ...user, experience };
  updateUser(updatedUser);
  return updatedUser;
};

export const removeExperience = (userId: string, expId: string): User | null => {
  const user = getUserById(userId);
  if (!user) return null;
  const experience = (user.experience || []).filter(e => e.id !== expId);
  const updatedUser = { ...user, experience };
  updateUser(updatedUser);
  return updatedUser;
};


// --- COMPANIES ---
export const getCompanies = (): Company[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPANIES) || '[]');
};

export const getCompanyById = (id: string): Company | undefined => {
  return getCompanies().find(c => c.id === id);
};

export const addCompany = (company: Company): void => {
  const companies = getCompanies();
  companies.push(company);
  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
};

export const updateCompany = (updatedCompany: Company): void => {
  const companies = getCompanies().map(c => c.id === updatedCompany.id ? updatedCompany : c);
  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
};

// --- JOBS ---
export const getJobs = (): Job[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS) || '[]');
};

export const getJobsByCompany = (companyId: string): Job[] => {
  return getJobs().filter(j => j.companyId === companyId);
};

export const addJob = (job: Job): void => {
  const jobs = getJobs();
  jobs.unshift(job); // Add to top
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
};

export const deleteJob = (id: string): void => {
  const jobs = getJobs().filter(j => j.id !== id);
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
};

export const updateJob = (updatedJob: Job): void => {
  const jobs = getJobs().map(j => j.id === updatedJob.id ? updatedJob : j);
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
};

// --- SUBSCRIPTIONS ---

export const upgradeSubscription = (companyId: string, planId: PlanTier): void => {
  const company = getCompanyById(companyId);
  if (!company) return;

  const planConfig = PLANS[planId];
  
  // Logic for talent access expiry
  let talentExpiry: string | undefined = undefined;
  if (planConfig.talentAccessDays > 0) {
    const d = new Date();
    d.setDate(d.getDate() + planConfig.talentAccessDays);
    talentExpiry = d.toISOString();
  } else if (planConfig.talentAccessDays === -1) {
    talentExpiry = undefined; // Unlimited
  }

  const updatedCompany: Company = {
    ...company,
    subscription: {
      planId: planId,
      status: 'active',
      startDate: new Date().toISOString(),
      renewsAt: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days
      jobCredits: planConfig.jobLimit,
      talentAccessExpiresAt: talentExpiry
    }
  };
  
  updateCompany(updatedCompany);
};

// Check if company can post a job
export const canPostJob = (companyId: string): { allowed: boolean; reason?: string } => {
  const company = getCompanyById(companyId);
  if (!company) return { allowed: false, reason: 'Company not found' };

  const sub = company.subscription;
  if (sub.jobCredits === -1) return { allowed: true }; // Unlimited
  
  // Count current active jobs
  const activeJobs = getJobsByCompany(companyId).filter(j => j.isActive).length;
  
  if (activeJobs < sub.jobCredits) {
    return { allowed: true };
  } else {
    return { allowed: false, reason: `Plan limit reached (${activeJobs}/${sub.jobCredits}). Upgrade for more.` };
  }
};

// Check if company can access talent
export const canAccessTalent = (companyId: string): { allowed: boolean; reason?: string } => {
  const company = getCompanyById(companyId);
  if (!company) return { allowed: false, reason: 'Company not found' };

  const sub = company.subscription;
  
  // If undefined, it means unlimited in our model for paid plans, 
  // BUT for Free plan it might be set.
  // We need to check plan config logic or strictly relying on date.
  
  // If Unlimited (undefined/null for paid plans usually, but let's check constants if we want to be strict)
  // For simplicity: if talentAccessExpiresAt is missing AND it's a paid plan (PRO/ENT), it's allowed.
  // If it's present, check date.
  
  if (!sub.talentAccessExpiresAt) {
    // Check if plan is FREE/LITE which might have expired logic differently or assuming unlimited?
    // Based on `upgradeSubscription` logic:
    // PRO/ENT have undefined expiry (unlimited).
    // FREE/LITE have a date.
    // So if undefined, it's unlimited.
    // However, older data might be tricky. Let's assume undefined = unlimited for safety OR check Plan.
    if (sub.planId === PlanTier.FREE || sub.planId === PlanTier.LITE) {
       // Should have a date. If not, maybe expired or logic error? 
       // Let's assume strictly checking date if present.
       return { allowed: true }; 
    }
    return { allowed: true };
  }

  const expiry = new Date(sub.talentAccessExpiresAt);
  if (expiry > new Date()) {
    return { allowed: true };
  } else {
    return { allowed: false, reason: 'Talent Pool access has expired.' };
  }
};


// --- APPLICATIONS ---
export const getApplications = (): Application[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || '[]');
};

// Get applications for a specific candidate
export const getCandidateApplications = (userId: string): Application[] => {
  return getApplications().filter(a => a.userId === userId);
};

// Get applications for jobs owned by a specific employer (complex join)
export const getEmployerApplications = (employerId: string): Application[] => {
  // Logic: Get user -> company -> jobs -> apps
  const user = getUserById(employerId);
  if (!user || !user.companyId) return [];
  
  const companyJobIds = getJobsByCompany(user.companyId).map(j => j.id);
  return getApplications().filter(a => companyJobIds.includes(a.jobId));
};

export const addApplication = (app: Application): void => {
  const apps = getApplications();
  apps.push(app);
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
};

export const updateApplicationStatus = (id: string, status: ApplicationStatus): void => {
  const apps = getApplications().map(a => a.id === id ? { ...a, status } : a);
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
};

export const updateApplication = (updatedApp: Application): void => {
  const apps = getApplications().map(a => a.id === updatedApp.id ? updatedApp : a);
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
};

export const withdrawApplication = (appId: string): void => {
  updateApplicationStatus(appId, ApplicationStatus.WITHDRAWN);
};

// --- SESSION ---
export const getSession = (): User | null => {
  const id = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!id) return null;
  return getUserById(id) || null;
};

export const setSession = (userId: string): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
};

export const clearSession = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};
