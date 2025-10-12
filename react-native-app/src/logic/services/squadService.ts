import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Squad, SquadMember, CreateSquadInput, UpdateSquadInput } from '@/types/squad.types';
import { generateSquadId, sanitizeSquadMembers } from '@/utils/squadUtils';

interface FirestoreSquad {
  id: string;
  name: string;
  description?: string;
  members: SquadMember[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Converts a Firestore squad document to a Squad object
 */
function convertFromFirestore(data: FirestoreSquad): Squad {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    members: data.members,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}

/**
 * Converts a Squad object to Firestore format
 */
function convertToFirestore(squad: Omit<Squad, 'createdAt' | 'updatedAt'> & { createdAt?: Date; updatedAt?: Date }): Omit<FirestoreSquad, 'id'> {
  return {
    id: squad.id,
    name: squad.name,
    description: squad.description,
    members: squad.members,
    createdAt: squad.createdAt ? Timestamp.fromDate(squad.createdAt) : Timestamp.now(),
    updatedAt: squad.updatedAt ? Timestamp.fromDate(squad.updatedAt) : Timestamp.now(),
  };
}

/**
 * Fetches all squads for a user
 * @param userId - The user's unique identifier
 * @returns Array of Squad objects
 * @throws Error if fetch fails
 */
export async function fetchUserSquads(userId: string): Promise<Squad[]> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return [];
    }

    const data = userDoc.data();
    const squadsData = data.squads || [];

    return squadsData.map(convertFromFirestore);
  } catch (error) {
    console.error('Error fetching squads:', error);
    throw new Error('Failed to load squads');
  }
}

/**
 * Saves a new squad for a user
 * @param userId - The user's unique identifier
 * @param input - Squad creation data
 * @returns The ID of the newly created squad
 * @throws Error if save fails
 */
export async function saveSquad(userId: string, input: CreateSquadInput): Promise<string> {
  try {
    const squadId = generateSquadId();
    const now = new Date();

    const newSquad: Squad = {
      id: squadId,
      name: input.name.trim(),
      description: input.description?.trim(),
      members: sanitizeSquadMembers(input.members),
      createdAt: now,
      updatedAt: now,
    };

    // Fetch existing squads
    const existingSquads = await fetchUserSquads(userId);

    // Add new squad
    const updatedSquads = [...existingSquads, newSquad];

    // Save to Firestore
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        squads: updatedSquads.map(convertToFirestore),
      },
      { merge: true }
    );

    return squadId;
  } catch (error) {
    console.error('Error saving squad:', error);
    throw new Error('Failed to save squad');
  }
}

/**
 * Updates an existing squad
 * @param userId - The user's unique identifier
 * @param squadId - The squad ID to update
 * @param updates - Partial squad data to update
 * @throws Error if update fails or squad not found
 */
export async function updateSquad(userId: string, squadId: string, updates: UpdateSquadInput): Promise<void> {
  try {
    const existingSquads = await fetchUserSquads(userId);
    const squadIndex = existingSquads.findIndex(s => s.id === squadId);

    if (squadIndex === -1) {
      throw new Error('Squad not found');
    }

    // Update the squad
    const updatedSquad: Squad = {
      ...existingSquads[squadIndex],
      ...(updates.name && { name: updates.name.trim() }),
      ...(updates.description !== undefined && { description: updates.description?.trim() }),
      ...(updates.members && { members: sanitizeSquadMembers(updates.members) }),
      updatedAt: new Date(),
    };

    existingSquads[squadIndex] = updatedSquad;

    // Save to Firestore
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        squads: existingSquads.map(convertToFirestore),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating squad:', error);
    throw new Error('Failed to update squad');
  }
}

/**
 * Deletes a squad
 * @param userId - The user's unique identifier
 * @param squadId - The squad ID to delete
 * @throws Error if delete fails
 */
export async function deleteSquad(userId: string, squadId: string): Promise<void> {
  try {
    const existingSquads = await fetchUserSquads(userId);
    const filteredSquads = existingSquads.filter(s => s.id !== squadId);

    // Save to Firestore
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        squads: filteredSquads.map(convertToFirestore),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error deleting squad:', error);
    throw new Error('Failed to delete squad');
  }
}

/**
 * Gets a single squad by ID
 * @param userId - The user's unique identifier
 * @param squadId - The squad ID to retrieve
 * @returns The Squad object or null if not found
 * @throws Error if fetch fails
 */
export async function getSquadById(userId: string, squadId: string): Promise<Squad | null> {
  try {
    const squads = await fetchUserSquads(userId);
    return squads.find(s => s.id === squadId) || null;
  } catch (error) {
    console.error('Error fetching squad:', error);
    throw new Error('Failed to load squad');
  }
}
