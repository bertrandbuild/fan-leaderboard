export interface TopRankingItem {
  position: number
  team: string
  points: number
  change: string
}

// New interfaces for pool leaderboards
export interface PoolLiquidityItem {
  id: string
  name: string
  club: string
  totalLiquidity: number
  participants: number
  status: 'Active' | 'Ending Soon' | 'Finished'
  change: string
  endDate: string
  rewards: number
}

export interface PoolInternalRankingItem {
  position: number
  username: string
  avatar?: string
  points: number
  yaps: number
  change: string
  status: 'Active' | 'Inactive'
  userId: string
}

export interface PoolDetails {
  id: string
  name: string
  club: string
  totalLiquidity: number
  participants: number
  startDate: string
  endDate: string
  status: 'Active' | 'Ending Soon' | 'Finished'
  rewards: number
  description: string
}

export const topRanking: TopRankingItem[] = [
  { position: 1, team: "FC Barcelona", points: 2847, change: "+12" },
  { position: 2, team: "Paris Saint-Germain", points: 2756, change: "+8" },
  { position: 3, team: "Juventus", points: 2689, change: "+15" },
  { position: 4, team: "AC Milan", points: 2634, change: "+5" },
]

// New data for pool leaderboards
export const activePoolsLeaderboard: PoolLiquidityItem[] = [
  {
    id: "pool-psg-001",
    name: "PSG Champions Pool",
    club: "Paris Saint-Germain",
    totalLiquidity: 1250000,
    participants: 47,
    status: "Active",
    change: "+8",
    endDate: "2024-12-31",
    rewards: 50000
  },
  {
    id: "pool-bar-002",
    name: "Barcelona Fan Pool",
    club: "FC Barcelona",
    totalLiquidity: 980000,
    participants: 32,
    status: "Active",
    change: "+15",
    endDate: "2024-12-28",
    rewards: 40000
  },
  {
    id: "pool-juv-003",
    name: "Juventus Legend Pool",
    club: "Juventus",
    totalLiquidity: 750000,
    participants: 28,
    status: "Ending Soon",
    change: "+3",
    endDate: "2024-12-25",
    rewards: 35000
  },
  {
    id: "pool-mil-004",
    name: "AC Milan Heritage",
    club: "AC Milan",
    totalLiquidity: 650000,
    participants: 22,
    status: "Active",
    change: "+12",
    endDate: "2024-12-30",
    rewards: 30000
  }
]

// Sample internal ranking for a specific pool
export const poolInternalRanking: PoolInternalRankingItem[] = [
  {
    position: 1,
    username: "ParisLionel",
    avatar: "PL",
    points: 4250,
    yaps: 187,
    change: "+25",
    status: "Active",
    userId: "user-001"
  },
  {
    position: 2,
    username: "ChilizQueen",
    avatar: "CQ",
    points: 3890,
    yaps: 156,
    change: "+18",
    status: "Active",
    userId: "user-002"
  },
  {
    position: 3,
    username: "CryptoKing",
    avatar: "CK",
    points: 3560,
    yaps: 142,
    change: "+12",
    status: "Active",
    userId: "user-003"
  },
  {
    position: 4,
    username: "TokenStar",
    avatar: "TS",
    points: 3120,
    yaps: 128,
    change: "+8",
    status: "Active",
    userId: "user-004"
  },
  {
    position: 5,
    username: "Fanatic42",
    avatar: "F4",
    points: 2890,
    yaps: 115,
    change: "+5",
    status: "Active",
    userId: "user-005"
  },
  {
    position: 6,
    username: "GoalMaster",
    avatar: "GM",
    points: 2650,
    yaps: 98,
    change: "+3",
    status: "Active",
    userId: "user-006"
  },
  {
    position: 7,
    username: "Yapster",
    avatar: "YP",
    points: 2420,
    yaps: 87,
    change: "+2",
    status: "Active",
    userId: "user-007"
  },
  {
    position: 8,
    username: "PSGHero",
    avatar: "PH",
    points: 2180,
    yaps: 78,
    change: "+1",
    status: "Active",
    userId: "user-008"
  },
  {
    position: 9,
    username: "Juventino",
    avatar: "JU",
    points: 1950,
    yaps: 69,
    change: "+1",
    status: "Active",
    userId: "user-009"
  },
  {
    position: 10,
    username: "YapFan",
    avatar: "YF",
    points: 1720,
    yaps: 61,
    change: "0",
    status: "Active",
    userId: "user-010"
  }
]

// Selected pool details (this would be managed by state in a real app)
export const selectedPoolDetails: PoolDetails = {
  id: "pool-psg-001",
  name: "PSG Champions Pool",
  club: "Paris Saint-Germain",
  totalLiquidity: 1250000,
  participants: 47,
  startDate: "2024-12-01",
  endDate: "2024-12-31",
  status: "Active",
  rewards: 50000,
  description: "The ultimate PSG fan pool for the season champions"
}
