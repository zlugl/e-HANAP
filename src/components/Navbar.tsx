import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { NotificationDrawer } from './NotificationDrawer';
import { getFilteredUserNotifications } from '../utils/notificationUtils';
import { 
  Briefcase, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Building2, 
  ShieldCheck, 
  Menu, 
  X, 
  Sparkles,
  FileText,
  Calendar,
  Layers,
  Award,
  ChevronDown,
  PlusCircle,
  Users,
  FileCheck2,
  BarChart3,
  FileSpreadsheet,
  Megaphone,
  History,
  Settings,
  HelpCircle,
  Home,
  CheckCircle,
  UserCheck,
  Clock,
  Database,
  LogIn,
  Send,
  Play,
  MessageCircle,
  Key,
  Lock
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode: 'login' | 'register', initialRole?: 'job_seeker' | 'employer') => void;
  onOpenSubscriptions?: () => void;
  onOpenPostJobModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  onNavigate, 
  onOpenAuth, 
  onOpenSubscriptions,
  onOpenPostJobModal
}) => {
  const { 
    currentUser, 
    logout, 
    notifications, 
    applications,
    interviews,
    referralSlips,
    isFirestoreConnected, 
    isSyncing, 
    jobPosts, 
    currentEmployerProfile, 
    currentSeekerProfile 
  } = useApp();

  const userEmail = (currentUser?.email || '').toLowerCase();
  const isSeekerIncomplete = currentUser?.role === 'job_seeker' && !(
    currentSeekerProfile?.isProfileCompleted ||
    currentUser?.isProfileCompleted ||
    userEmail.includes('poqiq75') ||
    (currentSeekerProfile && ((currentSeekerProfile.technicalSkills && currentSeekerProfile.technicalSkills.length > 0) || (currentSeekerProfile.softSkills && currentSeekerProfile.softSkills.length > 0))) || (
      typeof window !== 'undefined' && currentUser && (
        localStorage.getItem(`ehanap_profile_completed_${currentUser.id}`) === 'true' ||
        (currentUser.email && localStorage.getItem(`ehanap_profile_completed_${currentUser.email.toLowerCase()}`) === 'true') ||
        userEmail.includes('poqiq75')
      )
    )
  );
  const isEmployerIncomplete = currentUser?.role === 'employer' && (!currentEmployerProfile || !currentEmployerProfile.isProfileCompleted);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userNotifs = currentUser 
    ? getFilteredUserNotifications(
        notifications,
        currentUser,
        currentSeekerProfile,
        applications,
        interviews,
        referralSlips
      )
    : [];
  const unreadNotifs = userNotifs.filter(n => !n.read).length;

  const handleNav = (view: string) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    onNavigate('landing');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & LGU Oriental Mindoro Seal */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleNav(
                currentUser?.role === 'job_seeker' ? (isSeekerIncomplete ? 'seeker-profile-setup' : 'seeker-dashboard') :
                currentUser?.role === 'employer' ? (isEmployerIncomplete ? 'employer-profile-setup' : 'employer-dashboard') :
                currentUser?.role === 'admin' ? 'admin-dashboard' : 'landing'
              )}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-slate-900 font-sans">
                    e<span className="text-indigo-600">HANAP</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200/60">
                    PESO Roxas
                  </span>
                  {isFirestoreConnected && (
                    <span 
                      className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200"
                      title="Real-time Firebase Firestore database active"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`}></span>
                      <span>Firestore</span>
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wide">
                  📍 Roxas, Oriental Mindoro
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-stretch h-16 gap-1 sm:gap-2 text-xs font-semibold">
            
            {/* GUEST (NOT LOGGED IN) NAVIGATION */}
            {!currentUser && (
              <>
                <button
                  onClick={() => handleNav('landing')}
                  className={`h-full flex flex-col items-center justify-center px-3.5 sm:px-4 border-b-2 transition-all cursor-pointer text-xs group ${
                    currentView === 'landing'
                      ? 'border-indigo-600 font-bold'
                      : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                  title="Home"
                >
                  <Home className={`w-5 h-5 mb-0.5 ${currentView === 'landing' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`} />
                  <span className={currentView === 'landing' ? 'text-indigo-600' : 'group-hover:text-slate-900'}>Home</span>
                </button>

                <button
                  onClick={() => handleNav('jobs')}
                  className={`h-full flex flex-col items-center justify-center px-3.5 sm:px-4 border-b-2 transition-all cursor-pointer text-xs group ${
                    currentView === 'jobs'
                      ? 'border-indigo-600 font-bold'
                      : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                  title="Find Jobs"
                >
                  <Search className={`w-5 h-5 mb-0.5 ${currentView === 'jobs' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`} />
                  <span className={currentView === 'jobs' ? 'text-indigo-600' : 'group-hover:text-slate-900'}>Find Jobs</span>
                </button>

                <button
                  onClick={() => handleNav('employers')}
                  className={`h-full flex flex-col items-center justify-center px-3.5 sm:px-4 border-b-2 transition-all cursor-pointer text-xs group ${
                    currentView === 'employers'
                      ? 'border-indigo-600 font-bold'
                      : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                  title="Employers"
                >
                  <Building2 className={`w-5 h-5 mb-0.5 ${currentView === 'employers' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`} />
                  <span className={currentView === 'employers' ? 'text-indigo-600' : 'group-hover:text-slate-900'}>Employers</span>
                </button>

                <button
                  onClick={() => {
                    handleNav('landing');
                    setTimeout(() => {
                      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="h-full flex flex-col items-center justify-center px-3 border-b-2 border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors text-xs font-medium cursor-pointer group"
                >
                  <HelpCircle className="w-5 h-5 mb-0.5 text-slate-500 group-hover:text-slate-800" />
                  <span>How It Works</span>
                </button>

                <button
                  onClick={() => {
                    handleNav('landing');
                    setTimeout(() => {
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="h-full flex flex-col items-center justify-center px-3 border-b-2 border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors text-xs font-medium cursor-pointer group"
                >
                  <Briefcase className="w-5 h-5 mb-0.5 text-slate-500 group-hover:text-slate-800" />
                  <span>About eHANAP</span>
                </button>
              </>
            )}

            {/* JOB SEEKER NAVIGATION */}
            {currentUser?.role === 'job_seeker' && (
              <>
                {isSeekerIncomplete ? (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 my-auto bg-amber-50 border border-amber-200/90 rounded-xl text-amber-900 text-xs font-bold shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Complete Profile Setup (Required to Unlock Dashboard & Jobs)</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleNav('seeker-dashboard')}
                      className={`h-full flex flex-col items-center justify-center px-3.5 sm:px-4 border-b-2 transition-all cursor-pointer text-xs group ${
                        currentView === 'seeker-dashboard'
                          ? 'border-indigo-600 font-bold'
                          : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                      }`}
                      title="Home"
                    >
                      <Home className={`w-5 h-5 mb-0.5 ${currentView === 'seeker-dashboard' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`} />
                      <span className={currentView === 'seeker-dashboard' ? 'text-indigo-600' : 'group-hover:text-slate-900'}>Home</span>
                    </button>

                    <button
                      onClick={() => handleNav('jobs')}
                      className={`h-full flex flex-col items-center justify-center px-3.5 sm:px-4 border-b-2 transition-all cursor-pointer text-xs group ${
                        currentView === 'jobs'
                          ? 'border-indigo-600 font-bold'
                          : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                      }`}
                      title="Search Jobs"
                    >
                      <Search className={`w-5 h-5 mb-0.5 ${currentView === 'jobs' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`} />
                      <span className={currentView === 'jobs' ? 'text-indigo-600' : 'group-hover:text-slate-900'}>Search Jobs</span>
                    </button>

                    <button
                      onClick={() => handleNav('seeker-applications')}
                      className={`h-full flex flex-col items-center justify-center px-3.5 sm:px-4 border-b-2 transition-all cursor-pointer text-xs group ${
                        currentView === 'seeker-applications'
                          ? 'border-indigo-600 font-bold'
                          : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                      }`}
                      title="Applications"
                    >
                      <FileCheck2 className={`w-5 h-5 mb-0.5 ${currentView === 'seeker-applications' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`} />
                      <span className={currentView === 'seeker-applications' ? 'text-indigo-600' : 'group-hover:text-slate-900'}>Applications</span>
                    </button>

                    <button
                      onClick={() => handleNav('seeker-interviews')}
                      className={`h-full flex flex-col items-center justify-center px-3.5 sm:px-4 border-b-2 transition-all cursor-pointer text-xs group ${
                        currentView === 'seeker-interviews'
                          ? 'border-indigo-600 font-bold'
                          : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                      }`}
                      title="Interviews"
                    >
                      <Calendar className={`w-5 h-5 mb-0.5 ${currentView === 'seeker-interviews' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`} />
                      <span className={currentView === 'seeker-interviews' ? 'text-indigo-600' : 'group-hover:text-slate-900'}>Interviews</span>
                    </button>
                  </>
                )}
              </>
            )}

            {/* EMPLOYER NAVIGATION */}
            {currentUser?.role === 'employer' && (
              <>
                <button
                  onClick={() => handleNav('employer-dashboard')}
                  className={`h-full flex flex-col items-center justify-center px-3 sm:px-3.5 border-b-2 transition-all cursor-pointer text-xs group ${
                    currentView === 'employer-dashboard'
                      ? 'border-blue-600 font-bold'
                      : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                  title="Employer Home"
                >
                  <Home className={`w-5 h-5 mb-0.5 ${currentView === 'employer-dashboard' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`} />
                  <span className={currentView === 'employer-dashboard' ? 'text-blue-700' : 'group-hover:text-slate-900'}>Home</span>
                </button>

                <button
                  onClick={() => handleNav('employer-jobs')}
                  className={`h-full flex flex-col items-center justify-center px-3 sm:px-3.5 border-b-2 transition-all cursor-pointer text-xs group ${
                    currentView === 'employer-jobs'
                      ? 'border-blue-600 font-bold'
                      : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                  title="Job Vacancies"
                >
                  <Briefcase className={`w-5 h-5 mb-0.5 ${currentView === 'employer-jobs' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`} />
                  <span className={currentView === 'employer-jobs' ? 'text-blue-700' : 'group-hover:text-slate-900'}>Vacancies</span>
                </button>

                <button
                  onClick={() => handleNav('employer-applicants')}
                  className={`h-full flex flex-col items-center justify-center px-3 sm:px-3.5 border-b-2 transition-all cursor-pointer text-xs group ${
                    currentView === 'employer-applicants'
                      ? 'border-blue-600 font-bold'
                      : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                  title="Candidates & Ranking"
                >
                  <Users className={`w-5 h-5 mb-0.5 ${currentView === 'employer-applicants' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`} />
                  <span className={currentView === 'employer-applicants' ? 'text-blue-700' : 'group-hover:text-slate-900'}>Candidates</span>
                </button>

                <button
                  onClick={() => handleNav('employer-interviews')}
                  className={`h-full flex flex-col items-center justify-center px-3 sm:px-3.5 border-b-2 transition-all cursor-pointer text-xs group ${
                    currentView === 'employer-interviews'
                      ? 'border-blue-600 font-bold'
                      : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                  title="Interview Schedule"
                >
                  <Calendar className={`w-5 h-5 mb-0.5 ${currentView === 'employer-interviews' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`} />
                  <span className={currentView === 'employer-interviews' ? 'text-blue-700' : 'group-hover:text-slate-900'}>Interviews</span>
                </button>

                <button
                  onClick={() => handleNav('employer-analytics')}
                  className={`h-full flex flex-col items-center justify-center px-3 sm:px-3.5 border-b-2 transition-all cursor-pointer text-xs group ${
                    currentView === 'employer-analytics'
                      ? 'border-blue-600 font-bold'
                      : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                  title="Recruitment Analytics"
                >
                  <BarChart3 className={`w-5 h-5 mb-0.5 ${currentView === 'employer-analytics' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`} />
                  <span className={currentView === 'employer-analytics' ? 'text-blue-700' : 'group-hover:text-slate-900'}>Analytics</span>
                </button>

                <button
                  onClick={() => handleNav('employer-profile')}
                  className={`h-full flex flex-col items-center justify-center px-3 sm:px-3.5 border-b-2 transition-all cursor-pointer text-xs group ${
                    currentView === 'employer-profile'
                      ? 'border-blue-600 font-bold'
                      : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                  title="Company Profile"
                >
                  <Building2 className={`w-5 h-5 mb-0.5 ${currentView === 'employer-profile' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`} />
                  <span className={currentView === 'employer-profile' ? 'text-blue-700' : 'group-hover:text-slate-900'}>Profile</span>
                </button>

                {onOpenPostJobModal && (
                  <div className="flex items-center pl-1.5">
                    <button
                      onClick={onOpenPostJobModal}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors flex items-center gap-1.5 shadow-xs text-xs cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Post Job</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* PESO/LGU ADMIN NAVIGATION */}
            {currentUser?.role === 'admin' && (
              <>
                <button
                  onClick={() => handleNav('admin-dashboard')}
                  className={`h-full flex flex-col items-center justify-center px-3 border-b-2 transition-all cursor-pointer text-xs group ${
                    currentView === 'admin-dashboard'
                      ? 'border-amber-500 font-bold'
                      : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                  title="Admin Home"
                >
                  <Home className={`w-5 h-5 mb-0.5 ${currentView === 'admin-dashboard' ? 'text-amber-800' : 'text-slate-500 group-hover:text-amber-700'}`} />
                  <span className={currentView === 'admin-dashboard' ? 'text-amber-900' : 'group-hover:text-slate-900'}>Home</span>
                </button>

                <button
                  onClick={() => handleNav('admin-verifications')}
                  className={`h-full flex flex-col items-center justify-center px-3 border-b-2 transition-all cursor-pointer text-xs group ${
                    currentView === 'admin-verifications'
                      ? 'border-amber-500 font-bold'
                      : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                  title="Verify Employers"
                >
                  <ShieldCheck className={`w-5 h-5 mb-0.5 ${currentView === 'admin-verifications' ? 'text-amber-800' : 'text-slate-500 group-hover:text-amber-700'}`} />
                  <span className={currentView === 'admin-verifications' ? 'text-amber-900' : 'group-hover:text-slate-900'}>Verify</span>
                </button>

                <button
                  onClick={() => handleNav('admin-jobs')}
                  className={`h-full flex flex-col items-center justify-center px-3 border-b-2 transition-all cursor-pointer text-xs group ${
                    currentView === 'admin-jobs'
                      ? 'border-amber-500 font-bold'
                      : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                  title="Monitor Jobs"
                >
                  <Briefcase className={`w-5 h-5 mb-0.5 ${currentView === 'admin-jobs' ? 'text-amber-800' : 'text-slate-500 group-hover:text-amber-700'}`} />
                  <span className={currentView === 'admin-jobs' ? 'text-amber-900' : 'group-hover:text-slate-900'}>Jobs</span>
                </button>

                <button
                  onClick={() => handleNav('admin-users')}
                  className={`h-full flex flex-col items-center justify-center px-3 border-b-2 transition-all cursor-pointer text-xs group ${
                    currentView === 'admin-users'
                      ? 'border-amber-500 font-bold'
                      : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                  title="User Registry"
                >
                  <Users className={`w-5 h-5 mb-0.5 ${currentView === 'admin-users' ? 'text-amber-800' : 'text-slate-500 group-hover:text-amber-700'}`} />
                  <span className={currentView === 'admin-users' ? 'text-amber-900' : 'group-hover:text-slate-900'}>Registry</span>
                </button>

                <button
                  onClick={() => handleNav('admin-reports')}
                  className={`h-full flex flex-col items-center justify-center px-3 border-b-2 transition-all cursor-pointer text-xs group ${
                    currentView === 'admin-reports'
                      ? 'border-amber-500 font-bold'
                      : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                  title="Labor Reports"
                >
                  <FileSpreadsheet className={`w-5 h-5 mb-0.5 ${currentView === 'admin-reports' ? 'text-amber-800' : 'text-slate-500 group-hover:text-amber-700'}`} />
                  <span className={currentView === 'admin-reports' ? 'text-amber-900' : 'group-hover:text-slate-900'}>Reports</span>
                </button>

                <button
                  onClick={() => handleNav('admin-audit-logs')}
                  className={`h-full flex flex-col items-center justify-center px-3 border-b-2 transition-all cursor-pointer text-xs group ${
                    currentView === 'admin-audit-logs'
                      ? 'border-amber-500 font-bold'
                      : 'border-transparent text-slate-600 hover:border-slate-300 font-medium'
                  }`}
                  title="Audit Logs"
                >
                  <Clock className={`w-5 h-5 mb-0.5 ${currentView === 'admin-audit-logs' ? 'text-amber-800' : 'text-slate-500 group-hover:text-amber-700'}`} />
                  <span className={currentView === 'admin-audit-logs' ? 'text-amber-900' : 'group-hover:text-slate-900'}>Logs</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Job Alerts Quick Access Button (Seekers) */}
            {currentUser?.role === 'job_seeker' && onOpenSubscriptions && (
              <button
                onClick={onOpenSubscriptions}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200/80 transition-colors shadow-2xs"
                title="Manage Job Alert Subscriptions"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                <span className="hidden sm:inline">Job Alerts</span>
              </button>
            )}

            {/* Notification Bell */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifs > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifs}
                    </span>
                  )}
                </button>

                <NotificationDrawer
                  isOpen={isNotifOpen}
                  onClose={() => setIsNotifOpen(false)}
                  onNavigate={(path) => {
                    handleNav(path);
                  }}
                />
              </div>
            )}

            {/* Authenticated User Profile Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/30"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">{currentUser.name}</p>
                    <p className="text-[10px] text-indigo-600 capitalize font-medium">
                      {currentUser.role === 'admin' ? 'PESO/LGU Admin' : (currentUser?.role || '').replace(/_/g, ' ')}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                      <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                        {currentUser.role === 'admin' ? 'PESO/LGU Admin' : currentUser.role.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {currentUser.role === 'job_seeker' && (
                      <>
                        <button
                          onClick={() => handleNav('seeker-profile')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-emerald-600" />
                          My Profile & Resume
                        </button>
                        {onOpenSubscriptions && (
                          <button
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              onOpenSubscriptions();
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                          >
                            <Bell className="w-4 h-4 text-indigo-600" />
                            Job Alert Preferences
                          </button>
                        )}
                        <button
                          onClick={() => handleNav('seeker-profile')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4 text-slate-500" />
                          Settings
                        </button>
                      </>
                    )}

                    {currentUser.role === 'employer' && (
                      <>
                        <button
                          onClick={() => handleNav('employer-dashboard')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                        >
                          <Home className="w-4 h-4 text-blue-600" />
                          Dashboard Overview
                        </button>
                        <button
                          onClick={() => handleNav('employer-jobs')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                        >
                          <Briefcase className="w-4 h-4 text-blue-600" />
                          Job Vacancies ({jobPosts?.filter(j => j.employerId === currentEmployerProfile?.id).length || 0})
                        </button>
                        <button
                          onClick={() => handleNav('employer-applicants')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                        >
                          <Users className="w-4 h-4 text-blue-600" />
                          Candidates & Ranking
                        </button>
                        <button
                          onClick={() => handleNav('employer-interviews')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                        >
                          <Calendar className="w-4 h-4 text-amber-600" />
                          Interview Calendar
                        </button>
                        <button
                          onClick={() => handleNav('employer-analytics')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                        >
                          <BarChart3 className="w-4 h-4 text-indigo-600" />
                          Recruitment Analytics
                        </button>
                        <button
                          onClick={() => handleNav('employer-profile')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                        >
                          <Building2 className="w-4 h-4 text-blue-600" />
                          Company Profile & Compliance
                        </button>
                      </>
                    )}

                    {currentUser.role === 'admin' && (
                      <>
                        <button
                          onClick={() => handleNav('admin-dashboard')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          PESO Admin Center
                        </button>
                        <button
                          onClick={() => handleNav('admin-reports')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                          Generate Reports
                        </button>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>



                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-2.5 sm:px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Demo Accounts for Employers and PESO Admin"
                >
                  <Key className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Demo Logins</span>
                </button>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="hidden sm:inline-flex px-3.5 sm:px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Quick Navigation Bar (Swapped with old bar; only appears when logged in) */}
      {currentUser && (
        <div 
          aria-label="Mobile and Tablet Quick Navigation"
          className="lg:hidden w-full bg-white border-b border-slate-200/80 shadow-2xs select-none"
        >
          <div className="max-w-md sm:max-w-xl mx-auto px-2 sm:px-4 py-1.5">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 sm:gap-2">
              {currentUser.role === 'job_seeker' && (
                <>
                  <button
                    onClick={() => handleNav('seeker-dashboard')}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer text-xs ${
                      currentView === 'seeker-dashboard'
                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
                    }`}
                  >
                    <Home className={`w-5 h-5 mb-0.5 ${currentView === 'seeker-dashboard' ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span className="text-[10px] leading-tight">Home</span>
                  </button>
                  <button
                    onClick={() => handleNav('jobs')}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer text-xs ${
                      currentView === 'jobs'
                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
                    }`}
                  >
                    <Search className={`w-5 h-5 mb-0.5 ${currentView === 'jobs' ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span className="text-[10px] leading-tight">Jobs</span>
                  </button>
                  <button
                    onClick={() => handleNav('seeker-applications')}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer text-xs ${
                      currentView === 'seeker-applications'
                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
                    }`}
                  >
                    <FileCheck2 className={`w-5 h-5 mb-0.5 ${currentView === 'seeker-applications' ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span className="text-[10px] leading-tight">Applications</span>
                  </button>
                  <button
                    onClick={() => handleNav('seeker-interviews')}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer text-xs ${
                      currentView === 'seeker-interviews'
                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
                    }`}
                  >
                    <Calendar className={`w-5 h-5 mb-0.5 ${currentView === 'seeker-interviews' ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span className="text-[10px] leading-tight">Interviews</span>
                  </button>
                  <button
                    onClick={() => handleNav('seeker-profile')}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer text-xs ${
                      currentView === 'seeker-profile'
                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
                    }`}
                  >
                    <User className={`w-5 h-5 mb-0.5 ${currentView === 'seeker-profile' ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span className="text-[10px] leading-tight">Profile</span>
                  </button>
                </>
              )}

              {currentUser.role === 'employer' && (
                <>
                  <button
                    onClick={() => handleNav('employer-dashboard')}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer text-xs ${
                      currentView === 'employer-dashboard'
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
                    }`}
                  >
                    <Home className={`w-5 h-5 mb-0.5 ${currentView === 'employer-dashboard' ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="text-[10px] leading-tight">Home</span>
                  </button>
                  <button
                    onClick={() => handleNav('employer-jobs')}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer text-xs ${
                      currentView === 'employer-jobs'
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
                    }`}
                  >
                    <Briefcase className={`w-5 h-5 mb-0.5 ${currentView === 'employer-jobs' ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="text-[10px] leading-tight">Vacancies</span>
                  </button>
                  <button
                    onClick={() => handleNav('employer-applicants')}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer text-xs ${
                      currentView === 'employer-applicants'
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
                    }`}
                  >
                    <Users className={`w-5 h-5 mb-0.5 ${currentView === 'employer-applicants' ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="text-[10px] leading-tight">Candidates</span>
                  </button>
                  <button
                    onClick={() => handleNav('employer-interviews')}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer text-xs ${
                      currentView === 'employer-interviews'
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
                    }`}
                  >
                    <Calendar className={`w-5 h-5 mb-0.5 ${currentView === 'employer-interviews' ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="text-[10px] leading-tight">Interviews</span>
                  </button>
                  <button
                    onClick={() => handleNav('employer-profile')}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer text-xs ${
                      currentView === 'employer-profile'
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
                    }`}
                  >
                    <Building2 className={`w-5 h-5 mb-0.5 ${currentView === 'employer-profile' ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="text-[10px] leading-tight">Profile</span>
                  </button>
                </>
              )}

              {currentUser.role === 'admin' && (
                <>
                  <button
                    onClick={() => handleNav('admin-dashboard')}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer text-xs ${
                      currentView === 'admin-dashboard'
                        ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
                    }`}
                  >
                    <Home className={`w-5 h-5 mb-0.5 ${currentView === 'admin-dashboard' ? 'text-amber-700' : 'text-slate-500'}`} />
                    <span className="text-[10px] leading-tight">Home</span>
                  </button>
                  <button
                    onClick={() => handleNav('admin-verifications')}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer text-xs ${
                      currentView === 'admin-verifications'
                        ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
                    }`}
                  >
                    <ShieldCheck className={`w-5 h-5 mb-0.5 ${currentView === 'admin-verifications' ? 'text-amber-700' : 'text-slate-500'}`} />
                    <span className="text-[10px] leading-tight">Verify</span>
                  </button>
                  <button
                    onClick={() => handleNav('admin-jobs')}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer text-xs ${
                      currentView === 'admin-jobs'
                        ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
                    }`}
                  >
                    <Briefcase className={`w-5 h-5 mb-0.5 ${currentView === 'admin-jobs' ? 'text-amber-700' : 'text-slate-500'}`} />
                    <span className="text-[10px] leading-tight">Jobs</span>
                  </button>
                  <button
                    onClick={() => handleNav('admin-users')}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer text-xs ${
                      currentView === 'admin-users'
                        ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
                    }`}
                  >
                    <Users className={`w-5 h-5 mb-0.5 ${currentView === 'admin-users' ? 'text-amber-700' : 'text-slate-500'}`} />
                    <span className="text-[10px] leading-tight">Registry</span>
                  </button>
                  <button
                    onClick={() => handleNav('admin-reports')}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer text-xs ${
                      currentView === 'admin-reports'
                        ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium'
                    }`}
                  >
                    <FileSpreadsheet className={`w-5 h-5 mb-0.5 ${currentView === 'admin-reports' ? 'text-amber-700' : 'text-slate-500'}`} />
                    <span className="text-[10px] leading-tight">Reports</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-3 shadow-xl animate-in slide-in-from-top-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Detailed Navigation Item Rows with Icons */}
          <div className="space-y-1">
            {!currentUser ? (
              <>
                <button
                  onClick={() => handleNav('landing')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                    currentView === 'landing' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Home className={`w-4 h-4 ${currentView === 'landing' ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span>Welcome & Portal Overview</span>
                </button>
                <button
                  onClick={() => handleNav('jobs')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                    currentView === 'jobs' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Search className={`w-4 h-4 ${currentView === 'jobs' ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span>Find Jobs in Roxas</span>
                </button>
                <button
                  onClick={() => handleNav('employers')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                    currentView === 'employers' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className={`w-4 h-4 ${currentView === 'employers' ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span>Registered Employers</span>
                </button>
                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="w-full py-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Log In</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth('register');
                    }}
                    className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Create Account</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {currentUser?.role === 'admin' && (
                  <>
                    <button
                      onClick={() => handleNav('admin-dashboard')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                        currentView === 'admin-dashboard' ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Home className="w-4 h-4 text-amber-700" />
                      <span>Admin Overview</span>
                    </button>
                    <button
                      onClick={() => handleNav('admin-verifications')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                        currentView === 'admin-verifications' ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Verify Employers</span>
                    </button>
                    <button
                      onClick={() => handleNav('admin-jobs')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                        currentView === 'admin-jobs' ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 text-amber-700" />
                      <span>Monitor Job Postings</span>
                    </button>
                    <button
                      onClick={() => handleNav('admin-job-matching')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                        currentView === 'admin-job-matching' ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-700" />
                      <span>Rule-Based Matching & Referrals</span>
                    </button>
                    <button
                      onClick={() => handleNav('admin-lra')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                        currentView === 'admin-lra' ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-amber-700" />
                      <span>Visiting Companies (LRA)</span>
                    </button>
                    <button
                      onClick={() => handleNav('admin-users')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                        currentView === 'admin-users' ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Users className="w-4 h-4 text-amber-700" />
                      <span>User Registry (Seekers & Employers)</span>
                    </button>
                    <button
                      onClick={() => handleNav('admin-reports')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                        currentView === 'admin-reports' ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <FileSpreadsheet className="w-4 h-4 text-amber-700" />
                      <span>Labor Reports & Analytics</span>
                    </button>
                    <button
                      onClick={() => handleNav('admin-audit-logs')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                        currentView === 'admin-audit-logs' ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Clock className="w-4 h-4 text-amber-700" />
                      <span>Audit Logs</span>
                    </button>
                  </>
                )}

                {currentUser?.role === 'employer' && (
                  <>
                    <button
                      onClick={() => handleNav('employer-dashboard')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                        currentView === 'employer-dashboard' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Home className="w-4 h-4 text-blue-700" />
                      <span>Employer Dashboard</span>
                    </button>
                    <button
                      onClick={() => handleNav('employer-jobs')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                        currentView === 'employer-jobs' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 text-blue-700" />
                      <span>Job Vacancies & Postings</span>
                    </button>
                    <button
                      onClick={() => handleNav('employer-applicants')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                        currentView === 'employer-applicants' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Users className="w-4 h-4 text-blue-700" />
                      <span>Candidates & Ranking</span>
                    </button>
                    <button
                      onClick={() => handleNav('employer-interviews')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                        currentView === 'employer-interviews' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-blue-700" />
                      <span>Interview Schedule & Calendar</span>
                    </button>
                    <button
                      onClick={() => handleNav('employer-analytics')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                        currentView === 'employer-analytics' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 text-blue-700" />
                      <span>Recruitment Analytics & Reports</span>
                    </button>
                    <button
                      onClick={() => handleNav('employer-profile')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                        currentView === 'employer-profile' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-blue-700" />
                      <span>Company Profile & PESO Compliance</span>
                    </button>
                    {onOpenPostJobModal && (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onOpenPostJobModal();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2.5 transition-colors shadow-2xs mt-1"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Post New Job Vacancy</span>
                      </button>
                    )}
                  </>
                )}

                {currentUser?.role === 'job_seeker' && (
                  <>
                    {isSeekerIncomplete ? (
                      <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-2xl space-y-2 mb-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Candidate Profile Setup Required</span>
                        </div>
                        <p className="text-[11px] text-amber-700 leading-normal">
                          Complete your profile and skills inventory first to unlock the dashboard and local job vacancies.
                        </p>
                        <button
                          onClick={() => handleNav('seeker-profile-setup')}
                          className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Start Profile Set Up</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleNav('seeker-dashboard')}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                            currentView === 'seeker-dashboard' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Home className="w-4 h-4 text-indigo-700" />
                          <span>Job Seeker Dashboard</span>
                        </button>
                        <button
                          onClick={() => handleNav('jobs')}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                            currentView === 'jobs' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Search className="w-4 h-4 text-indigo-700" />
                          <span>Search Jobs</span>
                        </button>
                        <button
                          onClick={() => handleNav('seeker-applications')}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                            currentView === 'seeker-applications' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <FileCheck2 className="w-4 h-4 text-indigo-700" />
                          <span>My Applications</span>
                        </button>
                        <button
                          onClick={() => handleNav('seeker-interviews')}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                            currentView === 'seeker-interviews' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Calendar className="w-4 h-4 text-indigo-700" />
                          <span>My Interviews</span>
                        </button>
                        <button
                          onClick={() => handleNav('seeker-profile')}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                            currentView === 'seeker-profile' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <User className="w-4 h-4 text-indigo-700" />
                          <span>My Profile & Resume</span>
                        </button>
                      </>
                    )}
                  </>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </header>
  );
};
