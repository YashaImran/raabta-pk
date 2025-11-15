require('dotenv').config();
const mongoose = require('mongoose');
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
    role: 'doctor',
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

    // Clear existing data
    await User.deleteMany({});
    await Consultation.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await User.insertMany(testUsers);
    console.log(`✅ Created ${createdUsers.length} test users`);

    // Display test user credentials
    console.log('\n📋 TEST USER CREDENTIALS:');
    console.log('=' .repeat(60));
    testUsers.forEach(user => {
      console.log(`\nName: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Department: ${user.department}`);
      console.log(`Role: ${user.role}`);
      console.log('-'.repeat(60));
    });

    // Create sample consultations
    const ahmedUser = createdUsers.find(u => u.email === 'ahmed.khan@jpmc.pk');
    const hassanUser = createdUsers.find(u => u.email === 'hassan.ali@jpmc.pk');
    const saraUser = createdUsers.find(u => u.email === 'sara.ahmed@jpmc.pk');

    const sampleConsultations = [
      {
        from_department: 'S21',
        to_department: 'Neurosurgery',
        patient_mrn: '12345',
        urgency: 'urgent',
        clinical_question: 'Patient with head injury, GCS 12, needs urgent evaluation',
        requested_by: ahmedUser._id,
        requested_by_name: ahmedUser.name,
        status: 'pending',
        created_at: new Date(Date.now() - 15 * 60000) // 15 minutes ago
      },
      {
        from_department: 'S21',
        to_department: 'Cardiology',
        patient_mrn: '45678',
        urgency: 'routine',
        clinical_question: 'Post-op day 2, evaluate cardiac status before discharge. ECG shows minor changes',
        requested_by: ahmedUser._id,
        requested_by_name: ahmedUser.name,
        status: 'accepted',
        response_message: 'Patient evaluated. ECG changes are non-specific. Will see in clinic in 1 week. Cleared for discharge.',
        estimated_time: '30 minutes',
        responded_by: saraUser._id,
        responded_by_name: saraUser.name,
        response_time: new Date(Date.now() - 60 * 60000), // 1 hour ago
        created_at: new Date(Date.now() - 2 * 60 * 60000) // 2 hours ago
      },
      {
        from_department: 'M4',
        to_department: 'Neurosurgery',
        patient_mrn: '78901',
        urgency: 'stat',
        clinical_question: 'Acute altered consciousness, possible stroke. BP 180/110, please see STAT',
        requested_by: createdUsers.find(u => u.email === 'fatima.malik@jpmc.pk')._id,
        requested_by_name: 'Dr. Fatima Malik',
        status: 'pending',
        created_at: new Date(Date.now() - 5 * 60000) // 5 minutes ago
      }
    ];

    await Consultation.insertMany(sampleConsultations);
    console.log(`\n✅ Created ${sampleConsultations.length} sample consultations`);

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