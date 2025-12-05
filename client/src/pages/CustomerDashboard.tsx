import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { getServices, Service } from '../api/services';
import { getBookings, createBooking, updateBooking, cancelBooking, Booking } from '../api/bookings';
import { getBarbers, Barber } from '../api/barbers';
import { CustomerNavbar } from '../components/CustomerNavbar';

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const CustomerDashboard: React.FC = () => {
  const { logout } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'services' | 'bookings' | 'profile'>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Booking form state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingForm, setBookingForm] = useState({
    barberId: '',
    date: '',
    time: '',
    notes: ''
  });

  // Edit booking state
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookingMessages, setBookingMessages] = useState<{ [bookingId: string]: any[] }>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    console.log('=== LOADING INITIAL DATA ===');
    setLoading(true);
    try {
      const [servicesResponse, bookingsResponse, barbersResponse] = await Promise.all([
        getServices(),
        getBookings(),
        getBarbers()
      ]);

      console.log('Services response:', servicesResponse);
      console.log('Bookings response:', bookingsResponse);
      console.log('Barbers response:', barbersResponse);

      if (servicesResponse.success) {
        setServices(servicesResponse.data.services);
      }
      if (bookingsResponse.success) {
        console.log('Setting bookings:', bookingsResponse.data.bookings);
        setBookings(bookingsResponse.data.bookings);
        // Load messages for each booking
        console.log('About to load messages for bookings...');
        try {
          await loadMessagesForBookings(bookingsResponse.data.bookings);
          console.log('Messages loaded successfully');
        } catch (msgErr) {
          console.error('Error loading messages:', msgErr);
        }
      }
      if (barbersResponse.success) {
        setBarbers(barbersResponse.data.barbers);
      }
    } catch (err) {
      console.error('Error in loadInitialData:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
      console.log('=== INITIAL DATA LOADING COMPLETE ===');
    }
  };

  const loadMessagesForBookings = async (bookings: Booking[]) => {
    console.log('=== LOADING MESSAGES FOR BOOKINGS ===');
    console.log('Total bookings:', bookings.length);
    
    const token = localStorage.getItem('accessToken');
    const messagesMap: { [bookingId: string]: any[] } = {};
    
    await Promise.all(
      bookings.map(async (booking) => {
        try {
          console.log(`Fetching messages for booking ${booking._id}`);
          const response = await fetch(`${API_BASE_URL}/api/messages/booking/${booking._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`Response status for ${booking._id}:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Messages for ${booking._id}:`, data);
            if (data.success && data.data.messages.length > 0) {
              messagesMap[booking._id] = data.data.messages;
              console.log(`Added ${data.data.messages.length} messages for booking ${booking._id}`);
            } else {
              console.log(`No messages for booking ${booking._id}`);
            }
          } else {
            console.error(`Failed to fetch messages for ${booking._id}:`, response.statusText);
          }
        } catch (err) {
          console.error(`Failed to load messages for booking ${booking._id}`, err);
        }
      })
    );
    
    console.log('Final messagesMap:', messagesMap);
    console.log('Message map keys:', Object.keys(messagesMap));
    setBookingMessages(messagesMap);
  };

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setShowBookingForm(true);
    setEditingBooking(null);
    setBookingForm({
      barberId: '',
      date: '',
      time: '',
      notes: ''
    });
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setSelectedService(services.find(s => s._id === booking.serviceId) || null);
    setShowBookingForm(true);
    setBookingForm({
      barberId: booking.barberId,
      date: booking.date.split('T')[0], // Extract date part
      time: booking.time,
      notes: booking.notes || ''
    });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    try {
      setLoading(true);
      
      if (editingBooking) {
        // Update existing booking
        const response = await updateBooking(editingBooking._id, {
          serviceId: selectedService._id,
          barberId: bookingForm.barberId,
          date: bookingForm.date,
          time: bookingForm.time,
          notes: bookingForm.notes
        });
        
        if (response.success) {
          await loadInitialData(); // Reload bookings
          setShowBookingForm(false);
          setEditingBooking(null);
        }
      } else {
        // Create new booking
        const response = await createBooking({
          serviceId: selectedService._id,
          barberId: bookingForm.barberId,
          date: bookingForm.date,
          time: bookingForm.time,
          notes: bookingForm.notes
        });
        
        if (response.success) {
          await loadInitialData(); // Reload bookings
          setShowBookingForm(false);
        }
      }
    } catch (err) {
      setError('Failed to save booking');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        setLoading(true);
        const response = await cancelBooking(bookingId);
        if (response.success) {
          await loadInitialData(); // Reload bookings
        }
      } catch (err) {
        setError('Failed to cancel booking');
      } finally {
        setLoading(false);
      }
    }
  };

  const getBarberName = (barberId: string) => {
    const barber = barbers.find(b => b._id === barberId);
    return barber ? barber.name : 'Unknown Barber';
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s._id === serviceId);
    return service ? service.name : 'Unknown Service';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && services.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <CustomerNavbar title="Customer Dashboard" />

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('services')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'services'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Available Services
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Bookings
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service._id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-blue-600">${service.price}</span>
                    <span className="text-gray-500">{service.duration} min</span>
                  </div>
                  <button
                    onClick={() => handleBookService(service)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h2>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-xl">No bookings yet</p>
                <button
                  onClick={() => setActiveTab('services')}
                  className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Browse Services
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  console.log(`Rendering booking ${booking._id}, has messages:`, !!bookingMessages[booking._id]);
                  if (bookingMessages[booking._id]) {
                    console.log(`Messages for ${booking._id}:`, bookingMessages[booking._id]);
                  }
                  return (
                  <div key={booking._id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {getServiceName(booking.serviceId)}
                        </h3>
                        <p className="text-gray-600">Barber: {getBarberName(booking.barberId)}</p>
                        <p className="text-gray-600">Date: {formatDate(booking.date)}</p>
                        <p className="text-gray-600">Time: {booking.time}</p>
                        {booking.notes && (
                          <p className="text-gray-600">Notes: {booking.notes}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                          Status: <span className={`font-medium ${
                            booking.status === 'confirmed' ? 'text-green-600' :
                            booking.status === 'pending' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {booking.status}
                          </span>
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    
                    {/* Messages from barber */}
                    {bookingMessages[booking._id] && bookingMessages[booking._id].length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Messages from Barber:</h4>
                        <div className="space-y-2">
                          {bookingMessages[booking._id].map((message: any) => (
                            <div key={message._id} className="bg-blue-50 rounded-lg p-3">
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-sm font-medium text-gray-900">{message.subject}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(message.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <p className="text-sm text-gray-700">{message.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                From: {message.senderId?.name || 'Barber'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{localStorage.getItem('userEmail')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Type</label>
                  <p className="mt-1 text-sm text-gray-900">Customer</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="mt-1 text-sm text-gray-900">Recently Joined</p>
                </div>
                <div className="pt-4">
                  <button
                    onClick={logout}
                    className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Booking Form Modal */}
      {showBookingForm && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingBooking ? 'Edit Booking' : 'Book Service'}: {selectedService.name}
            </h3>
            <form onSubmit={handleSubmitBooking}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Barber</label>
                  <select
                    value={bookingForm.barberId}
                    onChange={(e) => setBookingForm({...bookingForm, barberId: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a barber</option>
                    {barbers.map((barber) => (
                      <option key={barber._id} value={barber._id}>{barber.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time</label>
                  <select
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Any special requests or notes..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(false);
                    setEditingBooking(null);
                  }}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingBooking ? 'Update Booking' : 'Book Service')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
