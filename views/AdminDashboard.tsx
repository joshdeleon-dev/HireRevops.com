import React, { useState, useRef } from 'react';
import { Job, User } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { generateJobDescription } from '../services/geminiService';
import { Plus, Trash2, Wand2, Users, Briefcase, FileText, Search, Upload, Download } from 'lucide-react';

interface AdminDashboardProps {
  jobs: Job[];
  users: User[];
  onAddJob: (job: Omit<Job, 'id' | 'postedAt'>) => void;
  onDeleteJob: (id: string) => void;
  onDeleteUser: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  jobs, 
  users, 
  onAddJob, 
  onDeleteJob,
  onDeleteUser
}) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'users'>('jobs');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [salaryRange, setSalaryRange] = useState('');
  const [description, setDescription] = useState('');

  const handleAI = async () => {
    if (!title || !company || !location) {
      alert("Please fill in Title, Company, and Location to generate a description.");
      return;
    }
    setIsGenerating(true);
    const desc = await generateJobDescription(title, company, location);
    setDescription(desc);
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddJob({
      title,
      companyName: company,
      companyId: 'c_admin',
      authorId: '1',
      location,
      type: type as any,
      salaryRange,
      description,
      requirements: ['Top Tier Skills', 'Experience Required'], // Simplified for demo
      isActive: true
    });
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setCompany('');
    setLocation('');
    setDescription('');
    setSalaryRange('');
    setType('Full-time');
  };

  // --- CSV Import Logic ---

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const downloadTemplate = () => {
    const headers = ['Title', 'Company', 'Location', 'Type', 'Salary', 'Description', 'Requirements'];
    const sample = ['Senior Engineer', 'Tech Corp', 'Remote', 'Full-time', '$120k-$150k', 'Build great things.', 'React;Node.js;TypeScript'];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), sample.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "job_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSVLine = (text: string) => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i++; 
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        if (currentRow.length > 0 || currentCell) {
          currentRow.push(currentCell.trim());
          rows.push(currentRow);
          currentRow = [];
          currentCell = '';
        }
      } else {
        currentCell += char;
      }
    }
    if (currentRow.length > 0 || currentCell) {
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
    }
    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const rows = parseCSVLine(text);
        if (rows.length < 2) {
          alert("CSV is empty or missing data.");
          return;
        }

        const headers = rows[0].map(h => h.toLowerCase().replace(/['"]+/g, ''));
        const jobData = rows.slice(1);
        let successCount = 0;

        jobData.forEach(row => {
          if (row.length < 3) return; // Skip empty rows

          // Simple mapper based on header index or fallback
          const getVal = (keys: string[]) => {
            const index = headers.findIndex(h => keys.some(k => h.includes(k)));
            return index !== -1 ? row[index] : '';
          };

          const title = getVal(['title', 'position', 'role']) || row[0];
          const company = getVal(['company', 'organization']) || row[1];
          const location = getVal(['location', 'city']) || row[2];
          
          if (!title || !company) return;

          const typeRaw = getVal(['type', 'employment']) || 'Full-time';
          const salaryRange = getVal(['salary', 'pay', 'compensation']);
          const description = getVal(['description', 'desc', 'summary']) || 'No description provided.';
          const reqString = getVal(['requirements', 'skills']) || '';

          onAddJob({
            title,
            companyName: company,
            companyId: 'c_imported',
            authorId: '1',
            location,
            type: (['Full-time', 'Part-time', 'Contract', 'Remote'].includes(typeRaw) ? typeRaw : 'Full-time') as any,
            salaryRange,
            description,
            requirements: reqString.split(';').map(s => s.trim()).filter(Boolean),
            isActive: true
          });
          successCount++;
        });

        alert(`Successfully imported ${successCount} jobs!`);
      } catch (err) {
        console.error(err);
        alert("Failed to parse CSV. Please check the format.");
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employer Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your job postings and view candidate profiles.</p>
        </div>
        <div className="flex flex-wrap gap-3">
           <input 
             type="file" 
             ref={fileInputRef} 
             accept=".csv" 
             className="hidden" 
             onChange={handleFileChange} 
           />
           <Button variant="outline" onClick={downloadTemplate} title="Download CSV Template">
             <Download className="w-4 h-4 mr-2" /> Template
           </Button>
           <Button variant="outline" onClick={handleImportClick}>
             <Upload className="w-4 h-4 mr-2" /> Import CSV
           </Button>
           <Button onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Post Job
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Management</h3>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all mb-1 ${
                activeTab === 'jobs' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Briefcase className="w-4 h-4 mr-3" />
              Jobs Listings
              <span className="ml-auto text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-500">
                {jobs.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'users' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4 mr-3" />
              Users Database
               <span className="ml-auto text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-500">
                {users.length}
              </span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
             {/* Header */}
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h2 className="font-semibold text-gray-900">{activeTab === 'jobs' ? 'Active Listings' : 'Registered Candidates'}</h2>
               <div className="relative">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                 <input type="text" placeholder="Search..." className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
               </div>
             </div>

            {activeTab === 'jobs' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">Position</th>
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Posted</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {jobs.map(job => (
                      <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                        <td className="px-6 py-4">{job.companyName}</td>
                         <td className="px-6 py-4">{job.location}</td>
                        <td className="px-6 py-4 text-xs">{new Date(job.postedAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => onDeleteJob(job.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            title="Delete Job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {jobs.length === 0 && <div className="text-center py-12 text-gray-400">No active job listings found.</div>}
              </div>
            ) : (
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.avatar && <img src={user.avatar} className="w-9 h-9 rounded-full border border-gray-200" alt="" />}
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-gray-400 text-xs">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'ADMIN' ? 'Administrator' : 'Candidate'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {user.role !== 'ADMIN' && (
                            <button 
                              onClick={() => onDeleteUser(user.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Job">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title</label>
              <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow" placeholder="e.g. Senior Product Designer" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
              <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow" placeholder="e.g. Acme Corp" value={company} onChange={e => setCompany(e.target.value)} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
              <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow" placeholder="e.g. New York, NY" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Salary Range</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow" value={salaryRange} onChange={e => setSalaryRange(e.target.value)} placeholder="e.g. $100k-$120k" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Employment Type</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white" value={type} onChange={e => setType(e.target.value)}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Remote</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Job Description</label>
              <Button type="button" variant="ghost" size="sm" onClick={handleAI} isLoading={isGenerating} className="text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-2 h-8">
                <Wand2 className="w-3.5 h-3.5 mr-1.5" /> Generate with AI
              </Button>
            </div>
            <textarea 
              required 
              rows={6} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Describe the role responsibilities, requirements, and benefits..."
            />
            <p className="text-xs text-gray-400 mt-1.5 text-right">Markdown supported</p>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Publish Job</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};