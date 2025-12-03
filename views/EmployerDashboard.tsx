
import React, { useState, useEffect } from 'react';
import { Job, User, Application, Company, ApplicationStatus, EmployerSubRole, Invoice, PlanTier } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { generateJobDescription } from '../services/geminiService';
import { JobDetails } from './JobDetails'; // Reuse JobDetails for preview
import * as DB from '../services/database';
import { MOCK_INVOICES, PLANS } from '../constants';
import { 
  Plus, Trash2, Wand2, Users, Briefcase, FileText, Search, 
  Building2, TrendingUp, CreditCard, LayoutDashboard, Settings, 
  MessageSquare, Calendar, ChevronRight, CheckCircle2, XCircle, Clock,
  Edit2, User as UserIcon, MapPin, Eye, ExternalLink, List, Grid, Download, CheckSquare, Square, Lock
} from 'lucide-react';

interface EmployerDashboardProps {
  user: User;
  onAddJob: (job: Omit<Job, 'id' | 'postedAt' | 'companyId' | 'companyName' | 'authorId'>) => void;
  onUpdateJob: (job: Job) => void;
  onDeleteJob: (id: string) => void;
  onNavigateToPricing?: () => void;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ 
  user, 
  onAddJob, 
  onUpdateJob, 
  onDeleteJob,
  onNavigateToPricing
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'ats' | 'talent' | 'company' | 'billing'>('overview');
  
  // Data State
  const [company, setCompany] = useState<Company | undefined>(undefined);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [talentPool, setTalentPool] = useState<User[]>([]);
  const [talentSearch, setTalentSearch] = useState('');

  // Access State
  const [canPost, setCanPost] = useState(false);
  const [postError, setPostError] = useState('');
  const [canViewTalent, setCanViewTalent] = useState(false);
  const [talentError, setTalentError] = useState('');

  // Talent Pool View State
  const [talentViewMode, setTalentViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTalentIds, setSelectedTalentIds] = useState<Set<string>>(new Set());

  // Selected Item State for Modals
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [internalNote, setInternalNote] = useState('');
  
  // Candidate Profile View State
  const [profileToView, setProfileToView] = useState<User | null>(null);

  // Job Preview State
  const [previewJob, setPreviewJob] = useState<Job | null>(null);

