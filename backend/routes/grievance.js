const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Grievance = require('../models/Grievance');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendGrievanceSubmissionEmail, sendGrievanceStatusUpdateEmail } = require('../utils/emailService');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, text files, and Word documents are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  }
});

router.post('/', auth, upload.array('attachments', 10), async (req, res) => {
  try {
    console.log('Creating grievance with data:', req.body);
    console.log('User from token:', req.user);
    console.log('Files uploaded:', req.files);
    
    const grievanceData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      submittedBy: req.user.id
    };

    // Add file information if files were uploaded
    if (req.files && req.files.length > 0) {
      grievanceData.attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      }));
    }
    
    const grievance = new Grievance(grievanceData);
    
    console.log('Grievance object before save:', grievance);
    await grievance.save();
    console.log('Grievance saved successfully:', grievance);
    
    // Send email notification to user
    try {
      const user = await User.findById(req.user.id);
      if (user) {
        await sendGrievanceSubmissionEmail(user.email, user.name, grievance._id, grievance.title);
      }
    } catch (emailError) {
      console.error('Failed to send grievance submission email:', emailError);
      // Don't fail grievance creation if email fails
    }
    
    res.status(201).json(grievance);
  } catch (error) {
    console.error('Grievance creation error:', error);
    
    // Clean up uploaded files if there was an error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({ message: 'Failed to create grievance', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    console.log('Full user object from token:', req.user);
    
    // Check if user object is properly populated
    if (!req.user) {
      console.error('User object is missing in request');
      return res.status(401).json({ message: 'Authentication failed - user information missing' });
    }
    
    const { role, department, id } = req.user;
    
    if (!id) {
      console.error('User ID is missing in token payload');
      return res.status(401).json({ message: 'Authentication failed - user ID missing' });
    }
    
    let filter = {};

    console.log('User requesting grievances:', { role, id, department });

    // Role-based filtering
    if (role === 'dean') {
      // Dean can see all grievances
      console.log('Dean role detected - showing all grievances');
      filter = {};
    } else if (role === 'hod') {
      // HOD can see student and faculty grievances
      console.log('HOD role detected - filtering by categories');
      filter.category = { $in: ['student', 'faculty'] };
    } else {
      // Regular users (student, faculty) can only see their own grievances
      console.log('Regular user detected - filtering by submitter ID:', id);
      
      const mongoose = require('mongoose');
      
      try {
        // Ensure id is a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) {
          filter.submittedBy = mongoose.Types.ObjectId(id);
          console.log('Using ObjectId for submittedBy filter:', filter.submittedBy);
        } else {
          console.error('Invalid ObjectId format for user ID:', id);
          filter.submittedBy = id; // Fall back to using the string ID
          console.log('Using string ID for submittedBy filter:', filter.submittedBy);
        }
      } catch (idError) {
        console.error('Error converting ID to ObjectId:', idError);
        filter.submittedBy = id; // Fall back to using the string ID
        console.log('Using string ID after error for submittedBy filter:', filter.submittedBy);
      }
    }

    console.log('Applying filter:', JSON.stringify(filter));

    const grievances = await Grievance.find(filter)
      .populate('submittedBy', 'name email role department')
      .sort({ createdAt: -1 });

    console.log(`Found ${grievances.length} grievances`);
    res.json(grievances);
  } catch (error) {
    console.error('Grievance fetch error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to fetch grievances', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

// Route to download attachments
router.get('/attachments/:grievanceId/:filename', auth, async (req, res) => {
  try {
    const { grievanceId, filename } = req.params;
    
    // Check if user has access to this grievance
    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Check access permissions
    const { role } = req.user;
    let hasAccess = false;

    if (role === 'dean') {
      hasAccess = true;
    } else if (role === 'hod' && ['student', 'faculty'].includes(grievance.category)) {
      hasAccess = true;
    } else if (grievance.submittedBy.toString() === req.user.id) {
      hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find the attachment
    const attachment = grievance.attachments.find(att => att.filename === filename);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const filePath = path.join(__dirname, '..', attachment.path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath, attachment.originalName);
  } catch (error) {
    console.error('Attachment download error:', error);
    res.status(500).json({ message: 'Failed to download attachment' });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const { role } = req.user;
    const { status, comments } = req.body;

    // Only dean and hod can update status
    if (!['dean', 'hod'].includes(role)) {
      return res.status(403).json({ message: 'You do not have permission to update grievance status' });
    }

    const grievance = await Grievance.findByIdAndUpdate(
      req.params.id, 
      { status, comments }, 
      { new: true }
    ).populate('submittedBy', 'name email role department');

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Send email notification to user about status update
    try {
      if (grievance.submittedBy && grievance.submittedBy.email) {
        await sendGrievanceStatusUpdateEmail(
          grievance.submittedBy.email,
          grievance.submittedBy.name,
          grievance._id,
          grievance.title,
          status,
          comments
        );
      }
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      // Don't fail status update if email fails
    }

    res.json(grievance);
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ message: 'Failed to update grievance status' });
  }
});

// Get grievance statistics for dashboard
router.get('/stats', auth, async (req, res) => {
  try {
    const { role } = req.user;
    let filter = {};

    // Apply role-based filtering for statistics
    if (role === 'dean') {
      filter = {};
    } else if (role === 'hod') {
      filter.category = { $in: ['student', 'faculty'] };
    } else {
      filter.submittedBy = req.user.id;
    }

    const total = await Grievance.countDocuments(filter);
    const pending = await Grievance.countDocuments({ ...filter, status: 'Pending' });
    const resolved = await Grievance.countDocuments({ ...filter, status: 'Resolved' });
    const inProgress = await Grievance.countDocuments({ ...filter, status: 'In Progress' });

    res.json({
      total,
      pending,
      resolved,
      inProgress
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

module.exports = router;
