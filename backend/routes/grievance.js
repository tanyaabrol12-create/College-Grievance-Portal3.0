const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Grievance = require('../models/Grievance');
const User = require('../models/User');
const auth = require('../middleware/auth');
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
    const { role, department } = req.user;
    let filter = {};

    // Role-based filtering
    if (role === 'dean') {
      // Dean can see all grievances
      filter = {};
    } else if (role === 'admin') {
      // Admin can see staff, network, and security grievances
      filter.category = { $in: ['staff', 'network', 'security'] };
    } else if (role === 'hod') {
      // HOD can see student and faculty grievances
      filter.category = { $in: ['student', 'faculty'] };
    } else {
      // Regular users (student, faculty) can only see their own grievances
      filter.submittedBy = req.user.id;
    }

    const grievances = await Grievance.find(filter)
      .populate('submittedBy', 'name email role department')
      .sort({ createdAt: -1 });

    res.json(grievances);
  } catch (error) {
    console.error('Grievance fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch grievances' });
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
    } else if (role === 'admin' && ['staff', 'network', 'security'].includes(grievance.category)) {
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
    const { status } = req.body;

    // Only admin, dean, and hod can update status
    if (!['admin', 'dean', 'hod'].includes(role)) {
      return res.status(403).json({ message: 'You do not have permission to update grievance status' });
    }

    const grievance = await Grievance.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    ).populate('submittedBy', 'name email role department');

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
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
    } else if (role === 'admin') {
      filter.category = { $in: ['staff', 'network', 'security'] };
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
