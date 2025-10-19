import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { GroupTransaction } from '@/types';

export function useGroupTransactions(groupId: string) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<GroupTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const transRef = collection(db, 'groupTransactions');
    const q = query(transRef, where('groupId', '==', groupId), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp).toDate(),
        } as GroupTransaction;
      });
      setTransactions(transData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching group transactions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId, user]);

  const createTransaction = useCallback(async (data: Omit<GroupTransaction, 'id' | 'createdAt' | 'createdBy' | 'groupId'>) => {
    if (!user || !groupId) throw new Error("User or group not specified.");

    const newTransactionData = {
      ...data,
      groupId,
      createdBy: user.uid,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'groupTransactions'), newTransactionData);
    return docRef.id;
  }, [user, groupId]);

  const updateTransaction = useCallback(async (transactionId: string, data: Partial<GroupTransaction>) => {
    const docRef = doc(db, 'groupTransactions', transactionId);
    await updateDoc(docRef, data);
  }, []);

  const deleteTransaction = useCallback(async (transactionId: string) => {
    const docRef = doc(db, 'groupTransactions', transactionId);
    await deleteDoc(docRef);
  }, []);

  return {
    transactions,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
