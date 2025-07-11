import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

/**
 * Custom hook to use auth context
 * 
 * @returns The auth context value
 * @throws Error if used outside of AuthProvider
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}; 