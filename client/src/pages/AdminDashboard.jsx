import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, electionAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineUserGroup, HiOutlineClipboardList, HiOutlineShieldCheck, HiOutlineChartBar, HiOutlinePlus, HiOutlineRefresh } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#ea580c', '#1e3a8a', '#059669', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'];

const AdminDashboard = ({ tab: initialTab }) => {
  const { user, role, isSuperAdmin, isStateAdmin, isDistrictAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [stats, setStats] = useState(null);
  const [elections, setElections] = useState([]);
  const [voters, setVoters] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateElection, setShowCreateElection] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [states, setStates] = useState([]);

  // Election form
  const [electionForm, setElectionForm] = useState({
    name: '', description: '', type: 'national', state: '', district: '',
    startDate: '', endDate: '', candidates: [
      { name: '', party: '' },
      { name: '', party: '' }
    ]
  });

  // Admin form
  const [adminForm, setAdminForm] = useState({
    username: '', password: '', name: '', email: '', state: '', district: '',
    type: 'state_admin'
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, statesRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getStates()
      ]);
      setStats(statsRes.data.stats);
      setStates(statesRes.data.states);

      if (activeTab === 'elections') {
        const res = await electionAPI.getAll();
        setElections(res.data.elections);
      }
      if (activeTab === 'voters') {
        const res = await adminAPI.getVoters({ limit: 50 });
        setVoters(res.data.voters);
      }
      if (activeTab === 'admins' && (isSuperAdmin || isStateAdmin)) {
        const res = await adminAPI.listAdmins({});
        setAdmins(res.data.admins);
      }
      if (activeTab === 'logs') {
        const res = await adminAPI.getAuditLogs({ limit: 50 });
        setAuditLogs(res.data.logs);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
    setLoading(false);
  };

  // ═══ CREATE ELECTION ═══
  const handleCreateElection = async () => {
    const { name, description, type, startDate, endDate, candidates } = electionForm;
    if (!name || !description || !startDate || !endDate) {
      toast.error('Please fill all required fields');
      return;
    }
    const validCandidates = candidates.filter(c => c.name && c.party);
    if (validCandidates.length < 2) {
      toast.error('At least 2 candidates required');
      return;
    }
    try {
      await electionAPI.create({
        ...electionForm,
        candidates: validCandidates
      });
      toast.success('Election created!');
      setShowCreateElection(false);
      setElectionForm({
        name: '', description: '', type: 'national', state: '', district: '',
        startDate: '', endDate: '', candidates: [{ name: '', party: '' }, { name: '', party: '' }]
      });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create election');
    }
  };

  // ═══ CREATE ADMIN ═══
  const handleCreateAdmin = async () => {
    const { username, password, name, email, state, type, district } = adminForm;
    if (!username || !password || !name || !email) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      if (type === 'state_admin') {
        await adminAPI.createStateAdmin({ username, password, name, email, state });
      } else {
        await adminAPI.createDistrictAdmin({ username, password, name, email, state, district });
      }
      toast.success('Admin created!');
      setShowCreateAdmin(false);
      setAdminForm({ username: '', password: '', name: '', email: '', state: '', district: '', type: 'state_admin' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    }
  };

  // ═══ ELECTION STATUS ═══
  const handleElectionStatus = async (id, status) => {
    try {
      await electionAPI.updateStatus(id, status);
      toast.success(`Election ${status}!`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  // ═══ DELETE VOTER ═══
  const handleDeleteVoter = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete voter: ${name}?`)) return;
    try {
      await adminAPI.deleteVoter(id);
      toast.success('Voter deleted successfully');
      loadData(); // Refresh the datatable
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete voter');
    }
  };

  const addCandidate = () => {
    setElectionForm(prev => ({
      ...prev,
      candidates: [...prev.candidates, { name: '', party: '' }]
    }));
  };

  const updateCandidate = (idx, field, value) => {
    setElectionForm(prev => ({
      ...prev,
      candidates: prev.candidates.map((c, i) => i === idx ? { ...c, [field]: value } : c)
    }));
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: <HiOutlineChartBar /> },
    { id: 'elections', label: '🗳️ Elections', icon: <HiOutlineClipboardList /> },
    { id: 'voters', label: '👥 Voters', icon: <HiOutlineUserGroup /> },
    ...(isSuperAdmin || isStateAdmin ? [{ id: 'admins', label: '🛡️ Admins', icon: <HiOutlineShieldCheck /> }] : []),
    ...(isSuperAdmin || isStateAdmin ? [{ id: 'logs', label: '📋 Audit Logs' }] : [])
  ];

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginTop: 'var(--space-lg)' }}>
        <h1 className="page-title">
          {isSuperAdmin ? '👑 Super Admin' : isStateAdmin ? '🏛️ State Admin' : '📍 District Admin'} Dashboard
        </h1>
        <p className="page-subtitle">
          {isStateAdmin && `Managing: ${user?.state}`}
          {isDistrictAdmin && `Managing: ${user?.district}, ${user?.state}`}
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={loadData} style={{ marginLeft: 'auto' }}>
          <HiOutlineRefresh size={16} />
        </button>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: 'var(--space-3xl)' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p className="loading-text mt-md">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* ═══ OVERVIEW TAB ═══ */}
          {activeTab === 'overview' && stats && (
            <div className="animate-fade-in">
              <div className="grid grid-4 stagger-children mb-lg">
                <div className="stat-card">
                  <div className="stat-card__icon stat-card__icon--primary">👥</div>
                  <div className="stat-card__value">{stats.totalVoters}</div>
                  <div className="stat-card__label">Total Voters</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__icon stat-card__icon--success">✅</div>
                  <div className="stat-card__value">{stats.activeVoters}</div>
                  <div className="stat-card__label">Active Voters</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__icon stat-card__icon--info">🛡️</div>
                  <div className="stat-card__value">{stats.managedAdmins}</div>
                  <div className="stat-card__label">Managed Admins</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card__icon stat-card__icon--warning">🗳️</div>
                  <div className="stat-card__value">{elections.length || '—'}</div>
                  <div className="stat-card__label">Elections</div>
                </div>
              </div>

              {/* Charts */}
              {stats.stateWiseVoters?.length > 0 && (
                <div className="glass-card glass-card--no-hover mb-lg">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
                    State-wise Voter Distribution
                  </h3>
                  <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                      <BarChart data={stats.stateWiseVoters.map(s => ({ name: s._id, count: s.count }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 8, color: 'var(--text-primary)' }} />
                        <Bar dataKey="count" fill="#ea580c" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {stats.districtWiseVoters?.length > 0 && (
                <div className="glass-card glass-card--no-hover mb-lg">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
                    District-wise Voter Distribution
                  </h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={stats.districtWiseVoters.map(d => ({ name: d._id, value: d.count }))}
                          cx="50%" cy="50%" outerRadius={100}
                          dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                        >
                          {stats.districtWiseVoters.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 8, color: 'var(--text-primary)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              {stats.recentLogs?.length > 0 && (
                <div className="glass-card glass-card--no-hover">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
                    Recent Activity
                  </h3>
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {stats.recentLogs.map((log, i) => (
                      <div key={i} className="flex justify-between items-center" style={{
                        padding: '10px 0', borderBottom: '1px solid var(--border-secondary)'
                      }}>
                        <div>
                          <span className={`badge badge--${log.success ? 'success' : 'danger'}`} style={{ marginRight: 8 }}>
                            {log.action}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.details}</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ ELECTIONS TAB ═══ */}
          {activeTab === 'elections' && (
            <div className="animate-fade-in">
              {(isSuperAdmin || isStateAdmin) && (
                <div className="mb-lg">
                  <button className="btn btn-primary" onClick={() => setShowCreateElection(true)}>
                    <HiOutlinePlus /> Create Election
                  </button>
                </div>
              )}

              {showCreateElection && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreateElection(false)}>
                  <div className="modal-content animate-scale-in" style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>
                    <h3 className="modal-title">Create New Election</h3>
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label className="form-label">Election Name *</label>
                        <input type="text" className="form-input" value={electionForm.name}
                          onChange={e => setElectionForm(p => ({...p, name: e.target.value}))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Type *</label>
                        <select className="form-input" value={electionForm.type}
                          onChange={e => setElectionForm(p => ({...p, type: e.target.value}))}>
                          <option value="national">National</option>
                          <option value="state">State</option>
                          <option value="district">District</option>
                        </select>
                      </div>
                      {electionForm.type !== 'national' && (
                        <div className="form-group">
                          <label className="form-label">State</label>
                          <select className="form-input" value={electionForm.state}
                            onChange={e => setElectionForm(p => ({...p, state: e.target.value}))}>
                            <option value="">Select State</option>
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      )}
                      {electionForm.type === 'district' && (
                        <div className="form-group">
                          <label className="form-label">District</label>
                          <input type="text" className="form-input" value={electionForm.district}
                            onChange={e => setElectionForm(p => ({...p, district: e.target.value}))} />
                        </div>
                      )}
                      <div className="form-group">
                        <label className="form-label">Start Date *</label>
                        <input type="datetime-local" className="form-input" value={electionForm.startDate}
                          onChange={e => setElectionForm(p => ({...p, startDate: e.target.value}))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">End Date *</label>
                        <input type="datetime-local" className="form-input" value={electionForm.endDate}
                          onChange={e => setElectionForm(p => ({...p, endDate: e.target.value}))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description *</label>
                      <textarea className="form-input" rows={3} value={electionForm.description}
                        onChange={e => setElectionForm(p => ({...p, description: e.target.value}))}
                        style={{ resize: 'vertical' }} />
                    </div>

                    <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-md)' }}>Candidates</h4>
                    {electionForm.candidates.map((c, idx) => (
                      <div key={idx} className="grid grid-2 mb-md">
                        <input type="text" className="form-input" placeholder={`Candidate ${idx + 1} Name`}
                          value={c.name} onChange={e => updateCandidate(idx, 'name', e.target.value)} />
                        <input type="text" className="form-input" placeholder="Party"
                          value={c.party} onChange={e => updateCandidate(idx, 'party', e.target.value)} />
                      </div>
                    ))}
                    <button className="btn btn-ghost btn-sm mb-lg" onClick={addCandidate}>
                      + Add Candidate
                    </button>

                    <div className="flex gap-md">
                      <button className="btn btn-ghost btn-block" onClick={() => setShowCreateElection(false)}>Cancel</button>
                      <button className="btn btn-primary btn-block" onClick={handleCreateElection}>Create Election</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Elections Table */}
              <div className="glass-card glass-card--no-hover" style={{ overflow: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Election</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Votes</th>
                      <th>Dates</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {elections.map(el => (
                      <tr key={el._id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{el.name}</td>
                        <td><span className="badge badge--primary">{el.type}</span></td>
                        <td>
                          <span className={`badge badge--${
                            el.status === 'active' ? 'success' :
                            el.status === 'completed' ? 'info' :
                            el.status === 'cancelled' ? 'danger' : 'warning'
                          }`}>{el.status}</span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{el.totalVotesCast || 0}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {new Date(el.startDate).toLocaleDateString()} - {new Date(el.endDate).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="flex gap-sm">
                            {el.status === 'draft' && (
                              <button className="btn btn-sm btn-secondary" onClick={() => handleElectionStatus(el._id, 'upcoming')}>
                                Publish
                              </button>
                            )}
                            {el.status === 'upcoming' && (
                              <button className="btn btn-sm btn-success" onClick={() => handleElectionStatus(el._id, 'active')}>
                                Start
                              </button>
                            )}
                            {el.status === 'active' && (
                              <button className="btn btn-sm btn-danger" onClick={() => handleElectionStatus(el._id, 'completed')}>
                                End
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {elections.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>No elections found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ VOTERS TAB ═══ */}
          {activeTab === 'voters' && (
            <div className="animate-fade-in">
              <div className="glass-card glass-card--no-hover" style={{ overflow: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Aadhaar</th>
                      <th>Mobile</th>
                      <th>State</th>
                      <th>District</th>
                      <th>Status</th>
                      <th>Registered</th>
                      {isSuperAdmin && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {voters.map(v => (
                      <tr key={v._id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.name}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>****{v.aadhaarNumber?.slice(-4)}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{v.mobile}</td>
                        <td>{v.address?.state}</td>
                        <td>{v.address?.district}</td>
                        <td>
                          <span className={`badge ${v.isActive ? 'badge--success' : 'badge--danger'}`}>
                            {v.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {new Date(v.createdAt).toLocaleDateString()}
                        </td>
                        {isSuperAdmin && (
                          <td>
                            <button className="btn btn-sm btn-ghost" style={{ color: 'var(--error)' }} onClick={() => handleDeleteVoter(v._id, v.name)}>
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {voters.length === 0 && (
                      <tr><td colSpan={isSuperAdmin ? 8 : 7} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>No voters found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ ADMINS TAB ═══ */}
          {activeTab === 'admins' && (
            <div className="animate-fade-in">
              <div className="mb-lg flex gap-md">
                <button className="btn btn-primary" onClick={() => setShowCreateAdmin(true)}>
                  <HiOutlinePlus /> Create Admin
                </button>
              </div>

              {showCreateAdmin && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreateAdmin(false)}>
                  <div className="modal-content animate-scale-in">
                    <h3 className="modal-title">Create Admin</h3>
                    <div className="form-group">
                      <label className="form-label">Admin Type</label>
                      <select className="form-input" value={adminForm.type}
                        onChange={e => setAdminForm(p => ({...p, type: e.target.value}))}>
                        {isSuperAdmin && <option value="state_admin">State Admin</option>}
                        <option value="district_admin">District Admin</option>
                      </select>
                    </div>
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label className="form-label">Username *</label>
                        <input type="text" className="form-input" value={adminForm.username}
                          onChange={e => setAdminForm(p => ({...p, username: e.target.value}))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Password *</label>
                        <input type="password" className="form-input" value={adminForm.password}
                          onChange={e => setAdminForm(p => ({...p, password: e.target.value}))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input type="text" className="form-input" value={adminForm.name}
                          onChange={e => setAdminForm(p => ({...p, name: e.target.value}))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input type="email" className="form-input" value={adminForm.email}
                          onChange={e => setAdminForm(p => ({...p, email: e.target.value}))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">State *</label>
                        <select className="form-input" value={adminForm.state}
                          onChange={e => setAdminForm(p => ({...p, state: e.target.value}))}>
                          <option value="">Select State</option>
                          {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      {adminForm.type === 'district_admin' && (
                        <div className="form-group">
                          <label className="form-label">District *</label>
                          <input type="text" className="form-input" value={adminForm.district}
                            onChange={e => setAdminForm(p => ({...p, district: e.target.value}))} />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-md mt-md">
                      <button className="btn btn-ghost btn-block" onClick={() => setShowCreateAdmin(false)}>Cancel</button>
                      <button className="btn btn-primary btn-block" onClick={handleCreateAdmin}>Create</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="glass-card glass-card--no-hover" style={{ overflow: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>State</th>
                      <th>District</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map(a => (
                      <tr key={a._id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.name}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{a.username}</td>
                        <td>
                          <span className={`badge ${a.role === 'state_admin' ? 'badge--primary' : 'badge--info'}`}>
                            {a.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td>{a.state || '—'}</td>
                        <td>{a.district || '—'}</td>
                        <td>
                          <span className={`badge ${a.isActive ? 'badge--success' : 'badge--danger'}`}>
                            {a.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {admins.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>No admins found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ AUDIT LOGS TAB ═══ */}
          {activeTab === 'logs' && (
            <div className="animate-fade-in">
              <div className="glass-card glass-card--no-hover" style={{ overflow: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Action</th>
                      <th>Details</th>
                      <th>User Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, i) => (
                      <tr key={i}>
                        <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <span className="badge badge--primary">{log.action}</span>
                        </td>
                        <td style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                          {log.details}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{log.performedBy?.userType || '—'}</td>
                        <td>
                          <span className={`badge ${log.success ? 'badge--success' : 'badge--danger'}`}>
                            {log.success ? 'Success' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>No audit logs found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
