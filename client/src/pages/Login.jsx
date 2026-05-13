import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import FaceCapture from '../components/FaceCapture';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { loginVoter } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [maskedMobile, setMaskedMobile] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  // ═══ STEP 1: Aadhaar Check ═══
  const handleAadhaarSubmit = async () => {
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      toast.error('Enter valid 12-digit Aadhaar number');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login(aadhaarNumber);
      setUserId(res.data.userId);
      setUserName(res.data.name);
      setMaskedMobile(res.data.mobile);
      toast.success('Aadhaar verified! Proceed with OTP.');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  // ═══ STEP 2: OTP ═══
  const handleSendOTP = async () => {
    if (!/^\d{10}$/.test(mobile)) {
      toast.error('Enter your registered 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.sendOTP(mobile);
      toast.success('OTP sent!');
      if (res.data.otp) {
        toast(`Dev OTP: ${res.data.otp}`, { icon: '🔑', duration: 10000 });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      await authAPI.verifyOTP(mobile, otp);
      toast.success('OTP verified!');
      setOtpVerified(true);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    }
    setLoading(false);
  };

  // ═══ STEP 3: Face Verification ═══
  const handleFaceVerify = async (descriptor) => {
    setLoading(true);
    try {
      const res = await authAPI.verifyFace(userId, descriptor);
      toast.success('Face verified! Welcome back 🎉');
      loginVoter(res.data.token, res.data.user);
      navigate('/vote');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Face verification failed');
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="page-header" style={{ marginTop: 'var(--space-2xl)' }}>
        <h1 className="page-title">Voter Login</h1>
        <p className="page-subtitle">Aadhaar + OTP + Face Verification</p>
      </div>

      {/* Steps */}
      <div className="steps">
        {['Aadhaar', 'OTP', 'Face'].map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div className={`step ${step > i + 1 ? 'completed' : ''} ${step === i + 1 ? 'active' : ''}`}>
              <div className="step__circle">{step > i + 1 ? '✓' : i + 1}</div>
              <span className="step__label">{label}</span>
            </div>
            {i < 2 && <div className="step__line" />}
          </div>
        ))}
      </div>

      {/* Step 1: Aadhaar */}
      {step === 1 && (
        <div className="glass-card glass-card--no-hover animate-fade-in">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
            🔐 Enter Aadhaar Number
          </h2>
          <div className="form-group">
            <label className="form-label">Aadhaar Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter 12-digit Aadhaar"
              value={aadhaarNumber}
              onChange={e => setAadhaarNumber(e.target.value)}
              maxLength={12}
              onKeyDown={e => e.key === 'Enter' && handleAadhaarSubmit()}
            />
          </div>
          <button className="btn btn-primary btn-lg btn-block" onClick={handleAadhaarSubmit} disabled={loading}>
            {loading ? 'Verifying...' : 'Continue →'}
          </button>
          <div className="flex justify-between mt-lg" style={{fontSize: '0.88rem'}}>
            <Link to="/register" style={{color: 'var(--accent-primary)'}}>New voter? Register</Link>
            <Link to="/admin/login" style={{color: 'var(--text-muted)'}}>Admin Login →</Link>
          </div>
        </div>
      )}

      {/* Step 2: OTP */}
      {step === 2 && (
        <div className="glass-card glass-card--no-hover animate-fade-in">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
            📱 Mobile OTP Verification
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)', fontSize: '0.88rem' }}>
            Welcome back, <strong style={{color: 'var(--text-primary)'}}>{userName}</strong>!
            Registered mobile: <strong>{maskedMobile}</strong>
          </p>
          
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <div className="flex gap-md">
              <input
                type="text"
                className="form-input"
                placeholder="Enter your registered mobile"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                maxLength={10}
                style={{ flex: 1 }}
              />
              <button className="btn btn-secondary" onClick={handleSendOTP} disabled={loading}>
                Send OTP
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Enter OTP</label>
            <input
              type="text"
              className="form-input"
              placeholder="6-digit OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
              onKeyDown={e => e.key === 'Enter' && handleVerifyOTP()}
            />
          </div>

          <button className="btn btn-primary btn-lg btn-block" onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}>
            {loading ? 'Verifying...' : 'Verify OTP →'}
          </button>
        </div>
      )}

      {/* Step 3: Face */}
      {step === 3 && (
        <div className="glass-card glass-card--no-hover animate-fade-in">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-sm)', textAlign: 'center' }}>
            📷 Face Verification
          </h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 'var(--space-lg)', fontSize: '0.88rem' }}>
            Look at the camera. We'll match your face with your registered data.
          </p>
          <FaceCapture
            onCapture={handleFaceVerify}
            onError={msg => toast.error(msg)}
            mode="verify"
          />
        </div>
      )}
    </div>
  );
};

export default Login;
