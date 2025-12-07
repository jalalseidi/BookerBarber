import { Bell, LogOut, Menu, LayoutDashboard, Scissors } from "lucide-react"
import { Button } from "./ui/button"
import { ThemeToggle } from "./ui/theme-toggle"
import { LanguageToggle } from "./LanguageToggle"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { Sidebar } from "./Sidebar"
import { useState } from "react"

export function Header() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar onItemClick={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 text-lg sm:text-xl font-bold cursor-pointer hover:text-primary transition-colors" onClick={() => navigate("/app")}>
            <Scissors className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="hidden xs:inline">BarberShop</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop: Show all icons */}
          <div className="hidden md:flex items-center gap-4">
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

          {/* Mobile: Only the 3 important icons */}
          <div className="flex md:hidden items-center gap-1 sm:gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}