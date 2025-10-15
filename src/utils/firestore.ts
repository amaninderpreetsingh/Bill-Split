import { doc, setDoc, arrayUnion, FirestoreError } from 'firebase/firestore';
import { db } from '@/config/firebase';

/**
 * Friend data structure for Firestore
 */
export interface FriendData {
  name: string;
  venmoId?: string;
}

/**
 * Result type for Firestore operations
 */
export interface FirestoreResult {
  success: boolean;
  error?: {
    title: string;
    description: string;
  };
}

/**
 * Saves a friend to the user's friends list in Firestore
 * @param userId - User's UID
 * @param friend - Friend data to save
 * @returns Result indicating success or error details
 */
export async function saveFriendToFirestore(
  userId: string,
  friend: FriendData
): Promise<FirestoreResult> {
  try {
    const userDocRef = doc(db, 'users', userId);

    // Build friend object, only include venmoId if it exists
    const friendData: FriendData = {
      name: friend.name.trim(),
    };

    if (friend.venmoId) {
      friendData.venmoId = friend.venmoId;
    }

    await setDoc(
      userDocRef,
      {
        friends: arrayUnion(friendData),
      },
      { merge: true }
    );

    return { success: true };
  } catch (error) {
    console.error('Error saving friend to Firestore:', error);

    const firebaseError = error as FirestoreError;
    return {
      success: false,
      error: {
        title: 'Error saving friend',
        description: firebaseError.message || 'Could not save to friends list.',
      },
    };
  }
}

/**
 * Updates a user's profile in Firestore
 * @param userId - User's UID
 * @param updates - Profile fields to update
 * @returns Result indicating success or error details
 */
export async function updateUserProfile(
  userId: string,
  updates: Record<string, unknown>
): Promise<FirestoreResult> {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, updates, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);

    const firebaseError = error as FirestoreError;
    return {
      success: false,
      error: {
        title: 'Error updating profile',
        description: firebaseError.message || 'Could not update profile.',
      },
    };
  }
}

/**
 * Creates a person object for adding to a bill
 * @param name - Person's name
 * @param venmoId - Optional Venmo ID
 * @param useNameAsVenmoId - Whether to use name as Venmo ID
 * @returns Person object with venmoId set appropriately
 */
export function createPersonObject(
  name: string,
  venmoId: string,
  useNameAsVenmoId: boolean
): { name: string; venmoId?: string } {
  const trimmedName = name.trim();
  const trimmedVenmoId = venmoId.trim();

  const personData: { name: string; venmoId?: string } = {
    name: trimmedName,
  };

  // Set venmoId based on preference
  if (useNameAsVenmoId) {
    personData.venmoId = trimmedName;
  } else if (trimmedVenmoId) {
    personData.venmoId = trimmedVenmoId;
  }

  return personData;
}

/**
 * Recursively removes all fields with `undefined` values from an object.
 * Firestore does not support `undefined` values.
 * @param obj The object to sanitize.
 * @returns A new object with `undefined` fields removed.
 */
export function removeUndefinedFields(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedFields(item));
  }

  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value !== undefined) {
        newObj[key] = removeUndefinedFields(value);
      }
    }
  }
  return newObj;
}
