import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    console.log('Changing language to:', lng);
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const getCurrentLanguageFlag = () => {
    return i18n.language === 'tr' ? '🇹🇷' : '🇺🇸';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="hover:bg-gray-100 px-2 h-8 gap-1">
          <span className="text-sm">{getCurrentLanguageFlag()}</span>
          <Globe className="h-4 w-4 text-gray-700 hover:text-gray-900" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => changeLanguage('en')}
          className={i18n.language === 'en' ? 'bg-blue-50' : ''}
        >
          <span className="mr-2">🇺🇸</span>
          English
          {i18n.language === 'en' && <span className="ml-auto text-blue-600">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('tr')}
          className={i18n.language === 'tr' ? 'bg-blue-50' : ''}
        >
          <span className="mr-2">🇹🇷</span>
          Türkçe
          {i18n.language === 'tr' && <span className="ml-auto text-blue-600">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}