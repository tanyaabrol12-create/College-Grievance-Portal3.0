const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/emailService');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    
    console.log('Registration attempt for:', { name, email, role, department });
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Registration failed: User already exists with email:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Prevent registration of admin and hod roles
    if (role === 'admin' || role === 'hod' || role === 'dean') {
      console.log('Registration failed: Attempted to register restricted role:', role);
      return res.status(403).json({ message: 'Admin, HOD, and Dean users cannot be registered. Please use predefined credentials.' });
    }

    // Validate required fields
    if (!name || !email || !password || !role || !department) {
      console.log('Registration failed: Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role, 
      department,
      isPredefined: false
    });
    
    const savedUser = await user.save();
    console.log('User registered successfully:', email);
    
    // Send welcome email
    try {
      await sendWelcomeEmail(email, name);
      console.log('Welcome email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }
    
    // Create user object without password for response
    const userResponse = {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      department: savedUser.department,
      isPredefined: savedUser.isPredefined
    };

    // Generate JWT token for automatic login
    const secret = process.env.JWT_SECRET || 'secret';
    console.log('Using JWT secret for signing:', secret);
    
    const payload = { 
      id: savedUser._id.toString(), // Ensure ID is a string
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role, 
      department: savedUser.department,
      isPredefined: savedUser.isPredefined
    };
    
    console.log('Token payload:', JSON.stringify(payload));
    
    const token = jwt.sign(
      payload, 
      secret, 
      { expiresIn: '24h' } // Token expires in 24 hours
    );
    
    console.log('Token generated successfully for new user');
    
    // Return token and user data for automatic login
    res.status(201).json({ 
      message: 'User registered successfully', 
      token, 
      user: userResponse 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Login successful for user:', email);

    // Create user object without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isPredefined: user.isPredefined
    };

    const secret = process.env.JWT_SECRET || 'secret';
    console.log('Using JWT secret for signing:', secret);
    
    const payload = { 
      id: user._id.toString(), // Ensure ID is a string
      name: user.name,
      email: user.email,
      role: user.role, 
      department: user.department,
      isPredefined: user.isPredefined
    };
    
    console.log('Token payload:', JSON.stringify(payload));
    
    const token = jwt.sign(
      payload, 
      secret,
      { expiresIn: '24h' } // Token expires in 24 hours
    );
    console.log('Token generated successfully');
    
    // Verify the token immediately to ensure it's valid
    try {
      const verified = jwt.verify(token, secret);
      console.log('Token verification successful:', JSON.stringify(verified));
    } catch (verifyError) {
      console.error('Token verification failed immediately after generation:', verifyError);
      return res.status(500).json({ message: 'Failed to generate a valid authentication token' });
    }
    
    res.json({ token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.', error: error.message });
  }
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email address' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP to database with expiration
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    // Remove any existing OTP for this email
    await PasswordReset.deleteMany({ email });
    
    // Save new OTP
    const passwordReset = new PasswordReset({
      email,
      otp,
      expiresAt
    });
    await passwordReset.save();

    // Send email with OTP
    await sendPasswordResetEmail(email, otp);
    
    res.json({ message: 'Password reset OTP sent to your email address' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send password reset email. Please try again.' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Find the password reset record
    const passwordReset = await PasswordReset.findOne({ 
      email, 
      otp,
      expiresAt: { $gt: new Date() } // Check if not expired
    });
    
    if (!passwordReset) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Failed to verify OTP. Please try again.' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    // Verify OTP again
    const passwordReset = await PasswordReset.findOne({ 
      email, 
      otp,
      expiresAt: { $gt: new Date() }
    });
    
    if (!passwordReset) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    user.password = hashedPassword;
    await user.save();
    
    // Remove the used OTP
    await PasswordReset.deleteOne({ email, otp });
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Failed to reset password. Please try again.' });
  }
});

module.exports = router;