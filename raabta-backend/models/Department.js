const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['General Surgery', 'Allied Surgery', 'General Medicine', 'Allied Medicine'],
    required: true
  },
  isOnCall: {
    type: Boolean,
    default: false
  },
  onCallDoctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);