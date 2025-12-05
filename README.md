# BarberBooker - Running the Project

This docu



































































































































































































































































































ment provides instructions on how to set up and run the BarberBooker project, which consists of a React frontend and an Express.js backend.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher) and **npm** (v8 or higher)
2. **MongoDB** (v4.4 or higher) - [See detailed MongoDB installation instructions](./MONGODB_INSTALLATION.md)

## Project Structure

The project is organized into two main directories:

- `client/`: React frontend built with Vite, TypeScript, and Tailwind CSS
- `server/`: Express.js backend with MongoDB database

## Setting Up the Server

1. **Configure Environment Variables**:

   The server uses a `.env` file for configuration. This file is already set up with default values:

   ```
   PORT=3000
   DATABASE_URL=mongodb://localhost/BarberBooker
   JWT_SECRET=464e9d4b8e49b7e65c9d91e79c9ddfefc2679efe59ebb1114802449d5f4ba538
   REFRESH_TOKEN_SECRET=07c996cd17488e31df7156010ad992bbdb924febd17514e67409ca9cd85fb8dd
   ```

   If you need to modify these values, edit the `.env` file in the `server/` directory.

2. **Ensure MongoDB is Running**:

   Make sure MongoDB is installed and running on your system. The server will connect to the database specified in the `DATABASE_URL` environment variable.

   - If you haven't installed MongoDB yet, follow the [MongoDB Installation Guide](./MONGODB_INSTALLATION.md)
   - For Windows users, you can verify MongoDB is running with: `sc query MongoDB`
   - If MongoDB is not running, start it with: `net start MongoDB`
   - The application is configured to use a local MongoDB instance by default

## Setting Up the Client

The client is configured to proxy API requests to the server running on port 3000. This is already set up in the `vite.config.ts` file.

## Installing Dependencies

You can install dependencies for both the client and server at once using the root package.json:

```bash
npm install
```

This will run the `postinstall` script, which installs dependencies for both the client and server.

Alternatively, you can install dependencies for each part separately:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Running the Project

### Running Both Client and Server

From the root directory, run:

```bash
npm start
```

This will start both the client and server concurrently:
- Client: http://localhost:5173
- Server: http://localhost:3000

### Running the Client Only

```bash
npm run client
```

### Running the Server Only

```bash
npm run server
```

### Debugging the Server

To run the server with debugging enabled:

```bash
npm run debug
```

This will start the server with the Node.js inspector enabled on port 9229.

## Accessing the Application

Once both the client and server are running:

1. Open your browser and navigate to http://localhost:5173
2. You should see the login page of the BarberBooker application
3. You can register a new account or log in with existing credentials

## API Endpoints

The server exposes the following main API endpoints:

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Log in an existing user
- `POST /api/auth/logout`: Log out a user
- `GET /api/auth/me`: Get the current user's information (requires authentication)

## Troubleshooting

1. **Database Connection Issues**:
   - Ensure MongoDB is installed and running
   - Check the `DATABASE_URL` in the `.env` file
   - Refer to the [MongoDB Installation Guide](./MONGODB_INSTALLATION.md) for detailed installation and troubleshooting steps
   - For Windows users, you can check if MongoDB is running with `sc query MongoDB` and start it with `net start MongoDB`

2. **Port Conflicts**:
   - If port 3000 or 5173 is already in use, you can change the ports in the respective configuration files:
     - Server: `.env` file (PORT variable)
     - Client: `vite.config.ts` (server.port property)

3. **Authentication Issues**:
   - The application uses JWT for authentication
   - Check that the JWT_SECRET and REFRESH_TOKEN_SECRET are properly set in the `.env` file
