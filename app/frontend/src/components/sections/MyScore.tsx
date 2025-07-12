import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, TrendingUp, Award } from "lucide-react"

import { useRole } from "@/hooks/useRole"

export default function MyScore() {
  const { user } = useRole();

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
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
      </div>
    </div>
  )
}
