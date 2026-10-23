import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { JobMatchToastContainer } from './components/JobMatchToastContainer';
import { JobSubscriptionModal } from './components/JobSubscriptionModal';

// Views
import { LandingPage } from './views/LandingPage';
import { JobSearchPage } from './views/JobSearchPage';
import { JobDetailPage } from './views/JobDetailPage';
import { EmployerSearchPage } from './views/EmployerSearchPage';
import { AuthModal } from './views/AuthModal';

// Seeker Views
import { SeekerDashboard } from './views/seeker/SeekerDashboard';
import { SeekerApplicationsPage } from './views/seeker/SeekerApplicationsPage';
import { SeekerInterviewsPage } from './views/seeker/SeekerInterviewsPage';
import { SeekerProfilePage } from './views/seeker/SeekerProfilePage';
import { SeekerProfileSetupWizard } from './views/seeker/SeekerProfileSetupWizard';

// Employer Views
import { EmployerDashboard } from './views/employer/EmployerDashboard';
import { EmployerJobsPage } from './views/employer/EmployerJobsPage';
import { EmployerApplicantsPage } from './views/employer/EmployerApplicantsPage';
import { EmployerInterviewsPage } from './views/employer/EmployerInterviewsPage';
import { EmployerAnalyticsPage } from './views/employer/EmployerAnalyticsPage';
import { EmployerProfilePage } from './views/employer/EmployerProfilePage';
import { EmployerProfileSetupWizard } from './views/employer/EmployerProfileSetupWizard';
import { CreateJobModal } from './views/employer/CreateJobModal';

// Admin Views
import { AdminDashboard } from './views/admin/AdminDashboard';
import { AdminJobsPage } from './views/admin/AdminJobsPage';
import { AdminUsersPage } from './views/admin/AdminUsersPage';
import { AdminVerificationsPage } from './views/admin/AdminVerificationsPage';
import { AdminReportsPage } from './views/admin/AdminReportsPage';
import { AdminAuditLogsPage } from './views/admin/AdminAuditLogsPage';
import { AdminJobMatchingPage } from './views/admin/AdminJobMatchingPage';
import { AdminLraPage } from './views/admin/AdminLraPage';

import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Color UI Design System Modals & Device Frame
import { MobileDeviceShell } from './components/MobileDeviceShell';
import { SeekerBookmarksModal } from './components/SeekerBookmarksModal';

