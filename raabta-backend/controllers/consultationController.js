const Consultation = require('../models/Consultation');

// Create Consultation
exports.createConsultation = async (req, res) => {
  try {
    const { from, to, mrn, urgency, question } = req.body;

    const consultation = await Consultation.create({
      from,
      to,
      mrn,
      urgency,
      question,
      requestedBy: req.user.id
    });

    // Emit socket event for real-time notification
    const io = req.app.get('io');
    io.emit('newConsultation', consultation);

    res.status(201).json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Consultations
exports.getConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate('requestedBy', 'name department')
      .populate('respondedBy', 'name department')
      .sort({ createdAt: -1 });

    res.json({ success: true, consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get My Requested Consultations
exports.getMyRequests = async (req, res) => {
  try {
    const consultations = await Consultation.find({ from: req.user.department })
      .populate('requestedBy', 'name')
      .populate('respondedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Consultations Assigned to Me
exports.getMyAssigned = async (req, res) => {
  try {
    const consultations = await Consultation.find({ to: req.user.department })
      .populate('requestedBy', 'name department')
      .populate('respondedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Respond to Consultation
exports.respondToConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response, estimatedTime } = req.body;

    const consultation = await Consultation.findByIdAndUpdate(
      id,
      {
        status,
        response,
        estimatedTime,
        respondedBy: req.user.id,
        responseTime: new Date()
      },
      { new: true }
    ).populate('requestedBy respondedBy', 'name department');

    // Emit socket event
    const io = req.app.get('io');
    io.emit('consultationResponse', consultation);

    res.json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};