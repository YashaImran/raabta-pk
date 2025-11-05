const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get on-call doctors
router.get('/', auth, async (req, res) => {
  try {
    const doctors = await User.find({ isOnCall: true }).select('-password');
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle on-call status
router.put('/toggle', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.isOnCall = !user.isOnCall;
    await user.save();
    
    res.json({ success: true, isOnCall: user.isOnCall });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;