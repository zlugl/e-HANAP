import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InterviewCalendarView } from '../../components/InterviewCalendarView';
import { ScheduleInterviewModal } from './ScheduleInterviewModal';
import { ApplicantMatchReportModal } from './ApplicantMatchReportModal';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  ExternalLink, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  Building2, 
  UserCheck, 
  AlertCircle,
  Copy,
  Check,
  Briefcase,
  BarChart3
} from 'lucide-react';

interface EmployerInterviewsPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const EmployerInterviewsPage: React.FC<EmployerInterviewsPageProps> = ({ onNavigate }) => {
  const { 
    currentEmployerProfile, 
    interviews, 
    jobSeekers, 
    jobPosts, 
    applications,
    respondToInterview,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');
  const [selectedMatchReportAppId, setSelectedMatchReportAppId] = useState<string | null>(null);
  const [selectedInterviewModalAppId, setSelectedInterviewModalAppId] = useState<string | null>(null);
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<number | null>(null);

  if (!currentEmployerProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md">
          <Building2 className="w-10 h-10 text-blue-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">Employer Account Required</h2>
          <p className="text-xs text-slate-500 mt-1">Please log in with an Employer account to view and manage candidate interviews.</p>
        </div>
      </div>
    );
  }

  // Get interviews belonging to current employer
  const myInterviews = interviews.filter(i => i.employerId === currentEmployerProfile.id);

  const upcomingInterviews = myInterviews.filter(i => i.status === 'scheduled' || i.status === 'accepted');
  const acceptedInterviews = myInterviews.filter(i => i.status === 'accepted');
  const rescheduledInterviews = myInterviews.filter(i => i.status === 'reschedule_requested');
  const completedInterviews = myInterviews.filter(i => i.status === 'completed');

  const handleCopyMeetLink = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkIndex(index);
    showToast({
      title: 'Link Copied',
      message: 'Meeting link copied to clipboard.',
      type: 'info'
    });
    setTimeout(() => setCopiedLinkIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Coordination & Sessions
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {currentEmployerProfile.companyName}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-600" />
            Interview Schedule & Coordination
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate evaluation calls, propose time slots, and manage candidate video meetings in Roxas.
          </p>
        </div>

        {/* View Toggle (Calendar Grid vs List View) */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-white text-slate-900 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interactive Calendar
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Session List ({myInterviews.length})
            </button>
          </div>

          <button
            onClick={() => onNavigate('employer-applicants')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Select Candidate to Interview</span>
          </button>
        </div>
      </div>


      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Upcoming Sessions</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{upcomingInterviews.length}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Active coordination calls</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Candidate Confirmed</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-600">{acceptedInterviews.length}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Accepted invitations</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reschedule Requests</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-purple-600">{rescheduledInterviews.length}</span>
            <AlertCircle className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-[11px] text-purple-600 font-medium mt-1">Awaiting date resolution</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed Sessions</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-700">{completedInterviews.length}</span>
            <UserCheck className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Evaluations finished</p>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      {activeTab === 'calendar' ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                Monthly Interview Calendar & Propose Time Slots
              </h2>
              <p className="text-xs text-slate-500">
                Click any calendar day to propose new interview slots or inspect scheduled video meetings.
              </p>
            </div>
          </div>

          {/* Embedded Interactive Calendar Component */}
          <InterviewCalendarView userRole="employer" />
        </div>
      ) : (
        <div className="space-y-4">
          {myInterviews.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Interviews Scheduled Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Review your ranked candidates and click "Schedule Interview" to send invites to qualified job seekers.
              </p>
              <button
                onClick={() => onNavigate('employer-applicants')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Go to Candidates Pipeline</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myInterviews.map((inv, idx) => {
                const seeker = jobSeekers.find(s => s.id === inv.jobSeekerId);
                const isOnline = inv.interviewType === 'video' || (inv.type as string) === 'video';

                return (
                  <div
                    key={inv.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-300 transition-all p-5 space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={seeker?.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={inv.applicantName}
                          className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{inv.applicantName}</h3>
                          <p className="text-xs text-slate-500 font-medium">{inv.jobTitle}</p>
                          <p className="text-[11px] text-slate-400">{seeker?.municipality || 'Oriental Mindoro'}</p>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        inv.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        inv.status === 'scheduled' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        inv.status === 'reschedule_requested' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        inv.status === 'completed' ? 'bg-slate-100 text-slate-800 border border-slate-200' :
                        'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {inv.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Schedule Time & Mode */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-slate-700 font-semibold">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Date & Time: {inv.scheduledDate} at {inv.scheduledTime}</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-600">
                        {isOnline ? (
                          <Video className="w-4 h-4 text-blue-600" />
                        ) : (
                          <MapPin className="w-4 h-4 text-emerald-600" />
                        )}
                        <span>
                          {isOnline ? 'Online Google Meet / Video Screen' : 'On-site Office / PESO Roxas Venue'}
                        </span>
                      </div>

                      {inv.location && (
                        <div className="text-[11px] text-slate-500 truncate">
                          <strong>Location / Link:</strong> {inv.location}
                        </div>
                      )}

                      {inv.instructions && (
                        <div className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200/60">
                          <strong>Instructions:</strong> "{inv.instructions}"
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      {inv.location && inv.location.startsWith('http') ? (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={inv.location}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-2xs"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Meeting</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>

                          <button
                            onClick={() => handleCopyMeetLink(inv.location!, idx)}
                            title="Copy Meet Link"
                            className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200"
                          >
                            {copiedLinkIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">On-site session</span>
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (inv.applicationId) setSelectedMatchReportAppId(inv.applicationId);
                          }}
                          className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold"
                        >
                          View Candidate
                        </button>

                        {inv.status !== 'completed' && (
                          <button
                            onClick={() => {
                              respondToInterview(inv.id, 'accept', 'Marked as completed by employer');
                              showToast({
                                title: 'Interview Updated',
                                message: 'Interview marked as completed.',
                                type: 'success'
                              });
                            }}
                            className="px-2.5 py-1.5 text-emerald-700 hover:bg-emerald-100 bg-emerald-50 border border-emerald-200 rounded-lg font-bold"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Match Report Modal */}
      {selectedMatchReportAppId && (
        <ApplicantMatchReportModal
          applicationId={selectedMatchReportAppId}
          onClose={() => setSelectedMatchReportAppId(null)}
          onScheduleInterview={(appId) => setSelectedInterviewModalAppId(appId)}
        />
      )}

      {/* Schedule Interview Modal */}
      {selectedInterviewModalAppId && (
        <ScheduleInterviewModal
          applicationId={selectedInterviewModalAppId}
          onClose={() => setSelectedInterviewModalAppId(null)}
          onSuccess={() => {
            setSelectedInterviewModalAppId(null);
            showToast({
              title: 'Interview Scheduled',
              message: 'Interview invitation sent to candidate.',
              type: 'interview'
            });
          }}
        />
      )}

    </div>
  );
};
