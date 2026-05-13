import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMenu, HiOutlineX, HiOutlineLogout, HiOutlineShieldCheck } from 'react-icons/hi';
import AnimatedEmblem from './AnimatedEmblem';

const Navbar = () => {
  const { isAuthenticated, user, role, isAdmin, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = isAuthenticated
    ? isAdmin
      ? [
          { path: '/admin', label: 'Dashboard' },
          { path: '/admin/elections', label: 'Elections' },
          { path: '/admin/voters', label: 'Voters' },
          { path: '/results', label: 'Results' },
        ]
      : [
          { path: '/vote', label: 'Vote' },
        ]
    : [
        { path: '/', label: 'Home' },
      ];

  return (
    <>
      {/* Official Government Top Bar */}
      <div className="gov-top-bar hide-mobile">
        <div className="page-container gov-top-bar__inner">
          <div className="gov-top-bar__left">
            <span>🎓 ACADEMIC PROJECT DEMONSTRATION</span>
            <span className="gov-top-bar__divider">|</span>
            <span>NOT AN OFFICIAL GOVERNMENT WEBSITE</span>
          </div>
          <div className="gov-top-bar__right">
            <button className="gov-top-bar__btn">Skip to main content</button>
            <span className="gov-top-bar__divider">|</span>
            <div className="gov-top-bar__font-resizer">
              <button>A-</button>
              <button>A</button>
              <button>A+</button>
            </div>
            <span className="gov-top-bar__divider">|</span>
            <button className="gov-top-bar__lang">हिन्दी</button>
          </div>
        </div>
      </div>

      <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <AnimatedEmblem size={42} animate={true} />
          <div className="navbar__logo-text-group">
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Prajaatantr</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ Academic Project</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="navbar__links hide-mobile">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="navbar__right">
          {isAuthenticated ? (
            <div className="navbar__user">
              <div className="navbar__user-info hide-mobile">
                <span className="navbar__user-name">{user?.name}</span>
                <span className="navbar__user-role">
                  {role === 'voter' ? '🗳️ Voter' : 
                   role === 'super_admin' ? '👑 Super Admin' :
                   role === 'state_admin' ? '🏛️ State Admin' : '📍 District Admin'}
                </span>
              </div>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Logout">
                <HiOutlineLogout size={18} />
                <span className="hide-mobile">Logout</span>
              </button>
            </div>
          ) : (
            <div className="navbar__auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              <Link to="/admin/login" className="btn btn-secondary btn-sm hide-mobile">
                <HiOutlineShieldCheck size={16} />
                Admin
              </Link>
            </div>
          )}
          
          {/* Mobile Menu Toggle */}
          <button 
            className="navbar__mobile-toggle"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="navbar__mobile-menu animate-slide-up">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar__mobile-link ${location.pathname === link.path ? 'navbar__mobile-link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <>
              <Link to="/login" className="navbar__mobile-link">Voter Login</Link>
              <Link to="/register" className="navbar__mobile-link">Register</Link>
              <Link to="/admin/login" className="navbar__mobile-link">Admin Login</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        .navbar {
          position: fixed;
          top: 36px; /* Below top bar */
          left: 0;
          right: 0;
          z-index: 100;
          padding: 0 24px;
          transition: all var(--transition-normal);
          background: transparent;
        }
        .navbar--scrolled {
          top: 0; /* Attach to top when scrolled */
          background: rgba(255, 255, 255, 0.9); /* Light glassy */
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-secondary);
          box-shadow: 0 4px 20px rgba(15,23,42,0.05);
        }
        
        /* Government Top Bar */
        .gov-top-bar {
          background: #1e3a8a; /* Deep navy blue */
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.72rem;
          height: 36px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 101;
          display: flex;
          align-items: center;
        }
        .gov-top-bar__inner {
          display: flex;
          justify-content: space-between;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }
        .gov-top-bar__left, .gov-top-bar__right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .gov-top-bar__divider {
          color: rgba(255, 255, 255, 0.3);
        }
        .gov-top-bar button {
          background: transparent;
          color: inherit;
          font-weight: 500;
          transition: color 0.2s;
        }
        .gov-top-bar button:hover {
          color: white;
        }
        .gov-top-bar__font-resizer {
          display: flex;
          gap: 6px;
        }
        .gov-top-bar__font-resizer button {
          padding: 2px 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .gov-top-bar__lang {
          font-weight: 700 !important;
        }
        
        .navbar__inner {
          max-width: 1280px;
          margin: 0 auto;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .navbar__logo {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .navbar__logo-text-group {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        .navbar__logo-hindi {
          font-size: 1.15rem;
          font-weight: 900;
          background: linear-gradient(135deg, #eab308 0%, #fbbf24 40%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.02em;
        }
        .navbar__logo-english {
          font-size: 0.6rem;
          color: rgba(234, 179, 8, 0.5);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 600;
        }
        .navbar__links {
          display: flex;
          gap: 4px;
        }
        .navbar__link {
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .navbar__link:hover { 
          color: var(--text-primary); 
          background: rgba(99, 102, 241, 0.08); 
        }
        .navbar__link--active { 
          color: var(--accent-primary); 
          background: rgba(99, 102, 241, 0.12); 
        }
        .navbar__right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .navbar__user {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .navbar__user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .navbar__user-name {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .navbar__user-role {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .navbar__auth-buttons {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .navbar__mobile-toggle {
          display: none;
          background: transparent;
          color: var(--text-primary);
          padding: 8px;
        }
        .navbar__mobile-menu {
          position: absolute;
          top: 72px;
          left: 0;
          right: 0;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-primary);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .navbar__mobile-link {
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.95rem;
          transition: all var(--transition-fast);
        }
        .navbar__mobile-link:hover,
        .navbar__mobile-link--active {
          background: rgba(99, 102, 241, 0.1);
          color: var(--text-primary);
        }
        @media (max-width: 768px) {
          .gov-top-bar { display: none; }
          .navbar { top: 0; }
          .navbar__mobile-toggle { display: block; }
          .navbar__links { display: none !important; }
          .navbar__auth-buttons .btn:not(:last-child) { display: none; }
        }
      `}</style>
      </nav>
    </>
  );
};

export default Navbar;
