import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { getUserProfile, saveUserProfile } from "@/lib/storage";
import {
  fetchUserProfileFromFirestore,
  syncUserProfileToFirestore,
  buildProfileFromFirebaseUser,
} from "@/lib/user-service";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile;
  loading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getUserProfile());
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          // Attempt to fetch profile from Firestore
          const remoteProfile = await fetchUserProfileFromFirestore(user.uid);
          if (remoteProfile) {
            setUserProfile(remoteProfile);
            saveUserProfile(remoteProfile);
          } else {
            // First time login - construct and save
            const newProfile = buildProfileFromFirebaseUser(user, getUserProfile());
            await syncUserProfileToFirestore(newProfile);
            setUserProfile(newProfile);
          }
        } catch (e) {
          console.warn("Could not sync profile from Firestore, using local fallback", e);
          const fallback = buildProfileFromFirebaseUser(user, getUserProfile());
          setUserProfile(fallback);
        }
      } else {
        // Fallback to local profile
        setUserProfile(getUserProfile());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      let profile = await fetchUserProfileFromFirestore(user.uid).catch(() => null);
      if (!profile) {
        profile = buildProfileFromFirebaseUser(user, userProfile);
        await syncUserProfileToFirestore(profile);
      }
      setUserProfile(profile);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      console.error("Google sign in failed:", e);
      setAuthError(e.message || "Failed to sign in with Google.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const user = res.user;
      let profile = await fetchUserProfileFromFirestore(user.uid).catch(() => null);
      if (!profile) {
        profile = buildProfileFromFirebaseUser(user, userProfile);
        await syncUserProfileToFirestore(profile);
      }
      setUserProfile(profile);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      console.error("Email sign in failed:", e);
      let friendly = e.message || "Sign in failed";
      if (e.code === "auth/invalid-credential" || e.code === "auth/wrong-password") {
        friendly = "Invalid email or password. Please verify and try again.";
      } else if (e.code === "auth/user-not-found") {
        friendly = "No account found with this email. Try signing up instead.";
      } else if (e.code === "auth/operation-not-allowed") {
        friendly = "Email/password provider is not yet enabled in Firebase Console. Please click 'Sign in with Google' or '1-Click Quick Demo Sign-In'.";
      }
      setAuthError(friendly);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName: string) => {
    setAuthError(null);
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const user = res.user;
      if (displayName.trim()) {
        await updateFirebaseProfile(user, { displayName: displayName.trim() });
      }
      const newProfile = buildProfileFromFirebaseUser(user, {
        ...userProfile,
        display_name: displayName.trim() || email.split("@")[0],
        email: email.trim(),
      });
      await syncUserProfileToFirestore(newProfile);
      setUserProfile(newProfile);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      console.error("Email sign up failed:", e);
      let friendly = e.message || "Sign up failed";
      if (e.code === "auth/email-already-in-use") {
        friendly = "An account already exists with this email address. Try signing in.";
      } else if (e.code === "auth/weak-password") {
        friendly = "Password should be at least 6 characters long.";
      } else if (e.code === "auth/operation-not-allowed") {
        friendly = "Email/password provider is not yet enabled in Firebase Console. Please click 'Sign in with Google' or '1-Click Quick Demo Sign-In'.";
      }
      setAuthError(friendly);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      // Keep local profile accessible or reset
    } catch (err: unknown) {
      console.error("Sign out error:", err);
    }
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    const updated: UserProfile = {
      ...userProfile,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setUserProfile(updated);
    saveUserProfile(updated);
    if (firebaseUser) {
      try {
        await syncUserProfileToFirestore(updated);
      } catch (e) {
        console.warn("Could not sync updated profile to Firestore:", e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        loading,
        authError,
        clearAuthError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
