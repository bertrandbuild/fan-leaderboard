/**
 * User role enumeration
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  CLUB_ADMIN = 'club_admin'
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
 * User type definition with role and EVM address
 */
export type User = {
  id: string;
  username: string;
  email?: string;
  evm_address: string;
  role: UserRole;
  score?: UserScore;
} | null;

/**
 * Auth context type definition with role management
 */
export type AuthContextType = {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  isUser: () => boolean;
};

/**
 * Demo user accounts with EVM addresses for backend integration
 */
export const DEMO_ACCOUNTS = {
  admin: {
    username: 'admin',
    password: 'admin',
    userData: {
      id: 'admin-1',
      username: 'admin',
      email: 'admin@chiliz.com',
      evm_address: '0x1234567890123456789012345678901234567890',
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
      id: 'user-1',
      username: 'user',
      email: 'user@chiliz.com',
      evm_address: '0x2234567890123456789012345678901234567890',
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
  },
  club_admin: {
    username: 'club_admin',
    password: 'club_admin',
    userData: {
      id: '3',
      username: 'club_admin',
      email: 'club_admin@chiliz.com',
      evm_address: '0x3234567890123456789012345678901234567890',
      role: UserRole.CLUB_ADMIN,
      score: {
        currentScore: 12000,
        weeklyChange: 15,
        rank: 45,
        totalUsers: 2847,
        level: "Expert",
        nextLevelScore: 15000
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
    'leaderboard',
    'yaps-ai',
    'wallet-integration',
    'reseaux-sociaux'
  ]
} as const; 