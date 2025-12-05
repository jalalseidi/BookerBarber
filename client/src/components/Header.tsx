import { Bell, LogOut, Menu, LayoutDashboard, Scissors } from "lucide-react"
import { Button } from "./ui/button"
import { ThemeToggle } from "./ui/theme-toggle"
import { LanguageToggle } from "./LanguageToggle"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { Sidebar } from "./Sidebar"

export function Header() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  const handleLogout = () => {
    logout()
    navigate("/login")
  }
  
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 text-xl font-bold cursor-pointer hover:text-primary transition-colors" onClick={() => navigate("/app")}>
            <Scissors className="h-6 w-6 text-primary" />
            <span>BarberShop</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <ThemeToggle />
          {user?.role === 'barber' && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/barber-dashboard")}
              title="Barber Dashboard"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}