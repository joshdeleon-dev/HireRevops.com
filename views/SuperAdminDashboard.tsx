
import React, { useState } from 'react';
import { Job, User, UserRole, PlanTier, Company } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { JobDetails } from './JobDetails'; // Reuse for preview
import { Trash2, Users, Briefcase, Search, ShieldAlert, Database, Edit2, Plus, CheckCircle2, XCircle, Eye, EyeOff, CreditCard } from 'lucide-react';
import * as DB from '../services/database';
import { PLANS } from '../constants';

interface SuperAdminDashboardProps {
  jobs: Job[];
  users: User[];
  onDeleteJob: (id: string) => void;
  onDeleteUser: (id: string) => void;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onUpdateJob: (job: Job) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ 
  jobs, 
  users, 
  onDeleteJob,
  onDeleteUser,
  onAddUser,
  onUpdateUser,
  onUpdateJob
}) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'users' | 'subscriptions' | 'database'>('users');
  const [dbEntity, setDbEntity] = useState<'users' | 'jobs' | 'companies' | 'applications'>('users');
  const [companies, setCompanies] = useState<Company[]>(DB.getCompanies()); // Local state for company list

  // --- Modal States ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<Partial<User>>({});

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState<Partial<Job>>({});

  const [previewJob, setPreviewJob] = useState<Job | null>(null);

  const refreshCompanies = () => {
    setCompanies(DB.getCompanies());
  };

  const handleChangePlan = (companyId: string, planId: string) => {
    DB.upgradeSubscription(companyId, planId as PlanTier);
    refreshCompanies();
  };

  // --- User Handlers ---
  const handleOpenUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserForm({ ...user });
    } else {
      setEditingUser(null);
      setUserForm({ 
        name: '', email: '', role: UserRole.CANDIDATE, password: 'password', isActive: true, provider: 'email' 
      });
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser({ ...editingUser, ...userForm } as User);
    } else {
      onAddUser({
        ...userForm,
        id: 'u_' + Date.now(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userForm.name || 'User')}&background=random`
      } as User);
    }
    setIsUserModalOpen(false);
  };

  const toggleUserStatus = (user: User) => {
    onUpdateUser({ ...user, isActive: !user.isActive });
  };

  // --- Job Handlers ---
  const handleOpenJobModal = (job: Job) => {
    setEditingJob(job);
    setJobForm({ ...job });
    setIsJobModalOpen(true);
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJob) {
      onUpdateJob({ ...editingJob, ...jobForm } as Job);
      setIsJobModalOpen(false);
    }
  };

  const toggleJobStatus = (job: Job) => {
    onUpdateJob({ ...job, isActive: !job.isActive });
  };

  // Helper to get raw data
  const getRawData = () => {
    switch (dbEntity) {
      case 'users': return DB.getUsers();
      case 'jobs': return DB.getJobs();
      case 'companies': return DB.getCompanies();
      case 'applications': return DB.getApplications();
      default: return [];
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white shadow-xl">
         <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-900/50">
             <ShieldAlert className="w-6 h-6 text-white" />
           </div>
           <div>
             <h2 className="font-bold text-xl">Super Admin Console</h2>
             <p className="text-slate-400 text-sm">Full platform control enabled. Manage active entities.</p>
           </div>
         </div>
         <div className="flex gap-2">
            <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-300">
               Total Users: <span className="text-white font-bold ml-1">{users.length}</span>
            </div>
            <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-300">
               Total Jobs: <span className="text-white font-bold ml-1">{jobs.length}</span>
            </div>
         </div>
      </div>

      <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-1 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors ${activeTab === 'users' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          <Users className="w-4 h-4" /> User Management
        </button>
        <button 
          onClick={() => setActiveTab('jobs')}
           className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors ${activeTab === 'jobs' ? 'border-purple-600 text-purple-700 bg-purple-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          <Briefcase className="w-4 h-4" /> Job Listings
        </button>
        <button 
          onClick={() => { setActiveTab('subscriptions'); refreshCompanies(); }}
           className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors ${activeTab === 'subscriptions' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          <CreditCard className="w-4 h-4" /> Subscriptions
        </button>
        <button 
          onClick={() => setActiveTab('database')}
           className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors ${activeTab === 'database' ? 'border-slate-600 text-slate-700 bg-slate-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          <Database className="w-4 h-4" /> Raw Database
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
        {activeTab === 'users' && (
          <div>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-gray-700">All Registered Users</h3>
               <Button size="sm" onClick={() => handleOpenUserModal()} icon={<Plus className="w-4 h-4" />}>Add User</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors ${!user.isActive ? 'bg-red-50/30' : ''}`}>
                      <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                        {user.avatar && <img src={user.avatar} className="w-8 h-8 rounded-full border border-gray-200" alt="" />}
                        <div>
                           <div>{user.name}</div>
                           <div className="text-gray-400 text-xs">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          user.role === 'EMPLOYER' ? 'bg-purple-100 text-purple-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => toggleUserStatus(user)} className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full border transition-colors ${user.isActive !== false ? 'bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'}`}>
                           {user.isActive !== false ? <CheckCircle2 className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                           {user.isActive !== false ? 'Active' : 'Suspended'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-xs">
                         <div className="text-gray-500">ID: {user.id}</div>
                         {user.companyId && <div className="text-purple-600">Co: {user.companyId}</div>}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenUserModal(user)} title="Edit">
                           <Edit2 className="w-4 h-4 text-gray-500" />
                        </Button>
                        {user.role !== 'ADMIN' && (
                          <Button size="sm" variant="ghost" onClick={() => onDeleteUser(user.id)} title="Delete">
                             <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div>
             <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-gray-700">Platform Job Listings</h3>
               <div className="text-xs text-gray-400">Total: {jobs.length}</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Job Title</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Stats</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobs.map(job => (
                    <tr key={job.id} className={`hover:bg-gray-50/50 ${!job.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
                        <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                        <td className="px-6 py-4">
                           <div className="font-medium">{job.companyName}</div>
                           <div className="text-xs text-gray-400">{job.location}</div>
                        </td>
                        <td className="px-6 py-4">
                           <button onClick={() => toggleJobStatus(job)} className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full border transition-colors ${job.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                              {job.isActive ? 'Published' : 'Draft/Hidden'}
                           </button>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                           <div>{job.views || 0} views</div>
                           <div>{job.clicks || 0} clicks</div>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                           <Button size="sm" variant="ghost" onClick={() => setPreviewJob(job)} title="Preview">
                              <Eye className="w-4 h-4 text-gray-500" />
                           </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleOpenJobModal(job)} title="Edit">
                              <Edit2 className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => onDeleteJob(job.id)} title="Delete">
                             <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div>
             <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-gray-700">Company Subscriptions</h3>
               <div className="text-xs text-gray-400">Total: {companies.length}</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Current Plan</th>
                    <th className="px-6 py-4">Renews</th>
                    <th className="px-6 py-4">Limits</th>
                    <th className="px-6 py-4">Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {companies.map(comp => (
                      <tr key={comp.id}>
                         <td className="px-6 py-4 font-medium text-gray-900">{comp.name}</td>
                         <td className="px-6 py-4">
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold uppercase">
                               {PLANS[comp.subscription.planId].name}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-xs">
                            {comp.subscription.renewsAt ? new Date(comp.subscription.renewsAt).toLocaleDateString() : 'N/A'}
                         </td>
                         <td className="px-6 py-4 text-xs">
                            Jobs: {comp.subscription.jobCredits === -1 ? 'Unlimited' : comp.subscription.jobCredits}
                         </td>
                         <td className="px-6 py-4">
                            <select 
                               className="border border-gray-300 rounded text-xs p-1"
                               value={comp.subscription.planId}
                               onChange={(e) => handleChangePlan(comp.id, e.target.value)}
                            >
                               {Object.keys(PLANS).map(key => (
                                  <option key={key} value={key}>{PLANS[key as PlanTier].name}</option>
                               ))}
                            </select>
                         </td>
                      </tr>
                   ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="p-6">
            <div className="flex gap-2 mb-4 border-b border-gray-100 pb-4 overflow-x-auto">
              {(['users', 'jobs', 'companies', 'applications'] as const).map((entity) => (
                <button
                  key={entity}
                  onClick={() => setDbEntity(entity)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    dbEntity === entity 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {entity}
                </button>
              ))}
            </div>
            
            <div className="bg-slate-950 rounded-xl p-6 overflow-auto max-h-[600px] border border-slate-800 shadow-inner">
              <pre className="text-xs md:text-sm font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap break-all">
                {JSON.stringify(getRawData(), null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* User Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={editingUser ? "Edit User" : "Add New User"}>
         <form onSubmit={handleSaveUser} className="space-y-4">
            <div>
               <label className="block text-sm font-medium mb-1">Full Name</label>
               <input required className="w-full border rounded p-2" value={userForm.name || ''} onChange={e => setUserForm({...userForm, name: e.target.value})} />
            </div>
            <div>
               <label className="block text-sm font-medium mb-1">Email</label>
               <input required type="email" className="w-full border rounded p-2" value={userForm.email || ''} onChange={e => setUserForm({...userForm, email: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select className="w-full border rounded p-2" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as UserRole})}>
                     <option value={UserRole.CANDIDATE}>Candidate</option>
                     <option value={UserRole.EMPLOYER}>Employer</option>
                     <option value={UserRole.ADMIN}>Admin</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select className="w-full border rounded p-2" value={userForm.isActive !== false ? 'true' : 'false'} onChange={e => setUserForm({...userForm, isActive: e.target.value === 'true'})}>
                     <option value="true">Active</option>
                     <option value="false">Suspended</option>
                  </select>
               </div>
            </div>
            {!editingUser && (
               <div>
                 <label className="block text-sm font-medium mb-1">Password</label>
                 <input className="w-full border rounded p-2" value={userForm.password || ''} onChange={e => setUserForm({...userForm, password: e.target.value})} />
               </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
               <Button type="button" variant="ghost" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
               <Button type="submit">Save User</Button>
            </div>
         </form>
      </Modal>

      {/* Job Edit Modal (Admin Version) */}
      <Modal isOpen={isJobModalOpen} onClose={() => setIsJobModalOpen(false)} title="Edit Job (Admin Override)">
         <form onSubmit={handleSaveJob} className="space-y-4">
            <div>
               <label className="block text-sm font-medium mb-1">Title</label>
               <input className="w-full border rounded p-2" value={jobForm.title || ''} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium mb-1">Company Name</label>
                 <input className="w-full border rounded p-2" value={jobForm.companyName || ''} onChange={e => setJobForm({...jobForm, companyName: e.target.value})} />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">Location</label>
                 <input className="w-full border rounded p-2" value={jobForm.location || ''} onChange={e => setJobForm({...jobForm, location: e.target.value})} />
               </div>
            </div>
             <div>
               <label className="block text-sm font-medium mb-1">Description</label>
               <textarea rows={5} className="w-full border rounded p-2" value={jobForm.description || ''} onChange={e => setJobForm({...jobForm, description: e.target.value})} />
            </div>
            <div className="flex items-center gap-2 py-2">
               <input type="checkbox" id="isActive" checked={jobForm.isActive || false} onChange={e => setJobForm({...jobForm, isActive: e.target.checked})} />
               <label htmlFor="isActive" className="text-sm font-medium">Published / Active</label>
            </div>
             <div className="flex justify-end gap-2 pt-4">
               <Button type="button" variant="ghost" onClick={() => setIsJobModalOpen(false)}>Cancel</Button>
               <Button type="submit">Update Job</Button>
            </div>
         </form>
      </Modal>

      {/* Job Preview */}
      {previewJob && (
         <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
            <JobDetails 
               job={previewJob} 
               onApply={() => {}} 
               onBack={() => setPreviewJob(null)} 
               currentUser={null}
               onToggleSave={() => {}}
            />
            <div className="fixed bottom-0 w-full bg-slate-900 text-white p-4 text-center z-50">
               <span className="font-bold mr-4">Admin Preview Mode</span>
               <Button size="sm" variant="secondary" onClick={() => setPreviewJob(null)}>Close Preview</Button>
            </div>
         </div>
      )}

    </div>
  );
};
