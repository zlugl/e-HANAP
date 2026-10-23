import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LocalRecruitmentActivity, JobSeekerProfile } from '../../types';
import { 
  Calendar, 
  MapPin, 
  Building2, 
  Award, 
  Users, 
  Plus, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Flame, 
  Search, 
  X,
  Share2,
  Printer,
  Sparkles
} from 'lucide-react';

interface AdminLraPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const AdminLraPage: React.FC<AdminLraPageProps> = ({ onNavigate }) => {
  const { 
    localRecruitmentActivities, 
    createLraEvent, 
    updateLraEvent, 
    logHotsApplicant, 
    jobSeekers,
    showToast 
  } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<LocalRecruitmentActivity | null>(null);
  const [isHotsModalOpen, setIsHotsModalOpen] = useState(false);
  const [selectedHotsSeekerId, setSelectedHotsSeekerId] = useState('');
  const [hotsPosition, setHotsPosition] = useState('');
  const [hotsSalary, setHotsSalary] = useState('');

  // New Event Form State
  const [eventName, setEventName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyOrigin, setCompanyOrigin] = useState('Batangas City / Batangas Port');
  const [venue, setVenue] = useState('Roxas Municipal Gymnasium, Bagumbayan, Roxas');
  const [startDate, setStartDate] = useState('2026-03-25');
  const [endDate, setEndDate] = useState('2026-03-26');
  const [targetDemographics, setTargetDemographics] = useState<('College Graduate' | 'High School Graduate' | 'Out-of-School Youth')[]>([
    'High School Graduate', 'College Graduate'
  ]);
  const [vacanciesText, setVacanciesText] = useState('Production Crew (50 slots), Logistics Staff (20 slots), Heavy Equipment Operator (15 slots)');
  const [vacanciesCount, setVacanciesCount] = useState(85);
  const [coordinatorName, setCoordinatorName] = useState('PESO Roxas Facilitation Staff');
  const [coordinatorContact, setCoordinatorContact] = useState('0917-555-4321');
  const [hasLetterOfIntent, setHasLetterOfIntent] = useState(true);
  const [hasMayorsPermit, setHasMayorsPermit] = useState(true);
  const [hasDoleRegistration, setHasDoleRegistration] = useState(true);
  const [isDmwPoeaLicensed, setIsDmwPoeaLicensed] = useState(false);
  const [remarks, setRemarks] = useState('Applicants are requested to bring original copies of birth certificate, NBI clearance, and TESDA certifications.');

  // Demographic toggle helper
  const toggleDemographic = (val: 'College Graduate' | 'High School Graduate' | 'Out-of-School Youth') => {
    setTargetDemographics(prev => 
      prev.includes(val) ? prev.filter(d => d !== val) : [...prev, val]
    );
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !companyName.trim()) {
      showToast({
        title: 'Missing Required Fields',
        message: 'Please fill in required event and company details.',
        type: 'alert'
      });
      return;
    }

    const vacanciesList = vacanciesText.split(',').map(s => s.trim()).filter(Boolean);

    createLraEvent({
      eventName: eventName.trim(),
      companyName: companyName.trim(),
      companyOrigin: companyOrigin.trim(),
      venue: venue.trim(),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      targetApplicantType: targetDemographics,
      vacancies: vacanciesList,
      totalSlotsAvailable: Number(vacanciesCount) || 50,
      coordinatorName,
      coordinatorContact,
      hasLetterOfIntent,
      hasMayorsPermit,
      hasDoleRegistration,
      isDmwPoeaLicensed,
      isPubliclyAnnounced: true,
      status: 'scheduled',
      remarks
    });

