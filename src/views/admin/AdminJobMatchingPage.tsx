import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { JobSeekerProfile, JobPost, PesoReferralSlip } from '../../types';
import { PesoReferralSlipModal } from '../../components/admin/PesoReferralSlipModal';
import { 
  GitPullRequest, 
  Sparkles, 
  FileCheck, 
  AlertTriangle, 
  Search, 
  Filter, 
  Building2, 
  GraduationCap, 
  Wrench, 
  MapPin, 
  Award, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Compass, 
  Send,
  Eye
} from 'lucide-react';

interface AdminJobMatchingPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const AdminJobMatchingPage: React.FC<AdminJobMatchingPageProps> = ({ onNavigate }) => {
  const { 
    jobPosts, 
    jobSeekers, 
    employers, 
    referralSlips, 
    updateReferralSlipStatus,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'matching' | 'referrals'>('matching');
  const [selectedJobId, setSelectedJobId] = useState<string>(
    jobPosts.find(j => j.status === 'active')?.id || jobPosts[0]?.id || ''
  );
  const [tierFilter, setTierFilter] = useState<'all' | 'highly' | 'qualified' | 'partial'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Referral Modal State
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [modalSeeker, setModalSeeker] = useState<JobSeekerProfile | null>(null);
  const [modalJob, setModalJob] = useState<JobPost | null>(null);
  const [viewSlip, setViewSlip] = useState<PesoReferralSlip | null>(null);

  const selectedJob = jobPosts.find(j => j.id === selectedJobId);
  const activeJobs = jobPosts.filter(j => j.status === 'active');

  // Decision Tree Engine per Job Seeker for the selected vacancy
  const scoredCandidates = useMemo(() => {
    if (!selectedJob) return [];

    return jobSeekers.map(seeker => {
      let score = 0;
      const breakdowns: { criterion: string; weight: number; points: number; note: string }[] = [];

      // 1. Education Criteria (25 pts)
      let eduPoints = 15;
      let eduNote = 'Basic education satisfied';
      const reqEdu = (selectedJob.educationalRequirement || selectedJob.minimumEducation || '').toLowerCase();
      const seekerEdu = (seeker.educationalAttainment || seeker.educationCategory || '').toLowerCase();

      if (reqEdu.includes('college') || reqEdu.includes('bachelor')) {
        if (seekerEdu.includes('college') || seekerEdu.includes('bachelor') || seeker.educationCategory === 'College Graduate') {
          eduPoints = 25;
          eduNote = 'Degree completely matched (College Graduate)';
        } else {
          eduPoints = 10;
          eduNote = 'Degree requirement not fully met';
        }
      } else if (reqEdu.includes('high school') || reqEdu.includes('senior')) {
        if (seekerEdu.includes('high school') || seekerEdu.includes('college') || seeker.educationCategory !== 'Out-of-School Youth') {
          eduPoints = 25;
          eduNote = 'High school qualification matched';
        } else {
          eduPoints = 15;
          eduNote = 'Secondary level equivalent';
        }
      } else {
        eduPoints = 25;
        eduNote = 'No strict educational barrier';
      }
      score += eduPoints;
      breakdowns.push({ criterion: 'Educational Attainment', weight: 25, points: eduPoints, note: eduNote });

      // 2. Practical Skills & TESDA Certifications (35 pts)
      let skillPoints = 15;
      const jobSkills = (selectedJob.skills || []).map(s => s.toLowerCase());
      const seekerSkills = [
        ...(seeker.technicalSkills || []),
        ...(seeker.practicalSkills || []),
        ...(seeker.tradeSkills || []),
        ...(seeker.tradeCertifications || [])
      ].map(s => s.toLowerCase());

      const matchedSkills = jobSkills.filter(js => seekerSkills.some(ss => ss.includes(js) || js.includes(ss)));
      const hasTesda = (seeker.tradeCertifications && seeker.tradeCertifications.length > 0);

      if (matchedSkills.length >= 3 || (matchedSkills.length >= 1 && hasTesda)) {
        skillPoints = 35;
      } else if (matchedSkills.length >= 1 || hasTesda) {
        skillPoints = 25;
      } else {
        skillPoints = 12;
      }
      score += skillPoints;
      breakdowns.push({ 
        criterion: 'Skills & Trade Certifications', 
        weight: 35, 
        points: skillPoints, 
        note: `${matchedSkills.length} skills aligned${hasTesda ? ' + TESDA NC Certified' : ''}` 
      });

      // 3. Location & Proximity (20 pts)
      let locPoints = 10;
      const jobLoc = (selectedJob.workLocation || selectedJob.municipality || 'Roxas').toLowerCase();
      const seekerLoc = (seeker.municipality || 'Roxas').toLowerCase();
      const isSameMuni = jobLoc.includes(seekerLoc) || seekerLoc.includes(jobLoc) || seeker.municipality === 'Roxas';

      if (isSameMuni) {
        locPoints = 20;
      } else if (seeker.geographicMobility === 'provincial' || seeker.geographicMobility === 'willing_to_relocate') {
        locPoints = 18;
      } else {
        locPoints = 8;
      }
      score += locPoints;
      breakdowns.push({ 
        criterion: 'Geographic Proximity & Mobility', 
        weight: 20, 
        points: locPoints, 
        note: isSameMuni ? 'Residing in Roxas (Immediate proximity)' : `Mobility: ${seeker.geographicMobility}` 
      });

      // 4. Experience & Work Readiness (20 pts)
      let expPoints = 12;
      const expCount = (seeker.workExperience || []).length;
      if (expCount >= 2) {
        expPoints = 20;
      } else if (expCount === 1 || seeker.employmentStatus === 'employed') {
        expPoints = 16;
      } else {
        expPoints = 12;
      }
      score += expPoints;
      breakdowns.push({ 
        criterion: 'Work History & Readiness', 
        weight: 20, 
        points: expPoints, 
        note: expCount > 0 ? `${expCount} previous work engagement(s)` : 'Entry-level candidate' 
      });

      // Categorize Tier
      let tier: 'Highly Qualified' | 'Qualified' | 'Partially Qualified' | 'Underqualified' = 'Underqualified';
      if (score >= 90) tier = 'Highly Qualified';
      else if (score >= 75) tier = 'Qualified';
      else if (score >= 50) tier = 'Partially Qualified';

      return {
        seeker,
        score,
        tier,
        breakdowns,
        hasIssuedReferral: referralSlips.some(
          r => r.jobSeekerId === seeker.id && r.jobPostId === selectedJob.id && r.status !== 'declined'
        )
      };
    }).sort((a, b) => b.score - a.score);
  }, [selectedJob, jobSeekers, referralSlips]);

  // Filtered by tier and search
  const filteredCandidates = useMemo(() => {
    return scoredCandidates.filter(item => {
      const name = `${item.seeker.firstName} ${item.seeker.lastName}`.toLowerCase();
      const skills = (item.seeker.practicalSkills || []).join(' ').toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase()) || skills.includes(searchQuery.toLowerCase());
      
      let matchesTier = true;
      if (tierFilter === 'highly') matchesTier = item.tier === 'Highly Qualified';
      if (tierFilter === 'qualified') matchesTier = item.tier === 'Qualified' || item.tier === 'Highly Qualified';
      if (tierFilter === 'partial') matchesTier = item.tier === 'Partially Qualified';

      return matchesSearch && matchesTier;
    });
  }, [scoredCandidates, searchQuery, tierFilter]);

