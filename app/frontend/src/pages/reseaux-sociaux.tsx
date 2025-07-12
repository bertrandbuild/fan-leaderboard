import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Twitter,
  MessageSquare,
  Youtube,
  Instagram,
  Settings,
  Link,
  Clock,
} from "lucide-react";
import {
  socialPlatforms,
  crossPlatformActions,
  recentActivity,
  defaultAPIConfiguration,
  ConnectedAccount,
} from "@/data/social-media";
import { CredentialsModal } from "@/components/ui/CredentialsModal";
import { useState, useEffect } from "react";

export function ReseauxSociaux() {
  const [apiConfig, setApiConfig] = useState(defaultAPIConfiguration);
  const [isTestingConnections, setIsTestingConnections] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionResults, setConnectionResults] = useState<any>(null);
  const [modalState, setModalState] = useState({ isOpen: false, platform: "" });
  const [platformStates, setPlatformStates] = useState(socialPlatforms);
  const [accountStates, setAccountStates] = useState<ConnectedAccount[]>([]);
  // Nouvel état pour la connexion visuelle
  const [connectionStatus, setConnectionStatus] = useState<
    Record<string, boolean>
  >({
    Twitter: true,
    Telegram: true,
    YouTube: false,
    Instagram: false,
    Discord: false,
    TikTok: false,
  });

  // Icon mapping for dynamic icons
  const iconMap = {
    Twitter,
    MessageSquare,
    Youtube,
    Instagram,
    Discord: MessageSquare, // fallback
    Tiktok: Youtube, // fallback
  };

  // Check if platform has valid credentials
  const hasValidCredentials = (platformName: string) => {
    const platform = platformName.toLowerCase();
    switch (platform) {
      case "twitter":
        return !!apiConfig.twitter.username?.trim();
      case "telegram":
        return !!apiConfig.telegram.channelId?.trim();
      case "youtube":
        return !!apiConfig.youtube.channelUrl?.trim();
      case "instagram":
        return !!apiConfig.instagram.username?.trim();
      case "discord":
        return !!apiConfig.discord.serverId?.trim();
      case "tiktok":
        return !!apiConfig.tiktok.username?.trim();
      default:
        return false;
    }
  };

  // Update platform status based on credentials and connectionStatus
  useEffect(() => {
    setPlatformStates((prev) =>
      prev.map((platform) => {
        const connected =
          connectionStatus[platform.name] && hasValidCredentials(platform.name);
        return {
          ...platform,
          status: connected ? "connected" : "disconnected",
          color: connected ? "text-green-400" : "text-red-400",
        };
      })
    );

    setAccountStates((prev: ConnectedAccount[]) =>
      prev.map((account: ConnectedAccount) => {
        const connected =
          connectionStatus[account.platform] &&
          hasValidCredentials(account.platform);
        return {
          ...account,
          username: connected
            ? getDisplayUsername(account.platform)
            : "Not connected",
          color: connected ? "text-green-400" : "text-red-400",
        };
      })
    );
  }, [apiConfig, connectionStatus]);

  const getDisplayUsername = (platformName: string) => {
    const platform = platformName.toLowerCase();
    switch (platform) {
      case "twitter":
        return apiConfig.twitter.username || "Not connected";
      case "telegram":
        return apiConfig.telegram.channelId || "Not connected";
      case "youtube":
        return apiConfig.youtube.channelUrl ? "Connected" : "Not connected";
      case "instagram":
        return apiConfig.instagram.username || "Not connected";
      case "discord":
        return apiConfig.discord.serverId || "Not connected";
      case "tiktok":
        return apiConfig.tiktok.username || "Not connected";
      default:
        return "Not connected";
    }
  };

  const handlePlatformConnect = (platformName: string, status: string) => {
    if (status === "connected") {
      // Déconnecter visuellement seulement
      setConnectionStatus((prev) => ({ ...prev, [platformName]: false }));
      console.log(`Disconnecting from ${platformName}`);
    } else {
      // Connect logic - open modal
      setModalState({ isOpen: true, platform: platformName });
    }
  };

  const handleAccountConnection = (platform: string, isConnected: boolean) => {
    if (isConnected) {
      // Déconnecter visuellement seulement
      setConnectionStatus((prev) => ({ ...prev, [platform]: false }));
      console.log(`Disconnecting ${platform} account`);
    } else {
      // Connect account - open modal
      setModalState({ isOpen: true, platform });
    }
  };

  const handleCredentialsSave = (
    platform: string,
    credentials: Record<string, string>
  ) => {
    // Update API config with new credentials
    Object.entries(credentials).forEach(([key, value]) => {
      updateApiConfig(platform, key, value);
    });
    // Si credentials valides, on connecte visuellement
    setConnectionStatus((prev) => ({ ...prev, [capitalize(platform)]: true }));
    console.log(`Credentials saved for ${platform}:`, credentials);
  };

  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const getCurrentCredentials = (platform: string): Record<string, string> => {
    const platformKey = platform.toLowerCase();
    switch (platformKey) {
      case "twitter":
        return { username: apiConfig.twitter.username || "" };
      case "telegram":
        return { channelId: apiConfig.telegram.channelId || "" };
      case "youtube":
        return { channelUrl: apiConfig.youtube.channelUrl || "" };
      case "instagram":
        return { username: apiConfig.instagram.username || "" };
      default:
        return {};
    }
  };

  const handleCrossPlatformToggle = (actionId: number, enabled: boolean) => {
    console.log(`Toggling cross-platform action ${actionId} to ${enabled}`);
    // API call to update action status
  };

  const handleTestConnections = async () => {
    setIsTestingConnections(true);
    try {
      // Simulate API call to test connections
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setConnectionResults({
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
      });
    } catch (error) {
      console.error("Error testing connections:", error);
    } finally {
      setIsTestingConnections(false);
    }
  };

  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    try {
      // Simulate API call to save configuration
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Configuration saved:", apiConfig);
      // Show success notification
    } catch (error) {
      console.error("Error saving configuration:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateApiConfig = (platform: string, field: string, value: string) => {
    setApiConfig((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  // Display only TikTok card for now
  const sortedPlatforms = platformStates.filter((p) => p.name === "TikTok");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Social Media Integration
        </h1>
        <p className="text-muted-foreground mt-2">
          Connect and manage your Twitter, Telegram, YouTube and Instagram
          accounts
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
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              Connection Test Results
            </CardTitle>
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
                    <span className="text-foreground text-sm capitalize">
                      {platform}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {result.message}
                    </span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sortedPlatforms.map((platform, index) => {
          const Icon = iconMap[platform.icon as keyof typeof iconMap];
          return (
            <Card key={index} className="bg-card border-border">
              <CardHeader className="text-center">
                <Icon className={`w-12 h-12 mx-auto ${platform.color}`} />
                <CardTitle className="text-foreground">
                  {platform.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <div className="text-2xl font-bold text-foreground">
                  {platform.followers}
                </div>
                <div className="text-muted-foreground text-sm">
                  {platform.engagement}
                </div>
                <Button
                  className={
                    platform.status === "connected"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-orange-500 hover:bg-orange-600"
                  }
                  size="sm"
                  onClick={() =>
                    handlePlatformConnect(platform.name, platform.status)
                  }
                >
                  {platform.status === "connected" ? "Connected" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Connections */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-foreground">
                Account Connections
              </CardTitle>
            </div>
            <p className="text-muted-foreground text-sm">
              Manage your social media connections
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {accountStates.map((account: ConnectedAccount, index: number) => {
              const Icon = iconMap[account.icon as keyof typeof iconMap];
              const isConnected = account.username !== "Not connected";
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${account.color}`} />
                    <div>
                      <div className="text-foreground font-medium">
                        {account.platform}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {account.username}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      !isConnected
                        ? "border-red-600 text-red-400 hover:bg-red-600/10"
                        : "border-border text-muted-foreground hover:bg-accent"
                    }
                    onClick={() =>
                      handleAccountConnection(account.platform, isConnected)
                    }
                  >
                    {!isConnected ? "Connect" : "Disconnect"}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Cross-Platform Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-green-400" />
              <CardTitle className="text-foreground">
                Cross-Platform Actions
              </CardTitle>
            </div>
            <p className="text-muted-foreground text-sm">
              Automate actions across platforms
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {crossPlatformActions.map((action, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-foreground font-medium">
                    {action.title}
                  </div>
                  <Switch
                    defaultChecked={action.status === "active"}
                    onCheckedChange={(checked) =>
                      handleCrossPlatformToggle(index, checked)
                    }
                  />
                </div>
                <div className="text-muted-foreground text-sm">
                  {action.description}
                </div>
                <Badge className="mt-2 bg-green-600 text-white text-xs">
                  {action.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* API Configuration Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-400" />
            <CardTitle className="text-foreground">
              Credentials Configuration
            </CardTitle>
          </div>
          <p className="text-muted-foreground text-sm">
            Configure your credentials for each platform
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">
                  Twitter Username
                </label>
                <Input
                  value={apiConfig.twitter.username}
                  onChange={(e) =>
                    updateApiConfig("twitter", "username", e.target.value)
                  }
                  className="bg-muted border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">
                  Telegram Channel ID
                </label>
                <Input
                  value={apiConfig.telegram.channelId}
                  onChange={(e) =>
                    updateApiConfig("telegram", "channelId", e.target.value)
                  }
                  placeholder="@your_channel"
                  className="bg-muted border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">
                  Instagram Username
                </label>
                <Input
                  value={apiConfig.instagram.username}
                  onChange={(e) =>
                    updateApiConfig("instagram", "username", e.target.value)
                  }
                  placeholder="@your_username"
                  className="bg-muted border-border text-foreground"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">
                  YouTube Channel URL
                </label>
                <Input
                  value={apiConfig.youtube.channelUrl}
                  onChange={(e) =>
                    updateApiConfig("youtube", "channelUrl", e.target.value)
                  }
                  placeholder="https://youtube.com/@your_channel"
                  className="bg-muted border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">
                  TikTok Username
                </label>
                <Input
                  value={apiConfig.tiktok.username}
                  onChange={(e) =>
                    updateApiConfig("tiktok", "username", e.target.value)
                  }
                  placeholder="@your_username"
                  className="bg-muted border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">
                  Discord Server ID
                </label>
                <Input
                  value={apiConfig.discord.serverId}
                  onChange={(e) =>
                    updateApiConfig("discord", "serverId", e.target.value)
                  }
                  placeholder="Discord server ID"
                  className="bg-muted border-border text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 justify-end">
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

      {/* Recent Activity */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
          <p className="text-muted-foreground text-sm">
            Latest automated actions on your networks
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-foreground text-sm">{activity.type}</div>
                  <div className="text-muted-foreground text-xs">
                    {activity.description}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {activity.time}
                  </div>
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
  );
}
