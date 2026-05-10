import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

export enum LogCategory {
  AUTH = 'AUTH',
  VIEW = 'VIEW',
  REVIEW = 'REVIEW',
  BUSINESS_OPS = 'BUSINESS_OPS',
  SYSTEM = 'SYSTEM',
  SESSION = 'SESSION'
}

export interface LogEntry {
  category: LogCategory;
  action: string;
  details?: any;
  userId?: string | null;
  userEmail?: string | null;
  sessionDuration?: number;
}

export async function logActivity(entry: LogEntry) {
  try {
    const user = auth.currentUser;
    const logData = {
      ...entry,
      userId: entry.userId || user?.uid || 'anonymous',
      userEmail: entry.userEmail || user?.email || 'anonymous',
      timestamp: serverTimestamp(),
    };

    await addDoc(collection(db, 'logs'), logData);
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Be silent in UI, just log to console
  }
}

// Session tracking helper
let sessionStart = Date.now();

export function resetSessionTimer() {
  sessionStart = Date.now();
}

export function logSessionEnd() {
  const duration = Math.floor((Date.now() - sessionStart) / 1000); // duration in seconds
  if (duration < 5) return; // Ignore very short transitions

  logActivity({
    category: LogCategory.SESSION,
    action: 'SESSION_END',
    sessionDuration: duration,
    details: {
      url: window.location.pathname
    }
  });
}
