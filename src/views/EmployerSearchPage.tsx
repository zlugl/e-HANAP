import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ORIENTAL_MINDORO_MUNICIPALITIES, JOB_CATEGORIES } from '../data/mockData';
import { 
  Building2, 
  Search, 
  MapPin, 
  ShieldCheck, 
  Briefcase, 
  ExternalLink, 
  ChevronRight, 
  Filter, 
  Sparkles,
  Users,
  CheckCircle2,
  X
} from 'lucide-react';
import { EmployerProfile, JobPost } from '../types';

interface EmployerSearchPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const EmployerSearchPage: React.FC<EmployerSearchPageProps> = ({ onNavigate }) => {
  const { employers, jobPosts } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedEmployerModal, setSelectedEmployerModal] = useState<EmployerProfile | null>(null);

  // Filter employers
  const filteredEmployers = useMemo(() => {
    return employers.filter(emp => {
      // Name & description match
      const queryMatch = !searchQuery.trim() || 
        emp.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.companyDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.industry.toLowerCase().includes(searchQuery.toLowerCase());

      // Municipality match
      const muniMatch = !selectedMunicipality || emp.municipality === selectedMunicipality;

      // Industry match
      const indMatch = !selectedIndustry || emp.industry === selectedIndustry;

      // Verified status match
      const verMatch = !verifiedOnly || emp.status === 'verified';

      return queryMatch && muniMatch && indMatch && verMatch;
    });
  }, [employers, searchQuery, selectedMunicipality, selectedIndustry, verifiedOnly]);

  const getActiveJobsForEmployer = (employerId: string): JobPost[] => {
    return jobPosts.filter(j => j.employerId === employerId && j.status === 'active');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              PESO Verified Business Directory
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Oriental Mindoro</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Explore Verified Employers
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Discover accredited local enterprises, agricultural cooperatives, tech firms, and commercial establishments operating across the 15 municipalities of Oriental Mindoro.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
            <p className="text-xl font-black text-emerald-400">{employers.filter(e => e.status === 'verified').length}</p>
            <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">Accredited</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
            <p className="text-xl font-black text-indigo-300">{jobPosts.filter(j => j.status === 'active').length}</p>
            <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">Open Vacancies</p>
          </div>
        </div>
      </div>

      {/* Search & Filtering Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Query input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by company name, keywords, or industry..."
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Municipality Selector */}
          <div className="md:col-span-3">
            <select
              value={selectedMunicipality}
              onChange={e => setSelectedMunicipality(e.target.value)}
              className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Municipalities</option>
              {ORIENTAL_MINDORO_MUNICIPALITIES.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Industry Selector */}
          <div className="md:col-span-2">
            <select
              value={selectedIndustry}
              onChange={e => setSelectedIndustry(e.target.value)}
              className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Industries</option>
              {JOB_CATEGORIES.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Verified Only Toggle */}
          <div className="md:col-span-2 flex items-center">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={e => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Verified Only</span>
            </label>
          </div>

        </div>

        {/* Active Filter Chips */}
        {(searchQuery || selectedMunicipality || selectedIndustry || verifiedOnly) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">Active filters:</span>
            {searchQuery && (
              <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg flex items-center gap-1 font-medium">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedMunicipality && (
              <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg flex items-center gap-1 font-medium">
                {selectedMunicipality}
                <button onClick={() => setSelectedMunicipality('')} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedIndustry && (
              <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg flex items-center gap-1 font-medium">
                {selectedIndustry}
                <button onClick={() => setSelectedIndustry('')} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            {verifiedOnly && (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1 font-medium">
                PESO Verified
                <button onClick={() => setVerifiedOnly(false)} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMunicipality('');
                setSelectedIndustry('');
                setVerifiedOnly(false);
              }}
              className="text-xs text-indigo-600 font-bold hover:underline ml-2"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>Found <strong className="text-slate-900">{filteredEmployers.length}</strong> employers matching your criteria</span>
        </div>

        {filteredEmployers.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {employers.length === 0 ? 'No Registered Employers Yet' : 'No Employers Found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {employers.length === 0
                ? 'There are currently no employers registered in the PESO Roxas system. Local businesses, cooperatives, and establishments can register and submit verification documents to post vacancies.'
                : "We couldn't find any employers matching your current filter criteria. Try broadening your search or resetting filters."}
            </p>
            {employers.length > 0 && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedMunicipality('');
                  setSelectedIndustry('');
                  setVerifiedOnly(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployers.map(emp => {
              const openJobs = getActiveJobsForEmployer(emp.id);
              const isVerified = emp.status === 'verified';

              return (
                <div
                  key={emp.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Logo, Name & Verified Badge */}
                    <div className="flex items-start gap-3.5">
                      <img
                        src={emp.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80'}
                        alt={emp.companyName}
                        className="w-14 h-14 rounded-2xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div>
                        <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                          {emp.companyName}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">{emp.industry}</p>
                        
                        {isVerified ? (
                          <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-md text-[10px] font-bold mt-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>PESO Verified</span>
                          </div>
                        ) : (
                          <span className="inline-block text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded mt-1">
                            Pending Verification
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Location and Info */}
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{emp.municipality}, Oriental Mindoro</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {emp.companyDescription}
                    </p>
                  </div>

                  {/* Footer Stats & View Profile Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{openJobs.length} Active Job{openJobs.length === 1 ? '' : 's'}</span>
                    </div>

                    <button
                      onClick={() => setSelectedEmployerModal(emp)}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                    >
                      <span>View Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Employer Profile & Active Jobs Detail Modal */}
      {selectedEmployerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-900 px-5 sm:px-6 py-4 sm:py-5 text-white flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={selectedEmployerModal.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80'}
                  alt={selectedEmployerModal.companyName}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-indigo-400/40 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white truncate">{selectedEmployerModal.companyName}</h2>
                    {selectedEmployerModal.status === 'verified' && (
                      <span className="text-[10px] font-bold bg-emerald-900 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> PESO Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 truncate">{selectedEmployerModal.industry} • {selectedEmployerModal.municipality}, Oriental Mindoro</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEmployerModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
              
              {/* About Company */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">About Company</h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedEmployerModal.companyDescription}
                </p>
              </div>

              {/* Company Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Headquarters</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedEmployerModal.address || `${selectedEmployerModal.municipality}, Oriental Mindoro`}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Representative</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedEmployerModal.representativeName}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Contact Number</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedEmployerModal.contactNumber}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Email Address</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedEmployerModal.email}</p>
                </div>
              </div>

              {/* Active Vacancies List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <span>Open Job Postings ({getActiveJobsForEmployer(selectedEmployerModal.id).length})</span>
                  </h3>
                </div>

                {getActiveJobsForEmployer(selectedEmployerModal.id).length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500">No active job vacancies open right now.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {getActiveJobsForEmployer(selectedEmployerModal.id).map(job => (
                      <div
                        key={job.id}
                        className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 transition-all flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{job.title}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {job.employmentType} • {job.municipality} {job.salaryRange ? `• ${job.salaryRange}` : ''}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedEmployerModal(null);
                            onNavigate('job-detail', { jobId: job.id });
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors shrink-0"
                        >
                          View & Apply
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedEmployerModal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
