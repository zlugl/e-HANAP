import React from 'react';
import { ApplicationStatus } from '../types';
import { Check, Sparkles, XCircle, X } from 'lucide-react';

interface ApplicationTrackingBarProps {
  currentStatus: ApplicationStatus;
  statusNotes?: string;
  isEmployer?: boolean;
  onUpdateStatus?: (newStatus: ApplicationStatus) => void;
  className?: string;
}

export const ApplicationTrackingBar: React.FC<ApplicationTrackingBarProps> = ({
  currentStatus,
  statusNotes,
  isEmployer = false,
  onUpdateStatus,
  className = '',
}) => {
  // Determine completion and active state for the 4 stages:
  // 1. Applied
  // 2. Reviewed
  // 3. Interview Scheduled
  // 4. Accepted/Hired (or Rejected)
  const isAppliedDone = true;

  const isReviewedDone = [
    'reviewed', 'under_review', 'ats_screened', 'qualified', 'shortlisted', 'for_final_review',
    'interview_scheduled', 'for_interview', 'interview_completed',
    'hired', 'rejected', 'not_selected'
  ].includes(currentStatus);

  const isInterviewDone = [
    'interview_scheduled', 'for_interview', 'interview_completed',
    'hired'
  ].includes(currentStatus);

  const isHired = currentStatus === 'hired';
  const isRejected = currentStatus === 'rejected' || currentStatus === 'not_selected';

  // Active step: 1, 2, 3, or 4
  const activeStep = isHired || isRejected ? 4 : isInterviewDone ? 3 : isReviewedDone ? 2 : 1;

  const stages = [
    {
      num: 1,
      targetStatus: 'applied' as ApplicationStatus,
      label: 'Applied',
      subtitle: 'Application Received',
      isCompleted: isReviewedDone || isInterviewDone || isHired || isRejected,
      isCurrent: activeStep === 1,
    },
    {
      num: 2,
      targetStatus: 'reviewed' as ApplicationStatus,
      label: 'Reviewed',
      subtitle: 'Credentials Checked',
      isCompleted: isInterviewDone || isHired || isRejected,
      isCurrent: activeStep === 2,
    },
    {
      num: 3,
      targetStatus: 'interview_scheduled' as ApplicationStatus,
      label: isHired ? 'Interview Completed' : 'Interview Scheduled',
      subtitle: isHired ? 'Conducted & Passed' : 'Session Arranged',
      isCompleted: isHired || (isRejected && isInterviewDone),
      isCurrent: activeStep === 3,
    },
    {
      num: 4,
      targetStatus: 'hired' as ApplicationStatus,
      label: isHired ? 'Accepted / Hired 🎉' : isRejected ? 'Rejected (Finished)' : 'Decision Stage',
      subtitle: isHired ? 'Placement Confirmed' : isRejected ? 'Finished • Rejected' : 'Decision Stage',
      isCompleted: isHired || isRejected,
      isCurrent: activeStep === 4,
    },
  ];

  return (
    <div className={`space-y-3 font-sans ${className}`}>
      
      {/* Horizontal Stepper Line (Exact match to reference screenshot: concentric bullseye dot, dotted lines, hollow circles) */}
      <div className="flex items-center w-full px-2 sm:px-4 py-2">
        {stages.map((stage, idx) => {
          const isLast = idx === stages.length - 1;
          const lineCompleted = activeStep > stage.num;

          return (
            <React.Fragment key={stage.num}>
              {/* Node Circle */}
              <div 
                className={`flex items-center justify-center shrink-0 ${isEmployer ? 'cursor-pointer group' : 'cursor-default'}`}
                onClick={() => isEmployer && onUpdateStatus && onUpdateStatus(stage.targetStatus)}
                title={isEmployer ? `Click to advance candidate to: ${stage.label}` : `${stage.label} (Status updated by employer)`}
              >
                {/* Current Stage Node: Concentric Blue Bullseye (Exact match to left node in reference image) */}
                {stage.isCurrent && !isHired && !isRejected && (
                  <div className="w-5 h-5 rounded-full border-2 border-blue-700 bg-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-blue-500/20 transition-all">
                    <div className="w-2 h-2 rounded-full bg-blue-700" />
                  </div>
                )}

                {/* Completed Stage Node: Solid blue with mini checkmark */}
                {stage.isCompleted && !stage.isCurrent && !isHired && (
                  <div className="w-5 h-5 rounded-full bg-blue-700 border-2 border-blue-700 flex items-center justify-center shrink-0 text-white shadow-xs transition-all group-hover:scale-110">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}

                {/* Hired Decision Node: Concentric Emerald Bullseye */}
                {stage.num === 4 && isHired && (
                  <div className="w-5 h-5 rounded-full border-2 border-emerald-600 bg-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-emerald-500/20 transition-all">
                    <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  </div>
                )}

                {/* Rejected Decision Node: Red finished marker */}
                {stage.num === 4 && isRejected && (
                  <div className="w-5 h-5 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center shrink-0 text-white shadow-xs ring-4 ring-rose-500/25 transition-all">
                    <X className="w-3 h-3 stroke-[3]" />
                  </div>
                )}

                {/* Pending / Inactive Stage Node: Light Hollow Circle Ring (Exact match to middle/right nodes in reference image) */}
                {!stage.isCompleted && !stage.isCurrent && (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white shrink-0 transition-all group-hover:border-slate-400" />
                )}
              </div>

              {/* Connecting Line: Dotted horizontal track (Exact match to reference screenshot) */}
              {!isLast && (
                <div 
                  className={`flex-1 mx-2 sm:mx-4 border-b-2 border-dotted transition-colors ${
                    lineCompleted ? 'border-blue-600' : 'border-slate-300'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Stage Labels Below Stepper Track */}
      <div className="grid grid-cols-4 gap-2 text-center pt-1">
        {stages.map((stage) => (
          <div key={stage.num} className="min-w-0">
            <span className={`text-[11px] sm:text-xs block truncate ${
              stage.num === 4 && isRejected
                ? 'font-bold text-rose-700'
                : stage.isCurrent 
                ? 'font-bold text-blue-800' 
                : stage.isCompleted 
                ? 'font-bold text-slate-800' 
                : 'font-medium text-slate-400'
            }`}>
              {stage.label}
            </span>
            <span className={`text-[10px] hidden sm:block truncate ${
              stage.num === 4 && isRejected
                ? 'text-rose-600 font-medium'
                : stage.isCurrent 
                ? 'text-blue-600 font-medium' 
                : 'text-slate-400'
            }`}>
              {stage.subtitle}
            </span>
          </div>
        ))}
      </div>

      {/* Contextual Status Note / Remark */}
      {statusNotes && (
        <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600">
          <strong className="text-slate-800">Employer Note:</strong> "{statusNotes}"
        </div>
      )}

    </div>
  );
};
