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
    name: "Twitter",
    icon: "Twitter",
    followers: "12,547",
    engagement: "3.2%",
    status: "connected",
    color: "text-blue-400",
  },
  {
    name: "Telegram",
    icon: "MessageSquare",
    followers: "8,234",
    engagement: "5.7%",
    status: "connected",
    color: "text-blue-400",
  },
  {
    name: "YouTube",
    icon: "Youtube",
    followers: "4,821",
    engagement: "2.1%",
    status: "disconnected",
    color: "text-red-400",
  },
  {
    name: "Instagram",
    icon: "Instagram",
    followers: "15,392",
    engagement: "4.3%",
    status: "disconnected",
    color: "text-red-400",
  },
  {
    name: "Discord",
    icon: "MessageSquare",
    followers: "2,156",
    engagement: "6.8%",
    status: "disconnected",
    color: "text-red-400",
  },
  {
    name: "TikTok",
    icon: "Youtube",
    followers: "0",
    engagement: "0",
    status: "disconnected",
    color: "text-gray-400",
  },
]

export const connectedAccounts: ConnectedAccount[] = [
  {
    platform: "Twitter",
    username: "@ChilizOfficial",
    icon: "Twitter",
    color: "text-blue-400",
  },
  {
    platform: "Telegram",
    username: "@chiliz_official",
    icon: "MessageSquare",
    color: "text-blue-400",
  },
  {
    platform: "YouTube",
    username: "Not connected",
    icon: "Youtube",
    color: "text-red-400",
  },
  {
    platform: "Instagram",
    username: "Not connected",
    icon: "Instagram",
    color: "text-red-400",
  },
  {
    platform: "Discord",
    username: "Not connected",
    icon: "MessageSquare",
    color: "text-red-400",
  },
  {
    platform: "TikTok",
    username: "Not connected",
    icon: "Youtube",
    color: "text-red-400",
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