  // Job Form State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobForm, setJobForm] = useState({ 
    title: '', location: '', type: 'Full-time', salaryRange: '', description: '', directApplyUrl: '' 
  });

  // Company Edit State
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [editCompanyData, setEditCompanyData] = useState<Partial<Company>>({});

  useEffect(() => {
    refreshData();
  }, [user]);

  const refreshData = () => {
    if (!user.companyId) return;
    const comp = DB.getCompanyById(user.companyId);
    setCompany(comp);
    setCompanyJobs(DB.getJobsByCompany(user.companyId));
    setApplicants(DB.getEmployerApplications(user.id));
    setTalentPool(DB.searchCandidates(talentSearch));

    // Check limits
    if (comp) {
       const limitCheck = DB.canPostJob(comp.id);
       setCanPost(limitCheck.allowed);
       setPostError(limitCheck.reason || '');

       const talentCheck = DB.canAccessTalent(comp.id);
       setCanViewTalent(talentCheck.allowed);
       setTalentError(talentCheck.reason || '');
    }
  };

  // --- Handlers ---

  const handleAI = async () => {
    if (!jobForm.title || !company?.name || !jobForm.location) {
      alert("Please fill in Title and Location to generate a description.");
      return;
    }
    setIsGenerating(true);
    const desc = await generateJobDescription(jobForm.title, company.name, jobForm.location);
    setJobForm(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleOpenJobModal = (job?: Job) => {
    // Check limit before opening create modal
    if (!job && !canPost) {
       alert(postError);
       return;
    }

    if (job) {
      setIsEditMode(true);
      setEditingJobId(job.id);
      setJobForm({
        title: job.title,
        location: job.location,
        type: job.type,
        salaryRange: job.salaryRange || '',
        description: job.description,
        directApplyUrl: job.directApplyUrl || ''
      });
    } else {
      setIsEditMode(false);
      setEditingJobId(null);
      setJobForm({ title: '', location: '', type: 'Full-time', salaryRange: '', description: '', directApplyUrl: '' });
    }
    setIsJobModalOpen(true);
  };

  const handleSubmitJob = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && editingJobId) {
      const originalJob = companyJobs.find(j => j.id === editingJobId);
      if (originalJob) {
        onUpdateJob({
          ...originalJob,
          title: jobForm.title,
          location: jobForm.location,
          type: jobForm.type as any,
          salaryRange: jobForm.salaryRange,
          description: jobForm.description,
          directApplyUrl: jobForm.directApplyUrl
        });
      }
    } else {
      onAddJob({
        title: jobForm.title,
        location: jobForm.location,
        type: jobForm.type as any,
        salaryRange: jobForm.salaryRange,
        description: jobForm.description,
        requirements: ['TBD'], 
        isActive: true,
        directApplyUrl: jobForm.directApplyUrl
      });
    }
    
    setIsJobModalOpen(false);
    setJobForm({ title: '', location: '', type: 'Full-time', salaryRange: '', description: '', directApplyUrl: '' });
    refreshData();
  };

  const handleUpdateAppStatus = (status: ApplicationStatus) => {
    if (!selectedApplicant) return;
    DB.updateApplicationStatus(selectedApplicant.id, status);
    setSelectedApplicant(prev => prev ? { ...prev, status } : null);
    refreshData();
  };

  const handleSaveNote = () => {
    if (!selectedApplicant) return;
    DB.updateApplication({
      ...selectedApplicant,
      internalNotes: internalNote
    });
    alert('Note saved');
    refreshData();
  };

  const handleSearchTalent = (e: React.FormEvent) => {
    e.preventDefault();
    if (canViewTalent) {
      setTalentPool(DB.searchCandidates(talentSearch));
    }
  };

  const handleViewCandidateProfile = (userId: string) => {
    const candidate = DB.getUserById(userId);
    if (candidate) {
      setProfileToView(candidate);
    }
  };

  const handleUpdateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    DB.updateCompany({ ...company, ...editCompanyData } as Company);
    setIsEditingCompany(false);
    refreshData();
  };

  // --- Talent Pool Actions ---

  const toggleTalentSelection = (userId: string) => {
    const newSelected = new Set(selectedTalentIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedTalentIds(newSelected);
  };

  const toggleSelectAllTalent = () => {
    if (selectedTalentIds.size === talentPool.length) {
      setSelectedTalentIds(new Set());
    } else {
      setSelectedTalentIds(new Set(talentPool.map(u => u.id)));
    }
  };

  const handleExportCandidates = () => {
    if (selectedTalentIds.size === 0) return;
    const candidatesToExport = talentPool.filter(u => selectedTalentIds.has(u.id));
    const headers = ['ID', 'Name', 'Email', 'Role', 'Title', 'Bio', 'Skills', 'Resume URL', 'Preferences'];
    const rows = candidatesToExport.map(c => [
      c.id, `"${c.name}"`, c.email, c.role, `"${c.title || ''}"`, `"${(c.bio || '').replace(/"/g, '""')}"`, `"${(c.skills || []).join(', ')}"`, c.resumeUrl || '', `"${c.preferences?.isOpenToWork ? 'Open' : 'Closed'}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `candidates_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user.companyId || !company) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold mb-2">Setup Required</h2>
          <p className="text-gray-500 mb-6">Your account is not linked to a company profile. Please contact support.</p>
        </div>
      </div>
    );
  }

  const SidebarItem = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
        activeTab === id 
          ? 'bg-purple-50 text-purple-700' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className="w-4 h-4 mr-3" />
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:block">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <img src={company.logo} alt="Logo" className="w-10 h-10 rounded-lg border border-gray-100" />
          <div className="overflow-hidden">
             <h2 className="font-bold text-gray-900 truncate">{company.name}</h2>
             <p className="text-xs text-gray-500 capitalize">{user.employerSubRole || 'Admin'}</p>
          </div>
        </div>
        <div className="p-4">
          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Hiring</p>
            <SidebarItem id="overview" label="Overview" icon={LayoutDashboard} />
            <SidebarItem id="jobs" label="Jobs Listings" icon={Briefcase} />
            <SidebarItem id="ats" label="Candidates (ATS)" icon={Users} />
            <SidebarItem id="talent" label="Talent Pool" icon={Search} />
          </div>
          <div>
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Organization</p>
            <SidebarItem id="company" label="Company Profile" icon={Building2} />
            <SidebarItem id="billing" label="Billing & Plans" icon={CreditCard} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-8 max-w-7xl mx-auto">
        
        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                   <div>
                     <p className="text-sm text-gray-500 font-medium">Active Jobs</p>
                     <h3 className="text-3xl font-bold text-gray-900 mt-2">{companyJobs.filter(j => j.isActive).length}</h3>
                   </div>
                   <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Briefcase className="w-5 h-5" /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                   <div>
                     <p className="text-sm text-gray-500 font-medium">Total Applicants</p>
                     <h3 className="text-3xl font-bold text-gray-900 mt-2">{applicants.length}</h3>
                   </div>
                   <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Users className="w-5 h-5" /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                   <div>
                     <p className="text-sm text-gray-500 font-medium">Plan Usage</p>
                     <h3 className="text-3xl font-bold text-gray-900 mt-2">
                        {company.subscription.jobCredits === -1 ? 'Unlimited' : `${companyJobs.filter(j=>j.isActive).length} / ${company.subscription.jobCredits}`}
                     </h3>
                     <p className="text-xs text-gray-400 mt-1">Job Posts</p>
                   </div>
                   <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><CreditCard className="w-5 h-5" /></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: JOBS */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h1 className="text-2xl font-bold text-gray-900">Job Listings</h1>
               <Button onClick={() => handleOpenJobModal()} icon={<Plus className="w-4 h-4" />} className="bg-purple-600" disabled={!canPost}>Post Job</Button>
            </div>
            
            {!canPost && (
               <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  {postError} <button onClick={onNavigateToPricing} className="font-bold underline ml-2">Upgrade Plan</button>
               </div>
            )}
            
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
               <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">Title</th>
                      <th className="px-6 py-4 font-medium">Location</th>
                      <th className="px-6 py-4 font-medium">Views</th>
                      <th className="px-6 py-4 font-medium">Applicants</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {companyJobs.map(job => (
                        <tr key={job.id} className="hover:bg-gray-50">
                           <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                           <td className="px-6 py-4 text-gray-500">{job.location}</td>
                           <td className="px-6 py-4 text-gray-500">{job.views || 0}</td>
                           <td className="px-6 py-4 text-gray-500">{applicants.filter(a => a.jobId === job.id).length}</td>
                           <td className="px-6 py-4 text-right flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setPreviewJob(job)} title="Preview Job">
                                <Eye className="w-4 h-4 text-gray-500" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleOpenJobModal(job)} title="Edit Job">
                                <Edit2 className="w-4 h-4 text-gray-500" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => onDeleteJob(job.id)} title="Archive/Delete">
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </Button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {companyJobs.length === 0 && <div className="p-8 text-center text-gray-500">No jobs posted yet.</div>}
            </div>
          </div>
        )}

        {/* TAB: ATS (CANDIDATES) */}
        {activeTab === 'ats' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
               <h1 className="text-2xl font-bold text-gray-900">Candidate Pipeline</h1>
             </div>
             
             {/* Kanban-ish List View */}
             <div className="grid grid-cols-1 gap-4">
               {applicants.map(app => (
                 <div key={app.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                       <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 overflow-hidden">
                          {app.candidateName?.charAt(0)}
                       </div>
                       <div>
                         <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">{app.candidateName}</h3>
                             <button 
                               onClick={() => handleViewCandidateProfile(app.userId)}
                               className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full p-1"
                               title="View Profile"
                             >
                                <ExternalLink className="w-4 h-4" />
                             </button>
                         </div>
                         <p className="text-sm text-gray-500">Applied for <span className="text-purple-600 font-medium">{app.jobTitle}</span></p>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                         ${app.status === 'APPLIED' ? 'bg-blue-100 text-blue-700' : ''}
                         ${app.status === 'REVIEWING' ? 'bg-yellow-100 text-yellow-700' : ''}
                         ${app.status === 'INTERVIEW' ? 'bg-purple-100 text-purple-700' : ''}
                         ${app.status === 'OFFER' ? 'bg-emerald-100 text-emerald-700' : ''}
                         ${app.status === 'REJECTED' ? 'bg-gray-100 text-gray-500' : ''}
                       `}>
                         {app.status}
                       </div>
                       <Button size="sm" variant="outline" onClick={() => {
                         setSelectedApplicant(app);
                         setInternalNote(app.internalNotes || '');
                       }}>
                         Manage Status
                       </Button>
                    </div>
                 </div>
               ))}
               {applicants.length === 0 && <div className="text-center py-10 text-gray-400">No candidates found.</div>}
             </div>
          </div>
        )}

        {/* TAB: TALENT POOL */}
        {activeTab === 'talent' && (
          <div className="space-y-6 relative">
             {!canViewTalent && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-8">
                   <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-lg">
                      <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Talent Pool Locked</h2>
                      <p className="text-gray-600 mb-6">{talentError}</p>
                      <Button onClick={onNavigateToPricing} className="bg-emerald-600 w-full">Upgrade to Access Talent</Button>
                   </div>
                </div>
             )}

             <div className="bg-slate-900 text-white p-8 rounded-2xl mb-8">
               <h2 className="text-2xl font-bold mb-2">Search the RevOps Talent Pool</h2>
               <p className="text-slate-400 mb-6">Find candidates with specific skills like Salesforce, CPQ, or Marketo.</p>
               <form onSubmit={handleSearchTalent} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Search by skill, title, or name..." 
                    className="flex-1 px-4 py-3 rounded-lg text-slate-900 focus:outline-none"
                    value={talentSearch}
                    onChange={e => setTalentSearch(e.target.value)}
                  />
                  <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 border-0">Search</Button>
               </form>
             </div>
             
             {/* Toolbar */}
             <div className="flex justify-between items-center mb-4 bg-white p-2 rounded-lg border border-gray-200">
               <div className="flex items-center gap-2">
                 <button onClick={toggleSelectAllTalent} className="p-2 hover:bg-gray-100 rounded-md text-gray-500">
                    {selectedTalentIds.size > 0 && selectedTalentIds.size === talentPool.length ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                 </button>
                 <span className="text-sm text-gray-500">{selectedTalentIds.size} selected</span>
                 {selectedTalentIds.size > 0 && (
                    <Button size="sm" variant="outline" onClick={handleExportCandidates}>
                      <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                 )}
               </div>
               <div className="flex gap-1">
                 <button 
                   onClick={() => setTalentViewMode('grid')} 
                   className={`p-2 rounded-md ${talentViewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   <Grid className="w-5 h-5" />
                 </button>
                 <button 
                   onClick={() => setTalentViewMode('list')} 
                   className={`p-2 rounded-md ${talentViewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   <List className="w-5 h-5" />
                 </button>
               </div>
             </div>

             {talentViewMode === 'grid' ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {talentPool.map(candidate => (
                   <div key={candidate.id} className={`relative bg-white p-6 rounded-xl border transition-all ${selectedTalentIds.has(candidate.id) ? 'border-purple-500 shadow-md bg-purple-50/20' : 'border-gray-200 shadow-sm hover:shadow-md'}`}>
                      <div className="absolute top-4 left-4">
                        <input 
                           type="checkbox" 
                           checked={selectedTalentIds.has(candidate.id)} 
                           onChange={() => toggleTalentSelection(candidate.id)}
                           className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex items-start gap-4 pl-8">
                         <img src={candidate.avatar} className="w-12 h-12 rounded-full" alt="" />
                         <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{candidate.name}</h3>
                            <p className="text-sm text-purple-600 font-medium mb-2">{candidate.title}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                               {candidate.skills?.slice(0, 4).map(skill => (
                                 <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">{skill}</span>
                               ))}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full"
                              onClick={() => handleViewCandidateProfile(candidate.id)}
                            >
                              View Profile
                            </Button>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                     <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                        <tr>
                          <th className="px-4 py-4 w-10"></th>
                          <th className="px-6 py-4 font-medium">Candidate</th>
                          <th className="px-6 py-4 font-medium">Current Title</th>
                          <th className="px-6 py-4 font-medium">Skills</th>
                          <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {talentPool.map(candidate => (
                           <tr key={candidate.id} className={`hover:bg-gray-50 ${selectedTalentIds.has(candidate.id) ? 'bg-purple-50/30' : ''}`}>
                             <td className="px-4 py-4 text-center">
                                <input 
                                   type="checkbox" 
                                   checked={selectedTalentIds.has(candidate.id)} 
                                   onChange={() => toggleTalentSelection(candidate.id)}
                                   className="rounded border-gray-300 text-purple-600"
                                />
                             </td>
                             <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                <img src={candidate.avatar} className="w-8 h-8 rounded-full" alt="" />
                                {candidate.name}
                             </td>
                             <td className="px-6 py-4 text-gray-600">{candidate.title}</td>
                             <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{(candidate.skills || []).join(', ')}</td>
                             <td className="px-6 py-4 text-right">
                                <Button size="sm" variant="ghost" onClick={() => handleViewCandidateProfile(candidate.id)}>
                                   View Profile
                                </Button>
                             </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                </div>
             )}
          </div>
        )}

        {/* TAB: COMPANY */}
        {activeTab === 'company' && (
           <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
                 {!isEditingCompany && <Button onClick={() => {
                   setEditCompanyData(company);
                   setIsEditingCompany(true);
                 }} variant="outline">Edit Profile</Button>}
              </div>

              {isEditingCompany ? (
                 <form onSubmit={handleUpdateCompany} className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                    {/* (Existing company edit form fields) */}
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-sm font-medium mb-1">Company Name</label>
                         <input className="w-full border rounded p-2" value={editCompanyData.name || ''} onChange={e => setEditCompanyData({...editCompanyData, name: e.target.value})} />
                       </div>
                       <div>
                         <label className="block text-sm font-medium mb-1">Website</label>
                         <input className="w-full border rounded p-2" value={editCompanyData.website || ''} onChange={e => setEditCompanyData({...editCompanyData, website: e.target.value})} />
                       </div>
                    </div>
                    <div>
                       <label className="block text-sm font-medium mb-1">Description</label>
                       <textarea className="w-full border rounded p-2" rows={3} value={editCompanyData.description || ''} onChange={e => setEditCompanyData({...editCompanyData, description: e.target.value})} />
                    </div>
                    {/* ... other fields ... */}
                    <div className="flex justify-end gap-3 pt-4">
                       <Button type="button" variant="ghost" onClick={() => setIsEditingCompany(false)}>Cancel</Button>
                       <Button type="submit">Save Changes</Button>
                    </div>
                 </form>
              ) : (
                 <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
                    <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                       <img src={company.logo} className="w-20 h-20 rounded-xl" alt="" />
                       <div>
                          <h2 className="text-xl font-bold">{company.name}</h2>
                          <a href={company.website || '#'} className="text-purple-600 hover:underline">{company.website || 'No website'}</a>
                       </div>
                    </div>
                    {/* ... display fields ... */}
                    <p className="text-gray-600">{company.description}</p>
                 </div>
              )}
           </div>
        )}

        {/* TAB: BILLING */}
        {activeTab === 'billing' && (
           <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
              
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 text-white flex flex-col md:flex-row justify-between items-center shadow-lg gap-6">
                 <div>
                    <div className="text-emerald-400 font-bold tracking-wider text-sm mb-1 uppercase">
                       {PLANS[company.subscription.planId].name} PLAN
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                       <h2 className="text-3xl font-bold">${PLANS[company.subscription.planId].price}</h2>
                       <span className="text-slate-400">/mo</span>
                    </div>
                    <div className="text-slate-400 text-sm space-y-1">
                       <p>• {company.subscription.jobCredits === -1 ? 'Unlimited' : `${company.subscription.jobCredits} Monthly`} Job Posts</p>
                       <p>• {company.subscription.talentAccessExpiresAt ? `Talent Access until ${new Date(company.subscription.talentAccessExpiresAt).toLocaleDateString()}` : 'Unlimited Talent Access'}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100" onClick={onNavigateToPricing}>
                       {company.subscription.planId === PlanTier.ENTERPRISE ? 'Manage Plan' : 'Upgrade Plan'}
                    </Button>
                    {company.subscription.renewsAt && (
                       <p className="text-xs text-slate-500 mt-2">Renews on {new Date(company.subscription.renewsAt).toLocaleDateString()}</p>
                    )}
                 </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                 <div className="p-6 border-b border-gray-100 font-bold text-gray-900">Invoice History</div>
                 <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {MOCK_INVOICES.map(inv => (
                         <tr key={inv.id}>
                            <td className="px-6 py-4">{inv.date}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{inv.description}</td>
                            <td className="px-6 py-4">${inv.amount}.00</td>
                            <td className="px-6 py-4"><span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">PAID</span></td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

      </div>

      {/* --- MODALS --- */}
      
      {/* Create/Edit Job Modal */}
      <Modal isOpen={isJobModalOpen} onClose={() => setIsJobModalOpen(false)} title={isEditMode ? "Edit Job Listing" : "Post New Job"}>
        <form onSubmit={handleSubmitJob} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Job Title</label>
            <input required className="w-full border rounded p-2" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input required className="w-full border rounded p-2" value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select className="w-full border rounded p-2" value={jobForm.type} onChange={e => setJobForm({...jobForm, type: e.target.value})}>
                <option>Full-time</option>
                <option>Remote</option>
                <option>Contract</option>
              </select>
            </div>
          </div>
          {/* ... other fields ... */}
          <div>
             <label className="block text-sm font-medium mb-1">Salary Range</label>
             <input className="w-full border rounded p-2" value={jobForm.salaryRange} onChange={e => setJobForm({...jobForm, salaryRange: e.target.value})} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
               <label className="block text-sm font-medium">Description</label>
               <Button type="button" variant="ghost" size="sm" onClick={handleAI} isLoading={isGenerating} className="text-xs text-purple-600">
                  <Wand2 className="w-3 h-3 mr-1" /> AI Write
               </Button>
            </div>
            <textarea required rows={5} className="w-full border rounded p-2" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsJobModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-purple-600">{isEditMode ? "Update Job" : "Publish Job"}</Button>
          </div>
        </form>
      </Modal>

      {/* Candidate Profile Modal */}
      <Modal isOpen={!!profileToView} onClose={() => setProfileToView(null)} title="Candidate Profile">
         {/* ... (Existing profile render logic) ... */}
         {profileToView && (
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              {profileToView.avatar ? (
                <img src={profileToView.avatar} className="w-20 h-20 rounded-xl object-cover border border-gray-100" alt="" />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-gray-400" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{profileToView.name}</h2>
                <p className="text-lg text-emerald-600 font-medium mb-2">{profileToView.title || 'No title set'}</p>
                <p className="text-gray-600 text-sm leading-relaxed max-w-lg">{profileToView.bio || 'No bio added.'}</p>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setProfileToView(null)}>Close</Button>
            </div>
          </div>
         )}
      </Modal>

      {/* Applicant Evaluation Modal */}
      <Modal isOpen={!!selectedApplicant} onClose={() => setSelectedApplicant(null)} title="Candidate Evaluation">
        {selectedApplicant && (
           <div className="space-y-6">
              {/* ... (Existing applicant evaluation render) ... */}
              <div className="flex justify-end">
                 <Button onClick={() => setSelectedApplicant(null)}>Close</Button>
              </div>
           </div>
        )}
      </Modal>

    </div>
  );
};
