import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ORIENTAL_MINDORO_MUNICIPALITIES, JOB_CATEGORIES } from '../../data/mockData';
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Calendar,
  Layers,
  FileText,
  Clock,
  ShieldCheck,
  Eye
} from 'lucide-react';

interface AdminJobsPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const AdminJobsPage: React.FC<AdminJobsPageProps> = ({ onNavigate }) => {
  const { jobPosts, employers, applications, deleteJobPost, reviewJobVacancy, showToast } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending_approval' | 'for_compliance' | 'active' | 'closed' | 'rejected'>('all');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');

  const filteredJobs = jobPosts.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMunicipality = !selectedMunicipality || job.municipality === selectedMunicipality;
    const matchesCategory = !selectedCategory || job.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus;

    return matchesSearch && matchesMunicipality && matchesCategory && matchesStatus;
  });

  const selectedJob = jobPosts.find(j => j.id === selectedJobId) || filteredJobs[0];
  const selectedJobApps = selectedJob ? applications.filter(a => a.jobId === selectedJob.id) : [];

  const handleReviewAction = (status: 'active' | 'for_compliance' | 'rejected' | 'closed') => {
    if (!selectedJob) return;
    reviewJobVacancy(selectedJob.id, status, reviewRemarks);
    setReviewRemarks('');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded uppercase">
              PESO/LGU ADMIN
            </span>
            <span className="text-xs text-slate-500 font-semibold">Labor Market Oversight</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Provincial Job Vacancies Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor, audit, and review all employment openings posted by employers across the 15 municipalities of Oriental Mindoro.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('admin-dashboard')}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            ← Back to Admin Center
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search position or employer..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900"
          />
        </div>

        {/* Municipality Filter */}
        <div>
          <select
            value={selectedMunicipality}
            onChange={e => setSelectedMunicipality(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 text-slate-800 font-medium"
          >
            <option value="">All Municipalities (15)</option>
            {ORIENTAL_MINDORO_MUNICIPALITIES.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 text-slate-800 font-medium"
          >
            <option value="">All Job Categories</option>
            {JOB_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value as any)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 text-slate-800 font-bold"
          >
            <option value="all">All Statuses ({jobPosts.length})</option>
            <option value="pending_approval">Pending Review ({jobPosts.filter(j => j.status === 'pending_approval').length})</option>
            <option value="for_compliance">For Compliance ({jobPosts.filter(j => j.status === 'for_compliance').length})</option>
            <option value="active">Active ({jobPosts.filter(j => j.status === 'active').length})</option>
            <option value="closed">Closed ({jobPosts.filter(j => j.status === 'closed').length})</option>
            <option value="rejected">Rejected ({jobPosts.filter(j => j.status === 'rejected').length})</option>
          </select>
        </div>
      </div>

      {/* Grid: Job List + Job Inspection Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Job Listings Feed */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>Showing <strong className="text-slate-900">{filteredJobs.length}</strong> Vacancies</span>
            <span>Oriental Mindoro PESO Registry</span>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No Job Postings Found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your municipality or category search filters.</p>
            </div>
          ) : (
            filteredJobs.map(job => {
              const isSelected = selectedJob?.id === job.id;
              const appsCount = applications.filter(a => a.jobId === job.id).length;
              const employer = employers.find(e => e.id === job.employerId);

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/70 border-amber-400 shadow-sm ring-1 ring-amber-300'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={job.companyLogo || employer?.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80'}
                        alt={job.companyName}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                          <span>{job.companyName}</span>
                          {job.companyVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="PESO Verified Employer" />
                          )}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {job.municipality}
                          </span>
                          <span>•</span>
                          <span>{job.employmentType}</span>
                          <span>•</span>
                          <span className="font-bold text-slate-700">{job.salaryRange}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        job.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}>
                        {job.status}
                      </span>
                      <p className="text-[11px] font-bold text-indigo-700 mt-1">
                        {appsCount} Applicant{appsCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Job Detail Inspector */}
        <div className="lg:col-span-5">
          {selectedJob ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5 sticky top-20">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded uppercase">
                    Job ID: {selectedJob.id}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{selectedJob.title}</h2>
                  <p className="text-xs text-slate-600 font-medium">{selectedJob.companyName} • {selectedJob.municipality}</p>
                </div>

                <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
                  selectedJob.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                  selectedJob.status === 'for_compliance' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                  selectedJob.status === 'pending_approval' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                  selectedJob.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {selectedJob.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Remarks alert if present */}
              {selectedJob.complianceRemarks && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                  <p className="font-bold text-amber-900">PESO Review Remarks:</p>
                  <p className="text-amber-800">{selectedJob.complianceRemarks}</p>
                </div>
              )}

              {/* Core Job Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Vacancies</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedJob.vacanciesCount} Available</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Salary Offered</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedJob.salaryRange}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Deadline</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{new Date(selectedJob.applicationDeadline).toLocaleDateString()}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Applicants</p>
                  <p className="font-bold text-indigo-700 text-sm mt-0.5">{selectedJobApps.length} Submitted</p>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Education Requirement</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedJob.minEducationalAttainment} {selectedJob.preferredDegree ? `— ${selectedJob.preferredDegree}` : ''}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    Minimum {selectedJob.minExperienceYears || 0} Year(s)
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Skills</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(selectedJob.requiredSkills || []).map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded font-semibold text-[11px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Description</p>
                  <p className="text-slate-600 mt-1 leading-relaxed text-xs max-h-32 overflow-y-auto">
                    {selectedJob.description}
                  </p>
                </div>
              </div>

              {/* PESO Labor Standards Review Action */}
              <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
                <p className="font-bold text-slate-900">PESO Labor Standards Review Action</p>
                <textarea
                  rows={2}
                  value={reviewRemarks}
                  onChange={e => setReviewRemarks(e.target.value)}
                  placeholder="Optional review notes or compliance instructions for employer..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleReviewAction('active')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors shadow-2xs"
                  >
                    ✓ Approve & Publish
                  </button>

                  <button
                    onClick={() => {
                      if (!reviewRemarks) {
                        setReviewRemarks('Salary range and wage specifications must comply with Region IV-B DOLE minimum wage rates.');
                      }
                      handleReviewAction('for_compliance');
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors"
                  >
                    Return for Compliance
                  </button>

                  <button
                    onClick={() => handleReviewAction('rejected')}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors"
                  >
                    Reject Vacancy
                  </button>

                  {selectedJob.status === 'active' && (
                    <button
                      onClick={() => handleReviewAction('closed')}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
                    >
                      Close Vacancy
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              Select a job vacancy to inspect its requirements and application volume.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
