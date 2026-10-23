import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { calculateDecisionTreeMatch } from '../utils/decisionTree';
import { ApplyForJobWindow } from './ApplyForJobWindow';
import { WriteCompanyReviewModal } from './WriteCompanyReviewModal';
import { 
  ArrowLeft, 
  Bookmark, 
  Building2, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Share2, 
  Send, 
  ShieldCheck, 
  Award, 
  FileText, 
  Users, 
  Calendar, 
  ChevronRight, 
  GraduationCap, 
  Sparkles, 
  ExternalLink, 
  Check,
  CheckCircle,
  HelpCircle,
  Star,
  UserCheck
} from 'lucide-react';

export interface JobOfferViewProps {
  job: {
    id: string;
    title: string;
    companyName: string;
    logoLetter: string;
    logoBg: string;
    location: string;
    tags: string[];
    applicantCount: number;
    salary: string;
    period: string;
    category: string;
    description: string;
    type: string;
    workSetup: 'Remote' | 'On-site' | 'Hybrid';
    experienceLevel: string;
    logoUrl?: string;
  };
  onBack: () => void;
  onNavigate?: (view: string, params?: any) => void;
  isBookmarked: boolean;
  onToggleBookmark: (jobId: string, jobTitle: string, e?: React.MouseEvent) => void;
  onSelectOtherJob?: (jobId: string) => void;
}

