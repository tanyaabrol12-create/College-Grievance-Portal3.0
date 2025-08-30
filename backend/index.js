const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const allowedOrigin = [process.env.FRONTEND_URL,"http://localhost:3000/"];

app.use(cors({
  origin: allowedOrigin,
  credentials: true, 
  // if you use cookies or authentication
}));

app.use(express.json());

// MongoDB connection with better error handling
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000 // 5 seconds timeout for server selection
})
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    console.error('Tried URI:', mongoUri);
  });

// Initialize predefined admin users
const initializeAdminUsers = async () => {
  try {
    console.log('Initializing admin users...');
    // Check if admin users already exist
    const deanExists = await User.findOne({ email: process.env.ADMIN_ID });
    const hodExists = await User.findOne({ email: process.env.HOD_ID });
    
    if (!deanExists && process.env.ADMIN_ID && process.env.ADMIN_PASS) {
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

    if (!hodExists && process.env.HOD_ID && process.env.HOD_PASS) {
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
    
    console.log('Admin users (Dean and HOD) initialization completed');
  } catch (error) {
    console.error('Error initializing admin users:', error);
  }
};

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  initializeAdminUsers();
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/grievances', require('./routes/grievance'));

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running successfully!' });
})

let PORT = process.env.BACKEND_PORT || process.env.PORT || 5000;
if (process.env.PORT === '3000' && !process.env.BACKEND_PORT) {
  PORT = 5000;
  console.log('Detected PORT=3000 in env; using 5000 for backend to avoid conflict');
}
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});