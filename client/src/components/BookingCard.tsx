import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Calendar, Clock, Copy, X, MessageSquare } from "lucide-react";
import { Booking } from "@/api/bookings";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enUS, tr } from "date-fns/locale";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface BookingCardProps {
  booking: Booking;
  messages?: any[];
  onCancel?: (bookingId: string) => void;
}

export function BookingCard({ booking, messages = [], onCancel }: BookingCardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const serviceName = i18n.language === 'tr' ? booking.service.nameTr : booking.service.nameEn;
  const locale = i18n.language === 'tr' ? tr : enUS;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP', { locale });
    } catch {
      return dateString;
    }
  };

  const handleBookAgain = () => {
    // Navigate to booking page with pre-selected service and barber
    navigate('/app/booking', {
      state: {
        selectedService: booking.service,
        selectedBarber: booking.barber,
        isRebooking: true
      }
    });
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    if (onCancel) {
      onCancel(booking._id);
    }
    setShowCancelDialog(false);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={booking.barber.profilePhoto} alt={booking.barber.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {booking.barber.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                {serviceName}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {t('common.with')} {booking.barber.name}
              </CardDescription>
            </div>
          </div>
          <Badge variant={getStatusColor(booking.status)} className="text-xs self-start sm:self-auto">
            {t(`status.${booking.status}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(booking.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{booking.time}</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <span className="text-xl">₺</span>
            <span>{booking.totalPrice}</span>
          </div>
          <div className="button-group">
            {/* Book Again Button - Show for completed bookings or any status */}
            <Button
              variant="outline"
              className="btn-responsive text-primary hover:text-primary hover:bg-primary/10"
              onClick={handleBookAgain}
            >
              <Copy className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{t('booking.bookAgain')}</span>
              <span className="sm:hidden">{t('booking.bookAgain')}</span>
            </Button>
            {/* Cancel Button - Only show for active bookings */}
            {onCancel && booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <Button
                variant="outline"
                className="btn-responsive text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleCancelClick}
              >
                <X className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{t('common.cancel')}</span>
                <span className="sm:hidden">{t('common.cancel')}</span>
              </Button>
            )}
          </div>
        </div>
        {booking.specialRequests && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            <strong>{t('booking.specialRequests')}:</strong> {booking.specialRequests}
          </div>
        )}
        
        {/* Messages from barber */}
        {messages.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                {t('booking.messagesFromBarber', 'Messages from Barber')}
              </h4>
              <Badge variant="secondary" className="ml-auto text-xs">
                {messages.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {messages.map((message: any) => (
                <div key={message._id} className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-foreground">{message.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(message.createdAt), 'PPp', { locale })}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{message.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('common.from', 'From')}: {message.senderId?.name || booking.barber.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('booking.cancelBookingTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('booking.cancelBookingConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.no')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.yes')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
