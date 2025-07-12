import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Twitter, MessageSquare, Youtube, Instagram, Settings, Clock } from "lucide-react"
import { socialPlatforms, connectedAccounts, crossPlatformActions, recentActivity, defaultAPIConfiguration, type ConnectedAccount } from "@/data/social-media"
import { CredentialsModal } from "@/components/ui/CredentialsModal"
import { useState, useEffect } from "react"
import { useAuthContext } from "@/hooks/useAuthContext"
import { SERVER_URL } from "@/config/config"

export function ReseauxSociaux() {
  const { user } = useAuthContext()
  const [apiConfig, setApiConfig] = useState(defaultAPIConfiguration)
  const [isTestingConnections, setIsTestingConnections] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [connectionResults, setConnectionResults] = useState<any>(null)
  const [modalState, setModalState] = useState({ isOpen: false, platform: "" })
  const [platformStates, setPlatformStates] = useState(socialPlatforms)
  const [_, setAccountStates] = useState(connectedAccounts)
  // Nouvel état pour la connexion visuelle
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({
    Twitter: false,
    Telegram: false,
    YouTube: false,
    Instagram: false,
    Discord: false,
    TikTok: false,
  })

  // Icon mapping for dynamic icons
  const iconMap = {
    Twitter,
    MessageSquare,
    Youtube, 
    Instagram,
    Discord: MessageSquare, // fallback
    Tiktok: Youtube // fallback
  }

  // Check if platform has valid credentials
  const hasValidCredentials = (platformName: string) => {
    const platform = platformName.toLowerCase()
    switch (platform) {
      case 'twitter':
        return !!apiConfig.twitter.username?.trim()
      case 'telegram':
        return !!apiConfig.telegram.channelId?.trim()
      case 'youtube':
        return !!apiConfig.youtube.channelUrl?.trim()
      case 'instagram':
        return !!apiConfig.instagram.username?.trim()
      case 'discord':
        return !!apiConfig.discord.serverId?.trim()
      case 'tiktok':
        return !!apiConfig.tiktok.username?.trim()
      default:
        return false
    }
  }

  // Update platform status based on credentials and connectionStatus
  useEffect(() => {
    setPlatformStates(prev => prev.map(platform => {
      const connected = connectionStatus[platform.name] && hasValidCredentials(platform.name)
      return {
        ...platform,
        status: connected ? 'connected' : 'disconnected',
        color: connected ? 'text-green-400' : 'text-red-400'
      }
    }))

    setAccountStates(prev => prev.map((account: ConnectedAccount) => {
      const connected = connectionStatus[account.platform] && hasValidCredentials(account.platform)
      return {
        ...account,
        username: connected ? getDisplayUsername(account.platform) : 'Not connected',
        color: connected ? 'text-green-400' : 'text-red-400'
      }
    }))
  }, [apiConfig, connectionStatus])

  const getDisplayUsername = (platformName: string) => {
    const platform = platformName.toLowerCase()
    switch (platform) {
      case 'twitter':
        return apiConfig.twitter.username || 'Not connected'
      case 'telegram':
        return apiConfig.telegram.channelId || 'Not connected'
      case 'youtube':
        return apiConfig.youtube.channelUrl ? 'Connected' : 'Not connected'
      case 'instagram':
        return apiConfig.instagram.username || 'Not connected'
      case 'discord':
        return apiConfig.discord.serverId || 'Not connected'
      case 'tiktok':
        return apiConfig.tiktok.username || 'Not connected'
      default:
        return 'Not connected'
    }
  }

  const handlePlatformConnect = (platformName: string, status: string) => {
    if (status === "connected") {
      // Déconnecter visuellement seulement
      setConnectionStatus(prev => ({ ...prev, [platformName]: false }))
      console.log(`Disconnecting from ${platformName}`)
    } else {
      // Connect logic - open modal
      setModalState({ isOpen: true, platform: platformName })
    }
  }

  const handleCredentialsSave = (platform: string, credentials: Record<string, string>) => {
    // Update API config with new credentials
    Object.entries(credentials).forEach(([key, value]) => {
      updateApiConfig(platform, key, value)
    })
    // Si credentials valides, on connecte visuellement
    setConnectionStatus(prev => ({ ...prev, [capitalize(platform)]: true }))
    console.log(`Credentials saved for ${platform}:`, credentials)
  }

  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const getCurrentCredentials = (platform: string): Record<string, string> => {
    const platformKey = platform.toLowerCase()
    switch (platformKey) {
      case 'twitter':
        return { username: apiConfig.twitter.username || '' }
      case 'telegram':
        return { channelId: apiConfig.telegram.channelId || '' }
      case 'youtube':
        return { channelUrl: apiConfig.youtube.channelUrl || '' }
      case 'instagram':
        return { username: apiConfig.instagram.username || '' }
      case 'tiktok':
        return { username: apiConfig.tiktok.username || '' }
      case 'discord':
        return { serverId: apiConfig.discord.serverId || '' }
      default:
        return {}
    }
  }

  const handleCrossPlatformToggle = (actionId: number, enabled: boolean) => {
    console.log(`Toggling cross-platform action ${actionId} to ${enabled}`)
    // API call to update action status
  }

  const handleTestConnections = async () => {
    setIsTestingConnections(true)
    try {
      // Simulate API call to test connections
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setConnectionResults({
        twitter: {
          status: connectionStatus.Twitter && hasValidCredentials('twitter') ? 'success' : (hasValidCredentials('twitter') ? 'disconnected' : 'error'),
          message: connectionStatus.Twitter && hasValidCredentials('twitter')
            ? 'Connection successful'
            : hasValidCredentials('twitter')
              ? 'Disconnected'
              : 'No credentials'
        },
        telegram: {
          status: connectionStatus.Telegram && hasValidCredentials('telegram') ? 'success' : (hasValidCredentials('telegram') ? 'disconnected' : 'error'),
          message: connectionStatus.Telegram && hasValidCredentials('telegram')
            ? 'Connection successful'
            : hasValidCredentials('telegram')
              ? 'Disconnected'
              : 'No credentials'
        },
        instagram: {
          status: connectionStatus.Instagram && hasValidCredentials('instagram') ? 'success' : (hasValidCredentials('instagram') ? 'disconnected' : 'error'),
          message: connectionStatus.Instagram && hasValidCredentials('instagram')
            ? 'Connection successful'
            : hasValidCredentials('instagram')
              ? 'Disconnected'
              : 'No credentials'
        },
        youtube: {
          status: connectionStatus.YouTube && hasValidCredentials('youtube') ? 'success' : (hasValidCredentials('youtube') ? 'disconnected' : 'error'),
          message: connectionStatus.YouTube && hasValidCredentials('youtube')
            ? 'Connection successful'
            : hasValidCredentials('youtube')
              ? 'Disconnected'
              : 'No credentials'
        },
        tiktok: {
          status: connectionStatus.TikTok && hasValidCredentials('tiktok') ? 'success' : (hasValidCredentials('tiktok') ? 'disconnected' : 'error'),
          message: connectionStatus.TikTok && hasValidCredentials('tiktok')
            ? 'Connection successful'
            : hasValidCredentials('tiktok')
              ? 'Disconnected'
              : 'No credentials'
        },
        discord: {
          status: connectionStatus.Discord && hasValidCredentials('discord') ? 'success' : (hasValidCredentials('discord') ? 'disconnected' : 'error'),
          message: connectionStatus.Discord && hasValidCredentials('discord')
            ? 'Connection successful'
            : hasValidCredentials('discord')
              ? 'Disconnected'
              : 'No credentials'
        },
      })
    } catch (error) {
      console.error('Error testing connections:', error)
    } finally {
      setIsTestingConnections(false)
    }
  }

  const handleSaveConfiguration = async () => {
    setIsSaving(true)
    try {
      // TODO: Backend API integration for social media configuration
      // For TikTok, we need to update the user profile with tiktok_id
      // Required endpoint: PUT /api/users/:id with { tiktok_id: username }
      // Currently using localStorage as fallback until full backend integration
      
      try {
                          // If user is authenticated and has TikTok username, update their profile
         if (user?.id && apiConfig.tiktok.username) {
           try {
             // For demo accounts, use the EVM address to update the backend profile
             if (user.evm_address) {
               // Get the existing user profile by EVM address
               const getUserResponse = await fetch(`${SERVER_URL}/api/users/address/${user.evm_address}`);
               
               if (getUserResponse.ok) {
                 // User exists, update their TikTok profile
                 const existingUser = await getUserResponse.json();
                 const updateResponse = await fetch(`${SERVER_URL}/api/users/${existingUser.id}`, {
                   method: 'PUT',
                   headers: { 
                     'Content-Type': 'application/json',
                     'x-evm-address': user.evm_address
                   },
                   body: JSON.stringify({
                     tiktok_id: apiConfig.tiktok.username.replace('@', '')
                   })
                 });
                 
                 if (updateResponse.ok) {
                   console.log('TikTok profile successfully linked to existing user');
                   setConnectionStatus(prev => ({ ...prev, TikTok: true }));
                 } else {
                   console.warn('Failed to update user TikTok profile');
                 }
               } else {
                 // User doesn't exist, create new profile
                 const createUserResponse = await fetch(`${SERVER_URL}/api/users`, {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({
                     evm_address: user.evm_address,
                     role: user.role === 'admin' ? 'club_admin' : 'user',
                     twitter_id: user.username,
                     tiktok_id: apiConfig.tiktok.username.replace('@', '')
                   })
                 });
                 
                 if (createUserResponse.ok) {
                   console.log('New user profile created with TikTok');
                   setConnectionStatus(prev => ({ ...prev, TikTok: true }));
                 } else {
                   console.warn('Failed to create user profile with TikTok');
                 }
               }
             } else {
               console.warn('No EVM address available for user');
             }
           } catch (userError) {
             console.error('Error connecting TikTok profile:', userError);
           }
         } else {
           // For unauthenticated users, just show connection status visually
           if (apiConfig.tiktok.username) {
             setConnectionStatus(prev => ({ ...prev, TikTok: true }));
           }
        }
        
        // Save other social media config to localStorage for now
        localStorage.setItem('socialMediaConfig', JSON.stringify(apiConfig));
        console.log('Configuration saved:', apiConfig);
        
      } catch (backendError) {
        console.warn('Backend save failed, using localStorage fallback:', backendError);
        localStorage.setItem('socialMediaConfig', JSON.stringify(apiConfig));
      }
      
      // Show success notification
    } catch (error) {
      console.error('Error saving configuration:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateApiConfig = (platform: string, field: string, value: string) => {
    setApiConfig(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform as keyof typeof prev],
        [field]: value
      }
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Social Media Integration</h1>
        <p className="text-muted-foreground mt-2">Connect and manage your Twitter, Telegram, YouTube and Instagram accounts</p>
      </div>

      {/* Credentials Modal */}
      <CredentialsModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, platform: "" })}
        platform={modalState.platform}
        onSave={handleCredentialsSave}
        currentCredentials={getCurrentCredentials(modalState.platform)}
      />

      {/* Connection Test Results */}
      {connectionResults && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Connection Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(connectionResults).map(([platform, result]: [string, any]) => (
                <div key={platform} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    result.status === 'success' ? 'bg-green-500' :
                    result.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-foreground text-sm capitalize">{platform}</span>
                  <span className="text-muted-foreground text-xs">{result.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TikTok Principal */}
      <div className="flex justify-center mb-8">
        {(() => {
          const tiktokPlatform = platformStates.find(p => p.name === "TikTok")
          if (!tiktokPlatform) return null
          
          const Icon = iconMap[tiktokPlatform.icon as keyof typeof iconMap]
          return (
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 w-full max-w-md">
              <CardHeader className="text-center pb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 blur-lg opacity-20 rounded-full"></div>
                  <Icon className={`w-16 h-16 mx-auto relative z-10 ${tiktokPlatform.color}`} />
                </div>
                <CardTitle className="text-foreground text-2xl font-bold">{tiktokPlatform.name}</CardTitle>
                <p className="text-muted-foreground text-sm">Primary Content Platform</p>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-foreground">{tiktokPlatform.followers}</div>
                    <div className="text-muted-foreground text-sm">Followers</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-foreground">{tiktokPlatform.engagement}</div>
                    <div className="text-muted-foreground text-sm">Engagement</div>
                  </div>
                </div>
                <Button
                  className={
                    tiktokPlatform.status === "connected"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full"
                      : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white w-full"
                  }
                  onClick={() => handlePlatformConnect(tiktokPlatform.name, tiktokPlatform.status)}
                >
                  {tiktokPlatform.status === "connected" ? "✓ Connected" : "Connect Now"}
                </Button>
              </CardContent>
            </Card>
          )
        })()}
      </div>

      {/* Autres Plateformes Secondaires */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Other Platforms</CardTitle>
          <p className="text-muted-foreground text-sm">Additional social media connections</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {platformStates.filter(p => p.name !== "TikTok").map((platform, index) => {
              const Icon = iconMap[platform.icon as keyof typeof iconMap]
              return (
                <div key={index} className="text-center p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${platform.color}`} />
                  <div className="text-foreground font-medium text-sm">{platform.name}</div>
                  <div className="text-muted-foreground text-xs">{platform.followers}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`mt-2 w-full text-xs ${
                      platform.status === "connected"
                        ? "border-green-500 text-green-400 hover:bg-green-500/10"
                        : "border-orange-500 text-orange-400 hover:bg-orange-500/10"
                    }`}
                    onClick={() => handlePlatformConnect(platform.name, platform.status)}
                  >
                    {platform.status === "connected" ? "Connected" : "Connect"}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cross-Platform Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-green-400" />
              <CardTitle className="text-foreground">Cross-Platform Actions</CardTitle>
            </div>
            <p className="text-muted-foreground text-sm">Automate actions across platforms</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {crossPlatformActions.map((action, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-foreground font-medium">{action.title}</div>
                  <Switch 
                    defaultChecked={action.status === "active"} 
                    onCheckedChange={(checked) => handleCrossPlatformToggle(index, checked)}
                  />
                </div>
                <div className="text-muted-foreground text-sm">{action.description}</div>
                <Badge className="mt-2 bg-green-600 text-white text-xs">
                  {action.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Credentials Configuration */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-400" />
              <CardTitle className="text-foreground">Credentials Configuration</CardTitle>
            </div>
            <p className="text-muted-foreground text-sm">Configure your credentials for each platform</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">Twitter Username</label>
                <Input 
                  value={apiConfig.twitter.username} 
                  onChange={(e) => updateApiConfig('twitter', 'username', e.target.value)}
                  className="bg-muted border-border text-foreground" 
                  placeholder="Twitter username"
                />
              </div>

              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">Telegram Channel ID</label>
                <Input
                  value={apiConfig.telegram.channelId}
                  onChange={(e) => updateApiConfig('telegram', 'channelId', e.target.value)}
                  placeholder="@your_channel"
                  className="bg-muted border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">TikTok Username</label>
                <Input
                  value={apiConfig.tiktok.username}
                  onChange={(e) => updateApiConfig('tiktok', 'username', e.target.value)}
                  placeholder="@your_username"
                  className="bg-muted border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">YouTube Channel URL</label>
                <Input 
                  value={apiConfig.youtube.channelUrl}
                  onChange={(e) => updateApiConfig('youtube', 'channelUrl', e.target.value)}
                  placeholder="https://youtube.com/@your_channel" 
                  className="bg-muted border-border text-foreground" 
                />
              </div>

              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">Instagram Username</label>
                <Input
                  value={apiConfig.instagram.username}
                  onChange={(e) => updateApiConfig('instagram', 'username', e.target.value)}
                  placeholder="@your_username"
                  className="bg-muted border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">Discord Server ID</label>
                <Input
                  value={apiConfig.discord.serverId}
                  onChange={(e) => updateApiConfig('discord', 'serverId', e.target.value)}
                  placeholder="Discord server ID"
                  className="bg-muted border-border text-foreground"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6 justify-end">
              <Button 
                variant="outline" 
                className="border-border text-muted-foreground bg-transparent hover:bg-accent"
                onClick={handleTestConnections}
                disabled={isTestingConnections}
              >
                {isTestingConnections ? "Testing..." : "Test Connections"}
              </Button>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleSaveConfiguration}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
          <p className="text-muted-foreground text-sm">Latest automated actions on your networks</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-foreground text-sm">{activity.type}</div>
                  <div className="text-muted-foreground text-xs">{activity.description}</div>
                  <div className="text-muted-foreground text-xs">{activity.time}</div>
                </div>
              </div>
              <Badge className="bg-green-600 text-white text-xs">
                {activity.engagement}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}