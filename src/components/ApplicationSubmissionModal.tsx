import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JobPost, JobSeekerProfile, Application, MatchResult } from '../types';
import { calculateDecisionTreeMatch } from '../utils/decisionTree';
import { 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  User, 
  Phone, 
  Mail, 
  ChevronRight,
  Info,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ApplicationSubmissionModalProps {
  isOpen: boolean;
  job: JobPost | null;
  seeker: JobSeekerProfile | null;
  onClose: () => void;
  onSuccess: (app: Application) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const ApplicationSubmissionModal: React.FC<ApplicationSubmissionModalProps> = ({
  isOpen,
  job,
  seeker,
  onClose,
  onSuccess,
  onNavigate
}) => {
  const { applyForJob, updateJobSeekerProfile } = useApp();

  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    seeker?.activeResumeId || seeker?.resumes[0]?.id || ''
  );
  const [coverNote, setCoverNote] = useState('');
  const [availability, setAvailability] = useState('Immediately (Within 1 week)');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [contactNumber, setContactNumber] = useState(seeker?.contactNumber || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state when seeker changes
  React.useEffect(() => {
    if (seeker) {
      setSelectedResumeId(seeker.activeResumeId || seeker.resumes[0]?.id || '');
      setContactNumber(seeker.contactNumber || '');
    }
  }, [seeker, isOpen]);

  if (!isOpen || !job || !seeker) return null;

  // Calculate live Decision Tree Match
  const matchResult: MatchResult = calculateDecisionTreeMatch(seeker, job);

  const selectedResume = seeker.resumes.find(r => r.id === selectedResumeId) || seeker.resumes[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!agreedToTerms) {
      setErrorMessage('Please confirm the accuracy of your application information.');
      return;
    }

    if (!selectedResumeId && seeker.resumes.length === 0) {
      setErrorMessage('Please upload or attach a resume to submit your candidacy.');
      return;
    }

    setIsSubmitting(true);

    // If contact number was updated, sync with profile
    if (contactNumber && contactNumber !== seeker.contactNumber) {
      updateJobSeekerProfile(seeker.id, { contactNumber });
    }

    const resumeToUse = selectedResumeId || seeker.resumes[0]?.id || 'default-resume';

    setTimeout(() => {
      const res = applyForJob(job.id, seeker.id, resumeToUse);
      setIsSubmitting(false);

      if (res.success && res.application) {
        setSubmittedApp(res.application);
        onSuccess(res.application);
      } else {
        setErrorMessage(res.message || 'Failed to submit application. Please try again.');
      }
    }, 900);
  };

  const handleCloseModal = () => {
    setSubmittedApp(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Confirm & Submit Candidacy
              </h2>
              <p className="text-[11px] text-slate-300">
                Official PESO Oriental Mindoro Match & Application Pipeline
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Success View */}
          {submittedApp ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  Automated Notification Dispatched
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  Application Successfully Submitted!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                  Your candidacy and Decision Tree score of <strong className="text-emerald-700 font-bold">{matchResult.overallMatch}%</strong> have been sent to <strong className="text-slate-900">{job.companyName}</strong>.
                </p>
              </div>

              {/* Application Details Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2.5">
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500 font-medium">Position</span>
                  <span className="font-bold text-slate-900">{job.title}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500 font-medium">Employer</span>
                  <span className="font-bold text-slate-900">{job.companyName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500 font-medium">Outcome Tier</span>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {matchResult.outcome}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Status</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Under Review
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => {
                    const appId = submittedApp?.id;
                    const jobTitle = job.title;
                    const companyName = job.companyName;
                    handleCloseModal();
                    onNavigate('seeker-applications', {
                      justSubmitted: true,
                      highlightAppId: appId,
                      jobTitle,
                      companyName
                    });
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>View in My Applications</span>
                </button>
                <button
                  onClick={() => {
                    handleCloseModal();
                    onNavigate('jobs');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
                >
                  Explore More Jobs
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Job Target Overview Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={job.companyLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80'}
                    alt={job.companyName}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                    <p className="text-xs text-slate-600 font-medium">{job.companyName}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {job.municipality}, Oriental Mindoro
                      </span>
                      <span>•</span>
                      <span>{job.employmentType}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Decision Tree Match</p>
                  <p className={`text-base font-black ${
                    matchResult.overallMatch >= 80 ? 'text-emerald-600' :
                    matchResult.overallMatch >= 60 ? 'text-blue-600' :
                    matchResult.overallMatch >= 40 ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {matchResult.overallMatch}%
                  </p>
                </div>
              </div>

              {/* Candidate Info Verification */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-indigo-600" />
                    1. Applicant Identity & Qualifications
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate('seeker-profile');
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Edit Profile Details
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Candidate Full Name</span>
                    <span className="font-bold text-slate-900">{seeker.firstName} {seeker.lastName}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Registered Email</span>
                    <span className="font-bold text-slate-900 truncate block">{seeker.email}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Educational Attainment</span>
                    <span className="font-bold text-slate-900">{seeker.educationalAttainment}</span>
                    {seeker.primaryDegree && (
                      <p className="text-[10px] text-emerald-700 mt-0.5">{seeker.primaryDegree}</p>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact Number</span>
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={e => setContactNumber(e.target.value)}
                      className="w-full mt-1 px-2 py-1 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white"
                      placeholder="e.g. 0917-123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Resume Selection */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    2. Active Resume Attachment
                  </h4>
                </div>

                {seeker.resumes.length === 0 ? (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                    <span>No resume uploaded yet.</span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigate('seeker-profile');
                      }}
                      className="px-3 py-1 bg-amber-600 text-white font-bold rounded-lg text-xs"
                    >
                      Upload Resume
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(seeker.resumes || []).map(res => (
                      <label
                        key={res.id}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedResumeId === res.id
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="resumeSelection"
                            checked={selectedResumeId === res.id}
                            onChange={() => setSelectedResumeId(res.id)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{res.fileName}</p>
                            <p className="text-[10px] text-slate-500">
                              {res.fileSize} • Uploaded {new Date(res.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            PESO Verified
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Cover Note & Availability */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  3. Note to Hiring Team & Availability
                </h4>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Earliest Availability</label>
                  <select
                    value={availability}
                    onChange={e => setAvailability(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                  >
                    <option value="Immediately (Within 1 week)">Immediately (Within 1 week)</option>
                    <option value="2 Weeks Notice">2 Weeks Notice</option>
                    <option value="1 Month Notice">1 Month Notice</option>
                    <option value="Negotiable / Specific Date">Negotiable / Specific Date</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Message to Employer <span className="font-normal text-slate-400">(Optional Cover Note)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={coverNote}
                    onChange={e => setCoverNote(e.target.value)}
                    placeholder="Briefly state why you are enthusiastic about this role and how your skills contribute to their organization in Oriental Mindoro..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Terms & Consent */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-[11px] text-indigo-950 leading-relaxed">
                    I certify that all educational credentials, employment history, and skills provided in this application are accurate and truthful under the <strong>PESO Oriental Mindoro Employment Framework</strong> and <strong>Data Privacy Act of 2012 (RA 10173)</strong>.
                  </span>
                </label>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !agreedToTerms}
                  className={`px-6 py-2.5 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                    isSubmitting || !agreedToTerms
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      <span>Dispatching Candidacy...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Candidacy Now</span>
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
