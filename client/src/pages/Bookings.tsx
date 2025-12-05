import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BookingCard } from "@/components/BookingCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus } from "lucide-react";
import { getBookings, cancelBooking, Booking } from "@/api/bookings";
import { useToast } from "@/hooks/useToast";
import { useNavigate, useLocation } from "react-router-dom";

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function Bookings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingMessages, setBookingMessages] = useState<{ [bookingId: string]: any[] }>({});

  const fetchBookings = async () => {
    try {
      console.log('Fetching bookings...');
      const data = await getBookings();
      setBookings(data.data.bookings);
      
      // Fetch messages for all bookings
      await loadMessagesForBookings(data.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: t('common.error'),
        description: t('common.failedToLoadBookings'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessagesForBookings = async (bookings: Booking[]) => {
    const token = localStorage.getItem('accessToken');
    const messagesMap: { [bookingId: string]: any[] } = {};
    
    await Promise.all(
      bookings.map(async (booking) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/messages/booking/${booking._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.messages.length > 0) {
              messagesMap[booking._id] = data.data.messages;
            }
          }
        } catch (err) {
          console.error(`Failed to load messages for booking ${booking._id}`, err);
        }
      })
    );
    
    setBookingMessages(messagesMap);
  };

  useEffect(() => {
    fetchBookings();
  }, [toast]);

  useEffect(() => {
    // Refetch bookings when navigated with refresh state
    if (location.state?.refresh) {
      fetchBookings();
    }
  }, [location.state]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      console.log('Cancelling booking:', bookingId);
      await cancelBooking(bookingId);
      
      // Refetch bookings to ensure consistency with server state
      await fetchBookings();
      
      toast({
        title: t('common.success'),
        description: t('common.bookingCancelledSuccessfully'),
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: t('common.error'),
        description: t('common.failedToCancelBooking'),
        variant: "destructive",
      });
    }
  };

  const upcomingBookings = bookings.filter(booking =>
    booking.status === 'confirmed' || booking.status === 'pending'
  );
  const pastBookings = bookings.filter(booking =>
    booking.status === 'completed' || booking.status === 'cancelled'
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted/50 rounded animate-pulse w-48" />
          <div className="h-10 bg-muted/50 rounded animate-pulse w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('nav.bookings')}</h1>
        <Button 
          onClick={() => navigate('/app/booking')} 
          className="btn-responsive bg-gradient-to-r from-primary to-primary/80 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('home.bookNow')}
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('booking.upcoming')} ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            {t('booking.history')} ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                messages={bookingMessages[booking._id] || []}
                onCancel={handleCancelBooking}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-4">{t('common.noUpcomingBookings')}</p>
              <Button 
                onClick={() => navigate('/app/booking')}
                className="btn-responsive"
              >
                {t('home.bookNow')}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastBookings.length > 0 ? (
            pastBookings.map((booking) => (
              <BookingCard 
                key={booking._id} 
                booking={booking} 
                messages={bookingMessages[booking._id] || []}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">{t('common.noPastBookings')}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}