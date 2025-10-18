import { Timestamp } from 'firebase/firestore';
import { AssignmentMode, ItemAssignment } from './assignment.types';
import { BillData } from './bill.types';
import { Person } from './person.types';

export interface BillSession {
  id: string;
  status: 'active' | 'saved';
  savedAt?: Timestamp;
  billData: BillData | null;
  itemAssignments: ItemAssignment;
  people: Person[];
  // Storing tip and tax separately to preserve user input
  customTip: string;
  customTax: string;
  assignmentMode: AssignmentMode;
  splitEvenly: boolean;
  receiptImageUrl?: string;
  receiptFileName?: string;
}

/**
 * Member of a collaborative session
 */
export interface SessionMember {
  userId: string | null; // null for anonymous users
  name: string | null; // display name
  email?: string | null;
  photoURL?: string | null;
  joinedAt: Timestamp;
  isAnonymous: boolean;
}

/**
 * Collaborative session that can be shared with multiple users
 */
export interface CollaborativeSession {
  id: string;
  creatorId: string | null; // null if created anonymously
  shareCode: string; // 6-character code like "AB3X9K"
  billData: BillData | null;
  itemAssignments: ItemAssignment;
  people: Person[];
  customTip: string;
  customTax: string;
  assignmentMode: AssignmentMode;
  splitEvenly: boolean;
  receiptImageUrl: string | null;
  receiptFileName: string | null;
  status: 'active' | 'ended';
  createdAt: Timestamp;
  lastActivity: Timestamp; // for auto-timeout
  endedAt?: Timestamp;
  isPublic: boolean; // true for shared sessions
  members: SessionMember[];
}

/**
 * User's reference to a collaborative session they participated in
 */
export interface SessionHistoryEntry {
  sessionId: string;
  sessionType: 'collaborative' | 'private';
  role: 'creator' | 'collaborator';
  lastViewed: Timestamp;
  savedAt: Timestamp;
}
