require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await User.deleteOne({ email: 'doctor@jpmc.com' });

    const user = await User.create({
      name: 'Dr. Ahmed Khan',
      email: 'doctor@jpmc.com',
      password: 'password123',
      role: 'senior_registrar',
      department: 'General Surgery S21',
      phone: '0300-1234567',
      designation: 'Senior Registrar'
    });

    console.log('✅ Test user created successfully!');
    console.log('📧 Email: doctor@jpmc.com');
    console.log('🔑 Password: password123');
    console.log('🏥 Department:', user.department);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestUser();