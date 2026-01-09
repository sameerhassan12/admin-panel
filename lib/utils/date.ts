import { Timestamp } from 'firebase/firestore';

/**
 * Safely convert Firestore date to JavaScript Date
 * Handles both Firestore Timestamp and string dates
 */
export function toDate(dateValue: any): Date {
  if (!dateValue) {
    return new Date();
  }
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // If it's a Firestore Timestamp
  if (dateValue && typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  
  // If it's a string (ISO format)
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    // Check if the date is valid
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  
  // Fallback to current date
  return new Date();
}




