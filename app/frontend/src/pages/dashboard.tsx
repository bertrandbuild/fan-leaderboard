import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, MessageSquare, Wallet, Trophy, Star, TrendingUp, Award, Crown, Zap } from "lucide-react"
import { topRanking, dashboardStats } from "@/data/dashboard"
import { topYappers } from "@/data/tweets"
import { useRole } from "@/hooks/useRole"

export function Dashboard() {
  const { user } = useRole();

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="px-1">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Chiliz Dashboard</h1>
        <p className="text-slate-400 mt-1 lg:mt-2 text-sm lg:text-base">Overview of your administration platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-slate-400">Active Agents</CardTitle>
            <Users className="h-3 w-3 lg:h-4 lg:w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg lg:text-2xl font-bold text-white">{dashboardStats.activeAgents.value}</div>
            <p className="text-xs text-green-400 hidden sm:block">{dashboardStats.activeAgents.change}</p>
            <p className="text-xs text-green-400 sm:hidden">+2</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-slate-400">Connected Users</CardTitle>
            <Users className="h-3 w-3 lg:h-4 lg:w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg lg:text-2xl font-bold text-white">{dashboardStats.connectedUsers.value.toLocaleString()}</div>
            <p className="text-xs text-green-400 hidden sm:block">{dashboardStats.connectedUsers.change}</p>
            <p className="text-xs text-green-400 sm:hidden">+15%</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-slate-400">Telegram Messages</CardTitle>
            <MessageSquare className="h-3 w-3 lg:h-4 lg:w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg lg:text-2xl font-bold text-white">{dashboardStats.telegramMessages.value.toLocaleString()}</div>
            <p className="text-xs text-green-400 hidden sm:block">{dashboardStats.telegramMessages.change}</p>
            <p className="text-xs text-green-400 sm:hidden">+23%</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-slate-400">Connected Wallets</CardTitle>
            <Wallet className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg lg:text-2xl font-bold text-white">{dashboardStats.connectedWallets.value}</div>
            <p className="text-xs text-green-400 hidden sm:block">{dashboardStats.connectedWallets.change}</p>
            <p className="text-xs text-green-400 sm:hidden">+8%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* My Score - Left */}
        {user?.score && (
          <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400" />
                  <CardTitle className="text-white text-base lg:text-lg">My Score</CardTitle>
                </div>
                <Badge className={`${user.role === 'admin' ? 'bg-orange-500' : 'bg-blue-500'} text-white text-xs`}>
                  {user.score.level}
                </Badge>
              </div>
              <p className="text-slate-400 text-xs lg:text-sm">Your performance on the platform</p>
            </CardHeader>
            <CardContent className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-3 gap-2 lg:gap-4">
                {/* Current Score */}
                <div className="text-center">
                  <div className="text-lg lg:text-2xl font-bold text-white mb-1">
                    {user.score.currentScore.toLocaleString()}
                  </div>
                  <div className="text-slate-400 text-xs lg:text-sm">Total Score</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 text-xs hidden sm:inline">+{user.score.weeklyChange} this week</span>
                    <span className="text-green-400 text-xs sm:hidden">+{user.score.weeklyChange}</span>
                  </div>
                </div>

                {/* Ranking */}
                <div className="text-center">
                  <div className="text-lg lg:text-2xl font-bold text-orange-400 mb-1">
                    #{user.score.rank}
                  </div>
                  <div className="text-slate-400 text-xs lg:text-sm">Ranking</div>
                  <div className="text-slate-500 text-xs mt-1 hidden sm:block">
                    out of {user.score.totalUsers.toLocaleString()} users
                  </div>
                  <div className="text-slate-500 text-xs mt-1 sm:hidden">
                    /{user.score.totalUsers.toLocaleString()}
                  </div>
                </div>

                {/* Progress to next level */}
                <div className="text-center">
                  <div className="text-lg lg:text-2xl font-bold text-blue-400 mb-1">
                    {Math.round((user.score.currentScore / user.score.nextLevelScore) * 100)}%
                  </div>
                  <div className="text-slate-400 text-xs lg:text-sm">Progress</div>
                  <div className="text-slate-500 text-xs mt-1 hidden sm:block">
                    to next level
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs lg:text-sm">
                  <span className="text-slate-400 hidden sm:inline">Progress to next level</span>
                  <span className="text-slate-400 sm:hidden">Next Level</span>
                  <span className="text-slate-300">
                    {user.score.currentScore.toLocaleString()} / {user.score.nextLevelScore.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={(user.score.currentScore / user.score.nextLevelScore) * 100} 
                  className="h-2 lg:h-3"
                />
              </div>

              {/* Achievement Badges */}
              <div className="flex items-center gap-2 lg:gap-4 pt-3 lg:pt-4 border-t border-slate-600">
                <div className="flex items-center gap-1 lg:gap-2">
                  <Award className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-400" />
                  <span className="text-slate-300 text-xs lg:text-sm">Level {user.score.level}</span>
                </div>
                <div className="flex items-center gap-1 lg:gap-2">
                  <Trophy className="w-3 h-3 lg:w-4 lg:h-4 text-orange-400" />
                  <span className="text-slate-300 text-xs lg:text-sm">Top {Math.round((user.score.rank / user.score.totalUsers) * 100)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Ranking - Right */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400" />
              <CardTitle className="text-white text-base lg:text-lg">Top Ranking</CardTitle>
            </div>
            <p className="text-slate-400 text-xs lg:text-sm">Best performers this week</p>
          </CardHeader>
          <CardContent className="space-y-3 lg:space-y-4">
            {topRanking.map((item) => (
              <div key={item.position} className="flex items-center justify-between">
                <div className="flex items-center gap-2 lg:gap-3">
                  <span className="text-slate-400 font-medium text-sm lg:text-base">{item.position}</span>
                  <span className="text-white text-sm lg:text-base truncate">{item.team}</span>
                </div>
                <div className="flex items-center gap-1 lg:gap-2">
                  <span className="text-white font-medium text-sm lg:text-base">{item.points}</span>
                  <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                    {item.change}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Yapper Leaderboards - Full Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-cyan-400" />
              <CardTitle className="text-white text-base lg:text-lg">Yapper Leaderboards</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-cyan-500 text-white text-xs">Real-time</Badge>
              <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                Top 10
              </Badge>
            </div>
          </div>
          <p className="text-slate-400 text-xs lg:text-sm">Discover the best accounts and content on CT</p>
        </CardHeader>
        <CardContent>
          {/* Mobile View */}
          <div className="block lg:hidden space-y-3">
            {topYappers.slice(0, 5).map((yapper) => (
              <div key={yapper.rank} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-medium text-sm">#{yapper.rank}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-slate-600 text-white text-xs">
                      {yapper.avatar || yapper.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white font-medium text-sm">{yapper.name}</div>
                    <div className="text-slate-400 text-xs">@{yapper.username}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium text-sm">{yapper.smartFollowers}</div>
                  <div className="text-slate-400 text-xs">smart followers</div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400 font-medium">Rank</TableHead>
                  <TableHead className="text-slate-400 font-medium">Name</TableHead>
                  <TableHead className="text-slate-400 font-medium">Smart Followers</TableHead>
                  <TableHead className="text-slate-400 font-medium">Score</TableHead>
                  <TableHead className="text-slate-400 font-medium">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topYappers.map((yapper) => (
                  <TableRow key={yapper.rank} className="border-slate-700 hover:bg-slate-700/50">
                    <TableCell className="text-slate-400 font-medium">#{yapper.rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-slate-600 text-white text-sm">
                            {yapper.avatar || yapper.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white font-medium">{yapper.name}</div>
                          <div className="text-slate-400 text-sm">@{yapper.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <span className="text-white">{yapper.smartFollowers.toLocaleString()}</span>
                        <span className="text-slate-400 text-sm">{yapper.smartPercentage.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {yapper.score}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-600 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
