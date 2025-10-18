import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { CollaborativeSession, SessionMember } from '@/types/session.types';
import { useToast } from './use-toast';
import { removeUndefinedFields } from '@/utils/firestore';

/**
 * Hook for managing a collaborative session with real-time updates
 * @param sessionId - The collaborative session ID
 * @returns Session state and update functions
 */
export function useCollaborativeSession(sessionId: string | null) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [session, setSession] = useState<CollaborativeSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener for the collaborative session
  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      setSession(null);
      return;
    }

    const sessionRef = doc(db, 'collaborativeSessions', sessionId);

    const unsubscribe = onSnapshot(
      sessionRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setSession({ id: snapshot.id, ...snapshot.data() } as CollaborativeSession);
          setError(null);
        } else {
          setSession(null);
          setError('Session not found');
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Error listening to session:', err);
        setError(err.message);
        setIsLoading(false);
        toast({
          title: 'Connection Error',
          description: 'Could not connect to collaborative session.',
          variant: 'destructive',
        });
      }
    );

    return () => unsubscribe();
  }, [sessionId, toast]);

  /**
   * Updates the collaborative session
   * @param updates - Partial session data to update
   */
  const updateSession = useCallback(
    async (updates: Partial<CollaborativeSession>) => {
      if (!sessionId) return;

      try {
        const sessionRef = doc(db, 'collaborativeSessions', sessionId);
        const cleanedUpdates = removeUndefinedFields(updates);

        await updateDoc(sessionRef, {
          ...cleanedUpdates,
          lastActivity: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error updating session:', error);
        toast({
          title: 'Update Failed',
          description: 'Could not update session.',
          variant: 'destructive',
        });
      }
    },
    [sessionId, toast]
  );

  /**
   * Adds the current user as a member of the session
   * @param anonymousName - Optional name for anonymous users
   */
  const joinSession = useCallback(
    async (anonymousName?: string) => {
      if (!sessionId) return;

      try {
        const sessionRef = doc(db, 'collaborativeSessions', sessionId);

        const newMember: SessionMember = {
          userId: user?.uid || null,
          name: user?.displayName || anonymousName || 'Anonymous',
          email: user?.email || null,
          photoURL: user?.photoURL || null,
          joinedAt: Timestamp.now(),
          isAnonymous: !user,
        };

        await updateDoc(sessionRef, {
          members: arrayUnion(newMember),
          lastActivity: serverTimestamp(),
        });

        toast({
          title: 'Joined Session',
          description: 'You joined the collaborative bill session.',
        });
      } catch (error) {
        console.error('Error joining session:', error);
        toast({
          title: 'Join Failed',
          description: 'Could not join session.',
          variant: 'destructive',
        });
      }
    },
    [sessionId, user, toast]
  );

  /**
   * Ends the collaborative session
   */
  const endSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      const sessionRef = doc(db, 'collaborativeSessions', sessionId);
      await updateDoc(sessionRef, {
        status: 'ended',
        endedAt: serverTimestamp(),
      });

      toast({
        title: 'Session Ended',
        description: 'The collaborative session has been ended.',
      });
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: 'Error',
        description: 'Could not end session.',
        variant: 'destructive',
      });
    }
  }, [sessionId, toast]);

  return {
    session,
    isLoading,
    error,
    updateSession,
    joinSession,
    endSession,
  };
}
