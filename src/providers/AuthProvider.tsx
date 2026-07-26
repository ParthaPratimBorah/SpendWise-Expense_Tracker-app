import React, { useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { isFirebaseEnabled, auth } from '../lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import type { UserProfile } from '../types';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  useEffect(() => {
    if (isFirebaseEnabled && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || undefined,
            displayName: firebaseUser.displayName || firebaseUser.phoneNumber || 'Phone User',
            photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${firebaseUser.uid}`,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      console.warn("Firebase configuration is missing. Authentication behaves in pending configuration state.");
      setUser(null);
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    if (!isFirebaseEnabled || !auth) {
      throw new Error('Firebase Authentication is not configured or enabled. Please run Firebase setup first or check your API keys.');
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google Sign In Error:', err);
      throw err;
    }
  };

  const sendOtp = async (phoneNumber: string, containerId: string) => {
    if (!isFirebaseEnabled || !auth) {
      throw new Error('Firebase Authentication is not configured or enabled. Please run Firebase setup first or check your API keys.');
    }
    try {
      // Enforce that recaptcha is initialized freshly or updated
      const verifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          // Recaptcha resolved
        }
      });
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(confirmation);
      return confirmation;
    } catch (err) {
      console.error('Error sending OTP:', err);
      throw err;
    }
  };

  const confirmOtp = async (otp: string) => {
    if (!confirmationResult) {
      throw new Error('No verification code request was found. Please request a code first.');
    }
    try {
      await confirmationResult.confirm(otp);
    } catch (err) {
      console.error('Error confirming OTP:', err);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (!isFirebaseEnabled || !auth) {
      throw new Error('Firebase Authentication is not configured or enabled. Please run Firebase setup first or check your API keys.');
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('Email Sign In Error:', err);
      throw err;
    }
  };

  const registerWithEmail = async (email: string, password: string, displayName: string) => {
    if (!isFirebaseEnabled || !auth) {
      throw new Error('Firebase Authentication is not configured or enabled. Please run Firebase setup first or check your API keys.');
    }
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (credential.user) {
        await updateProfile(credential.user, {
          displayName,
          photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${displayName}`
        });
        setUser({
          uid: credential.user.uid,
          email: credential.user.email || undefined,
          displayName: displayName || 'User',
          photoURL: credential.user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${displayName}`,
        });
      }
    } catch (err: any) {
      console.error('Email Sign Up Error:', err);
      throw err;
    }
  };

  const handleLogout = async () => {
    if (isFirebaseEnabled && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Google/Phone Sign Out Error:', err);
        throw err;
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        logout: handleLogout,
        sendOtp,
        confirmOtp,
        loginWithEmail,
        registerWithEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
