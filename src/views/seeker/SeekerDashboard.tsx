import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationDrawer } from '../../components/NotificationDrawer';
import { getFilteredUserNotifications } from '../../utils/notificationUtils';
import { JobOfferView } from '../../components/JobOfferView';
import { ResumeUploadModal } from './ResumeUploadModal';
import { ResumePDFExportModal } from '../../components/ResumePDFExportModal';
import { ResumeBuilderModal } from '../../components/ResumeBuilderModal';
import { JobFilterModal, FilterState } from '../../components/JobFilterModal';
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  Bell, 
  SlidersHorizontal, 
  Bookmark, 
  Share2, 
  Check, 
  ArrowRight, 
  X, 
  Sparkles, 
  Briefcase, 
  Home, 
  Compass, 
  MessageSquare, 
  User, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Send,
  PhoneCall
} from 'lucide-react';
import { calculateDecisionTreeMatch } from '../../utils/decisionTree';

interface SeekerDashboardProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenSubscriptions?: () => void;
  initialJobId?: string;
}

interface DisplayJob {
  id: string;
  title: string;
  companyName: string;
  logoLetter: string;
  logoBg: string;
  logoUrl?: string;
  location: string;
  tags: string[];
  applicantCount: number;
  salary: string;
  period: string;
  category: string;
  description: string;
  type: string;
  workSetup: 'Remote' | 'On-site' | 'Hybrid';
  experienceLevel: 'Internship' | 'Entry Level' | 'Mid Level' | 'Mid-Senior Level' | 'Senior Level' | 'Executive';
}

const DEFAULT_REGISTERED_JOBS: DisplayJob[] = [];

const CATEGORY_TABS = [
  'All',
  'Customer Service & Retail',
  'IT & Software',
  'Agriculture & Farming',
  'Accounting & Finance',
  'Logistics & Engineering',
  'Healthcare & Medical'
];

const LOCATIONS = [
  'Roxas, Oriental Mindoro'
];

