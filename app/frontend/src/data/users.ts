import { allClubs } from "@/data/clubs"

const countries = [
  "France", "Spain", "Italy", "Germany", "England", "Portugal", "Brazil", "Argentina", "USA", "Japan", "South Korea", "Turkey", "Netherlands", "Belgium", "Switzerland"
]

const badgesList = [
  "VIP", "Top Contributor", "Early Adopter", "Content Creator", "MVP", "Rising Star", "Community Leader", "Fanatic", "Legend"
]

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0]
}

function pickRandom<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)]
}

export const allUsers = Array.from({ length: 3000 }, (_, i) => {
  const club = pickRandom(allClubs)
  const country = pickRandom(countries)
  const level = randomInt(1, 20)
  const points = randomInt(1000, 20000)
  const tokensAmount = randomInt(0, 5000)
  const joinDate = randomDate(new Date(2022, 0, 1), new Date())
  const username = `${club.shortName.replace(/\s/g, '')}Fan${randomInt(10, 9999)}`
  const rank = randomInt(1, 3000)
  const isVerified = Math.random() < 0.2
  const avatar = "/placeholder-user.jpg"
  const badges = Array.from(new Set(Array.from({length: randomInt(0, 3)}, () => pickRandom(badgesList))))
  return {
    id: `${club.id}-${i}`,
    username,
    clubId: club.id,
    clubName: club.name,
    rank,
    points,
    level,
    joinDate,
    country,
    avatar,
    tokens: {
      symbol: club.stats.fanTokens || club.shortName.slice(0,3).toUpperCase(),
      amount: tokensAmount
    },
    achievements: {
      totalActivity: randomInt(100, 5000),
      weeklyActivity: randomInt(10, 500),
      monthlyActivity: randomInt(30, 1500),
      streak: randomInt(0, 100)
    },
    socialMedia: {
      twitter: randomInt(0, 5000),
      telegram: randomInt(0, 3000),
      instagram: randomInt(0, 2000),
      discord: randomInt(0, 1000),
      youtube: randomInt(0, 1000),
      likes: randomInt(0, 10000),
      shares: randomInt(0, 3000),
      comments: randomInt(0, 5000)
    },
    isVerified,
    badges
  }
})

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