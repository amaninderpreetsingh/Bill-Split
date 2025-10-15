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
