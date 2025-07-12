import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Trophy, Users, MessageSquare, Twitter, Star, Gamepad2, Zap, Car } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import type { LeaderboardResponse, TikTokProfile } from "@/types/social"
import { fetchLeaderboard } from "@/lib/socialApi"
import { allClubs } from "@/data/clubs"
import { allUsers } from "@/data/users"

export function LeaderBoard() {
  const [activeTab, setActiveTab] = useState("global")
  const [activeSport, setActiveSport] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClub, setSelectedClub] = useState("fc-barcelona")
  const [sortBy, setSortBy] = useState("points")
  const [filterRegion, setFilterRegion] = useState("all")
  const [userSortBy, setUserSortBy] = useState("total")
  const [showFilters] = useState(false)
  const [profiles, setProfiles] = useState<TikTokProfile[]>([])

  // Use real data from imported files
  const clubs = allClubs
  const users = allUsers

  useEffect(() => {
    fetchLeaderboard()
      .then((data: LeaderboardResponse) => setProfiles(data.profiles))
      .catch((err) => console.error(err))
  }, [])

  // Synchronise selectedClub avec la catégorie active
  useEffect(() => {
    const filtered = activeSport === "all" ? clubs : clubs.filter(club => club.sport === activeSport)
    if (filtered.length > 0) {
      setSelectedClub(filtered[0].id)
    } else {
      setSelectedClub("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSport])

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
    <div className="space-y-6 w-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Ranking System</h1>
          <p className="text-slate-400 mt-1 md:mt-2 text-sm md:text-base">Global and internal rankings with social media sorting</p>
        </div>
        <div className="w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Search clubs or users..." 
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

      {/* SPORT BUTTONS + TABS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full mb-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setActiveSport("all")} className={activeSport === "all" ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}><Star className="w-4 h-4 mr-2" />All</Button>
          <Button onClick={() => setActiveSport("football")} className={activeSport === "football" ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}><Trophy className="w-4 h-4 mr-2" />Football</Button>
          <Button onClick={() => setActiveSport("gaming")} className={activeSport === "gaming" ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}><Gamepad2 className="w-4 h-4 mr-2" />Gaming</Button>
          <Button onClick={() => setActiveSport("fighting")} className={activeSport === "fighting" ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}><Zap className="w-4 h-4 mr-2" />Fighting</Button>
          <Button onClick={() => setActiveSport("motorsport")} className={activeSport === "motorsport" ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}><Car className="w-4 h-4 mr-2" />Motorsport</Button>
          <Button onClick={() => setActiveSport("rugby")} className={activeSport === "rugby" ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}><Users className="w-4 h-4 mr-2" />Rugby</Button>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button onClick={() => setActiveTab("global")} className={activeTab === "global" ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}><Trophy className="w-4 h-4 mr-2" />Global Ranking</Button>
          <Button onClick={() => setActiveTab("interne")} className={activeTab === "interne" ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}><Users className="w-4 h-4 mr-2" />Internal Ranking</Button>
        </div>
      </div>

      {/* FILTERS */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4 items-center p-4 bg-slate-800 rounded-lg border border-slate-700">
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">Region</label>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-700 border-slate-600">
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
              <SelectTrigger className="w-full sm:w-48 bg-slate-700 border-slate-600">
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

      {/* GLOBAL RANKING */}
      {activeTab === "global" && (
        <>
          {/* PODIUM */}
          <div className="flex flex-col md:flex-row items-center md:justify-center w-full mb-8 gap-4">
            {/* 2nd */}
            {topClubs[1] && (
              <Card className="flex-1 bg-slate-800 border-slate-700 scale-90 z-10">
                <CardContent className="flex flex-col items-center p-2 md:p-4">
                  <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg md:text-xl mb-2">2</div>
                  <div className="text-white font-medium text-center text-base md:text-lg">{topClubs[1].name}</div>
                  <div className="text-slate-400 text-xs md:text-sm">{topClubs[1].stats.points.toLocaleString()} pts</div>
                  <Badge className="bg-orange-500 text-white mt-2">{topClubs[1].sport}</Badge>
                </CardContent>
              </Card>
            )}
            {/* 1st */}
            {topClubs[0] && (
              <Card className="flex-1 bg-slate-800 border-2 border-yellow-400 scale-110 z-20 shadow-lg">
                <CardContent className="flex flex-col items-center p-3 md:p-6">
                  <div className="w-12 md:w-16 h-12 md:h-16 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-xl md:text-2xl mb-2">1</div>
                  <div className="text-white font-bold text-lg md:text-2xl text-center">{topClubs[0].name}</div>
                  <div className="text-yellow-300 text-sm md:text-base font-semibold">{topClubs[0].stats.points.toLocaleString()} pts</div>
                  <Badge className="bg-orange-500 text-white mt-2">{topClubs[0].sport}</Badge>
                </CardContent>
              </Card>
            )}
            {/* 3rd */}
            {topClubs[2] && (
              <Card className="flex-1 bg-slate-800 border-slate-700 scale-90 z-10">
                <CardContent className="flex flex-col items-center p-2 md:p-4">
                  <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-lg md:text-xl mb-2">3</div>
                  <div className="text-white font-medium text-center text-base md:text-lg">{topClubs[2].name}</div>
                  <div className="text-slate-400 text-xs md:text-sm">{topClubs[2].stats.points.toLocaleString()} pts</div>
                  <Badge className="bg-orange-500 text-white mt-2">{topClubs[2].sport}</Badge>
                </CardContent>
              </Card>
            )}
          </div>
          {/* GLOBAL TABLE (card/table hybrid) */}
          <Card className="bg-slate-800 border-slate-700 w-full">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <CardTitle className="text-white">Global Ranking ({filteredClubs.length} clubs)</CardTitle>
                <Badge className="bg-cyan-500 text-white">
                  {activeSport === "all" ? "All Sports" : activeSport}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 md:max-h-96 overflow-y-auto">
                {filteredClubs.map((club, index) => (
                  club.name === "Ultimate Fighting Championship" ? (
                    <Card key={club.id} className="bg-gradient-to-br from-purple-900 via-fuchsia-700 to-slate-800 border-2 border-fuchsia-500 shadow-lg p-2 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full p-0 gap-2">
                        <div className="flex items-center gap-2 md:gap-4">
                          <div className="text-fuchsia-400 font-bold text-lg md:text-2xl">#{index + 1}</div>
                          <div>
                            <div className="text-white font-bold text-base md:text-lg">{club.name}</div>
                            <div className="text-fuchsia-300 text-xs md:text-base flex items-center gap-2">
                              <span>{club.category}</span>
                              <span>•</span>
                              <span>{club.region}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-6 text-right mt-2 sm:mt-0">
                          <div>
                            <div className="text-white font-bold text-base md:text-lg">{club.stats.points.toLocaleString()}</div>
                            <div className="text-fuchsia-300 text-xs">points</div>
                          </div>
                          <div>
                            <div className="text-cyan-400 font-bold text-base md:text-lg">{club.stats.members.toLocaleString()}</div>
                            <div className="text-fuchsia-300 text-xs">members</div>
                          </div>
                          <div>
                            <div className="text-green-400 font-bold text-base md:text-lg">{club.stats.engagement}%</div>
                            <div className="text-fuchsia-300 text-xs">engagement</div>
                          </div>
                          <Badge className="bg-fuchsia-600 text-white text-xs md:text-base px-2 md:px-3 py-1 ml-2">{club.sport}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div key={club.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 md:p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors gap-2">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="text-slate-400 font-medium w-8 text-center">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium text-base md:text-lg">{club.name}</div>
                          <div className="text-slate-400 text-xs md:text-sm flex items-center gap-2">
                            <span>{club.category}</span>
                            <span>•</span>
                            <span>{club.region}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-4 text-right">
                        <div>
                          <div className="text-white font-medium text-base md:text-lg">{club.stats.points.toLocaleString()}</div>
                          <div className="text-slate-400 text-xs md:text-sm">points</div>
                        </div>
                        <div>
                          <div className="text-cyan-400 font-medium text-base md:text-lg">{club.stats.members.toLocaleString()}</div>
                          <div className="text-slate-400 text-xs md:text-sm">members</div>
                        </div>
                        <div>
                          <div className="text-green-400 font-medium text-base md:text-lg">{club.stats.engagement}%</div>
                          <div className="text-slate-400 text-xs md:text-sm">engagement</div>
                        </div>
                        <Badge className="bg-orange-500 text-white text-xs md:text-base">
                          {club.sport}
                        </Badge>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* INTERNAL RANKING */}
      {activeTab === "interne" && (
        <div className="space-y-6">
          {/* CLUB SELECT */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Select Club</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Club</label>
                  <Select value={selectedClub} onValueChange={setSelectedClub}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(activeSport === "all" ? clubs : clubs.filter(club => club.sport === activeSport)).map(club => (
                        <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Sort by</label>
                  <Select value={userSortBy} onValueChange={setUserSortBy}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 w-full">
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
          {/* Podium UFC OU stats club */}
          {selectedClubData && selectedClubData.name === "Ultimate Fighting Championship" ? (
            (() => {
              const topUfcUsers = filteredUsers.slice(0, 3)
              return (
                <div className="flex flex-col md:flex-row items-center md:justify-center w-full mb-8 gap-4">
                  {/* 2nd */}
                  {topUfcUsers[1] && (
                    <Card className="flex-1 bg-slate-800 border-slate-700 scale-90 z-10">
                      <CardContent className="flex flex-col items-center p-2 md:p-4">
                        <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg md:text-xl mb-2">2</div>
                        <div className="text-white font-medium text-center text-base md:text-lg">{topUfcUsers[1].username}</div>
                        <div className="text-yellow-300 text-xs md:text-sm">{topUfcUsers[1].points.toLocaleString()} pts</div>
                        <Badge className="bg-yellow-600 text-white mt-2">{topUfcUsers[1].clubName}</Badge>
                      </CardContent>
                    </Card>
                  )}
                  {/* 1st */}
                  {topUfcUsers[0] && (
                    <Card className="flex-1 bg-slate-800 border-2 border-yellow-400 scale-110 z-20 shadow-lg">
                      <CardContent className="flex flex-col items-center p-3 md:p-6">
                        <div className="w-12 md:w-16 h-12 md:h-16 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold text-xl md:text-2xl mb-2">1</div>
                        <div className="text-white font-bold text-lg md:text-2xl text-center">{topUfcUsers[0].username}</div>
                        <div className="text-yellow-200 text-sm md:text-base font-semibold">{topUfcUsers[0].points.toLocaleString()} pts</div>
                        <Badge className="bg-yellow-600 text-white mt-2">{topUfcUsers[0].clubName}</Badge>
                      </CardContent>
                    </Card>
                  )}
                  {/* 3rd */}
                  {topUfcUsers[2] && (
                    <Card className="flex-1 bg-slate-800 border-slate-700 scale-90 z-10">
                      <CardContent className="flex flex-col items-center p-2 md:p-4">
                        <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-lg md:text-xl mb-2">3</div>
                        <div className="text-white font-medium text-center text-base md:text-lg">{topUfcUsers[2].username}</div>
                        <div className="text-yellow-300 text-xs md:text-sm">{topUfcUsers[2].points.toLocaleString()} pts</div>
                        <Badge className="bg-yellow-600 text-white mt-2">{topUfcUsers[2].clubName}</Badge>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )
            })()
          ) : (
            selectedClubData && (
              <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg md:text-xl">{selectedClubData.name}</CardTitle>
                  <p className="text-slate-400 text-xs md:text-base">{selectedClubData.category} • {selectedClubData.region}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg md:text-2xl font-bold text-white">{selectedClubData.stats.points.toLocaleString()}</div>
                      <div className="text-slate-400 text-xs md:text-sm">Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg md:text-2xl font-bold text-cyan-400">{selectedClubData.stats.members.toLocaleString()}</div>
                      <div className="text-slate-400 text-xs md:text-sm">Members</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg md:text-2xl font-bold text-green-400">{selectedClubData.stats.engagement}%</div>
                      <div className="text-slate-400 text-xs md:text-sm">Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg md:text-2xl font-bold text-orange-400">{selectedClubData.stats.totalActivity.toLocaleString()}</div>
                      <div className="text-slate-400 text-xs md:text-sm">Activity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}

          {/* USERS TABLE */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
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
              <div className="space-y-3 max-h-80 md:max-h-96 overflow-y-auto">
                {filteredUsers.map((user, index) => (
                  selectedClubData && selectedClubData.name === "Ultimate Fighting Championship" && index === 0 ? (
                    <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 md:p-3 bg-gradient-to-br from-purple-900 via-fuchsia-700 to-slate-800 border-2 border-fuchsia-500 shadow-lg rounded-lg hover:bg-fuchsia-800/80 transition-colors gap-2">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="text-fuchsia-200 font-extrabold w-8 text-center text-lg md:text-xl drop-shadow">#{index + 1}</div>
                        <div>
                          <div className="text-white font-extrabold text-base md:text-lg">{user.username}</div>
                          <div className="text-fuchsia-300 text-xs md:text-base font-semibold">{user.clubName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-6 text-right mt-2 sm:mt-0">
                        <div>
                          <div className="text-white font-extrabold text-base md:text-lg">{user.points.toLocaleString()}</div>
                          <div className="text-fuchsia-300 text-xs">points</div>
                        </div>
                        <div>
                          <div className="text-cyan-400 font-bold text-base md:text-lg">{user.tokens.amount.toLocaleString()}</div>
                          <div className="text-fuchsia-300 text-xs">tokens</div>
                        </div>
                        <div>
                          <div className="text-green-400 font-bold text-base md:text-lg">{user.achievements.totalActivity.toLocaleString()}</div>
                          <div className="text-fuchsia-300 text-xs">activity</div>
                        </div>
                        <Badge className="bg-fuchsia-600 text-white text-xs md:text-base px-2 md:px-3 py-1 ml-2 shadow">{user.clubName}</Badge>
                      </div>
                    </div>
                  ) : (
                    <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 md:p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors gap-2">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="text-slate-400 font-medium w-8 text-center text-base md:text-lg">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium text-base md:text-lg">{user.username}</div>
                          <div className="text-slate-400 text-xs md:text-sm">{user.clubName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-6 text-right">
                        <div>
                          <div className="text-white font-medium text-base md:text-lg">{user.points.toLocaleString()}</div>
                          <div className="text-slate-400 text-xs md:text-sm">points</div>
                        </div>
                        <div>
                          <div className="text-cyan-400 font-medium text-base md:text-lg">{user.tokens.amount.toLocaleString()}</div>
                          <div className="text-slate-400 text-xs md:text-sm">tokens</div>
                        </div>
                        <div>
                          <div className="text-green-400 font-medium text-base md:text-lg">{user.achievements.totalActivity.toLocaleString()}</div>
                          <div className="text-slate-400 text-xs md:text-sm">activity</div>
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
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
