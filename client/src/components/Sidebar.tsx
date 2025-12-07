import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { 
  Home, 
  Scissors, 
  Users, 
  Calendar, 
  User,
  Settings
} from "lucide-react";

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    {
      icon: Home,
      label: t('nav.home'),
      path: '/app',
    },
    {
      icon: Calendar,
      label: t('nav.bookings'),
      path: '/app/bookings',
    },
    {
      icon: Scissors,
      label: t('nav.services'),
      path: '/app/services',
    },
    {
      icon: Users,
      label: t('nav.barbers'),
      path: '/app/barbers',
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname === path;
  };

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r">
      <Separator />

      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "default" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => handleNavigation(item.path)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <Separator />

      <div className="p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => handleNavigation('/app/profile')}
        >
          <User className="h-4 w-4" />
          {t('nav.profile')}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => handleNavigation('/app/settings')}
        >
          <Settings className="h-4 w-4" />
          {t('nav.settings')}
        </Button>
      </div>
    </div>
  );
}