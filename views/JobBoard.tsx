import React, { useState, useEffect } from 'react';
import { Job, UserRole, User, Application } from '../types';
import { Button } from '../components/Button';
import { MapPin, Briefcase, DollarSign, Clock, Search, Filter, Building2, Globe, TrendingUp, BarChart3, Database, ArrowRight, Heart, CheckCircle2 } from 'lucide-react';

interface JobBoardProps {
  jobs: Job[];
  onApply: (jobId: string) => void;
  onViewJob: (jobId: string) => void;
  currentUser: User | null; 
  userApplications?: Application[];
  onToggleSave: (jobId: string) => void;
}

export const JobBoard: React.FC<JobBoardProps> = ({ jobs, onApply, onViewJob, currentUser, userApplications = [], onToggleSave }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  
  // Local state for UI updates on saves. 
  // It syncs with currentUser to ensure truth but also allows fast feedback.
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  useEffect(() => {
    if (currentUser && currentUser.savedJobs) {
      setSavedJobIds(currentUser.savedJobs.map(s => s.jobId));
    } else {
      setSavedJobIds([]);
    }
  }, [currentUser]);

  // Hero Text Rotation State
  const [termIndex, setTermIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const terms = ["Revenue Operations", "Sales Operations", "GTM Engineering"];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setTermIndex((prev) => (prev + 1) % terms.length);
        setIsFading(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleSave = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    onToggleSave(jobId);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationSearch === '' || job.location.toLowerCase().includes(locationSearch.toLowerCase());
    const matchesType = typeFilter === 'All' || job.type === typeFilter;
    return matchesSearch && matchesLocation && matchesType && job.isActive;
  });

  const getCompanyLogo = (company: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=random&color=fff&size=128&bold=true`;
  };

  const canApply = !currentUser || currentUser.role === UserRole.CANDIDATE;
  const isCandidate = currentUser?.role === UserRole.CANDIDATE;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-slate-900 text-white overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] rounded-full bg-emerald-900/20 blur-[100px]"></div>
          <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-blue-900/20 blur-[100px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-emerald-900/30 border border-emerald-700/50 text-emerald-400 text-sm font-medium mb-8">
              <TrendingUp className="w-4 h-4" />
              #1 Job Board for GTM & Revenue Engineering
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Scale your career in <br/>
              <span 
                className={`inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 transition-all duration-500 transform ${
                  isFading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                }`}
              >
                {terms[termIndex]}.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Connect with high-growth companies building world-class revenue engines. 
              Find roles in Sales Ops, Marketing Ops, Deal Desk, and GTM Systems.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm border border-white/10 p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                placeholder="Ex: Salesforce Admin, RevOps Manager..."
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:bg-slate-800 transition-colors border border-transparent focus:border-emerald-500/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="hidden md:block w-px bg-white/10 my-2"></div>
            <div className="flex-1 relative group">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                placeholder="City, state, or 'Remote'"
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:bg-slate-800 transition-colors border border-transparent focus:border-emerald-500/30"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
              />
            </div>
            <Button 
              className="h-14 md:w-40 rounded-xl text-lg font-semibold bg-emerald-600 hover:bg-emerald-50 text-white shadow-lg shadow-emerald-900/20"
              onClick={() => {}}
            >
              Search Jobs
            </Button>
          </div>
          
          <div className="mt-10 flex flex-wrap justify-center gap-2 text-sm text-slate-400">
            <span className="mr-2 text-slate-500">Trending Skills:</span>
            {['Salesforce', 'HubSpot', 'Marketo', 'CPQ', 'SQL', 'GTM Strategy'].map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 flex-1 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-6 h-6 text-emerald-600" />
              Latest Opportunities <span className="text-gray-400 text-lg font-normal ml-2">({filteredJobs.length})</span>
            </h2>
            
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <span className="text-sm text-gray-500">Filter by:</span>
              <div className="relative">
                <select
                  className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none shadow-sm cursor-pointer hover:border-gray-300"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="All">All Job Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-500">Try adjusting your search criteria.</p>
              </div>
            ) : (
              filteredJobs.map(job => {
                const isApplied = userApplications.some(app => app.jobId === job.id);
                const isSaved = savedJobIds.includes(job.id);

                return (
                  <div 
                    key={job.id} 
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group cursor-pointer relative"
                    onClick={() => onViewJob(job.id)}
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-16 h-16 flex-shrink-0">
                        <img 
                          src={getCompanyLogo(job.companyName)} 
                          alt={job.companyName} 
                          className="w-full h-full rounded-xl object-cover shadow-sm border border-gray-100"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors pr-8">
                              {job.title}
                            </h3>
                            <div className="flex items-center text-gray-600 font-medium mt-1">
                               <Building2 className="w-4 h-4 mr-1.5 text-gray-400" />
                               {job.companyName}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-2 md:mt-0">
                            {isCandidate && (
                               <button
                                 onClick={(e) => handleToggleSave(e, job.id)}
                                 className={`p-2 rounded-full transition-colors ${isSaved ? 'bg-red-50 text-red-500' : 'text-gray-300 hover:bg-gray-100'}`}
                               >
                                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                               </button>
                            )}
                            {isApplied ? (
                              <div className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                Applied
                              </div>
                            ) : canApply ? (
                              <Button size="sm" onClick={(e) => { e.stopPropagation(); onApply(job.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-600 hover:bg-emerald-700 text-white">
                                Apply Now
                              </Button>
                            ) : (
                               <span className="text-xs text-gray-400 italic group-hover:hidden">View details</span>
                            )}
                             <Button size="sm" variant="ghost" className={`md:hidden opacity-100 ${isApplied ? 'text-gray-400' : 'text-emerald-600'}`}>
                                {isApplied ? 'Applied' : 'Details'}
                             </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-500 mb-4 mt-4">
                          <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            {job.location}
                          </div>
                          <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                            <Briefcase className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            {job.type}
                          </div>
                          {job.salaryRange && (
                            <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
                              <DollarSign className="w-3.5 h-3.5 mr-1 text-green-600" />
                              {job.salaryRange}
                            </div>
                          )}
                           <div className="flex items-center text-gray-400 ml-auto text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(job.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 border-t border-gray-100 pt-3">
                          {job.description}
                        </p>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex gap-2 overflow-hidden">
                            {job.requirements && job.requirements.slice(0, 3).map((req, idx) => (
                              <span key={idx} className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md font-medium">
                                {req}
                              </span>
                            ))}
                            {job.requirements && job.requirements.length > 3 && (
                              <span className="text-xs text-gray-400 py-1">+ {job.requirements.length - 3} more</span>
                            )}
                          </div>
                          <span className="text-emerald-600 text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            View Details <ArrowRight className="w-4 h-4 ml-1" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};