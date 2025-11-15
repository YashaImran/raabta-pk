const Consultation = require('../models/Consultation');

// Create Consultation
exports.createConsultation = async (req, res) => {
  try {
    const { from, to, mrn, urgency, question } = req.body;

    // Validate required fields
    if (!to || !mrn || !question) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide department, MRN, and clinical question' 
      });
    }

    const consultation = await Consultation.create({
      from_department: from || req.user.department,
      to_department: to,
      patient_mrn: mrn,
      urgency: urgency || 'routine',
      clinical_question: question,
      requested_by: req.user._id,
      requested_by_name: req.user.name,
      status: 'pending'
    });

    // Populate the created consultation
    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate('requested_by', 'name department')
      .populate('responded_by', 'name department');

    // Emit socket event for real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('newConsultation', populatedConsultation);
    }

    res.status(201).json({ 
      success: true, 
      consultation: populatedConsultation,
      message: 'Consultation created successfully'
    });
  } catch (error) {
    console.error('Create consultation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating consultation',
      error: error.message 
    });
  }
};

// Get All Consultations
exports.getConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate('requested_by', 'name department email')
      .populate('responded_by', 'name department email')
      .sort({ created_at: -1 });

    res.json({ 
      success: true, 
      consultations,
      count: consultations.length 
    });
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching consultations',
      error: error.message 
    });
  }
};

// Get My Requested Consultations
exports.getMyRequests = async (req, res) => {
  try {
    const consultations = await Consultation.find({ 
      from_department: req.user.department 
    })
      .populate('requested_by', 'name department')
      .populate('responded_by', 'name department')
      .sort({ created_at: -1 });

    res.json({ 
      success: true, 
      consultations,
      count: consultations.length 
    });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching your consultations',
      error: error.message 
    });
  }
};

// Get Consultations Assigned to Me
exports.getMyAssigned = async (req, res) => {
  try {
    const consultations = await Consultation.find({ 
      to_department: req.user.department 
    })
      .populate('requested_by', 'name department email')
      .populate('responded_by', 'name department')
      .sort({ created_at: -1 });

    res.json({ 
      success: true, 
      consultations,
      count: consultations.length 
    });
  } catch (error) {
    console.error('Get assigned consultations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching assigned consultations',
      error: error.message 
    });
  }
};

// Respond to Consultation
exports.respondToConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, response_message, estimated_time } = req.body;

    // Validate
    if (!action || !response_message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide action and response message' 
      });
    }

    if (action === 'accept' && !estimated_time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide estimated time for accepted consultations' 
      });
    }

    // Find consultation
    const consultation = await Consultation.findById(id);
    
    if (!consultation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Consultation not found' 
      });
    }

    // Check if user's department matches the consultation's to_department
    if (consultation.to_department !== req.user.department) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to respond to this consultation' 
      });
    }

    // Update consultation
    consultation.status = action === 'accept' ? 'accepted' : 'declined';
    consultation.response_message = response_message;
    consultation.estimated_time = action === 'accept' ? estimated_time : null;
    consultation.responded_by = req.user._id;
    consultation.responded_by_name = req.user.name;
    consultation.response_time = new Date();

    await consultation.save();

    // Populate for response
    const populatedConsultation = await Consultation.findById(id)
      .populate('requested_by', 'name department email')
      .populate('responded_by', 'name department email');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('consultationResponse', populatedConsultation);
    }

    res.json({ 
      success: true, 
      consultation: populatedConsultation,
      message: `Consultation ${action}ed successfully`
    });
  } catch (error) {
    console.error('Respond to consultation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error responding to consultation',
      error: error.message 
    });
  }
};

// Get single consultation by ID
exports.getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const consultation = await Consultation.findById(id)
      .populate('requested_by', 'name department email')
      .populate('responded_by', 'name department email');

    if (!consultation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Consultation not found' 
      });
    }

    res.json({ 
      success: true, 
      consultation 
    });
  } catch (error) {
    console.error('Get consultation by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching consultation',
      error: error.message 
    });
  }
};