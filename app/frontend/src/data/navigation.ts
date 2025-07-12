export interface MenuItem {
  id: string
  label: string
  icon: string
}

export const menuItems: MenuItem[] = [
  { id: "leaderboard", label: "Leaderboard", icon: "Trophy" },
  { id: "campaigns", label: "Campaigns", icon: "Target" },
  { id: "agents", label: "Agents", icon: "Users" },
  { id: "reseaux-sociaux", label: "Social Networks", icon: "Share2" },
  { id: "pool-management", label: "Campaign Manager", icon: "MessageSquare" },
  { id: "yaps-ai", label: "Yaps", icon: "Twitter" },
]

export const bottomMenuItem: MenuItem = { 
  id: "wallet-integration", 
  label: "Wallet Integration", 
  icon: "Wallet" 
} 