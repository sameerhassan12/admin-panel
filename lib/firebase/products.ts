import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc, 
  deleteDoc,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { retryWithBackoff, getErrorMessage } from '../utils/retry';
import { toDate } from '../utils/date';

export interface Product {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  condition: string;
  price?: number;
  images: string[];
  location: string;
  city: string;
  state: string;
  biddingEnabled: boolean;
  bidExpiryDate?: Date;
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  createdAt: Date;
  updatedAt?: Date;
}

export const getProducts = async (status?: string): Promise<Product[]> => {
  if (!db) {
    throw new Error('Firebase not initialized. Please refresh the page.');
  }
  const firestore = db;
  try {
    let q;
    
    if (status) {
      q = query(
        collection(firestore, 'products'),
        where('status', '==', status)
      );
    } else {
      q = query(collection(firestore, 'products'));
    }
    
    // Try to order by createdAt, but if it fails (e.g., string dates), just get all
    let snapshot;
    try {
      const qWithOrder = query(q, orderBy('createdAt', 'desc'));
      snapshot = await retryWithBackoff(() => getDocs(qWithOrder));
    } catch (orderError: any) {
      // If orderBy fails, just get documents without ordering
      console.warn('Could not order by createdAt, fetching without order:', orderError);
      snapshot = await retryWithBackoff(() => getDocs(q));
    }
    
    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: toDate(data.createdAt),
        updatedAt: data.updatedAt ? toDate(data.updatedAt) : undefined,
        bidExpiryDate: data.bidExpiryDate ? toDate(data.bidExpiryDate) : undefined,
      } as Product;
    });
    
    // Sort manually if orderBy failed
    products.sort((a, b) => {
      const dateA = a.createdAt.getTime();
      const dateB = b.createdAt.getTime();
      return dateB - dateA; // Descending
    });
    
    return products;
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  if (!db) {
    throw new Error('Firebase not initialized. Please refresh the page.');
  }
  const firestore = db;
  try {
    const docRef = doc(firestore, 'products', productId);
    const docSnap = await retryWithBackoff(() => getDoc(docRef));
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: toDate(data.createdAt),
      updatedAt: data.updatedAt ? toDate(data.updatedAt) : undefined,
      bidExpiryDate: data.bidExpiryDate ? toDate(data.bidExpiryDate) : undefined,
    } as Product;
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

export const approveProduct = async (productId: string): Promise<void> => {
  if (!db) {
    throw new Error('Firebase not initialized. Please refresh the page.');
  }
  const firestore = db;
  try {
    await retryWithBackoff(() => updateDoc(doc(firestore, 'products', productId), {
      status: 'approved',
      updatedAt: Timestamp.now(),
    }));
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

export const rejectProduct = async (productId: string, reason?: string): Promise<void> => {
  if (!db) {
    throw new Error('Firebase not initialized. Please refresh the page.');
  }
  const firestore = db;
  try {
    await retryWithBackoff(() => updateDoc(doc(firestore, 'products', productId), {
      status: 'rejected',
      updatedAt: Timestamp.now(),
      rejectionReason: reason,
    }));
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteProduct = async (productId: string): Promise<void> => {
  if (!db) {
    throw new Error('Firebase not initialized. Please refresh the page.');
  }
  const firestore = db;
  try {
    await retryWithBackoff(() => deleteDoc(doc(firestore, 'products', productId)));
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

export const updateProductStatus = async (productId: string, status: 'pending' | 'approved' | 'rejected' | 'sold'): Promise<void> => {
  if (!db) {
    throw new Error('Firebase not initialized. Please refresh the page.');
  }
  const firestore = db;
  try {
    await retryWithBackoff(() => updateDoc(doc(firestore, 'products', productId), {
      status: status,
      updatedAt: Timestamp.now(),
    }));
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

export const getProductStats = async () => {
  const [all, pending, approved, rejected, sold] = await Promise.all([
    getProducts(),
    getProducts('pending'),
    getProducts('approved'),
    getProducts('rejected'),
    getProducts('sold'),
  ]);
  
  return {
    total: all.length,
    pending: pending.length,
    approved: approved.length,
    rejected: rejected.length,
    sold: sold.length,
  };
};


