import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ApplicationStatus, Application } from '../../types';
import { AtsResumeModal } from '../../components/AtsResumeModal';
import { evaluateResumeForAts } from '../../utils/atsEngine';
import { ApplicationStatusTracker } from '../../components/ApplicationStatusTracker';
import { EmployerProfileModal } from '../../components/EmployerProfileModal';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Building2, 
  Calendar, 
  Search, 
  Filter, 
  Check, 
  ArrowRight, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Award, 
  Eye, 
  Send, 
  AlertCircle,
  Cpu,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STATUS_STEPS: { key: ApplicationStatus; label: string; description: string }[] = [
  { key: 'submitted', label: 'Submitted', description: 'Application received & verified by PESO system' },
  { key: 'ats_screened', label: 'ATS Screened', description: 'Resume audited for readability, format, & keyword matching' },
  { key: 'under_review', label: 'Under Review', description: 'Employer hiring team is reviewing your profile' },
  { key: 'qualified', label: 'Qualified', description: 'Decision Tree qualification requirements satisfied' },
  { key: 'shortlisted', label: 'Shortlisted', description: 'Selected for direct employer interview pool' },
  { key: 'interview_scheduled', label: 'Interview', description: 'Formal interview session scheduled' },
  { key: 'hired', label: 'Hired', description: 'Job offer extended and finalized' },
];

interface SeekerApplicationsPageProps {
  onNavigate: (view: string, params?: any) => void;
  params?: {
    justSubmitted?: boolean;
    highlightAppId?: string;
    jobTitle?: string;
    companyName?: string;
    [key: string]: any;
  };
}

