import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Share, Image } from "lucide-react"
import { userProfile } from "@/data/tweets"
import { SERVER_URL } from "@/config/config"
import { useState, useEffect } from "react"

interface UserProfileCardProps {
  className?: string
}

/* 
  TODO: User Profile Data Integration Status
  - Currently uses mock data from userProfile in @/data/tweets
  - Required backend integration: GET /api/users/:id/tiktok-profile or /api/users/:id/profile
  - Should fetch real user profile data including:
    { name, username, category, smartFollowers, smartPercentage, connections }
  - Integration would connect to existing backend endpoints
  - See FRONTEND_BACKEND_INTEGRATION_AUDIT.md for details
*/

export function UserProfileCard({ className }: UserProfileCardProps) {
  const [profileData, _] = useState(userProfile)
  const [isLoading, setIsLoading] = useState(false)
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  })

  useEffect(() => {
    // TODO: Load real user profile data from backend
    const loadUserProfile = async () => {
      setIsLoading(true)
      try {
        // Example integration with backend:
        // const { fetchUserTikTokProfile } = await import('@/lib/userApi')
        // const userData = await fetchUserTikTokProfile('current-user-id')
        // setProfileData(userData)
        
        // For now, keep using mock data
        console.log('Using mock profile data until backend integration is complete')
      } catch (error) {
        console.warn('Failed to load user profile:', error)
        // Keep using mock data as fallback
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [])

  const handleCopyImage = () => {
    // Logic to copy image to clipboard
    console.log('Copy image functionality')
  }

  const handleShareOnX = () => {
    const text = `Check out my Kaito Yaps profile! ${profileData.smartFollowers} Smart Followers and growing 🚀`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=https://${SERVER_URL}/profile/bertrand`
    window.open(url, '_blank')
  }

  if (isLoading) {
    return (
      <Card className={`bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 ${className}`}>
        <CardContent className="p-6 text-center text-slate-400">
          Loading profile...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-cyan-500 text-white text-xs">
            {currentDate} (updated every Sunday)
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Profile Header */}
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-cyan-500 text-white text-base font-bold">
              {profileData.name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white mb-1 truncate">
              {profileData.name} {profileData.username}
            </h2>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-2 text-xs">
              {profileData.category}
            </Badge>
            
            <div className="text-cyan-400 text-base font-bold">
              {profileData.smartFollowers} Smart Followers
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* CT Smart Follower */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-slate-400 text-xs mb-1">CT Smart Follower</div>
                <div className="text-slate-400 text-xs mb-2">Top</div>
                <div className="text-xl font-bold text-cyan-400 mb-3">{profileData.smartPercentage}%</div>
                
                {/* Simple progress visualization */}
                <div className="relative h-8 bg-slate-700 rounded">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-1 bg-slate-600 rounded-full">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all"
                        style={{ width: `${profileData.smartPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Smart Followers */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-slate-400 text-xs mb-3">Top Smart Followers</div>
                
                {/* Followers grid */}
                <div className="grid grid-cols-5 gap-1 mb-3">
                  {Array.from({ length: 15 }, (_, i) => (
                    <Avatar key={i} className="w-4 h-4">
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-xs">
                        {String.fromCharCode(65 + (i % 26))}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                
                <div className="text-slate-400 text-xs">
                  {profileData.smartFollowers} Smart Followers
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Network Visualization */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3">
            <div className="relative h-24 bg-slate-900 rounded overflow-hidden">
              {/* Central node */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Avatar className="w-6 h-6 border-2 border-cyan-400">
                  <AvatarFallback className="bg-cyan-500 text-white text-xs">
                    {profileData.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* Connection nodes */}
              {Array.from({ length: Math.min(profileData.connections, 12) }, (_, i) => {
                const angle = (i * 360) / Math.min(profileData.connections, 12)
                const radius = 35
                const x = 50 + radius * Math.cos(angle * Math.PI / 180)
                const y = 50 + radius * Math.sin(angle * Math.PI / 180)
                
                return (
                  <div key={i}>
                    {/* Connection line */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <line
                        x1="50%"
                        y1="50%"
                        x2={`${x}%`}
                        y2={`${y}%`}
                        stroke="rgb(34, 197, 94)"
                        strokeWidth="1"
                        opacity="0.6"
                      />
                    </svg>
                    
                    {/* Node */}
                    <Avatar 
                      className="w-3 h-3 absolute"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <AvatarFallback className="bg-green-500 text-white text-xs">
                        {String.fromCharCode(65 + i)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Footer with Kaito branding */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
          <div className="flex items-center gap-1">
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
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2"
              onClick={handleShareOnX}
            >
              <Share className="w-3 h-3 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 