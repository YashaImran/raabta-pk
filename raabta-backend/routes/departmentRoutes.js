const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const auth = require('../middleware/auth');

// Get all departments
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find().populate('onCallDoctors', 'name designation phone');
    res.json({ success: true, departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;