import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Send, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Check, 
  AlertCircle, 
  Briefcase, 
  ChevronRight,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface QuickApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    companyName: string;
    logoLetter: string;
    logoBg: string;
    location: string;
    salary: string;
    type?: string;
    workSetup?: string;
  };
  onSuccess?: () => void;
  onNavigate?: (view: string, params?: any) => void;
}

export const QuickApplyModal: React.FC<QuickApplyModalProps> = ({
  isOpen,
  onClose,
  job,
  onSuccess,
  onNavigate
}) => {
  const { 
    currentSeekerProfile, 
    applyForJob, 
    updateJobSeekerProfile, 
    showToast 
  } = useApp();

  // Active resume attached automatically from profile
  const resumes = currentSeekerProfile?.resumes || [];
  const defaultResumeId = currentSeekerProfile?.activeResumeId || resumes[0]?.id || 'profile-default-resume';
  const [selectedResumeId, setSelectedResumeId] = useState<string>(defaultResumeId);

  // Form fields
  const [coverNote, setCoverNote] = useState('');
  const [contactNumber, setContactNumber] = useState(currentSeekerProfile?.contactNumber || '0917-555-0192');
  const [availability, setAvailability] = useState('Immediately (Ready to start)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Keep state in sync when profile or modal opens
  useEffect(() => {
    if (currentSeekerProfile) {
      setSelectedResumeId(currentSeekerProfile.activeResumeId || resumes[0]?.id || 'profile-default-resume');
      setContactNumber(currentSeekerProfile.contactNumber || '0917-555-0192');
      setErrorMsg('');
      setIsSubmitted(false);
    }
  }, [currentSeekerProfile, isOpen]);

  if (!isOpen || !currentSeekerProfile) return null;

  // Selected or virtual resume details
  const activeResumeObj = resumes.find(r => r.id === selectedResumeId) || resumes[0];
  const resumeDisplayName = activeResumeObj?.fileName || 
    `${currentSeekerProfile.firstName}_${currentSeekerProfile.lastName}_PESO_Resume.pdf`;
  const resumeFileSize = activeResumeObj?.fileSize || '240 KB';
  const resumeUploadedDate = activeResumeObj?.uploadedAt 
    ? new Date(activeResumeObj.uploadedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Active Profile on File';

  // Quick message presets
  const quickMessagePresets = [
    'I have relevant experience in this role and am available to start immediately.',
    'Resident of Roxas, Oriental Mindoro ready for on-site or hybrid reporting.',
    'Proficient with the required core competencies, certifications, and responsibilities.',
    'Eager to contribute high work ethics and compliant service to your establishment.'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!contactNumber.trim()) {
      setErrorMsg('Please provide a valid contact number so the hiring team can reach you.');
      return;
    }

    setIsSubmitting(true);

    // Sync updated contact number back to seeker profile if changed
    if (contactNumber !== currentSeekerProfile.contactNumber) {
      updateJobSeekerProfile(currentSeekerProfile.id, { contactNumber });
    }

    setTimeout(() => {
      const result = applyForJob(
        job.id,
        currentSeekerProfile.id,
        selectedResumeId,
        coverNote.trim() || undefined
      );

      setIsSubmitting(false);

      if (result.success) {
        setIsSubmitted(true);
        showToast({
          title: 'Application Dispatched! 🎉',
          message: `Your resume and application were transmitted to ${job.companyName} for ${job.title}.`,
          type: 'success'
        });
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(result.message || 'Failed to submit application. Please try again.');
      }
    }, 600);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setErrorMsg('');
    setCoverNote('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) handleClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.18 }}
        className="bg-white w-full max-w-xl sm:max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col relative"
      >
        
        {/* Top Header Card (Charcoal contour matching app design) */}
        <div className="bg-[#43464b] text-white p-5 sm:p-6 shrink-0 relative overflow-hidden">
          {/* Subtle Organic Curves */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none opacity-20" 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 500 160"
            preserveAspectRatio="none"
          >
            <path d="M-20,30 Q150,-10 280,50 T520,20" fill="none" stroke="#ffffff" strokeWidth="1.6" />
            <path d="M-20,70 Q140,20 290,90 T520,50" fill="none" stroke="#ffffff" strokeWidth="1.6" />
            <path d="M-20,110 Q160,50 310,130 T520,80" fill="none" stroke="#ffffff" strokeWidth="1.6" />
          </svg>

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-bold tracking-wider uppercase text-emerald-300 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>PESO Roxas Verified Application</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Review & Confirm Application
              </h2>
              <p className="text-xs text-white/80">
                Review your profile details and automatically attached resume before submitting.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-white/15"
              title="Close and cancel"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-800">

          {/* SUCCESS SCREEN */}
          {isSubmitted ? (
            <div className="py-6 text-center space-y-5 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  Application Successfully Transmitted
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  You Applied for {job.title}!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                  Your credentials and attached resume were dispatched to <strong className="text-slate-900">{job.companyName}</strong>. You can monitor your application status anytime.
                </p>
              </div>

              {/* Summary Details Card */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200/70 pb-2">
                  <span className="text-slate-400 font-medium">Position</span>
                  <span className="font-bold text-slate-900">{job.title}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/70 pb-2">
                  <span className="text-slate-400 font-medium">Employer</span>
                  <span className="font-bold text-slate-900">{job.companyName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/70 pb-2">
                  <span className="text-slate-400 font-medium">Attached Resume</span>
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">{resumeDisplayName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Initial Status</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Under Review
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    if (onNavigate) onNavigate('seeker-applications');
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>View in My Applications</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Done & Back to Job
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Target Job Quick Summary Card */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${job.logoBg} flex items-center justify-center font-serif font-black text-xl text-white shadow-xs shrink-0`}>
                    {job.logoLetter}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {job.companyName} • {job.location}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 block">{job.salary}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{job.type || 'Full-Time'}</span>
                </div>
              </div>

              {/* 1. AUTOMATICALLY ATTACHED RESUME SECTION */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      1. Attached Resume
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <Check className="w-3 h-3 text-emerald-600" />
                    Automatically Attached from Profile
                  </span>
                </div>

                {/* Resume Card Display */}
                <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {resumeDisplayName}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {resumeFileSize} • {resumeUploadedDate} • Active Seeker Resume
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold bg-white text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl shrink-0 shadow-2xs">
                    Ready to Send
                  </span>
                </div>

                {/* Multiple Resumes Selector (If user uploaded more than 1 in profile) */}
                {resumes.length > 1 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-slate-500 mb-1.5">
                      Select alternative resume from your profile:
                    </p>
                    <div className="space-y-1.5">
                      {resumes.map(r => (
                        <label
                          key={r.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                            selectedResumeId === r.id 
                              ? 'border-emerald-600 bg-emerald-50/40 font-bold' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <input
                              type="radio"
                              name="quickApplyResume"
                              checked={selectedResumeId === r.id}
                              onChange={() => setSelectedResumeId(r.id)}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="truncate">{r.fileName}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal shrink-0">{r.fileSize}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. CANDIDATE PROFILE & CONTACT INFO VERIFICATION */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-700" />
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      2. Candidate Information
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Pre-filled from your profile
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Full Name */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                      Full Name
                    </span>
                    <span className="font-bold text-slate-900">
                      {currentSeekerProfile.firstName} {currentSeekerProfile.middleName || ''} {currentSeekerProfile.lastName}
                    </span>
                  </div>

                  {/* Registered Email */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                      Email Address
                    </span>
                    <span className="font-bold text-slate-900 truncate block">
                      {currentSeekerProfile.email}
                    </span>
                  </div>

                  {/* Contact Phone (Editable) */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                      Active Contact Number *
                    </label>
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="e.g. 0917-123-4567"
                      className="w-full bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  {/* Resident Address */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                      Location / Residency
                    </span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {currentSeekerProfile.municipality || 'Roxas'}, Oriental Mindoro
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. MESSAGE TO EMPLOYER / ADD TEXT (Optional Note) */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      3. Note to Employer (Add Text)
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Optional</span>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Add a brief note or message to the hiring manager introducing yourself and explaining why you're a great fit for this vacancy..."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400 font-medium resize-none leading-relaxed"
                  />

                  {/* Quick-fill Suggestion Chips */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Quick Suggestions (Click to insert):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickMessagePresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (!coverNote) setCoverNote(preset);
                            else if (!coverNote.includes(preset)) setCoverNote(`${coverNote} ${preset}`);
                          }}
                          className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer text-left"
                        >
                          + {preset.slice(0, 42)}...
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Earliest Availability */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Earliest Start Availability:
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="Immediately (Ready to start)">Immediately (Ready to start)</option>
                    <option value="Within 1 Week">Within 1 Week</option>
                    <option value="2 Weeks Notice">2 Weeks Notice</option>
                    <option value="1 Month Notice">1 Month Notice</option>
                    <option value="Negotiable / Specific Date">Negotiable / Specific Date</option>
                  </select>
                </div>
              </div>

              {/* Data Privacy & Certification Notice */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>PESO Roxas Municipal Privacy Acknowledgment</span>
                </div>
                <p className="leading-relaxed text-slate-500">
                  By clicking Send Application, you authorize PESO Roxas and {job.companyName} to receive your profile and attached resume in compliance with the Philippine Data Privacy Act of 2012 (RA 10173).
                </p>
              </div>

              {/* Error Display */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons (Cancel prevents misclick!) */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="w-1/2 sm:w-auto px-5 py-3 border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 sm:w-auto flex-1 sm:flex-none px-7 py-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Application Now</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </motion.div>
    </div>
  );
};
