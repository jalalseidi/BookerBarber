import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { BarberCard } from "@/components/BarberCard";
import { BookingCard } from "@/components/BookingCard";
import { Scissors, Calendar, Users, Star } from "lucide-react";
import { getServices, Service } from "@/api/services";
import { getBarbers, Barber } from "@/api/barbers";
import { getBookings, Booking } from "@/api/bookings";
import { useToast } from "@/hooks/useToast";

export function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching home page data...');
        const [servicesData, barbersData, bookingsData] = await Promise.all([
          getServices(),
          getBarbers(),
          getBookings()
        ]);

        setServices(servicesData.data.services.slice(0, 4));
        setBarbers(barbersData.data.barbers.slice(0, 3));
        setRecentBookings(bookingsData.data.bookings.slice(0, 2));
      } catch (error) {
        console.error('Error fetching home data:', error);
        toast({
          title: t('common.error'),
          description: t('common.failedToLoadData'),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleServiceSelect = (service: Service) => {
    console.log('Service selected:', service.name);
    navigate('/app/booking', { state: { selectedService: service } });
  };

  const handleBarberSelect = (barber: Barber) => {
    console.log('Barber selected:', barber.name);
    navigate('/app/booking', { state: { selectedBarber: barber } });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="h-12 bg-muted/50 rounded animate-pulse mx-auto max-w-md" />
          <div className="h-6 bg-muted/50 rounded animate-pulse mx-auto max-w-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Scissors className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {t('home.welcome')}
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('home.tagline')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Button
            size="lg"
            onClick={() => navigate('/app/booking')}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium px-8"
          >
            <Calendar className="h-5 w-5 mr-2" />
            {t('home.bookNow')}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/app/bookings')}
            className="px-8"
          >
            {t('home.viewBookings')}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6 text-center">
            <Scissors className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{services.length}+</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">{t('home.ourServices')}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{barbers.length}</div>
            <div className="text-sm text-green-600 dark:text-green-400">{t('home.topBarbers')}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">4.8</div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">{t('common.averageRating')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Services */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{t('home.ourServices')}</h2>
          <Button variant="outline" onClick={() => navigate('/app/services')}>
            {t('common.viewAll')}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              onSelect={handleServiceSelect}
            />
          ))}
        </div>
      </section>

      {/* Top Barbers */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{t('home.topBarbers')}</h2>
          <Button variant="outline" onClick={() => navigate('/app/barbers')}>
            {t('common.viewAll')}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbers.map((barber) => (
            <BarberCard
              key={barber._id}
              barber={barber}
              onSelect={handleBarberSelect}
            />
          ))}
        </div>
      </section>

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">{t('home.recentBookings')}</h2>
            <Button variant="outline" onClick={() => navigate('/app/bookings')}>
              {t('common.viewAll')}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}