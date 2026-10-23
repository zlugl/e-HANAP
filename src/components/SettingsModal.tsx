import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  User, 
  Bell, 
  Lock, 
  Briefcase, 
  Globe, 
  HelpCircle, 
  UserPlus, 
  LogOut, 
  Trash2, 
  Check, 
  ArrowLeft, 
  Phone, 
  Mail, 
  MessageCircle, 
  ShieldCheck,
  ChevronDown,
  Bookmark
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfileEdit: () => void;
  onOpenBookmarks?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenProfileEdit,
  onOpenBookmarks,
}) => {
  const { 
    currentUser, 
    currentSeekerProfile, 
    logout, 
    updateJobSeekingStatus, 
    updateNotificationPreferences,
    showToast,
    bookmarkedJobIds
  } = useApp();

  type SettingsScreen = 
    | 'main' 
    | 'notifications' 
    | 'password' 
    | 'job-status' 
    | 'language' 
    | 'help-center' 
    | 'invite-friends'
    | 'logout-confirm';

  const [activeScreen, setActiveScreen] = useState<SettingsScreen>('main');

  // Notification state
  const [notifToggles, setNotifToggles] = useState({
    generalNotification: true,
    notifyWhenJobAvailable: true,
    notifyWhenJobIsApplication: true,
    appUpdates: false,
    jobStatusUpdate: true,
  });

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Job Seeking Status
  const [selectedStatus, setSelectedStatus] = useState<
    'actively_looking' | 'passively_looking' | 'not_looking'
  >(currentSeekerProfile?.jobSeekingStatus || 'actively_looking');

  // Selected Language
  const [selectedLanguage, setSelectedLanguage] = useState(
    currentSeekerProfile?.languagePreference || 'English'
  );

  // Help Center Tab
  const [helpTab, setHelpTab] = useState<'faq' | 'contact'>('faq');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Invite Friends list state
  const [invitedMap, setInvitedMap] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert("Passwords must match and cannot be empty.");
      return;
    }
    showToast({
      title: "Password Updated",
      message: "Your account password has been successfully updated.",
      type: "success"
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setActiveScreen('main');
  };

  const handleSaveStatus = (status: 'actively_looking' | 'passively_looking' | 'not_looking') => {
    setSelectedStatus(status);
    if (currentSeekerProfile) {
      updateJobSeekingStatus(currentSeekerProfile.id, status);
    }
    showToast({
      title: "Job Seeking Status Updated",
      message: `Status set to: ${status.replace(/_/g, ' ')}.`,
      type: "success"
    });
  };

  const handleToggleNotification = (key: keyof typeof notifToggles) => {
    const updated = { ...notifToggles, [key]: !notifToggles[key] };
    setNotifToggles(updated);
    if (currentSeekerProfile) {
      updateNotificationPreferences(currentSeekerProfile.id, updated);
    }
  };

  const faqs = [
    {
      q: "How do I apply for jobs on eHANAP?",
      a: "Browse vacancies matching your skills, verify your Decision Tree match score, and tap 'Apply for Job'. Your registered resume and NC-II certifications are automatically transmitted to the employer."
    },
    {
      q: "How do I receive a PESO Referral Slip?",
      a: "When you qualify for a local vacancy or visit the PESO Desk at Roxas Municipal Hall, our labor officer issues an official referral slip for immediate employer endorsement."
    },
    {
      q: "Can I connect directly with recruiters?",
      a: "Yes! eHANAP provides official application submissions, PESO referrals, and interview schedule coordination with accredited HR officers."
    },
    {
      q: "Is my personal data protected under RA 10173?",
      a: "Yes, all seeker data is protected under the Philippine Data Privacy Act of 2012 and encrypted in compliance with DOLE-PESO guidelines."
    }
  ];

  const friendsList = [
    { id: 'f-1', name: 'Carla Serrano', phone: '0917-555-1234' },
    { id: 'f-2', name: 'Esther Howard', phone: '0918-444-5678' },
    { id: 'f-3', name: 'Jacob Jones', phone: '0920-333-8910' },
    { id: 'f-4', name: 'Darlene Robertson', phone: '0919-222-3456' },
    { id: 'f-5', name: 'Ralph Edwards', phone: '0921-111-7890' },
  ];

  const languages = [
    'English',
    'Filipino (Tagalog)',
    'French',
    'German',
    'Spanish',
    'Japanese',
    'Mandarin',
    'Arabic'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[88vh]"
      >
        {/* Dynamic Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            {activeScreen !== 'main' && (
              <button
                onClick={() => setActiveScreen('main')}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors -ml-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h3 className="text-base font-bold text-slate-900 capitalize">
              {activeScreen === 'main' && 'Settings'}
              {activeScreen === 'notifications' && 'Notification Settings'}
              {activeScreen === 'password' && 'Password Manager'}
              {activeScreen === 'job-status' && 'Job Seeking Status'}
              {activeScreen === 'language' && 'Language'}
              {activeScreen === 'help-center' && 'Help Center'}
              {activeScreen === 'invite-friends' && 'Invite Friends'}
              {activeScreen === 'logout-confirm' && 'Log Out'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Views */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* MAIN SETTINGS MENU */}
          {activeScreen === 'main' && (
            <div className="space-y-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenProfileEdit();
                }}
                className="w-full p-3.5 flex items-center justify-between rounded-2xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Personal Information</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {onOpenBookmarks && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenBookmarks();
                  }}
                  className="w-full p-3.5 flex items-center justify-between rounded-2xl hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Bookmarked Jobs</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    {bookmarkedJobIds && bookmarkedJobIds.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-200 text-[11px]">
                        {bookmarkedJobIds.length}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </button>
              )}

              <button
                onClick={() => setActiveScreen('notifications')}
                className="w-full p-3.5 flex items-center justify-between rounded-2xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Notification Settings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveScreen('password')}
                className="w-full p-3.5 flex items-center justify-between rounded-2xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Password Manager</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveScreen('job-status')}
                className="w-full p-3.5 flex items-center justify-between rounded-2xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Job Seeking Status</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveScreen('language')}
                className="w-full p-3.5 flex items-center justify-between rounded-2xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Language</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <span>{selectedLanguage}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              <button
                onClick={() => setActiveScreen('help-center')}
                className="w-full p-3.5 flex items-center justify-between rounded-2xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Help Center & Contact</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveScreen('invite-friends')}
                className="w-full p-3.5 flex items-center justify-between rounded-2xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Invite Friends</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => setActiveScreen('logout-confirm')}
                  className="w-full p-3.5 flex items-center justify-between rounded-2xl hover:bg-rose-50 transition-colors text-left text-rose-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">Log Out</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400" />
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATION SETTINGS */}
          {activeScreen === 'notifications' && (
            <div className="space-y-4">
              {[
                { key: 'generalNotification', label: 'General Notification', desc: 'System updates and community notices' },
                { key: 'notifyWhenJobAvailable', label: 'Notify when job is available', desc: 'Alerts matching your selected skills' },
                { key: 'notifyWhenJobIsApplication', label: 'Notify when application updates', desc: 'Status milestones from employers' },
                { key: 'jobStatusUpdate', label: 'Job Status Updates', desc: 'Hiring confirmations and interview calls' },
                { key: 'appUpdates', label: 'App Updates & Releases', desc: 'New feature updates for eHANAP' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <div className="pr-4">
                    <h5 className="text-xs font-bold text-slate-900">{item.label}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggleNotification(item.key as keyof typeof notifToggles)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      notifToggles[item.key as keyof typeof notifToggles] ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* PASSWORD MANAGER */}
          {activeScreen === 'password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all mt-4"
              >
                Create New Password
              </button>
            </form>
          )}

          {/* JOB SEEKING STATUS */}
          {activeScreen === 'job-status' && (
            <div className="space-y-3">
              {[
                {
                  id: 'actively_looking',
                  title: 'Actively Looking for Jobs',
                  desc: 'I am open to offers and ready for interviews immediately.',
                  badge: 'Recommended'
                },
                {
                  id: 'passively_looking',
                  title: 'Passively Looking for Jobs',
                  desc: 'Open to great opportunities, but not urgently seeking.',
                  badge: 'Flexible'
                },
                {
                  id: 'not_looking',
                  title: 'Not Looking for Jobs',
                  desc: 'Do not contact with new offers at this time.',
                  badge: 'Paused'
                }
              ].map((opt) => {
                const isSelected = selectedStatus === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSaveStatus(opt.id as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-slate-900">{opt.title}</h5>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LANGUAGE */}
          {activeScreen === 'language' && (
            <div className="space-y-2">
              {languages.map((lang) => {
                const isSelected = selectedLanguage === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLanguage(lang);
                      showToast({ title: "Language Changed", message: `System language set to ${lang}.`, type: "info" });
                    }}
                    className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-colors border ${
                      isSelected ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800">{lang}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* HELP CENTER & CONTACT */}
          {activeScreen === 'help-center' && (
            <div className="space-y-4">
              <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setHelpTab('faq')}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    helpTab === 'faq' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  FAQ
                </button>
                <button
                  onClick={() => setHelpTab('contact')}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    helpTab === 'contact' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Contact Us
                </button>
              </div>

              {helpTab === 'faq' ? (
                <div className="space-y-2.5">
                  {faqs.map((f, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-100 rounded-2xl p-3.5 bg-slate-50/50"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <span className="text-xs font-bold text-slate-900 pr-2">{f.q}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${
                          expandedFaq === idx ? 'rotate-180 text-blue-600' : ''
                        }`} />
                      </button>
                      {expandedFaq === idx && (
                        <p className="text-[11px] text-slate-600 mt-2 leading-relaxed pt-2 border-t border-slate-200">
                          {f.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {[
                    { label: 'Customer Service Hotline', val: '(043) 289-5021', icon: Phone },
                    { label: 'WhatsApp & SMS Support', val: '+63 919 555 0142', icon: MessageCircle },
                    { label: 'Official PESO Email', val: 'peso.roxas@ormindoro.gov.ph', icon: Mail },
                    { label: 'Municipal Hall Desk', val: 'Roxas Municipal Hall, Oriental Mindoro', icon: ShieldCheck },
                  ].map((c, i) => (
                    <div key={i} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <c.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 font-semibold">{c.label}</p>
                        <p className="text-xs font-bold text-slate-900 truncate">{c.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* INVITE FRIENDS */}
          {activeScreen === 'invite-friends' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Help friends and fellow Job Seekers in Roxas find verified local employment!
              </p>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {friendsList.map((friend) => (
                  <div key={friend.id} className="p-3.5 flex items-center justify-between gap-3 bg-white hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        {friend.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{friend.name}</h5>
                        <p className="text-[11px] text-slate-500 font-mono">{friend.phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setInvitedMap({ ...invitedMap, [friend.id]: true });
                        showToast({ title: "Invitation Sent", message: `Invite link dispatched to ${friend.name}.`, type: "success" });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        invitedMap[friend.id]
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                      }`}
                    >
                      {invitedMap[friend.id] ? 'Invited' : 'Invite'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LOGOUT CONFIRMATION (Exact match to design) */}
          {activeScreen === 'logout-confirm' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <LogOut className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Are you sure you want to log out?</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  You will need to sign in again to view your job applications, interviews, and PESO referrals.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={() => setActiveScreen('main')}
                  className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition-all"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
