import { useState, useCallback } from 'react';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { BillSession, CollaborativeSession, SessionMember } from '@/types/session.types';
import { generateShareCode, generateSessionId } from '@/utils/shareCode';
import { useToast } from './use-toast';
import { removeUndefinedFields } from '@/utils/firestore';

/**
 * Hook for creating and sharing collaborative sessions
 */
export function useShareSession() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  /**
   * Creates a new collaborative session from scratch
   * @returns The new session ID and share code
   */
  const createCollaborativeSession = useCallback(async (): Promise<{
    sessionId: string;
    shareCode: string;
  } | null> => {
    setIsCreating(true);
    try {
      const sessionId = generateSessionId();
      const shareCode = generateShareCode();

      const newMember: SessionMember = user
        ? {
            userId: user.uid,
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            joinedAt: Timestamp.now(),
            isAnonymous: false,
          }
        : {
            userId: null,
            name: 'Anonymous',
            email: null,
            photoURL: null,
            joinedAt: Timestamp.now(),
            isAnonymous: true,
          };

      const collaborativeSession: Omit<CollaborativeSession, 'id'> = {
        creatorId: user?.uid || null,
        shareCode,
        billData: null,
        itemAssignments: {},
        people: [],
        customTip: '',
        customTax: '',
        assignmentMode: 'checkboxes',
        splitEvenly: false,
        receiptImageUrl: null,
        receiptFileName: null,
        status: 'active',
        createdAt: Timestamp.now(),
        lastActivity: Timestamp.now(),
        isPublic: true,
        members: [newMember],
      };

      const sessionRef = doc(db, 'collaborativeSessions', sessionId);
      await setDoc(sessionRef, collaborativeSession);

      toast({
        title: 'Session Created',
        description: 'Your collaborative session is ready to share!',
      });

      return { sessionId, shareCode };
    } catch (error) {
      console.error('Error creating collaborative session:', error);
      toast({
        title: 'Creation Failed',
        description: 'Could not create collaborative session.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [user, toast]);

  /**
   * Converts a private session to a collaborative session
   * @param privateSession - The private session to share
   * @param receiptFile - Optional receipt file to upload
   * @returns The new collaborative session ID and share code
   */
  const sharePrivateSession = useCallback(
    async (
      privateSession: BillSession,
      receiptFile?: File
    ): Promise<{ sessionId: string; shareCode: string } | null> => {
      setIsSharing(true);
      try {
        const sessionId = generateSessionId();
        const shareCode = generateShareCode();

        // Reuse existing receipt URL from private session
        // No need to re-upload since it's already in Firebase Storage
        const receiptImageUrl = privateSession.receiptImageUrl || null;
        const receiptFileName = privateSession.receiptFileName || null;

        // Note: If you want to copy the receipt to collaborative storage in the future,
        // you'll need to fix the Storage rules first. For now, we just reference
        // the existing uploaded receipt.

        const newMember: SessionMember = user
          ? {
              userId: user.uid,
              name: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              joinedAt: Timestamp.now(),
              isAnonymous: false,
            }
          : {
              userId: null,
              name: 'Anonymous',
              email: null,
              photoURL: null,
              joinedAt: Timestamp.now(),
              isAnonymous: true,
            };

        const collaborativeSession: Omit<CollaborativeSession, 'id'> = {
          creatorId: user?.uid || null,
          shareCode,
          billData: privateSession.billData,
          itemAssignments: privateSession.itemAssignments || {},
          people: privateSession.people || [],
          customTip: privateSession.customTip || '',
          customTax: privateSession.customTax || '',
          assignmentMode: privateSession.assignmentMode || 'checkboxes',
          splitEvenly: privateSession.splitEvenly || false,
          receiptImageUrl,
          receiptFileName,
          status: 'active',
          createdAt: Timestamp.now(),
          lastActivity: Timestamp.now(),
          isPublic: true,
          members: [newMember],
        };

        const cleanedSession = removeUndefinedFields(collaborativeSession);
        const sessionRef = doc(db, 'collaborativeSessions', sessionId);
        await setDoc(sessionRef, cleanedSession);

        toast({
          title: 'Session Shared',
          description: 'Your session is now collaborative!',
        });

        return { sessionId, shareCode };
      } catch (error) {
        console.error('Error sharing session:', error);
        toast({
          title: 'Share Failed',
          description: 'Could not share session.',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsSharing(false);
      }
    },
    [user, toast]
  );

  return {
    isCreating,
    isSharing,
    createCollaborativeSession,
    sharePrivateSession,
  };
}
