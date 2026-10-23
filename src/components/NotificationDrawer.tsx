import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { NotificationItem } from '../types';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Info, 
  AlertTriangle, 
  Briefcase, 
  Calendar, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Tag,
  ChevronRight
} from 'lucide-react';
import { getFilteredUserNotifications } from '../utils/notificationUtils';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string, params?: any) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  const { 
    currentUser, 
    currentSeekerProfile,
    applications,
    interviews,
    referralSlips,
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead,
    showToast 
  } = useApp();
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'status_updates' | 'system_alerts' | 'peso_broadcasts' | 'unread'>('all');

  // Reset selected notification when closing
  useEffect(() => {
    if (!isOpen) {
      setSelectedNotif(null);
    }
  }, [isOpen]);

  if (!isOpen || !currentUser) return null;

  const userNotifs = getFilteredUserNotifications(
    notifications,
    currentUser,
    currentSeekerProfile,
    applications,
    interviews,
    referralSlips
  );
  const unreadCount = userNotifs.filter(n => !n.read).length;

  const getNotificationCategory = (notif: NotificationItem): 'status_updates' | 'system_alerts' | 'peso_broadcasts' => {
    const text = `${notif.title} ${notif.message}`.toLowerCase();
    if (text.includes('peso roxas') || text.includes('announcement') || text.includes('broadcast') || text.includes('job fair') || text.includes('dole') || text.includes('advisory') || notif.type === 'info') {
      return 'peso_broadcasts';
    }
    if (text.includes('application') || text.includes('interview') || text.includes('status') || text.includes('hired') || text.includes('shortlisted') || text.includes('qualified') || text.includes('candidate') || text.includes('referral') || text.includes('review')) {
      return 'status_updates';
    }
    return 'system_alerts';
  };

  const statusCount = userNotifs.filter(n => getNotificationCategory(n) === 'status_updates').length;
  const alertCount = userNotifs.filter(n => getNotificationCategory(n) === 'system_alerts').length;
  const broadcastCount = userNotifs.filter(n => getNotificationCategory(n) === 'peso_broadcasts').length;

  const displayedNotifs = userNotifs.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return getNotificationCategory(n) === activeTab;
  });

  const handleSelectNotif = (notif: NotificationItem) => {
    if (!notif.read) {
      markNotificationRead(notif.id);
    }
    setSelectedNotif(notif);
  };

  const resolveTargetView = (notif: NotificationItem): { view: string; params?: any; label: string } => {
    const rawLink = (notif.link || '').toLowerCase().trim();
    const title = notif.title.toLowerCase();
    const message = notif.message.toLowerCase();

    // 1. Interviews
    if (rawLink.includes('interview') || title.includes('interview') || message.includes('interview')) {
      return { view: 'seeker-interviews', label: 'View Interview Session' };
    }

    // 2. Candidate applicants (employer)
    if (rawLink.includes('applicant') || title.includes('applicant') || (currentUser.role === 'employer' && message.includes('applicant'))) {
      return { view: 'employer-applicants', label: 'View Candidate Applicants' };
    }

    // 3. Verifications (admin)
    if (rawLink.includes('verification') || title.includes('verification') || message.includes('accreditation') || message.includes('verification')) {
      return { view: 'admin-verifications', label: 'Review Employer Verification' };
    }

    // 4. Applications (seeker)
    if (rawLink.includes('application') || title.includes('application') || title.includes('apply') || message.includes('application')) {
      return { view: 'seeker-applications', label: 'View Application Status' };
    }

    // 5. Job Search / Vacancy
    if (rawLink.includes('job') || title.includes('job') || message.includes('vacancy') || message.includes('job')) {
      return { view: 'jobs', label: 'Explore Job Vacancy' };
    }

    // 6. Profile
    if (rawLink.includes('profile') || title.includes('profile') || message.includes('profile')) {
      const target = currentUser.role === 'employer' ? 'employer-profile' : 'seeker-profile';
      return { view: target, label: 'View Profile' };
    }

    // 7. Helpdesk / Guidance Message
    if (title.includes('message') || message.includes('helpdesk') || message.includes('guidance')) {
      return { view: currentUser.role === 'employer' ? 'employer-dashboard' : 'seeker-dashboard', label: 'Open PESO Helpdesk' };
    }

    // 8. Reports / Audit (admin)
    if (rawLink.includes('report') || title.includes('report')) {
      return { view: 'admin-reports', label: 'View Labor Reports' };
    }

    // 9. Default based on role
    if (currentUser.role === 'employer') {
      return { view: 'employer-dashboard', label: 'Go to Employer Dashboard' };
    }
    if (currentUser.role === 'admin') {
      return { view: 'admin-dashboard', label: 'Go to PESO Admin Console' };
    }
    return { view: 'seeker-dashboard', label: 'Go to Job Seeker Dashboard' };
  };

  const getActionLabel = (notif: NotificationItem) => {
    return resolveTargetView(notif).label;
  };

  const handleNavigateFromNotif = (notif: NotificationItem) => {
    if (!notif.read) {
      markNotificationRead(notif.id);
    }

    const target = resolveTargetView(notif);

    showToast({
      title: `${target.label}`,
      message: `Navigating to ${target.view.replace(/-/g, ' ')}...`,
      type: 'info'
    });

    onClose();

    if (onNavigate) {
      onNavigate(target.view, target.params);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden animate-in fade-in duration-150 select-none">
      <div className="min-h-screen bg-white flex flex-col justify-start py-4 sm:py-6 px-4">
        
        {/* Full Window Container */}
        <div className="max-w-md sm:max-w-xl mx-auto w-full space-y-5">

          {/* ======================================================== */}
          {/* VIEW A: SINGLE NOTIFICATION DETAIL WINDOW               */}
          {/* ======================================================== */}
          {selectedNotif ? (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Top Header Bar */}
              <div className="flex items-center justify-between py-1">
                <button
                  type="button"
                  onClick={() => setSelectedNotif(null)}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer active:scale-95"
                  title="Back to notifications list"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>

                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight text-center">
                  Notification Details
                </h1>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer active:scale-95"
                  title="Close Window"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Detail Content Card */}
              <div className="bg-[#f8f9fa] border border-slate-200/80 rounded-3xl p-6 sm:p-7 space-y-4">
                
                {/* Notification Icon & Type Badge */}
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                    selectedNotif.type === 'success' || /success|hired|confirmed/i.test(selectedNotif.title)
                      ? 'bg-emerald-600 shadow-emerald-500/20'
                      : selectedNotif.type === 'warning' || (selectedNotif.type as string) === 'alert' || /warning|alert/i.test(selectedNotif.title)
                      ? 'bg-amber-600 shadow-amber-500/20'
                      : selectedNotif.type === 'action' || /interview|schedule/i.test(selectedNotif.title)
                      ? 'bg-blue-600 shadow-blue-500/20'
                      : 'bg-[#2331ea] shadow-blue-600/20'
                  }`}>
                    {selectedNotif.type === 'success' || /success|hired|confirmed/i.test(selectedNotif.title) ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : selectedNotif.type === 'warning' || (selectedNotif.type as string) === 'alert' || /warning|alert/i.test(selectedNotif.title) ? (
                      <AlertTriangle className="w-6 h-6" />
                    ) : selectedNotif.type === 'action' || /interview|schedule/i.test(selectedNotif.title) ? (
                      <Calendar className="w-6 h-6" />
                    ) : (
                      <Bell className="w-6 h-6" />
                    )}
                  </div>

                  <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full uppercase tracking-wider">
                    {selectedNotif.type || 'System'} Alert
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    {selectedNotif.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(selectedNotif.createdAt).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80">
                  <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {selectedNotif.message}
                  </p>
                </div>

                {/* Context Chip */}
                <div className="p-3 bg-white/70 rounded-2xl border border-slate-200/70 text-xs text-slate-500 flex items-center justify-between">
                  <span>Recipient Profile</span>
                  <span className="font-semibold text-slate-800">
                    {currentUser.name} ({currentUser.role.replace('_', ' ')})
                  </span>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleNavigateFromNotif(selectedNotif)}
                  className="w-full py-4 bg-[#2331ea] hover:bg-[#1a25c7] active:scale-[0.99] text-white font-bold text-base rounded-full shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{getActionLabel(selectedNotif)}</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedNotif(null)}
                  className="w-full py-3 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors text-center cursor-pointer"
                >
                  Return to Notification List
                </button>
              </div>

            </div>
          ) : (

          /* ======================================================== */
          /* VIEW B: MAIN NOTIFICATIONS LIST WINDOW                  */
          /* ======================================================== */
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Top Header Bar */}
              <div className="flex items-center justify-between py-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer active:scale-95"
                  title="Close and return to page"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>

                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight text-center">
                  Notifications
                </h1>

                {/* Mark all read button or balanced placeholder */}
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => markAllNotificationsRead(currentUser.id)}
                    className="text-xs font-semibold text-[#2331ea] hover:underline flex items-center gap-1 cursor-pointer"
                    title="Mark all notifications as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">Mark read</span>
                  </button>
                ) : (
                  <div className="w-10 h-10" />
                )}
              </div>

              {/* Centralized Category Filter Pills (Prompt Requirement 7: Status updates, system alerts, official PESO broadcasts) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All ({userNotifs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('status_updates')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'status_updates'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Status Updates ({statusCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('system_alerts')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'system_alerts'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  System Alerts ({alertCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('peso_broadcasts')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'peso_broadcasts'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  PESO Broadcasts ({broadcastCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('unread')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'unread'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Notifications List */}
              <div className="space-y-2.5">
                {displayedNotifs.length === 0 ? (
                  <div className="py-16 text-center space-y-3 bg-[#f8f9fa] border border-slate-200/60 rounded-3xl p-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Bell className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">No notifications found</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                        {activeTab === 'unread' 
                          ? 'You are all caught up with recent messages!' 
                          : 'New job vacancy matches, interviews, and PESO alerts will appear here.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  displayedNotifs.map((n) => {
                    const isSuccess = n.type === 'success' || /success|hired|confirmed/i.test(n.title);
                    const isAlert = n.type === 'warning' || (n.type as string) === 'alert' || /warning|alert|compliance/i.test(n.title);
                    const isAction = n.type === 'action' || /interview|schedule/i.test(n.title);

                    return (
                      <div
                        key={n.id}
                        onClick={() => handleSelectNotif(n)}
                        className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                          !n.read 
                            ? 'bg-blue-50/40 border-blue-200/90 hover:bg-blue-50/70 shadow-2xs' 
                            : 'bg-[#f8f9fa] border-slate-200/70 hover:bg-slate-100'
                        }`}
                      >
                        {/* Icon Badge */}
                        <div className="mt-0.5 shrink-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${
                            isSuccess
                              ? 'bg-emerald-100 text-emerald-700'
                              : isAlert
                              ? 'bg-amber-100 text-amber-700'
                              : isAction
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {isSuccess ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : isAlert ? (
                              <AlertTriangle className="w-5 h-5" />
                            ) : isAction ? (
                              <Calendar className="w-5 h-5" />
                            ) : (
                              <Info className="w-5 h-5" />
                            )}
                          </div>
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                getNotificationCategory(n) === 'status_updates'
                                  ? 'bg-blue-100 text-blue-800'
                                  : getNotificationCategory(n) === 'peso_broadcasts'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {getNotificationCategory(n) === 'status_updates' ? 'Status' : getNotificationCategory(n) === 'peso_broadcasts' ? 'PESO Broadcast' : 'System Alert'}
                              </span>
                              <h3 className={`text-xs sm:text-sm leading-snug truncate ${!n.read ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                {n.title}
                              </h3>
                            </div>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-[#2331ea] shrink-0" />
                            )}
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                            {n.message}
                          </p>

                          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                            <span>
                              {new Date(n.createdAt).toLocaleDateString(undefined, { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>

                            <span className="text-[#2331ea] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                              <span>View</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Return Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors text-center cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
