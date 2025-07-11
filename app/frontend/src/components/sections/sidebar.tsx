import { Button } from "@/components/ui/button"
import {
  Home,
  Trophy,
  Users,
  Wallet,
  Share2,
  ChevronRight,
  Zap,
  Settings,
  Twitter,
  MessageSquare,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router-dom";
import { menuItems, bottomMenuItem } from "@/data/navigation"
import { useRole } from "@/hooks/useRole"
import { useAuthContext } from "@/hooks/useAuthContext"
import { LogOut } from "lucide-react"
import { useSidebar } from "@/hooks/useSidebar"
import { useEffect, useRef } from "react"

export function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname.slice(1) || "dashboard"; // Remove leading slash, default to dashboard
  const { canAccessRoute, user } = useRole();
  const { logout } = useAuthContext();
  const { isOpen, close } = useSidebar();
  const previousPathRef = useRef(location.pathname);

  // Close sidebar on route change (mobile) - but only if route actually changed
  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      close();
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname, close]);

  // Icon mapping for dynamic icons
  const iconMap = {
    Home,
    Trophy,
    Users,
    Share2,
    Zap,
    Settings,
    Twitter,
    MessageSquare,
    Wallet
  }

  // Filter menu items based on user role
  const accessibleMenuItems = menuItems.filter(item => canAccessRoute(item.id));
  const canAccessBottomMenu = canAccessRoute(bottomMenuItem.id);

  const handleMenuItemClick = () => {
    // Close sidebar when menu item is clicked on mobile
    if (window.innerWidth < 1024) {
      close();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={close}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={close}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 flex-1">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4 hidden lg:block">
            Navigation
          </h2>
          <nav className="space-y-1">
            {accessibleMenuItems.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap]
              const isActive = currentPath === item.id
              const showChevron = !isActive

              // Skip item if icon is not found
              if (!Icon) {
                console.warn(`Icon not found for menu item: ${item.icon}`)
                return null
              }

              return (
                <Link key={item.id} to={`/${item.id}`} onClick={handleMenuItemClick}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left h-10",
                      isActive
                        ? "bg-orange-500/20 text-orange-400 border-r-2 border-orange-500"
                        : "text-slate-300 hover:text-white hover:bg-slate-700",
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                    {showChevron && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
        
        {/* Bottom Menu Item */}
        {canAccessBottomMenu && (
          <div className="p-4 border-t border-slate-700">
            <Link to={`/${bottomMenuItem.id}`} onClick={handleMenuItemClick}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left h-10",
                  currentPath === bottomMenuItem.id
                    ? "bg-orange-500/20 text-orange-400 border-r-2 border-orange-500"
                    : "text-slate-300 hover:text-white hover:bg-slate-700",
                )}
              >
                {(() => {
                  const Icon = iconMap[bottomMenuItem.icon as keyof typeof iconMap]
                  if (!Icon) {
                    console.warn(`Icon not found for bottom menu item: ${bottomMenuItem.icon}`)
                    return null
                  }
                  return <Icon className="w-5 h-5 mr-3" />
                })()}
                {bottomMenuItem.label}
                {currentPath !== bottomMenuItem.id && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Button>
            </Link>
          </div>
        )}

        {/* User Role Indicator & Logout */}
        <div className="p-4 border-t border-slate-700 space-y-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <div className={`w-2 h-2 rounded-full ${user?.role === 'admin' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
            <span className="hidden sm:inline">Connected as: <strong className="text-white">{user?.role}</strong></span>
            <span className="sm:hidden text-white font-medium">{user?.role}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="w-full border-slate-600 text-slate-300 bg-transparent hover:bg-slate-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Exit</span>
          </Button>
        </div>
      </div>
    </>
  )
}