export const SeekerApplicationsPage: React.FC<SeekerApplicationsPageProps> = ({ 
  onNavigate,
  params 
}) => {
  const { currentSeekerProfile, applications, jobPosts, interviews } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'applied' | 'reviewed' | 'interview' | 'hired' | 'rejected'>('all');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [selectedAtsApp, setSelectedAtsApp] = useState<Application | null>(null);
  const [selectedEmployerProfile, setSelectedEmployerProfile] = useState<{
    companyName?: string;
    employerId?: string;
  } | null>(null);
  const [selectedStepDetail, setSelectedStepDetail] = useState<{
    app: any;
    step: typeof STATUS_STEPS[number];
    stepIdx: number;
    isCompleted: boolean;
    isCurrent: boolean;
  } | null>(null);

  // Success animation state
  const [highlightedAppId, setHighlightedAppId] = useState<string | null>(params?.highlightAppId || null);
  const [showSuccessBanner, setShowSuccessBanner] = useState<boolean>(Boolean(params?.justSubmitted || params?.highlightAppId));

  if (!currentSeekerProfile) return null;

  const myApps = applications.filter(a => a.jobSeekerId === currentSeekerProfile.id);

  // If newly submitted but no specific highlight ID was provided, default to the latest application
  useEffect(() => {
    if (params?.justSubmitted && !highlightedAppId && myApps.length > 0) {
      setHighlightedAppId(myApps[0].id);
      setShowSuccessBanner(true);
    }
  }, [params, myApps, highlightedAppId]);

  // Auto dismiss or scroll to highlight
  const scrollToHighlighted = (appId: string) => {
    const el = document.getElementById(`app-card-${appId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getStepIndex = (status: ApplicationStatus) => {
    if ((status as string) === 'rejected' || status === 'not_selected' || status === 'withdrawn') return -1;
    if (status === 'applied' || status === 'submitted') return 0;
    if (status === 'ats_screened') return 1;
    if (status === 'under_review' || status === 'reviewed') return 2;
    if (status === 'qualified') return 3;
    if (status === 'shortlisted' || status === 'for_final_review') return 4;
    if (status === 'for_interview' || status === 'interview_scheduled' || status === 'interview_completed') return 5;
    if (status === 'hired') return 6;
    const idx = STATUS_STEPS.findIndex(s => s.key === status);
    return idx !== -1 ? idx : 1;
  };

  const filteredApps = myApps.filter(app => {
    const job = jobPosts.find(j => j.id === app.jobId);
    const title = job?.title || (app as any).jobTitle || '';
    const company = job?.companyName || (app as any).companyName || '';

    const matchesSearch = 
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') {
      return !['hired', 'rejected', 'not_selected', 'withdrawn'].includes(app.currentStatus);
    }
    if (statusFilter === 'applied') {
      return ['submitted', 'applied'].includes(app.currentStatus);
    }
    if (statusFilter === 'reviewed') {
      return ['under_review', 'ats_screened', 'reviewed', 'qualified', 'shortlisted', 'for_final_review'].includes(app.currentStatus);
    }
    if (statusFilter === 'interview') {
      return ['interview_scheduled', 'for_interview', 'interview_completed'].includes(app.currentStatus) || interviews.some(i => i.applicationId === app.id);
    }
    if (statusFilter === 'hired') {
      return app.currentStatus === 'hired';
    }
    if (statusFilter === 'rejected') {
      return ['rejected', 'not_selected', 'withdrawn'].includes(app.currentStatus);
    }
    return true;
  });

  const activeCount = myApps.filter(a => !['hired', 'rejected', 'not_selected', 'withdrawn'].includes(a.currentStatus)).length;
  const appliedCount = myApps.filter(a => ['submitted', 'applied'].includes(a.currentStatus)).length;
  const reviewedCount = myApps.filter(a => ['under_review', 'ats_screened', 'reviewed', 'qualified', 'shortlisted', 'for_final_review'].includes(a.currentStatus)).length;
  const interviewCount = myApps.filter(a => ['interview_scheduled', 'for_interview', 'interview_completed'].includes(a.currentStatus) || interviews.some(i => i.applicationId === a.id)).length;
  const hiredCount = myApps.filter(a => a.currentStatus === 'hired').length;
  const rejectedCount = myApps.filter(a => ['rejected', 'not_selected', 'withdrawn'].includes(a.currentStatus)).length;

  const newlySubmittedApp = highlightedAppId ? myApps.find(a => a.id === highlightedAppId) : (params?.justSubmitted ? myApps[0] : null);
  const newlySubmittedJob = newlySubmittedApp ? jobPosts.find(j => j.id === newlySubmittedApp.jobId) : null;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Job Applications</h1>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {myApps.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track real-time recruitment progression and Decision Tree matching for Oriental Mindoro employers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onNavigate('jobs')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Briefcase className="w-4 h-4" />
            <span>Browse More Vacancies</span>
          </motion.button>
        </div>
      </div>

      {/* Subtle Framer Motion Success Banner */}
      <AnimatePresence>
        {showSuccessBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white border border-emerald-500/30 p-5 sm:p-6 shadow-xl shadow-emerald-950/20"
          >
            {/* Background Floating Micro-Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
              <motion.div
                animate={{ y: [-10, 10, -10], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 right-1/4 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"
              />
              <motion.div
                animate={{ y: [10, -10, 10], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 right-10 w-24 h-24 bg-teal-400/20 rounded-full blur-xl"
              />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              
              <div className="flex items-start sm:items-center gap-4">
                {/* Animated Pulsing Check Icon */}
                <div className="relative shrink-0">
                  <motion.div
                    animate={{ scale: [1, 1.35, 1.5], opacity: [0.6, 0.15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-2xl bg-emerald-400/40 -m-1"
                  />
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 450, damping: 22, delay: 0.1 }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 relative z-10"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    >
                      <Sparkles className="w-3 h-3" />
                      Application Dispatched
                    </motion.span>
                    <span className="text-[11px] text-slate-400">
                      PESO Compliant & Verified
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    {params?.jobTitle || newlySubmittedJob?.title || 'Application Submitted Successfully!'}
                  </h3>

                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Your credentials, resume, and Decision Tree match score have been safely delivered to{' '}
                    <strong className="text-white">{params?.companyName || newlySubmittedJob?.companyName || 'the employer'}</strong>.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                {highlightedAppId && (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => scrollToHighlighted(highlightedAppId)}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Application</span>
                  </motion.button>
                )}
                <button
                  onClick={() => setShowSuccessBanner(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by job title or company name..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Chips: 1. Applied ↓ 2. Reviewed ↓ 3. Interview Scheduled ↓ Accepted/Hired / Rejected */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({myApps.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('applied')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'applied'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Applied ({appliedCount})
          </button>
          <button
            onClick={() => setStatusFilter('reviewed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'reviewed'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Reviewed ({reviewedCount})
          </button>
          <button
            onClick={() => setStatusFilter('interview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'interview'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Interview Scheduled ({interviewCount})
          </button>
          <button
            onClick={() => setStatusFilter('hired')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'hired'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Accepted / Hired 🎉 ({hiredCount})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'rejected'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-xs space-y-4"
        >
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {searchQuery || statusFilter !== 'all' ? 'No Matching Applications' : 'No Job Applications Yet'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters or search keywords to view other submitted applications.'
                : 'Start browsing verified vacancies across Oriental Mindoro and apply using your Decision Tree matched profile.'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('jobs')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Find Job Vacancies
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.07
              }
            }
          }}
          className="space-y-4"
        >
          {filteredApps.map((app, index) => {
            const job = jobPosts.find(j => j.id === app.jobId);
            const currentStepIdx = getStepIndex(app.currentStatus);
            const appInterview = interviews.find(i => i.applicationId === app.id);
            const isNewlySubmitted = app.id === highlightedAppId;
            const isExpanded = expandedAppId === app.id;
            const matchScore = app.matchResult?.overallMatch ?? (app as any).matchScore ?? 85;
            const jobTitle = job?.title || (app as any).jobTitle || 'Job Position';
            const companyName = job?.companyName || (app as any).companyName || 'Company';

            return (
              <motion.div
                id={`app-card-${app.id}`}
                key={app.id}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
                }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isNewlySubmitted
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300'
                }`}
              >
                
                {/* Top Info Strip if newly submitted */}
                {isNewlySubmitted && (
                  <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 px-5 py-1.5 text-white text-[11px] font-bold flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <motion.span
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-white inline-block"
                      />
                      <span>✨ Newly Dispatched Application</span>
                    </div>
                    <span className="text-[10px] font-normal opacity-90">
                      Applied just now
                    </span>
                  </div>
                )}

                <div className="p-5 sm:p-6 space-y-5">
                  
                  {/* Job Header Strip */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={job?.companyLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80'}
                        alt={companyName}
                        onClick={() => setSelectedEmployerProfile({ companyName, employerId: job?.employerId })}
                        className="w-13 h-13 rounded-2xl object-cover ring-1 ring-slate-200/80 shrink-0 shadow-xs cursor-pointer hover:ring-2 hover:ring-indigo-400 hover:opacity-90 transition-all"
                        title="Click to visit employer profile"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900">{jobTitle}</h3>
                          {app.currentStatus === 'hired' && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                              Hired 🎉
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
                          <button
                            type="button"
                            onClick={() => setSelectedEmployerProfile({ companyName, employerId: job?.employerId })}
                            className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
                            title="Click to visit employer profile"
                          >
                            <span>{companyName}</span>
                            <ExternalLink className="w-3 h-3 text-indigo-400" />
                          </button>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3 h-3" />
                            {job?.municipality || 'Oriental Mindoro'}
                          </span>
                          <span>•</span>
                          <span className="text-slate-400">
                            Applied {new Date(app.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Match Score, ATS Tracking & Vacancy Button */}
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end flex-wrap sm:flex-nowrap">
                      <div className="bg-slate-900 text-emerald-400 border border-slate-800 px-3 py-1.5 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-inner">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{matchScore}% Match</span>
                      </div>

                      <button
                        onClick={() => setSelectedAtsApp(app)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                        title="View Applicant Tracking System (ATS) Audit & Keywords"
                      >
                        <Cpu className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>ATS: {app.atsScore || app.atsResult?.score || 94}%</span>
                      </button>

                      <span className="bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Status Updated by Employer</span>
                      </span>

                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onNavigate('job-detail', { jobId: app.jobId })}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
                      >
                        <span>View Vacancy</span>
                        <ExternalLink className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Application Status Tracker UI Representation */}
                  <ApplicationStatusTracker
                    application={app}
                    jobTitle={jobTitle}
                    companyName={companyName}
                    companyLogo={job?.companyLogo}
                    employerId={job?.employerId}
                    appliedDate={app.appliedDate}
                    matchScore={matchScore}
                    isEmployer={false}
                    onVisitEmployerProfile={() => setSelectedEmployerProfile({ companyName, employerId: job?.employerId })}
                    onScheduleInterview={app.currentStatus === 'hired' ? undefined : () => onNavigate('seeker-interviews')}
                    onViewDetails={() => setExpandedAppId(isExpanded ? null : app.id)}
                  />

                  {/* Congratulations Hired Banner when already hired */}
                  {app.currentStatus === 'hired' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                          <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                            <span>Officially Hired by {companyName}</span>
                            <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                              Completed 🎉
                            </span>
                          </p>
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            Interview conducted and hiring finalized. Congratulations on your employment!
                          </p>
                        </div>
                      </div>
                      <span className="px-3.5 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-2xs shrink-0 self-start sm:self-center">
                        Placement Confirmed
                      </span>
                    </motion.div>
                  )}

                  {/* Interview Alert Banner if scheduled (only if not yet hired) */}
                  {appInterview && app.currentStatus !== 'hired' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-950"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-blue-900">Official Interview Scheduled</p>
                          <p className="text-[11px] text-blue-700">
                            {new Date(appInterview.scheduledDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {appInterview.scheduledTime} ({appInterview.interviewType || 'In-Person'})
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onNavigate('seeker-interviews')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
                      >
                        Manage Interview
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Expandable Application & Decision Tree Details */}
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Application Details' : 'View Decision Tree & Submission Logs'}</span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden space-y-4 pt-4 text-xs"
                        >
                          {/* Match Details Grid */}
                          {app.matchResult && (
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>Decision Tree Qualification Breakdown</span>
                              </h4>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                                  <p className="text-[10px] text-slate-400 font-semibold">Education</p>
                                  <p className="text-sm font-black text-slate-900">{app.matchResult.educationMatchScore}%</p>
                                </div>
                                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                                  <p className="text-[10px] text-slate-400 font-semibold">Skills Alignment</p>
                                  <p className="text-sm font-black text-slate-900">{app.matchResult.skillsMatchScore}%</p>
                                </div>
                                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                                  <p className="text-[10px] text-slate-400 font-semibold">Experience</p>
                                  <p className="text-sm font-black text-slate-900">{app.matchResult.experienceMatchScore}%</p>
                                </div>
                                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                                  <p className="text-[10px] text-slate-400 font-semibold">Overall Match</p>
                                  <p className="text-sm font-black text-emerald-600">{app.matchResult.overallMatch}%</p>
                                </div>
                              </div>

                              {app.matchResult.decisionReason && (
                                <p className="text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-200/70 italic">
                                  "{app.matchResult.decisionReason}"
                                </p>
                              )}
                            </div>
                          )}

                          {/* ATS Resume Tracking Breakdown Card */}
                          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                                  <Cpu className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-white text-xs">ATS Resume Screening & Tracking Audit</h4>
                                  <p className="text-[10px] text-slate-400">Audited by eHANAP Applicant Tracking System</p>
                                </div>
                              </div>

                              <button
                                onClick={() => setSelectedAtsApp(app)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
                              >
                                <span>View Full ATS Audit</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                                <p className="text-[10px] text-slate-400">ATS Score</p>
                                <p className="text-sm font-black text-emerald-400">{app.atsScore || app.atsResult?.score || 94}/100</p>
                              </div>
                              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                                <p className="text-[10px] text-slate-400">ATS Grade</p>
                                <p className="text-sm font-black text-white">Grade {app.atsResult?.grade || 'A'}</p>
                              </div>
                              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                                <p className="text-[10px] text-slate-400">Readability</p>
                                <p className="text-sm font-black text-emerald-400">{app.atsResult?.readabilityScore || 95}%</p>
                              </div>
                              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                                <p className="text-[10px] text-slate-400">Keywords Matched</p>
                                <p className="text-sm font-black text-white">{app.atsResult?.matchedKeywords?.length || 5} terms</p>
                              </div>
                            </div>
                          </div>

                          {/* Audit Status History */}
                          {app.statusHistory && app.statusHistory.length > 0 && (
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-indigo-600" />
                                  <span>Application Status Timeline & Notes ({app.statusHistory.length})</span>
                                </h4>
                                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Managed by Employer</span>
                                </span>
                              </div>
                              <div className="space-y-2 pl-2 border-l-2 border-slate-200">
                                {(app.statusHistory || []).map((hist, hIdx) => (
                                  <div key={hIdx} className="text-[11px] relative pl-3">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 absolute -left-[17px] top-1" />
                                    <span className="font-bold text-slate-800 capitalize">{hist.status.replace(/_/g, ' ')}</span>
                                    <span className="text-slate-400 ml-2">
                                      {new Date(hist.updatedAt).toLocaleString()}
                                    </span>
                                    {hist.notes && <p className="text-slate-600 mt-0.5">{hist.notes}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Employer Feedback & Rating */}
                          {app.feedback && (
                            <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
                                  <Award className="w-4 h-4 text-amber-600" />
                                  <span>Employer Evaluation & Feedback</span>
                                </h4>
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <span
                                      key={star}
                                      className={`text-sm ${
                                        star <= app.feedback!.rating ? 'text-amber-500' : 'text-slate-300'
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                  <span className="text-xs font-black text-amber-900 ml-1">
                                    {app.feedback.rating}.0 / 5.0
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-amber-900 bg-white/70 p-3 rounded-xl border border-amber-100 italic">
                                "{app.feedback.comment}"
                              </p>
                              <p className="text-[10px] text-amber-700">
                                Submitted by {app.feedback.submittedBy} on {new Date(app.feedback.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          )}

                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>

              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Step Detail Explanation Modal */}
      {selectedStepDetail && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedStepDetail(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                  selectedStepDetail.isCurrent 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : selectedStepDetail.isCompleted 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {selectedStepDetail.isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : selectedStepDetail.stepIdx + 1}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedStepDetail.step.label}</h3>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    selectedStepDetail.isCurrent 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : selectedStepDetail.isCompleted 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {selectedStepDetail.isCurrent 
                      ? 'Currently Active Stage' 
                      : selectedStepDetail.isCompleted 
                      ? 'Stage Completed' 
                      : 'Upcoming Stage'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStepDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <p className="font-semibold text-slate-800 leading-relaxed">
                {selectedStepDetail.step.description}
              </p>
              <p className="text-[11px] text-slate-500">
                {selectedStepDetail.isCompleted 
                  ? 'This milestone has already been verified and recorded in PESO eHANAP.'
                  : selectedStepDetail.isCurrent 
                  ? 'Your application is currently at this stage awaiting employer review or interview schedule.'
                  : 'This step will automatically unlock once the employer completes the previous evaluation stage.'}
              </p>
            </div>

            {selectedStepDetail.step.key === 'ats_screened' && (
              <button
                onClick={() => {
                  const app = selectedStepDetail.app;
                  setSelectedStepDetail(null);
                  setSelectedAtsApp(app);
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Cpu className="w-4 h-4" />
                <span>View ATS Resume Keyword Audit</span>
              </button>
            )}

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedStepDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATS Resume Audit & Tracking Modal */}
      {selectedAtsApp && (
        <AtsResumeModal
          isOpen={Boolean(selectedAtsApp)}
          onClose={() => setSelectedAtsApp(null)}
          candidateName={currentSeekerProfile ? `${currentSeekerProfile.firstName} ${currentSeekerProfile.lastName}` : 'Candidate'}
          jobTitle={jobPosts.find(j => j.id === selectedAtsApp.jobId)?.title}
          companyName={jobPosts.find(j => j.id === selectedAtsApp.jobId)?.companyName}
          resumeFileName={currentSeekerProfile.resumes.find(r => r.id === selectedAtsApp.resumeId)?.fileName || 'Submitted_Resume.pdf'}
          atsResult={
            selectedAtsApp.atsResult ||
            evaluateResumeForAts(
              currentSeekerProfile,
              jobPosts.find(j => j.id === selectedAtsApp.jobId)
            )
          }
          isEmployer={false}
        />
      )}

      {/* Clickable Employer Profile Modal */}
      {selectedEmployerProfile && (
        <EmployerProfileModal
          isOpen={Boolean(selectedEmployerProfile)}
          onClose={() => setSelectedEmployerProfile(null)}
          companyName={selectedEmployerProfile.companyName}
          employerId={selectedEmployerProfile.employerId}
          onNavigateJob={(jobId) => onNavigate('job-detail', { jobId })}
          onBrowseDirectory={() => onNavigate('employers')}
        />
      )}

    </div>
  );
};
