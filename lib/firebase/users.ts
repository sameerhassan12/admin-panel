import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from './config';
import { retryWithBackoff, getErrorMessage } from '../utils/retry';
import { toDate } from '../utils/date';

export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  state?: string;
  city?: string;
  profilePictureUrl?: string;
  isProfileComplete: boolean;
  isAdmin: boolean;
  bidCredits: number;
  createdAt: Date;
}

export const getUsers = async (): Promise<User[]> => {
  try {
    let snapshot;
    try {
      snapshot = await retryWithBackoff(() => getDocs(
        query(collection(db, 'users'), orderBy('createdAt', 'desc'))
      ));
    } catch (orderError: any) {
      // If orderBy fails, just get documents without ordering
      console.warn('Could not order users by createdAt, fetching without order:', orderError);
      snapshot = await retryWithBackoff(() => getDocs(collection(db, 'users')));
    }
    
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: toDate(data.createdAt),
        isAdmin: data.isAdmin || false,
        bidCredits: data.bidCredits || 6,
      } as User;
    });
    
    // Sort manually if orderBy failed
    users.sort((a, b) => {
      const dateA = a.createdAt.getTime();
      const dateB = b.createdAt.getTime();
      return dateB - dateA; // Descending
    });
    
    return users;
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

export const banUser = async (userId: string): Promise<void> => {
  try {
    await retryWithBackoff(() => updateDoc(doc(db, 'users', userId), {
      isBanned: true,
      bannedAt: new Date(),
    }));
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

export const unbanUser = async (userId: string): Promise<void> => {
  try {
    await retryWithBackoff(() => updateDoc(doc(db, 'users', userId), {
      isBanned: false,
      bannedAt: null,
    }));
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

export const makeAdmin = async (userId: string): Promise<void> => {
  try {
    await retryWithBackoff(() => updateDoc(doc(db, 'users', userId), {
      isAdmin: true,
    }));
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

export const removeAdmin = async (userId: string): Promise<void> => {
  try {
    await retryWithBackoff(() => updateDoc(doc(db, 'users', userId), {
      isAdmin: false,
    }));
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

export const getUserStats = async () => {
  const users = await getUsers();
  const admins = users.filter(u => u.isAdmin);
  const banned = users.filter(u => (u as any).isBanned);
  
  return {
    total: users.length,
    admins: admins.length,
    banned: banned.length,
    regular: users.length - admins.length - banned.length,
  };
};


