import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Star, Clock } from "lucide-react";
import { Barber } from "@/api/barbers";
import { useTranslation } from "react-i18next";

interface BarberCardProps {
  barber: Barber;
  onSelect: (barber: Barber) => void;
}

export function BarberCard({ barber, onSelect }: BarberCardProps) {
  const { t, i18n } = useTranslation();
  
  const barberBio = i18n.language === 'tr' ? barber.bioTr : barber.bioEn;

  // Function to translate specialty names
  const translateSpecialty = (specialty: string): string => {
    const specialtyMap: Record<string, string> = {
      'haircut': t('services.haircut'),
      'shave': t('services.shave'),
      'beard': t('services.beardTrim'),
      'styling': t('services.styling'),
      'treatment': t('services.treatment'),
      'package': t('services.package')
    };
    return specialtyMap[specialty.toLowerCase()] || specialty;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarImage src={barber.profilePhoto} alt={barber.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {barber.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {barber.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{barber.rating}</span>
                <span className="text-xs text-muted-foreground">({barber.reviewCount})</span>
              </div>
              <Badge variant={barber.isAvailable ? "default" : "secondary"} className="text-xs">
                {barber.isAvailable ? t('common.available') : t('common.busy')}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-sm text-muted-foreground">
          {barberBio}
        </CardDescription>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{barber.workingHours.start} - {barber.workingHours.end}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {barber.specialties.map((specialty) => (
            <Badge key={specialty} variant="outline" className="text-xs">
              {translateSpecialty(specialty)}
            </Badge>
          ))}
        </div>
        <Button 
          onClick={() => onSelect(barber)}
          disabled={!barber.isAvailable}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium transition-all duration-200 disabled:opacity-50"
        >
          {barber.isAvailable ? t('booking.selectBarber') : t('common.notAvailable')}
        </Button>
      </CardContent>
    </Card>
  );
}