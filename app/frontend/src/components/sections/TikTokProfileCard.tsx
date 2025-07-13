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
    // À implémenter
    console.log('Copy image functionality')
  }

  const handleShareOnX = () => {
    const text = `Check out my TikTok profile! @${tiktok_profile.unique_id} with ${tiktok_profile.follower_count} followers 🚀`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=https://${SERVER_URL}/profile/${tiktok_profile.unique_id}`
    window.open(url, '_blank')
  }

  return (
    <Card className={`bg-gradient-to-br from-purple-600/10 to-pink-500/10 border-purple-500/40 shadow-2xl ${className}`}>
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <Badge className="bg-purple-600 text-white text-xs font-medium rounded-full px-2 py-1">
            TikTok Profile · {currentDate}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex flex-col items-center">
        {/* Avatar et nom centrés */}
        <div className="flex flex-col items-center gap-2 mb-3">
          <Avatar className="w-20 h-20 border-4 border-purple-500 shadow-xl">
            {tiktok_profile.avatar_url ? (
              <img
                src={tiktok_profile.avatar_url}
                alt={tiktok_profile.nickname || tiktok_profile.unique_id}
                className="object-cover w-full h-full rounded-full"
              />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-500 text-white text-3xl font-bold">
                {(tiktok_profile.nickname || tiktok_profile.unique_id || 'T').charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="text-center">
            <div className="text-lg font-extrabold text-white truncate">
              {tiktok_profile.nickname || tiktok_profile.unique_id}
            </div>
            <div className="text-purple-400 text-sm mb-1 font-medium">
              @{tiktok_profile.unique_id}
            </div>
            <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30 text-xs mb-1">
              TikTok Creator
            </Badge>
          </div>
        </div>
        
        {/* Statistiques principales */}
        <div className="flex justify-center gap-8 mb-4">
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-1">Followers</span>
            <span className="text-xl font-bold text-purple-400">{tiktok_profile.follower_count.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-1">Rank Score</span>
            <span className="text-xl font-bold text-pink-400">{tiktok_profile.rank_score}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-1">Known Followers</span>
            <span className="text-xl font-bold text-slate-200">{tiktok_profile.known_followers_count}</span>
          </div>
        </div>

        {/* Progress bar Rank */}
        <div className="w-full mb-4">
          <div className="h-2 rounded bg-slate-700 w-full relative overflow-hidden">
            <div
              className="h-full rounded bg-gradient-to-r from-purple-400 to-pink-400 transition-all"
              style={{ width: `${Math.min(tiktok_profile.rank_score * 10, 100)}%` }}
            />
          </div>
        </div>

        {/* Mini visualisation du réseau */}
        <div className="relative h-20 w-full mb-5 flex items-center justify-center">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Avatar className="w-10 h-10 border-2 border-purple-400 shadow">
              <AvatarFallback className="bg-purple-600 text-white text-xl">
                {(tiktok_profile.nickname || tiktok_profile.unique_id || 'T').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          {/* Nœuds satellites */}
          {Array.from({ length: Math.min(tiktok_profile.known_followers_count, 8) }, (_, i) => {
            const angle = (i * 360) / 8
            const radius = 36
            const x = 50 + radius * Math.cos(angle * Math.PI / 180)
            const y = 50 + radius * Math.sin(angle * Math.PI / 180)
            return (
              <Avatar
                key={i}
                className="w-4 h-4 absolute"
                style={{
                  left: `calc(${x}% - 8px)`,
                  top: `calc(${y}% - 8px)`,
                  transform: 'none'
                }}
              >
                <AvatarFallback className="bg-pink-500 text-white text-xs">
                  {String.fromCharCode(65 + i)}
                </AvatarFallback>
              </Avatar>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center w-full mt-2">
          <div className="flex gap-2">
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
