import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with robust long-polling transport for proxy/container environments
const firestoreDatabaseId = (firebaseConfig as any).firestoreDatabaseId;
export const db = (() => {
  try {
    return initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true
      },
      firestoreDatabaseId && firestoreDatabaseId !== '(default)' ? firestoreDatabaseId : undefined
    );
  } catch {
    return firestoreDatabaseId && firestoreDatabaseId !== '(default)'
      ? getFirestore(app, firestoreDatabaseId)
      : getFirestore(app);
  }
})();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test at boot
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection verified successfully.');
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (
      errorMsg.includes('the client is offline') ||
      errorMsg.includes('unavailable') ||
      errorMsg.includes('permission-denied')
    ) {
      console.warn('Firebase connection notice: App operating in offline/resilient cache mode.', errorMsg);
    } else {
      console.warn('Firebase connection test notice:', errorMsg);
    }
  }
}

// Trigger initial connection test safely after runtime mounts
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testFirebaseConnection().catch(() => {});
  }, 1000);
}
