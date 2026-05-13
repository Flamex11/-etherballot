import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import FaceCapture from '../components/FaceCapture';
import toast from 'react-hot-toast';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];

const Register = () => {
  const navigate = useNavigate();
  const { loginVoter } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    name: '',
    email: '',
    mobile: '',
    dateOfBirth: '',
    gender: '',
    state: '',
    district: '',
    pincode: '',
    addressLine: ''
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDetectLocation = (e) => {
    e.preventDefault();
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        toast.success("Location precisely detected via Google Maps!");
        setLoading(false);
      },
      (error) => {
        toast.error("Unable to retrieve location. Please allow GPS access.");
        setLoading(false);
      }
    );
  };

  // ═══ STEP 1: Aadhaar Validation ═══
  const handleValidateAadhaar = async () => {
    if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
      toast.error('Aadhaar must be exactly 12 digits');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.validateAadhaar(formData.aadhaarNumber);
      toast.success(res.data.message);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Validation failed');
    }
    setLoading(false);
  };

  // ═══ STEP 2: Personal Details + OTP ═══
  const handleSendOTP = async () => {
    if (!/^\d{10}$/.test(formData.mobile)) {
      toast.error('Mobile must be 10 digits');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.sendOTP(formData.mobile);
      toast.success('OTP sent to your mobile!');
      setOtpSent(true);
      // In dev mode, show OTP
      if (res.data.otp) {
        toast(`Dev OTP: ${res.data.otp}`, { icon: '🔑', duration: 10000 });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }
    setLoading(true);
    try {
      await authAPI.verifyOTP(formData.mobile, otp);
      toast.success('OTP verified!');
      setOtpVerified(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    }
    setLoading(false);
  };

  const handleStep2Submit = () => {
    const { name, mobile, dateOfBirth, gender, state, district } = formData;
    if (!name || !mobile || !dateOfBirth || !gender || !state || !district) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!userLocation) {
      toast.error('Please auto-detect your location to proceed');
      return;
    }
    if (!otpVerified) {
      toast.error('Please verify your mobile number first');
      return;
    }
    setStep(3);
  };

  // ═══ STEP 3: Face Capture ═══
  const handleFaceCapture = (descriptor) => {
    setFaceDescriptor(descriptor);
    toast.success('Face captured successfully!');
    setStep(4);
  };

  // ═══ STEP 4: Review & Submit ═══
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await authAPI.register({
        ...formData,
        faceDescriptor
      });
      toast.success('Registration successful! 🎉');
      loginVoter(res.data.token, res.data.user);
      navigate('/vote');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const stepLabels = ['Aadhaar', 'Details & OTP', 'Face Capture', 'Confirm'];

  return (
    <div className="page-container" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="page-header" style={{ marginTop: 'var(--space-xl)' }}>
        <h1 className="page-title">Voter Registration</h1>
        <p className="page-subtitle">Create your secure voting identity</p>
      </div>

      {/* Step Indicator */}
      <div className="steps">
        {stepLabels.map((label, i) => (
          <div key={i} className="step-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
            <div className={`step ${step > i + 1 ? 'completed' : ''} ${step === i + 1 ? 'active' : ''}`}>
              <div className="step__circle">
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className="step__label hide-mobile">{label}</span>
            </div>
            {i < stepLabels.length - 1 && <div className="step__line" />}
          </div>
        ))}
      </div>

      {/* ═══ STEP 1: Aadhaar ═══ */}
      {step === 1 && (
        <div className="glass-card glass-card--no-hover animate-fade-in">
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
            🔐 Aadhaar Verification
          </h2>
          <div className="form-group">
            <label className="form-label">Aadhaar Number</label>
            <input
              type="text"
              name="aadhaarNumber"
              className="form-input"
              placeholder="Enter 12-digit Aadhaar number"
              value={formData.aadhaarNumber}
              onChange={handleChange}
              maxLength={12}
            />
            <p className="form-hint">Your Aadhaar number will be used for identity verification</p>
          </div>
          <button
            className="btn btn-primary btn-lg btn-block"
            onClick={handleValidateAadhaar}
            disabled={loading}
          >
            {loading ? 'Validating...' : 'Validate Aadhaar →'}
          </button>
          <p style={{ textAlign: 'center', marginTop: 'var(--space-lg)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Already registered? <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Login here</Link>
          </p>
        </div>
      )}

      {/* ═══ STEP 2: Personal Details ═══ */}
      {step === 2 && (
        <div className="glass-card glass-card--no-hover animate-fade-in">
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
            📋 Personal Details
          </h2>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" name="name" className="form-input" placeholder="Your full name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-input" placeholder="your@email.com" value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input type="date" name="dateOfBirth" className="form-input" value={formData.dateOfBirth} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select name="gender" className="form-input" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">State *</label>
              <select name="state" className="form-input" value={formData.state} onChange={handleChange}>
                <option value="">Select State</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">District *</label>
              <input type="text" name="district" className="form-input" placeholder="Your district" value={formData.district} onChange={handleChange} />
            </div>
            </div>
            
            {/* Google Map Auto Detect */}
            <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: 'var(--space-md)' }}>
              <label className="form-label">📍 Geo-Location (Mandatory for voting jurisdiction) *</label>
              {!userLocation ? (
                 <button className="btn btn-secondary btn-block animate-fade-in" onClick={handleDetectLocation} disabled={loading} style={{ borderColor: '#3b82f6', color: '#3b82f6', padding: '16px', fontWeight: '700' }}>
                   {loading ? 'Detecting GPS...' : 'Auto-Detect Current Location'}
                 </button>
              ) : (
                <div className="animate-scale-in" style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-primary)', marginTop: '8px' }}>
                   <iframe 
                     width="100%" 
                     height="250" 
                     frameBorder="0" 
                     src={`https://maps.google.com/maps?q=${userLocation.lat},${userLocation.lng}&z=16&output=embed`} 
                     allowFullScreen>
                   </iframe>
                   <div style={{ padding: '12px', background: 'var(--bg-secondary)', fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'center', fontWeight: '600' }}>
                     ✅ Google Maps Coordinates: {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                   </div>
                </div>
              )}
            </div>

            {/* Mobile + OTP */}
          <div className="form-group" style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 'var(--space-lg)', marginTop: 'var(--space-md)' }}>
            <label className="form-label">📱 Mobile Verification *</label>
            <div className="flex gap-md">
              <input
                type="text"
                name="mobile"
                className="form-input"
                placeholder="10-digit mobile number"
                value={formData.mobile}
                onChange={handleChange}
                maxLength={10}
                style={{ flex: 1 }}
              />
              <button className="btn btn-secondary" onClick={handleSendOTP} disabled={loading || otpSent}>
                {otpSent ? 'OTP Sent ✓' : 'Send OTP'}
              </button>
            </div>
          </div>

          {otpSent && !otpVerified && (
            <div className="form-group animate-fade-in">
              <label className="form-label">Enter OTP</label>
              <div className="flex gap-md">
                <input
                  type="text"
                  className="form-input"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  maxLength={6}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-success" onClick={handleVerifyOTP} disabled={loading}>
                  Verify
                </button>
              </div>
            </div>
          )}

          {otpVerified && (
            <div className="badge badge--success mb-lg animate-scale-in" style={{ display: 'block', textAlign: 'center', padding: '12px' }}>
              ✅ Mobile number verified successfully
            </div>
          )}

          <button className="btn btn-primary btn-lg btn-block" onClick={handleStep2Submit} disabled={!otpVerified}>
            Continue to Face Capture →
          </button>
        </div>
      )}

      {/* ═══ STEP 3: Face Capture ═══ */}
      {step === 3 && (
        <div className="glass-card glass-card--no-hover animate-fade-in">
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
            📷 Face Capture & Liveness Check
          </h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 'var(--space-lg)', fontSize: '0.92rem' }}>
            Position your face in the oval guide. Blink naturally twice for liveness verification.
          </p>
          <FaceCapture 
            onCapture={handleFaceCapture}
            onError={(msg) => toast.error(msg)}
            mode="register"
          />
        </div>
      )}

      {/* ═══ STEP 4: Review & Confirm ═══ */}
      {step === 4 && (
        <div className="glass-card glass-card--no-hover animate-fade-in">
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
            ✅ Review & Confirm
          </h2>
          <div style={{ display: 'grid', gap: 12, marginBottom: 'var(--space-xl)' }}>
            {[
              ['Aadhaar', `****-****-${formData.aadhaarNumber.slice(-4)}`],
              ['Name', formData.name],
              ['Mobile', formData.mobile],
              ['DOB', formData.dateOfBirth],
              ['Gender', formData.gender],
              ['State', formData.state],
              ['District', formData.district],
              ['Geo-Tag', userLocation ? `${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}` : '❌ Missing'],
              ['Face Data', faceDescriptor ? '✅ Captured (128-D Vector)' : '❌ Not Captured']
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-secondary)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{label}</span>
                <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{value}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-success btn-lg btn-block" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Registering...' : '🗳️ Complete Registration'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Register;
