import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { chiliz, mainnet, polygon } from 'wagmi/chains'
import { walletConnect, injected, metaMask } from 'wagmi/connectors'

// Get projectId from https://cloud.reown.com
export const projectId = process.env.VITE_WALLETCONNECT_PROJECT_ID || '0123456789abcdef0123456789abcdef'

// Define Chiliz Spicy Testnet
export const chilizChain = {
  ...chiliz,
  name: 'Chiliz Spicy Testnet',
  id: 88882,
  network: 'chiliz-spicy',
  nativeCurrency: {
    decimals: 18,
    name: 'Chiliz',
    symbol: 'CHZ',
  },
  rpcUrls: {
    public: { 
      http: [
        'https://spicy-rpc.chiliz.com/',
        'https://chiliz-testnet.gateway.tatum.io',
        'https://chiliz-spicy.publicnode.com'
      ] 
    },
    default: { 
      http: [
        'https://spicy-rpc.chiliz.com/',
        'https://chiliz-testnet.gateway.tatum.io',
        'https://chiliz-spicy.publicnode.com'
      ] 
    },
  },
  blockExplorers: {
    default: { 
      name: 'Chiliz Spicy Explorer', 
      url: 'https://testnet.chiliscan.com/' 
    },
  },
  testnet: true,
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

// Fan Token Contracts (Chiliz Spicy Testnet)
export const FAN_TOKEN_CONTRACTS = {
  PSG_UNWRAPPED: '0xb0Fa395a3386800658B9617F90e834E2CeC76Dd3', // PSG Fan Token (Unwrapped)
  PSG_WRAPPED: '0x6D124526a5948Cb82BB5989D8aB34C899', // PSG Fan Token (Wrapped)
  // Add more fan token contracts as needed
} as const

export const MINIMUM_TOKEN_REQUIREMENTS = {
  PSG_UNWRAPPED: 1000,
  PSG_WRAPPED: 1000,
} as const 