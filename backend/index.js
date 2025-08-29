const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const app = express();

// Configure CORS to allow both localhost and deployed frontend
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// MongoDB connection with better error handling
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // 5 seconds timeout for server selection
})
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
    const deanExists = await User.findOne({ email: process.env.ADMIN_ID });
    const hodExists = await User.findOne({ email: process.env.HOD_ID });
    
    // Check if any user exists with MAIN_EMAIL before trying to create admin
    const adminEmailExists = await User.findOne({ email: process.env.MAIN_EMAIL });
    // const adminExists = adminEmailExists && adminEmailExists.role === 'admin';

    if (!deanExists) {
      const deanPassword = await bcrypt.hash(process.env.ADMIN_PASS, 10);
      const deanUser = new User({
        name: 'System Administrator (Dean)',
        email: process.env.ADMIN_ID,
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
      const hodPassword = await bcrypt.hash(process.env.HOD_PASS, 10);
      const hodUser = new User({
        name: 'Head of Department',
        email: process.env.HOD_ID,
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

//     if (!adminEmailExists) {
//       const adminPassword = await bcrypt.hash(process.env.MAIN_PASS, 10);
//       const adminUser = new User({
//         name: 'System Administrator',
//         email: process.env.MAIN_EMAIL,
//         password: adminPassword,
//         role: 'admin',
//         department: 'IT',
//         isPredefined: true
//       });
//       await adminUser.save();
//       console.log('Admin user created successfully');
//     } else if (!adminExists) {
//       console.log('Email already in use but not as admin. Skipping admin creation.');
//     } else {
//       console.log('Admin user already exists');
//     }
    
//     console.log('Admin users initialization completed');
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
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // console.log(`Test the API at: http://localhost:${PORT}/api/test`);
});