
import React, { useState, useEffect } from 'react';
import { User, Job, Application, UserRole, ViewState, ApplicationStatus } from './types';
import * as DB from './services/database';
import { JobBoard } from './views/JobBoard';
import { EmployerDashboard } from './views/EmployerDashboard';
import { SuperAdminDashboard } from './views/SuperAdminDashboard';
import { UserDashboard } from './views/UserDashboard';
import { JobDetails } from './views/JobDetails';
import { PricingView } from './views/Pricing';
import { LoginView, SignupChoiceView, SignupCandidateView, SignupEmployerView } from './views/Auth';
import { Button } from './components/Button';
import { LogOut, Menu, X, User as UserIcon, Activity } from 'lucide-react';

const App: React.FC = () => {
  // Global State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  // Data State - Loaded from DB Service
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  // Initialize
  useEffect(() => {
    refreshData();
    const sessionUser = DB.getSession();
    if (sessionUser) {
      setCurrentUser(sessionUser);
    }
  }, []);

  const refreshData = () => {
    setJobs(DB.getJobs());
    setUsers(DB.getUsers());
    setApplications(DB.getApplications());
    
    // Refresh current user if logged in to catch profile updates
    const sessionUser = DB.getSession();
    if (sessionUser) {
      setCurrentUser(sessionUser);
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (userId: string) => {
    const user = DB.getUserById(userId);
    if (user) {
      // Check if suspended
      if (user.isActive === false) {
        alert("Your account has been suspended. Please contact support.");
        return;
      }
      
      setCurrentUser(user);
      DB.setSession(user.id);
      
      // Smart Redirect based on Role
      if (user.role === UserRole.ADMIN) setCurrentView('ADMIN_DASHBOARD');
      else if (user.role === UserRole.EMPLOYER) setCurrentView('EMPLOYER_DASHBOARD');
      else setCurrentView('HOME');
      
      refreshData();
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    DB.clearSession();
    setCurrentView('HOME');
    setIsMobileMenuOpen(false);
  };

  // Job Handlers (Employer)
  const handleAddJob = (newJob: Omit<Job, 'id' | 'postedAt' | 'companyId' | 'companyName' | 'authorId'>) => {
    if (!currentUser || currentUser.role !== UserRole.EMPLOYER || !currentUser.companyId) return;

    const company = DB.getCompanyById(currentUser.companyId);
    if (!company) return;

    const job: Job = {
      ...newJob,
      id: Math.random().toString(36).substr(2, 9),
      postedAt: new Date().toISOString(),
      authorId: currentUser.id,
      companyId: company.id,
      companyName: company.name,
      views: 0,
      clicks: 0
    };
    DB.addJob(job);
    refreshData();
  };

  const handleUpdateJob = (updatedJob: Job) => {
    DB.updateJob(updatedJob);
    refreshData();
  };

  // Admin Handlers
  const handleDeleteJob = (id: string) => {
    DB.deleteJob(id);
    refreshData();
  };

  const handleDeleteUser = (id: string) => {
    DB.deleteUser(id);
    refreshData();
  };

  const handleAddUser = (user: User) => {
    DB.addUser(user);
    refreshData();
  };

  const handleUpdateUser = (user: User) => {
    DB.updateUser(user);
    refreshData();
  };

  const handleApply = (jobId: string) => {
    if (!currentUser) {
      setCurrentView('LOGIN');
      return;
    }
    
    if (currentUser.role !== UserRole.CANDIDATE) {
      alert("Only candidates can apply to jobs.");
      return;
    }
    
    // Check if already applied
    const existing = applications.find(a => a.jobId === jobId && a.userId === currentUser.id);
    if (existing) {
      alert("You have already applied for this position.");
      return;
    }

    const job = jobs.find(j => j.id === jobId);
    const app: Application = {
      id: Math.random().toString(36).substr(2, 9),
      jobId,
      userId: currentUser.id,
      status: ApplicationStatus.APPLIED,
      appliedAt: new Date().toISOString(),
      // Denormalized info
      candidateName: currentUser.name,
      candidateEmail: currentUser.email,
      jobTitle: job?.title,
      companyName: job?.companyName
    };
    DB.addApplication(app);
    refreshData();
    alert("Application submitted successfully!");
  };

  const handleViewJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentView('JOB_DETAILS');
    window.scrollTo(0, 0);
  };

  const handleToggleSave = (jobId: string) => {
    if (!currentUser) {
      alert("Please login to save jobs.");
      return;
    }
    DB.toggleSavedJob(currentUser.id, jobId);
    refreshData(); // Refresh to update user state globally
  };

  // Derived State
  const userApplications = currentUser ? applications.filter(a => a.userId === currentUser.id) : [];

  // Render Navigation
  const renderNav = () => {
    if (['LOGIN', 'SIGNUP_CHOICE', 'SIGNUP_CANDIDATE', 'SIGNUP_EMPLOYER'].includes(currentView)) return null;

    return (
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-2.5 cursor-pointer group" 
            onClick={() => setCurrentView('HOME')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300">
              <Activity className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Hire<span className="text-emerald-600">RevOps</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {!currentUser ? (
              <>
                 <span className="text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer transition-colors" onClick={() => setCurrentView('HOME')}>Find Jobs</span>
                 <div className="h-6 w-px bg-gray-200"></div>
                <Button variant="ghost" onClick={() => setCurrentView('LOGIN')}>Log In</Button>
                <Button onClick={() => setCurrentView('SIGNUP_CHOICE')} className="bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
              </>
            ) : (
              <>
                {currentUser.role === UserRole.CANDIDATE && (
                  <>
                    <button 
                      onClick={() => setCurrentView('HOME')}
                      className={`text-sm font-medium transition-colors ${currentView === 'HOME' ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Find Jobs
                    </button>
                    <button 
                      onClick={() => setCurrentView('USER_DASHBOARD')}
                      className={`text-sm font-medium transition-colors ${currentView === 'USER_DASHBOARD' ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      My Dashboard
                    </button>
                  </>
                )}
                {currentUser.role === UserRole.EMPLOYER && (
                  <>
                    <button 
                      onClick={() => setCurrentView('HOME')}
                      className={`text-sm font-medium transition-colors ${currentView === 'HOME' ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      View Public Site
                    </button>
                    <button 
                      onClick={() => setCurrentView('EMPLOYER_DASHBOARD')}
                      className={`text-sm font-medium transition-colors ${currentView === 'EMPLOYER_DASHBOARD' ? 'text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Employer Portal
                    </button>
                  </>
                )}
                 {currentUser.role === UserRole.ADMIN && (
                  <>
                    <button 
                      onClick={() => setCurrentView('HOME')}
                      className={`text-sm font-medium transition-colors ${currentView === 'HOME' ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      View Site
                    </button>
                    <button 
                      onClick={() => setCurrentView('ADMIN_DASHBOARD')}
                      className={`text-sm font-medium transition-colors ${currentView === 'ADMIN_DASHBOARD' ? 'text-red-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Super Admin
                    </button>
                  </>
                )}
                
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                
                <div className="flex items-center gap-3 pl-2">
                  <div className="flex flex-col items-end">
                     <span className="text-sm font-bold text-gray-800 leading-none">{currentUser.name}</span>
                     <span className="text-xs text-gray-500 capitalize">{currentUser.role.toLowerCase()}</span>
                  </div>
                  {currentUser.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-white shadow-sm">
                      <UserIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                  )}
                  <button 
                    onClick={handleLogout} 
                    className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4 absolute w-full shadow-xl z-50">
             {!currentUser ? (
              <div className="flex flex-col gap-3">
                <Button variant="ghost" className="justify-start" onClick={() => setCurrentView('LOGIN')}>Log In</Button>
                <Button className="justify-start bg-emerald-600" onClick={() => setCurrentView('SIGNUP_CHOICE')}>Sign Up</Button>
              </div>
             ) : (
               <div className="flex flex-col gap-3">
                  <div className="border-b pb-2 mb-2">
                    <p className="font-medium text-gray-900">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.role}</p>
                  </div>
                  {currentUser.role === UserRole.CANDIDATE && (
                    <Button variant="ghost" className="justify-start" onClick={() => { setCurrentView('USER_DASHBOARD'); setIsMobileMenuOpen(false); }}>My Dashboard</Button>
                  )}
                  {currentUser.role === UserRole.EMPLOYER && (
                     <Button variant="ghost" className="justify-start" onClick={() => { setCurrentView('EMPLOYER_DASHBOARD'); setIsMobileMenuOpen(false); }}>Employer Portal</Button>
                  )}
                  {currentUser.role === UserRole.ADMIN && (
                     <Button variant="ghost" className="justify-start" onClick={() => { setCurrentView('ADMIN_DASHBOARD'); setIsMobileMenuOpen(false); }}>Super Admin</Button>
                  )}
                  <div className="border-t pt-3 mt-1">
                     <Button variant="danger" className="justify-start w-full" onClick={handleLogout}>Sign Out</Button>
                  </div>
               </div>
             )}
          </div>
        )}
      </nav>
    );
  };

  // Render Content
  const renderContent = () => {
    switch (currentView) {
      case 'LOGIN':
        return <LoginView onNavigate={setCurrentView} onLoginSuccess={handleLoginSuccess} />;
      
      case 'SIGNUP_CHOICE':
        return <SignupChoiceView onNavigate={setCurrentView} onLoginSuccess={handleLoginSuccess} />;
      
      case 'SIGNUP_CANDIDATE':
        return <SignupCandidateView onNavigate={setCurrentView} onLoginSuccess={handleLoginSuccess} />;

      case 'SIGNUP_EMPLOYER':
        return <SignupEmployerView onNavigate={setCurrentView} onLoginSuccess={handleLoginSuccess} />;

      case 'ADMIN_DASHBOARD':
        return currentUser?.role === UserRole.ADMIN ? (
          <SuperAdminDashboard 
            jobs={jobs} 
            users={users} 
            onDeleteJob={handleDeleteJob}
            onDeleteUser={handleDeleteUser}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onUpdateJob={handleUpdateJob}
          />
        ) : <div className="text-center p-10">Access Denied</div>;
      
      case 'EMPLOYER_DASHBOARD':
        return currentUser?.role === UserRole.EMPLOYER ? (
          <EmployerDashboard
            user={currentUser}
            onAddJob={handleAddJob}
            onUpdateJob={handleUpdateJob}
            onDeleteJob={handleDeleteJob}
            onNavigateToPricing={() => setCurrentView('PRICING')}
          />
        ) : <div className="text-center p-10">Access Denied. Employer Account Required.</div>;

      case 'PRICING':
        return (
          <PricingView 
            onBack={() => setCurrentView('EMPLOYER_DASHBOARD')} 
            currentUser={currentUser}
            onUpgradeSuccess={refreshData}
          />
        );

      case 'USER_DASHBOARD':
        return currentUser?.role === UserRole.CANDIDATE ? (
          <UserDashboard 
            user={currentUser}
            applications={DB.getCandidateApplications(currentUser.id)} 
            jobs={jobs}
            onUpdateUser={refreshData}
            onViewJob={handleViewJob}
          />
        ) : <div className="text-center p-10">Please login as a candidate.</div>;
      
      case 'JOB_DETAILS':
        const job = jobs.find(j => j.id === selectedJobId);
        return job ? (
          <JobDetails 
            job={job} 
            onApply={handleApply} 
            onBack={() => setCurrentView('HOME')} 
            currentUser={currentUser}
            userApplications={userApplications}
            onToggleSave={handleToggleSave}
          />
        ) : <div className="text-center p-10">Job not found</div>;

      case 'HOME':
      default:
        return (
          <JobBoard 
            jobs={jobs} 
            onApply={handleApply} 
            onViewJob={handleViewJob}
            currentUser={currentUser}
            userApplications={userApplications}
            onToggleSave={handleToggleSave}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {renderNav()}
      <main className="flex-1">
        {renderContent()}
      </main>
      
      {!['LOGIN', 'SIGNUP_CHOICE', 'SIGNUP_CANDIDATE', 'SIGNUP_EMPLOYER'].includes(currentView) && (
        <footer className="bg-white border-t border-gray-200 py-12 mt-auto">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Activity className="text-white w-4 h-4" />
                  </div>
                  <span className="font-bold text-lg tracking-tight">Hire<span className="text-emerald-600">RevOps</span></span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Connecting the best Revenue Operations and GTM talent with the world's most innovative companies. 
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">For Candidates</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">Browse Jobs</a></li>
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">Company Directory</a></li>
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">Salary Data</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">For Employers</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">Post a Job</a></li>
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">Hiring Solutions</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
              <p>&copy; 2024 HireRevOps. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-gray-600">Twitter</a>
                <a href="#" className="hover:text-gray-600">LinkedIn</a>
                <a href="#" className="hover:text-gray-600">Instagram</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
