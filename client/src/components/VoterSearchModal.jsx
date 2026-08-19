import { useState } from 'react';
import { voterAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  HiOutlineSearch, 
  HiOutlineX, 
  HiOutlineIdentification, 
  HiOutlineDocumentText, 
  HiOutlineCheckCircle,
  HiOutlinePrinter,
  HiOutlineShieldCheck
} from 'react-icons/hi';
import AnimatedEmblem from './AnimatedEmblem';

const VoterSearchModal = ({ isOpen, onClose, defaultTab = 'search' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('epic'); // 'epic' | 'aadhaar' | 'ref'
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a valid search identifier');
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      // Simulate/perform lookup
      const isRef = searchType === 'ref';
      if (isRef) {
        // Simulated application tracker response
        setTimeout(() => {
          setResult({
            isApplication: true,
            refId: searchQuery.toUpperCase(),
            formType: 'Form 6 - New Voter Registration',
            applicantName: 'Sovereign Citizen',
            submittedOn: '14 August 2026',
            status: 'Approved & Cryptographically Minted on Ethereum Ledger',
            epicNumber: 'EB' + Math.floor(1000000 + Math.random() * 9000000),
            stage: 4
          });
          setLoading(false);
        }, 600);
      } else {
        // Look up by EPIC or Aadhaar
        setTimeout(() => {
          setResult({
            isVoter: true,
            name: 'RAHUL SHARMA',
            epicNumber: searchType === 'epic' ? searchQuery.toUpperCase() : 'EB9482104',
            aadhaarHash: '****-****-8842',
            gender: 'MALE',
            age: 29,
            state: 'MAHARASHTRA',
            district: 'MUMBAI',
            constituency: '31 - Mumbai South Parliamentary',
            pollingStation: 'Room No. 4, Government Higher Secondary School, Colaba',
            bloName: 'Suresh Patil (BLO Code: MH-204)',
            bloContact: '1950 (Ext: 442)',
            status: 'Active & Verified',
            blockNumber: '#153,492',
            timestamp: new Date().toISOString()
          });
          setLoading(false);
          toast.success('Electoral record retrieved from sovereign ledger!');
        }, 600);
      }
    } catch (err) {
      toast.error('No matching record found in current electoral roll');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content gov-search-modal animate-scale-in" style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-md mb-md" style={{ borderBottom: '2px solid #1e3a8a' }}>
          <div className="flex items-center gap-md">
            <AnimatedEmblem size={36} />
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {activeTab === 'search' ? 'Electoral Roll Search' : 'Track Application Status'}
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                National Voter Services • Sovereign Ledger Query
              </span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: 6 }}>
            <HiOutlineX size={20} />
          </button>
        </div>

        {/* Search Tab Switcher */}
        <div className="flex gap-sm mb-lg" style={{ background: '#f1f5f9', padding: 4, borderRadius: 'var(--radius-md)' }}>
          <button
            className={`btn btn-sm ${activeTab === 'search' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setActiveTab('search'); setResult(null); setSearchType('epic'); }}
            style={{ flex: 1 }}
          >
            <HiOutlineSearch size={16} /> Search in Electoral Roll
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'track' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setActiveTab('track'); setResult(null); setSearchType('ref'); }}
            style={{ flex: 1 }}
          >
            <HiOutlineDocumentText size={16} /> Track Application (Form 6/8)
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-lg">
          {activeTab === 'search' && (
            <div className="flex gap-md mb-md">
              <label className="flex items-center gap-xs" style={{ fontSize: '0.86rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="searchType"
                  checked={searchType === 'epic'}
                  onChange={() => setSearchType('epic')}
                />
                <span>By EPIC / Voter ID</span>
              </label>
              <label className="flex items-center gap-xs" style={{ fontSize: '0.86rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="searchType"
                  checked={searchType === 'aadhaar'}
                  onChange={() => setSearchType('aadhaar')}
                />
                <span>By Aadhaar Identifier</span>
              </label>
            </div>
          )}

          <div className="flex gap-sm">
            <input
              type="text"
              className="form-input"
              placeholder={
                activeTab === 'track'
                  ? 'Enter Form Reference Number (e.g. REF-2026-MH-8492)'
                  : searchType === 'epic'
                  ? 'Enter EPIC Voter Card No. (e.g. EB1234567 or XYZ8942011)'
                  : 'Enter 12-digit Aadhaar Number'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Querying...' : 'Search →'}
            </button>
          </div>
        </form>

        {/* Results View */}
        {result && result.isVoter && (
          <div className="gov-epic-card animate-fade-in">
            {/* e-EPIC Header */}
            <div className="gov-epic-header">
              <div className="flex items-center gap-sm">
                <AnimatedEmblem size={30} />
                <div>
                  <div className="gov-epic-title-hi">भारत निर्वाचन आयोग</div>
                  <div className="gov-epic-title-en">ELECTION COMMISSION OF INDIA</div>
                </div>
              </div>
              <div className="gov-epic-badge">
                <HiOutlineShieldCheck /> VERIFIED ELECTOR
              </div>
            </div>

            {/* e-EPIC Body */}
            <div className="gov-epic-body">
              <div className="gov-epic-field">
                <span className="gov-epic-label">EPIC NO. / मतदाता पहचान पत्र:</span>
                <span className="gov-epic-value-bold">{result.epicNumber}</span>
              </div>
              <div className="gov-epic-field">
                <span className="gov-epic-label">ELECTOR NAME / नाम:</span>
                <span className="gov-epic-value">{result.name}</span>
              </div>
              <div className="gov-epic-field">
                <span className="gov-epic-label">STATE & DISTRICT:</span>
                <span className="gov-epic-value">{result.state}, {result.district}</span>
              </div>
              <div className="gov-epic-field">
                <span className="gov-epic-label">PARLIAMENTARY CONSTITUENCY:</span>
                <span className="gov-epic-value">{result.constituency}</span>
              </div>
              <div className="gov-epic-field">
                <span className="gov-epic-label">POLLING STATION / मतदान केंद्र:</span>
                <span className="gov-epic-value">{result.pollingStation}</span>
              </div>
              <div className="gov-epic-field">
                <span className="gov-epic-label">DESIGNATED BLO (BOOTH LEVEL OFFICER):</span>
                <span className="gov-epic-value">{result.bloName} • Helpline: {result.bloContact}</span>
              </div>
            </div>

            {/* e-EPIC Footer */}
            <div className="gov-epic-footer">
              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                ● Cryptographic Status: {result.status} (Ledger {result.blockNumber})
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                <HiOutlinePrinter size={16} /> Print e-EPIC Card
              </button>
            </div>
          </div>
        )}

        {result && result.isApplication && (
          <div className="gov-track-card animate-fade-in">
            <div className="flex items-center gap-sm mb-md">
              <HiOutlineCheckCircle size={24} style={{ color: '#059669' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Application Status: Approved
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                  Ref: {result.refId} • {result.formType}
                </span>
              </div>
            </div>

            <div className="track-stepper">
              <div className="track-step completed">
                <div className="track-step__dot">✓</div>
                <span>Submitted</span>
              </div>
              <div className="track-line completed" />
              <div className="track-step completed">
                <div className="track-step__dot">✓</div>
                <span>BLO Field Verified</span>
              </div>
              <div className="track-line completed" />
              <div className="track-step completed">
                <div className="track-step__dot">✓</div>
                <span>ERO Approved</span>
              </div>
              <div className="track-line completed" />
              <div className="track-step completed">
                <div className="track-step__dot">✓</div>
                <span>EPIC Generated: <strong>{result.epicNumber}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .gov-search-modal {
          background: #ffffff;
        }
        .gov-epic-card {
          border: 2px solid #1e3a8a;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
        }
        .gov-epic-header {
          background: #1e3a8a;
          color: #ffffff;
          padding: 10px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .gov-epic-title-hi {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 0.92rem;
          font-weight: 800;
          color: #ff9933;
        }
        .gov-epic-title-en {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
        }
        .gov-epic-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 3px 8px;
          border-radius: var(--radius-full);
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .gov-epic-body {
          padding: 14px 18px;
          display: grid;
          gap: 8px;
          background: #f8fafc;
        }
        .gov-epic-field {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 4px;
          border-bottom: 1px dashed #cbd5e1;
        }
        .gov-epic-label {
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 600;
        }
        .gov-epic-value {
          font-size: 0.86rem;
          color: #0f172a;
          font-weight: 600;
          text-align: right;
        }
        .gov-epic-value-bold {
          font-size: 0.95rem;
          color: #1d4ed8;
          font-weight: 800;
          font-family: var(--font-mono);
        }
        .gov-epic-footer {
          padding: 10px 16px;
          background: #ffffff;
          border-top: 1px solid var(--border-primary);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .gov-track-card {
          background: #f8fafc;
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-md);
          padding: 16px;
        }
        .track-stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 16px;
          padding: 0 8px;
        }
        .track-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 600;
          text-align: center;
          max-width: 90px;
        }
        .track-step.completed {
          color: #059669;
        }
        .track-step__dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #059669;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
        }
        .track-line {
          flex: 1;
          height: 2px;
          background: #cbd5e1;
          margin: 0 6px;
          margin-bottom: 20px;
        }
        .track-line.completed {
          background: #059669;
        }
      `}</style>
    </div>
  );
};

export default VoterSearchModal;
