# Barber Setup Guide

## Overview
This guide explains how to connect real barber accounts with availability to the customer dashboard.

## Changes Made

### 1. Database Models
- **Created `Availability.js` model**: Manages barber availability slots
- **Updated User model**: Already supports barber role (`role: 'barber'`)

### 2. Backend API Updates
- **Updated `/api/barbers` endpoint**: Now fetches real barber users with availability
- **Enhanced `/api/barbers/:id/availability`**: Returns real availability slots
- **Added barber management endpoints**:
  - `GET /api/barber/availability` - Get barber's own availability
  - `POST /api/barber/availability` - Create availability slot
  - `PUT /api/barber/availability/:id` - Update availability slot  
  - `DELETE /api/barber/availability/:id` - Delete availability slot

### 3. Frontend Updates
- **BarberDashboard**: Now connects to real availability API
- **CustomerDashboard**: Will display barbers who have set availability

## How It Works

### For Barbers:
1. **Create Account**: Register as a barber (`role: 'barber'`)
2. **Set Availability**: Use the BarberDashboard to set available time slots
3. **Manage Schedule**: Add/edit/delete availability as needed

### For Customers:
1. **View Available Barbers**: Only barbers with future availability are shown
2. **Book Appointments**: Select from available time slots
3. **Real-time Updates**: Availability reflects actual barber schedules

## Database Setup

### 1. Install Dependencies
```bash
# If using the server
cd server
npm install
```

### 2. Seed Sample Data (Optional)
Create sample barber accounts and availability:

```javascript
// In MongoDB or through your seeding script
const bcrypt = require('bcrypt');

// Create sample barber users
const sampleBarbers = [
  {
    email: 'mehmet@barbershop.com',
    password: await bcrypt.hash('password123', 10),
    role: 'barber',
    name: 'Mehmet Özkan',
    phone: '+90 555 123 4567',
    isActive: true
  },
  {
    email: 'ali@barbershop.com', 
    password: await bcrypt.hash('password123', 10),
    role: 'barber',
    name: 'Ali Demir',
    phone: '+90 555 234 5678',
    isActive: true
  }
];

// Create availability for these barbers
const sampleAvailability = [
  {
    barberId: 'BARBER_USER_ID_1',
    date: new Date('2024-01-10'),
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true
  },
  {
    barberId: 'BARBER_USER_ID_2', 
    date: new Date('2024-01-10'),
    startTime: '10:00',
    endTime: '18:00',
    isAvailable: true
  }
];
```

## Testing the Setup

### 1. Create Test Barber Account
```bash
POST /api/auth/register
{
  "email": "testbarber@example.com",
  "password": "password123",
  "role": "barber",
  "name": "Test Barber"
}
```

### 2. Login as Barber
```bash
POST /api/auth/login
{
  "email": "testbarber@example.com",
  "password": "password123"
}
```

### 3. Set Availability
```bash
POST /api/barber/availability
Authorization: Bearer YOUR_TOKEN
{
  "date": "2024-01-15",
  "start_time": "09:00", 
  "end_time": "17:00",
  "is_available": true
}
```

### 4. Check Customer Dashboard
- Go to customer dashboard
- The test barber should now appear in the available barbers list
- Customers can book appointments with this barber

## Benefits

### ✅ Real Data
- No more fake barber data
- Actual user accounts with authentication
- Real availability management

### ✅ Dynamic Updates  
- Barbers control their own schedules
- Availability reflects real barber activity
- Automatic filtering of inactive barbers

### ✅ Scalable System
- Easy to add new barbers
- Flexible availability system
- Proper data relationships

## Troubleshooting

### Barber Not Showing in Customer Dashboard?
1. **Check barber account**: Ensure `role: 'barber'` and `isActive: true`
2. **Verify availability**: Barber must have future availability slots
3. **Check dates**: Availability must be for today or future dates

### Availability Not Saving?
1. **Authentication**: Ensure barber is logged in with valid token
2. **Date format**: Use YYYY-MM-DD format for dates
3. **Time format**: Use HH:MM format (24-hour)
4. **Past dates**: Cannot set availability for past dates

### Empty Barber List?
1. **Database**: Check if any barber users exist
2. **Availability**: Barbers need to set availability slots
3. **API**: Verify `/api/barbers` endpoint returns data

## Next Steps

1. **Enhanced Profiles**: Add more barber profile fields
2. **Rating System**: Implement customer reviews
3. **Photo Upload**: Allow barbers to upload profile photos
4. **Advanced Scheduling**: Recurring availability, breaks, etc.
5. **Notifications**: Alert barbers of new bookings

## Support

If you encounter issues:
1. Check server logs for error messages
2. Verify database connections
3. Test API endpoints with Postman
4. Review frontend console for errors
