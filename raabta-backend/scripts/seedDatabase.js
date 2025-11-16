require('dotenv').config();
const mongoose = require('mongoose');

// Clear Mongoose model cache to prevent schema conflicts
delete mongoose.connection.models['User'];
delete mongoose.connection.models['Consultation'];

const User = require('../models/User');
const Consultation = require('../models/Consultation');

// Test Users Data
const testUsers = [
  {
    name: 'Dr. Ahmed Khan',
    email: 'ahmed.khan@jpmc.pk',
    password: 'test123',
    department: 'S21',
    role: 'senior_registrar',
    designation: 'Senior Registrar',
    specialization: 'General Surgery'
  },
  {
    name: 'Dr. Hassan Ali',
    email: 'hassan.ali@jpmc.pk',
    password: 'test123',
    department: 'Neurosurgery',
    role: 'senior_registrar',
    designation: 'Senior Registrar',
    specialization: 'Neurosurgery',
    on_call_status: true
  },
  {
    name: 'Dr. Sara Ahmed',
    email: 'sara.ahmed@jpmc.pk',
    password: 'test123',
    department: 'Cardiology',
    role: 'consultant',
    designation: 'Consultant',
    specialization: 'Cardiology',
    on_call_status: true
  },
  {
    name: 'Dr. Fatima Malik',
    email: 'fatima.malik@jpmc.pk',
    password: 'test123',
    department: 'M4',
    role: 'senior_registrar',
    designation: 'Medical Officer',
    specialization: 'Internal Medicine'
  },
  {
    name: 'Dr. Zainab Hussain',
    email: 'zainab.hussain@jpmc.pk',
    password: 'test123',
    department: 'Pediatrics',
    role: 'senior_registrar',
    designation: 'Senior Registrar',
    specialization: 'Pediatrics'
  }
];

// Connect to Database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed Database
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Force drop collections with the old schema
    try {
      await mongoose.connection.db.dropCollection('users');
      console.log('🗑️  Dropped users collection');
    } catch (e) {
      console.log('ℹ️  Users collection did not exist');
    }
    
    try {
      await mongoose.connection.db.dropCollection('consultations');
      console.log('🗑️  Dropped consultations collection');
    } catch (e) {
      console.log('ℹ️  Consultations collection did not exist');
    }


// Re-require the model with correct schema
const ConsultationFresh = require('../models/Consultation');

    // Create users with the correct schema
    const createdUsers = await User.create(testUsers);
    console.log(`✅ Created ${createdUsers.length} test users`);

    // Display test user credentials
    console.log('\n📋 TEST USER CREDENTIALS:');
    console.log('='.repeat(60));
    testUsers.forEach(user => {
      console.log(`\nName: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Department: ${user.department}`);
      console.log(`Role: ${user.role}`);
      console.log('-'.repeat(60));
    });

// Skip creating sample consultations for now - we'll create them via the app
console.log('\n⏭️  Skipped creating sample consultations (will create via app)');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n💡 You can now login with any of the above credentials');
    console.log('   Frontend URL: https://raabta-pk.vercel.app/');
    console.log('   Backend URL: https://raabta-pk-production.up.railway.app/');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeder
connectDB().then(() => seedDatabase());