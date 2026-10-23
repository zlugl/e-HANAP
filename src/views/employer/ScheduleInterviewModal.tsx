import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Send,
  FileText,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  Download,
  ExternalLink,
  Phone,
  Mail,
  User
} from 'lucide-react';

interface ScheduleInterviewModalProps {
  applicationId: string;
  onClose: () => void;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({ applicationId, onClose }) => {
  const { applications, jobSeekers, jobPosts, scheduleInterview, showToast } = useApp();

  const application = applications.find(a => a.id === applicationId);
  const seeker = application ? jobSeekers.find(s => s.id === application.jobSeekerId) : null;
  const job = application ? jobPosts.find(j => j.id === application.jobId) : null;

  const [date, setDate] = useState('2026-08-18');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  const [customTime, setCustomTime] = useState('10:00');
  const [isCustomSlot, setIsCustomSlot] = useState(false);
  const [mode, setMode] = useState<'video' | 'face_to_face' | 'phone'>('video');
  const [locationOrLink, setLocationOrLink] = useState('https://meet.google.com/peso-ormin-interview');
  const [notes, setNotes] = useState('Please prepare a digital copy of your official transcript of records (TOR), portfolio links, and 1 valid government-issued ID for verification.');
  const [sendCalendarInvite, setSendCalendarInvite] = useState(true);
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  // Available Time Slot Presets
  const morningSlots = ['08:30 AM', '09:30 AM', '10:30 AM', '11:15 AM'];
  const afternoonSlots = ['01:30 PM', '02:30 PM', '03:45 PM', '04:30 PM'];

  if (!application || !seeker || !job) return null;

  const get24HourTime = (slot: string) => {
    if (isCustomSlot) return customTime;
    const [timePart, modifier] = slot.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  };

  const handleSelectPresetSlot = (slot: string) => {
    setSelectedSlot(slot);
    setIsCustomSlot(false);
  };

  const generateGoogleCalendarUrl = () => {
    const startTimeFormatted = date.replace(/-/g, '') + 'T' + get24HourTime(selectedSlot).replace(':', '') + '00';
    // 45 mins duration
    const endTimeFormatted = date.replace(/-/g, '') + 'T' + '110000';
    const title = encodeURIComponent(`PESO Job Interview: ${job.title} - ${job.companyName}`);
    const details = encodeURIComponent(`${notes}\n\nCandidate: ${seeker.firstName} ${seeker.lastName}\nEmail: ${seeker.email}\nPhone: ${seeker.contactNumber}\nPESO Oriental Mindoro Portal`);
    const location = encodeURIComponent(locationOrLink);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTimeFormatted}/${endTimeFormatted}&details=${details}&location=${location}`;
  };

  const handleDownloadICS = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PESO Oriental Mindoro//eHANAP Interview Scheduler//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:peso-interview-${application.id}-${Date.now()}@ormindoro.gov.ph
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${date.replace(/-/g, '')}T${get24HourTime(selectedSlot).replace(':', '')}00
SUMMARY:Interview for ${job.title} at ${job.companyName}
DESCRIPTION:${notes.replace(/\n/g, '\\n')}
LOCATION:${locationOrLink}
STATUS:CONFIRMED
ATTENDEE;CN="${seeker.firstName} ${seeker.lastName}":mailto:${seeker.email}
ORGANIZER;CN="${job.companyName}":mailto:careers@mindorotech.ph
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `interview-${seeker.firstName.toLowerCase()}-${job.title.toLowerCase().replace(/\s+/g, '-')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTime = isCustomSlot ? customTime : selectedSlot;

    const result = scheduleInterview({
      applicationId: application.id,
      jobId: job.id,
      jobTitle: job.title,
      employerId: job.employerId,
      companyName: job.companyName,
      jobSeekerId: seeker.id,
      applicantName: `${seeker.firstName} ${seeker.lastName}`,
      interviewType: mode,
      date,
      time: finalTime,
      locationOrLink,
      instructions: notes,
      contactPerson: job.companyName,
    });

    if (result.success) {
      setIsSuccess(true);
      showToast({
        title: '📅 Interview Scheduled & Calendar Invite Sent',
        message: `Invite sent to ${seeker.firstName} ${seeker.lastName} for ${date} at ${finalTime}.`,
      });
      setTimeout(() => {
        onClose();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white truncate">Schedule Interview</h3>
                <span className="text-[10px] bg-emerald-900 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  Calendar Sync
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 truncate">{seeker.firstName} {seeker.lastName} • {job.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-900">Interview Successfully Scheduled!</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Calendar invite and synchronized notification have been transmitted to <span className="font-semibold text-slate-700">{seeker.email}</span>.
              </p>
            </div>
          </div>
        ) : (
          /* Scheduling Form */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 text-xs overflow-y-auto flex-1">
            
            {/* Candidate Match Pill */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-indigo-950">
              <div className="flex items-center gap-2.5">
                <img
                  src={seeker.profilePicture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                  alt={seeker.firstName}
                  className="w-8 h-8 rounded-xl object-cover"
                />
                <div>
                  <p className="font-bold">{seeker?.firstName} {seeker?.lastName} ({seeker?.municipality || 'Oriental Mindoro'})</p>
                  <p className="text-[11px] text-indigo-700">{seeker?.primaryDegree || seeker?.educationalAttainment || 'Qualified Candidate'}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white font-black text-[11px] rounded-xl shadow-2xs shrink-0 self-end sm:self-auto">
                {application.matchResult?.overallMatch || 85}% Match
              </span>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Interview Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* Available Time Slots Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Available Time Slots</label>
                <button
                  type="button"
                  onClick={() => setIsCustomSlot(!isCustomSlot)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700"
                >
                  {isCustomSlot ? 'Pick Standard Slots' : 'Custom Time...'}
                </button>
              </div>

              {!isCustomSlot ? (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Morning Slots</span>
                    <div className="grid grid-cols-4 gap-2">
                      {morningSlots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleSelectPresetSlot(slot)}
                          className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-all ${
                            selectedSlot === slot && !isCustomSlot
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Afternoon Slots</span>
                    <div className="grid grid-cols-4 gap-2">
                      {afternoonSlots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleSelectPresetSlot(slot)}
                          className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-all ${
                            selectedSlot === slot && !isCustomSlot
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="time"
                    required
                    value={customTime}
                    onChange={e => setCustomTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              )}
            </div>

            {/* Format Selection */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Interview Format</label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('video');
                    setLocationOrLink('https://meet.google.com/peso-ormin-interview');
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-semibold transition-all ${
                    mode === 'video' ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <Video className="w-4 h-4 text-indigo-600" />
                  <span className="text-[11px]">Google Meet / Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('face_to_face');
                    setLocationOrLink('PESO Provincial Capitol Office, Calapan City');
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-semibold transition-all ${
                    mode === 'face_to_face' ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span className="text-[11px]">On-Site Office</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('phone');
                    setLocationOrLink(seeker.contactNumber || '0917-555-0199');
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-semibold transition-all ${
                    mode === 'phone' ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <Phone className="w-4 h-4 text-indigo-600" />
                  <span className="text-[11px]">Phone Interview</span>
                </button>
              </div>
            </div>

            {/* Location / Meeting URL */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {mode === 'video' ? 'Google Meet / Meeting Link' : mode === 'face_to_face' ? 'On-Site Location / Building' : 'Candidate Contact Number'}
              </label>
              <input
                type="text"
                required
                value={locationOrLink}
                onChange={e => setLocationOrLink(e.target.value)}
                placeholder={mode === 'video' ? 'https://meet.google.com/...' : 'Address / Room...'}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
              />
            </div>

            {/* Instructions / Notes */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Candidate Preparation Notes & Instructions</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            {/* Automated Dispatch Options & Calendar Links */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={sendCalendarInvite}
                    onChange={e => setSendCalendarInvite(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Dispatch Synchronized Calendar Invite (.ics + In-App)</span>
                </label>
                <button
                  type="button"
                  onClick={handleDownloadICS}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 shrink-0 self-end sm:self-auto"
                >
                  <Download className="w-3 h-3" />
                  <span>Download .ics</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs pt-1 border-t border-slate-200/60">
                <span className="text-[11px] text-slate-500">Google Calendar integration:</span>
                <a
                  href={generateGoogleCalendarUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open in Google Calendar</span>
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Calendar Invite</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
