import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Share, Image } from "lucide-react"
import { SERVER_URL } from "@/config/config"

interface TikTokProfileData {
  user: {
    id: string
    evm_address: string
    role: string
    twitter_id: string
    youtube_id: string | null
    telegram_id: string | null
    tiktok_id: string
    tiktok_account: string
    fan_tokens: any[]
    created_at: string
    updated_at: string
  }
  tiktok_profile: {
    id: string
    unique_id: string
    nickname: string | null
    avatar_url: string | null
    follower_count: number
    rank_score: number
    known_followers_count: number
  }
}

interface TikTokProfileCardProps {
  profileData: TikTokProfileData
  onDisconnect: () => void
  className?: string
}

export function TikTokProfileCard({ profileData, onDisconnect, className }: TikTokProfileCardProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  })

  const { user, tiktok_profile } = profileData

  const handleCopyImage = () => {
    console.log('Copy image functionality')
  }

  const handleShareOnX = () => {
    const text = `Check out my TikTok profile! @${tiktok_profile.unique_id} with ${tiktok_profile.follower_count} followers 🚀`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=https://${SERVER_URL}/profile/${tiktok_profile.unique_id}`
    window.open(url, '_blank')
  }

  return (
    <Card className={`bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-purple-500 text-white text-xs">
            {currentDate} (TikTok Profile)
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Profile Header */}
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-base font-bold">
              {(tiktok_profile.nickname || tiktok_profile.unique_id || 'T').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white mb-1 truncate">
              {tiktok_profile.nickname || tiktok_profile.unique_id}
            </h2>
            <div className="text-slate-400 text-sm mb-2">
              @{tiktok_profile.unique_id}
            </div>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-2 text-xs">
              TikTok Creator
            </Badge>
            
            <div className="text-purple-400 text-base font-bold">
              {tiktok_profile.follower_count.toLocaleString()} Followers
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Rank Score */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-slate-400 text-xs mb-1">Rank Score</div>
                <div className="text-xl font-bold text-purple-400 mb-3">{tiktok_profile.rank_score}</div>
                
                {/* Simple progress visualization */}
                <div className="relative h-8 bg-slate-700 rounded">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-1 bg-slate-600 rounded-full">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all"
                        style={{ width: `${Math.min(tiktok_profile.rank_score * 10, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Known Followers */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-slate-400 text-xs mb-3">Known Followers</div>
                
                {/* Followers grid */}
                <div className="grid grid-cols-5 gap-1 mb-3">
                  {Array.from({ length: Math.min(tiktok_profile.known_followers_count, 15) }, (_, i) => (
                    <Avatar key={i} className="w-4 h-4">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                        {String.fromCharCode(65 + (i % 26))}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                
                <div className="text-slate-400 text-xs">
                  {tiktok_profile.known_followers_count} Known Followers
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Network Visualization */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3">
            <div className="relative h-24 bg-slate-900 rounded overflow-hidden">
              {/* Central node */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Avatar className="w-6 h-6 border-2 border-purple-400">
                  <AvatarFallback className="bg-purple-500 text-white text-xs">
                    {(tiktok_profile.nickname || tiktok_profile.unique_id || 'T').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* Connection nodes */}
              {Array.from({ length: Math.min(tiktok_profile.known_followers_count, 12) }, (_, i) => {
                const angle = (i * 360) / Math.min(tiktok_profile.known_followers_count, 12)
                const radius = 35
                const x = 50 + radius * Math.cos(angle * Math.PI / 180)
                const y = 50 + radius * Math.sin(angle * Math.PI / 180)
                
                return (
                  <div key={i}>
                    {/* Connection line */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <line
                        x1="50%"
                        y1="50%"
                        x2={`${x}%`}
                        y2={`${y}%`}
                        stroke="rgb(168, 85, 247)"
                        strokeWidth="1"
                        opacity="0.6"
                      />
                    </svg>
                    
                    {/* Node */}
                    <Avatar 
                      className="w-3 h-3 absolute"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <AvatarFallback className="bg-pink-500 text-white text-xs">
                        {String.fromCharCode(65 + i)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Footer with actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
          <div className="flex items-center gap-1">
            <Button 
              size="sm" 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs px-2"
              onClick={handleCopyImage}
            >
              <Image className="w-3 h-3 mr-1" />
              Image
            </Button>
            <Button 
              size="sm" 
              className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-2"
              onClick={handleShareOnX}
            >
              <Share className="w-3 h-3 mr-1" />
              Share
            </Button>
          </div>
          <Button
            size="sm"
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white text-xs px-3"
            onClick={onDisconnect}
          >
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}