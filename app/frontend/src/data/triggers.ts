export interface TriggerType {
  name: string
  disabled: boolean
}

export interface TriggerStatus {
  triggerEnabled: boolean
  botRunning: boolean
  isFullyActive: boolean
}

export interface VerificationStep {
  step: number
  title: string
  description: string
  status: 'completed' | 'current' | 'pending'
  icon: string
}

export interface FanToken {
  team: string
  symbol: string
  amount: string
  minimum: string
  status: 'verified' | 'unverified'
  colors: {
    primary: string
    secondary: string
  }
}

export const availableTriggers: TriggerType[] = [
  { name: 'Telegram', disabled: false },
  { name: 'Schedule', disabled: false },
]

export const verificationSteps: VerificationStep[] = [
  {
    step: 1,
    title: "Wallet Connection",
    description: "Wallet connected successfully",
    status: "completed",
    icon: "CheckCircle",
  },
  {
    step: 2,
    title: "Fan Tokens Verification",
    description: "Tokens detected and verified",
    status: "completed",
    icon: "CheckCircle",
  },
  {
    step: 3,
    title: "Link Generation",
    description: "Creating Telegram access link",
    status: "current",
    icon: "Clock",
  },
  {
    step: 4,
    title: "Telegram Access",
    description: "Join Telegram group",
    status: "pending",
    icon: "Clock",
  },
]

export const fanTokens: FanToken[] = [
  {
    team: "FC Barcelona",
    symbol: "BAR",
    amount: "156.34",
    minimum: "100",
    status: "verified",
    colors: { primary: "#A50044", secondary: "#004D98" },
  },
  {
    team: "Paris Saint-Germain",
    symbol: "PSG",
    amount: "89.67",
    minimum: "50",
    status: "verified",
    colors: { primary: "#004170", secondary: "#DA020E" },
  },
  {
    team: "Juventus",
    symbol: "JUV",
    amount: "234.12",
    minimum: "75",
    status: "verified",
    colors: { primary: "#000000", secondary: "#FFFFFF" },
  },
]

export const walletTriggers = [
  {
    id: 1,
    name: "MetaMask Connection",
    description: "Automatic detection of MetaMask wallet connection",
    type: "wallet",
    status: "active",
    conditions: {
      walletType: "MetaMask",
      networkId: 88882,
      minBalance: 0
    },
    actions: [
      {
        type: "notification",
        message: "MetaMask wallet connected successfully"
      },
      {
        type: "verification",
        message: "Fan tokens verification in progress"
      }
    ],
    lastTriggered: "2024-01-15T10:30:00Z",
    triggerCount: 156
  },
  {
    id: 2,
    name: "Fan Token Detection",
    description: "Automatic detection of fan tokens in wallet",
    type: "token",
    status: "active",
    conditions: {
      tokenTypes: ["PSG", "BAR", "JUV", "ACM"],
      minAmount: 100
    },
    actions: [
      {
        type: "telegram_access",
        title: "Wallet Connection",
        description: "Wallet connected successfully",
        icon: "Wallet",
        completed: true
      },
      {
        type: "telegram_access",
        title: "Token Verification",
        description: "Fan tokens detected and verified",
        icon: "Shield",
        completed: true
      },
      {
        type: "telegram_access",
        title: "Link Generation",
        description: "Creating Telegram access link",
        icon: "Link",
        completed: false
      },
      {
        type: "telegram_access",
        title: "Telegram Access",
        description: "Join Telegram group",
        icon: "Users",
        completed: false
      }
    ],
    lastTriggered: "2024-01-15T11:45:00Z",
    triggerCount: 89
  },
  {
    id: 3,
    name: "Telegram Link Generation",
    description: "Automatic generation of exclusive Telegram access links",
    type: "integration",
    status: "active",
    conditions: {
      hasValidTokens: true,
      walletConnected: true,
      minimumHoldingPeriod: "7d"
    },
    actions: [
      {
        type: "link_generation",
        message: "Exclusive access link generated"
      },
      {
        type: "notification",
        message: "Link sent via email and in-app notification"
      }
    ],
    lastTriggered: "2024-01-15T12:15:00Z",
    triggerCount: 67
  }
] 