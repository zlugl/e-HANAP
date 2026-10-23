import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, X, Briefcase, MapPin, Building2, CheckCircle2, ArrowRight, AlertTriangle, Calendar, Info } from 'lucide-react';

interface JobMatchToastContainerProps {
  onNavigate: (view: string, params?: any) => void;
}

export const JobMatchToastContainer: React.FC<JobMatchToastContainerProps> = ({ onNavigate }) => {
  const { activeToast, dismissToast } = useApp();

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        dismissToast();
      }, 14000);
      return () => clearTimeout(timer);
    }
  }, [activeToast, dismissToast]);

  if (!activeToast) return null;

  const isSuccess = activeToast.type === 'success' || /success|submitted|confirmed|dispatched|saved|hired/i.test(activeToast.title);
  const isAlert = activeToast.type === 'alert' || activeToast.type === 'warning' || /alert|warning|attention|pending/i.test(activeToast.title);
  const isInterview = activeToast.type === 'action' || /interview|schedule|meeting/i.test(activeToast.title) || (activeToast.link && activeToast.link.includes('interview'));

  const handleAction = () => {
    const targetJobId = activeToast.jobId;
    const targetLink = activeToast.link;
    dismissToast();

    if (targetJobId) {
      onNavigate('job-detail', { jobId: targetJobId });
    } else if (targetLink) {
      if (targetLink.includes('interview')) onNavigate('seeker-interviews');
      else if (targetLink.includes('applicant')) onNavigate('employer-applicants');
      else if (targetLink.includes('verification')) onNavigate('admin-verifications');
      else if (targetLink.includes('application')) onNavigate('seeker-applications');
      else if (targetLink.includes('jobs')) onNavigate('jobs');
      else if (targetLink.includes('admin')) onNavigate('admin-dashboard');
      else onNavigate('seeker-dashboard');
    }
  };

  const getActionLabel = () => {
    if (activeToast.actionLabel) return activeToast.actionLabel;
    if (activeToast.jobId) return 'View Vacancy Details';
    if (activeToast.link) {
      if (activeToast.link.includes('interview')) return 'View Interview Session';
      if (activeToast.link.includes('applicant')) return 'View Candidate Applicants';
      if (activeToast.link.includes('verification')) return 'Review Employer Verification';
      if (activeToast.link.includes('application')) return 'View Application Status';
      if (activeToast.link.includes('jobs')) return 'Explore Job Vacancies';
      return 'View Related Record';
    }
    return null;
  };

  const actionLabel = getActionLabel();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismissToast();
      }}
    >
      <div 
        className="bg-white text-slate-900 border border-slate-200/90 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 relative overflow-hidden animate-in zoom-in-95 duration-200 ease-out transform"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Accent Gradient Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${
          isSuccess 
            ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400' 
            : isAlert 
            ? 'bg-gradient-to-r from-amber-500 via-orange-400 to-red-400'
            : isInterview
            ? 'bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400'
            : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-400'
        }`} />

        {/* Top Right Close Button */}
        <button
          onClick={dismissToast}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Close message"
          aria-label="Close message"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Centered Popping Message Content */}
        <div className="flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg mb-3.5 transform transition-transform animate-in zoom-in-50 duration-300 ${
            isSuccess 
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/30' 
              : isAlert 
              ? 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/30'
              : isInterview
              ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/30'
              : 'bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-indigo-600/30'
          }`}>
            {isSuccess ? (
              <CheckCircle2 className="w-7 h-7" />
            ) : isAlert ? (
              <AlertTriangle className="w-7 h-7" />
            ) : isInterview ? (
              <Calendar className="w-7 h-7" />
            ) : (
              <Briefcase className="w-7 h-7" />
            )}
          </div>

          {/* Badge */}
          <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1.5 ${
            isSuccess 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : isAlert 
              ? 'bg-amber-50 text-amber-900 border border-amber-200'
              : isInterview
              ? 'bg-blue-50 text-blue-800 border border-blue-200'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200/70'
          }`}>
            <Sparkles className="w-3 h-3" />
            <span>Message Pop-up</span>
          </span>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
            {activeToast.title}
          </h3>

          {/* Description Message */}
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-sm">
            {activeToast.message}
          </p>

          {/* Metadata Chips (Company & Municipality) */}
          {(activeToast.companyName || activeToast.municipality) && (
            <div className="mt-3.5 p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-wrap items-center justify-center gap-3 text-xs w-full">
              {activeToast.companyName && (
                <span className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{activeToast.companyName}</span>
                </span>
              )}
              {activeToast.municipality && (
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{activeToast.municipality}</span>
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 w-full space-y-2">
            {actionLabel ? (
              <>
                <button
                  type="button"
                  onClick={handleAction}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{actionLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={dismissToast}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={dismissToast}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Okay, Got It</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
