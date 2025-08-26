const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const app = express();

// Configure CORS to allow the deployed frontend
const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
app.use(express.json());

// MongoDB connection with better error handling
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Initialize predefined admin users
const initializeAdminUsers = async () => {
  try {
    console.log('Initializing admin users...');
    // Check if admin users already exist
    const deanExists = await User.findOne({ email: 'admin@cgs.com' });
    const hodExists = await User.findOne({ email: 'hod@cgs.com' });
    const adminExists = await User.findOne({ email: 'admin2@cgs.com' });

    if (!deanExists) {
      const deanPassword = await bcrypt.hash('admin123', 10);
      const deanUser = new User({
        name: 'System Administrator (Dean)',
        email: 'admin@cgs.com',
        password: deanPassword,
        role: 'dean',
        department: 'Administration',
        isPredefined: true
      });
      await deanUser.save();
      console.log('Dean user created successfully');
    } else {
      console.log('Dean user already exists');
    }

    if (!hodExists) {
      const hodPassword = await bcrypt.hash('hod123', 10);
      const hodUser = new User({
        name: 'Head of Department',
        email: 'hod@cgs.com',
        password: hodPassword,
        role: 'hod',
        department: 'General',
        isPredefined: true
      });
      await hodUser.save();
      console.log('HOD user created successfully');
    } else {
      console.log('HOD user already exists');
    }

    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin456', 10);
      const adminUser = new User({
        name: 'System Administrator',
        email: 'admin2@cgs.com',
        password: adminPassword,
        role: 'admin',
        department: 'IT',
        isPredefined: true
      });
      await adminUser.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
    
    console.log('Admin users initialization completed');
  } catch (error) {
    console.error('Error initializing admin users:', error);
  }
};

// Initialize admin users when server starts
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  initializeAdminUsers();
});

// Add error handling for MongoDB connection
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/grievances', require('./routes/grievance'));

// Add a test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running successfully!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // console.log(`Test the API at: http://localhost:${PORT}/api/test`);
});
