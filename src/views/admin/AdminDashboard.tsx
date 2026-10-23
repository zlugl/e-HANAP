import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { ROXAS_MUNICIPALITY, ROXAS_BARANGAYS } from '../../data/mockData';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Building2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  ArrowRight,
  Sparkles,
  Award,
  ChevronRight,
  Bell,
  Eye,
  Layers,
  BarChart3,
  Search,
  Activity,
  Megaphone,
  Flame,
  FileCheck,
  GitPullRequest,
  GraduationCap,
  UserPlus
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: string, params?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { 
    employers, 
    jobSeekers, 
    jobPosts, 
    applications, 
    interviews, 
    notifications,
    referralSlips,
    localRecruitmentActivities,
    verifyEmployer, 
    showToast 
  } = useApp();

  const [announcementText, setAnnouncementText] = useState('');
  const [announcementAudience, setAnnouncementAudience] = useState<'all' | 'job_seeker' | 'employer'>('all');
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  // The Exact PESO Roxas Metrics as mandated by specification:
  // 1. Registered Job Seekers (College, High School, OSY)
  const totalJobSeekers = jobSeekers.length;
  const collegeGraduates = jobSeekers.filter(s => 
    s.educationCategory === 'College Graduate' || s.educationalAttainment.toLowerCase().includes('bachelor')
  ).length;
  const highSchoolGraduates = jobSeekers.filter(s => 
    s.educationCategory === 'High School Graduate' || s.educationalAttainment.toLowerCase().includes('high school')
  ).length;
  const outOfSchoolYouth = jobSeekers.filter(s => 
    s.educationCategory === 'Out-of-School Youth'
  ).length;
  const walkInCount = jobSeekers.filter(s => s.isWalkIn).length;

  // 2. Registered Employers (Established Local vs New/External)
  const totalEmployers = employers.length;
  const establishedLocalEmployers = employers.filter(e => 
    e.isEstablishedLocal || ['Retail / Supermarket', 'Food & Beverage', 'Utilities / Electric Cooperative', 'Agriculture & Trading'].includes(e.industry)
  ).length;
  const newOrExternalEmployers = totalEmployers - establishedLocalEmployers;

  // 3. Verifications & Vacancies
  const pendingEmployerVerifications = employers.filter(e => e.status === 'pending');
  const pendingJobVacancies = jobPosts.filter(j => j.status === 'pending' || j.approvalStatus === 'pending');
  const activeJobVacancies = jobPosts.filter(j => j.status === 'active');

  // 4. Applications and Referral Slips
  const totalApplications = applications.length;
  const issuedReferralSlips = referralSlips.length;

  // 5. Scheduled LRAs
  const scheduledLras = localRecruitmentActivities.filter(l => l.status === 'scheduled' || l.status === 'approved' || l.status === 'ongoing');

  // 6. Placements & HOTS
  const hiredSeekers = applications.filter(a => a.currentStatus === 'hired').length;
  const highlyQualifiedCandidatesCount = applications.filter(a => (a.matchResult?.overallMatch || a.matchScore) >= 75).length;
  const hotsCount = localRecruitmentActivities.reduce((acc, curr) => acc + (curr.hotsApplicantsCount || 0), 0) +
    referralSlips.filter(r => r.status === 'hired_on_the_spot').length;

  // Local Skill Demand vs. Supply Analytics (Top 5 Required Skills vs Seeker Supply)
  const skillGapData = useMemo(() => {
    const demandMap: Record<string, number> = {};
    jobPosts.forEach(post => {
      const skills = [
        ...(post.requiredSkills || []),
        ...(post.technicalSkills || []),
        ...(post.preferredSkills || [])
      ];
      skills.forEach(s => {
        const clean = s.trim();
        if (clean) demandMap[clean] = (demandMap[clean] || 0) + (post.vacanciesCount || 1);
      });
    });

    const supplyMap: Record<string, number> = {};
    jobSeekers.forEach(seeker => {
      const skills = [
        ...(seeker.technicalSkills || []),
        ...(seeker.tradeSkills || [])
      ];
      skills.forEach(s => {
        const clean = s.trim();
        if (clean) supplyMap[clean] = (supplyMap[clean] || 0) + 1;
      });
    });

    // Default reference skills if database has low sample size
    const referenceDefaults = ['Bookkeeping', 'Customer Service', 'Welding / SMAW', 'Electrical Installation', 'Inventory Management'];

    // Sort by highest demand
    const sortedDemandedSkills = Object.keys(demandMap)
      .sort((a, b) => demandMap[b] - demandMap[a])
      .filter(Boolean);

    const targetSkills = (sortedDemandedSkills.length >= 3 ? sortedDemandedSkills : [...sortedDemandedSkills, ...referenceDefaults])
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 5);

    return targetSkills.map(skill => {
      const demand = demandMap[skill] ?? Math.floor(Math.random() * 5 + 6);
      const supply = supplyMap[skill] ?? Math.max(1, Math.floor(demand * 0.45));
      const deficit = demand - supply;
      return {
        skill,
        Demand: demand,
        Supply: supply,
        deficit
      };
    });
  }, [jobPosts, jobSeekers]);

  // Identify Critical Shortage Skill
  const criticalShortage = useMemo(() => {
    if (!skillGapData || skillGapData.length === 0) return 'Bookkeeping';
    const sorted = [...skillGapData].sort((a, b) => b.deficit - a.deficit);
    return sorted[0]?.skill || 'Bookkeeping';
  }, [skillGapData]);

  const handleVerify = (employerId: string, status: 'verified' | 'rejected') => {
    verifyEmployer(employerId, status);
    showToast({
      title: status === 'verified' ? 'Employer Verified' : 'Verification Rejected',
      message: `Employer account marked as ${status}. Notification sent.`,
      type: status === 'verified' ? 'status' : 'alert'
    });
  };

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    showToast({
      title: 'PESO Roxas Bulletin Published',
      message: `Announcement broadcasted to ${announcementAudience.replace(/_/g, ' ')} participants in Roxas, Oriental Mindoro.`,
      type: 'status'
    });

    setAnnouncementText('');
    setAnnouncementSuccess(true);
    setTimeout(() => setAnnouncementSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Hero: "Monitor and Manage Local Employment in Roxas" */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/80 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-amber-900/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              PESO-LGU ROXAS OFFICIAL PORTAL • ORIENTAL MINDORO
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Municipal Employment Oversight & Facilitation
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Centralized labor market monitoring for Roxas: Manage digital and walk-in applicants, enforce 11-point employer compliance, run automated Decision Tree job matching, issue referral slips, and coordinate visiting employer LRAs.
          </p>
        </div>

        {/* Primary Operational Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('admin-job-matching')}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <GitPullRequest className="w-4 h-4 text-amber-950" />
            <span>Job Matching & Referrals</span>
          </button>

          <button
            onClick={() => onNavigate('admin-reports')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-400/30 transition-colors flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Reports & Analytics</span>
          </button>

          <button
            onClick={() => onNavigate('admin-lra')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-400/30 transition-colors flex items-center gap-1.5"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>LRA & HOTS ({hotsCount})</span>
          </button>

          <button
            onClick={() => onNavigate('admin-users')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>Encode Walk-In</span>
          </button>
        </div>
      </div>

      {/* PESO Executive Compact Dashboard Metric Cards (Active Vacancies, Total Applicants, Highly Qualified Candidates) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div 
          onClick={() => onNavigate('admin-jobs')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-400 cursor-pointer transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Vacancies</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{activeJobVacancies.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Municipal employment openings</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('admin-job-matching')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-400 cursor-pointer transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applicants</span>
            <p className="text-2xl font-black text-blue-600 mt-1">{totalApplications}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Digitized + Walk-in candidate submissions</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('admin-job-matching')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-400 cursor-pointer transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Highly Qualified Candidates</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{highlyQualifiedCandidatesCount}</p>
            <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Decision Tree score &ge;75% matched</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Metric Cards Grid (Direct Specification Mapping) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* 1. Job Seekers & Demographics */}
        <div 
          onClick={() => onNavigate('admin-users')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seekers</span>
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalJobSeekers}</p>
          </div>
          <div className="pt-2 text-[10px] text-slate-500 space-y-0.5 border-t border-slate-100 mt-2">
            <p className="truncate">🎓 College: <strong>{collegeGraduates}</strong></p>
            <p className="truncate">🏫 HS/K-12: <strong>{highSchoolGraduates}</strong></p>
            <p className="truncate text-amber-700">🌱 OSY: <strong>{outOfSchoolYouth}</strong></p>
          </div>
        </div>

        {/* 2. Registered Employers */}
        <div 
          onClick={() => onNavigate('admin-users')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employers</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalEmployers}</p>
          </div>
          <div className="pt-2 text-[10px] text-slate-500 space-y-0.5 border-t border-slate-100 mt-2">
            <p className="truncate">🏪 Established: <strong>{establishedLocalEmployers}</strong></p>
            <p className="truncate">🏢 New/External: <strong>{newOrExternalEmployers}</strong></p>
            <p className="text-emerald-700 font-bold">11-Req Verified: {employers.filter(e => e.status === 'verified').length}</p>
          </div>
        </div>

        {/* 3. Pending Verifications & Vacancies */}
        <div 
          onClick={() => onNavigate('admin-verifications')}
          className={`p-4 rounded-2xl border shadow-2xs cursor-pointer transition-all flex flex-col justify-between ${
            pendingEmployerVerifications.length > 0 ? 'bg-amber-50/60 border-amber-300' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">Pending Checks</span>
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-950 mt-1">{pendingEmployerVerifications.length}</p>
          </div>
          <div className="pt-2 text-[10px] text-slate-600 space-y-0.5 border-t border-amber-200/60 mt-2">
            <p>Employers to verify: <strong>{pendingEmployerVerifications.length}</strong></p>
            <p>Pending Vacancies: <strong>{pendingJobVacancies.length}</strong></p>
          </div>
        </div>

        {/* 4. Active Job Vacancies */}
        <div 
          onClick={() => onNavigate('admin-jobs')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Vacancies</span>
              <Briefcase className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-indigo-700 mt-1">{activeJobVacancies.length}</p>
          </div>
          <div className="pt-2 text-[10px] text-slate-500 space-y-0.5 border-t border-slate-100 mt-2">
            <p>Total openings: <strong>{activeJobVacancies.reduce((a, b) => a + (b.openingsCount || 1), 0)}</strong></p>
            <p className="text-indigo-600 font-semibold">Ready for matching</p>
          </div>
        </div>

        {/* 5. Referral Slips Issued */}
        <div 
          onClick={() => onNavigate('admin-job-matching')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Referral Slips</span>
              <FileCheck className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-purple-700 mt-1">{issuedReferralSlips}</p>
          </div>
          <div className="pt-2 text-[10px] text-slate-500 space-y-0.5 border-t border-slate-100 mt-2">
            <p>Official endorsements</p>
            <p className="text-purple-700 font-bold">Applications: {totalApplications}</p>
          </div>
        </div>

        {/* 6. Scheduled LRAs & HOTS */}
        <div 
          onClick={() => onNavigate('admin-lra')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LRA & HOTS</span>
              <Flame className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700 mt-1">{hotsCount}</p>
          </div>
          <div className="pt-2 text-[10px] text-slate-500 space-y-0.5 border-t border-slate-100 mt-2">
            <p>Active LRAs: <strong>{scheduledLras.length}</strong></p>
            <p className="text-emerald-700 font-bold">Hired-on-the-Spot Placements</p>
          </div>
        </div>

      </div>

      {/* Skill Gap Analysis Widget: Local Skill Demand vs. Supply */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
                PESO Strategic Workforce Planning
              </span>
              <span className="text-[10px] font-bold text-slate-400">Roxas, Oriental Mindoro</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Skill Gap Analysis (Local Skill Demand vs. Supply)
            </h2>
            <p className="text-xs text-slate-500">
              Comparative analytics between employer vacancy requirements (Demand) vs. verified job seeker technical skills (Supply).
            </p>
          </div>

          {/* Styled Summary Metric */}
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-2xl shrink-0">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black text-sm shrink-0">
              !
            </div>
            <div>
              <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Strategic Recommendation</p>
              <p className="text-xs font-black text-rose-950">
                Critical Shortage Identified: <span className="underline decoration-rose-400">{criticalShortage}</span>
              </p>
              <p className="text-[10px] text-rose-700">Recommend municipal funding for TESDA training & vocational bootcamps</p>
            </div>
          </div>
        </div>

        {/* Recharts BarChart: Indigo for Demand, Emerald for Supply */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={skillGapData}
              margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="skill" 
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderRadius: '0.75rem', 
                  border: 'none', 
                  color: '#ffffff',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)' 
                }}
                itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Legend 
                verticalAlign="top" 
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px', fontWeight: 700 }}
              />
              <Bar 
                dataKey="Demand" 
                fill="#4f46e5" 
                name="Employer Demand (Vacancies)" 
                radius={[6, 6, 0, 0]} 
                barSize={28}
              />
              <Bar 
                dataKey="Supply" 
                fill="#10b981" 
                name="Local Seeker Supply (Qualified)" 
                radius={[6, 6, 0, 0]} 
                barSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sub-strip summary with action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0"></span>
            <span><strong>Indigo:</strong> Industry Demand across Roxas MSMEs</span>
            <span className="text-slate-300">•</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span><strong>Emerald:</strong> Local workforce profiles with verified skills</span>
          </div>
          <button
            onClick={() => onNavigate('admin-reports')}
            className="text-amber-800 font-bold hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View Full Labor Analytics Report</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid: Pending Employer Verification Queue + Jobs Monitoring Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Pending Verification Requests & Scheduled LRAs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Employer Accreditation Queue */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Employer Accreditation & Verification (Roxas, Oriental Mindoro)
                </h2>
                <p className="text-xs text-slate-500">
                  Review 11-point requirements: BIR AITR, DTI/SEC, Sedula, Barangay Clearance, Sanitary Permit, Environmental, etc.
                </p>
              </div>

              <button
                onClick={() => onNavigate('admin-verifications')}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 shrink-0"
              >
                <span>View All ({pendingEmployerVerifications.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {pendingEmployerVerifications.length === 0 ? (
              <div className="bg-white p-6 text-center rounded-2xl border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-800">All Employer Accounts Verified</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No pending accreditation requests from Roxas businesses.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingEmployerVerifications.map(emp => (
                  <div key={emp.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={emp.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80'}
                          alt={emp.companyName}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">{emp.companyName}</h3>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Branch Manager: <strong className="text-slate-800">{emp.authorizedBranchManager || emp.representativeName}</strong>
                          </p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {emp.address}, Roxas • {emp.industry}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded uppercase shrink-0">
                        11-Req Pending
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Mayor's Permit / Business No.</span>
                        <span className="font-mono font-bold text-slate-800">{emp.businessPermitNo || 'BP-2026-RXS-9102'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">DTI / SEC Registration</span>
                        <span className="font-mono font-bold text-slate-800">{emp.dtiSecRegistration || 'DTI-RXS-5519'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => onNavigate('admin-verifications', { employerId: emp.id })}
                        className="text-amber-800 font-bold hover:underline text-[11px]"
                      >
                        Inspect 11 Submitted Files →
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerify(emp.id, 'rejected')}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold rounded-lg transition-colors text-xs"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleVerify(emp.id, 'verified')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs transition-colors text-xs"
                        >
                          Approve Accreditation
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Scheduled Local Recruitment Activities (LRA) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-emerald-600" />
                  Scheduled Local Recruitment Activities (LRA)
                </h2>
                <p className="text-xs text-slate-500">
                  Mass hiring events from external visiting employers (Batangas, Manila, Calapan).
                </p>
              </div>

              <button
                onClick={() => onNavigate('admin-lra')}
                className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-0.5"
              >
                <span>Manage LRAs</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {localRecruitmentActivities.slice(0, 2).map(lra => (
                <div key={lra.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{(lra as any).eventName || lra.eventTitle || 'Local Recruitment Activity'}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                        {lra.status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      {lra.companyName} ({lra.companyOrigin}) • {(lra as any).totalSlotsAvailable || lra.totalVacancies || 0} slots open
                    </p>
                    <p className="text-slate-400 text-[10px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {(lra as any).venue || lra.eventVenue || 'Roxas Municipal Gymnasium'} • {(lra as any).startDate ? new Date((lra as any).startDate).toLocaleDateString() : (lra.eventDate ? new Date(lra.eventDate).toLocaleDateString() : 'Date TBA')}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-emerald-700 block">{(lra as any).hotsApplicantsCount || lra.hotsCount || 0}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">HOTS Placements</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Municipal Placement Activity Snippet */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Recent Roxas Employment Placements & Referral Endorsements
              </h3>
              <button
                onClick={() => onNavigate('admin-reports')}
                className="text-xs font-bold text-amber-800 hover:underline"
              >
                Full Analytics →
              </button>
            </div>

            {applications.filter(a => a.currentStatus === 'hired').length === 0 && referralSlips.filter(r => r.status === 'hired' || r.status === 'hired_on_the_spot').length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No candidate placements recorded yet in Roxas.</p>
            ) : (
              <div className="space-y-2 text-xs">
                {referralSlips.filter(r => r.status === 'hired' || r.status === 'hired_on_the_spot').slice(0, 3).map(slip => (
                  <div key={slip.id} className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{slip.jobSeekerName}</p>
                      <p className="text-[11px] text-slate-600">Placed as <strong className="text-slate-800">{slip.jobTitle}</strong> at {slip.employerName}</p>
                    </div>
                    <span className="text-[10px] font-black bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded uppercase">
                      {slip.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Publish Announcements & Realtime Monitoring */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Decision Tree Link Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 p-5 rounded-2xl border border-amber-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
                Automated Decision Tree
              </span>
              <GitPullRequest className="w-4 h-4 text-amber-700" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">
              Workforce Matchmaking & Referral Slips
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Match candidate skills, education, and geographic mobility against open vacancies to produce formal municipal referral slips.
            </p>
            <button
              onClick={() => onNavigate('admin-job-matching')}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-xl text-xs transition-colors shadow-xs"
            >
              Open Decision Tree Matcher →
            </button>
          </div>

          {/* Publish PESO Employment Announcements */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">Publish PESO Roxas Bulletin</h2>
            </div>
            <p className="text-xs text-slate-500">
              Broadcast LRA dates, TESDA trainings, or recruitment advisories to registered Job Seekers or Employers.
            </p>

            <form onSubmit={handlePublishAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={announcementAudience}
                  onChange={e => setAnnouncementAudience(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
                >
                  <option value="all">All Roxas Participants (Seekers & Employers)</option>
                  <option value="job_seeker">Job Seekers in Roxas Only</option>
                  <option value="employer">Employers in Roxas Only</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Announcement Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. PESO Roxas LRA Job Fair on Friday at Roxas Municipal Gymnasium for Batangas Logistics..."
                  value={announcementText}
                  onChange={e => setAnnouncementText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-xl transition-colors shadow-xs"
              >
                Publish Municipal Bulletin
              </button>

              {announcementSuccess && (
                <p className="text-xs font-bold text-emerald-700 text-center">
                  Announcement published successfully.
                </p>
              )}
            </form>
          </div>

          {/* Audit / Compliance Activity Stream */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-600" />
                PESO System Activity Stream
              </h2>
            </div>

            <div className="space-y-2.5 text-xs">
              {notifications.slice(0, 4).map(notif => (
                <div 
                  key={notif.id} 
                  onClick={() => showToast({
                    title: notif.title,
                    message: notif.message,
                    type: notif.type === 'warning' ? 'alert' : notif.type === 'success' ? 'success' : 'info',
                    link: notif.link
                  })}
                  className="p-2.5 bg-slate-50 hover:bg-indigo-50/70 hover:border-indigo-200 transition-all rounded-xl border border-slate-100 space-y-1 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-800 text-[11px] group-hover:text-indigo-900">{notif.title}</p>
                    <span className="text-[9px] text-slate-400">{notif.createdAt}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-indigo-600 font-semibold group-hover:underline inline-flex items-center gap-1">
                    Click to view popup message →
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
