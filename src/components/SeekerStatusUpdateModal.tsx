import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JobSeekerProfile } from '../types';
import { 
  UserCheck, 
  Briefcase, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  X, 
  Clock, 
  Sparkles, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface SeekerStatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  seeker: JobSeekerProfile;
}

export const SeekerStatusUpdateModal: React.FC<SeekerStatusUpdateModalProps> = ({
  isOpen,
  onClose,
  seeker,
}) => {
  const { updateJobSeekerProfile, showToast } = useApp();

  const [employmentStatus, setEmploymentStatus] = useState<string>(
    seeker.employmentStatus || 'unemployed'
  );
  const [availabilityTimeline, setAvailabilityTimeline] = useState<string>('immediately');
  const [willingToRelocate, setWillingToRelocate] = useState<boolean>(
    seeker.geographicMobility === 'willing_to_relocate' || Boolean(seeker.willingToRelocateForVisitingCompanies)
  );
  const [statusNote, setStatusNote] = useState<string>(
    seeker.professionalSummary || 'Actively seeking local and provincial job opportunities in Oriental Mindoro.'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const STATUS_OPTIONS = [
    {
      id: 'unemployed',
      label: 'Actively Seeking Employment',
      badge: 'Available Now',
      color: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
      iconColor: 'text-emerald-600',
      description: 'Your profile is highlighted to verified employers looking to hire immediately.',
    },
    {
      id: 'underemployed',
      label: 'Open to Better Opportunities',
      badge: 'Considering Offers',
      color: 'border-blue-500 bg-blue-50/50 text-blue-900',
      iconColor: 'text-blue-600',
      description: 'Currently working or freelancing, but actively open to higher-paying or career-advancing roles.',
    },
    {
      id: 'hired',
      label: 'Employed / Placed in Job',
      badge: 'Currently Hired',
      color: 'border-purple-500 bg-purple-50/50 text-purple-900',
      iconColor: 'text-purple-600',
      description: 'You have been hired. Keeps your PESO employment placement records accurate.',
    },
    {
      id: 'on_hold',
      label: 'Not Looking / On Break',
      badge: 'Paused',
      color: 'border-slate-300 bg-slate-50 text-slate-700',
      iconColor: 'text-slate-500',
      description: 'Temporarily pause employer interview invitations while continuing your studies or personal time.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const mappedStatus = employmentStatus === 'on_hold' ? 'unemployed' : employmentStatus;

    updateJobSeekerProfile(seeker.id, {
      employmentStatus: mappedStatus as any,
      professionalSummary: statusNote,
      geographicMobility: willingToRelocate ? 'willing_to_relocate' : 'local_only',
      willingToRelocateForVisitingCompanies: willingToRelocate,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      showToast({
        title: 'Status Updated Successfully',
        message: `Your job search status is now set to "${STATUS_OPTIONS.find(s => s.id === employmentStatus)?.label || employmentStatus}".`,
        type: 'status',
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
        aria-labelledby="status-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-400/20">
                Job Seeker Availability Monitor
              </span>
              <h3 id="status-modal-title" className="text-lg font-black text-white mt-0.5">
                Update Employment & Job-Search Status
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Status Selection Cards */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">
              Select Your Current Job-Search Status:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = employmentStatus === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setEmploymentStatus(opt.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                      isSelected
                        ? `${opt.color} shadow-sm ring-2 ring-indigo-500/30`
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
                          {opt.label}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                          isSelected ? 'bg-white border-current' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {opt.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-end mt-2 pt-2 border-t border-slate-100">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Availability Timeline & Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Notice / Availability:</span>
              </label>
              <select
                value={availabilityTimeline}
                onChange={(e) => setAvailabilityTimeline(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="immediately">Available Immediately (Today)</option>
                <option value="1_week">Available in 1 Week</option>
                <option value="2_weeks">Available in 2 Weeks</option>
                <option value="1_month">1 Month Notice Period</option>
                <option value="custom">Flexible / Negotiable</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={willingToRelocate}
                  onChange={(e) => setWillingToRelocate(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-slate-900 block">Willing to Relocate / Travel</span>
                  <span className="text-slate-500">Open to visiting companies across Oriental Mindoro</span>
                </div>
              </label>
            </div>
          </div>

          {/* Availability Note */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Status Note / Headline (Visible to Employers):</span>
              </label>
              <span className="text-[10px] text-slate-400">Optional</span>
            </div>
            <textarea
              rows={2}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="e.g., Graduate of BSIT with NC II in Computer Servicing, looking for full-time IT or Admin positions in Roxas."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-slate-800"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <p className="text-[11px] text-slate-400">
              Synchronized with Roxas Municipal PESO Registry.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Saving...' : 'Save & Update Status'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
