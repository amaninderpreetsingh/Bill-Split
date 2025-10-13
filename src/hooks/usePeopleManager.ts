import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from './useUserProfile';
import { Person } from '@/types';
import { useToast } from './use-toast';
import { generatePersonId, generateUserId } from '@/utils/billCalculations';
import { validatePersonInput } from '@/utils/validation';
import { saveFriendToFirestore, createPersonObject } from '@/utils/firestore';

/**
 * Hook for managing people on a bill
 * Handles adding, removing, and syncing with Firestore friends list
 * @returns People state and management handlers
 */

export function usePeopleManager() {
  const [people, setPeople] = useState<Person[]>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonVenmoId, setNewPersonVenmoId] = useState('');
  const [useNameAsVenmoId, setUseNameAsVenmoId] = useState(false);
  const [saveToFriendsList, setSaveToFriendsList] = useState(false);
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.displayName) {
      const userId = generateUserId(user.uid);
      const userExists = people.some(person => person.id === userId);
      if (!userExists) {
        const currentUser: Person = {
          id: userId,
          name: user.displayName,
          venmoId: profile?.venmoId,
        };
        setPeople(prevPeople => [currentUser, ...prevPeople]);
      }
    }
  }, [user, profile?.venmoId]);

  const addPerson = async () => {
    // Validate input
    const validation = validatePersonInput(newPersonName);
    if (!validation.isValid && validation.error) {
      toast({
        title: validation.error.title,
        description: validation.error.description,
        variant: 'destructive',
      });
      return;
    }

    // Create person object with proper venmoId handling
    const personData = createPersonObject(newPersonName, newPersonVenmoId, useNameAsVenmoId);

    const newPerson: Person = {
      id: generatePersonId(),
      ...personData,
    };

    setPeople([...people, newPerson]);

    // Save to friends list in Firestore if checked
    if (saveToFriendsList && user) {
      const result = await saveFriendToFirestore(user.uid, personData);

      if (result.success) {
        toast({
          title: 'Saved to friends',
          description: `${personData.name} has been saved to your friends list.`,
        });
      } else if (result.error) {
        toast({
          title: result.error.title,
          description: result.error.description,
          variant: 'destructive',
        });
      }
    }

    // Reset form
    setNewPersonName('');
    setNewPersonVenmoId('');
    setUseNameAsVenmoId(false);
    setSaveToFriendsList(false);
  };

  const removePerson = (personId: string) => {
    setPeople(people.filter(p => p.id !== personId));
  };

  const addFromFriend = (friend: { name: string; venmoId?: string }) => {
    const newPerson: Person = {
      id: generatePersonId(),
      name: friend.name,
      venmoId: friend.venmoId,
    };

    setPeople([...people, newPerson]);

    toast({
      title: 'Friend added',
      description: `${friend.name} has been added to the bill.`,
    });
  };

  return {
    people,
    newPersonName,
    newPersonVenmoId,
    useNameAsVenmoId,
    saveToFriendsList,
    setNewPersonName,
    setNewPersonVenmoId,
    setUseNameAsVenmoId,
    setSaveToFriendsList,
    addPerson,
    addFromFriend,
    removePerson,
    setPeople,
  };
}
