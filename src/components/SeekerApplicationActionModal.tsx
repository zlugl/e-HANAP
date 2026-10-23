import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Application, ApplicationStatus } from '../types';
import { 
  X, 
  Send, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Clock, 
  FileText,
  Building2,
  ChevronRight
} from 'lucide-react';

interface SeekerApplicationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  jobTitle?: string;
  companyName?: string;
}

export const SeekerApplicationActionModal: React.FC<SeekerApplicationActionModalProps> = ({
  isOpen,
  onClose,
  application,
  jobTitle,
  companyName,
}) => {
  const { updateApplicationStatus, showToast, currentUser } = useApp();

  const [actionType, setActionType] = useState<
    'confirm_interview' | 'request_reschedule' | 'add_update_note' | 'withdraw'
  >(application.currentStatus === 'interview_scheduled' ? 'confirm_interview' : 'add_update_note');

  const [message, setMessage] = useState('');
  const [preferredRescheduleDate, setPreferredRescheduleDate] = useState('');
  const [preferredRescheduleTime, setPreferredRescheduleTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let newStatus: ApplicationStatus = application.currentStatus;
    let fullNote = message.trim();

    if (actionType === 'confirm_interview') {
      newStatus = 'interview_scheduled';
      fullNote = `Candidate confirmed interview attendance. ${message ? `Note: "${message}"` : ''}`.trim();
    } else if (actionType === 'request_reschedule') {
      newStatus = 'for_interview';
      fullNote = `Candidate requested interview reschedule. Preferred: ${preferredRescheduleDate || 'Upcoming date'} ${preferredRescheduleTime || ''}. Reason: ${message || 'Schedule conflict'}`.trim();
    } else if (actionType === 'withdraw') {
      newStatus = 'withdrawn';
      fullNote = `Application voluntarily withdrawn by candidate. Reason: ${message || 'Accepted another offer or personal circumstances'}`.trim();
    } else {
      // add_update_note
      fullNote = `Candidate Status Update Note: ${message}`.trim();
    }

    updateApplicationStatus(application.id, newStatus, fullNote);

    setTimeout(() => {
      setIsSubmitting(false);
      showToast({
        title: actionType === 'withdraw' ? 'Application Withdrawn' : 'Status Note Dispatched',
        message: actionType === 'withdraw' 
          ? 'Your application has been marked as withdrawn.'
          : 'Your response and status update note have been sent to the employer.',
        type: 'status',
      });
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-400/20">
              Candidate Action & Response
            </span>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              Update Application Status / Notes
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {jobTitle || 'Job Opening'} • {companyName || 'Employer'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Action Choice Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">
              Choose Action to Perform:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {application.currentStatus === 'interview_scheduled' && (
                <>
                  <button
                    type="button"
                    onClick={() => setActionType('confirm_interview')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      actionType === 'confirm_interview'
                        ? 'bg-purple-50 border-purple-400 text-purple-900 font-bold ring-2 ring-purple-400/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-0.5 text-purple-800">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Confirm Interview</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-normal">Acknowledge attendance</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('request_reschedule')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      actionType === 'request_reschedule'
                        ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold ring-2 ring-amber-400/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-0.5 text-amber-800">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Request Reschedule</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-normal">Propose another date</p>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setActionType('add_update_note')}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  actionType === 'add_update_note'
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold ring-2 ring-indigo-400/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5 text-indigo-800">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Send Status Note</span>
                </div>
                <p className="text-[10px] text-slate-500 font-normal">Update employer with info</p>
              </button>

              <button
                type="button"
                onClick={() => setActionType('withdraw')}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  actionType === 'withdraw'
                    ? 'bg-rose-50 border-rose-400 text-rose-900 font-bold ring-2 ring-rose-400/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5 text-rose-800">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Withdraw Application</span>
                </div>
                <p className="text-[10px] text-slate-500 font-normal">Cancel consideration</p>
              </button>
            </div>
          </div>

          {/* Conditional Reschedule Inputs */}
          {actionType === 'request_reschedule' && (
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
              <div>
                <label className="text-[11px] font-bold text-amber-900 block mb-1">
                  Preferred Date:
                </label>
                <input
                  type="date"
                  value={preferredRescheduleDate}
                  onChange={(e) => setPreferredRescheduleDate(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-amber-300 rounded-xl text-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-amber-900 block mb-1">
                  Preferred Time:
                </label>
                <input
                  type="time"
                  value={preferredRescheduleTime}
                  onChange={(e) => setPreferredRescheduleTime(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-amber-300 rounded-xl text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Remarks / Message Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {actionType === 'confirm_interview' && 'Confirmation Message / Notes for Interviewer (Optional):'}
              {actionType === 'request_reschedule' && 'Reason for Reschedule Request:'}
              {actionType === 'add_update_note' && 'Status Note / Update Message to Employer:'}
              {actionType === 'withdraw' && 'Reason for Withdrawing Application:'}
            </label>
            <textarea
              rows={3}
              required={actionType === 'request_reschedule' || actionType === 'add_update_note'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                actionType === 'confirm_interview'
                  ? 'e.g., Thank you, I have prepared my documents and will be present on time.'
                  : actionType === 'request_reschedule'
                  ? 'e.g., I have an existing civil service exam conflict on that morning, could we meet on the afternoon or the following day?'
                  : actionType === 'withdraw'
                  ? 'e.g., Accepted an offer closer to my residence, thank you for your consideration.'
                  : 'e.g., Hello HR team, I have recently passed my TESDA NC II assessment and updated my credentials.'
              }
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-slate-800"
            />
          </div>

          {/* Application Status History Preview */}
          {application.statusHistory && application.statusHistory.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                Recent Status Log:
              </span>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {application.statusHistory.slice(-2).reverse().map((h, i) => (
                  <div key={i} className="text-slate-600 flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-slate-800 capitalize">{h.status.replace(/_/g, ' ')}</strong>
                      {h.notes ? ` — "${h.notes}"` : ''}
                      <span className="text-slate-400 text-[10px] ml-1">
                        ({new Date(h.updatedAt).toLocaleDateString()})
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ${
                actionType === 'withdraw'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Status Update'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
