
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { UserRole, ViewState, PlanTier } from '../types';
import * as DB from '../services/database';
import { Briefcase, Building2, User as UserIcon, ArrowRight, Check, Activity } from 'lucide-react';

interface AuthViewProps {
  onNavigate: (view: ViewState) => void;
  onLoginSuccess: (userId: string) => void;
}

// --- LOGIN VIEW ---
export const LoginView: React.FC<AuthViewProps> = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      const user = DB.getUserByEmail(email);
      if (user && user.password === password) {
        onLoginSuccess(user.id);
      } else {
        alert("Invalid credentials.");
        setIsLoading(false);
      }
    }, 800);
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      // Simulate Google Auth with the ADMIN user for this demo
      const mockGoogleEmail = "joshuad.ny@gmail.com";
      let user = DB.getUserByEmail(mockGoogleEmail);
      if (user) {
        onLoginSuccess(user.id);
      } else {
        // Fallback or create mock user
        const newUser: any = {
           id: 'g_'+Date.now(),
           name: 'Google User',
           email: mockGoogleEmail,
           role: UserRole.CANDIDATE,
           provider: 'google'
        };
        DB.addUser(newUser);
        onLoginSuccess(newUser.id);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 to-slate-900/90 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
          alt="Office" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-between h-full p-16 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl">HireRevOps</span>
          </div>
          <div>
            <h2 className="text-4xl font-bold mb-6 leading-tight">Welcome back to the RevOps community.</h2>
            <p className="text-lg text-slate-300 max-w-md">
              Connect with top companies, manage your applications, and discover your next career move in Revenue Operations.
            </p>
          </div>
          <div className="text-sm text-slate-400">© 2024 HireRevOps.</div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h2>
          <p className="text-gray-500 mb-8">
            Don't have an account? 
            <button onClick={() => onNavigate('SIGNUP_CHOICE')} className="text-emerald-600 font-medium hover:underline ml-1">Sign up</button>
          </p>

          <Button 
            variant="outline" 
            className="w-full relative py-2.5 flex items-center justify-center gap-2 mb-6 hover:bg-gray-50 transition-all border-gray-300"
            onClick={handleGoogleLogin}
            isLoading={isGoogleLoading}
          >
             <span className="text-gray-700 font-medium">Continue with Google (Admin Demo)</span>
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input 
                type="email" 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500" isLoading={isLoading}>Sign in</Button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
             <p className="font-bold mb-1">Demo Credentials:</p>
             <p>Admin: <b>joshuad.ny@gmail.com</b> / password</p>
             <p>Employer: <b>sarah@scaleup.com</b> / password</p>
             <p>Candidate: <b>alex@example.com</b> / password</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SIGNUP CHOICE VIEW ---
export const SignupChoiceView: React.FC<AuthViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Join HireRevOps Today</h1>
          <p className="text-gray-500 text-lg">Choose how you want to use our platform</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Candidate Card */}
          <button 
            onClick={() => onNavigate('SIGNUP_CANDIDATE')}
            className="flex flex-col text-left bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-emerald-500 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
              <UserIcon className="w-6 h-6 text-emerald-600 group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">I'm a Job Seeker</h3>
            <p className="text-gray-500 mb-6 flex-1">
              Find your dream job in RevOps, track applications, and get career advice.
            </p>
            <div className="flex items-center text-emerald-600 font-medium">
              Create Candidate Account <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>

          {/* Employer Card */}
          <button 
            onClick={() => onNavigate('SIGNUP_EMPLOYER')}
            className="flex flex-col text-left bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-purple-500 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
              <Building2 className="w-6 h-6 text-purple-600 group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">I'm an Employer</h3>
            <p className="text-gray-500 mb-6 flex-1">
              Post jobs, manage RevOps candidates, and streamline your hiring process.
            </p>
            <div className="flex items-center text-purple-600 font-medium">
              Create Employer Account <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>
        </div>

        <div className="text-center mt-8">
          <button onClick={() => onNavigate('LOGIN')} className="text-gray-500 hover:text-gray-900 text-sm">
            Already have an account? Log in
          </button>
        </div>
      </div>
    </div>
  );
};

// --- CANDIDATE SIGNUP VIEW ---
export const SignupCandidateView: React.FC<AuthViewProps> = ({ onNavigate, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', bio: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      // Create User
      const newUser: any = {
        id: 'user_' + Date.now(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: UserRole.CANDIDATE,
        bio: formData.bio,
        provider: 'email',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
      };
      
      DB.addUser(newUser);
      onLoginSuccess(newUser.id);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm">
        <div>
          <button onClick={() => onNavigate('SIGNUP_CHOICE')} className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center">
             &larr; Back
          </button>
          <h2 className="text-3xl font-extrabold text-gray-900">Create Candidate Account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-emerald-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input required type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-emerald-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input required type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-emerald-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" isLoading={isLoading}>Create Account</Button>
        </form>
      </div>
    </div>
  );
};

// --- EMPLOYER SIGNUP VIEW ---
export const SignupEmployerView: React.FC<AuthViewProps> = ({ onNavigate, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ name: '', companyName: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const userId = 'emp_' + Date.now();
      const companyId = 'co_' + Date.now();

      // Create Company First
      DB.addCompany({
        id: companyId,
        name: formData.companyName,
        description: 'New Company',
        ownerId: userId,
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.companyName)}&background=random`,
        subscription: {
          planId: PlanTier.FREE,
          status: 'active',
          startDate: new Date().toISOString(),
          jobCredits: 1,
          talentAccessExpiresAt: new Date(Date.now() + 86400000 * 7).toISOString() // 7 days trial
        }
      });

      // Create User
      const newUser: any = {
        id: userId,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: UserRole.EMPLOYER,
        companyId: companyId,
        provider: 'email',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
      };
      
      DB.addUser(newUser);
      onLoginSuccess(newUser.id);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border-t-4 border-purple-600">
        <div>
          <button onClick={() => onNavigate('SIGNUP_CHOICE')} className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center">
             &larr; Back
          </button>
          <h2 className="text-3xl font-extrabold text-gray-900">Create Employer Account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
             <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-purple-500" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Full Name</label>
              <input required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-purple-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
              <input required type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-purple-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input required type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-purple-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 focus:ring-purple-500" isLoading={isLoading}>Start Hiring</Button>
        </form>
      </div>
    </div>
  );
};
