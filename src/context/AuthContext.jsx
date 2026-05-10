import { useEffect, useState } from 'react';
import { auth, db } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { AuthContext } from './auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const tokenResult = await currentUser.getIdTokenResult(true);
          setClaims(tokenResult.claims || null);
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          setProfile(userDoc.exists() ? userDoc.data() : null);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          setProfile(null);
          setClaims(null);
        }
      } else {
        setUser(null);
        setProfile(null);
        setClaims(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, claims, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
