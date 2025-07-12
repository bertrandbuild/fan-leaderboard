import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Twitter, MessageSquare, Youtube, Instagram, Settings, Link, Clock } from "lucide-react"
import { socialPlatforms, connectedAccounts, crossPlatformActions, recentActivity, defaultAPIConfiguration } from "@/data/social-media"
import { useState } from "react"

export function ReseauxSociaux() {
  const [apiConfig, setApiConfig] = useState(defaultAPIConfiguration)
  const [isTestingConnections, setIsTestingConnections] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [connectionResults, setConnectionResults] = useState<any>(null)

  // Icon mapping for dynamic icons
  const iconMap = {
    Twitter,
    MessageSquare,
    Youtube, 
    Instagram
  }

  const handlePlatformConnect = (platformName: string, status: string) => {
    if (status === "connected") {
      // Disconnect logic
      console.log(`Disconnecting from ${platformName}`)
      // Here you would call an API to disconnect
    } else {
      // Connect logic
      console.log(`Connecting to ${platformName}`)
      // Here you would open OAuth flow or connection modal
      window.open(`/auth/${platformName.toLowerCase()}`, '_blank', 'width=500,height=600')
    }
  }

  const handleAccountConnection = (platform: string, isConnected: boolean) => {
    if (isConnected) {
      // Disconnect account
      console.log(`Disconnecting ${platform} account`)
      // API call to disconnect
    } else {
      // Connect account
      console.log(`Connecting ${platform} account`)
      // Open OAuth flow
      window.open(`/connect/${platform.toLowerCase()}`, '_blank', 'width=500,height=600')
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
        twitter: { status: 'success', message: 'Connection successful' },
        telegram: { status: 'success', message: 'Connection successful' },
        instagram: { status: 'error', message: 'Connection failed' },
        youtube: { status: 'success', message: 'Connection successful' },
        tiktok: { status: 'warning', message: 'Limited connection' },
        discord: { status: 'success', message: 'Connection successful' }
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
      // Simulate API call to save configuration
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Configuration saved:', apiConfig)
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
        <h1 className="text-3xl font-bold text-white">Social Media Integration</h1>
        <p className="text-slate-400 mt-2">Connect and manage your Twitter, Telegram, YouTube and Instagram accounts</p>
      </div>

      {/* Connection Test Results */}
      {connectionResults && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Connection Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(connectionResults).map(([platform, result]: [string, any]) => (
                <div key={platform} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    result.status === 'success' ? 'bg-green-500' :
                    result.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-white text-sm capitalize">{platform}</span>
                  <span className="text-slate-400 text-xs">{result.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {socialPlatforms.map((platform, index) => {
          const Icon = iconMap[platform.icon as keyof typeof iconMap]
          return (
            <Card key={index} className="bg-slate-800 border-slate-700">
              <CardHeader className="text-center">
                <Icon className={`w-12 h-12 mx-auto ${platform.color}`} />
                <CardTitle className="text-white">{platform.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <div className="text-2xl font-bold text-white">{platform.followers}</div>
                <div className="text-slate-400 text-sm">{platform.engagement}</div>
                <Button
                  className={
                    platform.status === "connected"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-orange-500 hover:bg-orange-600"
                  }
                  size="sm"
                  onClick={() => handlePlatformConnect(platform.name, platform.status)}
                >
                  {platform.status === "connected" ? "Connected" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Connections */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-white">Account Connections</CardTitle>
            </div>
            <p className="text-slate-400 text-sm">Manage your social media connections</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectedAccounts.map((account, index) => {
              const Icon = iconMap[account.icon as keyof typeof iconMap]
              const isConnected = account.username !== "Not connected"
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${account.color}`} />
                    <div>
                      <div className="text-white font-medium">{account.platform}</div>
                      <div className="text-slate-400 text-sm">{account.username}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      !isConnected
                        ? "border-red-600 text-red-400 hover:bg-red-600/10"
                        : "border-slate-600 text-slate-300 hover:bg-slate-600/10"
                    }
                    onClick={() => handleAccountConnection(account.platform, isConnected)}
                  >
                    {!isConnected ? "Connect" : "Disconnect"}
                  </Button>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Cross-Platform Actions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-green-400" />
              <CardTitle className="text-white">Cross-Platform Actions</CardTitle>
            </div>
            <p className="text-slate-400 text-sm">Automate actions across platforms</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {crossPlatformActions.map((action, index) => (
              <div key={index} className="p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-medium">{action.title}</div>
                  <Switch 
                    defaultChecked={action.status === "active"} 
                    onCheckedChange={(checked) => handleCrossPlatformToggle(index, checked)}
                  />
                </div>
                <div className="text-slate-400 text-sm">{action.description}</div>
                <Badge className="mt-2 bg-green-600 text-white text-xs">
                  {action.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* API Configuration Form */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-400" />
            <CardTitle className="text-white">Credentials Configuration</CardTitle>
          </div>
          <p className="text-slate-400 text-sm">Configure your credentials for each platform</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Twitter Username</label>
                <Input 
                  value={apiConfig.twitter.username} 
                  onChange={(e) => updateApiConfig('twitter', 'username', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white" 
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Telegram Channel ID</label>
                <Input
                  value={apiConfig.telegram.channelId}
                  onChange={(e) => updateApiConfig('telegram', 'channelId', e.target.value)}
                  placeholder="@your_channel"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Instagram Username</label>
                <Input
                  value={apiConfig.instagram.username}
                  onChange={(e) => updateApiConfig('instagram', 'username', e.target.value)}
                  placeholder="@your_username"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">YouTube Channel URL</label>
                <Input 
                  value={apiConfig.youtube.channelUrl}
                  onChange={(e) => updateApiConfig('youtube', 'channelUrl', e.target.value)}
                  placeholder="https://youtube.com/@your_channel" 
                  className="bg-slate-700 border-slate-600 text-white" 
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">TikTok Username</label>
                <Input
                  value={apiConfig.tiktok.username}
                  onChange={(e) => updateApiConfig('tiktok', 'username', e.target.value)}
                  placeholder="@your_username"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Discord Server ID</label>
                <Input
                  value={apiConfig.discord.serverId}
                  onChange={(e) => updateApiConfig('discord', 'serverId', e.target.value)}
                  placeholder="Discord server ID"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 justify-end">
            <Button 
              variant="outline" 
              className="border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700"
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

      {/* Recent Activity */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <p className="text-slate-400 text-sm">Latest automated actions on your networks</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-white text-sm">{activity.type}</div>
                  <div className="text-slate-400 text-xs">{activity.description}</div>
                  <div className="text-slate-500 text-xs">{activity.time}</div>
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
