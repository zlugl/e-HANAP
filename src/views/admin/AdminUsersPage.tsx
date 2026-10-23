import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ORIENTAL_MINDORO_MUNICIPALITIES } from '../../data/mockData';
import { EncodeWalkInModal } from '../../components/admin/EncodeWalkInModal';
import { WalkInAssessmentModal } from '../../components/admin/WalkInAssessmentModal';
import { PesoReferralSlipModal } from '../../components/admin/PesoReferralSlipModal';
import { JobSeekerProfile } from '../../types';
import { 
  Users, 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  MapPin, 
  GraduationCap, 
  Mail, 
  Phone, 
  FileText, 
  Calendar,
  Briefcase,
  CheckCircle2,
  UserPlus,
  Compass,
  Award,
  Wrench,
  Flame,
  FileCheck
} from 'lucide-react';

interface AdminUsersPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ onNavigate }) => {
  const { jobSeekers, employers, applications, jobPosts } = useApp();

  const [activeTab, setActiveTab] = useState<'seekers' | 'employers'>('seekers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  
  // Specific Demographic Filters for PESO-LGU
  const [educationFilter, setEducationFilter] = useState<'all' | 'College Graduate' | 'High School Graduate' | 'Out-of-School Youth'>('all');
  const [registrationFilter, setRegistrationFilter] = useState<'all' | 'walk_in' | 'online'>('all');
  const [mobilityFilter, setMobilityFilter] = useState<'all' | 'local_only' | 'provincial' | 'willing_to_relocate'>('all');
  
  // Employer Classification Filter
  const [employerTypeFilter, setEmployerTypeFilter] = useState<'all' | 'established_local' | 'new_external'>('all');

  // Modals state
  const [isEncodeModalOpen, setIsEncodeModalOpen] = useState(false);
  const [assessingSeeker, setAssessingSeeker] = useState<JobSeekerProfile | null>(null);
  const [referralSeeker, setReferralSeeker] = useState<JobSeekerProfile | null>(null);

  const filteredSeekers = jobSeekers.filter(s => {
    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
    const skills = [
      ...(s.technicalSkills || []),
      ...(s.practicalSkills || []),
      ...(s.tradeSkills || []),
      ...(s.tradeCertifications || [])
    ].join(' ').toLowerCase();
    const degree = (s.primaryDegree || s.educationalAttainment || '').toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || skills.includes(searchQuery.toLowerCase()) || degree.includes(searchQuery.toLowerCase());
    const matchesMuni = !selectedMunicipality || s.municipality === selectedMunicipality;
    
    const matchesEdu = educationFilter === 'all' || 
      s.educationCategory === educationFilter || 
      (educationFilter === 'College Graduate' && (s.educationalAttainment.toLowerCase().includes('college') || s.educationalAttainment.toLowerCase().includes('bachelor'))) ||
      (educationFilter === 'High School Graduate' && s.educationalAttainment.toLowerCase().includes('high school')) ||
      (educationFilter === 'Out-of-School Youth' && s.educationCategory === 'Out-of-School Youth');

    const matchesReg = registrationFilter === 'all' ||
      (registrationFilter === 'walk_in' && s.isWalkIn) ||
      (registrationFilter === 'online' && !s.isWalkIn);

    const matchesMobility = mobilityFilter === 'all' || s.geographicMobility === mobilityFilter;

    return matchesSearch && matchesMuni && matchesEdu && matchesReg && matchesMobility;
  });

  const filteredEmployers = employers.filter(e => {
    const name = e.companyName.toLowerCase();
    const ind = e.industry.toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || ind.includes(searchQuery.toLowerCase());
    const matchesMuni = !selectedMunicipality || e.municipality === selectedMunicipality;

    const isEstablished = e.isEstablishedLocal || ['Retail / Supermarket', 'Food & Beverage', 'Utilities / Electric Cooperative', 'Agriculture & Trading'].includes(e.industry);
    const matchesType = employerTypeFilter === 'all' ||
      (employerTypeFilter === 'established_local' && isEstablished) ||
      (employerTypeFilter === 'new_external' && !isEstablished);

    return matchesSearch && matchesMuni && matchesType;
  });

  // Demographics counts for summary
  const collegeGradCount = jobSeekers.filter(s => s.educationCategory === 'College Graduate' || s.educationalAttainment.toLowerCase().includes('bachelor')).length;
  const hsGradCount = jobSeekers.filter(s => s.educationCategory === 'High School Graduate' || s.educationalAttainment.toLowerCase().includes('high school')).length;
  const osyCount = jobSeekers.filter(s => s.educationCategory === 'Out-of-School Youth').length;
  const walkInCount = jobSeekers.filter(s => s.isWalkIn).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded uppercase">
              PESO/LGU ROXAS
            </span>
            <span className="text-xs text-slate-500 font-semibold">Demographics & Workforce Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Job Seekers Registry & Business Establishments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain local employment registry: College graduates, High school graduates, Out-of-School Youth (OSY), and Walk-In applicants.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEncodeModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs"
          >
            <UserPlus className="w-4 h-4 text-amber-950" />
            <span>+ Encode Walk-In Bio-Data</span>
          </button>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('seekers')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'seekers' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Job Seekers ({jobSeekers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('employers')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'employers' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Employers ({employers.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demographics Overview Counters (PESO Standard Metric Banner) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">College Graduates</span>
          <p className="text-xl font-black text-slate-900 mt-0.5">{collegeGradCount}</p>
          <span className="text-[10px] text-slate-500">Degree holders & professionals</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">High School / K-12</span>
          <p className="text-xl font-black text-slate-900 mt-0.5">{hsGradCount}</p>
          <span className="text-[10px] text-slate-500">Entry-level & retail readiness</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Out-of-School Youth</span>
          <p className="text-xl font-black text-amber-700 mt-0.5">{osyCount}</p>
          <span className="text-[10px] text-amber-800 font-semibold">Priority TVET/LRA target</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Walk-In Physical Bio-Data</span>
          <p className="text-xl font-black text-blue-700 mt-0.5">{walkInCount}</p>
          <span className="text-[10px] text-blue-800 font-semibold">Encoded by PESO personnel</span>
        </div>
      </div>

      {/* Search & Multifaceted Filtering Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={activeTab === 'seekers' ? 'Search seeker by name, TESDA certification, or trade capability...' : 'Search employer by company name, industry...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900"
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedMunicipality}
              onChange={e => setSelectedMunicipality(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 text-slate-800 font-medium"
            >
              <option value="">All Municipalities (15)</option>
              {ORIENTAL_MINDORO_MUNICIPALITIES.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Specialized Filters based on tab */}
        {activeTab === 'seekers' ? (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Demographics:</span>
            
            {/* Education Filter */}
            <select
              value={educationFilter}
              onChange={e => setEducationFilter(e.target.value as any)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="all">All Education Levels</option>
              <option value="College Graduate">College Graduate</option>
              <option value="High School Graduate">High School Graduate</option>
              <option value="Out-of-School Youth">Out-of-School Youth (OSY)</option>
            </select>

            {/* Registration Type */}
            <select
              value={registrationFilter}
              onChange={e => setRegistrationFilter(e.target.value as any)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="all">All Registration Modes</option>
              <option value="walk_in">Walk-In Bio-Data</option>
              <option value="online">Online Registered</option>
            </select>

            {/* Mobility Filter */}
            <select
              value={mobilityFilter}
              onChange={e => setMobilityFilter(e.target.value as any)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="all">All Geographic Mobility</option>
              <option value="local_only">Local Roxas Only</option>
              <option value="provincial">Provincial Mobility</option>
              <option value="willing_to_relocate">Willing to Relocate (LRA)</option>
            </select>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Classification:</span>
            <button
              onClick={() => setEmployerTypeFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                employerTypeFilter === 'all' ? 'bg-amber-100 text-amber-950' : 'bg-slate-50 text-slate-600'
              }`}
            >
              All Establishments ({employers.length})
            </button>
            <button
              onClick={() => setEmployerTypeFilter('established_local')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                employerTypeFilter === 'established_local' ? 'bg-amber-100 text-amber-950' : 'bg-slate-50 text-slate-600'
              }`}
            >
              Established Local (Puregold, Jollibee, ORMECO, Dealers)
            </button>
            <button
              onClick={() => setEmployerTypeFilter('new_external')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                employerTypeFilter === 'new_external' ? 'bg-amber-100 text-amber-950' : 'bg-slate-50 text-slate-600'
              }`}
            >
              New & External Employers
            </button>
          </div>
        )}
      </div>

      {/* Content Feed */}
      {activeTab === 'seekers' ? (
        filteredSeekers.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Job Seekers Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No registered workforce members match your specified demographic, mobility, or search filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSeekers.map(seeker => {
              const seekerApps = applications.filter(a => a.jobSeekerId === seeker.id);
              const hiredApp = seekerApps.find(a => a.currentStatus === 'hired');
              const isHots = seeker.employmentStatus === 'hired' && seeker.walkInAssessmentNotes?.includes('HOTS');

              return (
                <div key={seeker.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5 flex flex-col justify-between hover:border-amber-400 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={seeker.profilePicture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                        alt={seeker.firstName}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {seeker.firstName} {seeker.lastName}
                          </h3>
                          {isHots ? (
                            <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-300 uppercase flex items-center gap-0.5">
                              <Flame className="w-3 h-3 text-emerald-600" /> HOTS
                            </span>
                          ) : hiredApp ? (
                            <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-300 uppercase">
                              Hired
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              Active Seeker
                            </span>
                          )}
                        </div>

                        {/* Origin & Registration Badges */}
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                            seeker.isWalkIn ? 'bg-amber-100 text-amber-900' : 'bg-blue-50 text-blue-800'
                          }`}>
                            {seeker.isWalkIn ? 'Walk-In Bio-Data' : 'Online'}
                          </span>
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                            {seeker.educationCategory || seeker.educationalAttainment}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {seeker.barangay ? `Brgy. ${seeker.barangay}, ` : ''}{seeker.municipality}
                        </p>
                      </div>
                    </div>

                    {/* Educational Attainment */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-bold uppercase">Attainment & Course:</span>
                        <span className="text-[10px] text-slate-500 font-mono">Age {seeker.age || 24}</span>
                      </div>
                      <p className="font-semibold text-slate-800 text-[11px] truncate">
                        {seeker.primaryDegree || seeker.educationalAttainment}
                      </p>
                    </div>

                    {/* TESDA Certifications */}
                    {seeker.tradeCertifications && seeker.tradeCertifications.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-blue-900 uppercase mb-1 flex items-center gap-1">
                          <Award className="w-3 h-3 text-blue-600" />
                          <span>TESDA Certifications:</span>
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(seeker.tradeCertifications || []).map(cert => (
                            <span key={cert} className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-semibold text-[10px] border border-blue-200">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills & Practical Capabilities */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-slate-400" />
                        <span>Practical & Trade Skills:</span>
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(seeker.practicalSkills || seeker.tradeSkills || seeker.technicalSkills.slice(0, 3)).map(sk => (
                          <span key={sk} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium text-[10px]">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Geographic Mobility */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Compass className="w-3 h-3 text-slate-400" />
                        <span className="capitalize">{seeker.geographicMobility ? seeker.geographicMobility.replace(/_/g, ' ') : 'Local Only'}</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-600">{seeker.contactNumber}</span>
                    </div>
                  </div>

                  {/* Quick PESO Officer Actions */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setAssessingSeeker(seeker)}
                      className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Compass className="w-3 h-3 text-amber-600" />
                      <span>Assess Skills</span>
                    </button>

                    <button
                      onClick={() => setReferralSeeker(seeker)}
                      className="px-2 py-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-lg text-[11px] font-black transition-colors flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <FileCheck className="w-3 h-3 text-amber-950" />
                      <span>Issue Slip</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Employers Grid */
        filteredEmployers.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Employers Registered</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No employers match your selected search or classification filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEmployers.map(emp => {
              const empJobs = jobPosts.filter(j => j.employerId === emp.id);
              const isEstablished = emp.isEstablishedLocal || ['Retail / Supermarket', 'Food & Beverage', 'Utilities / Electric Cooperative', 'Agriculture & Trading'].includes(emp.industry);

              return (
                <div key={emp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between hover:border-amber-400 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={emp.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80'}
                        alt={emp.companyName}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {emp.companyName}
                          </h3>
                          {emp.status === 'verified' ? (
                            <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-300 uppercase flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Verified
                            </span>
                          ) : (
                            <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300 uppercase flex items-center gap-0.5">
                              <ShieldAlert className="w-3 h-3 text-amber-600" />
                              Pending
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            isEstablished ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {isEstablished ? 'Established Local' : 'External / New'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                          {emp.industry}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {emp.municipality}, Oriental Mindoro
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Branch In-Charge:</span>
                        <span className="font-semibold text-slate-800">{emp.authorizedBranchManager || emp.representativeName}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Permit No:</span>
                        <span className="font-mono text-slate-800">{emp.businessPermitNo || 'BP-2026-REG'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Active Vacancies: <strong className="text-slate-900">{empJobs.filter(j => j.status === 'active').length}</strong></span>
                    {emp.status === 'pending' ? (
                      <button
                        onClick={() => onNavigate('admin-verifications', { employerId: emp.id })}
                        className="text-amber-800 font-bold hover:underline"
                      >
                        Verify 11 Req →
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Accredited
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Encode Walk-in Modal */}
      {isEncodeModalOpen && (
        <EncodeWalkInModal
          isOpen={isEncodeModalOpen}
          onClose={() => setIsEncodeModalOpen(false)}
        />
      )}

      {/* Walk-in Assessment Modal */}
      {assessingSeeker && (
        <WalkInAssessmentModal
          isOpen={!!assessingSeeker}
          onClose={() => setAssessingSeeker(null)}
          seeker={assessingSeeker}
        />
      )}

      {/* Issue Referral Slip Modal */}
      {referralSeeker && (
        <PesoReferralSlipModal
          isOpen={!!referralSeeker}
          onClose={() => setReferralSeeker(null)}
          initialSeeker={referralSeeker}
        />
      )}

    </div>
  );
};