export const SeekerDashboard: React.FC<SeekerDashboardProps> = ({ onNavigate, onOpenSubscriptions, initialJobId }) => {
  const { 
    currentUser,
    currentSeekerProfile, 
    applyForJob, 
    showToast, 
    notifications,
    jobPosts,
    employers,
    applications,
    interviews,
    referralSlips
  } = useApp();

  // State
  const [currentLocation] = useState('Roxas, Oriental Mindoro');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    location: '',
    minSalary: 10000,
    maxSalary: 100000,
    workModel: 'All',
    experienceLevel: 'All',
    jobTitle: 'All',
    category: 'All'
  });
  const [viewingJob, setViewingJob] = useState<DisplayJob | null>(null);

  // Filter criteria
  const [filterWorkSetup, setFilterWorkSetup] = useState<'all' | 'Remote' | 'On-site' | 'Hybrid'>('all');
  const [filterJobType, setFilterJobType] = useState<'all' | 'Full-Time' | 'Part-Time' | 'Contract'>('all');

  // Bookmarks persistence
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('seeker_bookmarked_jobs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Decision Tree match score evaluator for Seeker Job Feed
  const getJobMatchScore = (jobId: string): { score: number; label: string } => {
    if (currentSeekerProfile && jobPosts && jobPosts.length > 0) {
      const targetJob = jobPosts.find(j => j.id === jobId);
      if (targetJob) {
        const matchRes = calculateDecisionTreeMatch(currentSeekerProfile, targetJob);
        const score = Math.max(65, Math.round(matchRes.overallMatch));
        const label = score >= 90 ? 'Highly Qualified' :
                      score >= 78 ? 'Qualified' :
                      score >= 65 ? 'Potential Match' : 'General Match';
        return { score, label };
      }
    }
    return { score: 88, label: 'Qualified' };
  };

  // Transform real registered employer jobs from AppContext into DisplayJob
  const registeredDisplayJobs: DisplayJob[] = useMemo(() => {
    if (!jobPosts || jobPosts.length === 0) {
      return [];
    }

    const colorPalettes = [
      'bg-[#43464b] text-white',
      'bg-[#525252] text-white',
      'bg-[#3f3f46] text-white',
      'bg-[#27272a] text-white',
      'bg-[#404040] text-white'
    ];

    return jobPosts
      .filter(j => j.status === 'active')
      .map((job, idx) => {
        const emp = employers?.find(e => e.id === job.employerId);
        const appCount = (applications || []).filter(a => a.jobId === job.id).length;
        const compName = job.companyName || emp?.companyName || 'Registered Employer';
        const initial = compName.charAt(0).toUpperCase();

        const isRemote = job.workLocation?.toLowerCase().includes('remote');
        const isHybrid = job.workLocation?.toLowerCase().includes('hybrid');
        const workSetup: 'Remote' | 'On-site' | 'Hybrid' = isRemote ? 'Remote' : (isHybrid ? 'Hybrid' : 'On-site');

        const tags: string[] = [
          job.employmentType || 'Full-Time',
          workSetup,
          job.preferredDegree?.split('/')[0]?.trim() || job.minEducationalAttainment || 'Degree Holder'
        ];

        // Format salary e.g. "₱28,000 - ₱38,000 / month" -> "₱28k - ₱38k"
        let sal = job.salaryRange.replace(' / month', '').replace('/month', '').trim();
        const numMatches = sal.match(/₱?(\d{1,3}),?(\d{3})/g);
        if (numMatches && numMatches.length >= 2) {
          const first = parseInt(numMatches[0].replace(/[^0-9]/g, ''), 10);
          const second = parseInt(numMatches[1].replace(/[^0-9]/g, ''), 10);
          if (!isNaN(first) && !isNaN(second)) {
            sal = `₱${Math.round(first / 1000)}k - ₱${Math.round(second / 1000)}k`;
          }
        }

        let expLevel: DisplayJob['experienceLevel'] = 'Entry Level';
        if (job.minExperienceYears >= 5) expLevel = 'Senior Level';
        else if (job.minExperienceYears >= 3) expLevel = 'Mid-Senior Level';
        else if (job.minExperienceYears >= 1) expLevel = 'Mid Level';

        return {
          id: job.id,
          title: job.title,
          companyName: compName,
          logoLetter: `${initial}.`,
          logoBg: colorPalettes[idx % colorPalettes.length],
          logoUrl: job.companyLogo || emp?.logoUrl,
          location: job.workLocation || 'Roxas, Oriental Mindoro',
          tags,
          applicantCount: appCount,
          salary: sal,
          period: '/month',
          category: job.category,
          description: job.description,
          type: job.employmentType || 'Full-Time',
          workSetup,
          experienceLevel: expLevel
        };
      });
  }, [jobPosts, employers, applications]);

  // Suggested Jobs: prioritized vacancies matching seeker preferences / qualifications
  const suggestedJobs = useMemo(() => {
    if (currentSeekerProfile && jobPosts && jobPosts.length > 0) {
      return [...registeredDisplayJobs].sort((a, b) => {
        const scoreA = getJobMatchScore(a.id).score;
        const scoreB = getJobMatchScore(b.id).score;
        return scoreB - scoreA;
      });
    }

    return registeredDisplayJobs;
  }, [registeredDisplayJobs, currentSeekerProfile, jobPosts]);

  const toggleBookmark = (jobId: string, jobTitle: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const exists = bookmarkedIds.includes(jobId);
    const next = exists ? bookmarkedIds.filter(id => id !== jobId) : [...bookmarkedIds, jobId];
    setBookmarkedIds(next);
    try {
      localStorage.setItem('seeker_bookmarked_jobs', JSON.stringify(next));
    } catch {}
    showToast({
      title: exists ? 'Removed from Bookmarks' : 'Saved to Bookmarks',
      message: exists ? `"${jobTitle}" was removed from your saved list.` : `"${jobTitle}" has been saved to your bookmarks.`,
      type: exists ? 'info' : 'success'
    });
  };

  // Quick Apply
  const handleQuickApply = (job: DisplayJob, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentSeekerProfile) {
      showToast({
        title: 'Authentication Required',
        message: 'Please log in to submit your job application.',
        type: 'alert'
      });
      return;
    }

    applyForJob(
      job.id,
      currentSeekerProfile.id,
      currentSeekerProfile.activeResumeId || currentSeekerProfile.resumes?.[0]?.id || 'res-1'
    );

    showToast({
      title: 'Application Dispatched! 🎉',
      message: `Your resume and profile were sent to ${job.companyName} for the ${job.title} position.`,
      type: 'success'
    });

    setViewingJob(null);
  };

  // Sync initialJobId with viewingJob
  useEffect(() => {
    if (initialJobId && registeredDisplayJobs.length > 0) {
      const match = registeredDisplayJobs.find(j => j.id === initialJobId);
      if (match) setViewingJob(match);
    }
  }, [initialJobId, registeredDisplayJobs]);

  // Filtered lists
  const filteredSuggested = suggestedJobs.filter(job => {
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSetup = filterWorkSetup === 'all' || job.workSetup === filterWorkSetup;
    const matchesType = filterJobType === 'all' || job.type === filterJobType;
    return matchesSearch && matchesSetup && matchesType;
  });

  const filteredRecent = registeredDisplayJobs.filter(job => {
    let matchesCategory = selectedCategory === 'All';
    if (!matchesCategory) {
      if (selectedCategory === 'IT & Software' && job.category.includes('Information Technology')) matchesCategory = true;
      else if (selectedCategory === 'Agriculture & Farming' && job.category.includes('Agriculture')) matchesCategory = true;
      else if (selectedCategory === 'Accounting & Finance' && job.category.includes('Accounting')) matchesCategory = true;
      else if (selectedCategory === 'Logistics & Engineering' && job.category.includes('Engineering')) matchesCategory = true;
      else if (selectedCategory === 'Healthcare & Medical' && job.category.includes('Healthcare')) matchesCategory = true;
      else if (selectedCategory === 'Customer Service & Retail' && job.category.includes('Customer Service')) matchesCategory = true;
      else if (job.category.toLowerCase().includes(selectedCategory.toLowerCase())) matchesCategory = true;
    }

    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSetup = filterWorkSetup === 'all' || job.workSetup === filterWorkSetup;
    const matchesType = filterJobType === 'all' || job.type === filterJobType;
    return matchesCategory && matchesSearch && matchesSetup && matchesType;
  });

  const userNotifs = getFilteredUserNotifications(
    notifications,
    currentUser,
    currentSeekerProfile,
    applications,
    interviews,
    referralSlips
  );
  const unreadNotifCount = userNotifs.filter(n => !n.read).length;

  // If a job offer is selected to view, show it as a tabbed view instead of a floating div
  if (viewingJob) {
    return (
      <JobOfferView
        job={viewingJob}
        onBack={() => setViewingJob(null)}
        onNavigate={onNavigate}
        isBookmarked={bookmarkedIds.includes(viewingJob.id)}
        onToggleBookmark={toggleBookmark}
        onSelectOtherJob={(ojId) => {
          const nextJob = registeredDisplayJobs.find(j => j.id === ojId);
          if (nextJob) setViewingJob(nextJob);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans pb-12 select-none">
      
      {/* Centered App Container */}
      <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto px-3 sm:px-4 pt-3 sm:pt-5 space-y-6">

        {/* TOP CONTOURED HEADER BANNER (Matches royal blue Color UI Design) */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-5 sm:p-6 shadow-xl border border-blue-500/30">
          
          {/* Subtle Organic Topographical Contour Curves */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none opacity-25" 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 500 240"
            preserveAspectRatio="none"
          >
            <path d="M-20,40 Q150,-10 280,60 T520,30" fill="none" stroke="#ffffff" strokeWidth="1.6" />
            <path d="M-20,80 Q140,20 290,100 T520,60" fill="none" stroke="#ffffff" strokeWidth="1.6" />
            <path d="M-20,120 Q160,50 310,140 T520,90" fill="none" stroke="#ffffff" strokeWidth="1.6" />
            <path d="M-20,160 Q180,80 330,180 T520,130" fill="none" stroke="#ffffff" strokeWidth="1.6" />
            <path d="M-20,200 Q200,120 350,220 T520,170" fill="none" stroke="#ffffff" strokeWidth="1.6" />
          </svg>

          <div className="relative z-10 space-y-4">
            
            {/* Top Row: Location & Notification Bell */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-white/70 font-medium tracking-wide">
                  Location
                </p>
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-sm sm:text-base font-bold text-white mt-0.5 cursor-default"
                  >
                    <MapPin className="w-4 h-4 text-white shrink-0" />
                    <span>{currentLocation}</span>
                  </button>
                </div>
              </div>

              {/* Notification Bell Button */}
              <button
                onClick={() => setIsNotifDrawerOpen(true)}
                className="relative p-2.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-2xl border border-white/15 shadow-sm transition-all cursor-pointer backdrop-blur-xs"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5 text-white" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-blue-600" />
                )}
              </button>
            </div>

            {/* Bottom Row: Search Bar & Filter Button */}
            <div className="flex items-center gap-2.5 pt-1">
              {/* White Search Input Card */}
              <div className="flex-1 bg-white rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-sm">
                <Search className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search jobs, categories or companies"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="p-3 bg-white hover:bg-blue-50 active:scale-95 text-blue-600 rounded-2xl shadow-sm transition-all cursor-pointer shrink-0"
                title="Filter preferences"
                aria-label="Filter preferences"
              >
                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
              </button>
            </div>

          </div>
        </div>

        {/* SECTION 1: SUGGESTED JOBS (Matches image.png) */}
        <div className="space-y-3">
          
          {/* Header Row */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Recommended For You
              </h2>
              {currentSeekerProfile && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Aligned with your Profile</span>
                </span>
              )}
            </div>
            <button
              onClick={() => onNavigate('jobs')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              See all
            </button>
          </div>

          {/* Horizontal Carousel Cards */}
          <div className="flex items-stretch gap-3.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {filteredSuggested.length === 0 ? (
              <div className="w-full bg-white rounded-3xl p-8 text-center border border-slate-200/80">
                <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No Job Offers Available Yet</p>
                <p className="text-[11px] text-slate-400 mt-1">There are no job vacancies posted yet in Roxas. Newly registered employers will publish openings here.</p>
              </div>
            ) : (
              filteredSuggested.map((job) => {
                const isBookmarked = bookmarkedIds.includes(job.id);
                const match = getJobMatchScore(job.id);
                return (
                  <div
                    key={job.id}
                    onClick={() => setViewingJob(job)}
                    className="min-w-[280px] sm:min-w-[320px] max-w-[340px] bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3.5 snap-start shrink-0 relative group"
                  >
                    <div>
                      {/* Decision Tree Match Score Badge & Tag */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-black shadow-2xs">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                          <span>{match.score}% Match</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                          {match.label}
                        </span>
                      </div>

                      {/* Top Row: Logo, Title & Bookmark */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Dark Squircle Logo with Initial */}
                          <div className={`relative w-12 h-12 rounded-2xl ${job.logoBg} flex items-center justify-center text-white font-serif font-black text-2xl shadow-xs shrink-0 overflow-hidden`}>
                            {job.logoUrl ? (
                              <img src={job.logoUrl} alt={job.companyName} className="w-full h-full object-cover" />
                            ) : (
                              job.logoLetter
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                              <span className="text-xs text-slate-500 font-medium">{job.companyName}</span>
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-blue-600 stroke-[2.5]" />
                                <span>PESO-Verified</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bookmark Ribbon */}
                        <button
                          type="button"
                          onClick={(e) => toggleBookmark(job.id, job.title, e)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
                          aria-label="Bookmark job"
                        >
                          <Bookmark 
                            className={`w-5 h-5 transition-all ${
                              isBookmarked 
                                ? 'fill-slate-800 text-slate-800 scale-105' 
                                : 'text-slate-400 hover:text-slate-700'
                            }`} 
                          />
                        </button>
                      </div>

                      {/* Location Row */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>

                      {/* Tags Row */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        {job.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-slate-100/90 text-slate-600 text-[11px] font-semibold px-2.5 py-1 rounded-xl"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Row: Experience Level, Work Setup & Salary */}
                    <div className="pt-2.5 flex items-center justify-between border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100/90 text-slate-600 text-[11px] font-medium">
                          {job.experienceLevel}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                          • {job.workSetup}
                        </span>
                      </div>

                      {/* Salary */}
                      <div className="text-right">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {job.salary}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          {job.period}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SECTION 2: RECENT JOBS (Matches image.png) */}
        <div className="space-y-3.5">
          
          {/* Header Row */}
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Recent Jobs
            </h2>
            <button
              onClick={() => onNavigate('jobs')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              See all
            </button>
          </div>

          {/* Category Filter Pills (Horizontal Scroll Row) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORY_TABS.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#404040] text-white shadow-xs'
                      : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Recent Jobs Vertical List */}
          <div className="space-y-3">
            {filteredRecent.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80">
                <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No Recent Job Vacancies</p>
                <p className="text-[11px] text-slate-400 mt-1">No employers have posted job openings yet. Check back once local businesses in Roxas register.</p>
              </div>
            ) : (
              filteredRecent.map((job) => {
                const isBookmarked = bookmarkedIds.includes(job.id);
                const match = getJobMatchScore(job.id);
                return (
                  <div
                    key={job.id}
                    onClick={() => setViewingJob(job)}
                    className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer relative group space-y-3"
                  >
                    {/* Decision Tree Match Badge Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-black shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{match.score}% Match</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                        {match.label}
                      </span>
                    </div>

                    {/* Top Row: Logo, Title & Bookmark */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Squircle Logo with Initial */}
                        <div className={`relative w-12 h-12 rounded-2xl ${job.logoBg} flex items-center justify-center font-serif font-black text-2xl shadow-xs shrink-0 overflow-hidden`}>
                          {job.logoUrl ? (
                            <img src={job.logoUrl} alt={job.companyName} className="w-full h-full object-cover" />
                          ) : (
                            job.logoLetter
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            <span className="text-xs text-slate-500 font-medium">{job.companyName}</span>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-blue-600 stroke-[2.5]" />
                              <span>PESO-Verified</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bookmark Ribbon */}
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(job.id, job.title, e)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
                        aria-label="Bookmark job"
                      >
                        <Bookmark 
                          className={`w-5 h-5 transition-all ${
                            isBookmarked 
                              ? 'fill-slate-800 text-slate-800 scale-105' 
                              : 'text-slate-400 hover:text-slate-700'
                          }`} 
                        />
                      </button>
                    </div>

                    {/* Tags Row */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-slate-100/90 text-slate-600 text-[11px] font-semibold px-2.5 py-1 rounded-xl"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Bottom Row: Experience Level, Work Setup & Salary */}
                    <div className="pt-2.5 flex items-center justify-between border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100/90 text-slate-600 text-[11px] font-medium">
                          {job.experienceLevel}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                          • {job.workSetup}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {job.salary}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          {job.period}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* FILTER DRAWER / MODAL */}
      {isFilterModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFilterModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-slate-900" />
                <h3 className="font-black text-slate-900 text-base">Filter Vacancies</h3>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Work Setup Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Work Setup
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['all', 'Remote', 'On-site', 'Hybrid'] as const).map((setup) => (
                  <button
                    key={setup}
                    onClick={() => setFilterWorkSetup(setup)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      filterWorkSetup === setup
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {setup === 'all' ? 'All' : setup}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Type Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Employment Type
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['all', 'Full-Time', 'Part-Time', 'Contract'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterJobType(type)}
                    className={`py-2 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer ${
                      filterJobType === type
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type === 'all' ? 'All' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  setFilterWorkSetup('all');
                  setFilterJobType('all');
                  setIsFilterModalOpen(false);
                }}
                className="w-1/2 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="w-1/2 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md hover:bg-slate-800"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION DRAWER / MODAL */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        onNavigate={onNavigate}
      />

      {/* ADVANCED JOB FILTER MODAL */}
      <JobFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filterState}
        onApplyFilters={(newFilters) => {
          setFilterState(newFilters);
          if (newFilters.workModel !== 'All') {
            setFilterWorkSetup(newFilters.workModel as any);
          }
        }}
        onResetFilters={() => {
          setFilterWorkSetup('all');
          setFilterJobType('all');
        }}
      />

    </div>
  );
};
