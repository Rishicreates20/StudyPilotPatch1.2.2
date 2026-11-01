import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDocFromServer,
  Firestore,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
export const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Initialize Firestore with configured databaseId
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Verify database connection at startup
if (typeof window !== "undefined") {
  getDocFromServer(doc(db, "test", "connection"))
    .then(() => {
      // Connection successful
    })
    .catch((err: unknown) => {
      if (err instanceof Error && err.message.includes("the client is offline")) {
        console.error("Please check your Firebase configuration.");
      }
    });
}

// Structured error handling for Firestore
export enum OperationType {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
}

export interface FirestoreErrorInfo {
  error: string;
  operation: OperationType;
  path: string;
  authInfo: {
    userId?: string;
    email?: string;
    isAuthenticated: boolean;
  };
}

export function handleFirestoreError(
  error: unknown,
  operation: OperationType,
  path: string
): never {
  const err = error as { code?: string; message?: string };
  const currentUser = auth.currentUser;
  const errorInfo: FirestoreErrorInfo = {
    error: err?.message || String(error),
    operation,
    path,
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email || undefined,
      isAuthenticated: !!currentUser,
    },
  };
  throw new Error(JSON.stringify(errorInfo));
}
