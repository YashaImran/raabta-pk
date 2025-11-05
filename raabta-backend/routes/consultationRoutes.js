const express = require('express');
const router = express.Router();
const {
  createConsultation,
  getConsultations,
  getMyRequests,
  getMyAssigned,
  respondToConsultation
} = require('../controllers/consultationController');
const auth = require('../middleware/auth');

router.post('/', auth, createConsultation);
router.get('/', auth, getConsultations);
router.get('/my-requests', auth, getMyRequests);
router.get('/my-assigned', auth, getMyAssigned);
router.put('/:id/respond', auth, respondToConsultation);

module.exports = router;