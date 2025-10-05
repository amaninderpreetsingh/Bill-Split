import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from './useUserProfile';
import { Person } from '@/types';
import { useToast } from './use-toast';

export function usePeopleManager() {
  const [people, setPeople] = useState<Person[]>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonVenmoId, setNewPersonVenmoId] = useState('');
  const [useNameAsVenmoId, setUseNameAsVenmoId] = useState(false);
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

  const addPerson = () => {
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
    setNewPersonName('');
    setNewPersonVenmoId('');
    setUseNameAsVenmoId(false);
  };

  const removePerson = (personId: string) => {
    setPeople(people.filter(p => p.id !== personId));
  };

  return {
    people,
    newPersonName,
    newPersonVenmoId,
    useNameAsVenmoId,
    setNewPersonName,
    setNewPersonVenmoId,
    setUseNameAsVenmoId,
    addPerson,
    removePerson,
    setPeople,
  };
}
