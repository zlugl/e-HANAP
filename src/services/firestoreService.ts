import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  User, 
  EmployerProfile, 
  JobSeekerProfile, 
  JobPost, 
  Application, 
  Interview, 
  NotificationItem, 
  AuditLog, 
  SystemAnnouncement, 
  JobAlertSubscription 
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_EMPLOYERS,
  INITIAL_JOB_POSTS,
  INITIAL_JOB_SEEKERS,
  INITIAL_APPLICATIONS,
  INITIAL_INTERVIEWS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ANNOUNCEMENTS
} from '../data/mockData';

export const COLLECTIONS = {
  USERS: 'users',
  EMPLOYERS: 'employers',
  JOB_SEEKERS: 'jobSeekers',
  JOB_POSTS: 'jobPosts',
  APPLICATIONS: 'applications',
  INTERVIEWS: 'interviews',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'auditLogs',
  ANNOUNCEMENTS: 'announcements',
  JOB_SUBSCRIPTIONS: 'jobSubscriptions',
  REFERRAL_SLIPS: 'referralSlips',
  LRA_EVENTS: 'lraEvents',
} as const;

/**
 * Ensures system has demo accounts for PESO Admin, Puregold (Cashier & Bagger), Tech, Agriculture, and Saleslady.
 */
export async function ensureAdminAccountExists(): Promise<boolean> {
  return ensureDemoAccountsExist();
}

export async function ensureDemoAccountsExist(): Promise<boolean> {
  try {
    const adminDocRef = doc(db, COLLECTIONS.USERS, 'user-peso-admin-01');
    const adminDoc = await getDoc(adminDocRef);

    if (!adminDoc.exists()) {
      console.log('[Firestore] Seeding demo accounts and job postings into Firestore...');
      return seedDemoDataToFirestore();
    }
    return true;
  } catch (error) {
    console.warn('[Firestore] Error verifying demo accounts in Firestore:', error);
    return false;
  }
}

/**
 * Seeds demo accounts and vacancies to Firestore.
 */
export async function seedDemoDataToFirestore(): Promise<boolean> {
  try {
    const batch = writeBatch(db);

    // 1. Users
    INITIAL_USERS.forEach((u) => {
      const ref = doc(db, COLLECTIONS.USERS, u.id);
      batch.set(ref, u, { merge: true });
    });

    // 2. Employers
    INITIAL_EMPLOYERS.forEach((e) => {
      const ref = doc(db, COLLECTIONS.EMPLOYERS, e.id);
      batch.set(ref, e, { merge: true });
    });

    // 3. Job Posts
    INITIAL_JOB_POSTS.forEach((j) => {
      const ref = doc(db, COLLECTIONS.JOB_POSTS, j.id);
      batch.set(ref, j, { merge: true });
    });

    // 4. Job Seekers
    INITIAL_JOB_SEEKERS.forEach((s) => {
      const ref = doc(db, COLLECTIONS.JOB_SEEKERS, s.id);
      batch.set(ref, s, { merge: true });
    });

    // 5. Applications
    INITIAL_APPLICATIONS.forEach((a) => {
      const ref = doc(db, COLLECTIONS.APPLICATIONS, a.id);
      batch.set(ref, a, { merge: true });
    });

    // 6. Interviews
    INITIAL_INTERVIEWS.forEach((i) => {
      const ref = doc(db, COLLECTIONS.INTERVIEWS, i.id);
      batch.set(ref, i, { merge: true });
    });

    // 7. Notifications
    INITIAL_NOTIFICATIONS.forEach((n) => {
      const ref = doc(db, COLLECTIONS.NOTIFICATIONS, n.id);
      batch.set(ref, n, { merge: true });
    });

    // 8. Audit Logs
    INITIAL_AUDIT_LOGS.forEach((l) => {
      const ref = doc(db, COLLECTIONS.AUDIT_LOGS, l.id);
      batch.set(ref, l, { merge: true });
    });

    // 9. Announcements
    INITIAL_ANNOUNCEMENTS.forEach((an) => {
      const ref = doc(db, COLLECTIONS.ANNOUNCEMENTS, an.id);
      batch.set(ref, an, { merge: true });
    });

    await batch.commit();
    console.log('[Firestore] Successfully seeded all demo accounts and job vacancies.');
    return true;
  } catch (error) {
    console.warn('[Firestore] Error seeding demo data to Firestore:', error);
    return false;
  }
}

/**
 * Ensures system starts with a completely clean, zero-data state.
 * Purges legacy mock records from prior demo runs and provisions only the required PESO admin account.
 */
export async function initializeCleanDatabase(): Promise<boolean> {
  try {
    console.log('[Firestore] Initializing clean zero-data state for eHANAP Roxas PESO...');

    // Clean up all demo records from all collections
    const collectionsToClean = [
      COLLECTIONS.USERS,
      COLLECTIONS.EMPLOYERS,
      COLLECTIONS.JOB_SEEKERS,
      COLLECTIONS.JOB_POSTS,
      COLLECTIONS.APPLICATIONS,
      COLLECTIONS.INTERVIEWS,
      COLLECTIONS.NOTIFICATIONS,
      COLLECTIONS.AUDIT_LOGS,
      COLLECTIONS.ANNOUNCEMENTS,
      COLLECTIONS.JOB_SUBSCRIPTIONS,
      COLLECTIONS.REFERRAL_SLIPS,
      COLLECTIONS.LRA_EVENTS,
    ];

    // Wipe any existing test documents in parallel
    for (const colName of collectionsToClean) {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.forEach((d) => {
          batch.delete(d.ref);
        });
        await batch.commit();
        console.log(`[Firestore] Purged ${snapshot.size} legacy records from ${colName}.`);
      }
    }

    console.log('[Firestore] System is now in a 100% clean zero-data initial state from scratch.');
    return true;
  } catch (error) {
    console.warn('[Firestore] Error initializing clean database:', error);
    return false;
  }
}

/**
 * Real-time collection listener helper with callback
 */
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onData: (data: T[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as T);
        });
        onData(items);
      },
      (err) => {
        console.warn(`[Firestore] Snapshot error for ${collectionName}:`, err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn(`[Firestore] Failed to set up snapshot for ${collectionName}:`, err);
    return () => {};
  }
}

/**
 * Generic Firestore CRUD helpers
 */
export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  item: T
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, item, { merge: true });
  } catch (error) {
    console.warn(`[Firestore] Error saving document in ${collectionName}:`, error);
  }
}

export async function updateDocument(
  collectionName: string,
  docId: string,
  updates: Record<string, any>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.warn(`[Firestore] Error updating document in ${collectionName} (${docId}):`, error);
  }
}

export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn(`[Firestore] Error deleting document in ${collectionName} (${docId}):`, error);
  }
}

export async function resetDatabaseToClean(): Promise<void> {
  await initializeCleanDatabase();
}
