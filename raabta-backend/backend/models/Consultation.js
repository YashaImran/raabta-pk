const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  // Department Information
  from_department: {
    type: String,
    required: true,
    trim: true
  },
  to_department: {
    type: String,
    required: true,
    trim: true
  },
  
  // Patient Information
  patient_mrn: {
    type: String,
    required: true,
    trim: true
  },
  
  // Consultation Details
  urgency: {
    type: String,
    enum: ['stat', 'urgent', 'routine'],
    default: 'routine'
  },
  clinical_question: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed'],
    default: 'pending'
  },
  
  // Response Details
  response_message: {
    type: String,
    maxlength: 1000
  },
  estimated_time: {
    type: String
  },
  
  // User References
  requested_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requested_by_name: {
    type: String,
    required: true
  },
  responded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responded_by_name: {
    type: String
  },
  
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now
  },
  response_time: {
    type: Date
  },
  viewed_at: {
    type: Date
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Indexes for faster queries
consultationSchema.index({ from_department: 1, status: 1 });
consultationSchema.index({ to_department: 1, status: 1 });
consultationSchema.index({ created_at: -1 });

module.exports = mongoose.model('Consultation', consultationSchema);