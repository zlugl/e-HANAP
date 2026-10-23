import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROXAS_MUNICIPALITY, ROXAS_BARANGAYS } from '../data/mockData';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Briefcase, 
  Building2, 
  Users, 
  User, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  FileText,
  BrainCircuit,
  Award,
  ChevronRight,
  Calendar,
  LogIn,
  UserPlus,
  Compass,
  Check,
  Phone,
  Mail,
  HelpCircle,
  BarChart3,
  Clock,
  Layers,
  FileCheck,
  Shield,
  Send
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: (mode: 'login' | 'register', initialRole?: 'job_seeker' | 'employer') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { jobPosts, employers, jobSeekers, applications, announcements } = useApp();

  const activeJobs = jobPosts.filter(j => j.status === 'active');
  const verifiedEmployers = employers.filter(e => e.status === 'verified');
  const totalHired = applications.filter(a => a.currentStatus === 'hired').length;


  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Top Banner Notice */}
      {announcements.length > 0 && (
        <div className="bg-slate-900 text-slate-100 px-4 py-2 text-xs font-medium border-b border-slate-800 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
          <span className="font-bold uppercase tracking-wider text-[10px] bg-indigo-900 text-indigo-200 px-2 py-0.5 rounded border border-indigo-700">PESO Roxas Notice:</span>
          <span className="truncate max-w-2xl">{announcements[0].title}</span>
          <button 
            onClick={() => onNavigate('jobs')} 
            className="underline font-bold text-indigo-300 hover:text-white ml-2 text-[11px]"
          >
            Explore
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        
        {/* Background Mesh */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl space-y-6 text-left">
            
            {/* Location Badge */}
            <div className="inline-flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 text-slate-200 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-inner">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>📍 Roxas, Oriental Mindoro • Public Employment Service Office (PESO)</span>
            </div>

            {/* Main Headline */}
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Find Local Opportunities in Roxas with <span className="text-indigo-400">eHANAP</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 mt-3 font-normal leading-relaxed max-w-2xl">
                eHANAP connects job seekers and employers in <strong>Roxas, Oriental Mindoro</strong> through smart job matching.
              </p>
            </div>

            {/* Primary Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('jobs')}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group"
              >
                <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Find Jobs</span>
              </button>

              <button
                onClick={() => onOpenAuth('register', 'employer')}
                className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>I'm Hiring</span>
              </button>

              <button
                onClick={() => onOpenAuth('login')}
                className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border border-white/10 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-indigo-300" />
                <span>Log In</span>
              </button>

              <button
                onClick={() => onOpenAuth('login')}
                className="w-full sm:w-auto px-5 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 hover:text-white border border-indigo-400/30 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                title="Quick Demo Accounts for Employers (Puregold, Tech, Agri, Sales) and PESO Admin"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Demo Accounts</span>
              </button>
            </div>


            {/* Quick metrics in Roxas */}
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-800/80 max-w-sm">
              <div>
                <p className="text-xl sm:text-2xl font-black text-white">{activeJobs.length} Vacancies</p>
                <p className="text-[11px] sm:text-xs text-slate-400">Active in Roxas</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-emerald-400">{verifiedEmployers.length} Employers</p>
                <p className="text-[11px] sm:text-xs text-slate-400">PESO Verified</p>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* SYSTEM PURPOSE & 3 USER ROLES SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="about">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            PESO Roxas Local Employment Marketplace
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
            Connecting Job Seekers, Employers & PESO Roxas
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            The platform provides three purpose-built experiences dedicated strictly to the local workforce of Roxas, Oriental Mindoro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Card 1: Job Seekers */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all flex flex-col justify-between group relative">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Role 1: Job Seeker</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  “Help me find a job.”
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Find available jobs in Roxas that match your education, skills, and experience with AI-powered resume extraction and transparent matching.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Search available jobs in Roxas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Resume upload & AI validation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Track applications & interviews</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => onOpenAuth('register', 'job_seeker')}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Find Jobs in Roxas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Employers */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all flex flex-col justify-between group relative">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Role 2: Employer</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  “Help me find qualified workers.”
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Post job vacancies, receive local applicants, evaluate qualifications with AI ranking, schedule interviews, and make hiring decisions.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Post Roxas job vacancies</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>AI candidate ranking & breakdown</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Schedule interviews & record hires</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => onOpenAuth('register', 'employer')}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Post a Job in Roxas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: PESO Roxas Admin */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200 hover:border-amber-500 hover:shadow-xl transition-all flex flex-col justify-between group relative">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Role 3: PESO Roxas Admin</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  “Manage & monitor employment in Roxas.”
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manage, verify, monitor, and analyze local employment activity. Verify employers, review postings, track placements, and generate reports.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Employer verification & document review</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Job post & application monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Roxas employment analytics & reports</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => onOpenAuth('login')}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>PESO Admin Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 bg-slate-900 text-white px-4 sm:px-6 lg:px-8" id="how-it-works">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800">
              Clear Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-3">
              How eHANAP Works in Roxas
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              From resume validation to AI qualification and municipal placement monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-900/80 text-indigo-300 font-black text-sm flex items-center justify-center border border-indigo-700">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Upload & Validate Resume</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Job seekers upload PDF/DOCX resumes. The engine extracts education, degrees, skills, and experience with zero manual friction.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-900/80 text-indigo-300 font-black text-sm flex items-center justify-center border border-indigo-700">
                2
              </div>
              <h4 className="text-sm font-bold text-white">AI Job Matching</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evaluates candidate profiles against Roxas employer requirements with explainable matching percentages and checklists.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-900/80 text-indigo-300 font-black text-sm flex items-center justify-center border border-indigo-700">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Candidate Ranking & Interviews</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Employers view top-ranked qualified candidates, review breakdowns, shortlist applicants, and schedule interviews.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-900/80 text-indigo-300 font-black text-sm flex items-center justify-center border border-indigo-700">
                4
              </div>
              <h4 className="text-sm font-bold text-white">PESO Monitoring & Reports</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                PESO Roxas verifies employers, oversees hiring integrity, tracks local placements, and exports official reports.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CONTACT & LOCAL PESO OFFICE SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="contact">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-indigo-800 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                Public Employment Service Office
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Visit the PESO Roxas Office
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Need on-site assistance with resume encoding, employer accreditation, or job placement? Visit the PESO Desk at the Roxas Municipal Hall.
              </p>

              <div className="space-y-2 pt-2 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PESO Desk, Municipal Hall Compound, Roxas, Oriental Mindoro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>(043) 289-XXXX • 0917-PESO-ROXAS</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>peso.roxas@ormindoro.gov.ph</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 text-center space-y-4">
              <h4 className="text-base font-bold text-white">Get Started Today</h4>
              <p className="text-xs text-slate-300">
                Create your account in less than 2 minutes to access local employment opportunities in Roxas.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => onOpenAuth('register', 'job_seeker')}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Register as Job Seeker
                </button>
                <button
                  onClick={() => onOpenAuth('register', 'employer')}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Register as Employer
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
