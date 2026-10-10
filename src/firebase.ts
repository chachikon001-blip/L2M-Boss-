import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';

export const firebaseConfig = {
  projectId: "gen-lang-client-0043123043",
  appId: "1:722602723150:web:ef7cdb5f6b7a8eaddb801f",
  apiKey: "AIzaSyBcutic2uZUR3cxVn4reM6u3SjpsE0mPdY",
  authDomain: "gen-lang-client-0043123043.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-guildbosstracker-759c678f-0832-407c-926d-53513fee2259",
  storageBucket: "gen-lang-client-0043123043.firebasestorage.app",
  messagingSenderId: "722602723150",
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if configured
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

let authReadyPromise: Promise<User | null> | null = null;

export function ensureAuthReady(): Promise<User | null> {
  if (authReadyPromise) return authReadyPromise;

  authReadyPromise = new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          unsubscribe();
          resolve(cred.user);
        } catch (err) {
          console.warn('Anonymous auth note:', err);
          unsubscribe();
          resolve(null);
        }
      }
    });
  });

  return authReadyPromise;
}

// Test connectivity on initial boot as required by Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await ensureAuthReady();
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn('Firebase connection test: client is offline');
      return false;
    }
    return true;
  }
}
