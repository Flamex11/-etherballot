import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { votingAPI, electionAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineCheckCircle } from 'react-icons/hi';

const Voting = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voteReceipt, setVoteReceipt] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      const res = await votingAPI.getEligibleElections();
      setElections(res.data.elections);
    } catch (err) {
      toast.error('Failed to load elections');
    }
    setLoading(false);
  };

  const handleVote = async () => {
    if (selectedCandidate === null || !selectedElection) return;
    setVoting(true);
    try {
      const res = await votingAPI.castVote(selectedElection._id, selectedCandidate);
      toast.success('Vote cast successfully! 🎉');
      setVoteReceipt(res.data.receipt);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cast vote');
    }
    setVoting(false);
    setShowConfirm(false);
  };

  if (loading) {
    return (
      <div className="page-container text-center" style={{ paddingTop: '20vh' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
        <p className="loading-text mt-md">Loading elections...</p>
      </div>
    );
  }

  // Vote receipt view
  if (voteReceipt) {
    return (
      <div className="page-container" style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="vote-success glass-card glass-card--no-hover animate-scale-in" style={{ marginTop: 'var(--space-2xl)' }}>
          <div className="vote-success__icon">✓</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
            Vote Recorded!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
            Your vote has been securely recorded on the blockchain.
          </p>
          
          <div style={{ textAlign: 'left', marginBottom: 'var(--space-xl)' }}>
            <div className="flex justify-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-secondary)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Election</span>
              <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{voteReceipt.electionName}</span>
            </div>
            <div className="flex justify-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-secondary)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Status</span>
              <span className="badge badge--success">{voteReceipt.status}</span>
            </div>
            <div className="flex justify-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-secondary)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Timestamp</span>
              <span style={{ fontWeight: 500, fontSize: '0.88rem' }}>
                {new Date(voteReceipt.timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 'var(--space-sm)' }}>
              Transaction Hash (Save for verification):
            </p>
            <div className="vote-hash">{voteReceipt.voteHash}</div>
          </div>

          <button className="btn btn-primary btn-block" onClick={() => { setVoteReceipt(null); setSelectedElection(null); setSelectedCandidate(null); loadElections(); }}>
            ← Back to Elections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginTop: 'var(--space-xl)' }}>
        <h1 className="page-title">Cast Your Vote</h1>
        <p className="page-subtitle">
          Welcome, {user?.name}! Select an election and choose your candidate.
        </p>
      </div>

      {/* No elections available */}
      {elections.length === 0 && (
        <div className="glass-card glass-card--no-hover text-center" style={{ padding: 'var(--space-3xl)' }}>
          <p style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🗳️</p>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
            No Active Elections
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            There are no elections available for your region right now. Check back later.
          </p>
        </div>
      )}

      {/* Election Selection */}
      {!selectedElection && elections.length > 0 && (
        <div className="grid grid-2 stagger-children">
          {elections.map((election, i) => (
            <div
              key={election._id}
              className={`glass-card animate-fade-in ${election.hasVoted ? 'glass-card--no-hover' : ''}`}
              onClick={() => !election.hasVoted && setSelectedElection(election)}
              style={{ cursor: election.hasVoted ? 'default' : 'pointer', opacity: election.hasVoted ? 0.7 : 1 }}
            >
              <div className="flex justify-between items-center mb-md">
                <span className={`badge ${election.status === 'active' ? 'badge--success' : 'badge--info'}`}>
                  {election.status}
                </span>
                <span className="badge badge--primary">{election.type}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                {election.name}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 'var(--space-md)' }}>
                {election.description}
              </p>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {election.candidates?.length} candidates · {election.type !== 'national' && `${election.state || ''} ${election.district || ''}`}
              </div>
              {election.hasVoted && (
                <div className="badge badge--success mt-md" style={{ display: 'inline-flex' }}>
                  <HiOutlineCheckCircle /> Already Voted
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ballot */}
      {selectedElection && (
        <div className="animate-fade-in">
          <button
            className="btn btn-ghost mb-lg"
            onClick={() => { setSelectedElection(null); setSelectedCandidate(null); }}
          >
            ← Back to Elections
          </button>
          
          <div className="glass-card glass-card--no-hover mb-lg">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>
              {selectedElection.name}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              {selectedElection.description}
            </p>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-lg)', color: 'var(--text-secondary)' }}>
            Select your candidate:
          </h3>

          <div className="grid grid-3 stagger-children">
            {selectedElection.candidates?.map((candidate, idx) => (
              <div
                key={idx}
                className={`candidate-card animate-fade-in ${selectedCandidate === idx ? 'selected' : ''}`}
                onClick={() => setSelectedCandidate(idx)}
              >
                <div className="candidate-avatar">
                  {candidate.name.charAt(0)}
                </div>
                <h3 className="candidate-name">{candidate.name}</h3>
                <p className="candidate-party">{candidate.party}</p>
              </div>
            ))}
          </div>

          {selectedCandidate !== null && (
            <div className="text-center mt-xl animate-scale-in">
              <button
                className="btn btn-success btn-lg"
                onClick={() => setShowConfirm(true)}
              >
                🗳️ Submit Vote for {selectedElection.candidates[selectedCandidate]?.name}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale-in">
            <h3 className="modal-title">Confirm Your Vote</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
              You are about to vote for <strong style={{color: 'var(--text-primary)'}}>
                {selectedElection.candidates[selectedCandidate]?.name}
              </strong> ({selectedElection.candidates[selectedCandidate]?.party}) in{' '}
              <strong style={{color: 'var(--text-primary)'}}>{selectedElection.name}</strong>.
              <br /><br />
              <span style={{ color: 'var(--accent-warning)', fontSize: '0.88rem' }}>
                ⚠️ This action cannot be undone. Your vote will be permanently recorded on the blockchain.
              </span>
            </p>
            <div className="flex gap-md">
              <button className="btn btn-ghost btn-block" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button
                className="btn btn-success btn-block"
                onClick={handleVote}
                disabled={voting}
              >
                {voting ? '⏳ Recording...' : '✓ Confirm Vote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voting;
