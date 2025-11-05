const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  mrn: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    enum: ['stat', 'urgent', 'routine'],
    required: true
  },
  question: {
    type: String,
    required: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed'],
    default: 'pending'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  response: {
    type: String,
    maxlength: 1000
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responseTime: {
    type: Date
  },
  estimatedTime: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Consultation', consultationSchema);