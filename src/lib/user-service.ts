import { doc, getDoc, setDoc } from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { UserProfile } from "@/types";
import { getUserProfile, saveUserProfile } from "./storage";

const ADMIN_EMAIL = "rishikeshsarangi122004@gmail.com";

export async function fetchUserProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, "users", userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data();
    return {
      id: userId,
      display_name: data.displayName || data.display_name || "Learner",
      email: data.email || "",
      photo_url: data.photoURL || data.photo_url || undefined,
      bio: data.bio || undefined,
      target_role: data.targetRole || data.target_role || undefined,
      weekly_goal_hours: data.weeklyGoalHours || data.weekly_goal_hours || 10,
      timezone: data.timezone || "UTC",
      onboarding_completed: data.onboardingCompleted ?? true,
      role: data.role || (data.email === ADMIN_EMAIL ? "admin" : "student"),
      preferences: data.preferences || {
        default_daily_minutes: data.dailyStudyMinutes || 45,
        preferred_languages: ["en"],
        learning_preferences: ["worked_examples", "active_recall", "visual_diagrams"],
      },
      created_at: data.createdAt,
      updated_at: data.updatedAt,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.READ, path);
  }
}

export async function syncUserProfileToFirestore(profile: UserProfile): Promise<void> {
  const path = `users/${profile.id}`;
  try {
    const docRef = doc(db, "users", profile.id);
    const now = new Date().toISOString();
    const payload = {
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      photoURL: profile.photo_url || null,
      bio: profile.bio || null,
      targetRole: profile.target_role || null,
      weeklyGoalHours: profile.weekly_goal_hours || 10,
      dailyStudyMinutes: profile.preferences.default_daily_minutes,
      timezone: profile.timezone,
      onboardingCompleted: profile.onboarding_completed,
      role: profile.role || (profile.email === ADMIN_EMAIL ? "admin" : "student"),
      preferences: profile.preferences,
      updatedAt: now,
      createdAt: profile.created_at || now,
    };

    await setDoc(docRef, payload, { merge: true });
    // Also sync local storage for fast local access
    saveUserProfile(profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function buildProfileFromFirebaseUser(
  firebaseUser: FirebaseUser,
  existingLocal?: UserProfile
): UserProfile {
  const fallback = existingLocal || getUserProfile();
  const isAdmin = firebaseUser.email === ADMIN_EMAIL;
  return {
    id: firebaseUser.uid,
    display_name: firebaseUser.displayName || fallback.display_name || "Learner",
    email: firebaseUser.email || fallback.email,
    photo_url: firebaseUser.photoURL || undefined,
    bio: fallback.bio || "Lifelong learner mastering new technical domains.",
    target_role: fallback.target_role || "Cloud Solutions Architect",
    weekly_goal_hours: fallback.weekly_goal_hours || 8,
    timezone: fallback.timezone || "UTC",
    onboarding_completed: true,
    role: isAdmin ? "admin" : "student",
    preferences: fallback.preferences || {
      default_daily_minutes: 45,
      preferred_languages: ["en"],
      learning_preferences: ["worked_examples", "active_recall", "visual_diagrams"],
    },
    created_at: fallback.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
