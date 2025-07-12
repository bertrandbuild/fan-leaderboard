import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Trophy, Users, MessageSquare, Twitter, Star, Gamepad2, Zap, Car } from "lucide-react"
import { useState, useMemo } from "react"
import { allClubs } from "@/data/clubs"
import { allUsers } from "@/data/users"

export function Classement() {
  const [activeTab, setActiveTab] = useState("global")
  const [activeSport, setActiveSport] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClub, setSelectedClub] = useState("fc-barcelona")
  const [sortBy, setSortBy] = useState("points")
  const [filterRegion, setFilterRegion] = useState("all")
  const [userSortBy, setUserSortBy] = useState("total")
  const [showFilters] = useState(false)

  // Use real data from imported files
  const clubs = allClubs
  const users = allUsers

  // Filter and search clubs
  const filteredClubs = useMemo(() => {
    let filteredClubs = activeSport === "all" ? clubs : clubs.filter(club => club.sport === activeSport)
    
    if (searchQuery && activeTab === "global") {
      filteredClubs = filteredClubs.filter(club => 
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (filterRegion !== "all") {
      filteredClubs = filteredClubs.filter(club => club.region === filterRegion)
    }
    
    // Sort clubs
    return filteredClubs.sort((a, b) => {
      switch (sortBy) {
        case "members":
          return b.stats.members - a.stats.members
        case "engagement":
          return b.stats.engagement - a.stats.engagement
        case "tokens":
          return b.stats.totalActivity - a.stats.totalActivity
        default:
          return b.stats.points - a.stats.points
      }
    })
  }, [activeSport, searchQuery, filterRegion, sortBy, activeTab, clubs])

  // Filter and search users
  const filteredUsers = useMemo(() => {
    let filteredUsers = users.filter(user => user.clubId === selectedClub)
    
    if (searchQuery && activeTab === "interne") {
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.clubName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Sort users
    return filteredUsers.sort((a, b) => {
      switch (userSortBy) {
        case "tokens":
          return b.tokens.amount - a.tokens.amount
        case "points":
          return b.points - a.points
        case "weekly":
          return b.achievements.weeklyActivity - a.achievements.weeklyActivity
        case "monthly":
          return b.achievements.monthlyActivity - a.achievements.monthlyActivity
        default:
          return b.achievements.totalActivity - a.achievements.totalActivity
      }
    })
  }, [selectedClub, searchQuery, activeTab, userSortBy, users])

  const selectedClubData = clubs.find(club => club.id === selectedClub)
  const topClubs = filteredClubs.slice(0, 3)
  const regions = [...new Set(clubs.map(club => club.region))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Ranking System</h1>
          <p className="text-slate-400 mt-2">Global and internal rankings with social media sorting</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Search clubs or users..." 
              className="pl-10 bg-slate-800 border-slate-700 text-white w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Sport Categories */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => setActiveSport("all")}
          className={
            activeSport === "all"
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "bg-slate-700 hover:bg-slate-600 text-slate-300"
          }
        >
          <Star className="w-4 h-4 mr-2" />
          All
        </Button>
        <Button
          onClick={() => setActiveSport("football")}
          className={
            activeSport === "football"
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "bg-slate-700 hover:bg-slate-600 text-slate-300"
          }
        >
          <Trophy className="w-4 h-4 mr-2" />
          Football
        </Button>
        <Button
          onClick={() => setActiveSport("gaming")}
          className={
            activeSport === "gaming"
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "bg-slate-700 hover:bg-slate-600 text-slate-300"
          }
        >
          <Gamepad2 className="w-4 h-4 mr-2" />
          Gaming
        </Button>
        <Button
          onClick={() => setActiveSport("fighting")}
          className={
            activeSport === "fighting"
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "bg-slate-700 hover:bg-slate-600 text-slate-300"
          }
        >
          <Zap className="w-4 h-4 mr-2" />
          Fighting
        </Button>
        <Button
          onClick={() => setActiveSport("motorsport")}
          className={
            activeSport === "motorsport"
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "bg-slate-700 hover:bg-slate-600 text-slate-300"
          }
        >
          <Car className="w-4 h-4 mr-2" />
          Motorsport
        </Button>
        <Button
          onClick={() => setActiveSport("rugby")}
          className={
            activeSport === "rugby"
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "bg-slate-700 hover:bg-slate-600 text-slate-300"
          }
        >
          <Users className="w-4 h-4 mr-2" />
          Rugby
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex gap-4 items-center p-4 bg-slate-800 rounded-lg border border-slate-700">
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">Region</label>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">Sort by</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="points">Points</SelectItem>
                <SelectItem value="members">Members</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="tokens">Tokens</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          onClick={() => setActiveTab("global")}
          className={
            activeTab === "global"
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "bg-slate-700 hover:bg-slate-600 text-slate-300"
          }
        >
          <Trophy className="w-4 h-4 mr-2" />
          Global Ranking
        </Button>
        <Button
          onClick={() => setActiveTab("interne")}
          className={
            activeTab === "interne"
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "bg-slate-700 hover:bg-slate-600 text-slate-300"
          }
        >
          <Users className="w-4 h-4 mr-2" />
          Internal Ranking
        </Button>
      </div>

      {/* Global Ranking */}
      {activeTab === "global" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 3 Podium */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Top 3 Podium
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topClubs.map((club, index) => (
                  <div key={club.id} className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{club.name}</div>
                      <div className="text-slate-400 text-sm">{club.stats.points.toLocaleString()} points</div>
                    </div>
                    <Badge className="bg-orange-500 text-white">
                      {club.sport}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Full Rankings Table */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Global Ranking ({filteredClubs.length} clubs)</CardTitle>
                  <Badge className="bg-cyan-500 text-white">
                    {activeSport === "all" ? "All Sports" : activeSport}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredClubs.map((club, index) => (
                    <div key={club.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="text-slate-400 font-medium w-8 text-center">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium">{club.name}</div>
                          <div className="text-slate-400 text-sm flex items-center gap-2">
                            <span>{club.category}</span>
                            <span>•</span>
                            <span>{club.region}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="text-white font-medium">{club.stats.points.toLocaleString()}</div>
                          <div className="text-slate-400 text-sm">points</div>
                        </div>
                        <div>
                          <div className="text-cyan-400 font-medium">{club.stats.members.toLocaleString()}</div>
                          <div className="text-slate-400 text-sm">members</div>
                        </div>
                        <div>
                          <div className="text-green-400 font-medium">{club.stats.engagement}%</div>
                          <div className="text-slate-400 text-sm">engagement</div>
                        </div>
                        <Badge className="bg-orange-500 text-white">
                          {club.sport}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Internal Ranking */}
      {activeTab === "interne" && (
        <div className="space-y-6">
          {/* Club Selection */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Select Club</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Club</label>
                  <Select value={selectedClub} onValueChange={setSelectedClub}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {clubs.map(club => (
                        <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Sort by</label>
                  <Select value={userSortBy} onValueChange={setUserSortBy}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="total">Total Activity</SelectItem>
                      <SelectItem value="tokens">Tokens</SelectItem>
                      <SelectItem value="points">Points</SelectItem>
                      <SelectItem value="weekly">Weekly Activity</SelectItem>
                      <SelectItem value="monthly">Monthly Activity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Club Stats */}
          {selectedClubData && (
            <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-xl">{selectedClubData.name}</CardTitle>
                <p className="text-slate-400">{selectedClubData.category} • {selectedClubData.region}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{selectedClubData.stats.points.toLocaleString()}</div>
                    <div className="text-slate-400 text-sm">Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{selectedClubData.stats.members.toLocaleString()}</div>
                    <div className="text-slate-400 text-sm">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{selectedClubData.stats.engagement}%</div>
                    <div className="text-slate-400 text-sm">Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">{selectedClubData.stats.totalActivity.toLocaleString()}</div>
                    <div className="text-slate-400 text-sm">Activity</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users Ranking */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Internal Ranking ({filteredUsers.length} users)</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-cyan-500 text-white">
                    {selectedClubData?.name || "Select Club"}
                  </Badge>
                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                    {userSortBy}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-slate-400 font-medium w-8 text-center">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-white font-medium">{user.username}</div>
                        <div className="text-slate-400 text-sm">{user.clubName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <div className="text-white font-medium">{user.points.toLocaleString()}</div>
                        <div className="text-slate-400 text-sm">points</div>
                      </div>
                      <div>
                        <div className="text-cyan-400 font-medium">{user.tokens.amount.toLocaleString()}</div>
                        <div className="text-slate-400 text-sm">tokens</div>
                      </div>
                      <div>
                        <div className="text-green-400 font-medium">{user.achievements.totalActivity.toLocaleString()}</div>
                        <div className="text-slate-400 text-sm">activity</div>
                      </div>
                      <div className="flex gap-1">
                        <Badge className="bg-blue-600 text-white text-xs flex items-center gap-1">
                          <Twitter className="w-3 h-3" />
                          {user.socialMedia.twitter}
                        </Badge>
                        <Badge className="bg-cyan-600 text-white text-xs flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {user.socialMedia.telegram}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
