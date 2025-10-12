import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from './useUserProfile';
import { Person } from '../types';
import { useToast } from './use-toast';

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
      const userExists = people.some(person => person.id === `user-${user.uid}`);
      if (!userExists) {
        const currentUser: Person = {
          id: `user-${user.uid}`,
          name: user.displayName,
          venmoId: profile?.venmoId,
        };
        setPeople(prevPeople => [currentUser, ...prevPeople]);
      }
    }
  }, [user, profile?.venmoId]);

  const addPerson = async () => {
    if (!newPersonName.trim()) {
      toast({
        title: 'Name required',
        description: "Please enter a person's name.",
        variant: 'destructive',
      });
      return;
    }

    const venmoId = useNameAsVenmoId
      ? newPersonName.trim()
      : newPersonVenmoId.trim() || undefined;

    const newPerson: Person = {
      id: `person-${Date.now()}`,
      name: newPersonName.trim(),
      venmoId: venmoId,
    };

    setPeople([...people, newPerson]);

    // Save to friends list in Firestore if checked
    if (saveToFriendsList && user) {
      try {
        const { doc, setDoc, arrayUnion } = await import('firebase/firestore');
        const { db } = await import('../../config/firebase');

        const userDocRef = doc(db, 'users', user.uid);

        // Build friend object, only include venmoId if it exists
        const friendData: { name: string; venmoId?: string } = {
          name: newPersonName.trim(),
        };

        if (venmoId) {
          friendData.venmoId = venmoId;
        }

        await setDoc(userDocRef, {
          friends: arrayUnion(friendData)
        }, { merge: true });

        toast({
          title: 'Saved to friends',
          description: `${newPersonName.trim()} has been saved to your friends list.`,
        });
      } catch (error) {
        console.error('Error saving to friends:', error);
        toast({
          title: 'Error saving friend',
          description: 'Could not save to friends list.',
          variant: 'destructive',
        });
      }
    }

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
      id: `person-${Date.now()}`,
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
