
import React, { useState, useEffect } from 'react';
import { Job, UserRole, User, Application, Company } from '../types';
import { Button } from '../components/Button';
import { MapPin, Briefcase, DollarSign, Clock, Building2, ArrowLeft, Share2, CheckCircle2, Globe, Calendar, Edit2, Heart, ExternalLink } from 'lucide-react';
import * as DB from '../services/database';

interface JobDetailsProps {
  job: Job;
  onApply: (jobId: string) => void;
  onBack: () => void;
  currentUser: User | null;
  userApplications?: Application[];
  onToggleSave: (jobId: string) => void;
}

export const JobDetails: React.FC<JobDetailsProps> = ({ job, onApply, onBack, currentUser, userApplications = [], onToggleSave }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [company, setCompany] = useState<Company | undefined>(undefined);

  useEffect(() => {
    if (currentUser?.savedJobs?.some(s => s.jobId === job.id)) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
    
    // Fetch real company data
    const comp = DB.getCompanyById(job.companyId);
    setCompany(comp);
  }, [currentUser, job.id, job.companyId]);

  const getCompanyLogo = (companyName: string) => {
    // Prefer company.logo if available, else fallback
    if (company?.logo) return company.logo;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random&color=fff&size=128&bold=true`;
  };

  const isOwner = currentUser?.id === job.authorId;
  const isCandidate = currentUser?.role === UserRole.CANDIDATE || !currentUser;
  const isApplied = userApplications.some(app => app.jobId === job.id);

  const handleToggleSave = () => {
    onToggleSave(job.id);
  };

  // Helper to format text with markdown-like bolding
  const formatDescription = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.trim().startsWith('-')) {
        return <li key={i} className="ml-4 mb-2 text-slate-600">{line.substring(1).trim()}</li>;
      }
      if (line.trim().startsWith('**')) {
        return <h3 key={i} className="text-lg font-bold text-slate-900 mt-6 mb-3">{line.replace(/\*\*/g, '')}</h3>;
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="mb-4 text-slate-600 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="container mx-auto px-4 max-w-5xl py-4">
          <button 
            onClick={onBack}
            className="flex items-center text-sm text-slate-500 hover:text-emerald-600 transition-colors font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Jobs
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                <img 
                  src={getCompanyLogo(job.companyName)} 
                  alt={job.companyName} 
                  className="w-16 h-16 rounded-xl shadow-sm border border-gray-100 object-cover"
                />
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 leading-tight">{job.title}</h1>
                  <div className="flex items-center text-slate-500 text-sm mt-1">
                    <Building2 className="w-4 h-4 mr-1.5" />
                    {job.companyName}
                    <span className="mx-2 text-slate-300">|</span>
                    <MapPin className="w-4 h-4 mr-1.5" />
                    {job.location}
                  </div>
                </div>
             </div>
             
             <div className="flex items-center gap-3">
               <Button variant="outline" icon={<Share2 className="w-4 h-4" />}>Share</Button>
               
               {isCandidate && (
                  <Button variant="outline" onClick={handleToggleSave} className={isSaved ? 'text-red-500 border-red-200 bg-red-50' : ''}>
                     <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </Button>
               )}

               {isOwner && (
                 <Button className="bg-purple-600 text-white cursor-default">
                    <Edit2 className="w-4 h-4 mr-2" /> You posted this
                 </Button>
               )}

               {isCandidate && (
                  isApplied ? (
                    <Button 
                      className="bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default px-8"
                      disabled
                      icon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Applied
                    </Button>
                  ) : (
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/10 px-8"
                      onClick={() => onApply(job.id)}
                    >
                      Apply Now
                    </Button>
                  )
               )}
               
               {!isCandidate && !isOwner && (
                 <div className="text-sm text-gray-400 italic">Employer View Mode</div>
               )}
             </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">About the Role</h2>
              <div className="prose prose-slate max-w-none">
                {formatDescription(job.description)}
              </div>
              
              {job.requirements && job.requirements.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Requirements</h3>
                  <ul className="space-y-3">
                    {job.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Direct Link Section */}
              {job.directApplyUrl && (
                <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">Direct Application</h3>
                    <p className="text-sm text-slate-500">Apply directly on the company's career page.</p>
                  </div>
                  <a 
                    href={job.directApplyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none"
                  >
                    Visit Job Post <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Overview Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-slate-900 mb-4">Job Overview</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 font-medium">Salary Range</div>
                    <div className="text-slate-900 font-semibold">{job.salaryRange || 'Competitive'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 font-medium">Job Type</div>
                    <div className="text-slate-900 font-semibold">{job.type}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 font-medium">Posted On</div>
                    <div className="text-slate-900 font-semibold">
                      {new Date(job.postedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                 <h4 className="font-bold text-slate-900 mb-2">Location</h4>
                 <div className="flex items-center text-slate-600">
                   <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                   {job.location}
                 </div>
              </div>
            </div>

            {/* Company Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-slate-900 mb-4">About {job.companyName}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {company?.description || `${job.companyName} is a leading company in the industry.`}
              </p>
              
              <div className="space-y-3">
                {company?.website && (
                  <a 
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Globe className="w-4 h-4 mr-2" /> Visit Website
                  </a>
                )}
                {job.directApplyUrl && (
                  <a 
                     href={job.directApplyUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center justify-start text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" /> Job Listing Link
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
