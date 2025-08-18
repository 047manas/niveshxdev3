"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

interface UserProfile {
  fullName: string;
  email: string;
  userType: 'Founder' | 'Investor';
  isVerified: boolean;
  createdAt: any;
  uid?: string; // Optional uid field
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userProfile: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);

        // Find user profile in Firestore by email
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const profileData = userDoc.data() as UserProfile;
          setUserProfile(profileData);

          // If the firestore doc doesn't have the uid, update it for future lookups.
          if (!profileData.uid) {
            const userDocRef = doc(firestore, 'users', userDoc.id);
            await updateDoc(userDocRef, { uid: user.uid });
          }
        } else {
          // This case can happen if a user is authenticated with Firebase but has no profile doc.
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
