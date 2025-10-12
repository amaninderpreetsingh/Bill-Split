import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Group } from '../types/group.types';

export function useGroupManager() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGroups([]);
      setLoading(false);
      return;
    }

    const groupsRef = collection(db, 'groups');
    const q = query(
      groupsRef,
      where('ownerId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const groupsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            description: data.description,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            ownerId: data.ownerId,
            memberIds: data.memberIds || [],
          } as Group;
        });
        setGroups(groupsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching groups:', error);
        setGroups([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const createGroup = async (name: string, description?: string) => {
    if (!user) {
      throw new Error('Must be logged in to create a group');
    }

    const now = Timestamp.now();
    const groupData = {
      name,
      description: description || '',
      createdAt: now,
      updatedAt: now,
      ownerId: user.uid,
      memberIds: [user.uid],
    };

    const docRef = await addDoc(collection(db, 'groups'), groupData);
    return docRef.id;
  };

  return {
    groups,
    loading,
    createGroup,
  };
}
