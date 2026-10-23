import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  FileUp, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Check, 
  Upload,
  Send,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface ApplyForJobWindowProps {
  job: {
    id: string;
    title: string;
    companyName: string;
    location: string;
    salary: string;
    type: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyForJobWindow: React.FC<ApplyForJobWindowProps> = ({
  job,
  onClose,
  onSuccess
}) => {
  const { currentSeekerProfile, applyForJob, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-filled from profile
  const [fullName, setFullName] = useState(
    currentSeekerProfile 
      ? `${currentSeekerProfile.firstName} ${currentSeekerProfile.lastName}`.trim() 
      : 'John Doe'
  );
  const [email, setEmail] = useState(currentSeekerProfile?.email || 'example@gmail.com');
  const [phone, setPhone] = useState(currentSeekerProfile?.contactNumber || '0917-123-4567');
  
  // Auto-attached resume from profile
  const profileResume = currentSeekerProfile?.resumes?.find(r => r.id === currentSeekerProfile?.activeResumeId) ||
    currentSeekerProfile?.resumes?.[0] || {
      id: 'res-default',
      fileName: currentSeekerProfile ? `${currentSeekerProfile.firstName}_${currentSeekerProfile.lastName}_Resume.pdf` : 'My_Updated_Resume.pdf',
      fileSize: '340 KB',
      fileType: 'pdf' as const,
      uploadedAt: new Date().toISOString(),
      validationStatus: 'validated' as const,
      extractedSkills: currentSeekerProfile?.technicalSkills || [],
      extractedEducation: currentSeekerProfile?.educationalAttainment || "Bachelor's Degree",
      extractedDegree: currentSeekerProfile?.primaryDegree || '',
      extractedExperienceYears: 1
    };

  const [attachedResume, setAttachedResume] = useState<{
    id: string;
    fileName: string;
    fileSize: string;
    isCustomUpload?: boolean;
  }>(profileResume);

  // Add Text / Cover Note & Availability
  const [coverNote, setCoverNote] = useState('');
  const [availability, setAvailability] = useState('Immediately Available');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Quick chip templates to insert into cover note
  const quickChips = [
    'Available immediately in Roxas',
    'Resident of Oriental Mindoro',
    'With relevant experience',
    'Ready for on-site / technical interview'
  ];

  const handleAddChip = (chip: string) => {
    if (coverNote.includes(chip)) return;
    setCoverNote(prev => prev ? `${prev}. ${chip}` : chip);
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;
      
      setAttachedResume({
        id: `res-upload-${Date.now()}`,
        fileName: file.name,
        fileSize: sizeStr,
        isCustomUpload: true
      });

      showToast({
        title: 'New Resume Attached',
        message: `"${file.name}" was successfully attached to this application.`,
        type: 'success'
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!currentSeekerProfile) {
      showToast({
        title: 'Authentication Required',
        message: 'Please log in as a job seeker to submit your application.',
        type: 'alert'
      });
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      applyForJob(
        job.id,
        currentSeekerProfile.id,
        attachedResume.id || currentSeekerProfile.activeResumeId || 'res-1'
      );

      setIsSubmitting(false);
      setShowCongratulations(true);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-24 md:pb-12 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden animate-in fade-in duration-150">
      
      {/* Centered App Container (Matches image.png) */}
      <div className="max-w-md sm:max-w-lg mx-auto px-4 pt-4 sm:pt-6 space-y-6">

        {/* 1. TOP HEADER (Circular back button + Centered "Apply for Job" title) */}
        <div className="flex items-center justify-between py-1">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer active:scale-95"
            title="Back to Job Offer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>

          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight text-center">
            Apply for Job
          </h1>

          {/* Symmetrical placeholder for clean balance */}
          <div className="w-10 h-10" />
        </div>

        {/* Vacancy Target Subtitle Badge */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/70 flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-slate-900">{job.title}</p>
            <p className="text-[11px] text-slate-500">{job.companyName} • {job.location}</p>
          </div>
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
            {job.salary}
          </span>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* FORM FIELDS (Matches image.png structure) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Field 1: Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-slate-800 block">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-[#f8f9fa] border border-slate-200/80 rounded-2xl px-4 py-3.5 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2331ea] focus:bg-white transition-all"
            />
          </div>

          {/* Field 2: Email */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-slate-800 block">
              Email
            </label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#f8f9fa] border border-slate-200/80 rounded-2xl px-4 py-3.5 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2331ea] focus:bg-white transition-all"
            />
          </div>

          {/* Field 3: Contact Number */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-slate-800 block">
              Contact Number
            </label>
            <input
              type="tel"
              placeholder="0917-123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-slate-200/80 rounded-2xl px-4 py-3.5 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2331ea] focus:bg-white transition-all"
            />
          </div>

          {/* Field 4: Upload CV/Resume (Matches image.png with Auto-Attach capability) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-slate-800 block">
                Upload CV/Resume
              </label>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ Auto-attached from profile
              </span>
            </div>

            {/* Hidden Native File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCustomFileUpload}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />

            {/* Upload / Attached Box (Exact visual match with image.png) */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-[#f8f9fa] hover:bg-slate-100/70 border border-slate-200/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group relative overflow-hidden"
            >
              {/* Blue File Icon (Matches image.png blue icon) */}
              <div className="w-12 h-12 rounded-2xl bg-[#2331ea] text-white flex items-center justify-center shadow-md mb-2.5 group-hover:scale-105 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M12 18v-6" />
                  <path d="m9 15 3-3 3 3" />
                </svg>
              </div>

              {/* File Info */}
              <p className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                {attachedResume.fileName}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {attachedResume.fileSize} • {attachedResume.isCustomUpload ? 'Custom upload attached' : 'Pre-loaded from profile'}
              </p>

              {/* Action Hint */}
              <span className="text-[11px] font-semibold text-[#2331ea] group-hover:underline mt-2">
                Click to Browse or Replace File
              </span>
            </div>
          </div>

          {/* Field 5: Availability (Commonly needed in quick applying) */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs sm:text-sm font-semibold text-slate-800 block">
              Earliest Availability
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                'Immediately Available',
                'Within 1 Week',
                'Within 2 Weeks',
                'Negotiable'
              ].map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setAvailability(slot)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer text-center ${
                    availability === slot
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-[#f8f9fa] text-slate-600 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Field 6: Add Text (Matches image.png with quick helpers) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-slate-800 block">
                Add Text
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Cover Note / Message (Optional)
              </span>
            </div>

            {/* Quick Helper Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pb-1">
              {quickChips.map((chip) => (
                <button
                  type="button"
                  key={chip}
                  onClick={() => handleAddChip(chip)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-600 text-[10px] font-medium transition-colors cursor-pointer"
                >
                  + {chip}
                </button>
              ))}
            </div>

            {/* Textarea (Matches image.png placeholder) */}
            <textarea
              rows={4}
              placeholder="Write Something here.. (e.g. Brief introduction, key skills, why you are interested in this position)"
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-slate-200/80 rounded-2xl p-4 text-xs sm:text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2331ea] focus:bg-white transition-all resize-none min-h-[130px]"
            />
          </div>

          {/* 3. SUBMIT BUTTON (Matches image.png blue pill button) */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#2331ea] hover:bg-[#1a25c7] active:scale-[0.99] text-white font-bold text-base rounded-full shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4.5 h-4.5" />
              <span>{isSubmitting ? 'Submitting Application...' : 'Submit'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center pt-1 font-medium">
            Your application and profile will be reviewed by {job.companyName} and PESO Roxas.
          </p>

        </form>

      </div>

      {/* CONGRATULATIONS MODAL (Exact match to image.png) */}
      {showCongratulations && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-4 border border-slate-100">
            {/* Big Blue Checkmark Icon */}
            <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-blue-600/30">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Congratulations!
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed px-2">
                Your application has been successfully sent. You can check your application on the apply profile.
              </p>
            </div>

            {/* Action Buttons matching design */}
            <div className="space-y-2 pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowCongratulations(false);
                  onSuccess();
                }}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-[0.99]"
              >
                Go to My Application
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCongratulations(false);
                  onClose();
                }}
                className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

