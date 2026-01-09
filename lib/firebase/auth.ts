import { 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from './config';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './config';
import { retryWithBackoff, getErrorMessage } from '../utils/retry';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export const login = async (email: string, password: string): Promise<AdminUser> => {
  if (!auth || !db) {
    throw new Error('Firebase not initialized. Please refresh the page.');
  }
  
  try {
    const userCredential = await retryWithBackoff(
      () => signInWithEmailAndPassword(auth!, email, password)
    );
    const user = userCredential.user;
    
    // Check if user is admin
    const userDoc = await retryWithBackoff(
      () => getDoc(doc(db!, 'users', user.uid))
    );
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    if (!userData.isAdmin) {
      await signOut(auth!);
      throw new Error('Access denied. Admin privileges required.');
    }
    
    return {
      id: user.uid,
      email: user.email || '',
      name: userData.name || '',
      isAdmin: true,
    };
  } catch (error: any) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }
};

export const logout = async (): Promise<void> => {
  if (!auth) {
    throw new Error('Firebase not initialized. Please refresh the page.');
  }
  await signOut(auth);
};

export const getCurrentUser = (): User | null => {
  if (!auth) {
    return null;
  }
  return auth.currentUser;
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    // Return a no-op unsubscribe function if auth is not initialized
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};


