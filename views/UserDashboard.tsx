
import React, { useState, useEffect } from 'react';
import { Application, Job, ApplicationStatus, User, Experience, JobAlert } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import * as DB from '../services/database';
import { 
  CheckCircle2, Clock, XCircle, MoreHorizontal, FileText, ArrowRight, 
  User as UserIcon, Upload, Briefcase, MapPin, Bookmark, Bell, Settings, 
  Trash2, Plus, Building2, Calendar, Eye, EyeOff, ExternalLink
} from 'lucide-react';

interface UserDashboardProps {
  user: User;
  applications: Application[];
  jobs: Job[];
  onUpdateUser: () => void;
  onViewJob: (jobId: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, applications, jobs, onUpdateUser, onViewJob }) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'profile' | 'experience' | 'saved' | 'alerts' | 'settings'>('applications');
  
  // Data for tabs (refresh on render)
  const savedJobsList = jobs.filter(j => user.savedJobs?.some(s => s.jobId === j.id));
  const myAlerts = user.alerts || [];
  const myExperience = user.experience || [];

  // --- Profile Edit State ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    title: user.title || '',
    bio: user.bio || '',
    skills: user.skills?.join(', ') || '',
    isOpenToWork: user.preferences?.isOpenToWork ?? true,
    resumeUrl: user.resumeUrl || ''
  });

  // --- Experience Edit State ---
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [expForm, setExpForm] = useState<Partial<Experience>>({});

  // --- Alert Edit State ---
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertForm, setAlertForm] = useState({ query: '', frequency: 'weekly' });

  // --- Application Detail State ---
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [appNote, setAppNote] = useState('');

  // --- Handlers ---

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = {
      ...user,
      title: profileData.title,
      bio: profileData.bio,
      skills: profileData.skills.split(',').map(s => s.trim()).filter(Boolean),
      resumeUrl: profileData.resumeUrl,
      preferences: {
        ...user.preferences,
        isOpenToWork: profileData.isOpenToWork
      }
    };
    DB.updateUser(updatedUser);
    setIsEditingProfile(false);
    onUpdateUser();
    alert('Profile updated successfully!');
  };

  const handleResumeUpload = () => {
    const mockUrl = "https://example.com/resume.pdf";
    setProfileData({...profileData, resumeUrl: mockUrl});
    alert("Resume uploaded (simulated).");
  };

  const handleSaveExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.title || !expForm.company) return;
    
    const newExp: Experience = {
      id: Math.random().toString(36).substr(2, 9),
      title: expForm.title,
      company: expForm.company,
      location: expForm.location || '',
      startDate: expForm.startDate || '',
      endDate: expForm.current ? undefined : expForm.endDate,
      current: expForm.current || false,
      description: expForm.description || ''
    };
    
    DB.addExperience(user.id, newExp);
    setIsExpModalOpen(false);
    setExpForm({});
    onUpdateUser();
  };

  const handleDeleteExperience = (expId: string) => {
    DB.removeExperience(user.id, expId);
    onUpdateUser();
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertForm.query) return;
    const newAlert: JobAlert = {
      id: Math.random().toString(36).substr(2, 9),
      query: alertForm.query,
      frequency: alertForm.frequency as any,
      active: true
    };
    DB.addJobAlert(user.id, newAlert);
    setIsAlertModalOpen(false);
    setAlertForm({ query: '', frequency: 'weekly' });
    onUpdateUser();
  };

  const handleDeleteAlert = (id: string) => {
    DB.removeJobAlert(user.id, id);
    onUpdateUser();
  };

  const handleWithdrawApp = () => {
    if (!selectedApp) return;
    if (confirm("Are you sure you want to withdraw this application? This cannot be undone.")) {
      DB.withdrawApplication(selectedApp.id);
      setSelectedApp(null);
      onUpdateUser();
    }
  };

  const handleSaveAppNote = () => {
    if (!selectedApp) return;
    DB.updateApplication({
      ...selectedApp,
      candidateNotes: appNote
    });
    alert("Note saved.");
    onUpdateUser();
    // Update local state to reflect change if we keep modal open, but we'll just close/refresh
    setSelectedApp(prev => prev ? {...prev, candidateNotes: appNote} : null);
  };

  const handleUnsaveJob = (jobId: string) => {
    DB.toggleSavedJob(user.id, jobId);
    onUpdateUser();
  };

  const handleTogglePrivacy = () => {
    const newPref = !user.preferences?.hideProfileFromEmployers;
    DB.updateUser({
      ...user,
      preferences: {
        ...user.preferences,
        hideProfileFromEmployers: newPref,
        isOpenToWork: user.preferences?.isOpenToWork ?? true
      }
    });
    onUpdateUser();
  };


  // --- Helper Renders ---
  
  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.APPLIED: return 'text-blue-700 bg-blue-50 border-blue-200';
      case ApplicationStatus.INTERVIEW: return 'text-purple-700 bg-purple-50 border-purple-200';
      case ApplicationStatus.OFFER: return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case ApplicationStatus.REJECTED: return 'text-red-700 bg-red-50 border-red-200';
      case ApplicationStatus.WITHDRAWN: return 'text-gray-500 bg-gray-100 border-gray-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const SidebarItem = ({ id, label, icon: Icon, count }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
        activeTab === id 
          ? 'bg-emerald-50 text-emerald-700' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className="w-4 h-4 mr-3" />
      {label}
      {count !== undefined && (
        <span className="ml-auto bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
         <div>
           <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Candidate Portal</h1>
           <p className="text-gray-500 mt-1">Manage your career profile and job applications.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <SidebarItem id="applications" label="My Applications" icon={Briefcase} count={applications.length} />
            <SidebarItem id="profile" label="My Profile" icon={UserIcon} />
            <SidebarItem id="experience" label="Experience" icon={Building2} />
            <SidebarItem id="saved" label="Saved Jobs" icon={Bookmark} count={savedJobsList.length} />
            <SidebarItem id="alerts" label="Job Alerts" icon={Bell} count={myAlerts.length} />
            <SidebarItem id="settings" label="Settings" icon={Settings} />
          </div>
          
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl shadow-lg p-5 mt-6 text-white">
            <h3 className="font-bold mb-2">Profile Tip</h3>
            <p className="text-sm text-emerald-50 opacity-90 leading-relaxed">
              Adding detailed work experience increases your chances of being scouted by 40%.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9">
          
          {/* TAB: APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="font-semibold text-gray-900">Application History</h2>
              </div>
              
              {applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                     <FileText className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No applications yet</h3>
                  <p className="text-gray-500 text-center max-w-sm mb-6">Start browsing jobs to find your next opportunity.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {applications.map(app => {
                    const job = jobs.find(j => j.id === app.jobId);
                    // Even if job is deleted (undefined), we show the app record using fallback data
                    const jobTitle = job?.title || app.jobTitle || 'Unknown Job';
                    const companyName = job?.companyName || app.companyName || 'Unknown Company';
                    const location = job?.location || 'Unknown Location';
                    const logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random&color=fff&size=64`;

                    return (
                      <div key={app.id} className="p-6 hover:bg-gray-50/50 transition-colors group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <img src={logoUrl} alt="" className="w-12 h-12 rounded-lg border border-gray-100 shadow-sm" />
                            <div>
                              <h3 
                                onClick={() => job && onViewJob(job.id)} 
                                className={`font-bold text-lg text-gray-900 transition-colors ${job ? 'cursor-pointer group-hover:text-emerald-600 hover:underline' : 'cursor-default'}`}
                              >
                                {jobTitle}
                              </h3>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <span className="font-medium text-gray-700">{companyName}</span>
                                <span className="mx-2">•</span>
                                <span>{location}</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-2">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 pl-[4rem] md:pl-0">
                            <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center border ${getStatusColor(app.status)}`}>
                              {app.status === 'WITHDRAWN' ? <XCircle className="w-4 h-4 mr-1.5"/> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                              {app.status}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                               {job && (
                                 <Button size="sm" variant="outline" onClick={() => onViewJob(job.id)} title="View Job Details">
                                    <ExternalLink className="w-4 h-4" />
                                 </Button>
                               )}
                               <Button size="sm" variant="ghost" onClick={() => {
                                 setSelectedApp(app);
                                 setAppNote(app.candidateNotes || '');
                               }}>
                                 Manage
                               </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
                 {!isEditingProfile && (
                   <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>Edit Profile</Button>
                 )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Headline / Job Title</label>
                      <input type="text" className="w-full border rounded-lg px-3 py-2" value={profileData.title} onChange={e => setProfileData({...profileData, title: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea rows={4} className="w-full border rounded-lg px-3 py-2" value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                      <input type="text" className="w-full border rounded-lg px-3 py-2" value={profileData.skills} onChange={e => setProfileData({...profileData, skills: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="ghost" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-start gap-6">
                     {user.avatar ? <img src={user.avatar} className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-md" alt="" /> : <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center"><UserIcon className="w-10 h-10 text-gray-400" /></div>}
                     <div>
                       <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                       <p className="text-lg text-emerald-600 font-medium mb-2">{user.title || 'No title set'}</p>
                       <p className="text-gray-600 leading-relaxed max-w-xl">{user.bio || 'No bio added yet.'}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center"><Briefcase className="w-4 h-4 mr-2 text-gray-500" /> Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {user.skills && user.skills.length > 0 ? user.skills.map((skill, idx) => (<span key={idx} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm">{skill}</span>)) : <span className="text-gray-400 text-sm italic">No skills listed</span>}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center"><FileText className="w-4 h-4 mr-2 text-gray-500" /> Resume</h4>
                      {user.resumeUrl ? (
                         <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600"><FileText className="w-4 h-4" /></div>
                             <span className="text-sm font-medium text-gray-700">Resume.pdf</span>
                           </div>
                           <Button size="sm" variant="ghost" className="text-emerald-600">View</Button>
                         </div>
                      ) : <div className="text-center py-4"><p className="text-sm text-gray-500 mb-3">No resume uploaded</p><Button size="sm" variant="outline" onClick={() => setIsEditingProfile(true)}>Upload</Button></div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
                 <Button onClick={() => setIsExpModalOpen(true)} icon={<Plus className="w-4 h-4" />}>Add Role</Button>
              </div>

              <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                 {myExperience.length === 0 && <p className="text-gray-500 italic pl-10">No experience added yet.</p>}
                 {myExperience.map(exp => (
                   <div key={exp.id} className="relative pl-10 group">
                      <div className="absolute left-0 top-1.5 w-8 h-8 bg-white border-2 border-emerald-500 rounded-full flex items-center justify-center z-10">
                         <Briefcase className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-emerald-200 transition-colors">
                         <div className="flex justify-between items-start">
                            <div>
                               <h3 className="font-bold text-lg text-gray-900">{exp.title}</h3>
                               <div className="text-emerald-700 font-medium mb-1">{exp.company}</div>
                               <div className="text-sm text-gray-500 mb-3 flex items-center gap-3">
                                  <span>{exp.startDate} — {exp.current ? 'Present' : exp.endDate}</span>
                                  <span>•</span>
                                  <span>{exp.location}</span>
                               </div>
                               <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                            </div>
                            <button onClick={() => handleDeleteExperience(exp.id)} className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* TAB: SAVED JOBS */}
          {activeTab === 'saved' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h2 className="text-xl font-bold text-gray-900">Saved Jobs ({savedJobsList.length})</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   {savedJobsList.length === 0 && <p className="text-gray-500">No saved jobs yet.</p>}
                   {savedJobsList.map(job => (
                      <div key={job.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                         <div>
                            <h3 
                               onClick={() => onViewJob(job.id)}
                               className="font-bold text-lg text-gray-900 hover:text-emerald-600 cursor-pointer transition-colors"
                            >
                                {job.title}
                            </h3>
                            <p className="text-gray-600">{job.companyName} • {job.location}</p>
                            <div className="mt-2 text-sm text-gray-500">Saved on {new Date(user.savedJobs!.find(s => s.jobId === job.id)!.savedAt).toLocaleDateString()}</div>
                         </div>
                         <div className="flex gap-2">
                             <Button size="sm" onClick={() => onViewJob(job.id)}>View Job</Button>
                             <Button size="sm" variant="outline" onClick={() => handleUnsaveJob(job.id)}>Remove</Button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* TAB: ALERTS */}
          {activeTab === 'alerts' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h2 className="text-xl font-bold text-gray-900">Job Alerts</h2>
                   <Button onClick={() => setIsAlertModalOpen(true)} icon={<Plus className="w-4 h-4" />}>Create Alert</Button>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                   {myAlerts.length === 0 && <div className="p-6 text-center text-gray-500">No alerts set up.</div>}
                   {myAlerts.length > 0 && (
                     <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                             <th className="px-6 py-4 font-medium text-gray-500">Search Query</th>
                             <th className="px-6 py-4 font-medium text-gray-500">Frequency</th>
                             <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                             <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {myAlerts.map(alert => (
                             <tr key={alert.id}>
                                <td className="px-6 py-4 font-medium text-gray-900">{alert.query}</td>
                                <td className="px-6 py-4 capitalize">{alert.frequency}</td>
                                <td className="px-6 py-4"><span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">ACTIVE</span></td>
                                <td className="px-6 py-4 text-right">
                                   <button onClick={() => handleDeleteAlert(alert.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                   )}
                </div>
             </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
               <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
               
               <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                     <h3 className="font-medium text-gray-900">Profile Visibility</h3>
                     <p className="text-sm text-gray-500">Control if employers can find you in search.</p>
                  </div>
                  <button onClick={handleTogglePrivacy} className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${!user.preferences?.hideProfileFromEmployers ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                     {!user.preferences?.hideProfileFromEmployers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                     {!user.preferences?.hideProfileFromEmployers ? 'Visible to Employers' : 'Hidden from Search'}
                  </button>
               </div>

               <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                     <h3 className="font-medium text-gray-900">Open to Work</h3>
                     <p className="text-sm text-gray-500">Signal recruiters that you are looking.</p>
                  </div>
                  <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase">
                     {user.preferences?.isOpenToWork ? 'Yes' : 'No'}
                  </div>
               </div>
               
               <div className="pt-4">
                  <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Delete Account</Button>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Experience Modal */}
      <Modal isOpen={isExpModalOpen} onClose={() => setIsExpModalOpen(false)} title="Add Experience">
         <form onSubmit={handleSaveExperience} className="space-y-4">
            <input required placeholder="Job Title" className="w-full border rounded p-2" value={expForm.title || ''} onChange={e => setExpForm({...expForm, title: e.target.value})} />
            <input required placeholder="Company" className="w-full border rounded p-2" value={expForm.company || ''} onChange={e => setExpForm({...expForm, company: e.target.value})} />
            <input placeholder="Location" className="w-full border rounded p-2" value={expForm.location || ''} onChange={e => setExpForm({...expForm, location: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
               <input type="date" required className="w-full border rounded p-2" value={expForm.startDate || ''} onChange={e => setExpForm({...expForm, startDate: e.target.value})} />
               <input type="date" disabled={expForm.current} className="w-full border rounded p-2" value={expForm.endDate || ''} onChange={e => setExpForm({...expForm, endDate: e.target.value})} />
            </div>
            <div className="flex items-center gap-2">
               <input type="checkbox" id="currentRole" checked={expForm.current || false} onChange={e => setExpForm({...expForm, current: e.target.checked})} />
               <label htmlFor="currentRole">I currently work here</label>
            </div>
            <textarea placeholder="Description" rows={4} className="w-full border rounded p-2" value={expForm.description || ''} onChange={e => setExpForm({...expForm, description: e.target.value})} />
            <div className="flex justify-end gap-2 pt-2">
               <Button type="button" variant="ghost" onClick={() => setIsExpModalOpen(false)}>Cancel</Button>
               <Button type="submit">Save</Button>
            </div>
         </form>
      </Modal>

      {/* Alert Modal */}
      <Modal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} title="Create Job Alert">
         <form onSubmit={handleCreateAlert} className="space-y-4">
            <div>
               <label className="block text-sm font-medium mb-1">Search Query</label>
               <input required placeholder="e.g. Remote RevOps" className="w-full border rounded p-2" value={alertForm.query} onChange={e => setAlertForm({...alertForm, query: e.target.value})} />
            </div>
            <div>
               <label className="block text-sm font-medium mb-1">Frequency</label>
               <select className="w-full border rounded p-2" value={alertForm.frequency} onChange={e => setAlertForm({...alertForm, frequency: e.target.value})}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="instant">Instant</option>
               </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
               <Button type="button" variant="ghost" onClick={() => setIsAlertModalOpen(false)}>Cancel</Button>
               <Button type="submit">Create Alert</Button>
            </div>
         </form>
      </Modal>

      {/* Application Management Modal */}
      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title="Manage Application">
         {selectedApp && (
            <div className="space-y-6">
               <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold">{selectedApp.jobTitle}</h3>
                  <p className="text-sm text-gray-600">{selectedApp.companyName}</p>
                  <div className={`mt-2 inline-flex px-2 py-1 rounded text-xs font-bold ${getStatusColor(selectedApp.status)}`}>
                     {selectedApp.status}
                  </div>
               </div>
               
               <div>
                  <label className="block text-sm font-medium mb-2">My Private Notes</label>
                  <textarea 
                     className="w-full border border-gray-300 rounded-lg p-3 text-sm" 
                     rows={4} 
                     placeholder="Notes about interviews, follow-ups, etc. (Only visible to you)"
                     value={appNote}
                     onChange={e => setAppNote(e.target.value)}
                  />
               </div>

               <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button onClick={handleWithdrawApp} className="text-red-600 text-sm hover:underline">Withdraw Application</button>
                  <div className="flex gap-2">
                     <Button variant="ghost" onClick={() => setSelectedApp(null)}>Close</Button>
                     <Button onClick={handleSaveAppNote}>Save Notes</Button>
                  </div>
               </div>
            </div>
         )}
      </Modal>

    </div>
  );
};
