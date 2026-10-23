import React, { useState } from 'react';
import { ApplicationStatus, Application } from '../types';
import { 
  Check, 
  Calendar, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  Building2, 
  XCircle, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  UserCheck,
  X
} from 'lucide-react';
import { ApplicationTrackingBar } from './ApplicationTrackingBar';

interface ApplicationStatusTrackerProps {
  application: Application;
  jobTitle?: string;
  companyName?: string;
  companyLogo?: string;
  employerId?: string;
  appliedDate?: string;
  matchScore?: number;
  isEmployer?: boolean;
  candidateName?: string;
  onUpdateStatus?: (newStatus: ApplicationStatus) => void;
  onVisitEmployerProfile?: () => void;
  onScheduleInterview?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export const ApplicationStatusTracker: React.FC<ApplicationStatusTrackerProps> = ({
  application,
  jobTitle,
  companyName,
  companyLogo,
  employerId,
  appliedDate,
  matchScore,
  isEmployer = false,
  candidateName,
  onUpdateStatus,
  onVisitEmployerProfile,
  onScheduleInterview,
  onViewDetails,
  className = '',
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showVerticalTimeline, setShowVerticalTimeline] = useState(true);
  const currentStatus = application.currentStatus;

  const displayDate = appliedDate 
    ? new Date(appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : (application.appliedDate ? new Date(application.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Aug 12, 2026');

  const displayMatchScore = matchScore ?? application.matchScore ?? 94;

  // Step completion logic for 4-step vertical progress timeline (Prompt Requirement 5)
  const isSubmittedDone = true;
  const isUnderReviewDone = [
    'reviewed', 'under_review', 'ats_screened', 'qualified', 'shortlisted', 'for_final_review',
    'interview_scheduled', 'for_interview', 'interview_completed',
    'hired', 'rejected', 'not_selected'
  ].includes(currentStatus);
  const isInterviewScheduledDone = [
    'interview_scheduled', 'for_interview', 'interview_completed',
    'hired'
  ].includes(currentStatus);
  const isDecisionDone = ['hired', 'rejected', 'not_selected'].includes(currentStatus);

  const verticalTimelineSteps = [
    {
      step: 1,
      title: 'Submitted',
      desc: 'Application received & verified by PESO system',
      date: displayDate,
      isCompleted: isUnderReviewDone || isInterviewScheduledDone || isDecisionDone,
      isActive: currentStatus === 'applied' || currentStatus === 'submitted',
    },
    {
      step: 2,
      title: 'Under Review',
      desc: 'Decision Tree qualification check & employer credentials review',
      date: isUnderReviewDone ? 'Reviewed' : 'In Progress',
      isCompleted: isInterviewScheduledDone || isDecisionDone,
      isActive: ['reviewed', 'under_review', 'ats_screened', 'qualified', 'shortlisted', 'for_final_review'].includes(currentStatus),
    },
    {
      step: 3,
      title: 'Interview Scheduled',
      desc: isInterviewScheduledDone ? 'Formal interview coordinated with employer' : 'Interview session coordination',
      date: isInterviewScheduledDone ? 'Scheduled' : 'Pending Review',
      isCompleted: isDecisionDone,
      isActive: ['for_interview', 'interview_scheduled', 'interview_completed'].includes(currentStatus),
    },
    {
      step: 4,
      title: (currentStatus === 'rejected' || currentStatus === 'not_selected') ? 'Decision (Finished)' : 'Decision',
      desc: currentStatus === 'hired' ? 'Accepted & Hired 🎉' : (currentStatus === 'rejected' || currentStatus === 'not_selected') ? 'Application finished — applicant was not selected.' : 'Final placement decision stage',
      date: isDecisionDone ? (currentStatus === 'hired' ? 'Placed' : 'Finished') : 'Pending Outcome',
      isCompleted: isDecisionDone,
      isActive: isDecisionDone,
    },
  ];

  // Format Status Badge text
  const formatStatusDisplay = (status: ApplicationStatus): string => {
    switch (status) {
      case 'applied':
      case 'submitted':
        return 'Applied';
      case 'ats_screened':
      case 'under_review':
      case 'reviewed':
      case 'qualified':
      case 'shortlisted':
      case 'for_final_review':
        return 'Reviewed';
      case 'for_interview':
      case 'interview_scheduled':
      case 'interview_completed':
        return 'Interview Scheduled';
      case 'hired':
        return 'Accepted / Hired 🎉';
      case 'rejected':
      case 'not_selected':
        return 'Rejected (Finished)';
      default:
        return String(status).replace(/_/g, ' ');
    }
  };

  const getStatusBadgeTheme = (status: ApplicationStatus) => {
    if (status === 'hired') return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    if (status === 'rejected' || status === 'not_selected') return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
    if (['for_interview', 'interview_scheduled', 'interview_completed'].includes(status)) {
      return 'bg-purple-50 text-purple-800 border-purple-300';
    }
    if (['reviewed', 'under_review', 'ats_screened', 'qualified', 'shortlisted'].includes(status)) {
      return 'bg-amber-50 text-amber-800 border-amber-300';
    }
    return 'bg-blue-50 text-blue-800 border-blue-300';
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4 font-sans ${className}`}>
      
      {/* Top Application Details Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {companyLogo ? (
            <img 
              src={companyLogo} 
              alt={companyName || 'Company'} 
              onClick={onVisitEmployerProfile}
              className={`w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-200 shrink-0 bg-slate-50 ${
                onVisitEmployerProfile ? 'cursor-pointer hover:ring-2 hover:ring-indigo-400 hover:opacity-90 transition-all' : ''
              }`}
              title={onVisitEmployerProfile ? 'Click to visit employer profile' : undefined}
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 font-bold text-base">
              {isEmployer ? (candidateName?.[0] || 'C') : (companyName?.[0] || 'E')}
            </div>
          )}

          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
              {isEmployer ? (candidateName || application.applicantName || 'Applicant Profile') : (jobTitle || 'Job Vacancy')}
            </h3>

            <div className="text-xs text-slate-500 font-medium mt-0.5 flex flex-wrap items-center gap-1.5">
              {isEmployer ? (
                <span>Applied for <strong className="text-slate-800">{jobTitle || 'Job Vacancy'}</strong> · Applied {displayDate}</span>
              ) : (
                <>
                  {onVisitEmployerProfile ? (
                    <button
                      type="button"
                      onClick={onVisitEmployerProfile}
                      className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1 hover:underline cursor-pointer group text-left"
                      title="Click to visit employer's profile"
                    >
                      <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{companyName || 'Employer Profile'}</span>
                      <ExternalLink className="w-3 h-3 text-indigo-400 group-hover:text-indigo-600 shrink-0" />
                    </button>
                  ) : (
                    <span className="font-bold text-slate-700">{companyName || 'Employer'}</span>
                  )}
                  <span>· Applied {displayDate}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Match Score & Status Badge */}
        <div className="flex items-center gap-3.5 self-start sm:self-center shrink-0">
          <div className="text-right">
            <p className="text-sm sm:text-base font-black text-emerald-600 leading-tight">
              {displayMatchScore}%
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Match
            </p>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap shadow-2xs ${getStatusBadgeTheme(currentStatus)}`}>
            {formatStatusDisplay(currentStatus)}
          </span>
        </div>
      </div>

      {/* Stepper Display with View Mode Selector */}
      <div className="pt-2 pb-1 space-y-3">
        {/* Toggle between 4-Step Vertical Timeline and Horizontal Stepper */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
              4-Step Application Timeline
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowVerticalTimeline(!showVerticalTimeline)}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            {showVerticalTimeline ? 'Switch to Compact Stepper' : 'View Vertical Timeline'}
          </button>
        </div>

        {/* 1. Prompt Mandated: 4-Step Vertical Progress Timeline (Submitted, Under Review, Interview Scheduled, Decision) */}
        {showVerticalTimeline ? (
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="relative pl-6 space-y-4">
              {/* Vertical connecting background line */}
              <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-slate-200 -translate-x-1/2" />

              {verticalTimelineSteps.map((st, idx) => {
                const isLast = idx === verticalTimelineSteps.length - 1;
                const isRejected = currentStatus === 'rejected' || currentStatus === 'not_selected';
                const isRejectedStep = isLast && isRejected;

                return (
                  <div key={st.step} className="relative flex items-start gap-3.5 group">
                    {/* Node Marker */}
                    <div className="absolute -left-6 top-0.5 flex items-center justify-center">
                      {isRejectedStep ? (
                        <div className="w-5 h-5 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-white shadow-xs ring-4 ring-rose-500/25">
                          <X className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : st.isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : st.isActive ? (
                        <div className="w-5 h-5 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center shadow-xs ring-4 ring-blue-500/20">
                          <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center shadow-2xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black leading-tight ${
                            isRejectedStep
                              ? 'text-rose-800'
                              : st.isCompleted 
                              ? 'text-emerald-900' 
                              : st.isActive 
                              ? 'text-blue-700' 
                              : 'text-slate-600'
                          }`}>
                            {st.title}
                          </span>
                          {st.isActive && !isRejectedStep && !st.isCompleted && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              Active Stage
                            </span>
                          )}
                          {isRejectedStep ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                              Finished • Rejected
                            </span>
                          ) : st.isCompleted ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Completed
                            </span>
                          ) : null}
                        </div>
                        <span className={`text-[10px] font-bold shrink-0 ${isRejectedStep ? 'text-rose-600' : 'text-slate-400'}`}>
                          {st.date}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-0.5 leading-snug ${isRejectedStep ? 'text-rose-700 font-medium' : 'text-slate-500'}`}>
                        {st.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Horizontal Stepper Option */
          <div className="pt-1 pb-1">
            <ApplicationTrackingBar 
              currentStatus={currentStatus} 
              statusNotes={application.notes}
              isEmployer={isEmployer}
              onUpdateStatus={onUpdateStatus}
            />
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          {/* Status History Trigger */}
          {application.statusHistory && application.statusHistory.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="text-slate-500 hover:text-slate-800 font-medium text-xs flex items-center gap-1 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Status History ({application.statusHistory.length})</span>
              {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Seeker View: Status updated by employer notice */}
          {!isEmployer && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200/90 rounded-xl text-[11px] font-bold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Status updated by employer</span>
            </div>
          )}


          {/* Interview Details Action - Hidden if seeker is already hired since interview was already conducted */}
          {onScheduleInterview && currentStatus !== 'hired' && (
            <button
              type="button"
              onClick={onScheduleInterview}
              className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              <span>{isEmployer ? 'Schedule Interview' : 'Interview Session'}</span>
            </button>
          )}

          {/* Hired Confirmation Badge when already hired */}
          {currentStatus === 'hired' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Interview Conducted • Hired 🎉</span>
            </span>
          )}

          {onViewDetails && (
            <button
              type="button"
              onClick={onViewDetails}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Details
            </button>
          )}
        </div>
      </div>

      {/* Expandable Status History Audit Log */}
      {showHistory && application.statusHistory && application.statusHistory.length > 0 && (
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {application.statusHistory.map((hist, idx) => {
              const dateStr = hist.timestamp 
                ? new Date(hist.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recent update';

              return (
                <div key={idx} className="flex items-start gap-2.5 pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 capitalize">
                        {formatStatusDisplay(hist.status)}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {dateStr}
                      </span>
                    </div>
                    {hist.notes && (
                      <p className="text-[11px] text-slate-600 mt-0.5 italic">
                        "{hist.notes}"
                      </p>
                    )}
                    {hist.changedBy && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Updated by: {hist.changedBy}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
