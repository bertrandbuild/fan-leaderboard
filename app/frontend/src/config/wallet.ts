import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { chiliz, mainnet, polygon } from 'wagmi/chains'
import { walletConnect, injected, metaMask } from 'wagmi/connectors'

// Get projectId from https://cloud.reown.com
export const projectId = process.env.VITE_WALLETCONNECT_PROJECT_ID || '0123456789abcdef0123456789abcdef'

// Define Chiliz Chain
export const chilizChain = {
  ...chiliz,
  name: 'Chiliz Chain',
  id: 88888,
  network: 'chiliz',
  nativeCurrency: {
    decimals: 18,
    name: 'Chiliz',
    symbol: 'CHZ',
  },
  rpcUrls: {
    public: { http: ['https://rpc.ankr.com/chiliz'] },
    default: { http: ['https://rpc.ankr.com/chiliz'] },
  },
  blockExplorers: {
    default: { name: 'ChilizScan', url: 'https://scan.chiliz.com' },
  },
} as const

// Create wagmiConfig
const metadata = {
  name: 'Chiliz Fan Leaderboard',
  description: 'Chiliz Fan Token Management Platform',
  url: 'https://chiliz-admin.app',
  icons: ['https://chiliz-admin.app/icon.png']
}

const chains = [chilizChain, mainnet, polygon] as const

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true }),
    metaMask({
      dappMetadata: {
        name: metadata.name,
        url: metadata.url,
      },
    }),
  ],
})

// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#f97316', // Orange color
    '--w3m-border-radius-master': '6px',
  }
})

// Fan Token Contracts (example addresses)
export const FAN_TOKEN_CONTRACTS = {
  PSG: '0x1234567890123456789012345678901234567890', // Example PSG token
  // Add more fan token contracts as needed
} as const

export const MINIMUM_TOKEN_REQUIREMENTS = {
  PSG: 1000,
  BAR: 500,
  JUV: 1000,
} as const 