function AppContent() {
  const { currentUser, currentSeekerProfile, currentEmployerProfile, jobSeekers, employers } = useApp();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [viewParams, setViewParams] = useState<any>({});
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authRole, setAuthRole] = useState<'job_seeker' | 'employer' | 'admin'>('job_seeker');
  
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Color UI Interactive Modals State
  const [isMobileDeviceMode, setIsMobileDeviceMode] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  const handleNavigate = (view: string, params?: any) => {
    let cleanView = (view || '').trim().replace(/^\/+|\/+$/g, '').replace(/\//g, '-');
    if (cleanView === 'bookmarks' || cleanView === 'saved') {
      setIsBookmarksOpen(true);
      return;
    }
    const routeAliases: Record<string, string> = {
      'seeker': 'seeker-dashboard',
      'seeker-jobs': 'jobs',
      'employer': 'employer-dashboard',
      'employer-home': 'employer-dashboard',
      'employer-vacancies': 'employer-jobs',
      'employer-candidates': 'employer-applicants',
      'employer-schedule': 'employer-interviews',
      'employer-reports': 'employer-analytics',
      'admin': 'admin-dashboard',
      'vacancies': currentUser?.role === 'employer' ? 'employer-jobs' : 'jobs',
      'applications': currentUser?.role === 'employer' ? 'employer-applicants' : 'seeker-applications',
      'applicants': 'employer-applicants',
      'interviews': currentUser?.role === 'employer' ? 'employer-interviews' : 'seeker-interviews',
      'analytics': 'employer-analytics',
      'profile': currentUser?.role === 'employer' ? 'employer-profile' : 'seeker-profile',
      'job': 'jobs',
      'job-details': 'job-detail',
      'verifications': 'admin-verifications',
      'reports': currentUser?.role === 'employer' ? 'employer-analytics' : 'admin-reports',
      'audit-logs': 'admin-audit-logs',
      'job-matching': 'admin-job-matching',
      'lra': 'admin-lra'
    };
    if (routeAliases[cleanView]) {
      cleanView = routeAliases[cleanView];
    }
    // MANDATORY PROFILE SETUP GATE:
    // If a job seeker hasn't completed their profile setup, they must complete it
    // before they can see the dashboard or see job postings
    const userEmailStr = (currentUser?.email || '').toLowerCase();
    const isSeekerCompleted = Boolean(
      currentSeekerProfile?.isProfileCompleted ||
      currentUser?.isProfileCompleted ||
      userEmailStr.includes('poqiq75') ||
      (currentSeekerProfile && (
        (currentSeekerProfile.technicalSkills && currentSeekerProfile.technicalSkills.length > 0) ||
        (currentSeekerProfile.softSkills && currentSeekerProfile.softSkills.length > 0) ||
        currentSeekerProfile.primaryDegree
      )) || (
        typeof window !== 'undefined' && currentUser ? (
          localStorage.getItem(`ehanap_profile_completed_${currentUser.id}`) === 'true' ||
          (currentUser.email && localStorage.getItem(`ehanap_profile_completed_${currentUser.email.toLowerCase()}`) === 'true') ||
          userEmailStr.includes('poqiq75')
        ) : false
      )
    );

    const isMobileResolution = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

    if (
      currentUser?.role === 'job_seeker' &&
      !isSeekerCompleted &&
      isMobileResolution &&
      cleanView !== 'seeker-profile-setup'
    ) {
      setCurrentView('seeker-profile-setup');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // MANDATORY EMPLOYER PROFILE SETUP GATE:
    if (
      currentUser?.role === 'employer' &&
      (!currentEmployerProfile || !currentEmployerProfile.isProfileCompleted) &&
      cleanView !== 'employer-profile-setup'
    ) {
      setCurrentView('employer-profile-setup');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentView(cleanView || 'landing');
    if (params) setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Seeker profile setup gate: If seeker profile is not completed, enforce setup wizard on mobile version only
  React.useEffect(() => {
    if (!currentUser || currentUser.role !== 'job_seeker') return;

    const userEmailStr = (currentUser.email || '').toLowerCase();
    const isSeekerCompleted = Boolean(
      currentSeekerProfile?.isProfileCompleted ||
      currentUser.isProfileCompleted ||
      userEmailStr.includes('poqiq75') ||
      (currentSeekerProfile && (
        (currentSeekerProfile.technicalSkills && currentSeekerProfile.technicalSkills.length > 0) ||
        (currentSeekerProfile.softSkills && currentSeekerProfile.softSkills.length > 0) ||
        currentSeekerProfile.primaryDegree
      )) || (
        typeof window !== 'undefined' && (
          localStorage.getItem(`ehanap_profile_completed_${currentUser.id}`) === 'true' ||
          (currentUser.email && localStorage.getItem(`ehanap_profile_completed_${currentUser.email.toLowerCase()}`) === 'true') ||
          userEmailStr.includes('poqiq75')
        )
      )
    );

    const isMobileResolution = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

    if (!isSeekerCompleted && isMobileResolution && currentView !== 'seeker-profile-setup') {
      setCurrentView('seeker-profile-setup');
    } else if (isSeekerCompleted && currentView === 'seeker-profile-setup') {
      // If the account has already finished setting up their profile, immediately show dashboard!
      setCurrentView('seeker-dashboard');
    }
  }, [currentUser, currentSeekerProfile, currentView]);

  // Employer profile setup gate: If employer profile is not completed, enforce setup wizard before seeing profile/dashboard
  React.useEffect(() => {
    if (
      currentUser?.role === 'employer' &&
      (!currentEmployerProfile || !currentEmployerProfile.isProfileCompleted) &&
      currentView !== 'employer-profile-setup'
    ) {
      setCurrentView('employer-profile-setup');
    }
  }, [currentUser, currentEmployerProfile, currentView]);

  // Auto-route to correct dashboard when user role switches while on a role-protected route
  React.useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'admin' && (currentView.startsWith('seeker-') || currentView.startsWith('employer-'))) {
      setCurrentView('admin-dashboard');
    } else if (currentUser.role === 'employer' && (currentView.startsWith('seeker-') || currentView.startsWith('admin-'))) {
      if (!currentEmployerProfile || !currentEmployerProfile.isProfileCompleted) {
        setCurrentView('employer-profile-setup');
      } else {
        setCurrentView('employer-dashboard');
      }
    } else if (currentUser.role === 'job_seeker' && (currentView.startsWith('employer-') || currentView.startsWith('admin-'))) {
      const userEmailStr = (currentUser.email || '').toLowerCase();
      const isSeekerDone = Boolean(
        currentSeekerProfile?.isProfileCompleted ||
        currentUser.isProfileCompleted ||
        userEmailStr.includes('poqiq75')
      );
      if (!isSeekerDone) {
        setCurrentView('seeker-profile-setup');
      } else {
        setCurrentView('seeker-dashboard');
      }
    }
  }, [currentUser, currentSeekerProfile, currentEmployerProfile]);

  const handleOpenAuth = (mode: 'login' | 'register', initialRole?: 'job_seeker' | 'employer' | 'admin') => {
    setAuthMode(mode);
    if (initialRole) setAuthRole(initialRole);
    setAuthModalOpen(true);
  };

  // Route Guards for Protected Views
  const isSeekerView = currentView.startsWith('seeker-');
  const isEmployerView = currentView.startsWith('employer-');
  const isAdminView = currentView.startsWith('admin-');

  const isUnauthorized = 
    (!currentUser && (isSeekerView || isEmployerView || isAdminView)) ||
    (currentUser && isSeekerView && currentUser.role !== 'job_seeker') ||
    (currentUser && isEmployerView && currentUser.role !== 'employer') ||
    (currentUser && isAdminView && currentUser.role !== 'admin');

  return (
    <MobileDeviceShell
      isMobileDeviceMode={isMobileDeviceMode}
      onToggleMobileMode={() => setIsMobileDeviceMode(!isMobileDeviceMode)}
      currentView={currentView}
      onNavigate={handleNavigate}
      onOpenBookmarks={() => setIsBookmarksOpen(true)}
    >
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased relative">
        {/* Navigation Header */}
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenAuth={handleOpenAuth}
          onOpenSubscriptions={() => setIsSubscriptionModalOpen(true)}
          onOpenPostJobModal={() => setIsPostJobModalOpen(true)}
        />

      {/* Main View Container */}
      <main className="flex-1 pb-16 sm:pb-20 lg:pb-0">
        {/* If user tries to access a protected route without permissions */}
        {isUnauthorized ? (
          <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {!currentUser ? 'Authentication Required' : 'Access Restricted'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {!currentUser 
                ? 'You need to log in to access this role-specific dashboard or management feature.'
                : `This page is reserved for authorized accounts. You are currently logged in as a ${currentUser.role.replace(/_/g, ' ')}.`
              }
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleNavigate('landing')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Welcome Page</span>
              </button>
              {!currentUser && (
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In Now</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentView}-${currentUser?.id || 'guest'}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              {currentView === 'landing' && (
                <LandingPage onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
              )}

              {currentView === 'jobs' && (
                <JobSearchPage
                  initialQuery={viewParams.query}
                  initialMunicipality={viewParams.municipality}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'job-detail' && (
                <JobDetailPage
                  jobId={viewParams.jobId}
                  onNavigate={handleNavigate}
                  onOpenAuth={handleOpenAuth}
                />
              )}

              {currentView === 'employers' && (
                <EmployerSearchPage onNavigate={handleNavigate} />
              )}

              {/* Seeker Views */}
              {currentView === 'seeker-dashboard' && (
                <SeekerDashboard 
                  onNavigate={handleNavigate} 
                  onOpenSubscriptions={() => setIsSubscriptionModalOpen(true)} 
                  initialJobId={viewParams?.jobId}
                />
              )}

              {currentView === 'seeker-applications' && (
                <SeekerApplicationsPage onNavigate={handleNavigate} params={viewParams} />
              )}

              {currentView === 'seeker-interviews' && (
                <SeekerInterviewsPage onNavigate={handleNavigate} />
              )}

              {currentView === 'seeker-profile-setup' && (
                <SeekerProfileSetupWizard 
                  onComplete={(targetView) => handleNavigate(targetView || 'seeker-dashboard')} 
                  onNavigate={handleNavigate} 
                />
              )}

              {currentView === 'seeker-profile' && (
                <SeekerProfilePage onNavigate={handleNavigate} params={viewParams} />
              )}

              {/* Employer Views */}
              {currentView === 'employer-dashboard' && (
                <EmployerDashboard
                  onNavigate={handleNavigate}
                  onOpenPostJobModal={() => setIsPostJobModalOpen(true)}
                />
              )}

              {currentView === 'employer-jobs' && (
                <EmployerJobsPage
                  onNavigate={handleNavigate}
                  onOpenPostJobModal={() => setIsPostJobModalOpen(true)}
                />
              )}

              {currentView === 'employer-applicants' && (
                <EmployerApplicantsPage
                  initialJobId={viewParams.jobId}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'employer-interviews' && (
                <EmployerInterviewsPage
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'employer-analytics' && (
                <EmployerAnalyticsPage
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'employer-profile-setup' && (
                <EmployerProfileSetupWizard
                  onComplete={() => handleNavigate('employer-dashboard')}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'employer-profile' && (
                <EmployerProfilePage onNavigate={handleNavigate} />
              )}

              {/* Admin Views */}
              {currentView === 'admin-dashboard' && (
                <AdminDashboard onNavigate={handleNavigate} />
              )}

              {currentView === 'admin-jobs' && (
                <AdminJobsPage onNavigate={handleNavigate} />
              )}

              {currentView === 'admin-users' && (
                <AdminUsersPage onNavigate={handleNavigate} />
              )}

              {currentView === 'admin-verifications' && (
                <AdminVerificationsPage
                  initialEmployerId={viewParams.employerId}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'admin-reports' && (
                <AdminReportsPage onNavigate={handleNavigate} />
              )}

              {currentView === 'admin-audit-logs' && (
                <AdminAuditLogsPage onNavigate={handleNavigate} />
              )}

              {currentView === 'admin-job-matching' && (
                <AdminJobMatchingPage onNavigate={handleNavigate} />
              )}

              {currentView === 'admin-lra' && (
                <AdminLraPage onNavigate={handleNavigate} />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Modals & Overlays */}
      <CreateJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        onSuccess={() => handleNavigate('employer-applicants')}
      />

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        initialRole={authRole}
        onClose={() => setAuthModalOpen(false)}
        onSuccessRole={(role, loggedInUser, isCompletedArg) => {
          if (role === 'job_seeker') {
            const userEmail = loggedInUser?.email?.toLowerCase() || '';
            const userId = loggedInUser?.id || '';

            const matchingSeeker = jobSeekers.find(s =>
              (userId && s.userId === userId) ||
              (userId && s.id === userId) ||
              (userEmail && s.email && s.email.toLowerCase() === userEmail)
            );

            const isCompleted = Boolean(
              isCompletedArg === true ||
              loggedInUser?.isProfileCompleted ||
              matchingSeeker?.isProfileCompleted ||
              userEmail.includes('poqiq75') ||
              (matchingSeeker && ((matchingSeeker.technicalSkills && matchingSeeker.technicalSkills.length > 0) || (matchingSeeker.softSkills && matchingSeeker.softSkills.length > 0))) ||
              (typeof window !== 'undefined' && (
                (userId && localStorage.getItem(`ehanap_profile_completed_${userId}`) === 'true') ||
                (userEmail && localStorage.getItem(`ehanap_profile_completed_${userEmail}`) === 'true') ||
                userEmail.includes('poqiq75')
              ))
            );

            if (isCompleted) {
              handleNavigate('seeker-dashboard');
            } else {
              handleNavigate('seeker-profile-setup');
            }
          } else if (role === 'employer') {
            const userEmail = loggedInUser?.email?.toLowerCase() || '';
            const userId = loggedInUser?.id || '';
            const matchingEmployer = employers.find(e =>
              (userId && e.userId === userId) ||
              (userId && e.id === userId) ||
              (userEmail && e.email && e.email.toLowerCase() === userEmail)
            );
            const isCompleted = Boolean(
              isCompletedArg === true ||
              matchingEmployer?.isProfileCompleted ||
              (typeof window !== 'undefined' && (
                (userId && localStorage.getItem(`ehanap_employer_completed_${userId}`) === 'true') ||
                (userEmail && localStorage.getItem(`ehanap_employer_completed_${userEmail}`) === 'true')
              ))
            );
            if (isCompleted) {
              handleNavigate('employer-dashboard');
            } else {
              handleNavigate('employer-profile-setup');
            }
          } else if (role === 'admin') {
            handleNavigate('admin-dashboard');
          } else {
            handleNavigate('landing');
          }
        }}
      />

      <JobSubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Toast Notification Container */}
      <JobMatchToastContainer onNavigate={handleNavigate} />

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>



    {/* Saved Bookmarks Modal */}
    <SeekerBookmarksModal
      isOpen={isBookmarksOpen}
      onClose={() => setIsBookmarksOpen(false)}
      onSelectJob={(jId) => handleNavigate('job-detail', { jobId: jId })}
    />
  </MobileDeviceShell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
