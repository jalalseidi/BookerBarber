const { connectDB } = require('../config/database');
const User = require('../models/User');
const Availability = require('../models/Availability');
const Booking = require('../models/Booking');

/**
 * Clean up database and fix data quality issues
 */
async function cleanupDatabase() {
  try {
    console.log('🧹 Starting database cleanup...');
    
    await connectDB();
    
    // 1. Remove users with invalid/incomplete data
    console.log('📋 Cleaning up invalid users...');
    
    // Remove users with undefined names or empty emails
    const invalidUsers = await User.find({
      $or: [
        { name: { $in: [null, undefined, ''] } },
        { email: { $in: [null, undefined, ''] } },
        { name: /undefined/ }
      ]
    });
    
    console.log(`Found ${invalidUsers.length} invalid users:`,
      invalidUsers.map(u => ({ id: u._id, name: u.name, email: u.email }))
    );
    
    // Remove associated availability and bookings for invalid users
    for (const user of invalidUsers) {
      await Availability.deleteMany({ barberId: user._id });
      await Booking.deleteMany({ 
        $or: [
          { barberId: user._id },
          { customerId: user._id }
        ]
      });
    }
    
    // Remove invalid users
    const deletedUsers = await User.deleteMany({
      $or: [
        { name: { $in: [null, undefined, ''] } },
        { email: { $in: [null, undefined, ''] } },
        { name: /undefined/ }
      ]
    });
    
    console.log(`✅ Removed ${deletedUsers.deletedCount} invalid users and their data`);
    
    // 2. Fix remaining users - ensure they have proper names and roles
    console.log('🔧 Fixing remaining user data...');
    
    const users = await User.find({});
    let fixedCount = 0;
    
    for (const user of users) {
      let needsUpdate = false;
      const updates = {};
      
      // Fix empty or missing names
      if (!user.name || user.name.trim() === '') {
        const nameFromEmail = user.email.split('@')[0];
        updates.name = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        needsUpdate = true;
      }
      
      // Ensure role is valid
      if (!['customer', 'barber', 'admin'].includes(user.role)) {
        updates.role = 'customer'; // Default to customer
        needsUpdate = true;
      }
      
      // Ensure isActive is set
      if (user.isActive === undefined || user.isActive === null) {
        updates.isActive = true;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await User.updateOne({ _id: user._id }, updates);
        fixedCount++;
        console.log(`Fixed user ${user.email}: ${JSON.stringify(updates)}`);
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} user records`);
    
    // 3. Clean up orphaned availability records
    console.log('🧽 Cleaning up orphaned availability records...');
    
    const availabilities = await Availability.find({});
    let orphanedCount = 0;
    
    for (const availability of availabilities) {
      const barberExists = await User.findById(availability.barberId);
      if (!barberExists) {
        await Availability.deleteOne({ _id: availability._id });
        orphanedCount++;
      }
    }
    
    console.log(`✅ Removed ${orphanedCount} orphaned availability records`);
    
    // 4. Clean up orphaned bookings
    console.log('🧽 Cleaning up orphaned booking records...');
    
    const bookings = await Booking.find({});
    let orphanedBookings = 0;
    
    for (const booking of bookings) {
      const barberExists = await User.findById(booking.barberId);
      const customerExists = await User.findById(booking.customerId);
      
      if (!barberExists || !customerExists) {
        await Booking.deleteOne({ _id: booking._id });
        orphanedBookings++;
      }
    }
    
    console.log(`✅ Removed ${orphanedBookings} orphaned booking records`);
    
    // 5. Summary of cleaned data
    console.log('\n📊 Database cleanup summary:');
    const finalStats = {
      users: await User.countDocuments(),
      barbers: await User.countDocuments({ role: 'barber' }),
      customers: await User.countDocuments({ role: 'customer' }),
      availabilities: await Availability.countDocuments(),
      bookings: await Booking.countDocuments()
    };
    
    console.log('Final database state:', finalStats);
    
    // Show remaining users
    const remainingUsers = await User.find({}).select('name email role isActive');
    console.log('\n👥 Remaining users:');
    remainingUsers.forEach((user, idx) => {
      console.log(`  ${idx + 1}. ${user.name} (${user.email}) - ${user.role} - Active: ${user.isActive}`);
    });
    
    console.log('\n✅ Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run cleanup
cleanupDatabase();
