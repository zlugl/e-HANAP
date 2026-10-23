import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Application, ApplicationStatus } from '../types';
import { 
  X, 
  CheckCircle2, 
  Calendar, 
  UserCheck, 
  Sparkles, 
  AlertCircle, 
  XCircle, 
  FileText, 
  Send,
  Building2,
  ShieldCheck,
  Bell,
  ArrowDown,
  Check,
  Clock
} from 'lucide-react';

interface EmployerStatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  candidateName?: string;
  jobTitle?: string;
  onOpenScheduleInterview?: () => void;
}

export type StandardStageKey = '1_applied' | '2_reviewed' | '3_interview' | '4a_hired' | '4b_rejected';

export const EmployerStatusUpdateModal: React.FC<EmployerStatusUpdateModalProps> = ({
  isOpen,
  onClose,
  application,
  candidateName,
  jobTitle,
  onOpenScheduleInterview,
}) => {
  const { updateApplicationStatus, showToast } = useApp();

  // Map existing application status to standard selection
  const mapInitialStatus = (status: ApplicationStatus): ApplicationStatus => {
    if (status === 'submitted' || status === 'applied') return 'applied';
    if (['ats_screened', 'under_review', 'reviewed', 'qualified', 'shortlisted', 'for_final_review'].includes(status)) {
      return 'reviewed';
    }
    if (['for_interview', 'interview_scheduled', 'interview_completed'].includes(status)) {
      return 'interview_scheduled';
    }
    if (status === 'hired') return 'hired';
    if (status === 'rejected' || status === 'not_selected') return 'rejected';
    return status;
  };

  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(
    mapInitialStatus(application.currentStatus)
  );
  const [remarks, setRemarks] = useState<string>(application.notes || '');
  const [notifyCandidate, setNotifyCandidate] = useState<boolean>(true);
  const [notifyPeso, setNotifyPeso] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Preset quick remark chips
  const quickRemarks = [
    'Resume and qualifications verified.',
    'Qualified - scheduled for panel interview.',
    'Outstanding interview performance; job offer extended!',
    'Candidate successfully hired and placed.',
    'Thank you for your application; position filled.',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedRemarks = remarks.trim() || undefined;
    updateApplicationStatus(application.id, selectedStatus, formattedRemarks);

    setTimeout(() => {
      setIsSubmitting(false);
      const readableLabel = 
        selectedStatus === 'applied' ? 'Applied' :
        selectedStatus === 'reviewed' ? 'Reviewed' :
        selectedStatus === 'interview_scheduled' ? 'Interview Scheduled' :
        selectedStatus === 'hired' ? 'Accepted / Hired 🎉' : 'Rejected';

      showToast({
        title: 'Application Status Updated',
        message: `${candidateName || 'Candidate'} moved to "${readableLabel}".`,
        type: selectedStatus === 'hired' ? 'success' : 'status',
      });
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-400/20">
                Application Status Form
              </span>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                Application Status Form
              </h3>
              <p className="text-xs text-slate-300">
                <strong className="text-white">{candidateName || application.applicantName || 'Candidate'}</strong> · {jobTitle || 'Position'}
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

        {/* Visual Pipeline Hierarchy Guide (Glowing Connected Stepper matching tracking UI) */}
        <div className="bg-slate-950 text-white border-b border-white/10 px-6 py-5 relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-4 relative z-10">
            <span className="uppercase tracking-wider text-[10px] text-blue-400">Recruitment Tracking Flow</span>
            <span className="text-slate-400">Click any step to set candidate stage</span>
          </div>

          {/* Stepper with central horizontal track line */}
          <div className="relative z-10 max-w-lg mx-auto">
            {/* Background inactive track */}
            <div className="absolute top-5 left-[12%] right-[12%] h-1 bg-slate-800 -translate-y-1/2 z-0 rounded-full" />
            
            {/* Active glowing electric blue progress line */}
            <div 
              className="absolute top-5 left-[12%] h-1 bg-gradient-to-r from-blue-500 to-cyan-400 -translate-y-1/2 z-0 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.9)] transition-all duration-300"
              style={{
                width: 
                  (selectedStatus === 'applied' || selectedStatus === 'submitted') ? '0%' :
                  (selectedStatus === 'reviewed' || selectedStatus === 'under_review' || selectedStatus === 'qualified' || selectedStatus === 'shortlisted') ? '33%' :
                  (selectedStatus === 'interview_scheduled' || selectedStatus === 'for_interview') ? '66%' : '76%'
              }}
            />

            <div className="grid grid-cols-4 gap-2 relative z-10">
              
              {/* Step 1: Applied */}
              <div 
                onClick={() => setSelectedStatus('applied')}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  (selectedStatus === 'applied' || selectedStatus === 'submitted')
                    ? 'border-2 border-cyan-400 ring-4 ring-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.9)] bg-blue-600 text-white font-black text-sm'
                    : 'bg-blue-600 border border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.6)] text-white'
                }`}>
                  {(selectedStatus === 'applied' || selectedStatus === 'submitted') ? '1' : <Check className="w-4 h-4 text-white stroke-[2.8]" />}
                </div>
                <span className="text-[10px] text-slate-400 font-medium uppercase mt-2">Step 1</span>
                <span className={`text-[11px] font-bold ${
                  (selectedStatus === 'applied' || selectedStatus === 'submitted') ? 'text-cyan-300' : 'text-slate-200'
                }`}>Applied</span>
              </div>

              {/* Step 2: Reviewed */}
              <div 
                onClick={() => setSelectedStatus('reviewed')}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  (selectedStatus === 'reviewed' || selectedStatus === 'under_review' || selectedStatus === 'qualified' || selectedStatus === 'shortlisted')
                    ? 'border-2 border-cyan-400 ring-4 ring-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.9)] bg-blue-600 text-white font-black text-sm'
                    : (selectedStatus === 'interview_scheduled' || selectedStatus === 'for_interview' || selectedStatus === 'hired' || selectedStatus === 'rejected')
                    ? 'bg-blue-600 border border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.6)] text-white'
                    : 'bg-slate-800 border border-slate-700 text-slate-400 font-bold text-xs'
                }`}>
                  {(selectedStatus === 'interview_scheduled' || selectedStatus === 'for_interview' || selectedStatus === 'hired' || selectedStatus === 'rejected') 
                    ? <Check className="w-4 h-4 text-white stroke-[2.8]" /> 
                    : '2'}
                </div>
                <span className="text-[10px] text-slate-400 font-medium uppercase mt-2">Step 2</span>
                <span className={`text-[11px] font-bold ${
                  (selectedStatus === 'reviewed' || selectedStatus === 'under_review' || selectedStatus === 'qualified' || selectedStatus === 'shortlisted') ? 'text-cyan-300' : 'text-slate-300'
                }`}>Reviewed</span>
              </div>

              {/* Step 3: Interview Scheduled */}
              <div 
                onClick={() => setSelectedStatus('interview_scheduled')}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  (selectedStatus === 'interview_scheduled' || selectedStatus === 'for_interview')
                    ? 'border-2 border-cyan-400 ring-4 ring-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.9)] bg-blue-600 text-white font-black text-sm'
                    : (selectedStatus === 'hired')
                    ? 'bg-blue-600 border border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.6)] text-white'
                    : 'bg-slate-800 border border-slate-700 text-slate-400 font-bold text-xs'
                }`}>
                  {selectedStatus === 'hired' ? <Check className="w-4 h-4 text-white stroke-[2.8]" /> : '3'}
                </div>
                <span className="text-[10px] text-slate-400 font-medium uppercase mt-2">Step 3</span>
                <span className={`text-[11px] font-bold ${
                  (selectedStatus === 'interview_scheduled' || selectedStatus === 'for_interview') ? 'text-cyan-300' : 'text-slate-300'
                }`}>Interview</span>
              </div>

              {/* Step 4: Decision (Accepted / Rejected) */}
              <div 
                onClick={() => setSelectedStatus('hired')}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  selectedStatus === 'hired'
                    ? 'border-2 border-emerald-300 ring-4 ring-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.9)] bg-emerald-600 text-white font-black text-sm'
                    : selectedStatus === 'rejected'
                    ? 'border-2 border-rose-300 ring-4 ring-rose-500/40 shadow-[0_0_16px_rgba(244,63,94,0.8)] bg-rose-600 text-white font-black text-sm'
                    : 'bg-slate-800 border border-slate-700 text-slate-400 font-bold text-xs'
                }`}>
                  {selectedStatus === 'hired' ? <Check className="w-4 h-4 text-white stroke-[2.8]" /> : '4'}
                </div>
                <span className="text-[10px] text-slate-400 font-medium uppercase mt-2">Step 4</span>
                <span className={`text-[11px] font-bold ${
                  selectedStatus === 'hired' ? 'text-emerald-300' : selectedStatus === 'rejected' ? 'text-rose-300' : 'text-slate-400'
                }`}>
                  {selectedStatus === 'hired' ? 'Hired 🎉' : selectedStatus === 'rejected' ? 'Rejected' : 'Finish'}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Main Stage Options (Application Status Form: 1. Applied ↓ 2. Reviewed ↓ 3. Interview Scheduled ↓ 4a. Accepted/Hired / 4b. Rejected) */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">
              Recruitment Stage Selection:
            </label>

            <div className="space-y-2.5">
              
              {/* 1. Applied */}
              <div
                onClick={() => setSelectedStatus('applied')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedStatus === 'applied' || selectedStatus === 'submitted'
                    ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-400/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                    selectedStatus === 'applied' || selectedStatus === 'submitted'
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-slate-300 bg-white'
                  }`}>
                    {(selectedStatus === 'applied' || selectedStatus === 'submitted') && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Applied
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border bg-blue-100 text-blue-900 border-blue-300">
                        Initial Stage
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Candidate application submitted & received. Credentials ready for inspection.
                    </p>
                  </div>
                </div>
              </div>

              {/* Down Arrow Connector */}
              <div className="flex justify-center -my-1 text-slate-400">
                <ArrowDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* 2. Reviewed */}
              <div
                onClick={() => setSelectedStatus('reviewed')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedStatus === 'reviewed' || selectedStatus === 'under_review' || selectedStatus === 'qualified' || selectedStatus === 'shortlisted'
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                    selectedStatus === 'reviewed' || selectedStatus === 'under_review' || selectedStatus === 'qualified' || selectedStatus === 'shortlisted'
                      ? 'bg-amber-600 border-amber-600 text-white' 
                      : 'border-slate-300 bg-white'
                  }`}>
                    {(selectedStatus === 'reviewed' || selectedStatus === 'under_review' || selectedStatus === 'qualified' || selectedStatus === 'shortlisted') && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Reviewed
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border bg-amber-100 text-amber-900 border-amber-300">
                        Screening Stage
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Application and qualifications reviewed by employer. ATS match and requirements checked.
                    </p>
                  </div>
                </div>
              </div>

              {/* Down Arrow Connector */}
              <div className="flex justify-center -my-1 text-slate-400">
                <ArrowDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* 3. Interview Scheduled */}
              <div
                onClick={() => setSelectedStatus('interview_scheduled')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedStatus === 'interview_scheduled' || selectedStatus === 'for_interview'
                    ? 'border-purple-500 bg-purple-50/80 ring-2 ring-purple-400/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                    selectedStatus === 'interview_scheduled' || selectedStatus === 'for_interview'
                      ? 'bg-purple-600 border-purple-600 text-white' 
                      : 'border-slate-300 bg-white'
                  }`}>
                    {(selectedStatus === 'interview_scheduled' || selectedStatus === 'for_interview') && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Interview Scheduled
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border bg-purple-100 text-purple-900 border-purple-300">
                        Coordination Stage
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Interview session arranged with candidate (in-person or virtual panel meeting).
                    </p>
                  </div>
                </div>

                {onOpenScheduleInterview && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenScheduleInterview();
                    }}
                    className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 text-[11px] font-bold rounded-lg border border-purple-300 transition-colors shrink-0 flex items-center gap-1"
                  >
                    <Calendar className="w-3 h-3 text-purple-700" />
                    <span>Set Date</span>
                  </button>
                )}
              </div>

              {/* Down Arrow Connector to Decision */}
              <div className="flex justify-center -my-1 text-slate-400">
                <ArrowDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* Step 4 Decision: Accepted/Hired vs Rejected */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                
                {/* Accepted / Hired */}
                <div
                  onClick={() => setSelectedStatus('hired')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    selectedStatus === 'hired'
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/40'
                      : 'border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Accepted / Hired
                    </span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      selectedStatus === 'hired' 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {selectedStatus === 'hired' && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Job offer extended and accepted. Recorded in municipal PESO placement records.
                  </p>
                </div>

                {/* Rejected */}
                <div
                  onClick={() => setSelectedStatus('rejected')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    selectedStatus === 'rejected'
                      ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-400/30'
                      : 'border-slate-200 hover:border-rose-300 bg-white hover:bg-rose-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      Rejected
                    </span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      selectedStatus === 'rejected' 
                        ? 'bg-rose-600 border-rose-600 text-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {selectedStatus === 'rejected' && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Candidate not selected for this position at this time. Notification logged.
                  </p>
                </div>

              </div>

            </div>
          </div>

          {/* Employer Remarks & Notes */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">
              Status Remarks & Notes for Candidate:
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g., Application reviewed; candidate invited for technical interview on Wednesday at 10:00 AM."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />

            {/* Quick remark suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickRemarks.map((remark, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRemarks(remark)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-[10px] font-semibold rounded-lg transition-colors text-left"
                >
                  + {remark}
                </button>
              ))}
            </div>
          </div>

          {/* Notification & Compliance Checklist */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={notifyCandidate}
                onChange={(e) => setNotifyCandidate(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-blue-600" />
                <span>Send live status update notification to {candidateName || 'candidate'}</span>
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={notifyPeso}
                onChange={(e) => setNotifyPeso(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Record update in PESO Roxas municipal employment placement monitor</span>
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Update Application Status'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
