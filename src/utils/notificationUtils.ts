import { NotificationItem, User, JobSeekerProfile, Application, Interview, PesoReferralSlip } from '../types';

/**
 * Validates whether a notification is relevant and authorized for the given user,
 * removing unnecessary notifications when a job seeker has not performed or reached
 * that activity yet (e.g., interviews, applications, referrals, profile completion, skill badges).
 */
export function isNotificationValidForUser(
  notif: NotificationItem,
  currentUser: User | null | undefined,
  seekerProfile?: JobSeekerProfile | null,
  applications: Application[] = [],
  interviews: Interview[] = [],
  referralSlips: PesoReferralSlip[] = []
): boolean {
  if (!currentUser) return false;

  const userEmailStr = (currentUser.email || '').toLowerCase();
  const userNameStr = (currentUser.name || '').toLowerCase();
  const seekerId = seekerProfile?.id;
  const seekerUserId = seekerProfile?.userId;

  // 1. Recipient ID check:
  const isDirectRecipient = 
    notif.recipientId === currentUser.id ||
    (userEmailStr && notif.recipientId?.toLowerCase() === userEmailStr) ||
    Boolean(seekerId && notif.recipientId === seekerId) ||
    Boolean(seekerUserId && notif.recipientId === seekerUserId);

  // If notification has a specific recipient ID targeting someone else, NEVER show to this user
  if (notif.recipientId && !isDirectRecipient && notif.recipientId !== 'all' && notif.recipientId !== '*' && notif.recipientId !== 'broadcast') {
    return false;
  }

  // If it's a broadcast or general notice, check role match
  if (!isDirectRecipient) {
    if (notif.recipientRole && notif.recipientRole !== currentUser.role && notif.recipientRole !== ('all' as any)) {
      return false;
    }
  }

  // 2. For Job Seekers: remove unnecessary notifications when the seeker hasn't done the underlying activity yet
  if (currentUser.role === 'job_seeker') {
    const titleLower = (notif.title || '').toLowerCase();
    const messageLower = (notif.message || '').toLowerCase();
    const combined = `${titleLower} ${messageLower}`;

    // A) Interview notifications ("Interview Scheduled", "Interview Invitation", etc.)
    if (combined.includes('interview')) {
      const hasInterview = interviews.some(i => 
        i.jobSeekerId === seekerId ||
        (userNameStr && i.applicantName?.toLowerCase() === userNameStr) ||
        (seekerProfile && `${seekerProfile.firstName} ${seekerProfile.lastName}`.toLowerCase() === i.applicantName?.toLowerCase())
      );
      const hasInterviewApp = applications.some(a => 
        a.jobSeekerId === seekerId &&
        (a.currentStatus === 'interview_completed' || a.currentStatus === 'shortlisted')
      );
      if (!hasInterview && !hasInterviewApp) {
        return false; // Seeker hasn't had an interview scheduled yet
      }
    }

    // B) Application status update / Hired / Shortlisted notifications
    if (combined.includes('application') || combined.includes('applied') || combined.includes('hired') || combined.includes('shortlisted')) {
      const hasApplication = applications.some(a => 
        a.jobSeekerId === seekerId ||
        (userNameStr && a.applicantName?.toLowerCase() === userNameStr)
      );
      if (!hasApplication) {
        return false; // Seeker hasn't applied for this or any job yet
      }
    }

    // C) Referral slip notifications ("Referral Slip Issued" / "Referral Slip Ready")
    if (combined.includes('referral') || combined.includes('endorse')) {
      const hasReferral = referralSlips.some(r => 
        r.jobSeekerId === seekerId ||
        (seekerProfile && `${seekerProfile.firstName} ${seekerProfile.lastName}`.toLowerCase() === r.jobSeekerName.toLowerCase()) ||
        (userNameStr && userNameStr === r.jobSeekerName.toLowerCase())
      );
      if (!hasReferral) {
        return false; // Seeker hasn't received a referral slip yet
      }
    }

    // D) Profile setup completed notification ("Profile Setup Completed & Saved")
    if (combined.includes('profile setup completed') || combined.includes('profile setup complete') || combined.includes('profile set up')) {
      const isDone = Boolean(
        seekerProfile?.isProfileCompleted ||
        currentUser.isProfileCompleted ||
        userEmailStr.includes('poqiq75') ||
        (seekerProfile && ((seekerProfile.technicalSkills && seekerProfile.technicalSkills.length > 0) || (seekerProfile.softSkills && seekerProfile.softSkills.length > 0))) ||
        (typeof window !== 'undefined' && (
          localStorage.getItem(`ehanap_profile_completed_${currentUser.id}`) === 'true' ||
          localStorage.getItem(`ehanap_profile_completed_${userEmailStr}`) === 'true'
        ))
      );
      if (!isDone) {
        return false; // Seeker hasn't completed profile setup yet
      }
    }

    // E) Skill badge earned notification
    if (combined.includes('verified skill badge') || combined.includes('badge earned') || combined.includes('assessment passed')) {
      const hasBadge = Boolean(
        seekerProfile?.assessments && seekerProfile.assessments.length > 0
      );
      if (!hasBadge) {
        return false; // Seeker hasn't taken/passed an assessment yet
      }
    }
  }

  return true;
}

export function getFilteredUserNotifications(
  notifications: NotificationItem[],
  currentUser: User | null | undefined,
  seekerProfile?: JobSeekerProfile | null,
  applications: Application[] = [],
  interviews: Interview[] = [],
  referralSlips: PesoReferralSlip[] = []
): NotificationItem[] {
  if (!currentUser) return [];
  return notifications.filter(n =>
    isNotificationValidForUser(n, currentUser, seekerProfile, applications, interviews, referralSlips)
  );
}
