/**
 * Retry utility for Firebase operations with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a network/connection error
      const isNetworkError = isConnectionError(error);
      
      // If it's not a network error or we've exhausted retries, throw immediately
      if (!isNetworkError || attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}

/**
 * Check if error is a connection/network error
 */
export function isConnectionError(error: any): boolean {
  if (!error) return false;
  
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  
  return (
    error?.code === 'unavailable' ||
    error?.code === 'deadline-exceeded' ||
    error?.code === 'cancelled' ||
    error?.code === 'network-request-failed' ||
    error?.message?.toLowerCase().includes('network') ||
    error?.message?.toLowerCase().includes('connection') ||
    error?.message?.toLowerCase().includes('failed to fetch') ||
    error?.message?.toLowerCase().includes('internet') ||
    error?.message?.toLowerCase().includes('timeout') ||
    (!isOnline)
  );
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  if (isConnectionError(error)) {
    return 'Connection failed. If the problem persists, please check your internet connection or VPN';
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

