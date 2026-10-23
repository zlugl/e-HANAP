import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Phone, 
  Building2,
  AlertCircle
} from 'lucide-react';

export const SeekerInterviewsPage: React.FC = () => {
  const { currentSeekerProfile, interviews, respondToInterview } = useApp();
  const [rescheduleNotes, setRescheduleNotes] = useState<{ [id: string]: string }>({});
  const [rescheduleDate, setRescheduleDate] = useState<{ [id: string]: string }>({});
  const [activeRescheduleId, setActiveRescheduleId] = useState<string | null>(null);

  if (!currentSeekerProfile) return null;

  const myInterviews = interviews.filter(i => i.jobSeekerId === currentSeekerProfile.id);

  const handleRespond = (interviewId: string, response: 'accept' | 'decline' | 'reschedule') => {
    let note = '';
    if (response === 'reschedule') {
      note = `Requested new date: ${rescheduleDate[interviewId] || 'TBD'}. ${rescheduleNotes[interviewId] || ''}`;
    }
    respondToInterview(interviewId, response, note);
    setActiveRescheduleId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Interview Schedule</h1>
        <p className="text-xs text-slate-500 mt-1">
          Respond to interview invites, view video call links, or request reschedule with Mindoro employers.
        </p>
      </div>

      {myInterviews.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Scheduled Interviews</h3>
          <p className="text-xs text-slate-500 mt-1">Interview invitations from employers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {myInterviews.map(inv => (
            <div key={inv.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded uppercase">
                    {(inv.interviewType || 'interview').replace(/_/g, ' ')}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{inv.jobTitle}</h3>
                  <p className="text-xs font-semibold text-slate-600">{inv.companyName}</p>
                </div>

                <div className="text-left sm:text-right w-full sm:w-auto">
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-lg capitalize border ${
                    inv.status === 'accepted' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
                    inv.status === 'declined' ? 'bg-rose-50 border-rose-300 text-rose-800' :
                    inv.status === 'reschedule_requested' ? 'bg-amber-50 border-amber-300 text-amber-800' :
                    'bg-indigo-50 border-indigo-300 text-indigo-800'
                  }`}>
                    Status: {(inv.status || 'scheduled').replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Schedule Info Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Date</span>
                    <span className="font-semibold text-slate-800">{inv.date || (inv as any).scheduledDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Time</span>
                    <span className="font-semibold text-slate-800">{inv.time || (inv as any).scheduledTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  {inv.interviewType === 'video' || (inv.interviewType as string) === 'video_call' ? <Video className="w-4 h-4 text-indigo-600 shrink-0" /> : <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-slate-400 block font-bold">Location / Link</span>
                    <span className="font-semibold text-slate-800 truncate block max-w-full">{inv.locationOrLink}</span>
                  </div>
                </div>
              </div>

              {(inv.instructions || inv.rescheduleNotes || (inv as any).notes) && (
                <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-700">
                  <strong className="text-slate-900">Employer Instructions:</strong> {inv.instructions || inv.rescheduleNotes || (inv as any).notes}
                </div>
              )}

              {/* Action Buttons */}
              {inv.status === 'scheduled' && (
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => handleRespond(inv.id, 'accept')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Interview</span>
                  </button>

                  <button
                    onClick={() => setActiveRescheduleId(activeRescheduleId === inv.id ? null : inv.id)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Request Reschedule</span>
                  </button>

                  <button
                    onClick={() => handleRespond(inv.id, 'decline')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                </div>
              )}

              {/* Reschedule Input Drawer */}
              {activeRescheduleId === inv.id && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 text-xs animate-in fade-in">
                  <h4 className="font-bold text-amber-900">Propose New Date & Reason for Reschedule</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Preferred Date</label>
                      <input
                        type="date"
                        value={rescheduleDate[inv.id] || ''}
                        onChange={e => setRescheduleDate({ ...rescheduleDate, [inv.id]: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Reason / Notes</label>
                      <input
                        type="text"
                        placeholder="Reason for reschedule request..."
                        value={rescheduleNotes[inv.id] || ''}
                        onChange={e => setRescheduleNotes({ ...rescheduleNotes, [inv.id]: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => handleRespond(inv.id, 'reschedule')}
                      className="px-4 py-2 bg-amber-700 text-white font-bold rounded-lg"
                    >
                      Send Reschedule Request
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
