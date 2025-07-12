export interface User {
  id: string
  username: string
  clubId: string
  clubName: string
  rank: number
  tokens: {
    amount: number
    symbol: string
  }
  points: number
  level: number
  joinDate: string
  country: string
  avatar: string
  isVerified: boolean
  socialMedia: {
    twitter: number
    telegram: number
    instagram: number
    discord?: number
    youtube?: number
    likes: number
    shares: number
    comments: number
  }
  badges: string[]
  achievements: {
    totalActivity: number
    weeklyActivity: number
    monthlyActivity: number
    streak: number
  }
}

export const allUsers: User[] = [
  {
    id: "psg-1",
    username: "PSGFan2024",
    clubId: "psg",
    clubName: "Paris Saint-Germain",
    rank: 1,
    points: 15420,
    level: 12,
    joinDate: "2023-01-15",
    country: "France",
    avatar: "/placeholder-user.jpg",
    tokens: {
      symbol: "PSG",
      amount: 2500
    },
    achievements: {
      totalActivity: 1847,
      weeklyActivity: 156,
      monthlyActivity: 678,
      streak: 45
    },
    socialMedia: {
      twitter: 1250,
      telegram: 890,
      instagram: 567,
      likes: 2340,
      shares: 456,
      comments: 789
    },
    isVerified: true,
    badges: ["VIP", "Top Contributor"]
  },
  {
    id: "barcelona-1",
    username: "BarçaFan92",
    clubId: "fc-barcelona",
    clubName: "FC Barcelona",
    rank: 2,
    points: 14850,
    level: 11,
    joinDate: "2023-02-20",
    country: "Spain",
    avatar: "/placeholder-user.jpg",
    tokens: {
      symbol: "BAR",
      amount: 2200
    },
    achievements: {
      totalActivity: 1654,
      weeklyActivity: 142,
      monthlyActivity: 598,
      streak: 38
    },
    socialMedia: {
      twitter: 1180,
      telegram: 756,
      instagram: 489,
      likes: 2100,
      shares: 398,
      comments: 654
    },
    isVerified: true,
    badges: ["Early Adopter", "Content Creator"]
  }
];

export const getUsersByClub = (clubId: string): User[] => {
  return allUsers.filter(user => user.clubId === clubId);
};

export const getUsersByCountry = (country: string): User[] => {
  return allUsers.filter(user => user.country === country);
};

export const searchUsers = (query: string): User[] => {
  const lowerQuery = query.toLowerCase();
  return allUsers.filter(user => 
    user.username.toLowerCase().includes(lowerQuery) ||
    user.clubName.toLowerCase().includes(lowerQuery) ||
    user.country.toLowerCase().includes(lowerQuery)
  );
};

export const getUsersByActivity = (sortBy: 'total' | 'weekly' | 'monthly' = 'total'): User[] => {
  return [...allUsers].sort((a, b) => {
    switch (sortBy) {
      case 'weekly':
        return b.achievements.weeklyActivity - a.achievements.weeklyActivity;
      case 'monthly':
        return b.achievements.monthlyActivity - a.achievements.monthlyActivity;
      default:
        return b.achievements.totalActivity - a.achievements.totalActivity;
    }
  });
};

export const getTopUsersByTokens = (limit: number = 10): User[] => {
  return [...allUsers]
    .sort((a, b) => b.tokens.amount - a.tokens.amount)
    .slice(0, limit);
};

export const getTopUsersByPoints = (limit: number = 10): User[] => {
  return [...allUsers]
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
};