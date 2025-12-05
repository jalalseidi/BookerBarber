import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BarberCard } from "@/components/BarberCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Star } from "lucide-react";
import { getBarbers, Barber } from "@/api/barbers";
import { useToast } from "@/hooks/useToast";
import { useNavigate } from "react-router-dom";

export function Barbers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [filteredBarbers, setFilteredBarbers] = useState<Barber[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'busy'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        console.log('Fetching barbers...');
        const data = await getBarbers();
        setBarbers(data.data.barbers);
        setFilteredBarbers(data.data.barbers);
      } catch (error) {
        console.error('Error fetching barbers:', error);
        toast({
          title: t('common.error'),
          description: t('common.failedToLoadBarbers'),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBarbers();
  }, [toast]);

  useEffect(() => {
    let filtered = barbers;

    if (searchTerm) {
      filtered = filtered.filter(barber =>
        barber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        barber.bioEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        barber.bioTr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        barber.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(barber => 
        availabilityFilter === 'available' ? barber.isAvailable : !barber.isAvailable
      );
    }

    setFilteredBarbers(filtered);
  }, [barbers, searchTerm, availabilityFilter]);

  const handleBarberSelect = (barber: Barber) => {
    console.log('Barber selected:', barber.name);
    navigate('/app/booking', { state: { selectedBarber: barber } });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted/50 rounded animate-pulse max-w-xs" />
        <div className="h-10 bg-muted/50 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">{t('home.topBarbers')}</h1>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`${t('common.search')} barbers...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            {t('common.filter')}
          </Button>
        </div>

        {/* Availability Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={availabilityFilter === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setAvailabilityFilter('all')}
          >
            {t('nav.barbers')}
          </Button>
          <Button
            variant={availabilityFilter === 'available' ? "default" : "outline"}
            size="sm"
            onClick={() => setAvailabilityFilter('available')}
          >
            {t('common.available')}
          </Button>
          <Button
            variant={availabilityFilter === 'busy' ? "default" : "outline"}
            size="sm"
            onClick={() => setAvailabilityFilter('busy')}
          >
            {t('common.busy')}
          </Button>
        </div>
      </div>

      {/* Barbers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBarbers.map((barber) => (
          <BarberCard
            key={barber._id}
            barber={barber}
            onSelect={handleBarberSelect}
          />
        ))}
      </div>

      {filteredBarbers.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">{t('common.noBarberFound')}</p>
        </div>
      )}
    </div>
  );
}