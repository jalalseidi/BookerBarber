# Barber Dashboard API Documentation

This document describes the API endpoints available for barbers to view and manage their appointments in the BarberBooker system.

## Authentication

All endpoints require authentication with a valid JWT token for a user with `role: 'barber'`.

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Dashboard Overview

**GET** `/api/barbers/dashboard`

Get comprehensive dashboard data including booking statistics and today's schedule.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalBookings": 15,
      "pendingBookings": 3,
      "confirmedBookings": 8,
      "availabilitySlots": 12,
      "hasAvailability": true
    },
    "todayBookings": [
      {
        "_id": "...",
        "customerId": "...",
        "serviceId": "...",
        "date": "2024-01-15",
        "time": "10:00",
        "status": "confirmed",
        "specialRequests": "Please use scissors only",
        "totalPrice": 50
      }
    ],
    "recentBookings": [...]
  }
}
```

### 2. View All Appointments

**GET** `/api/barbers/bookings`

Get all bookings for the authenticated barber with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by booking status (`pending`, `confirmed`, `completed`, `cancelled`)
- `date` (optional): Filter by specific date (YYYY-MM-DD format)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of results per page (default: 10)

**Examples:**
```
GET /api/barbers/bookings
GET /api/barbers/bookings?status=pending
GET /api/barbers/bookings?date=2024-01-15
GET /api/barbers/bookings?status=pending&page=2&limit=5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "_id": "booking123",
        "customerId": "customer123",
        "barberId": "barber123",
        "serviceId": "service123",
        "date": "2024-01-15",
        "time": "10:00",
        "status": "pending",
        "specialRequests": "Please use scissors only",
        "totalPrice": 50,
        "createdAt": "2024-01-10T08:00:00.000Z",
        "customer": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "service": {
          "name": "Classic Haircut",
          "price": 50,
          "duration": 30
        }
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### 3. Approve or Reject Appointments

**PUT** `/api/barbers/bookings/:id`

Update the status of a booking to approve or reject an appointment.

**Request Body:**
```json
{
  "status": "confirmed"  // or "cancelled", "completed", "pending"
}
```

**Valid Status Values:**
- `pending` - Booking is waiting for confirmation
- `confirmed` - Booking approved by barber
- `completed` - Service has been completed
- `cancelled` - Booking rejected/cancelled

**Response:**
```json
{
  "success": true,
  "message": "Booking approved",
  "data": {
    "booking": {
      "_id": "booking123",
      "status": "confirmed",
      // ... other booking fields
    },
    "message": "Booking has been approved"
  }
}
```

## Usage Examples

### 1. Check Pending Appointments

```javascript
// Get all pending appointments that need approval
const response = await fetch('/api/barbers/bookings?status=pending', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(`You have ${data.data.bookings.length} pending appointments`);
```

### 2. Approve an Appointment

```javascript
// Approve a booking
const bookingId = 'booking123';
const response = await fetch(`/api/barbers/bookings/${bookingId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    status: 'confirmed'
  })
});

const result = await response.json();
if (result.success) {
  console.log('Appointment approved!');
  // Customer will receive a notification
}
```

### 3. Reject an Appointment

```javascript
// Reject/cancel a booking
const bookingId = 'booking123';
const response = await fetch(`/api/barbers/bookings/${bookingId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    status: 'cancelled'
  })
});

const result = await response.json();
if (result.success) {
  console.log('Appointment cancelled');
  // Customer will receive a cancellation notification
}
```

### 4. View Today's Schedule

```javascript
// Get dashboard data including today's bookings
const response = await fetch('/api/barbers/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
const todayBookings = data.data.todayBookings;

console.log(`You have ${todayBookings.length} appointments today:`);
todayBookings.forEach(booking => {
  console.log(`${booking.time} - ${booking.customer?.name} (${booking.service?.name})`);
});
```

## Notifications

When a barber updates a booking status, the system automatically sends notifications to the customer via the notification service. The notification types are:

- `booking_confirmed` - When status changes to 'confirmed'
- `booking_cancelled` - When status changes to 'cancelled'
- `booking_completed` - When status changes to 'completed'
- `booking_status_update` - For other status changes

## Error Handling

All endpoints return standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (not a barber user)
- `404` - Not Found (booking doesn't exist or doesn't belong to barber)
- `500` - Internal Server Error

Example error response:
```json
{
  "success": false,
  "error": {
    "message": "Booking with ID booking123 not found or does not belong to this barber",
    "code": "NOT_FOUND",
    "timestamp": "2024-01-15T10:00:00.000Z"
  }
}
```

## Frontend Integration

These endpoints are designed to be used by the barber dashboard frontend. The typical workflow would be:

1. **Dashboard Page**: Call `GET /api/barbers/dashboard` to show overview
2. **Appointments List**: Call `GET /api/barbers/bookings` to list all appointments
3. **Filter Appointments**: Use query parameters to filter by status or date
4. **Manage Appointments**: Use `PUT /api/barbers/bookings/:id` to approve/reject bookings

The frontend should handle the booking status updates and refresh the appointment list to show the updated status.
