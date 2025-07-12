import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Check, ExternalLink, AlertCircle, Copy, Wallet, Shield, Zap, Users } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"
import { useState } from "react"
import { integrationSteps, calculateIntegrationProgress } from "@/data/wallet-integration"

export function WalletIntegration() {
  const { 
    isConnected, 
    isLoadingBalance, 
    isLoadingTokens, 
    isOnChilizChain,
    walletInfo, 
    fanTokens, 
    accessibleGroups,
    connectWallet, 
    disconnectWallet 
  } = useWallet()

  const [copiedAddress, setCopiedAddress] = useState(false)

  const currentStep = calculateIntegrationProgress(isConnected, isOnChilizChain, isLoadingTokens)

  const copyAddress = async () => {
    if (walletInfo?.fullAddress) {
      await navigator.clipboard.writeText(walletInfo.fullAddress)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }

  const handleTelegramAccess = (groupId: string) => {
    // In a real app, this would generate a secure access link
    const accessLink = `https://t.me/+${groupId}_verified_access`
    window.open(accessLink, '_blank')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Wallet Integration</h1>
        <p className="text-muted-foreground mt-2">
          Connect your wallet and verify your fan tokens for exclusive Telegram group access
        </p>
      </div>

      {/* Wallet Connection Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-orange-400" />
              <CardTitle className="text-foreground">Wallet Connection</CardTitle>
            </div>
            <p className="text-muted-foreground text-sm">
              {isConnected ? 'Manage your connected wallet' : 'Connect your Web3 wallet to get started'}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <>
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={connectWallet}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
                <div className="text-center text-muted-foreground text-sm">
                  Supports MetaMask, WalletConnect, and other Web3 wallets
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-green-600 text-white">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Wallet</span>
                  <span className="text-foreground">{walletInfo?.connector}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-mono">{walletInfo?.address}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAddress}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {copiedAddress && (
                  <div className="text-green-400 text-sm text-center">Address copied!</div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={disconnectWallet}
                >
                  Disconnect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wallet Status */}
        {isConnected && walletInfo && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Wallet Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Network</span>
                <div className="flex items-center gap-2">
                  {isOnChilizChain ? (
                    <Badge className="bg-green-600 text-white">Chiliz Chain</Badge>
                  ) : (
                    <Badge variant="destructive">Wrong Network</Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Balance</span>
                <div className="text-right">
                  {isLoadingBalance ? (
                    <div className="text-muted-foreground">Loading...</div>
                  ) : (
                    <div className="text-foreground font-medium">
                      {parseFloat(walletInfo.balance).toFixed(4)} {walletInfo.symbol}
                    </div>
                  )}
                </div>
              </div>

              {!isOnChilizChain && (
                <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-sm">
                    Please switch to Chiliz Chain to access fan tokens
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Integration Progress */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-foreground">Integration Progress</CardTitle>
            </div>
            <Badge className="bg-blue-600 text-white">
              {currentStep}/4 Steps
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">Complete all steps to access exclusive Telegram groups</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={(currentStep / 4) * 100} className="h-2" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {integrationSteps.map((step) => {
              const Icon = step.icon
              const isCompleted = currentStep >= step.id
              const isCurrent = currentStep === step.id - 1
              
              return (
                <div key={step.id} className={`p-4 rounded-lg border ${
                  isCompleted
                    ? 'bg-green-500/10 border-green-500/30' 
                    : isCurrent 
                    ? 'bg-orange-500/10 border-orange-500/30' 
                    : 'bg-muted border-border'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-5 h-5 ${step.color}`} />
                    {isCompleted && <Check className="w-4 h-4 text-green-400" />}
                  </div>
                  <div className="text-foreground font-medium text-sm">{step.title}</div>
                  <div className="text-muted-foreground text-xs">{step.description}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fan Tokens */}
      {isConnected && isOnChilizChain && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <CardTitle className="text-foreground">Your Fan Tokens</CardTitle>
              </div>
              <p className="text-muted-foreground text-sm">
                {isLoadingTokens ? 'Scanning wallet for fan tokens...' : 'Fan tokens detected in your wallet'}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingTokens ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading fan tokens...</div>
                </div>
              ) : fanTokens.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">No fan tokens found in your wallet</div>
                </div>
              ) : (
                fanTokens.map((token) => (
                  <div key={token.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{token.logo}</span>
                      <div>
                        <div className="text-foreground font-medium">{token.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {token.balance.toLocaleString()} {token.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {token.verified && (
                        <Badge className="bg-green-600 text-white text-xs">Verified</Badge>
                      )}
                      {token.telegramAccess ? (
                        <Badge className="bg-blue-600 text-white text-xs">Eligible</Badge>
                      ) : (
                        <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                          Need {token.minimumRequired - token.balance} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Telegram Groups Access */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <CardTitle className="text-foreground">Telegram Groups</CardTitle>
              </div>
              <p className="text-muted-foreground text-sm">
                Exclusive groups based on your fan token holdings
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {accessibleGroups.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">
                    No accessible groups yet. Get more fan tokens to unlock exclusive access!
                  </div>
                </div>
              ) : (
                accessibleGroups.map((group) => (
                  <div key={group.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-foreground font-medium">{group.name}</div>
                      <Badge className="bg-green-600 text-white text-xs">Available</Badge>
                    </div>
                    <div className="text-muted-foreground text-sm mb-2">
                      Required: {group.requiredTokens.toLocaleString()} {group.tokenSymbol} 
                      (You have: {group.userTokens.toLocaleString()})
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleTelegramAccess(group.id)}
                    >
                      <ExternalLink className="w-3 h-3 mr-2" />
                      Join Group
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
