import { useState, useEffect, createContext } from 'react';
import { User, AuthContextType, UserRole, DEMO_ACCOUNTS } from '@/types/auth';

/**
 * Auth context
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth provider props
 */
export type AuthProviderProps = {
  children: React.ReactNode;
};

/**
 * Auth provider component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const userData = localStorage.getItem('userData');
      
      if (isAuthenticated && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          // If userData is invalid, clear auth
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userData');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
          try {
        // Try real backend API first
        const { loginUser } = await import('@/lib/authApi');
        const result = await loginUser({ id: username, password });
        
        if (result.success) {
          // Try to fetch user score data from backend
          let userData = result.user || { id: username, username, role: 'user' };
          
          try {
            const { fetchUser } = await import('@/lib/userApi');
            const userProfile = await fetchUser(userData.id);
            // Merge backend user data with auth data
            userData = { ...userData, ...userProfile };
          } catch (userError) {
            console.warn('Failed to fetch user profile data:', userError);
            // TODO: Backend endpoint `/api/users/:id` should return user score data
            // Keeping basic user data for now until backend provides score endpoints
          }
          
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userData', JSON.stringify(userData));
          setUser(userData);
          setIsLoading(false);
          return true;
        }
      } catch (error) {
        console.warn('Backend login failed, trying demo accounts:', error);
      
      // Fallback to demo accounts if backend fails
      const account = Object.values(DEMO_ACCOUNTS).find(
        acc => acc.username === username && acc.password === password
      );
      
      if (account) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userData', JSON.stringify(account.userData));
        setUser(account.userData);
        setIsLoading(false);
        return true;
      }
    }
    
    setIsLoading(false);
    return false;
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const isAdmin = (): boolean => {
    return hasRole(UserRole.ADMIN);
  };

  const isUser = (): boolean => {
    return hasRole(UserRole.USER);
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
    setUser(null);
    // Redirect to login page
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
    hasRole,
    isAdmin,
    isUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 