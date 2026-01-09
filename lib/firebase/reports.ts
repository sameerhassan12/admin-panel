import { 
  collection, 
  getDocs, 
  doc, 
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from './config';
import { deleteProduct } from './products';
import { retryWithBackoff, getErrorMessage } from '../utils/retry';
import { toDate } from '../utils/date';

export interface Report {
  id: string;
  productId: string;
  reportedBy: string;
  reason: string;
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: Date;
}

export const getReports = async (): Promise<Report[]> => {
  if (!db) {
    throw new Error('Firebase not initialized. Please refresh the page.');
  }
  const firestore = db;
  try {
    let snapshot;
    try {
      snapshot = await retryWithBackoff(() => getDocs(
        query(collection(firestore, 'reports'), orderBy('createdAt', 'desc'))
      ));
    } catch (orderError: any) {
      // If orderBy fails, just get documents without ordering
      console.warn('Could not order reports by createdAt, fetching without order:', orderError);
      snapshot = await retryWithBackoff(() => getDocs(collection(firestore, 'reports')));
    }
    
    const reports = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: toDate(data.createdAt),
      } as Report;
    });
    
    // Sort manually if orderBy failed
    reports.sort((a, b) => {
      const dateA = a.createdAt.getTime();
      const dateB = b.createdAt.getTime();
      return dateB - dateA; // Descending
    });
    
    return reports;
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

export const getPendingReports = async (): Promise<Report[]> => {
  if (!db) {
    throw new Error('Firebase not initialized. Please refresh the page.');
  }
  const firestore = db;
  try {
    let snapshot;
    try {
      snapshot = await retryWithBackoff(() => getDocs(
        query(
          collection(firestore, 'reports'),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc')
        )
      ));
    } catch (orderError: any) {
      // If orderBy fails, just get pending reports without ordering
      console.warn('Could not order pending reports by createdAt, fetching without order:', orderError);
      snapshot = await retryWithBackoff(() => getDocs(
        query(collection(firestore, 'reports'), where('status', '==', 'pending'))
      ));
    }
    
    const reports = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: toDate(data.createdAt),
      } as Report;
    });
    
    // Sort manually if orderBy failed
    reports.sort((a, b) => {
      const dateA = a.createdAt.getTime();
      const dateB = b.createdAt.getTime();
      return dateB - dateA; // Descending
    });
    
    return reports;
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

export const resolveReport = async (reportId: string, action: 'delete' | 'dismiss'): Promise<void> => {
  if (!db) {
    throw new Error('Firebase not initialized. Please refresh the page.');
  }
  const firestore = db;
  try {
    const reportRef = doc(firestore, 'reports', reportId);
    const reportSnap = await retryWithBackoff(() => getDocs(query(collection(firestore, 'reports'), where('__name__', '==', reportId))));
    
    if (!reportSnap.empty) {
      const report = reportSnap.docs[0].data() as Report;
      
      if (action === 'delete') {
        await deleteProduct(report.productId);
      }
      
      await retryWithBackoff(() => updateDoc(reportRef, {
        status: action === 'delete' ? 'resolved' : 'dismissed',
        resolvedAt: new Date(),
      }));
    }
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
};

