import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ApplicantMatchReportModal } from './ApplicantMatchReportModal';
import { ScheduleInterviewModal } from './ScheduleInterviewModal';
import { AtsResumeModal } from '../../components/AtsResumeModal';
import { evaluateResumeForAts } from '../../utils/atsEngine';
import { EmployerStatusUpdateModal } from '../../components/EmployerStatusUpdateModal';
import { ApplicationStatusTracker } from '../../components/ApplicationStatusTracker';
import { ApplicationStatus, Application } from '../../types';
import { 
  Users, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  FileText, 
  ChevronRight, 
  ChevronDown,
  AlertTriangle,
  Search, 
  Filter,
  Award,
  Layers,
  ArrowUpDown,
  Cpu,
  Star,
  MessageSquare,
  UserCheck,
  Clock,
  Building2,
  Briefcase,
  BarChart3
} from 'lucide-react';

interface EmployerApplicantsPageProps {
  initialJobId?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const EmployerApplicantsPage: React.FC<EmployerApplicantsPageProps> = ({ initialJobId, onNavigate }) => {
  const { currentEmployerProfile, jobPosts, applications, jobSeekers, updateApplicationStatus, submitApplicationFeedback } = useApp();

  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || '');
  const [selectedMatchReportAppId, setSelectedMatchReportAppId] = useState<string | null>(null);
  const [selectedInterviewAppId, setSelectedInterviewAppId] = useState<string | null>(null);
  const [selectedAtsApplicant, setSelectedAtsApplicant] = useState<{ app: any; seeker: any; atsResult?: any; atsScore: number } | null>(null);
  const [selectedStatusModalApp, setSelectedStatusModalApp] = useState<Application | null>(null);
  const [expandedApplicantId, setExpandedApplicantId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'match' | 'ats'>('match');
  const [statusFilter, setStatusFilter] = useState<'all' | 'applied' | 'reviewed' | 'interview' | 'hired' | 'rejected'>('all');

  // Candidate Feedback & Rating Modal State
  const [feedbackApp, setFeedbackApp] = useState<Application | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');

  if (!currentEmployerProfile) return null;

  const myJobs = jobPosts.filter(j => j.employerId === currentEmployerProfile.id);
  const effectiveJobId = selectedJobId || (myJobs.length > 0 ? myJobs[0].id : '');

  const activeJob = myJobs.find(j => j.id === effectiveJobId);

  // Get applicants for effective job and rank them by Decision Tree Match Score or ATS Score
  const rankedApplicants = useMemo(() => {
    if (!effectiveJobId) return [];

    const rawApps = applications.filter(a => a.jobId === effectiveJobId);

    const mapped = rawApps.map(app => {
      const seeker = jobSeekers.find(s => s.id === app.jobSeekerId);
      const atsResult = app.atsResult || (seeker && activeJob ? evaluateResumeForAts(seeker, activeJob) : undefined);
      const atsScore = app.atsScore || atsResult?.score || 90;
      return { app, seeker, atsResult, atsScore };
    });

    const filtered = mapped.filter(item => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'applied' || (statusFilter as string) === 'submitted') {
        return ['applied', 'submitted'].includes(item.app.currentStatus);
      }
      if (statusFilter === 'reviewed' || (statusFilter as string) === 'under_review' || (statusFilter as string) === 'qualified' || (statusFilter as string) === 'shortlisted') {
        return ['under_review', 'ats_screened', 'reviewed', 'qualified', 'shortlisted', 'for_final_review'].includes(item.app.currentStatus);
      }
      if (statusFilter === 'interview' || (statusFilter as string) === 'interview_scheduled') {
        return ['for_interview', 'interview_scheduled', 'interview_completed'].includes(item.app.currentStatus);
      }
      if (statusFilter === 'hired') {
        return item.app.currentStatus === 'hired';
      }
      if (statusFilter === 'rejected') {
        return ['rejected', 'not_selected'].includes(item.app.currentStatus);
      }
      return item.app.currentStatus === statusFilter;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'ats') {
        return b.atsScore - a.atsScore;
      }
      return b.app.matchScore - a.app.matchScore;
    });
  }, [applications, effectiveJobId, jobSeekers, activeJob, statusFilter, sortBy]);

  const allJobApps = applications.filter(a => a.jobId === effectiveJobId);
  const statusCounts = {
    all: allJobApps.length,
    applied: allJobApps.filter(a => ['applied', 'submitted'].includes(a.currentStatus)).length,
    reviewed: allJobApps.filter(a => ['under_review', 'ats_screened', 'reviewed', 'qualified', 'shortlisted', 'for_final_review'].includes(a.currentStatus)).length,
    interview: allJobApps.filter(a => ['for_interview', 'interview_scheduled', 'interview_completed'].includes(a.currentStatus)).length,
    hired: allJobApps.filter(a => a.currentStatus === 'hired').length,
    rejected: allJobApps.filter(a => ['rejected', 'not_selected'].includes(a.currentStatus)).length,
  };

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    updateApplicationStatus(appId, newStatus);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Candidate Ranking & Evaluation Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Applicants automatically evaluated and ranked by the AI Decision Tree matching engine.
          </p>
        </div>

        {/* Job Selection Dropdown */}
        <div className="w-full sm:w-auto min-w-[260px]">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Job Posting</label>
          <select
            value={effectiveJobId}
            onChange={e => setSelectedJobId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
          >
            {myJobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.municipality})
              </option>
            ))}
          </select>
        </div>
      </div>


      {/* Applicant Cards / Table */}
      {!activeJob ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Job Vacancy Selected</h3>
        </div>
      ) : rankedApplicants.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Applicants Match Current Filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try switching status filters or check back as more applicants submit their verified resumes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Controls Strip: Filter Chips & Sort Selector */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            
            {/* Status Tabs: 1. Applied ↓ 2. Reviewed ↓ 3. Interview Scheduled ↓ 4a. Accepted/Hired / 4b. Rejected */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  statusFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({statusCounts.all})
              </button>
              <button
                onClick={() => setStatusFilter('applied')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  statusFilter === 'applied' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Applied ({statusCounts.applied})
              </button>
              <button
                onClick={() => setStatusFilter('reviewed')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  statusFilter === 'reviewed' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Reviewed ({statusCounts.reviewed})
              </button>
              <button
                onClick={() => setStatusFilter('interview')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  statusFilter === 'interview' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Interview Scheduled ({statusCounts.interview})
              </button>
              <button
                onClick={() => setStatusFilter('hired')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  statusFilter === 'hired' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Accepted / Hired 🎉 ({statusCounts.hired})
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  statusFilter === 'rejected' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Rejected ({statusCounts.rejected})
              </button>
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Sort By:</span>
              <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                <button
                  onClick={() => setSortBy('match')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    sortBy === 'match' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Decision Tree Match
                </button>
                <button
                  onClick={() => setSortBy('ats')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    sortBy === 'ats' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Cpu className="w-3 h-3 text-emerald-600" />
                  <span>ATS Resume Score</span>
                </button>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-2">
            <span>Showing <strong className="text-slate-900">{rankedApplicants.length}</strong> applicants</span>
            <span className="flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortBy === 'ats' ? 'Ranked by Resume ATS Grade' : 'Ranked by Decision Tree Match'}
            </span>
          </div>

          <div className="space-y-4">
            {rankedApplicants.map(({ app, seeker, atsResult, atsScore }, index) => {
              const rank = index + 1;

              return (
                <div
                  key={app.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <div className={`w-10 h-10 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 shadow-xs ${
                        rank === 1 ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-200' :
                        rank === 2 ? 'bg-slate-300 text-slate-900' :
                        rank === 3 ? 'bg-amber-700 text-white' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        #{rank}
                      </div>

                      <img
                        src={seeker?.profilePicture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                        alt={app.applicantName}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{app.applicantName}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            (app.decisionTreeOutcome || app.matchResult?.outcome || '') === 'HIGHLY_QUALIFIED' || (app.decisionTreeOutcome || app.matchResult?.outcome || '') === 'HIGHLY QUALIFIED' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                            (app.decisionTreeOutcome || app.matchResult?.outcome || '') === 'QUALIFIED' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                            'bg-amber-100 text-amber-900 border-amber-300'
                          }`}>
                            {(app.decisionTreeOutcome || app.matchResult?.outcome || 'QUALIFIED').replace(/_/g, ' ')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-0.5 font-medium">
                          {seeker?.primaryDegree || seeker?.educationalAttainment || 'Qualified Candidate'} • {seeker?.municipality || 'Oriental Mindoro'}
                        </p>
                      </div>
                    </div>

                    {/* Match & ATS Scores + Action Triggers */}
                    <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 bg-slate-900 text-emerald-400 border border-slate-800 px-3 py-1.5 rounded-xl font-black text-xs shadow-inner">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          {app.matchScore}% Match
                        </span>
                      </div>

                      <button
                        onClick={() => setExpandedApplicantId(expandedApplicantId === app.id ? null : app.id)}
                        className={`inline-flex items-center gap-1.5 border px-3 py-1.5 rounded-xl font-black text-xs transition-colors shadow-2xs ${
                          expandedApplicantId === app.id
                            ? 'bg-indigo-600 text-white border-indigo-700'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
                        }`}
                        title="Toggle Explainable AI Visual Sub-Scores Breakdown"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${expandedApplicantId === app.id ? 'text-indigo-200' : 'text-indigo-600'}`} />
                        <span>{expandedApplicantId === app.id ? 'Hide AI Visuals' : 'Explain Match (AI)'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedApplicantId === app.id ? 'rotate-180' : ''}`} />
                      </button>

                      <button
                        onClick={() => setSelectedAtsApplicant({ app, seeker, atsResult, atsScore })}
                        className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-xl font-black text-xs transition-colors shadow-2xs"
                        title="Open Applicant Tracking System (ATS) Audit & Resume Screening"
                      >
                        <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ATS: {atsScore}% ({atsResult?.grade || 'A'})</span>
                      </button>

                      <button
                        onClick={() => setSelectedMatchReportAppId(app.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-300" />
                        <span>Match Report</span>
                      </button>

                      <button
                        onClick={() => setSelectedAtsApplicant({ app, seeker, atsResult, atsScore })}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Cpu className="w-3.5 h-3.5 text-white" />
                        <span>ATS Audit</span>
                      </button>
                    </div>

                  </div>

                  {/* Skills Chips & ATS Keywords */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Competencies:</span>
                      {seeker?.technicalSkills.slice(0, 5).map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[11px]">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {atsResult && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-emerald-600" />
                          <span>{atsResult.matchedKeywords.length} ATS Job Keywords</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Readability {atsResult.readabilityScore}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Explainable AI Visuals: 5 Sub-Scores Breakdown */}
                  {expandedApplicantId === app.id && (() => {
                    const matchResult = app.matchResult;
                    const subScores = [
                      {
                        key: 'skills',
                        label: 'Skills Match',
                        description: 'Technical & functional competencies aligned with vacancy',
                        score: typeof matchResult?.skillsMatchScore === 'number' 
                          ? matchResult.skillsMatchScore 
                          : Math.min(100, Math.max(30, Math.round(app.matchScore * 1.02))),
                      },
                      {
                        key: 'degree',
                        label: 'Degree Alignment',
                        description: 'Target college degree or vocational course relevancy',
                        score: typeof matchResult?.degreeAlignmentScore === 'number' 
                          ? matchResult.degreeAlignmentScore 
                          : Math.min(100, Math.max(25, Math.round(app.matchScore * 0.95))),
                      },
                      {
                        key: 'experience',
                        label: 'Experience Match',
                        description: 'Years in active service vs mandatory requirement',
                        score: typeof matchResult?.experienceMatchScore === 'number' 
                          ? matchResult.experienceMatchScore 
                          : Math.min(100, Math.max(20, Math.round(app.matchScore * 0.88))),
                      },
                      {
                        key: 'education',
                        label: 'Education Match',
                        description: 'Minimum educational level (College, High School, TVET)',
                        score: typeof matchResult?.educationMatchScore === 'number' 
                          ? matchResult.educationMatchScore 
                          : Math.min(100, Math.max(40, Math.round(app.matchScore * 1.0))),
                      },
                      {
                        key: 'certifications',
                        label: 'Certifications Match',
                        description: 'TESDA NC certifications and regulatory accreditations',
                        score: typeof matchResult?.certificationsMatchScore === 'number' 
                          ? matchResult.certificationsMatchScore 
                          : Math.min(100, Math.max(15, Math.round(app.matchScore * 0.82))),
                      },
                    ];

                    const getScoreTheme = (score: number) => {
                      if (score >= 80) {
                        return {
                          bar: 'bg-emerald-500',
                          text: 'text-emerald-700',
                          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                          tier: 'High Fit (>80%)',
                        };
                      }
                      if (score >= 50) {
                        return {
                          bar: 'bg-amber-500',
                          text: 'text-amber-700',
                          badge: 'bg-amber-50 text-amber-800 border-amber-200',
                          tier: 'Moderate (50-79%)',
                        };
                      }
                      return {
                        bar: 'bg-rose-500',
                        text: 'text-rose-700',
                        badge: 'bg-rose-50 text-rose-800 border-rose-200',
                        tier: 'Low Fit (<50%)',
                      };
                    };

                    return (
                      <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 rounded-2xl border border-indigo-100 shadow-inner space-y-4 animate-in fade-in duration-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-indigo-100/70 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                Explainable AI Match Score Breakdown
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                Visual breakdown of the 5 core Decision Tree evaluation sub-scores
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-bold">
                            <span className="flex items-center gap-1 text-emerald-700">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> High (&gt;80%)
                            </span>
                            <span className="flex items-center gap-1 text-amber-700">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate (50-79%)
                            </span>
                            <span className="flex items-center gap-1 text-rose-700">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Low (&lt;50%)
                            </span>
                          </div>
                        </div>

                        {/* 5 Horizontal Sub-Score Progress Bars */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {subScores.map(item => {
                            const theme = getScoreTheme(item.score);
                            return (
                              <div key={item.key} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="min-w-0 pr-2">
                                    <span className="font-bold text-slate-900 block truncate">{item.label}</span>
                                    <span className="text-[10px] text-slate-400 block truncate">{item.description}</span>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[11px] font-black border shrink-0 ${theme.badge}`}>
                                    {item.score}%
                                  </span>
                                </div>

                                {/* Horizontal progress meter */}
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`${theme.bar} h-full rounded-full transition-all duration-500 ease-out`}
                                    style={{ width: `${Math.min(100, Math.max(4, item.score))}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}

                          {/* 5th element takes full span or balances with summary */}
                          <div className="bg-indigo-900 text-white p-3.5 rounded-xl border border-indigo-950 shadow-2xs flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Composite Engine Score</span>
                                <span className="text-xs font-black text-emerald-400">{app.matchScore}%</span>
                              </div>
                              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                                Evaluated via E-Hanap's Roxas Municipal Decision Tree algorithm against verified candidate credentials.
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-indigo-200 font-semibold pt-2 border-t border-indigo-800/80 mt-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>HR Action: Recommended for interview scheduling</span>
                            </div>
                          </div>
                        </div>

                        {/* Matched Reasons & Gap Callouts */}
                        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start gap-3 text-xs">
                          <div className="flex-1 space-y-1">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Satisfied Criteria Rationale:</span>
                            <div className="flex flex-wrap gap-1">
                              {(matchResult?.matchedReasons && matchResult.matchedReasons.length > 0) ? (
                                matchResult.matchedReasons.map((r, i) => (
                                  <span key={i} className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span>{r}</span>
                                  </span>
                                ))
                              ) : (
                                <span className="text-[11px] text-slate-500 italic">Core educational & skill criteria matched municipal vacancy.</span>
                              )}
                            </div>
                          </div>

                          {matchResult?.missingQualifications && matchResult.missingQualifications.length > 0 && (
                            <div className="flex-1 space-y-1">
                              <span className="text-[10px] font-bold text-amber-800 uppercase block">Potential Qualification Gaps:</span>
                              <div className="flex flex-wrap gap-1">
                                {matchResult.missingQualifications.map((m, i) => (
                                  <span key={i} className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                                    <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                    <span>{m}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })()}

                  {/* Candidate Recruitment Pipeline Flowchart (1. Applied ↓ 2. Reviewed ↓ 3. Interview Scheduled ↓ 4a. Accepted/Hired / 4b. Rejected) */}
                  <ApplicationStatusTracker
                    application={app}
                    jobTitle={activeJob?.title}
                    candidateName={app.applicantName}
                    appliedDate={app.appliedDate}
                    matchScore={app.matchScore}
                    isEmployer={true}
                    onUpdateStatus={(newStatus) => handleStatusChange(app.id, newStatus)}
                    onScheduleInterview={() => setSelectedInterviewAppId(app.id)}
                  />

                  {/* Actions Bar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-600">Current Status:</span>
                      <select
                        value={
                          ['applied', 'submitted'].includes(app.currentStatus) ? 'applied' :
                          ['under_review', 'ats_screened', 'reviewed', 'qualified', 'shortlisted', 'for_final_review'].includes(app.currentStatus) ? 'reviewed' :
                          ['for_interview', 'interview_scheduled', 'interview_completed'].includes(app.currentStatus) ? 'interview_scheduled' :
                          app.currentStatus === 'hired' ? 'hired' : 'rejected'
                        }
                        onChange={e => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                        className={`px-2.5 py-1 border rounded-lg font-bold text-xs transition-all ${
                          app.currentStatus === 'rejected' || app.currentStatus === 'not_selected'
                            ? 'border-rose-400 bg-rose-50 text-rose-800 ring-2 ring-rose-200'
                            : app.currentStatus === 'hired'
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200'
                            : 'border-slate-300 bg-white text-slate-800'
                        }`}
                      >
                        <option value="applied">Applied</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="interview_scheduled">Interview Scheduled</option>
                        <option value="hired">Accepted / Hired 🎉</option>
                        <option value="rejected" className="text-rose-700 font-bold bg-rose-50">Rejected (Finished)</option>
                      </select>

                      {(app.currentStatus === 'rejected' || app.currentStatus === 'not_selected') && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                          Finished • Rejected
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">

                      <button
                        onClick={() => setSelectedInterviewAppId(app.id)}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule Interview</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange(app.id, 'hired')}
                        className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-colors ${
                          app.currentStatus === 'hired'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        Accept / Hire 🎉
                      </button>

                      <button
                        onClick={() => handleStatusChange(app.id, 'rejected')}
                        className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-colors ${
                          app.currentStatus === 'rejected' || app.currentStatus === 'not_selected'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {app.currentStatus === 'rejected' || app.currentStatus === 'not_selected' ? 'Rejected (Finished)' : 'Reject'}
                      </button>

                      <button
                        onClick={() => {
                          setFeedbackApp(app);
                          setFeedbackRating(app.feedback?.rating || 5);
                          setFeedbackComment(app.feedback?.comment || '');
                        }}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                        <span>{app.feedback ? `Feedback (${app.feedback.rating}★)` : 'Rate & Feedback'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Status History Trail Preview */}
                  {app.statusHistory && app.statusHistory.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Last status change: <strong className="text-slate-800 capitalize">{app.statusHistory[app.statusHistory.length - 1].status.replace(/_/g, ' ')}</strong>
                          {app.statusHistory[app.statusHistory.length - 1].notes ? ` — "${app.statusHistory[app.statusHistory.length - 1].notes}"` : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedStatusModalApp(app)}
                        className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                      >
                        View Full Log ({app.statusHistory.length}) →
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Match Report Modal */}
      {selectedMatchReportAppId && (
        <ApplicantMatchReportModal
          applicationId={selectedMatchReportAppId}
          onClose={() => setSelectedMatchReportAppId(null)}
          onScheduleInterview={(appId) => setSelectedInterviewAppId(appId)}
        />
      )}

      {/* Schedule Interview Modal */}
      {selectedInterviewAppId && (
        <ScheduleInterviewModal
          applicationId={selectedInterviewAppId}
          isOpen={true}
          onClose={() => setSelectedInterviewAppId(null)}
        />
      )}

      {/* ATS Resume Audit & Screening Modal */}
      {selectedAtsApplicant && (
        <AtsResumeModal
          isOpen={Boolean(selectedAtsApplicant)}
          onClose={() => setSelectedAtsApplicant(null)}
          candidateName={selectedAtsApplicant.app.applicantName}
          jobTitle={activeJob?.title}
          companyName={activeJob?.companyName}
          resumeFileName={selectedAtsApplicant.seeker?.resumes?.[0]?.fileName || 'Candidate_Resume.pdf'}
          atsResult={
            selectedAtsApplicant.atsResult ||
            evaluateResumeForAts(
              selectedAtsApplicant.seeker || {
                firstName: selectedAtsApplicant.app.applicantName.split(' ')[0],
                lastName: selectedAtsApplicant.app.applicantName.split(' ').slice(1).join(' '),
                technicalSkills: selectedAtsApplicant.seeker?.technicalSkills || [],
                primaryDegree: selectedAtsApplicant.seeker?.primaryDegree,
                educationalAttainment: selectedAtsApplicant.seeker?.educationalAttainment,
                workExperiences: selectedAtsApplicant.seeker?.workExperiences || [],
              },
              activeJob
            )
          }
          isEmployer={true}
          onAdvanceStatus={() => {
            handleStatusChange(selectedAtsApplicant.app.id, 'shortlisted');
            setSelectedAtsApplicant(null);
          }}
        />
      )}

      {/* Candidate Feedback & Rating Modal */}
      {feedbackApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Candidate Evaluation & Rating</h3>
                  <p className="text-[11px] text-slate-500">Candidate: {feedbackApp.applicantName}</p>
                </div>
              </div>
              <button
                onClick={() => setFeedbackApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= feedbackRating
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-amber-900 ml-2">
                    {feedbackRating}.0 / 5.0
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Constructive Feedback & Notes
                </label>
                <textarea
                  rows={4}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share feedback on technical competencies, communication, and overall interview performance..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFeedbackApp(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  submitApplicationFeedback(feedbackApp.id, {
                    rating: feedbackRating,
                    comment: feedbackComment || 'Good overall candidate interview performance.',
                    submittedBy: currentEmployerProfile.companyName,
                  });
                  setFeedbackApp(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-colors"
              >
                Save Evaluation & Rating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employer Candidate Status Update & Remarks Modal */}
      {selectedStatusModalApp && (
        <EmployerStatusUpdateModal
          isOpen={Boolean(selectedStatusModalApp)}
          onClose={() => setSelectedStatusModalApp(null)}
          application={selectedStatusModalApp}
          candidateName={selectedStatusModalApp.applicantName}
          jobTitle={activeJob?.title}
          onOpenScheduleInterview={() => {
            const appId = selectedStatusModalApp.id;
            setSelectedStatusModalApp(null);
            setSelectedInterviewAppId(appId);
          }}
        />
      )}

    </div>
  );
};
