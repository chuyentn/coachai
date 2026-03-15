import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Profile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid, firebaseUser);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, firebaseUser: User) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as Profile);
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');

        const newProfile: Profile = {
          id: userId,
          email: firebaseUser.email || '',
          full_name: firebaseUser.displayName || 'Học viên mới',
          avatar_url: firebaseUser.photoURL || null,
          role: 'student',
          referred_by: refCode || null,
          created_at: new Date().toISOString(),
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => firebaseSignOut(auth);

  return { user, profile, loading, signOut };
}
