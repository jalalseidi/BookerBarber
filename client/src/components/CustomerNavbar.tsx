import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './LanguageToggle';
import { LogOut, Scissors, User } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface CustomerNavbarProps {
  title: string;
}

export const CustomerNavbar: React.FC<CustomerNavbarProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Scissors className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">BarberBooker</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-gray-300">|</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">{title}</h1>
          </div>

          {/* Right side - Language Toggle and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <div className="text-gray-700">
              <LanguageToggle />
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-gray-100">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.name || ''} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {user?.name ? getInitials(user.name) : 'C'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('nav.profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('nav.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};
