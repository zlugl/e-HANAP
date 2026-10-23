import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApplicantMatchReportModal } from './ApplicantMatchReportModal';
import { ScheduleInterviewModal } from './ScheduleInterviewModal';
import { EmployerStatusUpdateModal } from '../../components/EmployerStatusUpdateModal';
import { ApplicationStatus, Application } from '../../types';
import { 
  Building2, 
  Briefcase, 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  Plus, 
  Calendar, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ArrowRight, 
  UserPlus, 
  TrendingUp, 
  MapPin, 
  Check,
  BarChart3
} from 'lucide-react';

interface EmployerDashboardProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenPostJobModal: () => void;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ onNavigate, onOpenPostJobModal }) => {
  const { currentEmployerProfile, jobPosts, applications, interviews, jobSeekers, updateApplicationStatus, updateJobVacancyStatus, showToast } = useApp();

  const [selectedMatchReportAppId, setSelectedMatchReportAppId] = useState<string | null>(null);
  const [selectedInterviewAppId, setSelectedInterviewAppId] = useState<string | null>(null);
  const [selectedStatusUpdateApp, setSelectedStatusUpdateApp] = useState<Application | null>(null);

  if (!currentEmployerProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md">
          <Building2 className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">Employer Account Required</h2>
          <p className="text-xs text-slate-500 mt-1">Please log in with an Employer account to manage your company vacancies and candidates.</p>
        </div>
      </div>
    );
  }

  const myJobs = jobPosts.filter(j => j.employerId === currentEmployerProfile.id);
  const myJobIds = myJobs.map(j => j.id);
  const myApps = applications.filter(a => myJobIds.includes(a.jobId));
  const myInterviews = interviews.filter(i => i.employerId === currentEmployerProfile.id);

  const activeJobs = myJobs.filter(j => j.status === 'active');
  const totalApplicantsCount = myApps.length;
  const qualifiedCandidatesCount = myApps.filter(a => (a.matchResult?.overallMatch || a.matchScore) >= 75).length;
  const shortlistedCandidates = myApps.filter(a => a.currentStatus === 'shortlisted');
  const upcomingInterviews = myInterviews.filter(i => i.status === 'scheduled' || i.status === 'accepted');

  // Candidate pipeline status funnel counts: 1. Applied ↓ 2. Reviewed ↓ 3. Interview Scheduled ↓ 4a. Accepted/Hired / 4b. Rejected
  const appliedCount = myApps.filter(a => ['applied', 'submitted'].includes(a.currentStatus)).length;
  const reviewedCount = myApps.filter(a => ['under_review', 'ats_screened', 'reviewed', 'qualified', 'shortlisted', 'for_final_review'].includes(a.currentStatus)).length;
  const interviewCount = myApps.filter(a => ['for_interview', 'interview_scheduled', 'interview_completed'].includes(a.currentStatus)).length;
  const hiredCount = myApps.filter(a => a.currentStatus === 'hired').length;
  const rejectedCount = myApps.filter(a => ['rejected', 'not_selected'].includes(a.currentStatus)).length;

  // Ranked applicants across active company jobs (Decision tree score sorted)
  const allRankedApplicants = [...myApps]
    .map(app => {
      const seeker = jobSeekers.find(s => s.id === app.jobSeekerId);
      const job = jobPosts.find(j => j.id === app.jobId);
      return { app, seeker, job };
    })
    .sort((a, b) => b.app.matchScore - a.app.matchScore);

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    updateApplicationStatus(appId, newStatus);
    showToast({
      title: 'Applicant Status Updated',
      message: `Applicant has been marked as ${newStatus.replace(/_/g, ' ')}.`,
      type: 'status'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Verification Warning Alert Banner (if pending or for_compliance) */}
      {currentEmployerProfile.status === 'for_compliance' && (
        <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-amber-950 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-200 rounded-xl shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-800" />
            </div>
            <div>
              <p className="font-black text-amber-950 text-sm">Action Required: Compliance Documents Requested</p>
              <p className="text-amber-900 mt-0.5 font-medium">
                PESO-LGU has requested compliance for your employer credentials: "{currentEmployerProfile.complianceRemarks || 'Please submit updated 2026 documents.'}"
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('employer-profile')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shrink-0 transition-colors shadow-xs"
          >
            Update Compliance Documents
          </button>
        </div>
      )}

      {currentEmployerProfile.status === 'pending' && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-amber-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-200/60 rounded-xl shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="font-bold text-amber-900">Account Pending PESO Administrator Verification</p>
              <p className="text-amber-800 mt-0.5">
                Your business documents (DTI/SEC & Business Permit) are being reviewed by PESO Oriental Mindoro. You can create job postings in the meantime.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-200 text-amber-900 font-bold rounded-lg shrink-0">
            Pending Review
          </span>
        </div>
      )}

      {/* Hero Banner: "Find Qualified Candidates for Your Job Vacancies" */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentEmployerProfile.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80'}
            alt={currentEmployerProfile.companyName}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-400/40 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Employer Recruitment Center
              </span>
              {currentEmployerProfile.status === 'verified' && (
                <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              Find Qualified Candidates for Your Job Vacancies
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentEmployerProfile.companyName} • {currentEmployerProfile.industry} • {currentEmployerProfile.municipality}, Oriental Mindoro
            </p>
          </div>
        </div>
      </div>


      {/* Compact Dashboard Metric Cards (Prompt Mandated: Active Vacancies, Total Applicants, Highly Qualified Candidates) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Vacancies</p>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{activeJobs.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Open hiring positions in Roxas</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Applicants</p>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-blue-600 mt-1">{totalApplicantsCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Profiles and resumes received</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Highly Qualified Candidates</p>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1">{qualifiedCandidatesCount}</p>
          <p className="text-[11px] text-emerald-700 font-bold mt-1">Decision Tree score &ge;75%</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Scheduled Interviews</p>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{upcomingInterviews.length}</p>
          <p className="text-[11px] text-amber-700 font-bold mt-1">Active coordination calls</p>
        </div>
      </div>

      {/* Recruitment Pipeline Status Funnel & Monitor */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Live Funnel Tracking
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
              Candidate Recruitment Pipeline & Status Monitor
            </h3>
            <p className="text-xs text-slate-500">
              Easily monitor candidate progression across all stages and execute fast status updates.
            </p>
          </div>

          <button
            onClick={() => onNavigate('employer-applicants')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-center"
          >
            <span>Open All Candidates ({totalApplicantsCount})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Funnel Stage Bar Cards: 1. Applied ↓ 2. Reviewed ↓ 3. Interview Scheduled ↓ 4a. Accepted/Hired / 4b. Rejected */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 text-xs">
          <div 
            role="button"
            tabIndex={0}
            onClick={() => onNavigate('employer-applicants', { status: 'applied' })}
            className="p-3 bg-slate-50 hover:bg-blue-50 rounded-2xl border border-slate-200 cursor-pointer transition-all hover:border-blue-300"
          >
            <span className="text-[10px] font-bold text-blue-800 uppercase block">Applied</span>
            <span className="text-xl font-black text-blue-900">{appliedCount}</span>
            <span className="text-[10px] text-slate-500 block truncate">Initial Resumes</span>
          </div>

          <div 
            role="button"
            tabIndex={0}
            onClick={() => onNavigate('employer-applicants', { status: 'reviewed' })}
            className="p-3 bg-slate-50 hover:bg-amber-50 rounded-2xl border border-slate-200 cursor-pointer transition-all hover:border-amber-300"
          >
            <span className="text-[10px] font-bold text-amber-800 uppercase block">Reviewed</span>
            <span className="text-xl font-black text-amber-700">{reviewedCount}</span>
            <span className="text-[10px] text-slate-500 block truncate">ATS / Screening</span>
          </div>

          <div 
            role="button"
            tabIndex={0}
            onClick={() => onNavigate('employer-applicants', { status: 'interview' })}
            className="p-3 bg-slate-50 hover:bg-purple-50 rounded-2xl border border-slate-200 cursor-pointer transition-all hover:border-purple-300"
          >
            <span className="text-[10px] font-bold text-purple-800 uppercase block">Interview Scheduled</span>
            <span className="text-xl font-black text-purple-700">{interviewCount}</span>
            <span className="text-[10px] text-slate-500 block truncate">Scheduled Sessions</span>
          </div>

          <div 
            role="button"
            tabIndex={0}
            onClick={() => onNavigate('employer-applicants', { status: 'hired' })}
            className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-2xl border border-slate-200 cursor-pointer transition-all hover:border-emerald-300"
          >
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Accepted / Hired 🎉</span>
            <span className="text-xl font-black text-emerald-700">{hiredCount}</span>
            <span className="text-[10px] text-slate-500 block truncate">Municipal Placement</span>
          </div>

          <div 
            role="button"
            tabIndex={0}
            onClick={() => onNavigate('employer-applicants', { status: 'rejected' })}
            className="p-3 bg-slate-50 hover:bg-rose-50 rounded-2xl border border-slate-200 cursor-pointer transition-all hover:border-rose-300"
          >
            <span className="text-[10px] font-bold text-rose-800 uppercase block">Rejected</span>
            <span className="text-xl font-black text-rose-700">{rejectedCount}</span>
            <span className="text-[10px] text-slate-500 block truncate">Declined / Closed</span>
          </div>
        </div>
      </div>

      {/* Grid: Candidate Rankings & Active Job Vacancies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Candidate Rankings */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Candidate Rankings (Decision Tree Evaluated)
              </h2>
              <p className="text-xs text-slate-500">
                Top applicants ranked automatically based on degree, skills, and qualifications.
              </p>
            </div>

            <button
              onClick={() => onNavigate('employer-applicants')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {allRankedApplicants.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No Applicants Received Yet</p>
              <p className="text-xs text-slate-400 mt-1">Post a job vacancy to begin receiving ranked applicants from Oriental Mindoro.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allRankedApplicants.slice(0, 4).map(({ app, seeker, job }, index) => {
                const rank = index + 1;
                return (
                  <div
                    key={app.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Rank Badge */}
                        <div className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                          rank === 1 ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-200 font-black' :
                          rank === 2 ? 'bg-slate-200 text-slate-900 font-bold' :
                          rank === 3 ? 'bg-amber-700 text-white font-bold' :
                          'bg-slate-100 text-slate-700 font-semibold'
                        }`}>
                          #{rank}
                        </div>

                        <img
                          src={seeker?.profilePicture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                          alt={app.applicantName}
                          className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">{app.applicantName}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase bg-blue-50 text-blue-800 border-blue-200">
                              {(app.decisionTreeOutcome || app.matchResult?.outcome || 'QUALIFIED').replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Applied for <strong className="text-slate-800">{job?.title}</strong>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {seeker?.primaryDegree || seeker?.educationalAttainment || 'Qualified Professional'} • {seeker?.municipality || 'Oriental Mindoro'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-xl text-xs font-black">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          {app.matchScore}% Match
                        </span>
                      </div>
                    </div>

                    {/* Candidate Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <button
                        onClick={() => setSelectedMatchReportAppId(app.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>View Candidate</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedStatusUpdateApp(app)}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Update Status</span>
                        </button>

                        {app.currentStatus !== 'shortlisted' && (
                          <button
                            onClick={() => handleStatusChange(app.id, 'shortlisted')}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold rounded-lg transition-colors"
                          >
                            Shortlist
                          </button>
                        )}

                        {app.currentStatus !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(app.id, 'rejected')}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedInterviewAppId(app.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Schedule Interview</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Shortlisted Candidates Widget */}
          {shortlistedCandidates.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Shortlisted Candidates ({shortlistedCandidates.length})
                </h3>
                <button
                  onClick={() => onNavigate('employer-applicants')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Manage All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {shortlistedCandidates.slice(0, 4).map(sc => (
                  <div key={sc.id} className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{sc.applicantName}</p>
                      <p className="text-[10px] text-slate-500">{sc.jobTitle}</p>
                    </div>
                    <span className="font-black text-emerald-700 text-xs">{sc.matchScore}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Job Vacancies & Upcoming Interviews */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Job Vacancies List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Active Job Vacancies ({activeJobs.length})
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('employer-jobs')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Manage All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onOpenPostJobModal}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post Job</span>
                </button>
              </div>
            </div>

            {activeJobs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                No active job vacancies posted. Click "Post a Job" to start recruiting.
              </div>
            ) : (
              <div className="space-y-3">
                {activeJobs.map(job => {
                  const jobApps = myApps.filter(a => a.jobId === job.id);
                  return (
                    <div key={job.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{job.title}</h4>
                          <p className="text-[11px] text-slate-500">{job.municipality} • {job.employmentType}</p>
                        </div>
                        <span className="text-[11px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {jobApps.length} Applicants
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <div className="flex items-center gap-1.5">
                          <span>Status:</span>
                          <select
                            value={job.status}
                            onChange={(e) => {
                              updateJobVacancyStatus(job.id, e.target.value as any);
                              showToast({
                                title: 'Vacancy Status Updated',
                                message: `"${job.title}" status changed to ${e.target.value}.`,
                                type: 'status'
                              });
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded border border-slate-300 bg-white text-slate-800"
                          >
                            <option value="active">Active (Open)</option>
                            <option value="closed">Closed (Filled)</option>
                            <option value="pending_approval">Pending Review</option>
                          </select>
                        </div>
                        <button
                          onClick={() => onNavigate('employer-applicants', { jobId: job.id })}
                          className="text-blue-700 font-bold hover:underline"
                        >
                          Review Applicants ({jobApps.length}) →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Interviews Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                Upcoming Interviews ({upcomingInterviews.length})
              </h2>

              <button
                onClick={() => onNavigate('employer-interviews')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Calendar & Schedule</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingInterviews.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No upcoming candidate interviews scheduled.
              </p>
            ) : (
              <div className="space-y-2.5">
                {upcomingInterviews.slice(0, 3).map(interview => (
                  <div key={interview.id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">{interview.applicantName}</p>
                      <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                        {interview.type}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">Position: {interview.jobTitle}</p>
                    <p className="text-slate-500 font-medium text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      {interview.scheduledDate} at {interview.scheduledTime}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

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
          onClose={() => setSelectedInterviewAppId(null)}
          onSuccess={() => {
            setSelectedInterviewAppId(null);
            showToast({
              title: 'Interview Scheduled',
              message: 'Candidate has been notified of the interview details.',
              type: 'interview'
            });
          }}
        />
      )}

      {/* Employer Candidate Status Update & Remarks Modal */}
      {selectedStatusUpdateApp && (
        <EmployerStatusUpdateModal
          isOpen={Boolean(selectedStatusUpdateApp)}
          onClose={() => setSelectedStatusUpdateApp(null)}
          application={selectedStatusUpdateApp}
          candidateName={selectedStatusUpdateApp.applicantName}
          jobTitle={jobPosts.find(j => j.id === selectedStatusUpdateApp.jobId)?.title}
          onOpenScheduleInterview={() => {
            const appId = selectedStatusUpdateApp.id;
            setSelectedStatusUpdateApp(null);
            setSelectedInterviewAppId(appId);
          }}
        />
      )}

    </div>
  );
};
