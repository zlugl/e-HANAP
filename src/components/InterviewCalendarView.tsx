import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Interview, InterviewStatus, InterviewType } from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Video, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Plus, 
  Send, 
  Sparkles, 
  UserCheck, 
  Building2,
  CalendarCheck,
  Check,
  AlertCircle
} from 'lucide-react';

interface InterviewCalendarViewProps {
  userRole: 'employer' | 'job_seeker';
}

export const InterviewCalendarView: React.FC<InterviewCalendarViewProps> = ({ userRole }) => {
  const { 
    currentUser, 
    currentEmployerProfile, 
    currentSeekerProfile, 
    interviews, 
    scheduleInterview, 
    respondToInterview,
    applications,
    jobPosts,
    jobSeekers
  } = useApp();

  // Calendar Date State (Default August 2026 to match mock data or current month)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026
  const [selectedDay, setSelectedDay] = useState<string | null>('2026-08-15');
  const [isProposingSlotModal, setIsProposingSlotModal] = useState(false);

  // Slot proposing form state for employers
  const [selectedAppId, setSelectedAppId] = useState('');
  const [slotTime, setSlotTime] = useState('09:30');
  const [slotMode, setSlotMode] = useState<InterviewType>('video');
  const [slotLocation, setSlotLocation] = useState('https://meet.google.com/peso-ormin-interview');
  const [slotInstructions, setSlotInstructions] = useState('Please have a valid ID ready for PESO verification.');

  // Reschedule form state for seekers
  const [rescheduleDate, setRescheduleDate] = useState('2026-08-20');
  const [rescheduleTime, setRescheduleTime] = useState('14:00');
  const [rescheduleNotes, setRescheduleNotes] = useState('');
  const [activeRescheduleInterviewId, setActiveRescheduleInterviewId] = useState<string | null>(null);

  // Get relevant interviews
  const relevantInterviews = userRole === 'employer'
    ? interviews.filter(i => i.employerId === currentEmployerProfile?.id)
    : interviews.filter(i => i.jobSeekerId === currentSeekerProfile?.id);

  // Employer's applicants list for scheduling new interviews
  const myEmployerJobs = jobPosts.filter(j => j.employerId === currentEmployerProfile?.id);
  const myEmployerJobIds = myEmployerJobs.map(j => j.id);
  const candidateApps = applications.filter(a => myEmployerJobIds.includes(a.jobId)).length > 0
    ? applications.filter(a => myEmployerJobIds.includes(a.jobId))
    : applications;
  const myEmployerApps = candidateApps;

  // Calendar logic calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper to format YYYY-MM-DD
  const formatDateKey = (dayNum: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = dayNum.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Group interviews by date string "YYYY-MM-DD"
  const interviewsByDate: { [dateStr: string]: Interview[] } = {};
  relevantInterviews.forEach(inv => {
    const dateKey = inv.date || (inv as any).scheduledDate || '2026-08-15';
    if (!interviewsByDate[dateKey]) interviewsByDate[dateKey] = [];
    interviewsByDate[dateKey].push(inv);

    // Also map proposed slots dates
    if (inv.proposedSlots) {
      inv.proposedSlots.forEach(slot => {
        if (!interviewsByDate[slot.date]) interviewsByDate[slot.date] = [];
        if (!interviewsByDate[slot.date].some(x => x.id === inv.id)) {
          interviewsByDate[slot.date].push(inv);
        }
      });
    }
  });

  const handleEmployerProposeSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const appIdToUse = selectedAppId || myEmployerApps[0]?.id;
    if (!appIdToUse || !selectedDay) return;

    const app = myEmployerApps.find(a => a.id === appIdToUse) || applications[0];
    if (!app) return;

    const job = jobPosts.find(j => j.id === app.jobId) || jobPosts[0];
    const seeker = jobSeekers.find(s => s.id === app.jobSeekerId) || jobSeekers[0];

    if (!job || !seeker) return;

    // Create proposed interview with multiple slots
    scheduleInterview({
      applicationId: app.id,
      jobId: job.id,
      jobTitle: job.title,
      employerId: job.employerId || currentEmployerProfile?.id || 'emp-1',
      companyName: job.companyName || currentEmployerProfile?.companyName || 'PESO Employer Partner',
      jobSeekerId: seeker.id,
      applicantName: `${seeker.firstName} ${seeker.lastName}`,
      interviewType: slotMode,
      date: selectedDay,
      time: slotTime,
      locationOrLink: slotLocation,
      instructions: slotInstructions,
      contactPerson: job.companyName,
      proposedSlots: [
        { id: `slot-1-${Date.now()}`, date: selectedDay, time: slotTime, status: 'proposed' },
        { id: `slot-2-${Date.now()}`, date: selectedDay, time: '14:00', status: 'proposed' }
      ]
    });

    setIsProposingSlotModal(false);
  };

  const handleSeekerAcceptSlot = (interviewId: string, slotDate: string, slotTime: string) => {
    respondToInterview(interviewId, 'accept', `Accepted proposed calendar slot on ${slotDate} at ${slotTime}`);
  };

  const handleSeekerReschedule = (interviewId: string) => {
    if (!rescheduleDate || !rescheduleTime) return;
    respondToInterview(
      interviewId, 
      'reschedule', 
      `Requested reschedule to ${rescheduleDate} at ${rescheduleTime}. Note: ${rescheduleNotes}`
    );
    setActiveRescheduleInterviewId(null);
  };

  const selectedDayInterviews = selectedDay ? (interviewsByDate[selectedDay] || []) : [];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Interactive Interview Calendar & Slot Proposal System
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {userRole === 'employer' 
              ? 'Propose available interview calendar slots, manage invitations, and respond to applicant reschedule requests.' 
              : 'View proposed interview dates on the calendar, accept preferred time slots, or propose alternative reschedule times.'}
          </p>
        </div>

        {/* Action Button for Employer */}
        {userRole === 'employer' && (
          <button
            onClick={() => setIsProposingSlotModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Propose Calendar Slots</span>
          </button>
        )}
      </div>

      {/* Main Grid: Calendar Grid & Day Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calendar Left Column */}
        <div className="lg:col-span-7 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 font-mono">
                {monthNames[month]} {year}
              </h3>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                {relevantInterviews.length} Sessions
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty padding cells for first week */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-20 bg-slate-100/50 rounded-xl"></div>
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateKey = formatDateKey(dayNum);
              const dayInterviews = interviewsByDate[dateKey] || [];
              const isSelected = selectedDay === dateKey;

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDay(dateKey)}
                  className={`h-20 p-1.5 rounded-xl border text-left transition-all flex flex-col justify-between relative overflow-hidden ${
                    isSelected 
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-400' 
                      : dayInterviews.length > 0 
                      ? 'bg-white border-indigo-200 hover:border-indigo-400 text-slate-900 shadow-2xs' 
                      : 'bg-white/80 border-slate-200/80 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className={`text-xs font-bold font-mono ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {dayNum}
                  </span>

                  {/* Day Badges */}
                  {dayInterviews.length > 0 && (
                    <div className="space-y-1 w-full">
                      {dayInterviews.slice(0, 2).map((inv, iIdx) => (
                        <div 
                          key={iIdx} 
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate ${
                            isSelected 
                              ? 'bg-indigo-800 text-white' 
                              : inv.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : inv.status === 'reschedule_requested'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          }`}
                        >
                          {inv.time || '10:00'} • {userRole === 'employer' ? inv.applicantName.split(' ')[0] : inv.companyName.split(' ')[0]}
                        </div>
                      ))}
                      {dayInterviews.length > 2 && (
                        <span className={`text-[8px] font-extrabold block text-right ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                          +{dayInterviews.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Accepted / Confirmed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Proposed / Pending</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Reschedule Requested</span>
          </div>

        </div>

        {/* Selected Day Agenda & Details Right Column */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">Day Agenda</span>
              <h3 className="text-sm font-bold text-white font-mono">
                {selectedDay ? new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Select a date'}
              </h3>
            </div>
            <span className="text-xs font-bold bg-indigo-600 px-2.5 py-1 rounded-lg">
              {selectedDayInterviews.length} Session(s)
            </span>
          </div>

          {selectedDayInterviews.length === 0 ? (
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
              <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No Interviews Scheduled on This Date</p>
              <p className="text-[11px] text-slate-500">
                {userRole === 'employer' 
                  ? 'Click "Propose Calendar Slots" to invite job applicants for this date.' 
                  : 'Select highlighted calendar days to view interview invitations.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {selectedDayInterviews.map(inv => (
                <div key={inv.id} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 text-xs">
                  
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{inv.jobTitle}</h4>
                      <p className="text-slate-500 font-semibold">
                        {userRole === 'employer' ? `Applicant: ${inv.applicantName}` : `Company: ${inv.companyName}`}
                      </p>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                      inv.status === 'accepted' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                      inv.status === 'reschedule_requested' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                      'bg-indigo-50 text-indigo-800 border-indigo-300'
                    }`}>
                      {inv.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Time & Format Info */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="font-bold font-mono">{inv.time || '10:00 AM'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-700">
                      {inv.interviewType === 'video' ? <Video className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> : <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      <span className="font-semibold truncate">{inv.locationOrLink}</span>
                    </div>
                  </div>

                  {/* Proposed Slots Pill Buttons for Job Seeker */}
                  {userRole === 'job_seeker' && inv.proposedSlots && inv.proposedSlots.length > 0 && inv.status === 'scheduled' && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                      <span className="font-bold text-indigo-900 block text-[11px]">
                        Select Proposed Time Slot to Accept:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {(inv.proposedSlots || []).map(slot => (
                          <button
                            key={slot.id}
                            onClick={() => handleSeekerAcceptSlot(inv.id, slot.date, slot.time)}
                            className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 border border-indigo-300 rounded-lg font-mono font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{slot.time} ({slot.date})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Seeker Actions */}
                  {userRole === 'job_seeker' && inv.status === 'scheduled' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => respondToInterview(inv.id, 'accept', 'Accepted interview appointment')}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Slot</span>
                      </button>

                      <button
                        onClick={() => setActiveRescheduleInterviewId(activeRescheduleInterviewId === inv.id ? null : inv.id)}
                        className="py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reschedule</span>
                      </button>
                    </div>
                  )}

                  {/* Reschedule Drawer */}
                  {activeRescheduleInterviewId === inv.id && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
                      <p className="font-bold text-amber-900">Propose New Calendar Slot & Reason</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block">New Date</label>
                          <input 
                            type="date" 
                            value={rescheduleDate} 
                            onChange={e => setRescheduleDate(e.target.value)}
                            className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block">New Time</label>
                          <input 
                            type="time" 
                            value={rescheduleTime} 
                            onChange={e => setRescheduleTime(e.target.value)}
                            className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs" 
                          />
                        </div>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Reason for reschedule request..." 
                        value={rescheduleNotes}
                        onChange={e => setRescheduleNotes(e.target.value)}
                        className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
                      />
                      <button
                        onClick={() => handleSeekerReschedule(inv.id)}
                        className="w-full py-1.5 bg-amber-700 text-white font-bold rounded-lg"
                      >
                        Send Calendar Reschedule Request
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Propose Slot Modal for Employer */}
      {isProposingSlotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Propose Calendar Slots to Applicant</h3>
              <button onClick={() => setIsProposingSlotModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleEmployerProposeSlot} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Candidate Application</label>
                <select
                  required
                  value={selectedAppId}
                  onChange={e => setSelectedAppId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                >
                  <option value="">-- Choose Candidate --</option>
                  {myEmployerApps.map(app => {
                    const job = jobPosts.find(j => j.id === app.jobId);
                    const seeker = jobSeekers.find(s => s.id === app.jobSeekerId);
                    return (
                      <option key={app.id} value={app.id}>
                        {seeker?.firstName} {seeker?.lastName} — {job?.title} ({app.matchScore}% Decision Tree Match)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Proposed Primary Date</label>
                  <input
                    type="date"
                    required
                    value={selectedDay || '2026-08-18'}
                    onChange={e => setSelectedDay(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Proposed Time Slot</label>
                  <input
                    type="time"
                    required
                    value={slotTime}
                    onChange={e => setSlotTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Interview Format</label>
                <select
                  value={slotMode}
                  onChange={e => setSlotMode(e.target.value as InterviewType)}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                >
                  <option value="video">Virtual Google Meet Video Call</option>
                  <option value="face_to_face">On-Site Interview (PESO / Company Office)</option>
                  <option value="phone">Phone Screening Call</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location or Video Call Link</label>
                <input
                  type="text"
                  required
                  value={slotLocation}
                  onChange={e => setSlotLocation(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProposingSlotModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Calendar Invite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
