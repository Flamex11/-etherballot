import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import AnimatedEmblem from '../components/AnimatedEmblem';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }
    setLoading(true);
    try {
      const res = await adminAPI.login(username, password);
      toast.success(`Welcome, ${res.data.admin.name}!`);
      loginAdmin(res.data.token, res.data.admin);
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="page-container" style={{ maxWidth: 460, margin: '0 auto' }}>
      <div style={{ marginTop: 'var(--space-3xl)' }}>
        <div className="glass-card glass-card--no-hover animate-scale-in">
          <div className="text-center mb-lg">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
              <AnimatedEmblem size={72} animate={true} />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 2 }}>
              <span style={{
                background: 'linear-gradient(135deg, #eab308, #fbbf24, #f59e0b)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>प्रजातंत्र</span>
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'rgba(234,179,8,0.45)', letterSpacing: '0.2em', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>ADMIN PORTAL</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Sign in to access the administration dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter admin username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="text-center mt-lg" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <p>Contact your system administrator for login credentials.</p>
          </div>

          <div className="text-center mt-lg">
            <Link to="/login" style={{ color: 'var(--accent-primary)', fontSize: '0.88rem' }}>
              ← Back to Voter Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
