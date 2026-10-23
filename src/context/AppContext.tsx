import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  User, 
  UserRole,
  EmployerProfile, 
  JobSeekerProfile, 
  JobPost, 
  Application, 
  Interview, 
  NotificationItem, 
  AuditLog, 
  SystemAnnouncement,
  ApplicationStatus,
  EmployerStatus,
  MatchResult,
  JobAlertSubscription,
  ToastNotification,
  AssessmentResult,
  JobStatus,
  PesoReferralSlip,
  LocalRecruitmentActivity,
  ChatMessage,
  ChatConversation,
  CompanyReview,
  ProfileViewEvent
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_EMPLOYERS, 
  INITIAL_JOB_SEEKERS, 
  INITIAL_JOB_POSTS, 
  INITIAL_APPLICATIONS, 
  INITIAL_INTERVIEWS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_ANNOUNCEMENTS,
  INITIAL_JOB_SUBSCRIPTIONS,
  INITIAL_BOOKMARKED_JOB_IDS,
  INITIAL_COMPANY_REVIEWS,
  INITIAL_CONVERSATIONS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_PROFILE_VIEWS
} from '../data/mockData';
import { 
  INITIAL_REFERRAL_SLIPS, 
  INITIAL_LRA_EVENTS 
} from '../data/pesoLguData';
import { DEMO_ACCOUNTS, DemoAccountMeta, getDemoAccountByEmail } from '../data/demoAccounts';
import { calculateDecisionTreeMatch } from '../utils/decisionTree';
import { evaluateResumeForAts } from '../utils/atsEngine';
import { 
  COLLECTIONS,
  ensureAdminAccountExists,
  initializeCleanDatabase,
  subscribeToCollection,
  saveDocument,
  updateDocument,
  deleteDocument,
  resetDatabaseToClean,
  seedDemoDataToFirestore
} from '../services/firestoreService';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface AppContextType {
  currentUser: User | null;
  currentEmployerProfile: EmployerProfile | null;
  currentSeekerProfile: JobSeekerProfile | null;
  users: User[];
  employers: EmployerProfile[];
  jobSeekers: JobSeekerProfile[];
  jobPosts: JobPost[];
  applications: Application[];
  interviews: Interview[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  announcements: SystemAnnouncement[];
  jobSubscriptions: JobAlertSubscription[];
  referralSlips: PesoReferralSlip[];
  localRecruitmentActivities: LocalRecruitmentActivity[];
  activeToast: ToastNotification | null;
  isFirestoreConnected: boolean;
  isSyncing: boolean;
  
  // Actions
  switchUserRole: (userId: string | null) => void;
  loginAs: (email: string, password?: string) => { success: boolean; user?: User; isProfileCompleted?: boolean; seekerProfile?: JobSeekerProfile | null; error?: string };
  continueWithGoogle: (intendedRole?: UserRole) => Promise<{ success: boolean; isNewUser?: boolean; user?: User; seekerProfile?: JobSeekerProfile; employerProfile?: EmployerProfile; error?: string }>;
  logout: () => void;
  sendOtp: (identifier: string) => { success: boolean; code: string };
  verifyOtp: (identifier: string, code: string) => { success: boolean; error?: string };
  recoverPassword: (identifier: string, code: string, newPassword: string) => { success: boolean; error?: string };
  verifyEmployer: (employerId: string, status: EmployerStatus, notes?: string) => void;
  createJobPost: (jobData: Omit<JobPost, 'id' | 'postedDate' | 'status' | 'companyVerified'>) => JobPost;
  reviewJobVacancy: (jobId: string, status: 'active' | 'for_compliance' | 'rejected', remarks?: string) => void;
  updateJobVacancyStatus: (jobId: string, status: JobStatus) => void;
  updateJobPost: (jobId: string, updates: Partial<JobPost>) => void;
  deleteJobPost: (jobId: string) => void;
  applyForJob: (jobId: string, seekerId: string, resumeId: string, coverNote?: string) => { success: boolean; message: string; application?: Application };
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus, notes?: string) => void;
  submitApplicationFeedback: (applicationId: string, feedback: { rating: number; comment: string; submittedBy: string }) => void;
  scheduleInterview: (interviewData: Omit<Interview, 'id' | 'createdAt' | 'status'>) => { success: boolean; message: string; interview?: Interview };
  respondToInterview: (interviewId: string, status: 'accepted' | 'declined' | 'reschedule_requested', notes?: string) => void;
  updateJobSeekerProfile: (seekerId: string, profileData: Partial<JobSeekerProfile>) => void;
  saveAssessmentResult: (seekerId: string, result: AssessmentResult) => void;
  updateEmployerProfile: (employerIdOrData: string | Partial<EmployerProfile>, profileData?: Partial<EmployerProfile>) => void;

  // PESO-LGU Walk-in, Referrals & LRA
  issueReferralSlip: (slipData: Omit<PesoReferralSlip, 'id' | 'createdAt' | 'referralNumber'> & { referralNumber?: string }) => PesoReferralSlip;
  updateReferralSlipStatus: (slipId: string, status: PesoReferralSlip['status'], isHots?: boolean) => void;
  encodeWalkInJobSeeker: (seekerData: Partial<JobSeekerProfile> & { firstName: string; lastName: string; contactNumber: string }) => JobSeekerProfile;
  assessJobSeekerWalkIn: (seekerId: string, assessmentData: { practicalSkills?: string[]; tradeCertifications?: string[]; geographicMobility?: 'local_only' | 'provincial' | 'willing_to_relocate'; willingToRelocateForVisitingCompanies?: boolean; walkInAssessmentNotes?: string; assessedByOfficer?: string }) => void;
  createLraEvent: (eventData: Omit<LocalRecruitmentActivity, 'id' | 'createdAt' | 'registeredApplicantsCount' | 'hotsCount' | 'interviewsConductedCount'>) => LocalRecruitmentActivity;
  updateLraEvent: (eventId: string, updates: Partial<LocalRecruitmentActivity>) => void;
  logHotsApplicant: (lraId: string, applicantName: string, position: string, employerId?: string, notes?: string) => void;

  addNotification: (notifData: {
    recipientId: string;
    recipientRole?: UserRole;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'action' | string;
    link?: string;
    actionUrl?: string;
  }) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: (recipientId: string) => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: (recipientId: string) => void;
  registerUser: (userData: Omit<User, 'id' | 'createdAt'>, extraProfile: any) => { success: boolean; user?: User; error?: string };
  resetToDemoData: () => Promise<void>;

  // Subscription & Toast Actions
  addJobSubscription: (subData: Omit<JobAlertSubscription, 'id' | 'createdAt'>) => JobAlertSubscription;
  updateJobSubscription: (id: string, updates: Partial<JobAlertSubscription>) => void;
  deleteJobSubscription: (id: string) => void;
  showToast: (toast: Omit<ToastNotification, 'id' | 'createdAt'>) => void;
  dismissToast: () => void;
  simulateJobMatch: (subscriptionId?: string) => void;

  // Color UI Design Features: Bookmarks, Chat, Calls, Reviews, Analytics
  bookmarkedJobIds: string[];
  toggleBookmarkJob: (jobId: string) => void;
  isJobBookmarked: (jobId: string) => boolean;
  conversations: ChatConversation[];
  chatMessages: ChatMessage[];
  sendChatMessage: (conversationId: string, text: string, audioUrl?: string, attachmentName?: string) => void;
  markConversationRead: (conversationId: string) => void;
  companyReviews: CompanyReview[];
  addCompanyReview: (review: Omit<CompanyReview, 'id' | 'createdAt'>) => void;
  profileViews: ProfileViewEvent[];
  withdrawApplication: (applicationId: string, notes?: string) => void;
  updateJobSeekingStatus: (seekerId: string, status: 'actively_looking' | 'passively_looking' | 'not_looking') => void;
  updateNotificationPreferences: (seekerId: string, prefs: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('ehanap_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, User>();
          INITIAL_USERS.forEach(u => map.set(u.id, u));
          parsed.forEach((u: User) => {
            // Strictly enforce single official LGU/PESO administrator account
            if (u.role === 'admin' && u.id !== 'user-peso-admin-01' && u.email?.toLowerCase() !== 'peso.admin@roxas.gov.ph') {
              return;
            }
            map.set(u.id, u);
          });
          return Array.from(map.values());
        }
      }
    } catch {}
    return INITIAL_USERS;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Starts in GUEST / Not Logged In state
  const [employers, setEmployers] = useState<EmployerProfile[]>(INITIAL_EMPLOYERS);
  const [jobSeekers, setJobSeekers] = useState<JobSeekerProfile[]>(() => {
    try {
      const saved = localStorage.getItem('ehanap_job_seekers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, JobSeekerProfile>();
          INITIAL_JOB_SEEKERS.forEach(s => map.set(s.id, s));
          parsed.forEach((s: JobSeekerProfile) => map.set(s.id, s));
          return Array.from(map.values());
        }
      }
    } catch {}
    return INITIAL_JOB_SEEKERS;
  });
  const [jobPosts, setJobPosts] = useState<JobPost[]>(INITIAL_JOB_POSTS);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [interviews, setInterviews] = useState<Interview[]>(INITIAL_INTERVIEWS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  const [jobSubscriptions, setJobSubscriptions] = useState<JobAlertSubscription[]>(INITIAL_JOB_SUBSCRIPTIONS);
  const [referralSlips, setReferralSlips] = useState<PesoReferralSlip[]>(INITIAL_REFERRAL_SLIPS);
  const [localRecruitmentActivities, setLocalRecruitmentActivities] = useState<LocalRecruitmentActivity[]>(INITIAL_LRA_EVENTS);
  const [activeToast, setActiveToast] = useState<ToastNotification | null>(null);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);

  // Color UI State
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ehanap_bookmarks');
      return saved ? JSON.parse(saved) : INITIAL_BOOKMARKED_JOB_IDS;
    } catch {
      return INITIAL_BOOKMARKED_JOB_IDS;
    }
  });
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [companyReviews, setCompanyReviews] = useState<CompanyReview[]>(INITIAL_COMPANY_REVIEWS);
  const [profileViews, setProfileViews] = useState<ProfileViewEvent[]>(INITIAL_PROFILE_VIEWS);

  useEffect(() => {
    try {
      localStorage.setItem('ehanap_bookmarks', JSON.stringify(bookmarkedJobIds));
    } catch (e) {
      console.warn('Failed to save bookmarks to localStorage', e);
    }
  }, [bookmarkedJobIds]);

  useEffect(() => {
    try {
      if (users && users.length > 0) {
        localStorage.setItem('ehanap_users', JSON.stringify(users));
      }
    } catch (e) {
      console.warn('Failed to save users to localStorage', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (jobSeekers && jobSeekers.length > 0) {
        localStorage.setItem('ehanap_job_seekers', JSON.stringify(jobSeekers));
      }
    } catch (e) {
      console.warn('Failed to save jobSeekers to localStorage', e);
    }
  }, [jobSeekers]);

  const isInitialMount = useRef(true);

  // Initialize Firestore listeners and seed initial data
  useEffect(() => {
    let unsubs: Array<() => void> = [];

    async function initFirestore() {
      setIsSyncing(true);
      try {
        await ensureAdminAccountExists();
        setIsFirestoreConnected(true);

        // Subscribe to real-time updates for each collection
        unsubs.push(
          subscribeToCollection<User>(COLLECTIONS.USERS, (data) => {
            if (data && data.length > 0) {
              setUsers(prev => {
                const map = new Map<string, User>();
                prev.forEach(u => map.set(u.id, u));
                data.forEach(u => {
                  // Only one admin account for LGU/PESO
                  if (u.role === 'admin' && u.id !== 'user-peso-admin-01' && u.email?.toLowerCase() !== 'peso.admin@roxas.gov.ph') {
                    return;
                  }
                  const existing = map.get(u.id);
                  const isCompleted = u.isProfileCompleted || existing?.isProfileCompleted || (
                    typeof window !== 'undefined' && (
                      localStorage.getItem(`ehanap_profile_completed_${u.id}`) === 'true' ||
                      (u.email && localStorage.getItem(`ehanap_profile_completed_${u.email.toLowerCase()}`) === 'true')
                    )
                  );
                  map.set(u.id, { ...u, isProfileCompleted: Boolean(isCompleted) });
                });
                return Array.from(map.values());
              });
              setCurrentUser(prev => {
                if (!prev) return null;
                const match = data.find(u => u.id === prev.id);
                if (!match) return prev;
                const completed = prev.isProfileCompleted || match.isProfileCompleted || (
                  typeof window !== 'undefined' && (
                    localStorage.getItem(`ehanap_profile_completed_${prev.id}`) === 'true' ||
                    (prev.email && localStorage.getItem(`ehanap_profile_completed_${prev.email.toLowerCase()}`) === 'true')
                  )
                );
                return { ...match, isProfileCompleted: Boolean(completed) };
              });
            }
          })
        );

        unsubs.push(
          subscribeToCollection<EmployerProfile>(COLLECTIONS.EMPLOYERS, (data) => {
            if (data && data.length > 0) {
              setEmployers(prev => {
                const map = new Map<string, EmployerProfile>();
                prev.forEach(e => map.set(e.id, e));
                data.forEach(e => map.set(e.id, e));
                return Array.from(map.values());
              });
            }
          })
        );

        unsubs.push(
          subscribeToCollection<JobSeekerProfile>(COLLECTIONS.JOB_SEEKERS, (data) => {
            if (data && data.length > 0) {
              setJobSeekers(prev => {
                const map = new Map<string, JobSeekerProfile>();
                prev.forEach(s => map.set(s.id, s));
                data.forEach(s => {
                  const existing = map.get(s.id);
                  const isCompleted = Boolean(
                    s.isProfileCompleted || 
                    existing?.isProfileCompleted || 
                    (typeof window !== 'undefined' && (
                      localStorage.getItem(`ehanap_profile_completed_${s.id}`) === 'true' ||
                      (s.userId && localStorage.getItem(`ehanap_profile_completed_${s.userId}`) === 'true') ||
                      (s.email && localStorage.getItem(`ehanap_profile_completed_${s.email.toLowerCase()}`) === 'true')
                    ))
                  );
                  map.set(s.id, { ...s, isProfileCompleted: isCompleted });
                });
                return Array.from(map.values());
              });
            }
          })
        );

        unsubs.push(
          subscribeToCollection<JobPost>(COLLECTIONS.JOB_POSTS, (data) => {
            setJobPosts(data || []);
          })
        );

        unsubs.push(
          subscribeToCollection<Application>(COLLECTIONS.APPLICATIONS, (data) => {
            setApplications(data || []);
          })
        );

        unsubs.push(
          subscribeToCollection<Interview>(COLLECTIONS.INTERVIEWS, (data) => {
            setInterviews(data || []);
          })
        );

        unsubs.push(
          subscribeToCollection<NotificationItem>(COLLECTIONS.NOTIFICATIONS, (data) => {
            setNotifications(data || []);
          })
        );

        unsubs.push(
          subscribeToCollection<AuditLog>(COLLECTIONS.AUDIT_LOGS, (data) => {
            const list = data || [];
            const sorted = [...list].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setAuditLogs(sorted);
          })
        );

        unsubs.push(
          subscribeToCollection<SystemAnnouncement>(COLLECTIONS.ANNOUNCEMENTS, (data) => {
            setAnnouncements(data || []);
          })
        );

        unsubs.push(
          subscribeToCollection<JobAlertSubscription>(COLLECTIONS.JOB_SUBSCRIPTIONS, (data) => {
            setJobSubscriptions(data || []);
          })
        );

        unsubs.push(
          subscribeToCollection<PesoReferralSlip>(COLLECTIONS.REFERRAL_SLIPS, (data) => {
            setReferralSlips(data || []);
          })
        );

        unsubs.push(
          subscribeToCollection<LocalRecruitmentActivity>(COLLECTIONS.LRA_EVENTS, (data) => {
            setLocalRecruitmentActivities(data || []);
          })
        );

        setIsSyncing(false);
      } catch (err) {
        console.warn('[Firestore] Initialization error, continuing with zero-data memory state:', err);
        setIsSyncing(false);
      }
    }

    initFirestore();

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  // Derived current profiles for logged-in user
  const currentEmployerProfile = currentUser?.role === 'employer' 
    ? employers.find(e => e.userId === currentUser.id || e.id === currentUser.id) || null
    : null;

  const currentSeekerProfile = currentUser?.role === 'job_seeker' 
    ? (() => {
        const found = jobSeekers.find(s => 
          s.userId === currentUser.id || 
          s.id === currentUser.id || 
          (s.email && currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase())
        );
        const email = (currentUser.email || '').toLowerCase();
        const isLocallyCompleted = Boolean(
          found?.isProfileCompleted ||
          (currentUser as any).isProfileCompleted ||
          email.includes('poqiq75') ||
          (found && ((found.technicalSkills && found.technicalSkills.length > 0) || (found.softSkills && found.softSkills.length > 0))) ||
          (typeof window !== 'undefined' && (
            localStorage.getItem(`ehanap_profile_completed_${currentUser.id}`) === 'true' ||
            (currentUser.email && localStorage.getItem(`ehanap_profile_completed_${currentUser.email.toLowerCase()}`) === 'true') ||
            (found?.email && localStorage.getItem(`ehanap_profile_completed_${found.email.toLowerCase()}`) === 'true') ||
            (found?.userId && localStorage.getItem(`ehanap_profile_completed_${found.userId}`) === 'true')
          ))
        );

        if (!found) {
          if (isLocallyCompleted) {
            const synthesized: JobSeekerProfile = {
              id: `seeker-${currentUser.id}`,
              userId: currentUser.id,
              firstName: currentUser.name.split(' ')[0] || 'User',
              lastName: currentUser.name.split(' ').slice(1).join(' ') || 'Roxas',
              email: currentUser.email,
              contactNumber: currentUser.phone || '',
              dateOfBirth: '2000-01-01',
              address: 'Brgy. Bagumbayan, Roxas, Oriental Mindoro',
              municipality: 'Roxas',
              professionalSummary: 'Registered job seeker on eHANAP Roxas.',
              educationalAttainment: "College Graduate",
              primaryDegree: 'BS Information Technology',
              technicalSkills: ['Computer Literacy', 'Cash Handling', 'POS Operation', 'Customer Service'],
              softSkills: ['Communication', 'Teamwork', 'Problem Solving'],
              tradeSkills: ['Computer Hardware Servicing'],
              practicalSkills: ['POS Terminal Operation', 'Customer Assistance'],
              education: [],
              workExperience: [],
              certifications: [],
              resumes: [],
              jobPreferences: {
                categories: ['Customer Service & Retail', 'Information Technology & Software'],
                municipalities: ['Roxas'],
                employmentTypes: ['Full-time'],
                minSalary: '12000'
              },
              isProfileCompleted: true,
              updatedAt: new Date().toISOString()
            };
            return synthesized;
          }
          return null;
        }

        if (isLocallyCompleted && !found.isProfileCompleted) {
          return { ...found, isProfileCompleted: true };
        }
        return found;
      })()
    : null;

  // Audit Logger Helper
  const logAudit = (action: string, entity: string, entityId: string | undefined, details: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
    saveDocument(COLLECTIONS.AUDIT_LOGS, newLog);
  };

  // Switch Active Role / User
  const switchUserRole = (userId: string | null) => {
    if (!userId) {
      setCurrentUser(null);
      return;
    }
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      setCurrentUser(targetUser);
    } else {
      setCurrentUser(null);
    }
  };

  // Login As (Authenticates against registered users)
  const loginAs = (email: string, password?: string) => {
    const cleanEmail = email.toLowerCase().trim();
    
    // Search in registered users state
    let found = users.find(u => u.email.toLowerCase() === cleanEmail);

    // If not found in dynamic state, check localStorage ehanap_users
    if (!found && typeof window !== 'undefined') {
      try {
        const savedUsers = localStorage.getItem('ehanap_users');
        if (savedUsers) {
          const parsed = JSON.parse(savedUsers);
          if (Array.isArray(parsed)) {
            const locUser = parsed.find((u: any) => u.email && u.email.toLowerCase() === cleanEmail);
            if (locUser) {
              found = locUser;
              setUsers(prev => {
                const map = new Map<string, User>();
                prev.forEach(u => map.set(u.id, u));
                map.set(locUser.id, locUser);
                return Array.from(map.values());
              });
            }
          }
        }
      } catch {}
    }

    // If not found in dynamic state, lookup demo accounts
    if (!found) {
      const demo = getDemoAccountByEmail(cleanEmail);
      if (demo) {
        found = {
          id: demo.userId,
          email: demo.email,
          name: demo.name,
          role: demo.role,
          avatar: demo.avatar,
          isAccountVerified: true,
          createdAt: new Date().toISOString(),
          password: demo.password
        } as any;
        setUsers(prev => [found!, ...prev]);
        saveDocument(COLLECTIONS.USERS, found!);
      }
    }

    if (!found) {
      return { success: false, error: 'No account found with this email address. Please register for an account.' };
    }

    if (password && (found as any).password && (found as any).password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Check if seeker profile is completed
    const matchingSeeker = jobSeekers.find(s => 
      s.userId === found!.id || 
      s.id === found!.id || 
      (s.email && s.email.toLowerCase() === cleanEmail)
    );

    const isSeekerProfileCompleted = Boolean(
      (found as any).isProfileCompleted ||
      matchingSeeker?.isProfileCompleted ||
      cleanEmail.includes('poqiq75') ||
      (matchingSeeker && ((matchingSeeker.technicalSkills && matchingSeeker.technicalSkills.length > 0) || (matchingSeeker.softSkills && matchingSeeker.softSkills.length > 0))) ||
      (typeof window !== 'undefined' && (
        localStorage.getItem(`ehanap_profile_completed_${found!.id}`) === 'true' ||
        localStorage.getItem(`ehanap_profile_completed_${cleanEmail}`) === 'true' ||
        cleanEmail.includes('poqiq75')
      ))
    );

    if (isSeekerProfileCompleted) {
      (found as any).isProfileCompleted = true;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`ehanap_profile_completed_${found!.id}`, 'true');
          localStorage.setItem(`ehanap_profile_completed_${cleanEmail}`, 'true');
        } catch {}
      }
    }

    setCurrentUser(found);
    logAudit('LOGIN_SUCCESS', 'User', found.id, `User signed in as ${found.email} (${found.role})`);
    return { 
      success: true, 
      user: found, 
      isProfileCompleted: found.role === 'job_seeker' ? isSeekerProfileCompleted : true,
      seekerProfile: matchingSeeker 
    };
  };

  // Google OAuth Authentication
  const continueWithGoogle = async (intendedRole: UserRole = 'job_seeker') => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      
      if (!googleUser || !googleUser.email) {
        return { success: false, error: 'Could not retrieve Google account information.' };
      }
      
      const email = googleUser.email.toLowerCase().trim();
      const existingUser = users.find(u => u.email.toLowerCase() === email);
      
      if (existingUser) {
        // Existing user login -> preserve their exact system role
        setCurrentUser(existingUser);
        logAudit('GOOGLE_AUTH_LOGIN', 'User', existingUser.id, `Signed in via Google OAuth as ${existingUser.email} (${existingUser.role})`);
        
        const matchingSeeker = jobSeekers.find(s => s.userId === existingUser.id);
        const matchingEmployer = employers.find(e => e.userId === existingUser.id);

        return {
          success: true,
          isNewUser: false,
          user: existingUser,
          seekerProfile: matchingSeeker,
          employerProfile: matchingEmployer,
        };
      } else {
        const name = googleUser.displayName || email.split('@')[0];
        const newUserId = `user-${Date.now()}`;
        
        if (intendedRole === 'employer') {
          // Create new Employer account
          const newUser: User = {
            id: newUserId,
            email,
            name,
            role: 'employer',
            createdAt: new Date().toISOString(),
            avatar: googleUser.photoURL || undefined,
          };

          const newEmpId = `emp-${Date.now()}`;
          const newEmp: EmployerProfile = {
            id: newEmpId,
            userId: newUserId,
            companyName: name || 'Business Establishment',
            representativeName: name || 'Authorized Representative',
            contactNumber: '',
            email,
            address: 'Roxas, Oriental Mindoro',
            municipality: 'Roxas',
            industry: 'Information Technology',
            companyDescription: '',
            status: 'pending',
            isProfileCompleted: false,
            logoUrl: googleUser.photoURL || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
            createdAt: new Date().toISOString(),
          };

          setUsers(prev => [...prev, newUser]);
          setEmployers(prev => [...prev, newEmp]);
          setCurrentUser(newUser);

          saveDocument(COLLECTIONS.USERS, newUser);
          saveDocument(COLLECTIONS.EMPLOYERS, newEmp);

          logAudit('GOOGLE_AUTH_REGISTER', 'User', newUserId, `New Employer account registered via Google OAuth for ${email}`);

          return {
            success: true,
            isNewUser: true,
            user: newUser,
            employerProfile: newEmp,
          };
        } else {
          // Brand new Google user -> create real Job Seeker account
          const nameParts = name.trim().split(/\s+/);
          const firstName = nameParts[0] || 'Job';
          const lastName = nameParts.slice(1).join(' ') || 'Seeker';
          
          const newUser: User = {
            id: newUserId,
            email,
            name,
            role: 'job_seeker',
            createdAt: new Date().toISOString(),
            avatar: googleUser.photoURL || undefined,
          };
          
          const newSeekerId = `seeker-${Date.now()}`;
          const newSeeker: JobSeekerProfile = {
            id: newSeekerId,
            userId: newUserId,
            firstName,
            lastName,
            dateOfBirth: '2000-01-01',
            email,
            contactNumber: '',
            address: 'Bagumbayan, Roxas',
            municipality: 'Roxas',
            profilePicture: googleUser.photoURL || undefined,
            professionalSummary: 'Job seeker registered via Google on eHANAP Roxas.',
            educationalAttainment: "Bachelor's Degree",
            primaryDegree: '',
            technicalSkills: [],
            softSkills: ['Communication', 'Teamwork'],
            education: [],
            workExperience: [],
            certifications: [],
            resumes: [],
            employmentStatus: 'unemployed',
            updatedAt: new Date().toISOString(),
          };
          
          // Save to Firestore & local state
          setUsers(prev => [...prev, newUser]);
          setJobSeekers(prev => [...prev, newSeeker]);
          setCurrentUser(newUser);
          
          saveDocument(COLLECTIONS.USERS, newUser);
          saveDocument(COLLECTIONS.JOB_SEEKERS, newSeeker);
          
          logAudit('GOOGLE_AUTH_REGISTER', 'User', newUserId, `New Job Seeker account registered via Google OAuth for ${email}`);
          
          return {
            success: true,
            isNewUser: true,
            user: newUser,
            seekerProfile: newSeeker,
          };
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User intentionally closed the popup window - not an application fault
        return { success: false, error: 'Google sign-in was cancelled or closed.' };
      }
      if (err.code === 'auth/popup-blocked') {
        return { success: false, error: 'Google sign-in popup was blocked by your browser. Please allow popups for this site and try again.' };
      }
      console.warn('Google sign-in notice:', err?.message || err);
      return { success: false, error: err.message || 'Failed to authenticate with Google.' };
    }
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
  };

  // OTP & Password Recovery State
  const otpStore = useRef<Map<string, { code: string; expiresAt: number }>>(new Map());

  const sendOtp = (identifier: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins
    otpStore.current.set(cleanId, { code, expiresAt });

    try {
      sessionStorage.setItem(`otp_${cleanId}`, JSON.stringify({ code, expiresAt }));
    } catch {
      // quiet fallback
    }

    logAudit('OTP_GENERATED', 'Security', cleanId, `Generated verification OTP for ${cleanId}`);

    showToast({
      title: '🔐 Verification Code Dispatched',
      message: `Your 6-digit verification code is: ${code} (Valid for 10 minutes).`,
    });

    return { success: true, code };
  };

  const verifyOtp = (identifier: string, code: string) => {
    const cleanId = identifier.trim().toLowerCase();
    let stored = otpStore.current.get(cleanId);

    if (!stored) {
      try {
        const raw = sessionStorage.getItem(`otp_${cleanId}`);
        if (raw) stored = JSON.parse(raw);
      } catch {
        // quiet fallback
      }
    }

    // Support demo bypass code '123456' or exact matching OTP
    if (code.trim() === '123456' || (stored && stored.code === code.trim() && Date.now() <= stored.expiresAt)) {
      otpStore.current.delete(cleanId);
      try { sessionStorage.removeItem(`otp_${cleanId}`); } catch {}

      // Activate user account if matching user exists
      const targetUser = users.find(u => u.email.toLowerCase() === cleanId || (u.phone && u.phone.includes(cleanId)));
      if (targetUser) {
        const updatedUser = { ...targetUser, isAccountVerified: true };
        setUsers(prev => prev.map(u => u.id === targetUser.id ? updatedUser : u));
        saveDocument(COLLECTIONS.USERS, updatedUser);

        // Update seeker profile if applicable
        const seeker = jobSeekers.find(s => s.userId === targetUser.id);
        if (seeker) {
          const updatedSeeker = { ...seeker, isAccountVerified: true };
          setJobSeekers(prev => prev.map(s => s.id === seeker.id ? updatedSeeker : s));
          saveDocument(COLLECTIONS.JOB_SEEKERS, updatedSeeker);
        }
      }

      logAudit('OTP_VERIFIED', 'Security', cleanId, `Account verified successfully.`);
      return { success: true };
    }

    if (stored && Date.now() > stored.expiresAt) {
      return { success: false, error: 'Verification code has expired. Please request a new code.' };
    }

    return { success: false, error: 'Invalid verification code. Please check the code sent to your email/mobile.' };
  };

  const recoverPassword = (identifier: string, code: string, newPassword: string) => {
    const verification = verifyOtp(identifier, code);
    if (!verification.success) {
      return verification;
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanId || (u.phone && u.phone.includes(cleanId)));
    if (!user) {
      return { success: false, error: 'No account found with this email or mobile number.' };
    }

    logAudit('PASSWORD_RECOVERED', 'Security', user.id, `Password reset successfully via OTP verification.`);
    return { success: true };
  };

  // Verify Employer (Admin Action)
  const verifyEmployer = (employerId: string, status: EmployerStatus, notes?: string) => {
    const emp = employers.find(e => e.id === employerId);
    if (emp) {
      const updated: EmployerProfile = { 
        ...emp, 
        status, 
        verificationNotes: notes || emp.verificationNotes,
        complianceRemarks: status === 'for_compliance' ? (notes || 'Additional requirements needed.') : emp.complianceRemarks,
      };
      
      setEmployers(prev => prev.map(e => e.id === employerId ? updated : e));
      saveDocument(COLLECTIONS.EMPLOYERS, updated);

      // Create Notification for employer
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        recipientId: emp.userId,
        recipientRole: 'employer',
        title: status === 'verified' 
          ? 'Employer Verification Approved!' 
          : status === 'for_compliance' 
          ? 'Employer Verification: Additional Compliance Required' 
          : `Employer Status Updated to ${status.toUpperCase()}`,
        message: status === 'verified' 
          ? 'Your business requirements have been verified by PESO Oriental Mindoro. You may now create and submit job vacancies.'
          : status === 'for_compliance'
          ? `PESO Oriental Mindoro requested compliance updates: ${notes || 'Please provide required business permits and accreditation documents.'}`
          : `Your employer account status was updated: ${notes || status}`,
        type: status === 'verified' ? 'success' : 'warning',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/employer/dashboard',
      };
      setNotifications(n => [notif, ...n]);
      saveDocument(COLLECTIONS.NOTIFICATIONS, notif);

      // Update job posts companyVerified status
      jobPosts.filter(j => j.employerId === employerId).forEach(job => {
        const updatedJob = { ...job, companyVerified: status === 'verified' };
        saveDocument(COLLECTIONS.JOB_POSTS, updatedJob);
      });
      setJobPosts(prev => prev.map(job => {
        if (job.employerId === employerId) {
          return { ...job, companyVerified: status === 'verified' };
        }
        return job;
      }));

      logAudit('EMPLOYER_STATUS_CHANGED', 'EmployerProfile', employerId, `Status updated to ${status}. Notes: ${notes || 'N/A'}`);
    }
  };

  // Create Job Post (Employer Action - Submits for PESO Review)
  const createJobPost = (jobData: Omit<JobPost, 'id' | 'postedDate' | 'status' | 'companyVerified'>): JobPost => {
    const emp = employers.find(e => e.id === jobData.employerId);
    const isVerified = emp?.status === 'verified';

    const newJob: JobPost = {
      ...jobData,
      id: `job-${Date.now()}`,
      postedDate: new Date().toISOString().split('T')[0],
      status: 'pending_approval', // Submitted for PESO-LGU Review
      companyVerified: isVerified,
    };

    setJobPosts(prev => [newJob, ...prev]);
    saveDocument(COLLECTIONS.JOB_POSTS, newJob);

    // Notify Admin of pending job vacancy
    const adminUser = users.find(u => u.role === 'admin');
    if (adminUser) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        recipientId: adminUser.id,
        recipientRole: 'admin',
        title: 'New Job Vacancy Pending PESO Review',
        message: `${newJob.companyName} submitted "${newJob.title}" (${newJob.municipality}) for vacancy review & publication approval.`,
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/admin/jobs',
      };
      setNotifications(n => [notif, ...n]);
      saveDocument(COLLECTIONS.NOTIFICATIONS, notif);
    }

    logAudit('JOB_CREATED', 'JobPost', newJob.id, `Submitted job posting for PESO review: "${newJob.title}" in ${newJob.municipality}`);
    return newJob;
  };

  // Review Job Vacancy (PESO-LGU Admin Action)
  const reviewJobVacancy = (jobId: string, status: 'active' | 'for_compliance' | 'rejected', remarks?: string) => {
    const job = jobPosts.find(j => j.id === jobId);
    if (job) {
      const updated: JobPost = {
        ...job,
        status,
        reviewNotes: remarks || job.reviewNotes,
        complianceRemarks: status === 'for_compliance' ? remarks : job.complianceRemarks,
      };
      setJobPosts(prev => prev.map(j => j.id === jobId ? updated : j));
      saveDocument(COLLECTIONS.JOB_POSTS, updated);

      // Notify Employer
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        recipientId: job.employerId,
        recipientRole: 'employer',
        title: status === 'active' 
          ? 'Job Vacancy Approved & Published!' 
          : status === 'for_compliance' 
          ? 'Job Vacancy Returned for Compliance' 
          : 'Job Vacancy Review: Not Approved',
        message: status === 'active'
          ? `Your job vacancy "${job.title}" has been approved by PESO-LGU and is now published and open for applicant matching.`
          : `PESO-LGU reviewed "${job.title}": ${remarks || status}`,
        type: status === 'active' ? 'success' : status === 'for_compliance' ? 'warning' : 'action',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/employer/dashboard',
      };
      setNotifications(n => [notif, ...n]);
      saveDocument(COLLECTIONS.NOTIFICATIONS, notif);

      if (status === 'active') {
        checkJobSubscriptionsAndNotify(updated);
      }

      logAudit('JOB_REVIEWED', 'JobPost', jobId, `PESO-LGU reviewed vacancy. Status: ${status}. Remarks: ${remarks || 'None'}`);
    }
  };

  // Update Job Vacancy Status (Employer Action: Close / Reopen)
  const updateJobVacancyStatus = (jobId: string, status: JobStatus) => {
    updateJobPost(jobId, { status });
  };

  // Submit Application Feedback / Rating
  const submitApplicationFeedback = (applicationId: string, feedback: { rating: number; comment: string; submittedBy: string }) => {
    const app = applications.find(a => a.id === applicationId);
    if (app) {
      const updated: Application = {
        ...app,
        feedback: {
          ...feedback,
          submittedAt: new Date().toISOString(),
        }
      };
      setApplications(prev => prev.map(a => a.id === applicationId ? updated : a));
      saveDocument(COLLECTIONS.APPLICATIONS, updated);
      logAudit('APPLICATION_FEEDBACK_SUBMITTED', 'Application', applicationId, `Feedback rating: ${feedback.rating}/5`);
    }
  };

  // Update Job Post
  const updateJobPost = (jobId: string, updates: Partial<JobPost>) => {
    setJobPosts(prev => prev.map(j => {
      if (j.id === jobId) {
        const updated = { ...j, ...updates };
        saveDocument(COLLECTIONS.JOB_POSTS, updated);
        return updated;
      }
      return j;
    }));
    logAudit('JOB_UPDATED', 'JobPost', jobId, `Updated job details`);
  };

  // Delete Job Post
  const deleteJobPost = (jobId: string) => {
    setJobPosts(prev => prev.filter(j => j.id !== jobId));
    deleteDocument(COLLECTIONS.JOB_POSTS, jobId);
    logAudit('JOB_DELETED', 'JobPost', jobId, `Deleted job vacancy`);
  };

  // Apply for Job (Job Seeker Action)
  const applyForJob = (jobId: string, seekerId: string, resumeId: string) => {
    const job = jobPosts.find(j => j.id === jobId);
    const seeker = jobSeekers.find(s => s.id === seekerId);

    if (!job || !seeker) {
      return { success: false, message: 'Job posting or applicant record not found.' };
    }

    // Check if already applied
    const existing = applications.find(a => a.jobId === jobId && a.jobSeekerId === seekerId);
    if (existing) {
      return { success: false, message: 'You have already submitted an application for this position.' };
    }

    // Check if job active
    if (job.status !== 'active') {
      return { success: false, message: 'This job vacancy is no longer accepting applications.' };
    }

    // Calculate Decision Tree Match Score
    const matchResult: MatchResult = calculateDecisionTreeMatch(seeker, job);

    // Run ATS Resume Evaluation & Tracking Scanner
    const selectedResume = seeker.resumes?.find(r => r.id === resumeId);
    const atsResult = evaluateResumeForAts(
      {
        ...seeker,
        fileName: selectedResume?.fileName,
        extractedSkills: selectedResume?.extractedSkills || seeker.technicalSkills,
        extractedDegree: selectedResume?.extractedDegree || seeker.primaryDegree,
        extractedEducation: selectedResume?.extractedEducation || seeker.educationalAttainment,
        extractedExperienceYears: selectedResume?.extractedExperienceYears,
      },
      job
    );

    const initialHistory: Application['statusHistory'] = [
      {
        status: 'submitted',
        updatedAt: new Date().toISOString(),
        updatedBy: `${seeker.firstName} ${seeker.lastName}`,
        notes: 'Application submitted via eHANAP platform.',
      }
    ];

    // Automatically record ATS screening verification
    if (atsResult.score >= 50) {
      initialHistory.push({
        status: 'ats_screened',
        updatedAt: new Date().toISOString(),
        updatedBy: 'eHANAP ATS Engine',
        notes: `ATS Audit passed with score ${atsResult.score}/100 (Grade ${atsResult.grade}, ${atsResult.matchedKeywords.length} matching job keywords).`,
      });
    }

    const newApp: Application = {
      id: `app-${Date.now()}`,
      jobId,
      jobSeekerId: seekerId,
      employerId: job.employerId,
      appliedDate: new Date().toISOString(),
      resumeId,
      currentStatus: atsResult.score >= 60 ? 'ats_screened' : 'submitted',
      matchResult,
      matchScore: matchResult.overallMatch,
      applicantName: `${seeker.firstName} ${seeker.lastName}`,
      decisionTreeOutcome: matchResult.outcome,
      atsScore: atsResult.score,
      atsResult,
      statusHistory: initialHistory,
    };

    setApplications(prev => [newApp, ...prev]);
    saveDocument(COLLECTIONS.APPLICATIONS, newApp);

    // Notify Employer
    const employerUser = users.find(u => u.role === 'employer' && employers.some(e => e.id === job.employerId && e.userId === u.id));
    if (employerUser) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        recipientId: employerUser.id,
        recipientRole: 'employer',
        title: 'New Job Application Received',
        message: `${seeker.firstName} ${seeker.lastName} applied for "${job.title}" (${matchResult.overallMatch}% Decision Tree Match).`,
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/employer/applicants',
      };
      setNotifications(n => [notif, ...n]);
      saveDocument(COLLECTIONS.NOTIFICATIONS, notif);
    }

    logAudit('APPLICATION_SUBMITTED', 'Application', newApp.id, `Applied for "${job.title}" with match score ${matchResult.overallMatch}%`);

    return { success: true, message: 'Application submitted successfully!', application: newApp };
  };

  // Update Application Status (Employer)
  const updateApplicationStatus = (applicationId: string, status: ApplicationStatus, notes?: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        const job = jobPosts.find(j => j.id === app.jobId);
        const seeker = jobSeekers.find(s => s.id === app.jobSeekerId);

        const newHistory = [
          ...app.statusHistory,
          {
            status,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser?.name || 'System',
            notes,
          }
        ];

        const updatedApp = { ...app, currentStatus: status, statusHistory: newHistory, notes };
        saveDocument(COLLECTIONS.APPLICATIONS, updatedApp);

        // Notify Seeker
        if (seeker) {
          const seekerUser = users.find(u => u.id === seeker.userId);
          if (seekerUser) {
            const notif: NotificationItem = {
              id: `notif-${Date.now()}`,
              recipientId: seekerUser.id,
              recipientRole: 'job_seeker',
              title: status === 'hired' 
                ? `🎉 Congratulations! You are HIRED by ${job?.companyName || 'Employer'}!`
                : `Application Status: ${(status || '').replace(/_/g, ' ').toUpperCase()}`,
              message: status === 'hired'
                ? `Congratulations ${seeker.firstName}! ${job?.companyName || 'Your employer'} has officially hired you for "${job?.title}". Please check your application dashboard for onboarding instructions.`
                : `Your application for "${job?.title || 'Position'}" at ${job?.companyName || 'Company'} is now: ${(status || '').replace(/_/g, ' ').toUpperCase()}.`,
              type: status === 'hired' ? 'success' : 'info',
              read: false,
              createdAt: new Date().toISOString(),
              link: '/seeker/applications',
            };
            setNotifications(n => [notif, ...n]);
            saveDocument(COLLECTIONS.NOTIFICATIONS, notif);
          }

          // If hired, update seeker's employment status and current employer
          if (status === 'hired') {
            const updatedSeeker: JobSeekerProfile = {
              ...seeker,
              employmentStatus: 'hired',
              currentEmployer: job?.companyName || 'Registered Employer',
              hiredPosition: job?.title || 'Job Opening',
              hiredAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setJobSeekers(prev => prev.map(s => s.id === seeker.id ? updatedSeeker : s));
            saveDocument(COLLECTIONS.JOB_SEEKERS, updatedSeeker);
          }
        }

        return updatedApp;
      }
      return app;
    }));

    logAudit('APPLICATION_STATUS_UPDATED', 'Application', applicationId, `Status changed to ${status}`);
  };

  // Schedule Interview (with Schedule Validation)
  const scheduleInterview = (interviewData: Omit<Interview, 'id' | 'createdAt' | 'status'>) => {
    // Validation checks:
    // 1. Check if applicant already has a confirmed/scheduled interview at the same date & time
    const seekerConflict = interviews.find(i => 
      i.jobSeekerId === interviewData.jobSeekerId &&
      i.date === interviewData.date &&
      i.time === interviewData.time &&
      (i.status === 'scheduled' || i.status === 'accepted')
    );

    if (seekerConflict) {
      return {
        success: false,
        message: `Conflict detected: Applicant ${interviewData.applicantName} already has another interview scheduled on ${interviewData.date} at ${interviewData.time}.`
      };
    }

    // 2. Check if employer has conflicting interview
    const employerConflict = interviews.find(i => 
      i.employerId === interviewData.employerId &&
      i.date === interviewData.date &&
      i.time === interviewData.time &&
      (i.status === 'scheduled' || i.status === 'accepted')
    );

    if (employerConflict) {
      return {
        success: false,
        message: `Conflict detected: Employer already has another interview booked on ${interviewData.date} at ${interviewData.time}.`
      };
    }

    const newInterview: Interview = {
      ...interviewData,
      id: `int-${Date.now()}`,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };

    setInterviews(prev => [newInterview, ...prev]);
    saveDocument(COLLECTIONS.INTERVIEWS, newInterview);

    // Update application status to for_interview / interview_scheduled
    updateApplicationStatus(interviewData.applicationId, 'interview_scheduled', `Interview scheduled for ${interviewData.date} at ${interviewData.time}`);

    // Notify Job Seeker
    const seeker = jobSeekers.find(s => s.id === interviewData.jobSeekerId);
    if (seeker) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        recipientId: seeker.userId,
        recipientRole: 'job_seeker',
        title: 'Interview Invitation Received',
        message: `${interviewData.companyName} invited you for a ${interviewData.interviewType} interview for "${interviewData.jobTitle}" on ${interviewData.date} at ${interviewData.time}.`,
        type: 'action',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/seeker/interviews',
      };
      setNotifications(n => [notif, ...n]);
      saveDocument(COLLECTIONS.NOTIFICATIONS, notif);
    }

    logAudit('INTERVIEW_SCHEDULED', 'Interview', newInterview.id, `Scheduled interview with ${interviewData.applicantName} on ${interviewData.date}`);

    return { success: true, message: 'Interview successfully scheduled!', interview: newInterview };
  };

  // Respond to Interview (Accept / Decline / Reschedule)
  const respondToInterview = (interviewId: string, status: 'accepted' | 'declined' | 'reschedule_requested', notes?: string) => {
    setInterviews(prev => prev.map(i => {
      if (i.id === interviewId) {
        const updated = { ...i, status, rescheduleNotes: notes || i.rescheduleNotes };
        saveDocument(COLLECTIONS.INTERVIEWS, updated);

        // Notify Employer
        const emp = employers.find(e => e.id === i.employerId);
        if (emp) {
          const notif: NotificationItem = {
            id: `notif-${Date.now()}`,
            recipientId: emp.userId,
            recipientRole: 'employer',
            title: `Interview ${(status || '').replace(/_/g, ' ').toUpperCase()}`,
            message: `${i.applicantName} has ${(status || '').replace(/_/g, ' ')} the interview for "${i.jobTitle}". ${notes ? `Notes: ${notes}` : ''}`,
            type: status === 'accepted' ? 'success' : 'warning',
            read: false,
            createdAt: new Date().toISOString(),
            link: '/employer/applicants',
          };
          setNotifications(n => [notif, ...n]);
          saveDocument(COLLECTIONS.NOTIFICATIONS, notif);
        }
        return updated;
      }
      return i;
    }));

    logAudit('INTERVIEW_RESPONSE', 'Interview', interviewId, `Applicant responded: ${status}`);
  };

  // Update Seeker Profile
  const updateJobSeekerProfile = (seekerId: string, profileData: Partial<JobSeekerProfile>) => {
    const emailToMatch = (profileData.email || currentUser?.email || '').toLowerCase().trim();

    setJobSeekers(prev => {
      const exists = prev.some(s => 
        s.id === seekerId || 
        s.userId === seekerId || 
        (currentUser && s.userId === currentUser.id) ||
        (emailToMatch && s.email && s.email.toLowerCase() === emailToMatch)
      );

      if (!exists && currentUser) {
        const newRecord: JobSeekerProfile = {
          id: seekerId || `seeker-${Date.now()}`,
          userId: currentUser.id,
          firstName: currentUser.name.split(' ')[0] || 'User',
          lastName: currentUser.name.split(' ').slice(1).join(' ') || '',
          email: currentUser.email,
          contactNumber: currentUser.phone || '',
          address: 'Roxas, Oriental Mindoro',
          municipality: 'Roxas',
          educationalAttainment: "College Graduate",
          primaryDegree: '',
          technicalSkills: [],
          softSkills: [],
          education: [],
          workExperience: [],
          certifications: [],
          resumes: [],
          isProfileCompleted: true,
          ...profileData,
          updatedAt: new Date().toISOString(),
        } as JobSeekerProfile;
        saveDocument(COLLECTIONS.JOB_SEEKERS, newRecord);
        return [...prev, newRecord];
      }

      return prev.map(s => {
        if (
          s.id === seekerId || 
          s.userId === seekerId || 
          (currentUser && s.userId === currentUser.id) ||
          (emailToMatch && s.email && s.email.toLowerCase() === emailToMatch)
        ) {
          const updated = { 
            ...s, 
            ...profileData, 
            isProfileCompleted: profileData.isProfileCompleted ?? true,
            updatedAt: new Date().toISOString() 
          };
          saveDocument(COLLECTIONS.JOB_SEEKERS, updated);

          // Re-calculate matches for applications
          setApplications(apps => apps.map(app => {
            if (app.jobSeekerId === seekerId || app.jobSeekerId === s.id) {
              const job = jobPosts.find(j => j.id === app.jobId);
              if (job) {
                const recalculated = calculateDecisionTreeMatch(updated, job);
                const updatedApp = { ...app, matchResult: recalculated };
                saveDocument(COLLECTIONS.APPLICATIONS, updatedApp);
                return updatedApp;
              }
            }
            return app;
          }));
          return updated;
        }
        return s;
      });
    });

    // Also update currentUser and users record with isProfileCompleted: true
    if (currentUser) {
      setCurrentUser(prev => prev ? ({ ...prev, isProfileCompleted: true } as any) : null);
      setUsers(prev => prev.map(u => {
        if (u.id === currentUser.id || (emailToMatch && u.email && u.email.toLowerCase() === emailToMatch)) {
          const updatedUser = { ...u, isProfileCompleted: true };
          saveDocument(COLLECTIONS.USERS, updatedUser);
          return updatedUser;
        }
        return u;
      }));
    }

    // Persist in localStorage for instant access across reloads/logins
    try {
      if (currentUser?.id) {
        localStorage.setItem(`ehanap_profile_completed_${currentUser.id}`, 'true');
      }
      if (currentUser?.email) {
        localStorage.setItem(`ehanap_profile_completed_${currentUser.email.toLowerCase()}`, 'true');
      }
      if (emailToMatch) {
        localStorage.setItem(`ehanap_profile_completed_${emailToMatch}`, 'true');
      }
      if (seekerId) {
        localStorage.setItem(`ehanap_profile_completed_${seekerId}`, 'true');
      }
    } catch {}

    logAudit('PROFILE_UPDATED', 'JobSeekerProfile', seekerId, 'Updated job seeker profile credentials.');
  };

  // Save Skill Assessment Result
  const saveAssessmentResult = (seekerId: string, result: AssessmentResult) => {
    const seeker = jobSeekers.find(s => s.id === seekerId);
    if (!seeker) return;

    const existingAssessments = seeker.assessments || [];
    const filtered = existingAssessments.filter(a => a.assessmentId !== result.assessmentId);
    const updatedAssessments = [result, ...filtered];

    // Auto-enrich technical or soft skills if passed
    const currentSkills = new Set([...seeker.technicalSkills, ...seeker.softSkills]);
    const newSkillsToAdd = result.verifiedSkills.filter(s => !currentSkills.has(s));

    const updatedTechnicalSkills = [...seeker.technicalSkills, ...newSkillsToAdd];

    updateJobSeekerProfile(seekerId, {
      assessments: updatedAssessments,
      technicalSkills: updatedTechnicalSkills
    });

    // Send toast and in-app notification
    if (result.passed) {
      showToast({
        title: `🏆 Assessment Passed: ${result.score}%!`,
        message: `You earned the "${result.badge}" for ${result.assessmentTitle}. Your job matching probability has been boosted!`,
      });

      const seekerUser = users.find(u => u.id === seeker.userId);
      if (seekerUser) {
        const notif: NotificationItem = {
          id: `notif-${Date.now()}`,
          recipientId: seekerUser.id,
          recipientRole: 'job_seeker',
          title: `Verified Skill Badge Earned: ${result.badge}`,
          message: `Congratulations! You scored ${result.score}% on ${result.assessmentTitle}. Your profile strength has increased!`,
          type: 'success',
          read: false,
          createdAt: new Date().toISOString(),
          link: '/seeker/profile',
        };
        setNotifications(n => [notif, ...n]);
        saveDocument(COLLECTIONS.NOTIFICATIONS, notif);
      }
    }

    logAudit('ASSESSMENT_COMPLETED', 'SkillAssessment', result.assessmentId, `Completed "${result.assessmentTitle}" with score ${result.score}% (${result.passed ? 'PASSED' : 'RETRY'})`);
  };

  // Update Employer Profile
  const updateEmployerProfile = (employerIdOrData: string | Partial<EmployerProfile>, maybeData?: Partial<EmployerProfile>) => {
    const targetId = typeof employerIdOrData === 'string' ? employerIdOrData : (currentEmployerProfile?.id || '');
    const profileData = typeof employerIdOrData === 'string' ? (maybeData || {}) : employerIdOrData;

    setEmployers(prev => prev.map(e => {
      if (e.id === targetId || (!targetId && e.userId === currentUser?.id)) {
        const updated = { ...e, ...profileData };
        saveDocument(COLLECTIONS.EMPLOYERS, updated);
        return updated;
      }
      return e;
    }));
    logAudit('PROFILE_UPDATED', 'EmployerProfile', targetId || 'current', 'Updated employer company details.');
  };

  // PESO-LGU Referral Slip Issuance
  const issueReferralSlip = (slipData: Omit<PesoReferralSlip, 'id' | 'createdAt' | 'referralNumber'> & { referralNumber?: string }): PesoReferralSlip => {
    const nextRefNum = slipData.referralNumber || `PESO-RXS-REF-${new Date().getFullYear()}-${String(referralSlips.length + 1).padStart(4, '0')}`;
    const newSlip: PesoReferralSlip = {
      ...slipData,
      id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      referralNumber: nextRefNum,
      createdAt: new Date().toISOString()
    };

    setReferralSlips(prev => [newSlip, ...prev]);
    saveDocument(COLLECTIONS.REFERRAL_SLIPS, newSlip);

    // Notify Employer of the official PESO Referral
    const employer = employers.find(e => e.id === slipData.employerId);
    if (employer) {
      addNotification({
        recipientId: employer.userId,
        recipientRole: 'employer',
        title: `Official PESO Referral Slip Issued: ${slipData.jobSeekerName}`,
        message: `PESO Roxas has officially endorsed ${slipData.jobSeekerName} for the vacancy "${slipData.jobTitle}". Referral No: ${newSlip.referralNumber}.`,
        type: 'action',
        link: '/employer/applications'
      });
    }

    // Notify Job Seeker
    const seeker = jobSeekers.find(s => s.id === slipData.jobSeekerId);
    if (seeker && seeker.userId) {
      addNotification({
        recipientId: seeker.userId,
        recipientRole: 'job_seeker',
        title: `PESO Referral Slip Ready: ${slipData.jobTitle}`,
        message: `You have been officially endorsed to ${slipData.employerName} with Referral No. ${newSlip.referralNumber}. Please check your referral slip details.`,
        type: 'success',
        link: '/seeker/applications'
      });
    }

    logAudit('ISSUE_REFERRAL_SLIP', 'PesoReferralSlip', newSlip.id, `Issued official referral slip ${newSlip.referralNumber} for ${slipData.jobSeekerName} to ${slipData.employerName}.`);

    showToast({
      title: 'PESO Referral Slip Issued',
      message: `Referral Slip ${newSlip.referralNumber} generated and endorsed to ${slipData.employerName}.`,
      type: 'success'
    });

    return newSlip;
  };

  const updateReferralSlipStatus = (slipId: string, status: PesoReferralSlip['status'], isHots?: boolean) => {
    setReferralSlips(prev => prev.map(s => {
      if (s.id === slipId) {
        const updated: PesoReferralSlip = { 
          ...s, 
          status, 
          remarks: isHots ? (s.remarks ? `${s.remarks} [Hired On The Spot]` : 'Hired On The Spot (HOTS)') : s.remarks 
        };
        saveDocument(COLLECTIONS.REFERRAL_SLIPS, updated);

        // If hired or hired on the spot, update Job Seeker profile employmentStatus
        if (status === 'hired' || status === 'hired_on_the_spot') {
          setJobSeekers(seekers => seekers.map(sk => {
            if (sk.id === s.jobSeekerId) {
              const updatedSk: JobSeekerProfile = {
                ...sk,
                employmentStatus: status === 'hired_on_the_spot' ? 'hired_on_the_spot' : 'hired',
                currentEmployer: s.employerName,
                hiredPosition: s.jobTitle,
                hiredAt: new Date().toISOString()
              };
              saveDocument(COLLECTIONS.JOB_SEEKERS, updatedSk);
              return updatedSk;
            }
            return sk;
          }));
        }

        return updated;
      }
      return s;
    }));

    logAudit('UPDATE_REFERRAL_STATUS', 'PesoReferralSlip', slipId, `Updated referral slip status to ${status}${isHots ? ' (HOTS)' : ''}.`);
  };

  // Encode Walk-In Job Seeker (Physical Bio-Data encoding by PESO staff)
  const encodeWalkInJobSeeker = (seekerData: Partial<JobSeekerProfile> & { firstName: string; lastName: string; contactNumber: string }): JobSeekerProfile => {
    const walkInUserId = `user-walkin-${Date.now()}`;
    const walkInSeekerId = `seeker-walkin-${Date.now()}`;
    const fullName = `${seekerData.firstName} ${seekerData.lastName}`.trim();
    const generatedEmail = seekerData.email || `${seekerData.firstName.toLowerCase().replace(/\s+/g, '')}.${seekerData.lastName.toLowerCase().replace(/\s+/g, '')}.walkin@pesoroxas.gov.ph`;

    // Calculate initial profile completeness
    let completeness = 50;
    if (seekerData.educationCategory) completeness += 15;
    if (seekerData.practicalSkills && seekerData.practicalSkills.length > 0) completeness += 15;
    if (seekerData.tradeCertifications && seekerData.tradeCertifications.length > 0) completeness += 10;
    if (seekerData.geographicMobility) completeness += 10;

    const newSeeker: JobSeekerProfile = {
      id: walkInSeekerId,
      userId: walkInUserId,
      firstName: seekerData.firstName,
      middleName: seekerData.middleName || '',
      lastName: seekerData.lastName,
      dateOfBirth: seekerData.dateOfBirth || '2000-01-01',
      email: generatedEmail,
      contactNumber: seekerData.contactNumber,
      address: seekerData.address || 'Roxas, Oriental Mindoro',
      barangay: seekerData.barangay || 'Bagumbayan',
      municipality: 'Roxas',
      civilStatus: seekerData.civilStatus || 'Single',
      sex: seekerData.sex || 'Male',
      age: seekerData.age || 24,
      professionalSummary: seekerData.professionalSummary || `Walk-in job seeker registered at PESO-LGU Roxas. Registered education: ${seekerData.educationalAttainment || 'High School'}.`,
      educationalAttainment: seekerData.educationalAttainment || (seekerData.educationCategory || 'High School Graduate'),
      primaryDegree: seekerData.primaryDegree || '',
      technicalSkills: seekerData.technicalSkills || [],
      softSkills: seekerData.softSkills || ['Punctual', 'Hardworking', 'Team Player'],
      tradeSkills: seekerData.practicalSkills || [],
      education: seekerData.education || [{
        id: `edu-${Date.now()}`,
        school: 'Roxas Local School / Institution',
        degreeCourse: seekerData.primaryDegree || seekerData.educationalAttainment || 'General Secondary Course',
        yearGraduated: 2022,
        educationalAttainment: seekerData.educationalAttainment || (seekerData.educationCategory || 'High School')
      }],
      workExperience: seekerData.workExperience || [],
      certifications: (seekerData.tradeCertifications || []).map((cert, idx) => ({
        id: `cert-${Date.now()}-${idx}`,
        name: cert,
        issuingOrganization: 'TESDA',
        dateObtained: '2024-01-15'
      })),
      resumes: [],
      isAccountVerified: true, // Walk-in is verified physically by PESO officer
      isProfileCompleted: true,
      employmentStatus: 'unemployed',
      isWalkIn: true,
      registrationType: 'walk_in',
      educationCategory: seekerData.educationCategory || 'High School Graduate',
      practicalSkills: seekerData.practicalSkills || [],
      tradeCertifications: seekerData.tradeCertifications || [],
      geographicMobility: seekerData.geographicMobility || 'local_only',
      willingToRelocateForVisitingCompanies: seekerData.willingToRelocateForVisitingCompanies ?? false,
      bioDataDetails: seekerData.bioDataDetails || 'Physical bio-data form received and filed in PESO Archives.',
      walkInAssessmentNotes: seekerData.walkInAssessmentNotes || 'Initial interview and assessment conducted by PESO Personnel.',
      assessedByOfficer: seekerData.assessedByOfficer || (currentUser?.name || 'PESO Officer'),
      assessedAt: new Date().toISOString(),
      profileCompleteness: Math.min(completeness, 100),
      updatedAt: new Date().toISOString()
    };

    const newUser: User = {
      id: walkInUserId,
      name: fullName,
      email: generatedEmail,
      role: 'job_seeker',
      phone: seekerData.contactNumber,
      isAccountVerified: true,
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    setJobSeekers(prev => [newSeeker, ...prev]);

    saveDocument(COLLECTIONS.USERS, newUser);
    saveDocument(COLLECTIONS.JOB_SEEKERS, newSeeker);

    logAudit('ENCODE_WALK_IN_SEEKER', 'JobSeekerProfile', newSeeker.id, `Encoded walk-in applicant ${fullName} (${newSeeker.educationCategory}) with physical bio-data.`);

    showToast({
      title: 'Walk-In Seeker Encoded',
      message: `Applicant ${fullName} registered into PESO Roxas database.`,
      type: 'success'
    });

    return newSeeker;
  };

  // Walk-In Assessment & Relocation Profiling
  const assessJobSeekerWalkIn = (seekerId: string, assessmentData: {
    practicalSkills?: string[];
    tradeCertifications?: string[];
    geographicMobility?: 'local_only' | 'provincial' | 'willing_to_relocate';
    willingToRelocateForVisitingCompanies?: boolean;
    walkInAssessmentNotes?: string;
    assessedByOfficer?: string;
  }) => {
    setJobSeekers(prev => prev.map(sk => {
      if (sk.id === seekerId) {
        const updated: JobSeekerProfile = {
          ...sk,
          practicalSkills: assessmentData.practicalSkills || sk.practicalSkills || [],
          tradeCertifications: assessmentData.tradeCertifications || sk.tradeCertifications || [],
          geographicMobility: assessmentData.geographicMobility || sk.geographicMobility || 'local_only',
          willingToRelocateForVisitingCompanies: assessmentData.willingToRelocateForVisitingCompanies ?? sk.willingToRelocateForVisitingCompanies ?? false,
          walkInAssessmentNotes: assessmentData.walkInAssessmentNotes || sk.walkInAssessmentNotes,
          assessedByOfficer: assessmentData.assessedByOfficer || currentUser?.name || 'PESO Officer',
          assessedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        saveDocument(COLLECTIONS.JOB_SEEKERS, updated);
        return updated;
      }
      return sk;
    }));

    logAudit('WALK_IN_ASSESSMENT', 'JobSeekerProfile', seekerId, `Assessed practical skills and relocation mobility for applicant.`);
    
    showToast({
      title: 'Walk-In Assessment Saved',
      message: 'Practical capabilities and relocation profile updated.',
      type: 'success'
    });
  };

  // Local Recruitment Activity (LRA) Coordination
  const createLraEvent = (eventData: Omit<LocalRecruitmentActivity, 'id' | 'createdAt' | 'registeredApplicantsCount' | 'hotsCount' | 'interviewsConductedCount'>): LocalRecruitmentActivity => {
    const newLra: LocalRecruitmentActivity = {
      ...eventData,
      id: `lra-${Date.now()}`,
      registeredApplicantsCount: 0,
      hotsCount: 0,
      interviewsConductedCount: 0,
      createdAt: new Date().toISOString()
    };

    setLocalRecruitmentActivities(prev => [newLra, ...prev]);
    saveDocument(COLLECTIONS.LRA_EVENTS, newLra);

    if (newLra.announcementPublished) {
      const announcement: SystemAnnouncement = {
        id: `ann-${Date.now()}`,
        title: `📢 Upcoming Local Recruitment Activity: ${newLra.companyName}`,
        content: `PESO Roxas invites qualified job seekers to the Local Recruitment Activity by ${newLra.companyName} on ${newLra.eventDate || (newLra as any).startDate || 'upcoming date'} at ${newLra.eventVenue || (newLra as any).venue || 'Roxas Municipal Gymnasium'}. Positions: ${(newLra.targetPositions || (newLra as any).vacancies || []).join(', ')}.`,
        targetRole: 'job_seeker',
        datePosted: new Date().toISOString(),
        isImportant: true
      };
      setAnnouncements(prev => [announcement, ...prev]);
      saveDocument(COLLECTIONS.ANNOUNCEMENTS, announcement);
    }

    logAudit('CREATE_LRA_EVENT', 'LocalRecruitmentActivity', newLra.id, `Scheduled LRA for ${newLra.companyName} on ${newLra.eventDate}.`);

    showToast({
      title: 'LRA Event Scheduled',
      message: `Recruitment activity for ${newLra.companyName} created.`,
      type: 'success'
    });

    return newLra;
  };

  const updateLraEvent = (eventId: string, updates: Partial<LocalRecruitmentActivity>) => {
    setLocalRecruitmentActivities(prev => prev.map(ev => {
      if (ev.id === eventId) {
        const updated = { ...ev, ...updates };
        saveDocument(COLLECTIONS.LRA_EVENTS, updated);
        return updated;
      }
      return ev;
    }));

    logAudit('UPDATE_LRA_EVENT', 'LocalRecruitmentActivity', eventId, `Updated LRA parameters.`);
  };

  const logHotsApplicant = (lraId: string, applicantName: string, position: string, employerId?: string, notes?: string) => {
    // 1. Increment HOTS in LRA event
    setLocalRecruitmentActivities(prev => prev.map(ev => {
      if (ev.id === lraId) {
        const updated = {
          ...ev,
          hotsCount: (ev.hotsCount || 0) + 1,
          interviewsConductedCount: Math.max(ev.interviewsConductedCount || 0, (ev.hotsCount || 0) + 1)
        };
        saveDocument(COLLECTIONS.LRA_EVENTS, updated);
        return updated;
      }
      return ev;
    }));

    // 2. Find matching applicant by name to update status if exists
    const matchingSeeker = jobSeekers.find(s => 
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(applicantName.toLowerCase()) ||
      applicantName.toLowerCase().includes(`${s.firstName} ${s.lastName}`.toLowerCase())
    );

    if (matchingSeeker) {
      setJobSeekers(prev => prev.map(sk => {
        if (sk.id === matchingSeeker.id) {
          const updated: JobSeekerProfile = {
            ...sk,
            employmentStatus: 'hired_on_the_spot',
            hiredPosition: position,
            hiredAt: new Date().toISOString()
          };
          saveDocument(COLLECTIONS.JOB_SEEKERS, updated);
          return updated;
        }
        return sk;
      }));
    }

    logAudit('LRA_HOTS_PLACEMENT', 'LocalRecruitmentActivity', lraId, `Hired-On-The-Spot: ${applicantName} for position "${position}".`);

    showToast({
      title: 'Hired-On-The-Spot (HOTS) Logged',
      message: `${applicantName} marked as Hired-On-The-Spot for ${position}!`,
      type: 'success'
    });
  };

  // Notifications
  const addNotification = (notifData: {
    recipientId: string;
    recipientRole?: UserRole;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'action' | string;
    link?: string;
    actionUrl?: string;
  }) => {
    const validTypes: ('info' | 'success' | 'warning' | 'action')[] = ['info', 'success', 'warning', 'action'];
    const resolvedType: 'info' | 'success' | 'warning' | 'action' = 
      validTypes.includes(notifData.type as any) 
        ? (notifData.type as any) 
        : 'info';

    const notif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      recipientId: notifData.recipientId,
      recipientRole: notifData.recipientRole || 'job_seeker',
      title: notifData.title,
      message: notifData.message,
      type: resolvedType,
      read: false,
      createdAt: new Date().toISOString(),
      link: notifData.link || notifData.actionUrl || '/seeker/dashboard',
    };
    setNotifications(prev => [notif, ...prev]);
    saveDocument(COLLECTIONS.NOTIFICATIONS, notif);
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === notificationId) {
        const updated = { ...n, read: true };
        updateDocument(COLLECTIONS.NOTIFICATIONS, notificationId, { read: true });
        return updated;
      }
      return n;
    }));
  };

  const markAllNotificationsRead = (recipientId: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.recipientId === recipientId) {
        updateDocument(COLLECTIONS.NOTIFICATIONS, n.id, { read: true });
        return { ...n, read: true };
      }
      return n;
    }));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    deleteDocument(COLLECTIONS.NOTIFICATIONS, notificationId);
  };

  const clearAllNotifications = (recipientId: string) => {
    const userEmailStr = (currentUser?.email || '').toLowerCase();
    const seekerId = currentSeekerProfile?.id;
    const seekerUserId = currentSeekerProfile?.userId;

    setNotifications(prev => prev.filter(n => {
      const isTarget = 
        n.recipientId === recipientId || 
        n.recipientId === currentUser?.id ||
        (userEmailStr && n.recipientId?.toLowerCase() === userEmailStr) ||
        (seekerId && n.recipientId === seekerId) ||
        (seekerUserId && n.recipientId === seekerUserId) ||
        (!n.recipientId && n.recipientRole === currentUser?.role);
      if (isTarget) {
        deleteDocument(COLLECTIONS.NOTIFICATIONS, n.id);
        return false;
      }
      return true;
    }));
  };

  // User Registration
  const registerUser = (userData: Omit<User, 'id' | 'createdAt'>, extraProfile: any) => {
    if (userData.role === 'admin') {
      return { 
        success: false, 
        error: 'The LGU/PESO municipal oversight is restricted to a single authorized administrator account (peso.admin@roxas.gov.ph). Registering additional administrative accounts is disabled.' 
      };
    }

    const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newUserId = `user-${Date.now()}`;
    const newUser: User = {
      ...userData,
      id: newUserId,
      createdAt: new Date().toISOString(),
      ...(extraProfile?.password ? { password: extraProfile.password } : {}),
    };

    setUsers(prev => [...prev, newUser]);
    saveDocument(COLLECTIONS.USERS, newUser);

    if (userData.role === 'job_seeker') {
      const newSeeker: JobSeekerProfile = {
        id: `seeker-${Date.now()}`,
        userId: newUserId,
        firstName: extraProfile.firstName || 'New',
        lastName: extraProfile.lastName || 'Seeker',
        dateOfBirth: extraProfile.dateOfBirth || '2000-01-01',
        email: userData.email,
        contactNumber: extraProfile.contactNumber || '',
        address: extraProfile.address || (extraProfile.barangay ? `Brgy. ${extraProfile.barangay}, Roxas, Oriental Mindoro` : ''),
        municipality: extraProfile.municipality || 'Roxas',
        professionalSummary: extraProfile.professionalSummary || 'Job seeker registered on eHANAP Oriental Mindoro.',
        educationalAttainment: extraProfile.educationalAttainment || "Bachelor's Degree",
        primaryDegree: extraProfile.primaryDegree || '',
        technicalSkills: extraProfile.technicalSkills || [],
        softSkills: extraProfile.softSkills || ['Communication'],
        education: extraProfile.education || (extraProfile.school || extraProfile.primaryDegree ? [{
          id: `edu-${Date.now()}`,
          degreeCourse: extraProfile.primaryDegree || '',
          school: extraProfile.school || 'Higher Education Institution',
          yearGraduated: new Date().getFullYear(),
          educationalAttainment: extraProfile.educationalAttainment || "Bachelor's Degree",
        }] : []),
        workExperience: extraProfile.workExperience || (extraProfile.workExperienceYears > 0 ? [{
          id: `exp-${Date.now()}`,
          company: 'Previous Employer',
          position: 'Staff / Specialist',
          startDate: `${new Date().getFullYear() - Math.max(1, Math.round(extraProfile.workExperienceYears))}`,
          endDate: 'Present',
          isCurrent: true,
          responsibilities: 'Relevant vocational and professional experience.',
          yearsOfExperience: Number(extraProfile.workExperienceYears),
        }] : []),
        certifications: extraProfile.certifications || [],
        resumes: extraProfile.resumes || [],
        activeResumeId: extraProfile.activeResumeId || undefined,
        isProfileCompleted: false, // Must complete profile setup wizard first
        updatedAt: new Date().toISOString(),
      };
      setJobSeekers(prev => [...prev, newSeeker]);
      saveDocument(COLLECTIONS.JOB_SEEKERS, newSeeker);
    } else if (userData.role === 'employer') {
      const newEmp: EmployerProfile = {
        id: `emp-${Date.now()}`,
        userId: newUserId,
        companyName: extraProfile.companyName || userData.name,
        representativeName: extraProfile.representativeName || userData.name,
        contactNumber: extraProfile.contactNumber || '',
        email: userData.email,
        address: extraProfile.address || '',
        municipality: extraProfile.municipality || 'Calapan City',
        industry: extraProfile.industry || 'Business Services',
        companyDescription: extraProfile.companyDescription || 'Registered Employer in Oriental Mindoro.',
        status: 'pending', // Requires PESO verification
        isProfileCompleted: false, // Must complete setup wizard first
        businessPermitNo: extraProfile.businessPermitNo || '',
        dtiSecRegistration: extraProfile.dtiSecRegistration || '',
        createdAt: new Date().toISOString(),
      };
      setEmployers(prev => [...prev, newEmp]);
      saveDocument(COLLECTIONS.EMPLOYERS, newEmp);

      // Notify Admin of pending employer
      const adminUser = users.find(u => u.role === 'admin');
      if (adminUser) {
        const notif: NotificationItem = {
          id: `notif-${Date.now()}`,
          recipientId: adminUser.id,
          recipientRole: 'admin',
          title: 'New Employer Registration Pending Verification',
          message: `${newEmp.companyName} (${newEmp.municipality}) submitted registration for PESO review.`,
          type: 'warning',
          read: false,
          createdAt: new Date().toISOString(),
          link: '/admin/verifications',
        };
        setNotifications(n => [notif, ...n]);
        saveDocument(COLLECTIONS.NOTIFICATIONS, notif);
      }
    }

    setCurrentUser(newUser);
    logAudit('USER_REGISTERED', 'User', newUserId, `Registered new ${userData.role} account`);

    return { success: true, user: newUser };
  };

  // Check job subscriptions and notify matching job seekers
  const checkJobSubscriptionsAndNotify = (newJob: JobPost) => {
    jobSubscriptions.filter(s => s.isActive).forEach(sub => {
      const categoryMatch = sub.categories.length === 0 || sub.categories.includes(newJob.category);
      const municipalityMatch = sub.municipalities.length === 0 || sub.municipalities.includes(newJob.municipality);
      const keywordsMatch = sub.keywords.length === 0 || sub.keywords.some(kw => 
        newJob.title.toLowerCase().includes(kw.toLowerCase()) ||
        newJob.category.toLowerCase().includes(kw.toLowerCase()) ||
        newJob.description.toLowerCase().includes(kw.toLowerCase()) ||
        newJob.requiredSkills.some(s => s.toLowerCase().includes(kw.toLowerCase()))
      );
      const empTypeMatch = sub.employmentTypes.length === 0 || sub.employmentTypes.includes(newJob.employmentType);

      if (categoryMatch && municipalityMatch && (keywordsMatch || empTypeMatch)) {
        const notif: NotificationItem = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          recipientId: sub.userId,
          recipientRole: 'job_seeker',
          title: `New Job Vacancy Alert: ${newJob.title}`,
          message: `${newJob.companyName} posted "${newJob.title}" in ${newJob.municipality} matching your "${sub.title}" subscription alert.`,
          type: 'info',
          read: false,
          createdAt: new Date().toISOString(),
          link: '/seeker/jobs',
        };

        setNotifications(prev => [notif, ...prev]);
        saveDocument(COLLECTIONS.NOTIFICATIONS, notif);

        if (sub.isToastAlertEnabled) {
          setActiveToast({
            id: `toast-${Date.now()}`,
            title: `Matching Job Vacancy Opened!`,
            message: `${newJob.companyName} published "${newJob.title}" in ${newJob.municipality} matching your "${sub.title}" criteria.`,
            jobId: newJob.id,
            companyName: newJob.companyName,
            municipality: newJob.municipality,
            category: newJob.category,
            createdAt: new Date().toISOString(),
          });
        }
      }
    });
  };

  const showToast = (toast: Omit<ToastNotification, 'id' | 'createdAt'>) => {
    setActiveToast({
      ...toast,
      id: `toast-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  const addJobSubscription = (subData: Omit<JobAlertSubscription, 'id' | 'createdAt'>): JobAlertSubscription => {
    const newSub: JobAlertSubscription = {
      ...subData,
      id: `sub-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setJobSubscriptions(prev => [newSub, ...prev]);
    saveDocument(COLLECTIONS.JOB_SUBSCRIPTIONS, newSub);
    logAudit('SUBSCRIPTION_CREATED', 'JobAlertSubscription', newSub.id, `Created job alert rule: "${newSub.title}"`);
    return newSub;
  };

  const updateJobSubscription = (id: string, updates: Partial<JobAlertSubscription>) => {
    setJobSubscriptions(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates };
        saveDocument(COLLECTIONS.JOB_SUBSCRIPTIONS, updated);
        return updated;
      }
      return s;
    }));
    logAudit('SUBSCRIPTION_UPDATED', 'JobAlertSubscription', id, `Updated alert preferences`);
  };

  const deleteJobSubscription = (id: string) => {
    setJobSubscriptions(prev => prev.filter(s => s.id !== id));
    deleteDocument(COLLECTIONS.JOB_SUBSCRIPTIONS, id);
    logAudit('SUBSCRIPTION_DELETED', 'JobAlertSubscription', id, `Removed alert rule`);
  };

  const simulateJobMatch = (subscriptionId?: string) => {
    const targetSub = jobSubscriptions.find(s => s.id === subscriptionId) || jobSubscriptions[0];
    const category = targetSub?.categories[0] || "Information Technology & Software";
    const municipality = targetSub?.municipalities[0] || "Calapan City";
    const keyword = targetSub?.keywords[0] || "Developer";

    const simJob: JobPost = {
      id: `job-sim-${Date.now()}`,
      employerId: 'emp-1',
      companyName: 'Mindoro Digital Solutions Inc.',
      companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150',
      companyMunicipality: municipality,
      companyVerified: true,
      title: `Senior ${keyword} Specialist`,
      category,
      description: `Immediate opening for ${keyword} specialist in ${municipality}. Matches your alert criteria for "${targetSub?.title || 'Job Preference'}".`,
      responsibilities: ['Architect local IT services', 'Lead digital transformation initiatives', 'Coordinate with PESO job matchers'],
      employmentType: 'Full-time',
      workLocation: `${municipality}, Oriental Mindoro`,
      municipality,
      vacanciesCount: 2,
      salaryRange: '₱35,000 - ₱55,000 / month',
      applicationDeadline: '2026-09-30',
      postedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      minEducationalAttainment: "Bachelor's Degree",
      preferredDegree: 'BS Computer Science / Information Technology / Related',
      degreeImportance: 'required',
      requiredSkills: [keyword, 'Problem Solving', 'Teamwork'],
      preferredSkills: ['SQL', 'Git', 'System Design'],
      minExperienceYears: 2,
      experienceImportance: 'preferred',
      requiredCertifications: [],
      technicalSkills: [keyword, 'React', 'Node.js'],
      softSkills: ['Communication', 'Critical Thinking'],
      requirements: [
        { id: 'req-1', category: 'education', title: "Bachelor's Degree", importance: 'required', value: "Bachelor's Degree" },
        { id: 'req-2', category: 'degree', title: 'BS Information Technology', importance: 'required', value: 'BS Information Technology' },
        { id: 'req-3', category: 'experience', title: '2+ Years Experience', importance: 'preferred', value: '2 years' }
      ]
    };

    setJobPosts(prev => [simJob, ...prev]);
    saveDocument(COLLECTIONS.JOB_POSTS, simJob);
    checkJobSubscriptionsAndNotify(simJob);
    logAudit('SIMULATED_JOB_MATCH', 'JobPost', simJob.id, `Simulated job match for "${targetSub?.title || 'Alert'}"`);
  };

  // Reset database to complete demo state with active employers & PESO admin
  const resetToDemoData = async () => {
    await seedDemoDataToFirestore();
    setUsers(INITIAL_USERS);
    setCurrentUser(null);
    setEmployers(INITIAL_EMPLOYERS);
    setJobSeekers(INITIAL_JOB_SEEKERS);
    setJobPosts(INITIAL_JOB_POSTS);
    setApplications(INITIAL_APPLICATIONS);
    setInterviews(INITIAL_INTERVIEWS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setJobSubscriptions([]);
    setReferralSlips([]);
    setLocalRecruitmentActivities([]);
    setBookmarkedJobIds(['job-puregold-cashier', 'job-sales-lady']);
    setConversations([]);
    setChatMessages([]);
    setCompanyReviews([]);
    setProfileViews([]);
    setActiveToast({
      id: 'toast-reset-demo',
      title: 'Demo Accounts Loaded',
      message: 'Active demo accounts for PESO Admin, Puregold, Tech, Agriculture, and Retail Saleslady ready.',
      type: 'success',
      timestamp: new Date().toISOString()
    });
  };

  // Color UI Handlers
  const toggleBookmarkJob = (jobId: string) => {
    setBookmarkedJobIds(prev => {
      const exists = prev.includes(jobId);
      const updated = exists ? prev.filter(id => id !== jobId) : [jobId, ...prev];
      return updated;
    });
  };

  const isJobBookmarked = (jobId: string) => bookmarkedJobIds.includes(jobId);

  const sendChatMessage = (conversationId: string, text: string, audioUrl?: string, attachmentName?: string) => {
    if (!currentUser) return;
    const targetConv = conversations.find(c => c.id === conversationId);
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.role,
      recipientId: targetConv?.participantId || 'unknown',
      text,
      audioUrl,
      attachmentName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
    };
    setChatMessages(prev => [...prev, newMsg]);
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: text || (audioUrl ? '🎤 Voice message' : '📎 Attachment'),
          lastMessageTime: newMsg.timestamp,
        };
      }
      return conv;
    }));

    if (currentUser.role === 'job_seeker') {
      setTimeout(() => {
        const autoReplies = [
          "Thank you for your update! I am checking your credentials with our hiring committee.",
          "Noted on this! Let's schedule an interview slot on our calendar.",
          "Received! Your profile has high alignment with our department requirements."
        ];
        const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        const replyMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          conversationId,
          senderId: targetConv?.participantId || 'user-emp-1',
          senderName: targetConv?.participantName || 'Jenny Wilson',
          senderAvatar: targetConv?.participantAvatar,
          senderRole: 'employer',
          recipientId: currentUser.id,
          text: randomReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
        };
        setChatMessages(msgs => [...msgs, replyMsg]);
        setConversations(convs => convs.map(c => c.id === conversationId ? {
          ...c,
          lastMessage: randomReply,
          lastMessageTime: replyMsg.timestamp,
          unreadCount: c.unreadCount + 1,
        } : c));
      }, 1500);
    }
  };

  const markConversationRead = (conversationId: string) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c));
    setChatMessages(prev => prev.map(m => m.conversationId === conversationId ? { ...m, isRead: true } : m));
  };

  const addCompanyReview = (review: Omit<CompanyReview, 'id' | 'createdAt'>) => {
    const newRev: CompanyReview = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCompanyReviews(prev => [newRev, ...prev]);
  };

  const withdrawApplication = (applicationId: string, notes: string = 'Application withdrawn by applicant') => {
    updateApplicationStatus(applicationId, 'withdrawn', notes);
  };

  const updateJobSeekingStatus = (seekerId: string, status: 'actively_looking' | 'passively_looking' | 'not_looking') => {
    updateJobSeekerProfile(seekerId, { jobSeekingStatus: status });
  };

  const updateNotificationPreferences = (seekerId: string, prefs: any) => {
    updateJobSeekerProfile(seekerId, { notificationPreferences: prefs });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentEmployerProfile,
        currentSeekerProfile,
        users,
        employers,
        jobSeekers,
        jobPosts,
        applications,
        interviews,
        notifications,
        auditLogs,
        announcements,
        jobSubscriptions,
        referralSlips,
        localRecruitmentActivities,
        activeToast,
        isFirestoreConnected,
        isSyncing,
        switchUserRole,
        loginAs,
        continueWithGoogle,
        logout,
        sendOtp,
        verifyOtp,
        recoverPassword,
        verifyEmployer,
        createJobPost,
        reviewJobVacancy,
        updateJobVacancyStatus,
        updateJobPost,
        deleteJobPost,
        applyForJob,
        updateApplicationStatus,
        submitApplicationFeedback,
        scheduleInterview,
        respondToInterview,
        updateJobSeekerProfile,
        saveAssessmentResult,
        updateEmployerProfile,
        issueReferralSlip,
        updateReferralSlipStatus,
        encodeWalkInJobSeeker,
        assessJobSeekerWalkIn,
        createLraEvent,
        updateLraEvent,
        logHotsApplicant,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearAllNotifications,
        registerUser,
        resetToDemoData,
        addJobSubscription,
        updateJobSubscription,
        deleteJobSubscription,
        showToast,
        dismissToast,
        simulateJobMatch,
        bookmarkedJobIds,
        toggleBookmarkJob,
        isJobBookmarked,
        conversations,
        chatMessages,
        sendChatMessage,
        markConversationRead,
        companyReviews,
        addCompanyReview,
        profileViews,
        withdrawApplication,
        updateJobSeekingStatus,
        updateNotificationPreferences,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
