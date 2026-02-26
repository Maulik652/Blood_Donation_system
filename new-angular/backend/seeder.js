const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const createAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be provided in environment variables');
    }

    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      age: 30,
      role: 'admin',
      phone: '+1234567890',
      bloodGroup: 'O+',
      location: 'Admin Office',
      isAvailable: false
    });

    console.log('Admin user created successfully');
    console.log(`Email: ${adminEmail}`);
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

createAdmin();
