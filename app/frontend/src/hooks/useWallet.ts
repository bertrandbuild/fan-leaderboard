import { useAccount, useBalance, useDisconnect, useChainId } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useState, useEffect } from 'react'
import { chilizChain } from '@/config/wallet'
import { formatEther } from 'viem'
import { mockFanTokens, getAccessibleGroups, type FanTokenData } from '@/data/wallet-integration'

export interface FanToken extends FanTokenData {
  telegramAccess: boolean
}

export function useWallet() {
  const { address, isConnected, connector } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const chainId = useChainId()
  const [fanTokens, setFanTokens] = useState<FanToken[]>([])
  const [isLoadingTokens, setIsLoadingTokens] = useState(false)

  // Get CHZ balance
  const { data: balance, isLoading: isLoadingBalance } = useBalance({
    address,
    chainId: chilizChain.id,
  })

  // Load fan tokens when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      setIsLoadingTokens(true)
      // Simulate API call delay
      setTimeout(() => {
        const tokensWithAccess = mockFanTokens.map(token => ({
          ...token,
          telegramAccess: token.balance >= token.minimumRequired
        }))
        setFanTokens(tokensWithAccess)
        setIsLoadingTokens(false)
      }, 1000)
    } else {
      setFanTokens([])
    }
  }, [isConnected, address])

  const connectWallet = () => {
    open()
  }

  const disconnectWallet = () => {
    disconnect()
    setFanTokens([])
  }

  const isOnChilizChain = chainId === chilizChain.id

  const getWalletInfo = () => {
    if (!isConnected || !address) return null

    return {
      address: `${address.slice(0, 6)}...${address.slice(-4)}`,
      fullAddress: address,
      balance: balance ? formatEther(balance.value) : '0',
      symbol: balance?.symbol || 'CHZ',
      connector: connector?.name || 'Unknown',
      chainId,
      isOnChilizChain
    }
  }

  const getAccessibleTelegramGroups = () => {
    return getAccessibleGroups(fanTokens)
  }

  return {
    // Connection state
    isConnected,
    isLoadingBalance,
    isLoadingTokens,
    isOnChilizChain,
    
    // Wallet info
    walletInfo: getWalletInfo(),
    
    // Fan tokens
    fanTokens,
    accessibleGroups: getAccessibleTelegramGroups(),
    
    // Actions
    connectWallet,
    disconnectWallet,
  }
} 