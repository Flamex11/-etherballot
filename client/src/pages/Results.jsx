import { useState, useEffect } from 'react';
import { electionAPI, votingAPI } from '../services/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#ea580c', '#1e3a8a', '#059669', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'];

const Results = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      const res = await electionAPI.getAll();
      setElections(res.data.elections);
    } catch (err) {
      toast.error('Failed to load elections');
    }
    setLoading(false);
  };

  const loadResults = async (election) => {
    setSelectedElection(election);
    try {
      const res = await electionAPI.getResults(election._id);
      setResults(res.data.election);
    } catch (err) {
      toast.error('Failed to load results');
    }
  };

  const handleVerify = async () => {
    if (!verifyHash.trim()) {
      toast.error('Please enter a vote hash');
      return;
    }
    try {
      const res = await votingAPI.verifyVote(verifyHash);
      setVerifyResult(res.data);
      toast.success('Vote verified!');
    } catch (err) {
      setVerifyResult({ verified: false });
      toast.error('Vote not found');
    }
  };

  // Prepare chart data
  const chartData = results?.results?.map((r, i) => ({
    name: r.candidateName,
    votes: r.voteCount,
    party: r.party,
    color: COLORS[i % COLORS.length]
  })) || [];

  const totalVotes = chartData.reduce((sum, d) => sum + d.votes, 0);
  const winner = chartData.length > 0 ? chartData.reduce((a, b) => a.votes > b.votes ? a : b) : null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      const pct = totalVotes > 0 ? ((data.votes / totalVotes) * 100).toFixed(1) : 0;
      return (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)', padding: '12px 16px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{data.name}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{data.party}</p>
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: 4 }}>
            {data.votes} votes ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="page-container text-center" style={{ paddingTop: '20vh' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
        <p className="loading-text mt-md">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginTop: 'var(--space-xl)' }}>
        <h1 className="page-title">Election Results</h1>
        <p className="page-subtitle">View transparent, blockchain-verified voting results</p>
      </div>

      {!selectedElection ? (
        <>
          {/* Election List */}
          <div className="grid grid-2 stagger-children">
            {elections.map((election, i) => (
              <div
                key={election._id}
                className="glass-card animate-fade-in"
                onClick={() => loadResults(election)}
                style={{ cursor: 'pointer' }}
              >
                <div className="flex justify-between items-center mb-md">
                  <span className={`badge ${
                    election.status === 'completed' ? 'badge--success' :
                    election.status === 'active' ? 'badge--warning' : 'badge--info'
                  }`}>
                    {election.status}
                  </span>
                  <span className="badge badge--primary">{election.type}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                  {election.name}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 'var(--space-sm)' }}>
                  {election.description}
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {election.totalVotesCast || 0} votes cast
                </p>
              </div>
            ))}
          </div>

          {elections.length === 0 && (
            <div className="glass-card glass-card--no-hover text-center" style={{ padding: 'var(--space-3xl)' }}>
              <p style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📊</p>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                No Elections Yet
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Results will appear here once elections are created and votes are cast.
              </p>
            </div>
          )}

          {/* Vote Verification */}
          <div className="glass-card glass-card--no-hover mt-xl">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
              🔍 Verify Your Vote
            </h3>
            <div className="flex gap-md">
              <input
                type="text"
                className="form-input"
                placeholder="Enter your vote hash to verify"
                value={verifyHash}
                onChange={e => setVerifyHash(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn btn-secondary" onClick={handleVerify}>
                Verify
              </button>
            </div>
            {verifyResult && (
              <div className={`badge ${verifyResult.verified ? 'badge--success' : 'badge--danger'} mt-md`}
                style={{ display: 'inline-flex', padding: '10px 20px', fontSize: '0.9rem' }}>
                {verifyResult.verified
                  ? `✅ Vote verified! Recorded at ${new Date(verifyResult.timestamp).toLocaleString()}`
                  : '❌ No matching vote found'}
              </div>
            )}
          </div>
        </>
      ) : (
        // Results Detail View
        <div className="animate-fade-in">
          <button className="btn btn-ghost mb-lg" onClick={() => { setSelectedElection(null); setResults(null); }}>
            ← Back to All Elections
          </button>

          <div className="glass-card glass-card--no-hover mb-lg">
            <div className="flex justify-between items-center flex-wrap gap-md">
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 'var(--space-xs)' }}>
                  {results?.name || selectedElection.name}
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {results?.status === 'completed' ? '✅ Election Completed' : '🔴 Live Results'}
                </p>
              </div>
              <div className="flex gap-lg">
                <div className="text-center">
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800 }}>
                    {totalVotes}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Total Votes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Winner Banner */}
          {winner && winner.votes > 0 && results?.status === 'completed' && (
            <div className="glass-card mb-lg animate-scale-in" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              textAlign: 'center',
              padding: 'var(--space-xl)'
            }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>🏆 WINNER</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 'var(--space-xs)' }}>
                {winner.name}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>{winner.party}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', color: 'var(--accent-success)', marginTop: 'var(--space-sm)' }}>
                {winner.votes} votes ({totalVotes > 0 ? ((winner.votes / totalVotes) * 100).toFixed(1) : 0}%)
              </p>
            </div>
          )}

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="glass-card glass-card--no-hover mb-lg">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
                📊 Vote Distribution
              </h3>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Result Bars */}
          <div className="glass-card glass-card--no-hover">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
              Detailed Results
            </h3>
            {chartData.map((candidate, idx) => {
              const pct = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0;
              return (
                <div key={idx} className="result-bar">
                  <div className="result-bar__header">
                    <div>
                      <span className="result-bar__name">{candidate.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginLeft: 8 }}>
                        ({candidate.party})
                      </span>
                    </div>
                    <span className="result-bar__votes">{candidate.votes} votes ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="result-bar__track">
                    <div
                      className="result-bar__fill"
                      style={{ width: `${pct}%`, background: candidate.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
