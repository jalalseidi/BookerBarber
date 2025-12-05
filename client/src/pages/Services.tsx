import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ServiceCard } from "@/components/ServiceCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { getServices, Service } from "@/api/services";
import { useToast } from "@/hooks/useToast";
import { useNavigate } from "react-router-dom";

export function Services() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['haircut', 'beard', 'shave', 'styling', 'treatment', 'package'];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log('Fetching services...');
        const data = await getServices();
        setServices(data.data.services);
        setFilteredServices(data.data.services);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast({
          title: "Error",
          description: "Failed to load services. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [toast]);

  useEffect(() => {
    let filtered = services;

    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.nameTr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.descriptionEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.descriptionTr.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, selectedCategory]);

  const handleServiceSelect = (service: Service) => {
    console.log('Service selected:', service.name);
    navigate('/app/booking', { state: { selectedService: service } });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted/50 rounded animate-pulse max-w-xs" />
        <div className="h-10 bg-muted/50 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">{t('home.ourServices')}</h1>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`${t('common.search')} services...`}
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

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {t(`services.${category}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <ServiceCard
            key={service._id}
            service={service}
            onSelect={handleServiceSelect}
          />
        ))}
      </div>

      {filteredServices.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No services found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}