import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Clock } from "lucide-react";
import { Service } from "@/api/services";
import { useTranslation } from "react-i18next";

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  const { t, i18n } = useTranslation();
  
  const serviceName = i18n.language === 'tr' ? service.nameTr : service.nameEn;
  const serviceDescription = i18n.language === 'tr' ? service.descriptionTr : service.descriptionEn;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {serviceName}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {serviceDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{service.duration} {t('common.min')}</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-primary">
            <span className="text-lg">₺</span>
            <span>{service.price}</span>
          </div>
        </div>
        <Button 
          onClick={() => onSelect(service)}
          className="btn-responsive w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium transition-all duration-200"
        >
          {t('booking.selectService')}
        </Button>
      </CardContent>
    </Card>
  );
}