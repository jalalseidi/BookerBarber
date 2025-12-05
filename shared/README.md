# BarberBooker Shared Types Library

This library contains shared TypeScript types and interfaces used by both the client and server components of the BarberBooker application.

## Installation

To use this library in either the client or server:

```bash
# From the client or server directory
npm install --save ../shared
```

Or add it to your package.json:

```json
"dependencies": {
  "@barberbooker/shared": "file:../shared"
}
```

Then run `npm install`.

## Usage

### In Client Code

```typescript
// Import specific types
import { Barber, Booking, Service } from '@barberbooker/shared';

// Or import everything
import * as SharedTypes from '@barberbooker/shared';
```

### In Server Code

```typescript
// If using TypeScript on the server
import { Barber, Booking, Service } from '@barberbooker/shared';

// If using JavaScript on the server, you can still use the types for documentation
// but they won't provide runtime type checking
```

## Available Types

The library includes the following categories of types:

- **API Types**: Common API response and request structures
- **Authentication Types**: User authentication and authorization
- **Barber Types**: Barber profiles and related data
- **Booking Types**: Appointment bookings and scheduling
- **Service Types**: Barber services and offerings

## Development

To build the library:

```bash
cd shared
npm install
npm run build
```

This will compile the TypeScript files and generate the distribution files in the `dist` directory.