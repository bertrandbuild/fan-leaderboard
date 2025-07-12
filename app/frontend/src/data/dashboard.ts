export interface TopRankingItem {
  position: number
  team: string
  points: number
  change: string
}

export interface DashboardStats {
  activeAgents: {
    value: number
    change: string
    trend: 'up' | 'down'
  }
  connectedUsers: {
    value: number
    change: string
    trend: 'up' | 'down'
  }
  telegramMessages: {
    value: number
    change: string
    trend: 'up' | 'down'
  }
  connectedWallets: {
    value: number
    change: string
    trend: 'up' | 'down'
  }
}

export const topRanking: TopRankingItem[] = [
  { position: 1, team: "FC Barcelona", points: 2847, change: "+12" },
  { position: 2, team: "Paris Saint-Germain", points: 2756, change: "+8" },
  { position: 3, team: "Juventus", points: 2689, change: "+15" },
  { position: 4, team: "AC Milan", points: 2634, change: "+5" },
]

export const dashboardStats: DashboardStats = {
  activeAgents: {
    value: 12,
    change: "+2 since last month",
    trend: 'up'
  },
  connectedUsers: {
    value: 1247,
    change: "+15% since last month",
    trend: 'up'
  },
  telegramMessages: {
    value: 8432,
    change: "+23% since last month",
    trend: 'up'
  },
  connectedWallets: {
    value: 892,
    change: "+8% since last month",
    trend: 'up'
  }
} 