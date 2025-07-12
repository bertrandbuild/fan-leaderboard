import { Wallet, Shield, Zap, Users } from "lucide-react"

export interface IntegrationStep {
  id: number
  title: string
  description: string
  icon: any
  color: string
}

export interface FanTokenData {
  id: string
  name: string
  symbol: string
  balance: number
  logo: string
  verified: boolean
  contractAddress: string
  minimumRequired: number
}

export interface TelegramGroup {
  id: string
  name: string
  tokenSymbol: string
  requiredTokens: number
  description: string
}

export const integrationSteps: IntegrationStep[] = [
  {
    id: 1,
    title: "Wallet Connection",
    description: "Connect your Web3 wallet",
    icon: Wallet,
    color: "text-green-400"
  },
  {
    id: 2,
    title: "Network Verification",
    description: "Switch to Chiliz Chain",
    icon: Shield,
    color: "text-blue-400"
  },
  {
    id: 3,
    title: "Fan Tokens Detection",
    description: "Scan for fan tokens",
    icon: Zap,
    color: "text-orange-400"
  },
  {
    id: 4,
    title: "Telegram Access",
    description: "Generate access links",
    icon: Users,
    color: "text-cyan-400"
  }
]

// Mock fan tokens data (in real app, you'd fetch from contracts)
export const mockFanTokens: FanTokenData[] = [
  {
    id: 'psg',
    name: 'Paris Saint-Germain',
    symbol: 'PSG',
    balance: 1250,
    logo: '🔴🔵',
    verified: true,
    contractAddress: '0xc2661815c69c2b3924d3dd0c2c1358a1e38a3105',
    minimumRequired: 1000
  },
]

export const telegramGroups: TelegramGroup[] = [
  {
    id: 'psg-official',
    name: 'PSG Official',
    tokenSymbol: 'PSG',
    requiredTokens: 1000,
    description: 'Exclusive group for PSG token holders with 1000+ tokens'
  },
]

// Helper function to get accessible groups based on fan tokens
export const getAccessibleGroups = (fanTokens: FanTokenData[]) => {
  return telegramGroups
    .filter(group => {
      const token = fanTokens.find(t => t.symbol === group.tokenSymbol)
      return token && token.balance >= group.requiredTokens
    })
    .map(group => {
      const token = fanTokens.find(t => t.symbol === group.tokenSymbol)!
      return {
        ...group,
        userTokens: token.balance,
        canAccess: true
      }
    })
}

// Helper function to calculate integration progress
export const calculateIntegrationProgress = (
  isConnected: boolean,
  isOnChilizChain: boolean,
  isLoadingTokens: boolean
) => {
  if (!isConnected) return 0
  if (!isOnChilizChain) return 1
  if (isLoadingTokens) return 2
  return 4
} 