export const JobOfferView: React.FC<JobOfferViewProps> = ({
  job,
  onBack,
  onNavigate,
  isBookmarked,
  onToggleBookmark,
  onSelectOtherJob
}) => {
  const { 
    currentUser,
    currentSeekerProfile, 
    jobPosts, 
    employers, 
    applications, 
    applyForJob, 
    showToast,
    companyReviews
  } = useApp();

  // 3 Tabs: About (Description), Company, Review (matching design image)
  const [activeTab, setActiveTab] = useState<'about' | 'company' | 'review'>('about');
  const [isApplyWindowOpen, setIsApplyWindowOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Find linked database job post if available
  const fullJobPost = jobPosts.find(j => j.id === job.id);
  const employer = fullJobPost 
    ? employers.find(e => e.id === fullJobPost.employerId || e.companyName.toLowerCase() === fullJobPost.companyName.toLowerCase())
    : employers.find(e => e.companyName.toLowerCase() === job.companyName.toLowerCase());

  // Check if viewed by applicant vs guest
  const isApplicant = Boolean(currentUser && currentUser.role === 'job_seeker' && currentSeekerProfile);

  // Compute Decision Tree match score specifically for the applicant
  const applicantMatch = useMemo(() => {
    if (!isApplicant || !currentSeekerProfile) return null;
    return calculateDecisionTreeMatch(currentSeekerProfile, fullJobPost || (job as any));
  }, [isApplicant, currentSeekerProfile, fullJobPost, job]);

  // Check if currently applied
  const existingApp = currentSeekerProfile
    ? applications.find(a => a.jobId === job.id && a.jobSeekerId === currentSeekerProfile.id)
    : null;

  // Real-time applicant records count directly from the system
  const realApplicantCount = (applications || []).filter(a => a.jobId === job.id).length;

  // Real employer profile logo
  const employerLogo = job.logoUrl || employer?.logoUrl || fullJobPost?.companyLogo;

  // Other vacancies by this employer
  const otherJobs = jobPosts.filter(j => 
    (j.employerId === fullJobPost?.employerId || j.companyName.toLowerCase() === job.companyName.toLowerCase()) && 
    j.id !== job.id && 
    j.status === 'active'
  );

  const handleApply = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!currentSeekerProfile) {
      showToast({
        title: 'Authentication Required',
        message: 'Please log in as a job seeker to submit your application.',
        type: 'alert'
      });
      return;
    }

    if (existingApp) {
      showToast({
        title: 'Already Applied',
        message: `You have already submitted an application for ${job.title}.`,
        type: 'info'
      });
      return;
    }

    // Open new Apply for Job window to prevent accidental misclick
    setIsApplyWindowOpen(true);
  };

  const handleShare = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `${job.title} at ${job.companyName}`,
        text: `Check out this job opening in Roxas, Oriental Mindoro: ${job.title} at ${job.companyName}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast({
        title: 'Link Copied',
        message: 'Job link copied to clipboard.',
        type: 'info'
      });
    }
  };

  const responsibilities = fullJobPost?.responsibilities && fullJobPost.responsibilities.length > 0
    ? fullJobPost.responsibilities
    : [
        `Execute daily duties aligned with ${job.title} standards and company standard operating procedures.`,
        'Coordinate closely with team leads and municipal department supervisors.',
        'Maintain high operational accuracy, data privacy, and workplace safety compliance.',
        'Submit weekly workflow reports and participate in cross-functional team initiatives.'
      ];

  const requirements = fullJobPost?.requirements && fullJobPost.requirements.length > 0
    ? fullJobPost.requirements
    : [
        { id: 'r-edu', category: 'education', title: fullJobPost?.minEducationalAttainment || 'College Degree / TVET Graduate', importance: 'required', value: 'College Graduate' },
        { id: 'r-exp', category: 'experience', title: `${fullJobPost?.minExperienceYears || 1}+ year(s) of relevant field experience`, importance: 'preferred', value: '1 year' },
        { id: 'r-loc', category: 'residency', title: 'Resident of Roxas or nearby Oriental Mindoro municipalities', importance: 'preferred', value: 'Roxas resident' }
      ];

  const skillsList = fullJobPost?.technicalSkills && fullJobPost.technicalSkills.length > 0
    ? fullJobPost.technicalSkills
    : (fullJobPost?.requiredSkills || ['Communication', 'Teamwork', 'Attention to Detail', 'Problem Solving']);

  // Dedicated Apply for Job window (prevents accidental misclick, auto-attaches resume from profile)
  if (isApplyWindowOpen) {
    return (
      <ApplyForJobWindow
        job={job}
        onClose={() => setIsApplyWindowOpen(false)}
        onSuccess={() => {
          setIsApplyWindowOpen(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans pb-28 md:pb-16 select-none animate-in fade-in duration-200">
      
      {/* Container: Responsive for Website & Mobile */}
      <div className="max-w-md sm:max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto px-3 sm:px-6 pt-3 sm:pt-6 space-y-6">

        {/* TOP BAR (Circular Back Button + Title + Actions) */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer active:scale-95"
              title="Back to Dashboard"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <span className="hidden sm:inline-block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Back to Job Vacancies
            </span>
          </div>

          <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight text-center">
            Job Offer Details
          </h1>

          <div className="flex items-center gap-2">
            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer active:scale-95"
              title="Share job opening"
            >
              <Share2 className="w-4.5 h-4.5" />
            </button>

            {/* Bookmark Button */}
            <button
              type="button"
              onClick={(e) => onToggleBookmark(job.id, job.title, e)}
              className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer active:scale-95"
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
            >
              <Bookmark className={`w-4.5 h-4.5 transition-all ${isBookmarked ? 'fill-slate-900 text-slate-900' : 'text-slate-500'}`} />
            </button>
          </div>
        </div>

        {/* HERO / HEADER CARD (Styled matching royal blue aesthetic) */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-5 sm:p-7 shadow-xl border border-blue-500/30">
          {/* Subtle Organic Topographical Curves */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none opacity-20" 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 500 240"
            preserveAspectRatio="none"
          >
            <path d="M-20,40 Q150,-10 280,60 T520,30" fill="none" stroke="#ffffff" strokeWidth="1.6" />
            <path d="M-20,80 Q140,20 290,100 T520,60" fill="none" stroke="#ffffff" strokeWidth="1.6" />
            <path d="M-20,120 Q160,50 310,140 T520,90" fill="none" stroke="#ffffff" strokeWidth="1.6" />
            <path d="M-20,160 Q180,80 330,180 T520,130" fill="none" stroke="#ffffff" strokeWidth="1.6" />
          </svg>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              {/* Employer Profile Avatar & Verified Badge (Click to open Employer Profile) */}
              <button
                type="button"
                onClick={() => setActiveTab('company')}
                title="View Employer Profile & Accreditation"
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${job.logoBg} flex items-center justify-center font-serif font-black text-2xl sm:text-3xl shadow-md shrink-0 border border-white/20 overflow-hidden cursor-pointer hover:ring-4 hover:ring-white/30 transition-all active:scale-95 group`}
              >
                {employerLogo ? (
                  <img
                    src={employerLogo}
                    alt={job.companyName}
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{job.logoLetter}</span>
                )}

                {/* Verified Employer Shield Badge */}
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs"
                  title="PESO Verified Employer Profile"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                    {job.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-300" />
                    PESO Verified Employer
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                  {job.title}
                </h2>

                <p className="text-xs sm:text-sm text-white/80 font-medium flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-white">{job.companyName}</span>
                  <span className="text-white/40">•</span>
                  <span className="flex items-center gap-1 text-white/80">
                    <MapPin className="w-3.5 h-3.5 text-white/60" />
                    {job.location}
                  </span>
                </p>
              </div>
            </div>

            {/* Desktop Action & Salary Highlight */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-white/15 gap-2">
              <div className="text-left md:text-right">
                <div className="text-lg sm:text-2xl font-black text-white">
                  {job.salary}
                  <span className="text-xs font-normal text-white/70 ml-1">{job.period}</span>
                </div>
                <p className="text-[11px] text-white/80 font-medium flex items-center gap-1.5 md:justify-end">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{realApplicantCount} {realApplicantCount === 1 ? 'Applicant recorded' : 'Total Applicants'}</span>
                </p>
              </div>

              {/* Desktop Quick Apply Button */}
              <div className="hidden md:flex items-center gap-2 mt-2">
                {existingApp ? (
                  <div className="px-5 py-2.5 bg-emerald-500/30 border border-emerald-400/50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-300" />
                    <span>Application Submitted</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleApply}
                    className="px-6 py-2.5 bg-white text-blue-700 hover:bg-blue-50 active:scale-95 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Quick Apply Now</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tags Row */}
          <div className="relative z-10 flex flex-wrap items-center gap-1.5 mt-4 pt-4 border-t border-white/10">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="bg-white/15 text-white text-[11px] font-semibold px-2.5 py-1 rounded-xl backdrop-blur-xs border border-white/10"
              >
                {tag}
              </span>
            ))}
            <span className="bg-white/15 text-white text-[11px] font-semibold px-2.5 py-1 rounded-xl backdrop-blur-xs border border-white/10">
              {job.experienceLevel}
            </span>
          </div>
        </div>

        {/* TAB NAVIGATION SWITCHER (About, Company, Review matching design image) */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-xs flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'about'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>About</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'company'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Company</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'review'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Review</span>
          </button>
        </div>

        {/* TAB CONTENT AREA (Website 2-Column Responsive Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* MAIN COLUMN (Tab Content) */}
          <div className="lg:col-span-8 space-y-6">

            {/* TAB 1: ABOUT (DESCRIPTION) */}
            {activeTab === 'about' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                
                {/* DEDICATED DECISION TREE MATCH BREAKDOWN VISUAL (Applicant Only - Hidden for Guests) */}
                {isApplicant && applicantMatch && (
                  <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 border border-indigo-800/40 shadow-xl space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-emerald-400">
                          <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                              AI Decision Tree Match Breakdown
                            </h3>
                          </div>
                          <p className="text-xs text-indigo-200/80">
                            Intelligent candidate qualification vs. Roxas vacancy criteria
                          </p>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-sm shrink-0 self-start sm:self-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>{applicantMatch.overallMatch}% Match • {applicantMatch.outcome === 'HIGHLY QUALIFIED' ? 'Highly Qualified' : applicantMatch.outcome === 'QUALIFIED' ? 'Qualified' : 'Under Evaluation'}</span>
                      </div>
                    </div>

                    {/* Criteria Comparison Bars */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {/* 1. Education Match */}
                      <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                            <GraduationCap className="w-4 h-4 text-emerald-400" />
                            <span>Education</span>
                          </span>
                          <span className="font-bold text-emerald-400">{applicantMatch.educationMatchScore}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" 
                            style={{ width: `${Math.min(100, Math.max(10, applicantMatch.educationMatchScore))}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight">
                          Degree & attainment evaluated against vacancy criteria.
                        </p>
                      </div>

                      {/* 2. Skills Match */}
                      <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-indigo-400" />
                            <span>Skills & Tools</span>
                          </span>
                          <span className="font-bold text-indigo-300">{applicantMatch.skillsMatchScore}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full" 
                            style={{ width: `${Math.min(100, Math.max(10, applicantMatch.skillsMatchScore))}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight">
                          Primary skills match vs. employer requirements.
                        </p>
                      </div>

                      {/* 3. Work Experience */}
                      <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-amber-400" />
                            <span>Experience</span>
                          </span>
                          <span className="font-bold text-amber-300">{applicantMatch.experienceMatchScore}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" 
                            style={{ width: `${Math.min(100, Math.max(10, applicantMatch.experienceMatchScore))}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight">
                          Years & field experience assessed for placement.
                        </p>
                      </div>
                    </div>

                    {/* Decision Tree Verification Checklist */}
                    <div className="p-3.5 bg-indigo-950/60 border border-indigo-800/40 rounded-2xl space-y-2 text-xs text-indigo-100">
                      <p className="font-bold text-indigo-200 uppercase tracking-wider text-[10px]">
                        Verified Qualification Factors
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Residency: Roxas, Oriental Mindoro (Local Priority)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>PESO Accredited Employer • Zero Placement Fees</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>DOLE Labor Standards & Mandated Coverage Verified</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>ATS Screened Bio-data Format Score: {applicantMatch.overallMatch}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* About the Role */}
                <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-slate-700" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      About The Role
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {job.description}
                  </p>
                </div>

                {/* Responsibilities */}
                <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4.5 h-4.5 text-slate-700" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Key Responsibilities
                    </h3>
                  </div>
                  <ul className="space-y-2.5">
                    {responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 leading-normal">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-2 shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Requirements & Qualifications */}
                <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4.5 h-4.5 text-slate-700" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Position Requirements & Qualifications
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    {requirements.map((req, i) => (
                      <div 
                        key={req.id || i}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3"
                      >
                        <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-emerald-600">
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900">
                            {req.title}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {req.category?.toUpperCase()} • {req.importance === 'required' ? 'Mandatory Requirement' : 'Preferred Advantage'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills & Competencies */}
                <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4.5 h-4.5 text-slate-700" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Target Competencies & Skills
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {skillsList.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/70"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Statutory DOLE Benefits & Perks */}
                <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Compensation & Mandated Benefits
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-slate-600">
                    <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>SSS, PhilHealth & Pag-IBIG Mandatory Coverage</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>13th Month Pay & Standard Holiday Premiums</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Service Incentive Leave (SIL) upon regularization</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Local Transportation & On-site Hazard/Meal Subsidy</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: COMPANY */}
            {activeTab === 'company' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                
                {/* Company Profile Card */}
                <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
                  <div className="flex items-start gap-4">
                    <div className={`relative w-14 h-14 rounded-2xl ${job.logoBg} flex items-center justify-center font-serif font-black text-2xl shrink-0 shadow-sm overflow-hidden border border-slate-200/80`}>
                      {employerLogo ? (
                        <img
                          src={employerLogo}
                          alt={job.companyName}
                          className="w-full h-full object-cover rounded-2xl"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>{job.logoLetter}</span>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-white shadow-2xs">
                        <ShieldCheck className="w-3 h-3" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        {job.companyName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {employer?.industry || job.category} • Registered in Roxas, Oriental Mindoro
                      </p>
                      <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>DOLE & PESO LGU-Accredited Employer</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      About the Organization
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {employer?.companyDescription || 
                        `${job.companyName} is a verified municipal employer operating in Roxas, Oriental Mindoro, actively participating in legitimate workforce recruitment under Public Employment Service Office (PESO) oversight.`}
                    </p>
                  </div>

                  {/* Company Contact Card (Exact match to design image with Chat & Call buttons) */}
                  <div className="bg-slate-50 rounded-3xl p-5 sm:p-6 border border-slate-100 space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Company Contact
                    </h4>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
                            alt="Jenny Wilson"
                            className="w-12 h-12 rounded-full object-cover shadow-xs border-2 border-white"
                            referrerPolicy="no-referrer"
                          />
                          <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-sm font-bold text-slate-900">Jenny Wilson</h5>
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">HR Recruitment Lead • Mindoro Branch</p>
                        </div>
                      </div>
                    </div>

                    {/* Working Hours */}
                    <div className="pt-3 border-t border-slate-200/70 text-xs">
                      <div className="flex items-center justify-between text-slate-500 py-1">
                        <span>Monday - Friday</span>
                        <span className="font-semibold text-slate-800">08:00 AM - 05:00 PM</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 py-1">
                        <span>Saturday</span>
                        <span className="font-semibold text-slate-800">08:00 AM - 12:00 PM</span>
                      </div>
                    </div>
                  </div>

                  {/* Workplace Photos Gallery */}
                  <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Workplace Gallery
                      </h4>
                      <span className="text-[11px] text-blue-600 font-bold">Roxas Facility</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      {[
                        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&auto=format&fit=crop&q=80"
                      ].map((imgUrl, i) => (
                        <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 group">
                          <img
                            src={imgUrl}
                            alt="Workplace preview"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Other Open Positions from this Employer */}
                <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4.5 h-4.5 text-slate-700" />
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                        Other Vacancies by this Employer
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                      {otherJobs.length} opening(s)
                    </span>
                  </div>

                  {otherJobs.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500 font-medium">
                        Currently no other active job posts from {job.companyName}.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {otherJobs.map((oj) => (
                        <div
                          key={oj.id}
                          onClick={() => onSelectOtherJob ? onSelectOtherJob(oj.id) : undefined}
                          className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 transition-all flex items-center justify-between cursor-pointer group"
                        >
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {oj.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {oj.employmentType} • {oj.workLocation || 'Roxas, Oriental Mindoro'} • {oj.salaryRange}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 3: REVIEW (Exact match to design image) */}
            {activeTab === 'review' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Overall Rating Overview */}
                <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="text-center sm:text-left">
                      <div className="text-4xl font-black text-slate-900 tracking-tight">
                        4.8
                      </div>
                      <div className="flex items-center gap-1 justify-center sm:justify-start text-amber-400 my-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Based on {companyReviews.length + 18} verified worker reviews
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Star className="w-4 h-4" />
                    <span>Write Company Review</span>
                  </button>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {companyReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={rev.reviewerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                            alt={rev.reviewerName}
                            className="w-10 h-10 rounded-full object-cover shadow-xs border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="text-xs font-bold text-slate-900">{rev.reviewerName}</h5>
                              <ShieldCheck className="w-3 h-3 text-blue-600" />
                            </div>
                            <div className="flex items-center gap-1 text-amber-400 mt-0.5">
                              {Array.from({ length: rev.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-400 font-medium">Verified Applicant</span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {rev.comment}
                      </p>

                      {rev.photoUrl && (
                        <div className="w-48 h-28 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 mt-2">
                          <img
                            src={rev.photoUrl}
                            alt="Review attachment"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* SIDEBAR COLUMN (Website Version At-a-Glance Overview) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Job Summary Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Job Overview
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Category</span>
                  <span className="font-bold text-slate-800 text-right">{job.category}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Employment Type</span>
                  <span className="font-bold text-slate-800">{job.type}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Work Arrangement</span>
                  <span className="font-bold text-slate-800">{job.workSetup}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Experience Level</span>
                  <span className="font-bold text-slate-800">{job.experienceLevel}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Salary Range</span>
                  <span className="font-bold text-emerald-700">{job.salary}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Municipality</span>
                  <span className="font-bold text-slate-800">Roxas, Oriental Mindoro</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Vacancies</span>
                  <span className="font-bold text-slate-800">{fullJobPost?.vacanciesCount || 2} Slot(s)</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 font-medium">Real-Time Applicants</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{realApplicantCount} {realApplicantCount === 1 ? 'Applicant' : 'Applicants'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Box (Desktop) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Application Action
              </h3>

              {existingApp ? (
                <div className="space-y-2">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Application Submitted</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Your profile and active resume have been dispatched to {job.companyName}.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('seeker-applications')}
                    className="w-full py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>View in My Applications</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleApply}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Quick Apply Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => onToggleBookmark(job.id, job.title, e)}
                    className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-slate-900 text-slate-900' : 'text-slate-500'}`} />
                    <span>{isBookmarked ? 'Saved to Bookmarks' : 'Bookmark this Vacancy'}</span>
                  </button>
                </div>
              )}

              {/* PESO Trust Badge */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Protected under RA 8759 (PESO Act) with zero recruitment fees.</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* FLOATING BOTTOM ACTION BAR (Mobile screens only) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl z-40 p-3 max-w-md mx-auto">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={(e) => onToggleBookmark(job.id, job.title, e)}
            className="w-12 h-12 border border-slate-200 rounded-2xl bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shrink-0 cursor-pointer shadow-xs active:scale-95"
            title="Bookmark"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-slate-900 text-slate-900' : 'text-slate-500'}`} />
          </button>

          {existingApp ? (
            <div className="flex-1 h-12 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Application Submitted</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Apply Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Write Company Review Modal */}
      {isReviewModalOpen && (
        <WriteCompanyReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          employerId={employer?.id || job.id}
          companyName={job.companyName}
        />
      )}

    </div>
  );
};

