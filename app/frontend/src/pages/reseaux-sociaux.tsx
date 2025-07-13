import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Twitter, MessageSquare, Youtube, Instagram, Settings, Clock } from "lucide-react"
import { socialPlatforms, connectedAccounts, recentActivity, defaultAPIConfiguration, type ConnectedAccount } from "@/data/social-media"
import { CredentialsModal } from "@/components/ui/CredentialsModal"
import { TikTokProfileCard } from "@/components/sections/TikTokProfileCard"
import { useState, useEffect } from "react"
import { useAuthContext } from "@/hooks/useAuthContext"
import { SERVER_URL } from "@/config/config"

// Fonction utilitaire pour garantir la cohérence des clés de plateforme
function getPlatformKey(name: string) {
  switch (name.toLowerCase()) {
    case "tiktok":
      return "TikTok"
    case "twitter":
      return "Twitter"
    case "telegram":
      return "Telegram"
    case "youtube":
      return "YouTube"
    case "instagram":
      return "Instagram"
    case "discord":
      return "Discord"
    default:
      return name
  }
}

export function ReseauxSociaux() {
  const { user } = useAuthContext()
  const [apiConfig, setApiConfig] = useState(defaultAPIConfiguration)
  const [isTestingConnections, setIsTestingConnections] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [connectionResults, setConnectionResults] = useState<any>(null)
  const [modalState, setModalState] = useState({ isOpen: false, platform: "" })
  const [platformStates, setPlatformStates] = useState(socialPlatforms)
  const [_, setAccountStates] = useState(connectedAccounts)
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({
    Twitter: false,
    Telegram: false,
    YouTube: false,
    Instagram: false,
    Discord: false,
    TikTok: false,
  })
  const [tiktokProfile, setTiktokProfile] = useState<any>(null)

  // Mapping d'icônes
  const iconMap = {
    Twitter,
    MessageSquare,
    Youtube,
    Instagram,
    Discord: MessageSquare, // fallback
    TikTok: Youtube, // fallback pour TikTok, tu peux remplacer par un icône custom
  }

  // Vérifie si une plateforme a des credentials valides
  const hasValidCredentials = (platformName: string) => {
    const platform = platformName.toLowerCase()
    switch (platform) {
      case "twitter":
        return !!apiConfig.twitter.username?.trim()
      case "telegram":
        return !!apiConfig.telegram.channelId?.trim()
      case "youtube":
        return !!apiConfig.youtube.channelUrl?.trim()
      case "instagram":
        return !!apiConfig.instagram.username?.trim()
      case "discord":
        return !!apiConfig.discord.serverId?.trim()
      case "tiktok":
        return !!apiConfig.tiktok.username?.trim()
      default:
        return false
    }
  }

  // Synchronise l'état visuel de chaque plateforme
  useEffect(() => {
    setPlatformStates((prev) =>
      prev.map((platform) => {
        const key = getPlatformKey(platform.name)
        // TikTok : si profil dispo, considéré comme connecté
        const connected =
          key === "TikTok"
            ? connectionStatus[key] && (hasValidCredentials(platform.name) || tiktokProfile)
            : connectionStatus[key] && hasValidCredentials(platform.name)
        return {
          ...platform,
          status: connected ? "connected" : "disconnected",
          color: connected ? "text-green-400" : "text-red-400",
        }
      })
    )

    setAccountStates((prev) =>
      prev.map((account: ConnectedAccount) => {
        const key = getPlatformKey(account.platform)
        const connected = connectionStatus[key] && hasValidCredentials(account.platform)
        return {
          ...account,
          username: connected ? getDisplayUsername(account.platform) : "Not connected",
          color: connected ? "text-green-400" : "text-red-400",
        }
      })
    )
  }, [apiConfig, connectionStatus, tiktokProfile])

  // Synchronise TikTok à true si un profil est chargé (sécurité UX)
  useEffect(() => {
    if (tiktokProfile) {
      setConnectionStatus((prev) => ({ ...prev, TikTok: true }))
    }
  }, [tiktokProfile])

  // Affiche le username "friendly"
  const getDisplayUsername = (platformName: string) => {
    const platform = platformName.toLowerCase()
    switch (platform) {
      case "twitter":
        return apiConfig.twitter.username || "Not connected"
      case "telegram":
        return apiConfig.telegram.channelId || "Not connected"
      case "youtube":
        return apiConfig.youtube.channelUrl ? "Connected" : "Not connected"
      case "instagram":
        return apiConfig.instagram.username || "Not connected"
      case "discord":
        return apiConfig.discord.serverId || "Not connected"
      case "tiktok":
        return apiConfig.tiktok.username || "Not connected"
      default:
        return "Not connected"
    }
  }

  const handlePlatformConnect = (platformName: string, status: string) => {
    const key = getPlatformKey(platformName)
    if (status === "connected") {
      setConnectionStatus((prev) => ({ ...prev, [key]: false }))
      if (key === "TikTok") setTiktokProfile(null)
      console.log(`Disconnecting from ${platformName}`)
    } else {
      setModalState({ isOpen: true, platform: platformName })
    }
  }

  const handleCredentialsSave = async (platform: string, credentials: Record<string, string>) => {
    Object.entries(credentials).forEach(([key, value]) => {
      updateApiConfig(platform, key, value)
    })

    console.log(`Credentials saved for ${platform}:`, credentials)

    const key = getPlatformKey(platform)
    if (platform.toLowerCase() === "tiktok" && credentials.username && user?.evm_address) {
      try {
        // Check if user exists
        const getUserResponse = await fetch(
          `${SERVER_URL}/api/users/address/${user.evm_address}`
        )
        if (getUserResponse.ok) {
          // User exists, update TikTok profile
          const existingUser = await getUserResponse.json()
          const updateResponse = await fetch(`${SERVER_URL}/api/users/${existingUser.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-evm-address": user.evm_address,
            },
            body: JSON.stringify({
              tiktok_id: credentials.username.replace("@", ""),
            }),
          })

          if (updateResponse.ok) {
            console.log("✅ TikTok profile successfully linked to existing user")
            setConnectionStatus((prev) => ({ ...prev, [key]: true }))
            // Récupérer le profil TikTok après la connexion
            const profileData = await fetchTiktokProfile(existingUser.id)
            if (profileData) {
              setModalState({ isOpen: false, platform: "" })
            }
          } else {
            const errorData = await updateResponse.text()
            console.error("❌ Failed to update user TikTok profile:", errorData)
          }
        } else {
          // User doesn't exist, create new user
          const createUserResponse = await fetch(`${SERVER_URL}/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              evm_address: user.evm_address,
              role: user.role === "admin" ? "club_admin" : "user",
              twitter_id: user.username,
              tiktok_id: credentials.username.replace("@", ""),
            }),
          })

          if (createUserResponse.ok) {
            const newUser = await createUserResponse.json()
            console.log("✅ New user profile created with TikTok:", newUser)
            setConnectionStatus((prev) => ({ ...prev, [key]: true }))
            const profileData = await fetchTiktokProfile(newUser.id)
            if (profileData) {
              setModalState({ isOpen: false, platform: "" })
            }
          } else {
            const errorData = await createUserResponse.text()
            console.error("❌ Failed to create user profile with TikTok:", errorData)
          }
        }
      } catch (error) {
        console.error("❌ Error during TikTok profile API call:", error)
      }
    } else {
      setConnectionStatus((prev) => ({ ...prev, [key]: true }))
    }
  }

  // Récupère le profil TikTok depuis l'API
  const fetchTiktokProfile = async (userId: string) => {
    try {
      console.log("🔄 Fetching TikTok profile for user ID:", userId)
      const response = await fetch(
        `${SERVER_URL}/api/users/${userId}/tiktok-profile`
      )
      if (response.ok) {
        const profileData = await response.json()
        console.log("✅ TikTok profile data received:", profileData)
        setTiktokProfile(profileData)
        return profileData
      } else {
        console.error("❌ Failed to fetch TikTok profile:", response.status)
        return null
      }
    } catch (error) {
      console.error("❌ Error fetching TikTok profile:", error)
      return null
    }
  }

  const getCurrentCredentials = (platform: string): Record<string, string> => {
    const platformKey = platform.toLowerCase()
    switch (platformKey) {
      case "twitter":
        return { username: apiConfig.twitter.username || "" }
      case "telegram":
        return { channelId: apiConfig.telegram.channelId || "" }
      case "youtube":
        return { channelUrl: apiConfig.youtube.channelUrl || "" }
      case "instagram":
        return { username: apiConfig.instagram.username || "" }
      case "tiktok":
        return { username: apiConfig.tiktok.username || "" }
      case "discord":
        return { serverId: apiConfig.discord.serverId || "" }
      default:
        return {}
    }
  }

  const handleTestConnections = async () => {
    setIsTestingConnections(true)
    try {
      // Simulate API call to test connections
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setConnectionResults({
        twitter: {
          status:
            connectionStatus.Twitter && hasValidCredentials("twitter")
              ? "success"
              : hasValidCredentials("twitter")
              ? "disconnected"
              : "error",
          message:
            connectionStatus.Twitter && hasValidCredentials("twitter")
              ? "Connection successful"
              : hasValidCredentials("twitter")
              ? "Disconnected"
              : "No credentials",
        },
        telegram: {
          status:
            connectionStatus.Telegram && hasValidCredentials("telegram")
              ? "success"
              : hasValidCredentials("telegram")
              ? "disconnected"
              : "error",
          message:
            connectionStatus.Telegram && hasValidCredentials("telegram")
              ? "Connection successful"
              : hasValidCredentials("telegram")
              ? "Disconnected"
              : "No credentials",
        },
        instagram: {
          status:
            connectionStatus.Instagram && hasValidCredentials("instagram")
              ? "success"
              : hasValidCredentials("instagram")
              ? "disconnected"
              : "error",
          message:
            connectionStatus.Instagram && hasValidCredentials("instagram")
              ? "Connection successful"
              : hasValidCredentials("instagram")
              ? "Disconnected"
              : "No credentials",
        },
        youtube: {
          status:
            connectionStatus.YouTube && hasValidCredentials("youtube")
              ? "success"
              : hasValidCredentials("youtube")
              ? "disconnected"
              : "error",
          message:
            connectionStatus.YouTube && hasValidCredentials("youtube")
              ? "Connection successful"
              : hasValidCredentials("youtube")
              ? "Disconnected"
              : "No credentials",
        },
        tiktok: {
          status:
            connectionStatus.TikTok && hasValidCredentials("tiktok")
              ? "success"
              : hasValidCredentials("tiktok")
              ? "disconnected"
              : "error",
          message:
            connectionStatus.TikTok && hasValidCredentials("tiktok")
              ? "Connection successful"
              : hasValidCredentials("tiktok")
              ? "Disconnected"
              : "No credentials",
        },
        discord: {
          status:
            connectionStatus.Discord && hasValidCredentials("discord")
              ? "success"
              : hasValidCredentials("discord")
              ? "disconnected"
              : "error",
          message:
            connectionStatus.Discord && hasValidCredentials("discord")
              ? "Connection successful"
              : hasValidCredentials("discord")
              ? "Disconnected"
              : "No credentials",
        },
      })
    } catch (error) {
      console.error("Error testing connections:", error)
    } finally {
      setIsTestingConnections(false)
    }
  }

  const handleSaveConfiguration = async () => {
    setIsSaving(true)
    try {
      // TikTok - Backend Sync
      try {
        if (user?.id && apiConfig.tiktok.username) {
          if (user.evm_address) {
            const getUserResponse = await fetch(
              `${SERVER_URL}/api/users/address/${user.evm_address}`
            )

            if (getUserResponse.ok) {
              const existingUser = await getUserResponse.json()
              const updateResponse = await fetch(
                `${SERVER_URL}/api/users/${existingUser.id}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    "x-evm-address": user.evm_address,
                  },
                  body: JSON.stringify({
                    tiktok_id: apiConfig.tiktok.username.replace("@", ""),
                  }),
                }
              )
              if (updateResponse.ok) {
                setConnectionStatus((prev) => ({ ...prev, TikTok: true }))
              } else {
                console.warn("Failed to update user TikTok profile")
              }
            } else {
              const createUserResponse = await fetch(`${SERVER_URL}/api/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  evm_address: user.evm_address,
                  role: user.role === "admin" ? "club_admin" : "user",
                  twitter_id: user.username,
                  tiktok_id: apiConfig.tiktok.username.replace("@", ""),
                }),
              })
              if (createUserResponse.ok) {
                setConnectionStatus((prev) => ({ ...prev, TikTok: true }))
              } else {
                console.warn("Failed to create user profile with TikTok")
              }
            }
          } else {
            console.warn("No EVM address available for user")
          }
        } else {
          if (apiConfig.tiktok.username) {
            setConnectionStatus((prev) => ({ ...prev, TikTok: true }))
          }
        }
        // Save config local
        localStorage.setItem("socialMediaConfig", JSON.stringify(apiConfig))
      } catch (backendError) {
        localStorage.setItem("socialMediaConfig", JSON.stringify(apiConfig))
      }
    } catch (error) {
      console.error("Error saving configuration:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateApiConfig = (platform: string, field: string, value: string) => {
    setApiConfig((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Social Media Integration</h1>
        <p className="text-slate-400 mt-2">
          Connect and manage your Twitter, Telegram, YouTube and Instagram accounts
        </p>
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
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Connection Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(connectionResults).map(
                ([platform, result]: [string, any]) => (
                  <div key={platform} className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        result.status === "success"
                          ? "bg-green-500"
                          : result.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-white text-sm capitalize">{platform}</span>
                    <span className="text-slate-400 text-xs">{result.message}</span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TikTok Principal */}
      <div className="flex justify-center mb-8">
        {(() => {
          const tiktokPlatform = platformStates.find((p) => p.name === "TikTok")
          if (!tiktokPlatform) return null

          const Icon = iconMap[tiktokPlatform.icon as keyof typeof iconMap]

          if (tiktokPlatform.status === "connected" && tiktokProfile) {
            return (
              <TikTokProfileCard
                profileData={tiktokProfile}
                onDisconnect={() => {
                  handlePlatformConnect(tiktokPlatform.name, tiktokPlatform.status)
                  setTiktokProfile(null)
                }}
                className="w-full max-w-lg"
              />
            )
          }

          // Carte de connexion TikTok classique
          return (
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 w-full max-w-md">
              <CardHeader className="text-center pb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 blur-lg opacity-20 rounded-full"></div>
                  <Icon className={`w-16 h-16 mx-auto relative z-10 ${tiktokPlatform.color}`} />
                </div>
                <CardTitle className="text-white text-2xl font-bold">{tiktokPlatform.name}</CardTitle>
                <p className="text-slate-400 text-sm">Primary Content Platform</p>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-white">{tiktokPlatform.followers}</div>
                    <div className="text-slate-400 text-sm">Followers</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-white">{tiktokPlatform.engagement}</div>
                    <div className="text-slate-400 text-sm">Engagement</div>
                  </div>
                </div>
                <Button
                  className={
                    tiktokPlatform.status === "connected"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full"
                      : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white w-full"
                  }
                  onClick={() =>
                    handlePlatformConnect(tiktokPlatform.name, tiktokPlatform.status)
                  }
                >
                  {tiktokPlatform.status === "connected" ? "✓ Connected" : "Connect Now"}
                </Button>
              </CardContent>
            </Card>
          )
        })()}
      </div>

      {/* Autres Plateformes Secondaires */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Other Platforms</CardTitle>
          <p className="text-slate-400 text-sm">Additional social media connections</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {platformStates
              .filter((p) => p.name !== "TikTok")
              .map((platform, index) => {
                const Icon = iconMap[platform.icon as keyof typeof iconMap]
                return (
                  <div
                    key={index}
                    className="text-center p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${platform.color}`} />
                    <div className="text-white font-medium text-sm">{platform.name}</div>
                    <div className="text-slate-400 text-xs">{platform.followers}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`mt-2 w-full text-xs ${
                        platform.status === "connected"
                          ? "border-green-500 text-green-400 hover:bg-green-500/10"
                          : "border-orange-500 text-orange-400 hover:bg-orange-500/10"
                      }`}
                      onClick={() =>
                        handlePlatformConnect(platform.name, platform.status)
                      }
                    >
                      {platform.status === "connected" ? "Connected" : "Connect"}
                    </Button>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Credentials Configuration */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-400" />
              <CardTitle className="text-white">Credentials Configuration</CardTitle>
            </div>
            <p className="text-slate-400 text-sm">
              Configure your credentials for each platform
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Twitter Username
                </label>
                <Input
                  value={apiConfig.twitter.username}
                  onChange={(e) =>
                    updateApiConfig("twitter", "username", e.target.value)
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Twitter username"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Telegram Channel ID
                </label>
                <Input
                  value={apiConfig.telegram.channelId}
                  onChange={(e) =>
                    updateApiConfig("telegram", "channelId", e.target.value)
                  }
                  placeholder="@your_channel"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  TikTok Username
                </label>
                <Input
                  value={apiConfig.tiktok.username}
                  onChange={(e) =>
                    updateApiConfig("tiktok", "username", e.target.value)
                  }
                  placeholder="@your_username"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  YouTube Channel URL
                </label>
                <Input
                  value={apiConfig.youtube.channelUrl}
                  onChange={(e) =>
                    updateApiConfig("youtube", "channelUrl", e.target.value)
                  }
                  placeholder="https://youtube.com/@your_channel"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Instagram Username
                </label>
                <Input
                  value={apiConfig.instagram.username}
                  onChange={(e) =>
                    updateApiConfig("instagram", "username", e.target.value)
                  }
                  placeholder="@your_username"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Discord Server ID
                </label>
                <Input
                  value={apiConfig.discord.serverId}
                  onChange={(e) =>
                    updateApiConfig("discord", "serverId", e.target.value)
                  }
                  placeholder="Discord server ID"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700 flex-1 sm:flex-none"
                onClick={handleTestConnections}
                disabled={isTestingConnections}
              >
                {isTestingConnections ? "Testing..." : "Test Connections"}
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white flex-1 sm:flex-none"
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
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-400" />
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </div>
            <p className="text-slate-400 text-sm">
              Latest automated actions on your networks
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-white text-sm">{activity.type}</div>
                    <div className="text-slate-400 text-xs">{activity.description}</div>
                    <div className="text-slate-400 text-xs">{activity.time}</div>
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
    </div>
  )
}
