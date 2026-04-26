import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export function useBookmarks() {
  const [user] = useAuthState(auth);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) {
        setBookmarkedIds([]);
        return;
      }
      try {
        const q = query(collection(db, 'bookmarks'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        setBookmarkedIds(snapshot.docs.map(doc => doc.data().businessId));
      } catch (error) {
        console.error('Failed to fetch bookmarks', error);
      }
    };
    fetchBookmarks();
  }, [user]);

  const toggleBookmark = async (businessId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const isBookmarked = bookmarkedIds.includes(businessId);
      
      if (isBookmarked) {
        const q = query(
          collection(db, 'bookmarks'), 
          where('userId', '==', user.uid), 
          where('businessId', '==', businessId)
        );
        const snapshot = await getDocs(q);
        for (const docSnap of snapshot.docs) {
          await deleteDoc(doc(db, 'bookmarks', docSnap.id));
        }
        setBookmarkedIds(prev => prev.filter(id => id !== businessId));
      } else {
        await addDoc(collection(db, 'bookmarks'), {
          userId: user.uid,
          businessId,
          createdAt: serverTimestamp()
        });
        setBookmarkedIds(prev => [...prev, businessId]);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'bookmarks');
    } finally {
      setLoading(false);
    }
  };

  return { bookmarkedIds, toggleBookmark, loading };
}
