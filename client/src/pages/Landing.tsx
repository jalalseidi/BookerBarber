import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Scissors, 
  Star, 
  Clock, 
  Users, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  ChevronRight
} from "lucide-react";

export function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-primary" />,
      title: "Easy Booking",
      description: "Book your appointment in just a few clicks"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Expert Barbers", 
      description: "Professional barbers with years of experience"
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Flexible Hours",
      description: "Open 7 days a week to fit your schedule"
    },
    {
      icon: <Star className="h-8 w-8 text-primary" />,
      title: "Top Rated",
      description: "Highest rated barbershop in the city"
    }
  ];

  const services = [
    { name: "Classic Haircut", price: "₺25", duration: "30 min" },
    { name: "Beard Trim", price: "₺15", duration: "20 min" },
    { name: "Hot Towel Shave", price: "₺30", duration: "45 min" },
    { name: "Hair Styling", price: "₺20", duration: "25 min" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10" />
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Scissors className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    StyleCraft
                  </h1>
                </div>
                <p className="text-xl text-primary font-semibold">
                  Premium Barbershop & Grooming
                </p>
                <p className="text-lg text-muted-foreground max-w-md">
                  "Where tradition meets modern style. Experience the art of grooming with our master barbers."
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">4.9</span>
                  <span>(150+ reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>500+ Happy Customers</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth/login')}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-8"
                >
                  Book Appointment
                  <Calendar className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/auth/register')}
                  className="px-8"
                >
                  Join Us
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop&crop=center" 
                  alt="Professional barbershop interior" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating Card */}
              <Card className="absolute -bottom-6 -left-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Open Now</p>
                      <p className="text-sm text-muted-foreground">Mon-Sun 9AM-8PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose StyleCraft?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We combine traditional barbering techniques with modern convenience to give you the best grooming experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground">Premium grooming services tailored to your style</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {services.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{service.name}</h3>
                  <p className="text-2xl font-bold text-primary mb-1">{service.price}</p>
                  <p className="text-sm text-muted-foreground">{service.duration}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-slate-900 dark:bg-slate-950 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Visit Our Shop</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>123 Style Street, Grooming District, City 12345</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>(555) 123-STYLE</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>hello@stylecraft.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Mon-Sun: 9:00 AM - 8:00 PM</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Ready to Book?</h3>
              <p className="text-slate-300 mb-6">Join thousands of satisfied customers who trust StyleCraft for their grooming needs.</p>
              <Button 
                size="lg" 
                onClick={() => navigate('/auth/register')}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Get Started Today
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
