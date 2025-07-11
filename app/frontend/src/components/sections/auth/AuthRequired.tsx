import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import { Link } from "react-router-dom"

interface AuthRequiredProps {
  children: React.ReactNode
  isAuthenticated: boolean
}

export function AuthRequired({ children, isAuthenticated }: AuthRequiredProps) {
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <CardTitle className="text-white text-xl">Authentication Required</CardTitle>
            <p className="text-slate-400">You must be logged in to access this page</p>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/login">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
} 