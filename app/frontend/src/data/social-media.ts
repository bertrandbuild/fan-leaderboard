export interface SocialPlatform {
  name: string
  icon: string
  followers: string
  engagement: string
  status: 'connected' | 'disconnected'
  color: string
}

export interface ConnectedAccount {
  platform: string
  username: string
  icon: string
  color: string
}

export interface CrossPlatformAction {
  title: string
  description: string
  status: 'active' | 'inactive'
}

export const socialPlatforms: SocialPlatform[] = [
  {
    name: "TikTok",
    icon: "Tiktok",
    followers: "0",
    engagement: "0",
    status: "disconnected",
    color: "text-gray-400",
  },
]

export const crossPlatformActions: CrossPlatformAction[] = [
  {
    title: "Nouveau classement",
    description: "Post Twitter + Message Telegram",
    status: "active",
  },
  {
    title: "Match finished",
    description: "Result tweet + Telegram notification",
    status: "active",
  },
  {
    title: "Fan token purchased",
    description: "Private Telegram message",
    status: "active",
  },
]

// API Configuration interfaces and data
export interface RecentActivity {
  type: string
  description: string
  time: string
  engagement: string
  icon: string
  color: string
}

export interface APIConfiguration {
  twitter: {
    username: string
  }
  telegram: {
    channelId: string
  }
  instagram: {
    username: string
  }
  youtube: {
    channelUrl: string
  }
  tiktok: {
    username: string
  }
  discord: {
    serverId: string
  }
}

export const recentActivity: RecentActivity[] = [
  {
    type: "Tweet published",
    description: "🏆 New ranking available!",
    time: "5 min",
    engagement: "127 likes",
    icon: "Twitter",
    color: "text-blue-400",
  },
  {
    type: "Message sent",
    description: "Welcome to new members!",
    time: "12 min",
    engagement: "45 reactions",
    icon: "MessageSquare",
    color: "text-blue-400",
  },
  {
    type: "Automatic reply",
    description: "Thank you for your support!",
    time: "1h",
    engagement: "23 likes",
    icon: "Twitter",
    color: "text-blue-400",
  },
]

export const defaultAPIConfiguration: APIConfiguration = {
  twitter: {
    username: "@ChilizOfficial"
  },
  telegram: {
    channelId: "@chiliz_official"
  },
  instagram: {
    username: "@chilizofficial"
  },
  youtube: {
    channelUrl: "https://youtube.com/@ChilizOfficial"
  },
  tiktok: {
    username: "@chilizofficial"
  },
  discord: {
    serverId: "123456789012345678"
  }
} 