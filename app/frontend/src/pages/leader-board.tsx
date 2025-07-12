import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Trophy, Star, Zap, Clock, Eye, ChevronDown, ChevronUp } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import type { LeaderboardResponse, TikTokProfile } from "@/types/social"
import { fetchLeaderboard } from "@/lib/socialApi"
import { activePoolsLeaderboard, poolInternalRanking } from "@/data/dashboard"

export function LeaderBoard() {
  const [activeStatus, setActiveStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPool, setSelectedPool] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("liquidity")
  const [userSortBy, setUserSortBy] = useState("points")
  const [profiles, setProfiles] = useState<TikTokProfile[]>([])

  // Use real data from dashboard
  const pools = activePoolsLeaderboard
  const users = poolInternalRanking

  /* 
    ✅ TikTok Leaderboard Integration Status: CONNECTED
    - Successfully using real backend API via fetchLeaderboard()
    - Endpoint: GET /api/social/leaderboard 
    - Data flows from backend to TikTok Leaderboard section
    - Accessible via sidebar navigation "Leaderboard" link
    
    ❌ Pool/Liquidity Data Integration Status: MOCK DATA
    - Pool data (activePoolsLeaderboard, poolInternalRanking) still uses mock data
    - No backend endpoints available for pool/liquidity management
    - Required endpoints: GET /api/pools, GET /api/pools/:id/rankings
    - See FRONTEND_BACKEND_INTEGRATION_AUDIT.md for details
  */
  useEffect(() => {
    fetchLeaderboard()
      .then((data: LeaderboardResponse) => setProfiles(data.profiles))
      .catch((err) => console.error(err))
  }, [])

  // Filter and search pools
  const filteredPools = useMemo(() => {
    let filteredPools = activeStatus === "all" ? pools : pools.filter(pool => pool.status === activeStatus)
    
    if (searchQuery) {
      filteredPools = filteredPools.filter(pool => 
        pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.club.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Sort pools
    return filteredPools.sort((a, b) => {
      switch (sortBy) {
        case "participants":
          return b.participants - a.participants
        case "rewards":
          return b.rewards - a.rewards
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return b.totalLiquidity - a.totalLiquidity
      }
    })
  }, [activeStatus, searchQuery, sortBy, pools])

  // Filter and search users for selected pool
  const filteredUsers = useMemo(() => {
    let filteredUsers = users // In a real app, this would filter by selectedPool
    
    // Sort users
    return filteredUsers.sort((a, b) => {
      switch (userSortBy) {
        case "yaps":
          return b.yaps - a.yaps
        case "username":
          return a.username.localeCompare(b.username)
        case "position":
          return a.position - b.position
        default:
          return b.points - a.points
      }
    })
  }, [selectedPool, userSortBy, users])

  const topPools = filteredPools.slice(0, 3)

  const handlePoolToggle = (poolId: string) => {
    setSelectedPool(selectedPool === poolId ? null : poolId)
  }

  return (
    <div className="space-y-6 w-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Pool Management</h1>
          <p className="text-slate-400 mt-1 md:mt-2 text-sm md:text-base">Manage liquidity pools and view internal rankings</p>
        </div>
        <div className="w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Search pools..." 
              className="pl-10 bg-slate-800 border-slate-700 text-white w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TikTok Leaderboard */}
      {profiles.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">TikTok Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profiles.map((p, idx) => (
                <div key={p.id} className="flex justify-between text-sm text-white">
                  <span>
                    {idx + 1}. {p.nickname || p.unique_id}
                  </span>
                  <span className="text-orange-400">{p.rank_score.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* STATUS BUTTONS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setActiveStatus("all")} className={activeStatus === "all" ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}>
            <Star className="w-4 h-4 mr-2" />All
          </Button>
          <Button onClick={() => setActiveStatus("Active")} className={activeStatus === "Active" ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}>
            <Zap className="w-4 h-4 mr-2" />Active
          </Button>
          <Button onClick={() => setActiveStatus("Ending Soon")} className={activeStatus === "Ending Soon" ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}>
            <Clock className="w-4 h-4 mr-2" />Ending Soon
          </Button>
          <Button onClick={() => setActiveStatus("Finished")} className={activeStatus === "Finished" ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}>
            <Trophy className="w-4 h-4 mr-2" />Finished
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-slate-300 text-sm font-medium">Sort by:</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="liquidity">Liquidity</SelectItem>
              <SelectItem value="participants">Participants</SelectItem>
              <SelectItem value="rewards">Rewards</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* PODIUM - Fixed for 1-3 pools */}
      {topPools.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-center w-full mb-8 gap-4">
          {topPools.length === 1 ? (
            // Single pool - centered
            <Card className="w-full max-w-xs bg-slate-800 border-2 border-emerald-400 shadow-lg">
              <CardContent className="flex flex-col items-center p-4 md:p-6">
                <div className="w-12 md:w-16 h-12 md:h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xl md:text-2xl mb-2">1</div>
                <div className="text-white font-bold text-lg md:text-xl text-center">{topPools[0].name}</div>
                <div className="text-emerald-300 text-sm md:text-base font-semibold">${(topPools[0].totalLiquidity / 1000).toFixed(0)}K</div>
                <Badge className={`mt-2 ${topPools[0].status === 'Active' ? 'bg-green-500' : topPools[0].status === 'Ending Soon' ? 'bg-orange-500' : 'bg-slate-500'} text-white`}>
                  {topPools[0].status}
                </Badge>
              </CardContent>
            </Card>
          ) : topPools.length === 2 ? (
            // Two pools - side by side
            <>
              <Card className="flex-1 max-w-xs bg-slate-800 border-2 border-emerald-400 shadow-lg">
                <CardContent className="flex flex-col items-center p-4 md:p-6">
                  <div className="w-12 md:w-16 h-12 md:h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xl md:text-2xl mb-2">1</div>
                  <div className="text-white font-bold text-lg md:text-xl text-center">{topPools[0].name}</div>
                  <div className="text-emerald-300 text-sm md:text-base font-semibold">${(topPools[0].totalLiquidity / 1000).toFixed(0)}K</div>
                  <Badge className={`mt-2 ${topPools[0].status === 'Active' ? 'bg-green-500' : topPools[0].status === 'Ending Soon' ? 'bg-orange-500' : 'bg-slate-500'} text-white`}>
                    {topPools[0].status}
                  </Badge>
                </CardContent>
              </Card>
              <Card className="flex-1 max-w-xs bg-slate-800 border-slate-700">
                <CardContent className="flex flex-col items-center p-4 md:p-6">
                  <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg md:text-xl mb-2">2</div>
                  <div className="text-white font-medium text-center text-base md:text-lg">{topPools[1].name}</div>
                  <div className="text-slate-400 text-xs md:text-sm">${(topPools[1].totalLiquidity / 1000).toFixed(0)}K</div>
                  <Badge className={`mt-2 ${topPools[1].status === 'Active' ? 'bg-green-500' : topPools[1].status === 'Ending Soon' ? 'bg-orange-500' : 'bg-slate-500'} text-white`}>
                    {topPools[1].status}
                  </Badge>
                </CardContent>
              </Card>
            </>
          ) : (
            // Three pools - traditional podium
            <>
              {/* 2nd */}
              <Card className="flex-1 max-w-xs bg-slate-800 border-slate-700 scale-90 z-10">
                <CardContent className="flex flex-col items-center p-2 md:p-4">
                  <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg md:text-xl mb-2">2</div>
                  <div className="text-white font-medium text-center text-base md:text-lg">{topPools[1].name}</div>
                  <div className="text-slate-400 text-xs md:text-sm">${(topPools[1].totalLiquidity / 1000).toFixed(0)}K</div>
                  <Badge className={`mt-2 ${topPools[1].status === 'Active' ? 'bg-green-500' : topPools[1].status === 'Ending Soon' ? 'bg-orange-500' : 'bg-slate-500'} text-white`}>
                    {topPools[1].status}
                  </Badge>
                </CardContent>
              </Card>
              {/* 1st */}
              <Card className="flex-1 max-w-xs bg-slate-800 border-2 border-emerald-400 scale-110 z-20 shadow-lg">
                <CardContent className="flex flex-col items-center p-3 md:p-6">
                  <div className="w-12 md:w-16 h-12 md:h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xl md:text-2xl mb-2">1</div>
                  <div className="text-white font-bold text-lg md:text-2xl text-center">{topPools[0].name}</div>
                  <div className="text-emerald-300 text-sm md:text-base font-semibold">${(topPools[0].totalLiquidity / 1000).toFixed(0)}K</div>
                  <Badge className={`mt-2 ${topPools[0].status === 'Active' ? 'bg-green-500' : topPools[0].status === 'Ending Soon' ? 'bg-orange-500' : 'bg-slate-500'} text-white`}>
                    {topPools[0].status}
                  </Badge>
                </CardContent>
              </Card>
              {/* 3rd */}
              <Card className="flex-1 max-w-xs bg-slate-800 border-slate-700 scale-90 z-10">
                <CardContent className="flex flex-col items-center p-2 md:p-4">
                  <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-lg md:text-xl mb-2">3</div>
                  <div className="text-white font-medium text-center text-base md:text-lg">{topPools[2].name}</div>
                  <div className="text-slate-400 text-xs md:text-sm">${(topPools[2].totalLiquidity / 1000).toFixed(0)}K</div>
                  <Badge className={`mt-2 ${topPools[2].status === 'Active' ? 'bg-green-500' : topPools[2].status === 'Ending Soon' ? 'bg-orange-500' : 'bg-slate-500'} text-white`}>
                    {topPools[2].status}
                  </Badge>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* POOLS LIST */}
      <Card className="bg-slate-800 border-slate-700 w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="text-white">Liquidity Pools ({filteredPools.length})</CardTitle>
            <Badge className="bg-cyan-500 text-white">
              {activeStatus === "all" ? "All Status" : activeStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPools.map((pool, index) => (
              <div key={pool.id} className="space-y-4">
                {/* Pool Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors gap-2">
                  <div className="flex items-center gap-2 md:gap-4 flex-1">
                    <div className="text-slate-400 font-medium w-8 text-center text-lg md:text-xl">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-base md:text-lg">{pool.name}</div>
                      <div className="text-slate-400 text-xs md:text-sm flex items-center gap-2">
                        <span>{pool.club}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(pool.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-6 text-right">
                    <div>
                      <div className="text-emerald-400 font-medium text-base md:text-lg">${(pool.totalLiquidity / 1000).toFixed(0)}K</div>
                      <div className="text-slate-400 text-xs md:text-sm">liquidity</div>
                    </div>
                    <div>
                      <div className="text-cyan-400 font-medium text-base md:text-lg">{pool.participants}</div>
                      <div className="text-slate-400 text-xs md:text-sm">participants</div>
                    </div>
                    <div>
                      <div className="text-yellow-400 font-medium text-base md:text-lg">${(pool.rewards / 1000).toFixed(0)}K</div>
                      <div className="text-slate-400 text-xs md:text-sm">rewards</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={`${pool.status === 'Active' ? 'bg-green-600' : pool.status === 'Ending Soon' ? 'bg-orange-600' : 'bg-slate-600'} text-white text-xs md:text-sm`}>
                        {pool.status}
                      </Badge>
                      <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                        {pool.change}
                      </Badge>
                    </div>
                    <Button 
                      onClick={() => handlePoolToggle(pool.id)}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-600"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {selectedPool === pool.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Pool Details - Expanded */}
                {selectedPool === pool.id && (
                  <div className="ml-8 p-4 bg-slate-800 rounded-lg border-l-4 border-emerald-400">
                    <div className="space-y-6">
                      {/* Pool Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg md:text-xl font-bold text-emerald-400">${(pool.totalLiquidity / 1000).toFixed(0)}K</div>
                          <div className="text-slate-400 text-xs md:text-sm">Total Liquidity</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg md:text-xl font-bold text-cyan-400">{pool.participants}</div>
                          <div className="text-slate-400 text-xs md:text-sm">Participants</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg md:text-xl font-bold text-yellow-400">${(pool.rewards / 1000).toFixed(0)}K</div>
                          <div className="text-slate-400 text-xs md:text-sm">Rewards</div>
                        </div>
                        <div className="text-center">
                          <Badge className={`${pool.status === 'Active' ? 'bg-green-500' : pool.status === 'Ending Soon' ? 'bg-orange-500' : 'bg-slate-500'} text-white text-sm`}>
                            {pool.status}
                          </Badge>
                          <div className="text-slate-400 text-xs md:text-sm mt-1">Status</div>
                        </div>
                      </div>

                      {/* Internal Ranking */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-white font-medium text-lg">Internal Ranking</h3>
                          <Select value={userSortBy} onValueChange={setUserSortBy}>
                            <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="points">Points</SelectItem>
                              <SelectItem value="yaps">Yaps</SelectItem>
                              <SelectItem value="position">Position</SelectItem>
                              <SelectItem value="username">Username</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {filteredUsers.slice(0, 10).map((user) => (
                            <div key={user.userId} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="text-slate-400 font-medium w-6 text-center">
                                  #{user.position}
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium text-sm">
                                  {user.avatar || user.username.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-white font-medium">{user.username}</div>
                                  <div className="text-slate-400 text-sm">@{user.username.toLowerCase()}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <div className="text-white font-medium">{user.points.toLocaleString()}</div>
                                  <div className="text-slate-400 text-xs">points</div>
                                </div>
                                <div>
                                  <div className="text-cyan-400 font-medium">{user.yaps}</div>
                                  <div className="text-slate-400 text-xs">yaps</div>
                                </div>
                                <Badge variant="outline" className={`border-slate-600 text-xs ${parseInt(user.change) > 0 ? 'text-green-400' : parseInt(user.change) < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                                  {user.change}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
