# Barber Booking System - Seed Data & Testing Guide

This guide explains how to use the seed data script and Postman collection to test the Barber Booking System with proper MongoDB ObjectIds.

## Overview

The system now uses proper MongoDB ObjectIds for all references between collections:
- **Users** → ObjectId
- **Barbers** → ObjectId (references User collection)
- **Services** → ObjectId
- **Bookings** → Uses ObjectId references to Barber and Service collections

## Quick Start

### 1. Run the Seed Data Script

The seed data script creates initial data for testing with proper ObjectIds:

```bash
# Navigate to the server directory
cd server

# Run the seed data script
node scripts/seedData.js
```

This will create:
- 4 test users (including admin)
- 4 barbers with different specialties
- 6 services across different categories
- All with proper MongoDB ObjectIds

### 2. Import Postman Collection

1. Open Postman
2. Click "Import" 
3. Select the file: `server/postman/BarberBookingSystem.postman_collection.json`
4. The collection includes all endpoints with automatic ObjectId management

## Seed Data Details

### Created Users
- `customer1@example.com` - Test customer 1
- `customer2@example.com` - Test customer 2  
- `customer3@example.com` - Test customer 3
- `admin@barbershop.com` - Admin user

**Default password for all users:** `password123`

### Created Barbers
- **Mehmet Özkan** - Expert barber (haircut, beard, styling)
- **Ali Demir** - Traditional barber (haircut, shave)
- **Emre Kaya** - Modern stylist (styling, treatment) - Currently unavailable
- **Can Yılmaz** - Master barber (all services)

### Created Services
- **Classic Haircut** - $50, 30 min
- **Beard Trim** - $30, 20 min
- **Classic Shave** - $40, 25 min
- **Hair Styling** - $35, 20 min
- **Hair Treatment** - $75, 45 min
- **Complete Package** - $100, 60 min

## Testing Workflow with Postman

### Step 1: Authentication
1. **Login Customer** - Automatically saves auth token and user ID
2. **Get User Profile** - Verify authentication

### Step 2: Get ObjectIds
1. **Get All Barbers** - Automatically saves first barber's ObjectId
2. **Get All Services** - Automatically saves first service's ObjectId

### Step 3: Create Booking
1. **Create Booking** - Uses saved barber and service ObjectIds
2. **Get All Bookings** - View created booking with proper references

### Step 4: Manage Bookings
1. **Get Booking by ID**
2. **Update Booking** 
3. **Cancel Booking**

## ObjectId Management

### In the Frontend/Client
The client API files currently use string IDs ('1', '2', '3') but should be updated to handle ObjectIds:

```typescript
// Example ObjectId format
const barberId = "507f1f77bcf86cd799439011"; // 24-character hex string
const serviceId = "507f191e810c19729de860ea";
```

### In Booking Creation
When creating bookings, ensure you use proper ObjectIds:

```javascript
{
  "barberId": "{{barberId}}", // ObjectId from barbers collection
  "serviceId": "{{serviceId}}", // ObjectId from services collection
  "date": "2024-01-15",
  "time": "10:00",
  "specialRequests": "Any special requests"
}
```

## Database Schema Updates

### Before (String IDs)
```javascript
barberId: {
  type: String,
  required: true
}
```

### After (ObjectId References)
```javascript
barberId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Barber',
  required: true,
  index: true
}
```

## Validation

### ObjectId Validation
MongoDB ObjectIds are 24-character hexadecimal strings. The system will automatically validate:
- Format: 24 hex characters
- Existence: Reference must exist in target collection
- Type: Must be valid ObjectId type

### Example Valid ObjectIds
```
507f1f77bcf86cd799439011
507f191e810c19729de860ea
61a5b12c8e4d2a001f123456
```

## Troubleshooting

### Common Issues

1. **Invalid ObjectId Format**
   ```
   Error: Cast to ObjectId failed for value "1" at path "barberId"
   ```
   **Solution:** Use proper 24-character ObjectId strings

2. **Reference Not Found**
   ```
   Error: Barber with ID 507f1f77bcf86cd799439011 not found
   ```
   **Solution:** Ensure the referenced barber/service exists in database

3. **Authentication Required**
   ```
   Error: Authentication token required
   ```
   **Solution:** Login first using the Postman authentication requests

### Reset Database
To start fresh:
```bash
# Clear all data and re-run seed script
node scripts/seedData.js
```

## Environment Variables

Ensure your `.env` file includes:
```
MONGODB_URI=mongodb://localhost:27017/barber_booking
JWT_SECRET=your_jwt_secret_here
PORT=3000
```

## Next Steps

1. **Update Frontend**: Modify client API calls to handle ObjectIds
2. **Add Population**: Use Mongoose populate to include referenced data
3. **Add Validation**: Implement additional ObjectId validation
4. **Testing**: Run comprehensive tests with the Postman collection

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login user |
| GET | `/api/barbers` | Get all barbers |
| GET | `/api/services` | Get all services |
| POST | `/api/bookings` | Create booking with ObjectIds |
| GET | `/api/bookings` | Get user's bookings |
| PUT | `/api/bookings/:id` | Update booking |
| DELETE | `/api/bookings/:id` | Cancel booking |

---

**Important:** Always use the seed data script before testing to ensure proper ObjectIds are available in the database!
