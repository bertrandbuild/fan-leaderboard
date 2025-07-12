import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Trophy, Star, Zap, Clock, TrendingUp, Crown } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import type { LeaderboardResponse, TikTokProfile } from "@/types/social"
import { fetchLeaderboard } from "@/lib/socialApi"
import { activePoolsLeaderboard } from "@/data/dashboard"
import { UserProfileCard } from "@/components/sections/UserProfileCard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { topYappers } from "@/data"

export function LeaderBoard() {
  const [activeStatus, setActiveStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("liquidity")
  const [_, setProfiles] = useState<TikTokProfile[]>([])
  const [activeTab, setActiveTab] = useState("top")
  const [searchTerm, setSearchTerm] = useState("")

  // Use real data from dashboard
  const pools = activePoolsLeaderboard

  // Filter yappers for the leaderboard tab
  const filteredYappers = useMemo(() => {
    if (!searchTerm) return topYappers
    return topYappers.filter(yapper =>
      yapper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      yapper.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

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

  const topPools = filteredPools.slice(0, 3)

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

            {/* Main Content Grid - Leaderboard and Profile */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Leaderboard - Takes 3 columns */}
        <div className="lg:col-span-3">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/20 rounded-xl">
                    <Zap className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl">Yapper Leaderboards</CardTitle>
                    <p className="text-slate-400 text-base">Top performing accounts</p>
                  </div>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                  <TabsList className="bg-slate-700 border-slate-600 grid w-full grid-cols-3 sm:w-auto">
                    <TabsTrigger value="top" className="text-sm py-2 px-4">Top Yappers</TabsTrigger>
                    <TabsTrigger value="emerging" className="text-sm py-2 px-4">Emerging</TabsTrigger>
                    <TabsTrigger value="all" className="text-sm py-2 px-4">All</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              {/* <div className="flex flex-wrap gap-3 pt-4">
                {["24H", "48H", "7D", "30D", "3M", "6M", "12M", "All"].map((filter) => (
                  <Button
                    key={filter}
                    variant={timeFilter === filter ? "default" : "outline"}
                    size="sm"
                    className={`text-sm px-4 py-2 ${
                      timeFilter === filter 
                        ? "bg-cyan-500 text-white hover:bg-cyan-600" 
                        : "border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700"
                    }`}
                    onClick={() => handleTimeFilterClick(filter)}
                  >
                    {filter}
                  </Button>
                ))}
              </div> */}
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="top" className="mt-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input 
                        placeholder="Search yappers..." 
                        className="pl-10 bg-slate-800 border-slate-700 text-white w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-400 w-20 text-base">Rank</TableHead>
                          <TableHead className="text-slate-400 min-w-[280px] text-base">Name</TableHead>
                          <TableHead className="text-slate-400 text-center w-32 text-base">Total Yaps</TableHead>
                          <TableHead className="text-slate-400 text-center w-32 text-base">Earned Yaps</TableHead>
                          <TableHead className="text-slate-400 text-center w-40 text-base">Smart Followers</TableHead>
                          <TableHead className="text-slate-400 text-center w-32 text-base">Followers</TableHead>
                          <TableHead className="text-slate-400 text-center w-28 text-base">Smart %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredYappers.map((yapper: any) => (
                          <TableRow key={yapper.rank} className="border-slate-700 hover:bg-slate-700/50">
                            <TableCell className="py-5">
                              <div className="flex items-center gap-2">
                                {yapper.rank <= 3 && (
                                  <Crown className={`w-5 h-5 ${
                                    yapper.rank === 1 ? 'text-yellow-400' : 
                                    yapper.rank === 2 ? 'text-slate-300' : 
                                    'text-orange-400'
                                  }`} />
                                )}
                                <span className="text-slate-400 font-medium text-base">{yapper.rank}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-5">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback className="bg-cyan-500 text-white font-medium text-sm">
                                    {yapper.avatar || yapper.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-white font-medium text-base">{yapper.name}</div>
                                  <div className="text-slate-400 text-sm">{yapper.username}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center py-5">
                              <span className="text-white font-medium text-base">
                                {yapper.totalYaps === 0 ? '-' : yapper.totalYaps}
                              </span>
                            </TableCell>
                            <TableCell className="text-center py-5">
                              <span className="text-white font-medium text-base">
                                {yapper.earnedYaps === 0 ? '-' : yapper.earnedYaps}
                              </span>
                            </TableCell>
                            <TableCell className="text-center py-5">
                              <span className="text-cyan-400 font-medium text-base">
                                {yapper.smartFollowers.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell className="text-center py-5">
                              <span className="text-white font-medium text-base">
                                {yapper.followers.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell className="text-center py-5">
                              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-sm px-3 py-1">
                                {yapper.smartPercentage.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="emerging" className="mt-0">
                  <div className="text-center py-16 text-slate-400">
                    <div className="p-6 bg-slate-700/50 rounded-xl inline-block">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                      <div className="text-lg">Data for emerging yappers coming soon...</div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="all" className="mt-0">
                  <div className="text-center py-16 text-slate-400">
                    <div className="p-6 bg-slate-700/50 rounded-xl inline-block">
                      <Zap className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                      <div className="text-lg">All yappers data coming soon...</div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Profile */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <UserProfileCard />
          </div>
        </div>
      </div>
    </div>
  )
}
