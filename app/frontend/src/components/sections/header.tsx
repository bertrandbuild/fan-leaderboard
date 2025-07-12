import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Settings, Wallet, LogOut, Menu } from "lucide-react"
import { ModeToggle } from "./ModeToggle"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { useAuthContext } from "@/hooks/useAuthContext"
import { useSidebar } from "@/hooks/useSidebar"
import { cn } from "@/lib/utils"

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthContext();
  const { toggle } = useSidebar()

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 lg:px-6">
      {/* Mobile Menu Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          className="lg:hidden text-slate-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        {/* Logo/Title for mobile */}
        <div className="lg:hidden">
          <h1 className="text-lg font-semibold text-white">Chiliz Fan Leaderboard</h1>
        </div>
      </div>

      {/* Desktop Header Content */}
      <div className="hidden lg:flex items-center justify-between w-full">
        {/* Left side - Logo and Title */}
        <Link to="/leaderboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-sm">
            CHZ
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-white">Chiliz Fan Leaderboard</span>
            <Badge variant="secondary" className="bg-green-600 text-white text-xs">
              Live
            </Badge>
          </div>
        </Link>
        
        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <Link to="/wallet-integration">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white bg-transparent",
                location.pathname === "/wallet-integration" && "bg-orange-500 text-white"
              )}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
          </Button>
          
          <ModeToggle />
          
          <Link to="/agents">
            <Button 
              variant="ghost" 
              size="icon"
              className={cn(
                "text-slate-300 hover:text-white hover:bg-slate-700",
                location.pathname === "/agents" && "bg-orange-500/20 text-orange-400"
              )}
              title="Agents"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout} 
            className="text-slate-300 hover:text-white hover:bg-slate-700"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Logout Button */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-slate-400 hover:text-white"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
