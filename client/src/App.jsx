import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Voting from './pages/Voting';
import Results from './pages/Results';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main style={{ paddingTop: '108px', flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/results" element={
            <ProtectedRoute roles={['super_admin', 'state_admin', 'district_admin']}>
              <Results />
            </ProtectedRoute>
          } />
          {/* Protected Voter Routes */}
          <Route path="/vote" element={
            <ProtectedRoute roles={['voter']}>
              <Voting />
            </ProtectedRoute>
          } />
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['super_admin', 'state_admin', 'district_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/elections" element={
            <ProtectedRoute roles={['super_admin', 'state_admin', 'district_admin']}>
              <AdminDashboard tab="elections" />
            </ProtectedRoute>
          } />
          <Route path="/admin/voters" element={
            <ProtectedRoute roles={['super_admin', 'state_admin', 'district_admin']}>
              <AdminDashboard tab="voters" />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      
      {/* Footer */}
      <footer className="app-footer">
        <div className="page-container">
          <div className="app-footer__inner">
            <p>© 2026 Prajaatantr — Secure Blockchain Voting</p>
            <p>Powered by Ethereum • face-api.js • React</p>
          </div>
        </div>
        <style>{`
          .app-footer {
            border-top: 1px solid var(--border-primary);
            padding: var(--space-xl) 0;
            margin-top: auto;
          }
          .app-footer__inner {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: var(--text-muted);
            font-size: 0.85rem;
          }
          @media (max-width: 640px) {
            .app-footer__inner { flex-direction: column; gap: 8px; text-align: center; }
          }
        `}</style>
      </footer>
    </div>
  );
}

export default App;
