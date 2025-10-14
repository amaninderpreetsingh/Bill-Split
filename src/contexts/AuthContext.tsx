import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { User, signInWithPopup, signInWithCredential, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, googleProvider } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

interface AuthContextType {
  user: User | null | undefined;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const { toast } = useToast();

  const signInWithGoogle = async () => {
    try {
      const isNative = Capacitor.isNativePlatform();
      console.log('[Auth] Sign in started, isNative:', isNative);

      if (isNative) {
        // Use native Capacitor plugin for mobile apps
        console.log('[Auth] Calling FirebaseAuthentication.signInWithGoogle()');
        const result = await FirebaseAuthentication.signInWithGoogle();
        console.log('[Auth] Native sign-in result:', JSON.stringify(result, null, 2));

        if (!result.credential?.idToken) {
          throw new Error('No ID token received from Google Sign-In');
        }

        // Create Firebase credential from the result
        console.log('[Auth] Creating Google credential');
        const credential = GoogleAuthProvider.credential(result.credential.idToken);

        // Sign in to Firebase with the credential
        console.log('[Auth] Signing in to Firebase with credential');
        await signInWithCredential(auth, credential);

        console.log('[Auth] Sign in successful!');
        toast({
          title: 'Welcome!',
          description: 'Successfully signed in with Google.',
        });
      } else {
        // Use popup for web
        console.log('[Auth] Using popup sign-in for web');
        await signInWithPopup(auth, googleProvider);
        toast({
          title: 'Welcome!',
          description: 'Successfully signed in with Google.',
        });
      }
    } catch (error: any) {
      console.error('[Auth] Error signing in with Google:', {
        message: error.message,
        code: error.code,
        fullError: error
      });

      // Handle user cancellation gracefully
      if (error.code === 'auth/cancelled-popup-request' ||
          error.code === 'auth/popup-closed-by-user' ||
          error.message?.includes('cancel')) {
        console.log('[Auth] User cancelled sign-in');
        return; // Don't show error toast for cancellation
      }

      toast({
        title: 'Sign in failed',
        description: error.message || 'Could not sign in with Google. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: 'Sign out failed',
        description: error.message || 'Could not sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