    setIsCreateModalOpen(false);
  };

  const handleLogHots = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !selectedHotsSeekerId) {
      showToast({
        title: 'Applicant Required',
        message: 'Please select an applicant to log as Hired-On-The-Spot.',
        type: 'alert'
      });
      return;
    }

    logHotsApplicant(
      selectedEvent.id,
      selectedHotsSeekerId,
      hotsPosition || 'Hired Candidate',
      hotsSalary || 'Standard Rate'
    );

    setIsHotsModalOpen(false);
    setSelectedHotsSeekerId('');
    setHotsPosition('');
    setHotsSalary('');
  };

  // Metrics
  const totalLras = localRecruitmentActivities.length;
  const totalSlots = localRecruitmentActivities.reduce((acc, curr) => acc + (curr.totalSlotsAvailable || 0), 0);
  const totalHots = localRecruitmentActivities.reduce((acc, curr) => acc + (curr.hotsApplicantsCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded uppercase">
              PESO-LGU Recruitment
            </span>
            <span className="text-xs text-slate-500 font-semibold">External Recruitment Coordination</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Local Recruitment Activities (LRA) & Special Job Drives
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Coordinate visiting employers from Batangas, Calapan, and Manila to conduct mass on-site interviews in Roxas and track Hired-On-The-Spot (HOTS).
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs"
        >
          <Plus className="w-4 h-4 text-amber-950" />
          <span>Schedule New LRA Event</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Coordinated Events</span>
            <p className="text-2xl font-black text-slate-900">{totalLras}</p>
            <span className="text-[11px] text-slate-500">Visiting external employers</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Vacancies</span>
            <p className="text-2xl font-black text-amber-950">{totalSlots}</p>
            <span className="text-[11px] text-slate-500">Slots opened for Roxas labor pool</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hired-on-the-Spot (HOTS)</span>
            <p className="text-2xl font-black text-emerald-700">{totalHots}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">Immediate placements recorded</span>
          </div>
        </div>
      </div>

      {/* LRA Events Listing */}
      <div className="space-y-4">
        <h2 className="font-bold text-slate-900 text-sm">
          Active & Scheduled Recruitment Activities
        </h2>

        <div className="space-y-4">
          {localRecruitmentActivities.map(event => (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 hover:border-amber-400 transition-all"
            >
              {/* Event Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      event.status === 'ongoing'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse'
                        : event.status === 'scheduled' || event.status === 'approved'
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {event.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Event ID: {event.id}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900">
                    {(event as any).eventName || event.eventTitle || 'Local Recruitment Activity'}
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{event.companyName}</span>
                    <span className="text-slate-400 font-normal">({event.companyOrigin})</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsHotsModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Flame className="w-4 h-4 text-emerald-200" />
                    <span>Log HOTS Applicant</span>
                  </button>

                  <select
                    value={event.status}
                    onChange={e => updateLraEvent(event.id, { status: e.target.value as any })}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="approved">Approved & Announced</option>
                    <option value="ongoing">Ongoing (Active Drive)</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Schedule</span>
                  <p className="font-bold text-slate-900 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    {(event as any).startDate 
                      ? `${new Date((event as any).startDate).toLocaleDateString()} - ${new Date((event as any).endDate || (event as any).startDate).toLocaleDateString()}` 
                      : (event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'Date TBA')}
                  </p>
                  <p className="text-[11px] text-slate-500">8:00 AM - 5:00 PM</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Venue</span>
                  <p className="font-bold text-slate-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    {(event as any).venue || event.eventVenue || 'Roxas Municipal Gymnasium'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Demographics</span>
                  <div className="flex flex-wrap gap-1">
                    {((event as any).targetApplicantType || event.targetApplicantTypes || []).map((type: string) => (
                      <span key={type} className="px-1.5 py-0.5 bg-amber-50 text-amber-900 rounded text-[10px] font-bold">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">HOTS Placements</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-emerald-700">{(event as any).hotsApplicantsCount || event.hotsCount || 0}</span>
                    <span className="text-[11px] text-slate-500">out of {(event as any).totalSlotsAvailable || event.totalVacancies || 0} slots filled</span>
                  </div>
                </div>
              </div>

              {/* Legality & Verification Badges */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">PESO Compliance:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                    (event as any).hasLetterOfIntent || event.letterOfIntentStatus === 'approved' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                  }`}>
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Letter of Intent
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                    (event as any).hasMayorsPermit || event.mayorsApprovalVerified ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                  }`}>
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Mayor's Special Permit
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                    (event as any).hasDoleRegistration ? 'bg-emerald-50 text-emerald-800' : 'bg-emerald-50 text-emerald-800'
                  }`}>
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> DOLE / DMW Verified
                  </span>
                </div>

                <div className="text-[11px] text-slate-500">
                  Coordinator: <strong>{(event as any).coordinatorName || 'PESO Facilitation Team'}</strong> ({(event as any).coordinatorContact || 'PESO Roxas'})
                </div>
              </div>

              {/* Vacancies List */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Available Job Positions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {((event as any).vacancies || event.targetPositions || []).map((v: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {localRecruitmentActivities.length === 0 && (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500">No LRA recruitment activities scheduled yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule LRA Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-6 flex items-center justify-between border-b border-amber-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Schedule Local Recruitment Activity (LRA)</h2>
                  <p className="text-xs text-slate-400">External Visiting Employer Drive Coordination</p>
                </div>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Event Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Batangas Industrial & Logistics Hiring Drive"
                    value={eventName}
                    onChange={e => setEventName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Visiting Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Batangas Port Logistics Corp."
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Company Origin / Home Office</label>
                  <input
                    type="text"
                    placeholder="e.g. Batangas City / Manila"
                    value={companyOrigin}
                    onChange={e => setCompanyOrigin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Target Total Slots Available</label>
                  <input
                    type="number"
                    value={vacanciesCount}
                    onChange={e => setVacanciesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Event Venue in Roxas *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Roxas Municipal Gymnasium or PESO Training Center"
                  value={venue}
                  onChange={e => setVenue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-900 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Open Positions (Comma-separated)</label>
                <input
                  type="text"
                  value={vacanciesText}
                  onChange={e => setVacanciesText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-900"
                  placeholder="e.g. Warehouse Packer (30), Forklift Driver (10)"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Target Applicant Demographics</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['College Graduate', 'High School Graduate', 'Out-of-School Youth'] as const).map(demo => (
                    <button
                      type="button"
                      key={demo}
                      onClick={() => toggleDemographic(demo)}
                      className={`p-2 rounded-xl text-left font-bold text-xs border transition-colors ${
                        targetDemographics.includes(demo)
                          ? 'bg-amber-100 border-amber-400 text-amber-950'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {demo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compliance checklist */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">PESO Legality Verification Checks:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasLetterOfIntent}
                    onChange={e => setHasLetterOfIntent(e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  <span>Official Letter of Intent submitted to Municipal Mayor / PESO Manager</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasMayorsPermit}
                    onChange={e => setHasMayorsPermit(e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  <span>Mayor's Special Permit for Local Recruitment Activity issued</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDoleRegistration}
                    onChange={e => setHasDoleRegistration(e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  <span>DOLE Certificate of Registration / Legal Corporate Standing verified</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-xl shadow-md"
                >
                  Schedule & Announce LRA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log HOTS Modal */}
      {isHotsModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  Record Hired-on-the-Spot (HOTS)
                </h3>
              </div>
              <button
                onClick={() => setIsHotsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogHots} className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Event</span>
                <p className="font-bold text-slate-900 text-sm">{selectedEvent.eventName}</p>
                <p className="text-slate-500">{selectedEvent.companyName}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Select Candidate Seeker *</label>
                <select
                  value={selectedHotsSeekerId}
                  onChange={e => setSelectedHotsSeekerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-900"
                >
                  <option value="">-- Choose Candidate --</option>
                  {jobSeekers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.educationCategory || s.educationalAttainment}) - {s.isWalkIn ? 'Walk-In' : 'Online'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Hired Position Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Specialist"
                  value={hotsPosition}
                  onChange={e => setHotsPosition(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Offered Monthly Salary / Wage Rate</label>
                <input
                  type="text"
                  placeholder="e.g. ₱16,500/month + lodging allowance"
                  value={hotsSalary}
                  onChange={e => setHotsSalary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsHotsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md"
                >
                  Record HOTS Placement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
