import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, TrendingUp, Star, Crown, Zap } from "lucide-react" 
import { topYappers, mindshareGainers } from "@/data/tweets"
import { UserProfileCard } from "@/components/sections/UserProfileCard"
import { useState, useMemo, useEffect } from "react"
import { fetchLeaderboard } from "@/lib/socialApi"
import type { TikTokProfile } from "@/types/social"

export function TopTweets() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("top")
  const [timeFilter, setTimeFilter] = useState("24H")
  const [showFilters, _] = useState(false)
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

  // Filter yappers based on search term
  const filteredYappers = useMemo(() => {
    if (!searchTerm) return topYappers
    
    return topYappers.filter(yapper => 
      yapper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      yapper.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  // Filter gainers based on search term
  const filteredGainers = useMemo(() => {
    if (!searchTerm) return mindshareGainers
    
    return mindshareGainers.filter(gainer => 
      gainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gainer.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const handleTimeFilterClick = (filter: string) => {
    setTimeFilter(filter)
    // Here you would typically fetch data for the selected time period
    console.log(`Filtering data for: ${filter}`)
  }

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
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Search..." 
              className="pl-10 bg-slate-800 border-slate-700 text-white w-64" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">Category:</span>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={activeTab === "top" ? "default" : "outline"}
                    className={activeTab === "top" ? "bg-cyan-500 text-white" : "border-slate-600 text-slate-300"}
                    onClick={() => setActiveTab("top")}
                  >
                    Top Yappers
                  </Button>
                  <Button 
                    size="sm" 
                    variant={activeTab === "emerging" ? "default" : "outline"}
                    className={activeTab === "emerging" ? "bg-cyan-500 text-white" : "border-slate-600 text-slate-300"}
                    onClick={() => setActiveTab("emerging")}
                  >
                    Emerging
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">Period:</span>
                <div className="flex gap-1">
                  {["24H", "7D", "30D", "All"].map((filter) => (
                    <Button
                      key={filter}
                      size="sm"
                      variant={timeFilter === filter ? "default" : "ghost"}
                      className={`text-xs ${
                        timeFilter === filter 
                          ? "bg-cyan-500 text-white" 
                          : "text-slate-400 hover:text-white"
                      }`}
                      onClick={() => handleTimeFilterClick(filter)}
                    >
                      {filter}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchTerm && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="text-slate-400 text-sm">
              {filteredYappers.length + filteredGainers.length} results for "{searchTerm}"
            </div>
          </CardContent>
        </Card>
      )}

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
              <div className="flex flex-wrap gap-3 pt-4">
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
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="top" className="mt-0">
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
                        {filteredYappers.map((yapper) => (
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
                <Card 
                  key={celebrity.id || index} 
                  className="bg-slate-700/50 border-slate-600 hover:bg-slate-700 cursor-pointer transition-all duration-200 hover:scale-105"
                  onClick={() => {
                    console.log(`Viewing ${celebrity.nickname || celebrity.unique_id} profile`)
                  }}
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
