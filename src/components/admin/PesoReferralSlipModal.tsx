import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { JobSeekerProfile, JobPost, PesoReferralSlip } from '../../types';
import { 
  FileCheck, 
  Printer, 
  X, 
  Building2, 
  User, 
  Calendar, 
  Award, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface PesoReferralSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSeeker?: JobSeekerProfile | null;
  initialJobPost?: JobPost | null;
  existingSlip?: PesoReferralSlip | null;
}

export const PesoReferralSlipModal: React.FC<PesoReferralSlipModalProps> = ({
  isOpen,
  onClose,
  initialSeeker,
  initialJobPost,
  existingSlip
}) => {
  const { 
    jobSeekers, 
    jobPosts, 
    employers, 
    issueReferralSlip, 
    currentUser,
    showToast 
  } = useApp();

  const printRef = useRef<HTMLDivElement>(null);

  // Selected seeker & job
  const [selectedSeekerId, setSelectedSeekerId] = useState<string>(
    existingSlip?.jobSeekerId || initialSeeker?.id || (jobSeekers[0]?.id || '')
  );
  const [selectedJobId, setSelectedJobId] = useState<string>(
    existingSlip?.jobPostId || initialJobPost?.id || (jobPosts[0]?.id || '')
  );

  const selectedSeeker = jobSeekers.find(s => s.id === selectedSeekerId) || initialSeeker || jobSeekers[0];
  const selectedJob = jobPosts.find(j => j.id === selectedJobId) || initialJobPost || jobPosts[0];
  const targetEmployer = employers.find(e => e.id === selectedJob?.employerId);

  // Form Fields
  const generatedRefNo = existingSlip?.referralNumber || `PESO-RXS-REF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const [referralNumber, setReferralNumber] = useState(generatedRefNo);
  const [interviewDate, setInterviewDate] = useState('2026-03-12T09:00');
  const [interviewVenue, setInterviewVenue] = useState(
    targetEmployer?.address ? `${targetEmployer.address}, Roxas, Oriental Mindoro` : 'HR Office / Admin Desk'
  );
  const [officerName, setOfficerName] = useState('Hon. Roberto V. Mendoza');
  const [officerPosition, setOfficerPosition] = useState('PESO Manager / Municipal Employment Facilitator');
  const [remarks, setRemarks] = useState(
    'Applicant is advised to report in business attire with 2 copies of Resume/Bio-Data, Valid ID, and TESDA Certificates.'
  );

  if (!isOpen) return null;

  // Decision Tree match evaluation
  const isDegreeMatched = selectedSeeker?.educationalAttainment?.toLowerCase().includes('college') ||
    selectedSeeker?.educationalAttainment?.toLowerCase().includes('bachelor');
  const matchingScore = existingSlip?.matchingScore || (isDegreeMatched ? 94 : 88);
  const matchingTier = existingSlip?.matchingTier || (matchingScore >= 90 ? 'Highly Qualified' : 'Qualified');

  const handlePrint = () => {
    window.print();
  };

  const handleIssueSlip = () => {
    if (!selectedSeeker || !selectedJob || !targetEmployer) {
      showToast({
        title: 'Selection Required',
        message: 'Please select both a job seeker and a target vacancy.',
        type: 'alert'
      });
      return;
    }

    issueReferralSlip({
      referralNumber,
      dateIssued: new Date().toISOString(),
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      jobSeekerId: selectedSeeker.id,
      jobSeekerName: `${selectedSeeker.firstName} ${selectedSeeker.lastName}`,
      jobSeekerContact: selectedSeeker.contactNumber,
      jobSeekerAddress: selectedSeeker.address,
      educationalAttainment: selectedSeeker.educationalAttainment,
      educationCategory: selectedSeeker.educationCategory,
      tradeCertifications: selectedSeeker.tradeCertifications || selectedSeeker.practicalSkills,
      geographicMobility: selectedSeeker.geographicMobility,
      jobPostId: selectedJob.id,
      jobTitle: selectedJob.title,
      employerId: targetEmployer.id,
      employerName: targetEmployer.companyName,
      employerAddress: targetEmployer.address,
      authorizedContactPerson: targetEmployer.representativeName || targetEmployer.authorizedBranchManager || 'HR Manager',
      authorizedContactNumber: targetEmployer.contactNumber,
      matchingScore,
      matchingTier,
      decisionTreeRationale: `Candidate verified by PESO Roxas Decision Tree. Match tier: ${matchingTier} (${matchingScore}%). Educational qualification alignment: satisfied. Residence: ${selectedSeeker.barangay || 'Roxas'}.`,
      interviewDate: new Date(interviewDate).toISOString(),
      interviewVenue,
      issuedByOfficerName: officerName,
      issuedByOfficerPosition: officerPosition,
      status: 'issued',
      remarks
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in duration-200 flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-amber-900/40 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded uppercase tracking-wider">
                  PESO-LGU Endorsement
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">Official Referral Slip Generator</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white truncate">
                Issue PESO Referral Slip
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area: Config Sidebar + Formal Printable Document */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left Controls / Selector Column */}
          <div className="lg:col-span-4 p-4 sm:p-5 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                Referral Parameters
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Candidate Seeker</label>
                  <select
                    value={selectedSeekerId}
                    onChange={e => setSelectedSeekerId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium text-slate-900"
                  >
                    {jobSeekers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} ({s.educationCategory || s.educationalAttainment})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Vacancy & Employer</label>
                  <select
                    value={selectedJobId}
                    onChange={e => setSelectedJobId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium text-slate-900"
                  >
                    {jobPosts.filter(j => j.status === 'active').map(j => (
                      <option key={j.id} value={j.id}>
                        {j.title} — {j.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Referral Number</label>
                  <input
                    type="text"
                    value={referralNumber}
                    onChange={e => setReferralNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Appearance / Interview Date & Time</label>
                  <input
                    type="datetime-local"
                    value={interviewDate}
                    onChange={e => setInterviewDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Interview Venue</label>
                  <input
                    type="text"
                    value={interviewVenue}
                    onChange={e => setInterviewVenue(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">PESO Signing Officer</label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={e => setOfficerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Endorsement Remarks</label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleIssueSlip}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-950" />
                <span>Confirm & Issue Referral Slip</span>
              </button>
            </div>
          </div>

          {/* Right Column: Formal Printable Document Preview */}
          <div className="lg:col-span-8 p-6 bg-white overflow-y-auto">
            <div 
              ref={printRef}
              className="max-w-2xl mx-auto p-4 sm:p-8 border border-slate-300 rounded-xl bg-white shadow-xs space-y-6 text-slate-900 font-sans print:border-none print:shadow-none print:p-0"
            >
              {/* Official Municipal Letterhead */}
              <div className="text-center border-b-2 border-slate-800 pb-4 space-y-0.5">
                <p className="text-[11px] font-semibold text-slate-600 tracking-wider uppercase">
                  Republic of the Philippines • Province of Oriental Mindoro
                </p>
                <h1 className="text-base font-black text-slate-900 uppercase tracking-wide">
                  Municipality of Roxas
                </h1>
                <p className="text-xs font-bold text-amber-900 uppercase tracking-widest">
                  Public Employment Service Office (PESO)
                </p>
                <p className="text-[10px] text-slate-500 italic">
                  2nd Floor, Roxas Municipal Hall, National Highway, Roxas, Oriental Mindoro • peso@roxas.orientalmindoro.gov.ph
                </p>
              </div>

              {/* Title & Referral Number */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight uppercase">
                    Official PESO Referral Slip
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    (Employment Endorsement & Recommendation Letter)
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Referral Slip No.</span>
                  <span className="font-mono font-black text-xs text-amber-950 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    {referralNumber}
                  </span>
                </div>
              </div>

              {/* Issuance Date & Addressee */}
              <div className="text-xs space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span><strong>Date Issued:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span><strong>Validity:</strong> 15 Calendar Days</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">To Employer:</span>
                  <p className="font-black text-sm text-slate-900">{targetEmployer?.companyName || selectedJob?.companyName}</p>
                  <p className="text-slate-600">
                    Attention: <strong>{targetEmployer?.representativeName || targetEmployer?.authorizedBranchManager || 'Branch HR / Recruitment In-Charge'}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    {targetEmployer?.address || selectedJob?.workLocation}, Roxas, Oriental Mindoro
                  </p>
                </div>
              </div>

              {/* Endorsement Statement */}
              <div className="text-xs text-slate-700 leading-relaxed space-y-2">
                <p>
                  Greetings from PESO-LGU Roxas!
                </p>
                <p>
                  In accordance with RA 8759 (Public Employment Service Office Act), we are officially endorsing the qualified job seeker named below for the active vacancy of <strong className="text-slate-900 font-bold underline decoration-amber-500 decoration-2">{selectedJob?.title}</strong> in your establishment.
                </p>
              </div>

              {/* Candidate Credentials Box */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Candidate Full Name</span>
                    <p className="font-black text-sm text-slate-900">
                      {selectedSeeker?.firstName} {selectedSeeker?.middleName ? selectedSeeker.middleName + ' ' : ''}{selectedSeeker?.lastName}
                    </p>
                  </div>

                  <span className="text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded shrink-0">
                    Decision Tree: {matchingTier} ({matchingScore}%)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact Number</span>
                    <span className="font-mono font-bold text-slate-900">{selectedSeeker?.contactNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Residential Address</span>
                    <span className="font-medium text-slate-800">{selectedSeeker?.address}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Educational Background</span>
                    <span className="font-bold text-slate-800">{selectedSeeker?.educationalAttainment}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">TESDA / Practical Skills</span>
                    <span className="font-medium text-slate-800">
                      {(selectedSeeker?.tradeCertifications && selectedSeeker.tradeCertifications.length > 0)
                        ? selectedSeeker.tradeCertifications.join(', ')
                        : (selectedSeeker?.practicalSkills?.join(', ') || 'General capabilities verified')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scheduled Appearance */}
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-300 text-xs space-y-1">
                <span className="text-[10px] font-bold text-amber-900 uppercase block">
                  Scheduled Interview / Appearance Notice
                </span>
                <p className="font-bold text-slate-900">
                  Date & Time: <span className="text-amber-950 font-black">{new Date(interviewDate).toLocaleString()}</span>
                </p>
                <p className="text-slate-700">
                  Venue: <strong>{interviewVenue}</strong>
                </p>
                <p className="text-[11px] text-slate-600 italic mt-1">
                  Note: {remarks}
                </p>
              </div>

              {/* Employer Feedback Slip (Perforated cut-off section) */}
              <div className="border-t-2 border-dashed border-slate-300 pt-3 space-y-2 text-[11px]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-slate-500 font-mono text-[10px] gap-1">
                  <span>--- [CUT HERE & RETURN TO PESO ROXAS AFTER INTERVIEW] ---</span>
                  <span>REF: {referralNumber}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="border border-slate-200 p-2 rounded text-center">
                    <span className="block font-bold">[ &nbsp; ] HIRED</span>
                    <span className="text-[9px] text-slate-400">Regular / Contractual</span>
                  </div>
                  <div className="border border-slate-200 p-2 rounded text-center">
                    <span className="block font-bold text-amber-900">[ &nbsp; ] HIRED-ON-THE-SPOT</span>
                    <span className="text-[9px] text-slate-400">Immediate Placement</span>
                  </div>
                  <div className="border border-slate-200 p-2 rounded text-center">
                    <span className="block font-bold">[ &nbsp; ] NOT HIRED</span>
                    <span className="text-[9px] text-slate-400">Specify reason below</span>
                  </div>
                </div>
              </div>

              {/* Sign-off / Signature Block */}
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 italic">Official Seal of PESO-LGU Roxas</p>
                  <div className="w-16 h-16 rounded-full border-2 border-amber-700/30 flex items-center justify-center text-[9px] font-bold text-amber-900 text-center uppercase p-1 mt-1">
                    PESO ROXAS SEAL
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-signature text-base text-slate-800 font-bold">
                    {officerName}
                  </div>
                  <div className="w-48 border-t border-slate-800 ml-auto pt-1">
                    <p className="font-bold text-slate-900 text-xs">{officerName}</p>
                    <p className="text-[10px] text-slate-500">{officerPosition}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
