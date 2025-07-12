export interface MenuItem {
  id: string
  label: string
  icon: string
}

export const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "Home" },
  { id: "leaderboard", label: "Leaderboard", icon: "Trophy" },
  { id: "agents", label: "Agents", icon: "Users" },
  { id: "reseaux-sociaux", label: "Social Networks", icon: "Share2" },
  { id: "social-manager", label: "Social Manager", icon: "MessageSquare" },
  { id: "pull-management", label: "Pull Management", icon: "MessageSquare" },
  { id: "yaps-ai", label: "Yaps", icon: "Twitter" },
]

export const bottomMenuItem: MenuItem = { 
  id: "wallet-integration", 
  label: "Wallet Integration", 
  icon: "Wallet" 
} 