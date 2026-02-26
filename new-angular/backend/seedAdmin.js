const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be provided in environment variables');
    }

    // Check if admin exists
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    // Create admin user
    const admin = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword,
      age: 30,
      role: 'admin',
      phone: '+1234567890',
      bloodGroup: 'O+',
      location: 'Admin Office'
    });

    console.log('Admin user created successfully');
    console.log(`Email: ${adminEmail}`);

    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedAdmin();
