const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createConsultation,
  getConsultations,
  getMyRequests,
  getMyAssigned,
  respondToConsultation,
  getConsultationById
} = require('../controllers/consultationController');

// All routes require authentication
router.use(auth);

// @route   POST /api/consultations
// @desc    Create new consultation
// @access  Private
router.post('/', createConsultation);

// @route   GET /api/consultations
// @desc    Get all consultations (for the logged-in user's relevant dept)
// @access  Private
router.get('/', getConsultations);

// @route   GET /api/consultations/my-requests
// @desc    Get consultations requested by me
// @access  Private
router.get('/my-requests', getMyRequests);

// @route   GET /api/consultations/assigned
// @desc    Get consultations assigned to my department
// @access  Private
router.get('/assigned', getMyAssigned);

// @route   GET /api/consultations/:id
// @desc    Get single consultation by ID
// @access  Private
router.get('/:id', getConsultationById);

// @route   PUT /api/consultations/:id/respond
// @desc    Respond to consultation (accept/decline)
// @access  Private
router.put('/:id/respond', respondToConsultation);

module.exports = router;