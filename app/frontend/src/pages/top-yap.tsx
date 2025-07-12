import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TrendingUp, Star } from "lucide-react" 

import { useState, useEffect } from "react"
import { fetchLeaderboard } from "@/lib/socialApi"
import type { TikTokProfile } from "@/types/social"

export function TopTweets() {
  const [celebrities, setCelebrities] = useState<TikTokProfile[]>([])
  const [loadingCelebrities, setLoadingCelebrities] = useState(true)

  // Fetch celebrities from API
  useEffect(() => {
    const loadCelebrities = async () => {
      try {
        setLoadingCelebrities(true)
        const data = await fetchLeaderboard()
        setCelebrities(data.profiles)
      } catch (error) {
        console.error("Failed to load celebrities:", error)
      } finally {
        setLoadingCelebrities(false)
      }
    }
    loadCelebrities()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Yaps</h1>
          <p className="text-slate-400 mt-2">
            Discover the best accounts and content on CT.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Card className="flex-1 bg-slate-800 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <span className="text-2xl font-bold text-white">0</span>
            </div>
            <div className="text-slate-400 text-sm mb-1">Total Yaps</div>
            <div className="text-slate-400 text-xs">0 (24h Change)</div>
          </CardContent>
        </Card>
        <Card className="flex-1 bg-slate-800 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <span className="text-2xl font-bold text-white">0</span>
            </div>
            <div className="text-slate-400 text-sm mb-1">Earned Yaps</div>
            <div className="text-slate-400 text-xs">0 (24h Change)</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Celebrities - Full Width */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <CardTitle className="text-white text-2xl">Active Celebrities</CardTitle>
              <p className="text-slate-400 text-base">TikTok influencers and content creators</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loadingCelebrities ? (
            <div className="text-center py-12 text-slate-400">
              <div className="animate-spin w-8 h-8 border-2 border-slate-600 border-t-orange-500 rounded-full mx-auto mb-4"></div>
              <div className="text-lg">Loading celebrities...</div>
            </div>
          ) : celebrities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {celebrities.map((celebrity, index) => (
                <a
                  href={`https://www.tiktok.com/@${celebrity.unique_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={celebrity.id || index}
                  className="block"
                >
                  <Card 
                    className="bg-slate-700/50 border-slate-600 hover:bg-slate-700 cursor-pointer transition-all duration-200 hover:scale-105"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-orange-500 text-white text-sm font-medium">
                            {(celebrity.nickname || celebrity.unique_id)
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium text-base truncate hover:text-orange-400 transition-colors">
                            {celebrity.nickname || celebrity.unique_id}
                          </div>
                          <div className="text-slate-400 text-sm truncate">
                            @{celebrity.unique_id}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-slate-400 text-sm">
                          {celebrity.follower_count?.toLocaleString()} followers
                        </div>
                        <Badge className="bg-orange-500 text-white text-sm px-2 py-1">
                          {celebrity.rank_score.toFixed(1)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Star className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <div className="text-lg">No celebrities found</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