  // Talent Shortage Alert evaluation
  const highlyQualifiedCount = scoredCandidates.filter(c => c.tier === 'Highly Qualified').length;
  const qualifiedCount = scoredCandidates.filter(c => c.tier === 'Qualified').length;
  const totalQualified = highlyQualifiedCount + qualifiedCount;
  const vacancyOpenings = selectedJob?.openingsCount || 1;
  const isTalentShortage = totalQualified < vacancyOpenings;

  const handleOpenReferralForSeeker = (seeker: JobSeekerProfile) => {
    setModalSeeker(seeker);
    setModalJob(selectedJob || null);
    setViewSlip(null);
    setIsReferralModalOpen(true);
  };

  const handleViewReferralSlip = (slip: PesoReferralSlip) => {
    setViewSlip(slip);
    setIsReferralModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded uppercase">
              PESO-LGU Matchmaking
            </span>
            <span className="text-xs text-slate-500 font-semibold">Decision Tree Engine & Referral Slips</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Automated Job Matching & Endorsement Slips
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate workforce skills, education, and proximity against municipal vacancies to issue official PESO Referral Slips.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('matching')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'matching' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitPullRequest className="w-4 h-4" />
            <span>Decision Tree Matching</span>
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'referrals' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Issued Referral Slips ({referralSlips.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'matching' ? (
        activeJobs.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
            <GitPullRequest className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Job Vacancies Available to Match</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are currently no active job vacancies in the system. Once local employers register and post job openings, you can evaluate applicant suitability and issue official Referral Slips here.
            </p>
          </div>
        ) : (
        <div className="space-y-6">
          
          {/* Vacancy Selector & Criteria Ribbon */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="w-full sm:w-80">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Select Target Vacancy to Match
                </label>
                <select
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                >
                  {activeJobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title} — {job.companyName} ({job.openingsCount || 1} open)
                    </option>
                  ))}
                </select>
              </div>

              {selectedJob && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                    <span className="text-[10px] text-slate-400 block uppercase">Employer</span>
                    <strong className="text-slate-900">{selectedJob.companyName}</strong>
                  </div>
                  <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                    <span className="text-[10px] text-slate-400 block uppercase">Required Education</span>
                    <strong className="text-slate-900">{selectedJob.educationalRequirement || selectedJob.minimumEducation || 'High School / Any'}</strong>
                  </div>
                  <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                    <span className="text-[10px] text-slate-400 block uppercase">Slots Available</span>
                    <strong className="text-amber-900">{selectedJob.openingsCount || 1} Openings</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Talent Shortage Alert Banner */}
            {isTalentShortage && selectedJob && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-amber-950">
                  <div className="flex items-center gap-2">
                    <strong className="font-bold text-amber-900 uppercase tracking-wide text-[11px]">
                      PESO Talent Shortage Alert Triggered
                    </strong>
                    <span className="px-2 py-0.5 bg-amber-200/80 rounded text-[10px] font-bold text-amber-950">
                      Demand: {vacancyOpenings} slots vs Qualified Talent: {totalQualified}
                    </span>
                  </div>
                  <p className="leading-relaxed">
                    The requested vacancies for <strong>{selectedJob.title}</strong> at {selectedJob.companyName} exceed the currently verified qualified candidates in the Roxas local registry.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 font-semibold text-[11px]">
                    <button
                      onClick={() => onNavigate('admin-lra')}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                    >
                      Schedule Local Recruitment Activity (LRA)
                    </button>
                    <button
                      onClick={() => showToast({ title: 'TESDA Referral Triggered', message: 'Notification queued to TESDA Oriental Mindoro for upskilling batch in ' + (selectedJob.skills?.[0] || 'Technical Skills'), type: 'info' })}
                      className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 rounded-lg transition-colors"
                    >
                      Endorse to TESDA Skills Training
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filtering & Search Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search candidates by name, trade skills, or TESDA certifications..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Tier:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'all', label: 'All Tiers' },
                  { id: 'highly', label: '≥ 90% Highly Qualified' },
                  { id: 'qualified', label: '≥ 75% Qualified' },
                  { id: 'partial', label: '50-74% Partial' }
                ].map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => setTierFilter(tier.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                      tierFilter === tier.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Decision Tree Candidates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCandidates.map(({ seeker, score, tier, breakdowns, hasIssuedReferral }) => (
              <div
                key={seeker.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 hover:border-amber-400 transition-all relative overflow-hidden"
              >
                {/* Score Indicator Badge */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        tier === 'Highly Qualified' 
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : tier === 'Qualified'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {tier}
                      </span>
                      {seeker.isWalkIn && (
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[9px] font-bold">
                          Walk-In Bio-Data
                        </span>
                      )}
                      {hasIssuedReferral && (
                        <span className="px-1.5 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded text-[9px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-purple-600" />
                          Slip Issued
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {seeker.firstName} {seeker.lastName}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {seeker.educationCategory || seeker.educationalAttainment} • Brgy. {seeker.barangay || 'Bagumbayan'}, Roxas
                    </p>
                  </div>

                  {/* Circular / Big Match Score */}
                  <div className="text-right">
                    <div className={`text-2xl font-black ${
                      score >= 90 ? 'text-emerald-700' : score >= 75 ? 'text-blue-700' : 'text-amber-700'
                    }`}>
                      {score}%
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Match Score</span>
                  </div>
                </div>

                {/* Skills & Certs Chips */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Verified Capabilities & Certifications
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(seeker.tradeCertifications || []).map(cert => (
                      <span key={cert} className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[10px] font-bold flex items-center gap-1">
                        <Award className="w-3 h-3 text-blue-600" />
                        {cert}
                      </span>
                    ))}
                    {(seeker.practicalSkills || seeker.tradeSkills || seeker.technicalSkills.slice(0, 3)).map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Decision Tree Breakdown Matrix */}
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-1.5 text-[11px]">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Decision Tree Criteria Breakdown
                  </span>
                  <div className="space-y-1">
                    {breakdowns.map((b, i) => (
                      <div key={i} className="flex items-center justify-between text-slate-700">
                        <span className="truncate pr-2">{b.criterion}:</span>
                        <div className="flex items-center gap-2 shrink-0 font-mono">
                          <span className="text-[10px] text-slate-500">{b.note}</span>
                          <span className="font-bold text-slate-900 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                            {b.points}/{b.weight}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 text-[11px] font-mono">
                    Tel: {seeker.contactNumber}
                  </span>

                  <button
                    onClick={() => handleOpenReferralForSeeker(seeker)}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 text-xs"
                  >
                    <FileCheck className="w-4 h-4 text-amber-950" />
                    <span>Generate Referral Slip</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCandidates.length === 0 && (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-900">No matching candidates in this tier</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try broadening your tier filter or encoding additional walk-in applicants with required skills.
              </p>
            </div>
          )}

        </div>
        )
      ) : (
        /* Referral Slips Management Tab */
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">
              Official PESO Endorsements Log ({referralSlips.length} Total Issued)
            </h2>
            <button
              onClick={() => {
                setModalSeeker(null);
                setModalJob(null);
                setViewSlip(null);
                setIsReferralModalOpen(true);
              }}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4" />
              <span>Issue New Referral Slip</span>
            </button>
          </div>

          <div className="space-y-3">
            {referralSlips.map(slip => (
              <div
                key={slip.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-amber-100 text-amber-950 px-2 py-0.5 rounded border border-amber-300">
                      {slip.referralNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      slip.status === 'hired' || slip.status === 'hired_on_the_spot'
                        ? 'bg-emerald-100 text-emerald-900'
                        : slip.status === 'interviewed'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-amber-50 text-amber-800'
                    }`}>
                      Status: {slip.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Issued: {new Date(slip.dateIssued).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-sm">
                    {slip.jobSeekerName} → <span className="text-amber-900">{slip.jobTitle}</span> at {slip.employerName}
                  </h3>

                  <p className="text-slate-500 text-[11px]">
                    Decision Tree: {slip.matchingTier} ({slip.matchingScore}%) • Scheduled: {new Date(slip.interviewDate).toLocaleString()}
                  </p>
                </div>

                {/* Status Update Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleViewReferralSlip(slip)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View / Print</span>
                  </button>

                  <select
                    value={slip.status}
                    onChange={e => updateReferralSlipStatus(slip.id, e.target.value as any, 'Status updated by PESO officer.')}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="issued">Issued / Pending Appearance</option>
                    <option value="presented_to_employer">Presented to Employer</option>
                    <option value="interviewed">Interviewed</option>
                    <option value="hired">Hired (Regular/Probationary)</option>
                    <option value="hired_on_the_spot">Hired-on-the-Spot (HOTS)</option>
                    <option value="declined">Declined / Not Hired</option>
                  </select>
                </div>
              </div>
            ))}

            {referralSlips.length === 0 && (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500">No referral slips issued yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Referral Slip Generator Modal */}
      {isReferralModalOpen && (
        <PesoReferralSlipModal
          isOpen={isReferralModalOpen}
          onClose={() => setIsReferralModalOpen(false)}
          initialSeeker={modalSeeker}
          initialJobPost={modalJob}
          existingSlip={viewSlip}
        />
      )}

    </div>
  );
};
