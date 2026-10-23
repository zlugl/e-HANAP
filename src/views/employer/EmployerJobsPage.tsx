import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmployerSalaryChart } from '../../components/EmployerSalaryChart';
import { CreateJobModal } from './CreateJobModal';
import { JobPost, JobStatus } from '../../types';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  MapPin, 
  DollarSign, 
  Clock, 
  Calendar, 
  ChevronRight, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Edit3, 
  ExternalLink, 
  Share2, 
  Check, 
  BarChart3,
  XCircle,
  Building2,
  Sparkles
} from 'lucide-react';

interface EmployerJobsPageProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenPostJobModal: () => void;
}

export const EmployerJobsPage: React.FC<EmployerJobsPageProps> = ({ onNavigate, onOpenPostJobModal }) => {
  const { 
    currentEmployerProfile, 
    jobPosts, 
    applications, 
    updateJobVacancyStatus, 
    showToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed' | 'paused' | 'pending_approval'>('all');
  const [showSalaryChart, setShowSalaryChart] = useState(false);
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);

  if (!currentEmployerProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md">
          <Building2 className="w-10 h-10 text-blue-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">Employer Account Required</h2>
          <p className="text-xs text-slate-500 mt-1">Please log in with an Employer account to manage your company vacancies.</p>
        </div>
      </div>
    );
  }

  const myJobs = jobPosts.filter(j => j.employerId === currentEmployerProfile.id);
  const myJobIds = myJobs.map(j => j.id);
  const myApps = applications.filter(a => myJobIds.includes(a.jobId));

  const activeJobs = myJobs.filter(j => j.status === 'active');
  const closedJobs = myJobs.filter(j => j.status === 'closed');
  const pendingJobs = myJobs.filter(j => j.status === 'pending_approval');

  // Filter jobs
  const filteredJobs = myJobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.municipality.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ? true : 
      statusFilter === 'paused' ? job.status === 'paused' :
      job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (jobId: string, title: string, newStatus: JobStatus) => {
    updateJobVacancyStatus(jobId, newStatus);
    showToast({
      title: 'Vacancy Status Updated',
      message: `"${title}" has been updated to ${newStatus.replace(/_/g, ' ')}.`,
      type: 'status'
    });
  };

  const handleCopyLink = (jobId: string) => {
    const url = `${window.location.origin}/#job-${jobId}`;
    navigator.clipboard.writeText(url);
    setCopiedJobId(jobId);
    showToast({
      title: 'Vacancy Link Copied',
      message: 'Direct link to job listing copied to clipboard.',
      type: 'info'
    });
    setTimeout(() => setCopiedJobId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Vacancies & Postings Management
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {currentEmployerProfile.companyName}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            Job Postings & Vacancies
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, manage, and monitor job listings for hiring across Roxas and Oriental Mindoro.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSalaryChart(!showSalaryChart)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showSalaryChart 
                ? 'bg-blue-50 border-blue-300 text-blue-700' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>{showSalaryChart ? 'Hide Salary Benchmark' : 'Salary Benchmark'}</span>
          </button>

          <button
            onClick={onOpenPostJobModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Vacancy</span>
          </button>
        </div>
      </div>


      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Openings</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{activeJobs.length}</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Hiring Now</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Accepting applications</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Received</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-blue-600">{myApps.length}</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Applicants across all jobs</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Closed / Filled</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-700">{closedJobs.length}</span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Positions concluded</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Listings</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{myJobs.length}</span>
            <Briefcase className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cumulative career posts</p>
        </div>
      </div>

      {/* Salary Benchmark Collapsible Section */}
      {showSalaryChart && (
        <div className="bg-white p-6 rounded-3xl border border-blue-200 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Salary Benchmarking in Roxas & Oriental Mindoro
              </h2>
              <p className="text-xs text-slate-500">
                Compare your vacancy salary offerings against average market compensation in Oriental Mindoro.
              </p>
            </div>
            <button
              onClick={() => setShowSalaryChart(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Close Chart
            </button>
          </div>
          <EmployerSalaryChart myJobs={myJobs} allJobs={jobPosts} />
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, department, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({myJobs.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Active ({activeJobs.length})
          </button>
          <button
            onClick={() => setStatusFilter('closed')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              statusFilter === 'closed'
                ? 'bg-slate-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Closed ({closedJobs.length})
          </button>
          {pendingJobs.length > 0 && (
            <button
              onClick={() => setStatusFilter('pending_approval')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === 'pending_approval'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pending ({pendingJobs.length})
            </button>
          )}
        </div>
      </div>

      {/* Job Postings Grid / List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Job Vacancies Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {myJobs.length === 0 
              ? "You haven't posted any job vacancies yet. Click 'Post New Vacancy' to start hiring candidates in Roxas."
              : "No vacancies match your current search or status filter."}
          </p>
          <button
            onClick={onOpenPostJobModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post a Vacancy</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map(job => {
            const jobApps = myApps.filter(a => a.jobId === job.id);
            const qualifiedApps = jobApps.filter(a => (a.matchResult?.overallMatch || a.matchScore) >= 75);
            const hiredApps = jobApps.filter(a => a.currentStatus === 'hired');

            return (
              <div 
                key={job.id} 
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all p-5 sm:p-6 space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black text-slate-900">
                        {job.title}
                      </h2>
                      
                      {/* Status Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        job.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        job.status === 'closed' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                        job.status === 'paused' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {job.status.replace(/_/g, ' ')}
                      </span>

                      {job.isUrgent && (
                        <span className="text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                          🔥 Urgent Hiring
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 font-medium">
                      {job.department || job.category} • {job.employmentType} • {job.experienceLevel || 'Entry to Mid'}
                    </p>
                  </div>

                  {/* Status Dropdown Quick Control */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Status:</span>
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job.id, job.title, e.target.value as JobStatus)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl border transition-colors cursor-pointer ${
                        job.status === 'active' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
                        job.status === 'closed' ? 'bg-slate-100 border-slate-300 text-slate-700' :
                        'bg-amber-50 border-amber-300 text-amber-800'
                      }`}
                    >
                      <option value="active">Active (Open)</option>
                      <option value="paused">Paused</option>
                      <option value="closed">Closed (Filled)</option>
                      <option value="pending_approval">Pending Review</option>
                    </select>
                  </div>
                </div>

                {/* Details Pills Row */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{job.salaryRange || 'Competitive (Negotiable)'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{job.municipality || 'Roxas'}, Oriental Mindoro</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Posted: {job.postedDate || 'Recent'}</span>
                  </div>

                  {job.positionsAvailable && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>{job.positionsAvailable} Slots</span>
                    </div>
                  )}
                </div>

                {/* Skills tags */}
                {job.skillsRequired && job.skillsRequired.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1">Required Skills:</span>
                    {job.skillsRequired.slice(0, 5).map((skill, sIdx) => (
                      <span key={sIdx} className="text-[10px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                        {skill}
                      </span>
                    ))}
                    {job.skillsRequired.length > 5 && (
                      <span className="text-[10px] text-slate-400 font-bold">
                        +{job.skillsRequired.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                {/* Candidate Funnel for this job & Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-slate-500">Total Applicants:</span>
                      <strong className="text-slate-900 font-bold">{jobApps.length}</strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-slate-500">Qualified (≥75%):</span>
                      <strong className="text-emerald-700 font-bold">{qualifiedApps.length}</strong>
                    </div>

                    {hiredApps.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <span className="text-slate-500">Hired:</span>
                        <strong className="text-indigo-700 font-bold">{hiredApps.length}</strong>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(job.id)}
                      title="Copy Job Link"
                      className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      {copiedJobId === job.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => onNavigate('job-detail', { jobId: job.id })}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => onNavigate('employer-applicants', { jobId: job.id })}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Candidates ({jobApps.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
