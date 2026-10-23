import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  UserCheck, 
  Briefcase, 
  ExternalLink, 
  ShieldCheck, 
  X, 
  ChevronRight,
  Globe
} from 'lucide-react';

interface EmployerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName?: string;
  employerId?: string;
  onNavigateJob?: (jobId: string) => void;
  onBrowseDirectory?: () => void;
}

export const EmployerProfileModal: React.FC<EmployerProfileModalProps> = ({
  isOpen,
  onClose,
  companyName = '',
  employerId,
  onNavigateJob,
  onBrowseDirectory,
}) => {
  const { employers, jobPosts } = useApp();

  if (!isOpen) return null;

  // Resolve employer profile
  const matchedEmployer = employers.find(e => 
    (employerId && e.id === employerId) ||
    (companyName && e.companyName.toLowerCase() === companyName.toLowerCase())
  );

  const displayProfile = matchedEmployer || {
    id: employerId || `emp-${Date.now()}`,
    userId: 'user-emp',
    companyName: companyName || 'Oriental Mindoro Business Partner',
    companyDescription: `${companyName || 'This employer'} is an accredited business operating in Oriental Mindoro. Registered with the Public Employment Service Office (PESO) for legitimate local workforce recruitment and placement.`,
    industry: 'Commercial & Services',
    address: 'Roxas, Oriental Mindoro, Philippines',
    municipality: 'Roxas',
    representativeName: 'HR Recruitment Officer',
    contactNumber: '(043) 283-5000',
    email: `careers@${(companyName || 'employer').toLowerCase().replace(/[^a-z0-9]/g, '')}.ph`,
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
    status: 'verified' as const,
    isEstablishedLocal: true,
    establishmentType: 'local_established',
    createdAt: new Date().toISOString(),
  };

  // Find other active job vacancies by this employer
  const companyJobs = jobPosts.filter(j => 
    (matchedEmployer && j.employerId === matchedEmployer.id) ||
    (companyName && j.companyName.toLowerCase() === companyName.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={displayProfile.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80'}
              alt={displayProfile.companyName}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-400/40 bg-white shadow-md shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-400/20">
                  {displayProfile.industry || 'Local Employer'}
                </span>
                {displayProfile.status === 'verified' && (
                  <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    PESO Verified Employer
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-white mt-1">
                {displayProfile.companyName}
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{displayProfile.municipality || 'Roxas'}, Oriental Mindoro</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 max-h-[70vh]">
          {/* Company Description */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">About Company</h4>
            <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 font-medium">
              {displayProfile.companyDescription || 'Registered business entity accredited under the Municipal Public Employment Service Office (PESO) of Oriental Mindoro. Actively participating in municipal job placement and compliant hiring programs.'}
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Office Location</span>
              <span className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{displayProfile.address || `${displayProfile.municipality}, Oriental Mindoro`}</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">HR Representative</span>
              <span className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{displayProfile.representativeName || 'HR Officer'}</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact Phone</span>
              <span className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{displayProfile.contactNumber || '(043) 283-5000'}</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Recruitment Email</span>
              <span className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">{displayProfile.email}</span>
              </span>
            </div>
          </div>

          {/* Active Vacancies */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Open Job Vacancies ({companyJobs.length})
              </span>
            </h4>

            {companyJobs.length === 0 ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center text-xs text-slate-500">
                No active open vacancies posted at this time.
              </div>
            ) : (
              <div className="space-y-2">
                {companyJobs.map(job => (
                  <div
                    key={job.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">{job.title}</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {job.municipality} • {job.employmentType} • {job.salaryRange || 'Competitive Salary'}
                      </p>
                    </div>

                    {onNavigateJob && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateJob(job.id);
                        }}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-colors shrink-0 flex items-center gap-1"
                      >
                        <span>View Job</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {onBrowseDirectory ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onBrowseDirectory();
              }}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>Browse All Employers</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
