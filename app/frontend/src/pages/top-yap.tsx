import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Heart, MessageCircle, TrendingUp, Star, Crown, Zap, BarChart3, ArrowUp, ArrowDown, Share } from "lucide-react" 
import { tweets, topYappers, celebrities, mindshareGainers } from "@/data/tweets"
import { UserProfileCard } from "@/components/sections/UserProfileCard"
import { useState, useMemo } from "react"

export function TopTweets() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("top")
  const [timeFilter, setTimeFilter] = useState("24H")
  const [showFilters, _] = useState(false)

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

  const handleSeeYapperArena = () => {
    // Scroll to yapper leaderboards section
    const element = document.getElementById('yapper-leaderboards')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">0</div>
          <div className="text-slate-400 text-sm">Total Yaps</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400 text-xs">0 (24h Change)</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">0</div>
          <div className="text-slate-400 text-sm">Earned Yaps</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400 text-xs">0 &gt;</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">0</div>
          <div className="text-slate-400 text-sm">Referral Yaps</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400 text-xs">0 &gt;</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pre-TGE Mindshare Arena */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <CardTitle className="text-white">Pre-TGE Mindshare Arena</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                    onClick={handleSeeYapperArena}
                  >
                    See Yapper Arena ↓
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Top Gainers Table */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Top Gainer</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-slate-400">Δ Absolute (bps)</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      <span className="text-slate-400">Δ Relative (%)</span>
                    </div>
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Name</TableHead>
                      <TableHead className="text-slate-400 text-center">Current</TableHead>
                      <TableHead className="text-slate-400 text-center">Δ1D</TableHead>
                      <TableHead className="text-slate-400 text-center">Δ7D</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGainers.slice(0, 10).map((gainer, index) => (
                      <TableRow key={index} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full bg-${gainer.color}-500`}></div>
                            <span className="text-white font-medium">{gainer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-white">{gainer.current.toFixed(2)}%</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ArrowUp className="w-3 h-3 text-green-400" />
                            <span className="text-green-400">+{gainer.change1d}bps</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {gainer.change7d > 0 ? (
                              <>
                                <ArrowUp className="w-3 h-3 text-green-400" />
                                <span className="text-green-400">+{gainer.change7d}bps</span>
                              </>
                            ) : (
                              <>
                                <ArrowDown className="w-3 h-3 text-red-400" />
                                <span className="text-red-400">{gainer.change7d}bps</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Top Performers Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {filteredGainers.slice(0, 3).map((top, index) => (
                  <Card key={index} className={`bg-gradient-to-br ${
                    index === 0 ? 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30' :
                    index === 1 ? 'from-red-500/20 to-pink-500/20 border-red-500/30' :
                    'from-orange-500/20 to-red-500/20 border-orange-500/30'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Crown className={`w-4 h-4 ${
                            index === 0 ? 'text-yellow-400' :
                            index === 1 ? 'text-slate-300' :
                            'text-orange-400'
                          }`} />
                          <span className="text-white font-bold">{top.symbol}</span>
                        </div>
                        <Badge className={`${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-red-500' :
                          'bg-orange-500'
                        } text-white`}>
                          {index + 1}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">{top.percentage.toFixed(2)}%</div>
                      <div className="text-xs text-slate-300">
                        +{top.change1d}bps (24h) • +{top.change7d > 0 ? top.change7d : Math.abs(top.change7d)}bps (7d)
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Yapper Leaderboards */}
          <Card className="bg-slate-800 border-slate-700" id="yapper-leaderboards">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <CardTitle className="text-white">Yapper Leaderboards</CardTitle>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                  <TabsList className="bg-slate-700 border-slate-600">
                    <TabsTrigger value="top" className="text-xs">Top Yappers</TabsTrigger>
                    <TabsTrigger value="emerging" className="text-xs">Emerging</TabsTrigger>
                    <TabsTrigger value="chinese" className="text-xs">Chinese</TabsTrigger>
                    <TabsTrigger value="korean" className="text-xs">Korean</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex items-center gap-4 text-xs">
                {["24H", "48H", "7D", "30D", "3M", "6M", "12M", "All"].map((filter) => (
                  <span
                    key={filter}
                    className={`cursor-pointer transition-colors ${
                      timeFilter === filter 
                        ? "text-cyan-400 bg-cyan-500 px-2 py-1 rounded text-white" 
                        : "text-slate-400 hover:text-white"
                    }`}
                    onClick={() => handleTimeFilterClick(filter)}
                  >
                    {filter}
                  </span>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="top">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-400">Rank</TableHead>
                        <TableHead className="text-slate-400">Name</TableHead>
                        <TableHead className="text-slate-400 text-center">Total Yaps</TableHead>
                        <TableHead className="text-slate-400 text-center">Earned Yaps</TableHead>
                        <TableHead className="text-slate-400 text-center">Referral Yaps</TableHead>
                        <TableHead className="text-slate-400 text-center">Smart Followers</TableHead>
                        <TableHead className="text-slate-400 text-center">Followers</TableHead>
                        <TableHead className="text-slate-400 text-center">Smart %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredYappers.map((yapper) => (
                        <TableRow key={yapper.rank} className="border-slate-700 hover:bg-slate-700/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {yapper.rank <= 3 && (
                                <Crown className={`w-4 h-4 ${
                                  yapper.rank === 1 ? 'text-yellow-400' : 
                                  yapper.rank === 2 ? 'text-slate-300' : 
                                  'text-orange-400'
                                }`} />
                              )}
                              <span className="text-slate-400 font-medium">{yapper.rank}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-cyan-500 text-white text-xs font-medium">
                                  {yapper.avatar || yapper.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-white font-medium">{yapper.name}</div>
                                <div className="text-slate-400 text-xs">{yapper.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-white font-medium">
                              {yapper.totalYaps === 0 ? '-' : yapper.totalYaps}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-white font-medium">
                              {yapper.earnedYaps === 0 ? '-' : yapper.earnedYaps}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-white font-medium">
                              {yapper.referralYaps === 0 ? '-' : yapper.referralYaps}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-cyan-400 font-medium">
                              {yapper.smartFollowers.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-white font-medium">
                              {yapper.followers.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                              {yapper.smartPercentage.toFixed(2)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="emerging">
                  <div className="text-center py-8 text-slate-400">
                    Data for emerging yappers coming soon...
                  </div>
                </TabsContent>
                <TabsContent value="chinese">
                  <div className="text-center py-8 text-slate-400">
                    Data for Chinese yappers coming soon...
                  </div>
                </TabsContent>
                <TabsContent value="korean">
                  <div className="text-center py-8 text-slate-400">
                    Data for Korean yappers coming soon...
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* User Profile Card */}
          <UserProfileCard />

          {/* Active Celebrities */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <CardTitle className="text-white">Active Celebrities</CardTitle>
              </div>
              <p className="text-slate-400 text-sm">Personalities boosting tweets</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {celebrities.map((celeb, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                  onClick={() => {
                    console.log(`Viewing ${celeb.name} profile`)
                    // Navigate to celebrity profile or show modal
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-orange-500 text-white text-xs">
                        {celeb.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-white font-medium text-sm hover:text-orange-400 transition-colors">
                        {celeb.name}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {celeb.username} • {celeb.team}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-600 text-white text-xs">Weight: {celeb.weight}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Tweets */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-white">Recent Tweets</CardTitle>
              </div>
              <p className="text-slate-400 text-sm">Latest activities</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {tweets.slice(0, 3).map((tweet, index) => (
                <div key={index} className="border-b border-slate-700 pb-4 last:border-b-0 hover:bg-slate-700/20 p-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-semibold text-sm">{tweet.user.name}</span>
                    <span className="text-slate-400 text-xs">{tweet.time}</span>
                  </div>
                  <p className="text-slate-300 text-sm mb-3 line-clamp-3 cursor-pointer hover:text-white transition-colors">
                    {tweet.content}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-slate-400">
                      <button 
                        className="flex items-center gap-1 hover:text-red-400 transition-colors"
                        onClick={() => {
                          console.log(`Liked tweet by ${tweet.user.name}`)
                          // Handle like action
                        }}
                      >
                        <Heart className="w-3 h-3" />
                        <span>{tweet.engagement.likes.toLocaleString()}</span>
                      </button>
                      <button 
                        className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                        onClick={() => {
                          console.log(`Replying to tweet by ${tweet.user.name}`)
                          // Handle comment action
                        }}
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>{tweet.engagement.comments}</span>
                      </button>
                      <button 
                        className="flex items-center gap-1 hover:text-green-400 transition-colors"
                        onClick={() => {
                          console.log(`Sharing tweet by ${tweet.user.name}`)
                          // Handle share action
                        }}
                      >
                        <Share className="w-3 h-3" />
                        <span>{tweet.engagement.shares}</span>
                      </button>
                    </div>
                    <Badge className="bg-orange-500 text-white text-xs">{tweet.boost}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
