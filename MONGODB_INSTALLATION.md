# MongoDB Installation Guide

This guide provides detailed instructions for installing MongoDB on different operating systems, with a focus on Windows since that appears to be your current environment.

## Installing MongoDB on Windows

### Method 1: Using the MongoDB Installer (Recommended)

1. **Download the MongoDB Community Server**:
   - Visit the [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Select the following options:
     - Version: Latest version (or at least 4.4 as required by the application)
     - Platform: Windows
     - Package: MSI
   - Click the "Download" button

2. **Run the MongoDB Installer**:
   - Locate the downloaded .msi file and double-click to run it
   - Follow the installation wizard:
     - Accept the license agreement
     - Choose "Complete" installation type
     - Keep the default installation directory (typically `C:\Program Files\MongoDB\Server\[version]`)
     - Select "Install MongoDB as a Service" (recommended)
     - Choose "Run service as Network Service user"
     - Keep the default data directory (`C:\Program Files\MongoDB\Server\[version]\data\db`) or choose a different location
     - Complete the installation

3. **Verify the Installation**:
   - Open Command Prompt as Administrator
   - Run the following command to check if MongoDB is installed:
     ```
     mongod --version
     ```
   - You should see the MongoDB version information

4. **Start MongoDB Service**:
   - MongoDB should be running as a Windows service if you selected that option during installation
   - To verify the service is running, open Command Prompt as Administrator and run:
     ```
     sc query MongoDB
     ```
   - If the service is not running, start it with:
     ```
     net start MongoDB
     ```

### Method 2: Using MongoDB Atlas (Cloud Option)

If you prefer not to install MongoDB locally, you can use MongoDB Atlas, which is a cloud-based MongoDB service:

1. **Create a MongoDB Atlas Account**:
   - Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Sign up for a free account

2. **Create a Cluster**:
   - After signing in, create a new cluster (the free tier is sufficient for development)
   - Choose a cloud provider and region close to your location

3. **Configure Network Access**:
   - In the Atlas dashboard, go to "Network Access"
   - Add your current IP address or allow access from anywhere (for development only)

4. **Create a Database User**:
   - In the Atlas dashboard, go to "Database Access"
   - Create a new database user with a username and password

5. **Get Your Connection String**:
   - In the Atlas dashboard, click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

6. **Update Your .env File**:
   - Replace the `DATABASE_URL` in your `.env` file with the Atlas connection string
   - Replace `<username>` and `<password>` with your database user credentials
   - Replace `<dbname>` with `BarberBooker`

## Installing MongoDB on macOS

### Using Homebrew

1. **Install Homebrew** (if not already installed):
   ```
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install MongoDB**:
   ```
   brew tap mongodb/brew
   brew install mongodb-community
   ```

3. **Start MongoDB Service**:
   ```
   brew services start mongodb-community
   ```

## Installing MongoDB on Linux (Ubuntu)

1. **Import the MongoDB public GPG key**:
   ```
   wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
   ```

2. **Create a list file for MongoDB**:
   ```
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
   ```

3. **Update the package list**:
   ```
   sudo apt-get update
   ```

4. **Install MongoDB**:
   ```
   sudo apt-get install -y mongodb-org
   ```

5. **Start MongoDB Service**:
   ```
   sudo systemctl start mongod
   ```

6. **Enable MongoDB to start on boot**:
   ```
   sudo systemctl enable mongod
   ```

## Verifying Your MongoDB Installation

After installing MongoDB, you should verify that it's running correctly:

1. **Check the MongoDB Service**:
   - On Windows: `sc query MongoDB`
   - On macOS: `brew services list | grep mongodb`
   - On Linux: `sudo systemctl status mongod`

2. **Connect to MongoDB**:
   - Open a terminal or command prompt
   - Run the MongoDB shell:
     ```
     mongosh
     ```
   - If MongoDB is running correctly, you should see the MongoDB shell prompt

3. **Create a Test Database**:
   - In the MongoDB shell, run:
     ```
     use testdb
     db.test.insertOne({ name: "Test Document" })
     db.test.find()
     ```
   - If you see the document you just inserted, MongoDB is working correctly

## Troubleshooting

### Common Issues on Windows

1. **Service Not Starting**:
   - Check Windows Services (press Win+R, type `services.msc`)
   - Find MongoDB service and check its status
   - If it's not running, try starting it manually
   - Check Windows Event Viewer for error messages

2. **Port Conflicts**:
   - MongoDB uses port 27017 by default
   - If another application is using this port, MongoDB won't start
   - Change the port in the MongoDB configuration file or stop the conflicting application

3. **Data Directory Permissions**:
   - Ensure the MongoDB user has write permissions to the data directory
   - By default, this is `C:\Program Files\MongoDB\Server\[version]\data\db`

4. **Firewall Issues**:
   - Make sure Windows Firewall allows MongoDB connections
   - Add an exception for MongoDB in your firewall settings

### Connection String Issues

If you're having trouble connecting to MongoDB with the connection string in your `.env` file:

1. **Local MongoDB**:
   - For a local MongoDB installation, use:
     ```
     DATABASE_URL=mongodb://localhost:27017/BarberBooker
     ```

2. **MongoDB Atlas**:
   - For MongoDB Atlas, use the connection string provided by Atlas:
     ```
     DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/BarberBooker?retryWrites=true&w=majority
     ```

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB University](https://university.mongodb.com/) - Free online courses
- [MongoDB Community Forums](https://www.mongodb.com/community/forums/)