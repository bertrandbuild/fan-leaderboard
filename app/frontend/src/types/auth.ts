/**
 * User role enumeration
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

/**
 * User score data
 */
export interface UserScore {
  currentScore: number;
  weeklyChange: number;
  rank: number;
  totalUsers: number;
  level: string;
  nextLevelScore: number;
}

/**
 * User type definition with role
 */
export type User = {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  score?: UserScore;
} | null;

/**
 * Auth context type definition with role management
 */
export type AuthContextType = {
  user: User;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  isUser: () => boolean;
};

/**
 * Demo user accounts
 */
export const DEMO_ACCOUNTS = {
  admin: {
    username: 'admin',
    password: 'admin',
    userData: {
      id: '1',
      username: 'admin',
      email: 'admin@chiliz.com',
      role: UserRole.ADMIN,
      score: {
        currentScore: 15420,
        weeklyChange: 12,
        rank: 1,
        totalUsers: 2847,
        level: "Master",
        nextLevelScore: 20000
      }
    }
  },
  user: {
    username: 'user',
    password: 'user',
    userData: {
      id: '2',
      username: 'user',
      email: 'user@chiliz.com',
      role: UserRole.USER,
      score: {
        currentScore: 8956,
        weeklyChange: 8,
        rank: 156,
        totalUsers: 2847,
        level: "Expert",
        nextLevelScore: 10000
      }
    }
  }
} as const;

/**
 * Route access configuration
 */
export const ROUTE_ACCESS = {
  // Admin only routes
  admin: [
    'agents',
    'social-manager'
  ],
  // User accessible routes
  user: [
    'dashboard',
    'leaderboard',
    'yaps-ai',
    'wallet-integration',
    'reseaux-sociaux'
  ]
} as const; 