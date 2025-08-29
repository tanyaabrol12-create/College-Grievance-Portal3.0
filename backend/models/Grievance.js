const mongoose = require('mongoose');

const GrievanceSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  status: { type: String, default: 'Pending' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: String,
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Grievance', GrievanceSchema);
