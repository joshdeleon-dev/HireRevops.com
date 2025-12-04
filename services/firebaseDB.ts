import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc, 
  Timestamp 
} from './firebase';
import { User, Job, Application, Company, Experience, SavedJob, JobAlert } from '../types';

// Collections
const COLLECTIONS = {
  USERS: 'users',
  JOBS: 'jobs',
  APPLICATIONS: 'applications',
  COMPANIES: 'companies',
};

// --- USERS ---
export const createUser = async (userId: string, user: Omit<User, 'id'>): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, userId), {
      ...user,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const q = query(collection(db, COLLECTIONS.USERS), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// --- COMPANIES ---
export const createCompany = async (companyId: string, company: Omit<Company, 'id'>): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTIONS.COMPANIES, companyId), {
      ...company,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

export const getCompany = async (companyId: string): Promise<Company | null> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.COMPANIES, companyId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Company;
    }
    return null;
  } catch (error) {
    console.error('Error getting company:', error);
    throw error;
  }
};

export const getCompaniesByOwnerId = async (ownerId: string): Promise<Company[]> => {
  try {
    const q = query(collection(db, COLLECTIONS.COMPANIES), where('ownerId', '==', ownerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
  } catch (error) {
    console.error('Error getting companies by owner:', error);
    throw error;
  }
};

export const updateCompany = async (companyId: string, updates: Partial<Company>): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.COMPANIES, companyId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

export const deleteCompany = async (companyId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.COMPANIES, companyId));
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
};

// --- JOBS ---
export const createJob = async (jobId: string, job: Omit<Job, 'id'>): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTIONS.JOBS, jobId), {
      ...job,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

export const getJob = async (jobId: string): Promise<Job | null> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.JOBS, jobId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Job;
    }
    return null;
  } catch (error) {
    console.error('Error getting job:', error);
    throw error;
  }
};

export const getJobsByCompany = async (companyId: string): Promise<Job[]> => {
  try {
    const q = query(collection(db, COLLECTIONS.JOBS), where('companyId', '==', companyId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
  } catch (error) {
    console.error('Error getting jobs by company:', error);
    throw error;
  }
};

export const getAllJobs = async (): Promise<Job[]> => {
  try {
    const q = query(collection(db, COLLECTIONS.JOBS), where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
  } catch (error) {
    console.error('Error getting all jobs:', error);
    throw error;
  }
};

export const updateJob = async (jobId: string, updates: Partial<Job>): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.JOBS, jobId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

export const deleteJob = async (jobId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.JOBS, jobId));
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

// --- APPLICATIONS ---
export const createApplication = async (appId: string, application: Omit<Application, 'id'>): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTIONS.APPLICATIONS, appId), {
      ...application,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
};

export const getApplication = async (appId: string): Promise<Application | null> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.APPLICATIONS, appId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Application;
    }
    return null;
  } catch (error) {
    console.error('Error getting application:', error);
    throw error;
  }
};

export const getApplicationsByUser = async (userId: string): Promise<Application[]> => {
  try {
    const q = query(collection(db, COLLECTIONS.APPLICATIONS), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
  } catch (error) {
    console.error('Error getting applications by user:', error);
    throw error;
  }
};

export const getApplicationsByJob = async (jobId: string): Promise<Application[]> => {
  try {
    const q = query(collection(db, COLLECTIONS.APPLICATIONS), where('jobId', '==', jobId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
  } catch (error) {
    console.error('Error getting applications by job:', error);
    throw error;
  }
};

export const updateApplication = async (appId: string, updates: Partial<Application>): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.APPLICATIONS, appId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating application:', error);
    throw error;
  }
};

export const deleteApplication = async (appId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.APPLICATIONS, appId));
  } catch (error) {
    console.error('Error deleting application:', error);
    throw error;
  }
};
