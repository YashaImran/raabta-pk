import { useState, useEffect } from 'react';
import { Phone, Users, FileText, Home, Clock, Bell, Send, Search, CheckCircle, AlertCircle, X, Menu, ChevronRight, Link2, MessageSquare, ThumbsDown, LogOut } from 'lucide-react';

import api from './config/api';
// RequestConsultation Component (moved outside for stable state)
const RequestConsultation = ({ loggedInUser, departments, handleConsultationSubmit }) => {
  const [formData, setFormData] = useState({
    to: '',
    mrn: '',
    urgency: 'routine',
    question: ''
  });

  const allDepts = Object.values(departments).flat();

  const handleSubmit = async () => {
    if (!formData.to || !formData.mrn || !formData.question) {
      alert('Please fill in all required fields (Department, MRN, and Clinical Question)');
      return;
    }

    try {
      const submissionData = {
        ...formData,
        from: loggedInUser?.department
      };
      
      await handleConsultationSubmit(submissionData);
      
      setFormData({
        to: '',
        mrn: '',
        urgency: 'routine',
        question: ''
      });
      
      alert('✅ Consultation request submitted successfully!');
      
    } catch (error) {
      console.error('Error submitting consultation:', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Request Consultation</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">From Department</label>
          <input
            type="text"
            value={loggedInUser?.department || ''}
            disabled
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            To Department <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.to}
            onChange={(e) => setFormData({...formData, to: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select department...</option>
            {allDepts.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Patient MRN <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.mrn}
            onChange={(e) => setFormData({...formData, mrn: e.target.value})}
            placeholder="Medical Record Number"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Urgency Level</label>
          <div className="flex gap-3">
            {['stat', 'urgent', 'routine'].map(level => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData({...formData, urgency: level})}
                className={`flex-1 py-3 rounded-xl font-bold transition ${
                  formData.urgency === level 
                    ? level === 'stat' ? 'bg-red-500 text-white shadow-lg' :
                      level === 'urgent' ? 'bg-orange-500 text-white shadow-lg' :
                      'bg-emerald-500 text-white shadow-lg'
                    : level === 'stat' ? 'bg-red-50 text-red-600 border-2 border-red-200' :
                      level === 'urgent' ? 'bg-orange-50 text-orange-600 border-2 border-orange-200' :
                      'bg-emerald-50 text-emerald-600 border-2 border-emerald-200'
                }`}
              >
                {level.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Clinical Question <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.question}
            onChange={(e) => setFormData({...formData, question: e.target.value})}
            placeholder="Describe the clinical situation and your question..."
            rows="4"
            maxLength="500"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 resize-none"
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {formData.question.length}/500
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg flex items-center justify-center gap-2"
        >
          <Send />
          Submit Request
        </button>
      </div>
    </div>
  );
};
const RaabtaApp = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [respondingToConsult, setRespondingToConsult] = useState(null);

  const departments = {
    'General Surgery': ['S21', 'S26', 'S3', 'S2'],
    'Allied Surgery': ['Neurosurgery', 'Plastic Surgery', 'Vascular Surgery', 'Anesthesiology', 'Gynaecology'],
    'General Medicine': ['M4', 'M5', 'M6', 'M7'],
    'Allied Medicine': ['Psychiatry', 'Oncology', 'Pediatrics', 'Dermatology', 'Cardiology']
  };

  const onCallDoctors = {
    'Neurosurgery': [
      { name: 'Dr. M. Hassan', designation: 'Senior Registrar', onCall: true, phone: '***-***-1234' }
    ],
    'Cardiology': [
      { name: 'Dr. S. Ahmed', designation: 'Consultant', onCall: true, phone: '***-***-5678' }
    ],
    'General Surgery S21': [
      { name: 'Dr. K. Ali', designation: 'Senior Registrar', onCall: true, phone: '***-***-9012' }
    ]
  };

  const onCallDepartments = ['Neurosurgery', 'Cardiology', 'General Surgery S21'];

  useEffect(() => {
    if (loggedInUser) {
      fetchConsultations();
      const interval = setInterval(fetchConsultations, 10000);
      return () => clearInterval(interval);
    }
  }, [loggedInUser]);

 const fetchConsultations = async () => {
  try {
    const response = await api.get('/consultations');
    setConsultations(response.data.consultations || []);
  } catch (error) {
    console.error('Error fetching consultations:', error);
  }
};

const handleLogin = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });

    if (response.data.success) {
      setLoggedInUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      setCurrentPage('dashboard');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed: ' + (error.response?.data?.message || 'Invalid credentials'));
  }
};
    
const handleConsultationSubmit = async (formData) => {
  try {
    await api.post('/consultations', formData);
    await fetchConsultations();
    setCurrentPage('dashboard');
  } catch (error) {
    console.error('Error submitting consultation:', error);
    alert('Error creating consultation: ' + (error.response?.data?.message || 'Please try again'));
    throw error; // Re-throw so handleSubmit knows it failed
  }
};

 const handleRespondToConsult = async (consultId, responseData) => {
  try {
    await api.put(`/consultations/${consultId}/respond`, responseData);
    await fetchConsultations();
    setRespondingToConsult(null);
  } catch (error) {
    console.error('Error responding to consultation:', error);
    alert('Error responding to consultation');
  }
};

  const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-emerald-100">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-3">
              <div className="transform -rotate-3 text-white">
                <Link2 size={48} />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Raabta <span className="text-2xl font-normal text-gray-400">PK</span>
            </h1>
            <p className="text-gray-600 font-medium">Interdepartmental Consultation System</p>
            <p className="text-sm text-emerald-600 mt-1">Connecting Healthcare Teams</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
            
            <button
              onClick={() => handleLogin(email, password)}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg"
            >
              Login to Raabta
            </button>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              <p>🔒 Connected to Backend! 🎉</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Dashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-lg text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {loggedInUser?.name}</h2>
        <p className="text-emerald-50">{loggedInUser?.department}</p>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
          <span>Online & Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setCurrentPage('request')}
          className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition border-2 border-emerald-100"
        >
          <div className="mb-3 text-emerald-600"><FileText size={32} /></div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">Request Consultation</h3>
          <p className="text-gray-600">Submit new consultation request</p>
        </button>

        <button
          onClick={() => setCurrentPage('oncall')}
          className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition border-2 border-teal-100"
        >
          <div className="mb-3 text-teal-600"><Users size={32} /></div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">On-Call Directory</h3>
          <p className="text-gray-600">View available doctors</p>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <div className="text-4xl font-bold text-orange-600">
              {consultations.filter(c => c.status === 'pending' && c.to_department === loggedInUser?.department).length}
            </div>
            <div className="text-sm text-gray-600 mt-1 font-medium">Pending Consults</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="text-4xl font-bold text-emerald-600">{onCallDepartments.length}</div>
            <div className="text-sm text-gray-600 mt-1 font-medium">Departments On-Call</div>
          </div>
        </div>
      </div>
    </div>
  );



  const OnCallDirectory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const allDepts = Object.values(departments).flat();
    const filteredDepts = allDepts.filter(dept => 
      dept.toLowerCase().includes(searchTerm.toLowerCase()) && onCallDepartments.includes(dept)
    );

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2">
            <Search />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredDepts.map(dept => {
            const doctors = onCallDoctors[dept] || [];
            
            return (
              <div
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className="bg-white rounded-2xl p-5 shadow-md border-2 border-emerald-200 cursor-pointer hover:shadow-xl transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">{dept}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600 font-bold">ON-CALL NOW</span>
                      <span className="text-sm text-gray-500">• {doctors.length} available</span>
                    </div>
                  </div>
                  <div className="text-emerald-600">
                    <ChevronRight />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedDepartment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">{selectedDepartment}</h3>
                <button
                  onClick={() => setSelectedDepartment(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full transition"
                >
                  <X />
                </button>
              </div>

              <div className="space-y-3">
                {onCallDoctors[selectedDepartment]?.map((doctor, idx) => (
                  <div key={idx} className="border-2 border-emerald-100 rounded-2xl p-4 bg-gradient-to-br from-emerald-50 to-teal-50">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white">
                        <Users />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{doctor.name}</h4>
                        <p className="text-sm text-gray-600">{doctor.designation}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setShowCallModal(true);
                        setSelectedDepartment(null);
                      }}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition shadow-lg flex items-center justify-center gap-2"
                    >
                      <Phone />
                      Call Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showCallModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white">
                <Phone size={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Calling...</h3>
              <p className="text-gray-600 mb-1 font-semibold">{selectedDoctor?.name}</p>
              <p className="text-sm text-gray-500 mb-6">{selectedDoctor?.designation}</p>

              <button
                onClick={() => {
                  setShowCallModal(false);
                  setSelectedDoctor(null);
                }}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition shadow-lg"
              >
                End Call
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ConsultationResponseForm = ({ consult, onSubmit, onCancel }) => {
    const [action, setAction] = useState('accept');
    const [responseMessage, setResponseMessage] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');

    const handleSubmit = () => {
      if (!responseMessage.trim()) {
        alert('Please provide a response message');
        return;
      }
      
      if (action === 'accept' && !estimatedTime.trim()) {
        alert('Please provide an estimated time');
        return;
      }

      onSubmit({
        action,
        response_message: responseMessage,
        estimated_time: action === 'accept' ? estimatedTime : null
      });
    };

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <span className="text-gray-600 font-medium">From:</span>
              <p className="font-bold text-gray-800">{consult.from_department}</p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">MRN:</span>
              <p className="font-bold text-gray-800">{consult.patient_mrn}</p>
            </div>
          </div>
          <div className="mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              consult.urgency === 'stat' ? 'bg-red-100 text-red-700' :
              consult.urgency === 'urgent' ? 'bg-orange-100 text-orange-700' :
              'bg-emerald-100 text-emerald-700'
            }`}>
              {consult.urgency.toUpperCase()}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-300">
            <p className="text-xs text-gray-500 font-bold mb-1">CLINICAL QUESTION:</p>
            <p className="text-sm text-gray-700">{consult.clinical_question}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Response Type</label>
          <div className="flex gap-3">
            <button
              onClick={() => setAction('accept')}
              className={`flex-1 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                action === 'accept' 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                  : 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle />
              Accept
            </button>
            <button
              onClick={() => setAction('decline')}
              className={`flex-1 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                action === 'decline' 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg' 
                  : 'bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100'
              }`}
            >
              <ThumbsDown />
              Decline
            </button>
          </div>
        </div>

        {action === 'accept' && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Estimated Time of Arrival / Review
            </label>
            <select
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select estimated time...</option>
              <option value="Immediately">Immediately (On my way)</option>
              <option value="15 minutes">15 minutes</option>
              <option value="30 minutes">30 minutes</option>
              <option value="1 hour">1 hour</option>
              <option value="2 hours">2 hours</option>
              <option value="Within the day">Within the day</option>
              <option value="Tomorrow morning">Tomorrow morning</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {action === 'accept' ? 'Response / Plan' : 'Reason for Declining'}
          </label>
          <textarea
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            placeholder={
              action === 'accept' 
                ? "Provide your clinical assessment, recommendations, or plan..."
                : "Provide reason for declining and suggest alternative..."
            }
            rows="6"
            maxLength="1000"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
          />
          <div className="text-right text-sm text-gray-500 mt-1">{responseMessage.length}/1000</div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Pro Tips:</strong>
          </p>
          <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
            <li>Be specific about your assessment and plan</li>
            <li>Include relevant clinical findings or recommendations</li>
            <li>If declining, always suggest an appropriate alternative</li>
            <li>Provide realistic timeframes for patient safety</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`flex-1 py-3 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2 ${
              action === 'accept'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
            }`}
          >
            <Send />
            {action === 'accept' ? 'Accept & Send Response' : 'Decline & Send Response'}
          </button>
        </div>
      </div>
    );
  };

  const MyConsultations = () => {
    const [consultTab, setConsultTab] = useState('requested');
    
    const myRequests = consultations.filter(c => c.from_department === loggedInUser?.department);
    const assignedToMe = consultations.filter(c => c.to_department === loggedInUser?.department);
    const displayConsults = consultTab === 'requested' ? myRequests : assignedToMe;
    
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="flex gap-2">
            <button 
              onClick={() => setConsultTab('requested')}
              className={`flex-1 py-2 rounded-xl font-bold transition ${
                consultTab === 'requested' 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Requested by Me
            </button>
            <button 
              onClick={() => setConsultTab('assigned')}
              className={`flex-1 py-2 rounded-xl font-bold transition ${
                consultTab === 'assigned' 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Assigned to Me ({assignedToMe.filter(c => c.status === 'pending').length})
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {displayConsults.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-md">
              <p className="text-gray-500 font-medium">
                {consultTab === 'requested' ? 'No consultations requested yet' : 'No consultations assigned yet'}
              </p>
            </div>
          ) : (
            displayConsults.map(consult => (
              <div key={consult.id} className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {consult.status === 'pending' && <div className="w-5 h-5 text-orange-500"><AlertCircle /></div>}
                    {consult.status === 'accepted' && <div className="w-5 h-5 text-emerald-500"><CheckCircle /></div>}
                    {consult.status === 'declined' && <div className="w-5 h-5 text-red-500"><ThumbsDown /></div>}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      consult.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      consult.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                      consult.status === 'declined' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {consult.status.toUpperCase()}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    consult.urgency === 'stat' ? 'bg-red-100 text-red-700' :
                    consult.urgency === 'urgent' ? 'bg-orange-100 text-orange-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {consult.urgency.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">
                      {consultTab === 'requested' ? 'To:' : 'From:'}
                    </span>
                    <span className="font-bold text-gray-800">
                      {consultTab === 'requested' ? consult.to_department : consult.from_department}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">MRN:</span>
                    <span className="font-bold text-gray-800">{consult.patient_mrn}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Requested by:</span>
                    <span className="font-bold text-gray-800">{consult.requested_by_name}</span>
                  </div>
                  <div className="mt-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-bold mb-1">CLINICAL QUESTION:</p>
                    <p className="text-sm text-gray-700">{consult.clinical_question}</p>
                  </div>

                  {consult.response_message && (
                    <div className="mt-3 p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare />
                        <p className="text-xs text-emerald-700 font-bold">CONSULTATION RESPONSE:</p>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{consult.response_message}</p>
                      {consult.estimated_time && (
                        <p className="text-xs text-emerald-600 font-bold">⏱️ ETA: {consult.estimated_time}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Responded by {consult.responded_by_name} • {new Date(consult.response_time).toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2 font-medium">
                    Requested {new Date(consult.created_at).toLocaleString()}
                  </div>
                </div>

                {consultTab === 'assigned' && consult.status === 'pending' && (
                  <button
                    onClick={() => setRespondingToConsult(consult)}
                    className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <MessageSquare />
                    Respond to Consultation
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {respondingToConsult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl my-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Respond to Consultation</h3>
                <button
                  onClick={() => setRespondingToConsult(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full transition"
                >
                  <X />
                </button>
              </div>

              <ConsultationResponseForm 
                consult={respondingToConsult}
                onSubmit={(responseData) => handleRespondToConsult(respondingToConsult.id, responseData)}
                onCancel={() => setRespondingToConsult(null)}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!loggedInUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <header className="bg-white shadow-md sticky top-0 z-40 border-b-2 border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Link2 />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Raabta <span className="text-base font-normal text-gray-400">PK</span>
                </h1>
                <p className="text-xs text-gray-500 font-medium">Consultation System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative hover:bg-emerald-50 p-2 rounded-full transition"
              >
                <Bell />
                {consultations.filter(c => c.status === 'pending' && c.to_department === loggedInUser.department).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold shadow-lg">
                    {consultations.filter(c => c.status === 'pending' && c.to_department === loggedInUser.department).length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-4 top-16 w-80 bg-white rounded-2xl shadow-2xl border-2 border-emerald-100 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b-2 border-emerald-100">
                    <h3 className="font-bold text-gray-800">Notifications</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {consultations
                      .filter(c => c.status === 'pending' && c.to_department === loggedInUser.department)
                      .map(consult => (
                        <div 
                          key={consult.id} 
                          onClick={() => {
                            setCurrentPage('consultations');
                            setShowNotifications(false);
                          }}
                          className="p-4 hover:bg-emerald-50 cursor-pointer transition"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-800">New {consult.urgency.toUpperCase()} Consultation</p>
                              <p className="text-xs text-gray-600">From: {consult.from_department}</p>
                              <p className="text-xs text-gray-500 mt-1">{new Date(consult.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    {consultations.filter(c => c.status === 'pending' && c.to_department === loggedInUser.department).length === 0 && (
                      <div className="p-8 text-center">
                        <p className="text-gray-400 text-sm">No new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden hover:bg-emerald-50 p-2 rounded-full transition"
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-emerald-100 shadow-lg ${mobileMenuOpen ? 'hidden' : ''}`}>
        <div className="flex justify-around">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 ${
              currentPage === 'dashboard' ? 'text-emerald-600' : 'text-gray-400'
            }`}
          >
            <Home />
            <span className="text-xs font-bold">Home</span>
          </button>
          <button
            onClick={() => setCurrentPage('request')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 ${
              currentPage === 'request' ? 'text-emerald-600' : 'text-gray-400'
            }`}
          >
            <FileText />
            <span className="text-xs font-bold">Request</span>
          </button>
          <button
            onClick={() => setCurrentPage('oncall')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 ${
              currentPage === 'oncall' ? 'text-emerald-600' : 'text-gray-400'
            }`}
          >
            <Users />
            <span className="text-xs font-bold">On-Call</span>
          </button>
          <button
            onClick={() => setCurrentPage('consultations')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 relative ${
              currentPage === 'consultations' ? 'text-emerald-600' : 'text-gray-400'
            }`}
          >
            <Clock />
            <span className="text-xs font-bold">Consults</span>
            {consultations.filter(c => c.status === 'pending' && c.to_department === loggedInUser.department).length > 0 && (
              <span className="absolute top-1 right-8 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {consultations.filter(c => c.status === 'pending' && c.to_department === loggedInUser.department).length}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="hidden md:block w-64 bg-white rounded-2xl shadow-md p-4 h-fit sticky top-24 border-2 border-emerald-100">
            <nav className="space-y-2">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${
                  currentPage === 'dashboard' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-emerald-50'
                }`}
              >
                <Home />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentPage('request')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${
                  currentPage === 'request' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-emerald-50'
                }`}
              >
                <FileText />
                Request Consult
              </button>
              <button
                onClick={() => setCurrentPage('oncall')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${
                  currentPage === 'oncall' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-emerald-50'
                }`}
              >
                <Users />
                On-Call Directory
              </button>
              <button
                onClick={() => setCurrentPage('consultations')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition relative ${
                  currentPage === 'consultations' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-emerald-50'
                }`}
              >
                <Clock />
                My Consultations
                {consultations.filter(c => c.status === 'pending' && c.to_department === loggedInUser.department).length > 0 && (
                  <span className="absolute right-2 top-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                    {consultations.filter(c => c.status === 'pending' && c.to_department === loggedInUser.department).length}
                  </span>
                )}
              </button>
            </nav>

            <div className="mt-6 pt-6 border-t-2 border-emerald-100">
              <div className="text-sm text-gray-600 bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-xl">
                <p className="font-bold mb-1 text-gray-800">{loggedInUser.name}</p>
                <p className="text-xs text-gray-600">{loggedInUser.department}</p>
                <p className="text-xs text-emerald-600 capitalize font-semibold">{loggedInUser.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </aside>

          <main className="flex-1 pb-20 md:pb-6">
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'request' && (
  <RequestConsultation 
    loggedInUser={loggedInUser}
    departments={departments}
    handleConsultationSubmit={handleConsultationSubmit}
  />
)}
            {currentPage === 'oncall' && <OnCallDirectory />}
            {currentPage === 'consultations' && <MyConsultations />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default RaabtaApp;