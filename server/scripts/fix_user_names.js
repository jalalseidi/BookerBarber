/**
 * Script to fix missing user names in the database
 * This script will update users who don't have a name field
 */

// Load environment variables
const path = require('path');
const envFile = process.env.USE_PRODUCTION ? '.env.production' : '.env';
require('dotenv').config({ path: path.join(__dirname, '..', envFile) });

console.log(`Using environment: ${envFile}`);
console.log(`Database URL: ${process.env.DATABASE_URL?.substring(0, 30)}...`);
const mongoose = require('mongoose');
const User = require('../models/User');

async function fixUserNames() {
  try {
    // Connect to database
    console.log('Connecting to database...');
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to database');

    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // If user doesn't have a name or name is empty
      if (!user.name || user.name.trim() === '') {
        // Generate a name from email (part before @)
        const emailName = user.email.split('@')[0];
        const capitalizedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        
        user.name = capitalizedName;
        await user.save();
        
        console.log(`✓ Fixed user ${user._id}: ${user.email} -> name: "${capitalizedName}"`);
        fixedCount++;
      } else {
        console.log(`- Skipped user ${user._id}: ${user.email} (already has name: "${user.name}")`);
        skippedCount++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total users: ${users.length}`);
    console.log(`Fixed: ${fixedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log('\nAll user names have been fixed!');

  } catch (error) {
    console.error('Error fixing user names:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
fixUserNames();
