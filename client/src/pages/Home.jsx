import { Link } from 'react-router-dom';
import { HiOutlineShieldCheck, HiOutlineFingerPrint, HiOutlineCube, HiOutlineChartBar, HiOutlineLockClosed, HiOutlineGlobe, HiOutlineUserGroup, HiOutlineLightningBolt, HiOutlineClipboardList, HiOutlineExternalLink } from 'react-icons/hi';
import AnimatedEmblem from '../components/AnimatedEmblem';

const Home = () => {
  const features = [
    {
      icon: <HiOutlineCube size={28} />,
      title: 'Blockchain Security',
      desc: 'Every vote is stored on the Ethereum blockchain, ensuring immutability and transparency.',
      color: 'primary'
    },
    {
      icon: <HiOutlineFingerPrint size={28} />,
      title: 'Face Recognition',
      desc: 'Advanced AI-powered face detection with liveness checks prevents impersonation.',
      color: 'success'
    },
    {
      icon: <HiOutlineShieldCheck size={28} />,
      title: 'Aadhaar Verified',
      desc: 'Identity verification through Aadhaar ensures one-person-one-vote integrity.',
      color: 'info'
    },
    {
      icon: <HiOutlineLockClosed size={28} />,
      title: 'End-to-End Encryption',
      desc: 'SHA-256 hashing and JWT authentication protect all voter data.',
      color: 'warning'
    },
    {
      icon: <HiOutlineChartBar size={28} />,
      title: 'Real-Time Results',
      desc: 'Live vote counting with transparent audit trails for complete accountability.',
      color: 'primary'
    },
    {
      icon: <HiOutlineUserGroup size={28} />,
      title: 'Multi-Level Admin',
      desc: 'Hierarchical admin system — National, State, and District level management.',
      color: 'success'
    }
  ];

  const steps = [
    { num: '01', title: 'Register', desc: 'Sign up with Aadhaar, mobile OTP, and face capture' },
    { num: '02', title: 'Verify', desc: 'Complete identity and liveness verification' },
    { num: '03', title: 'Vote', desc: 'Select your candidate on the secure ballot' },
    { num: '04', title: 'Confirm', desc: 'Vote recorded immutably on blockchain' }
  ];

  return (
    <div className="home-page">
      {/* ═══ OFFICIAL NEWS TICKER ═══ */}
      <div className="news-ticker">
        <div className="news-ticker__label">LATEST UPDATES</div>
        <div className="news-ticker__marquee">
          <div className="news-ticker__content">
            <span style={{ margin: '0 20px' }}>🔹 University Project Demonstration.</span>
            <span style={{ margin: '0 20px' }}>🔹 Simulated environment for blockchain voting.</span>
            <span style={{ margin: '0 20px' }}>🔹 Not affiliated with any real government entity.</span>
            <span style={{ margin: '0 20px' }}>🔹 University Project Demonstration.</span>
            <span style={{ margin: '0 20px' }}>🔹 Simulated environment for blockchain voting.</span>
            <span style={{ margin: '0 20px' }}>🔹 Not affiliated with any real government entity.</span>
          </div>
        </div>
      </div>

      {/* ═══ HERO SECTION ═══ */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__orb hero__orb--3" />
        </div>
        
        <div className="page-container hero__content">
          {/* Government Emblem */}
          <div className="hero__emblem animate-scale-in">
            <AnimatedEmblem size={110} animate={true} showText={false} />
          </div>

          <div className="hero__brand animate-slide-up" style={{animationDelay: '0.15s'}}>
            <h1 className="hero__brand-hindi" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '4.5rem', letterSpacing: '-0.02em', dropShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>Prajaatantr</h1>
            <p className="hero__brand-english" style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 700 }}>DECENTRALIZED AUTONOMOUS VOTING</p>
            <p className="hero__brand-slogan" style={{ color: 'var(--text-muted)' }}>An Academic Project Demonstration</p>
          </div>

          <div className="hero__badge animate-fade-in" style={{animationDelay: '0.25s'}}>
            <HiOutlineLightningBolt />
            Blockchain-Secured Digital Voting Platform • Academic Project
          </div>

          <h2 className="hero__title animate-slide-up" style={{animationDelay: '0.3s'}}>
            Secure your
            <span className="hero__title-gradient"> Voting</span>
          </h2>
          <p className="hero__subtitle animate-slide-up" style={{animationDelay: '0.35s'}}>
            Prajaatantr combines blockchain immutability, AI-powered face recognition,
            and Aadhaar verification to deliver India's most secure digital voting experience.
          </p>
          <div className="hero__actions animate-slide-up" style={{animationDelay: '0.4s'}}>
            <Link to="/register" className="btn btn-primary btn-lg">
              🗳️ Register to Vote
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>

          {/* New Live Feed Widget (Desktop Only) */}
          <div className="hero__live-feed hide-mobile animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="feed-header">
              <span className="live-dot"></span> LIVE NETWORK
            </div>
            <div className="feed-items">
              <div className="feed-item" style={{ animationDelay: '0s' }}><span className="feed-timestamp">14s ago</span> <br/>Tx 0x8f4...2A9 confirmed in Block #153421</div>
              <div className="feed-item" style={{ animationDelay: '2s' }}><span className="feed-timestamp">42s ago</span> <br/>Zero-Knowledge Proof verified securely</div>
              <div className="feed-item" style={{ animationDelay: '4s' }}><span className="feed-timestamp">1m ago</span>  <br/>New peering node connected from Mumbai</div>
              <div className="feed-item" style={{ animationDelay: '6s' }}><span className="feed-timestamp">3m ago</span>  <br/>Smart Contract state synchronized</div>
            </div>
          </div>
          
          
          <div className="hero__stats animate-fade-in" style={{animationDelay: '0.55s'}}>
            <div className="hero__stat">
              <span className="hero__stat-value">256-bit</span>
              <span className="hero__stat-label">Encryption</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-value">128-D</span>
              <span className="hero__stat-label">Face Vectors</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-value">29</span>
              <span className="hero__stat-label">States Supported</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-value">100%</span>
              <span className="hero__stat-label">Transparent</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ZERO-KNOWLEDGE PRIVACY ═══ */}
      <section className="section" style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: 'var(--space-2xl) 0' }}>
        <div className="page-container">
          <div className="section__header" style={{ textAlign: 'left', borderBottom: '1px solid #1e293b', paddingBottom: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <HiOutlineLockClosed color="#10b981" size={32} />
              Zero-Knowledge Architecture & Privacy
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '8px' }}>
              We employ cryptographic zero-knowledge proofs (zk-SNARKs) to mathematically prove your voting eligibility without ever revealing your identity or your vote.
            </p>
          </div>

          <div className="grid grid-3">
            {[
              {
                title: 'Data Anonymization',
                desc: 'Your Aadhaar and facial biometrics are hashed locally on your device. Only irreversible cryptographic proofs are sent to our servers.',
                badge: 'Privacy Protocol'
              },
              {
                title: 'Homomorphic Encryption',
                desc: 'Votes are encrypted and tallied. The final count can be verified without ever decrypting individual voter choices, ensuring absolute ballot secrecy.',
                badge: 'Cryptography'
              },
              {
                title: 'Decentralized Identity',
                desc: 'Your identity is self-sovereign. The smart contract validates your right to vote independently from any central government server or database limit.',
                badge: 'Web3 Core'
              }
            ].map((feature, idx) => (
              <div key={idx} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderTop: '3px solid #10b981',
                padding: 'var(--space-lg)',
                borderRadius: '8px',
                transition: 'all 0.3s'
              }}>
                <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {feature.badge}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px', lineHeight: 1.4 }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NATIONAL WELFARE & BENEFITS INTEGRATION ═══ */}
      <section className="section" style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', padding: 'var(--space-2xl) 0' }}>
        <div className="page-container">
          <div className="section__header" style={{ textAlign: 'left', borderBottom: '2px solid #0f172a', paddingBottom: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <HiOutlineClipboardList color="#3b82f6" size={32} />
              Verified Open Data & Welfare Schemes
            </h2>
            <p style={{ color: '#475569', fontSize: '1rem', marginTop: '8px' }}>
              We instantly match your decentralized identity against integrated <strong>india.gov.in</strong> endpoints to check eligibility for National Social Development Benefits.
            </p>
          </div>

          <div className="grid grid-3">
            {[
              {
                title: 'Apply for Postal Life Insurance by India Post',
                desc: 'The India Post portal allows citizens to apply online for Postal Life Insurance (PLI) services. Offering affordable insurance plans designed to provide financial security.',
                ministry: 'Ministry of Communications',
                url: 'https://www.india.gov.in/services/details/apply-for-postal-life-insurance-by-india-post'
              },
              {
                title: 'Apply for Dependent Children Pension Scheme',
                desc: 'Supports children under 21 years whose parents are deceased, missing, or incapacitated. With an annual family income cap of ₹60,000.',
                ministry: 'Punjab Government',
                url: 'https://www.india.gov.in/services/details/apply-for-dependent-children-pension-scheme-punjab'
              },
              {
                title: 'Subsidy Scheme for Widows and Destitute Women',
                desc: 'The government provides financial aid to widows and destitute women for their daughters marriage. Applicants must submit relevant documents, including income proof.',
                ministry: 'Uttar Pradesh',
                url: 'https://www.india.gov.in/services/details/apply-for-subsidy-scheme-for-widows-and-destitute-women-daughter-marriage-uttar-pradesh'
              },
              {
                title: 'Apply for National Family Benefit Scheme',
                desc: 'This scheme offers immediate financial aid to families of deceased breadwinners. Assistance is provided automatically after verifying the family eligibility on-chain.',
                ministry: 'Jammu and Kashmir (UT)',
                url: 'https://www.india.gov.in/services/details/apply-for-national-family-benefit-scheme-jammu-and-kashmir'
              },
              {
                title: 'National Social Assistance Programme (NSAP)',
                desc: 'Access the most recent open data abstracts concerning thousands of beneficiaries nationwide for demographic distribution planning.',
                ministry: 'National Open Data',
                url: 'https://data.gov.in/catalog/national-social-assistance-programmensap-beneficiaries-abstract'
              },
              {
                title: 'Scholarship Data for Municipal Corporations',
                desc: 'Integration with municipal scholarship portals to easily apply for local educational grants without filling out additional identity forms.',
                ministry: 'Navi Mumbai Corporation',
                url: 'https://data.gov.in/catalog/scholarship-data-navi-mumbai-municipal-corporation'
              }
            ].map((service, idx) => (
              <div key={idx} className="gov-service-card" style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderTop: '4px solid #3b82f6',
                padding: 'var(--space-lg)',
                borderRadius: '6px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px rgba(15,23,42,0.05)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => window.open(service.url, '_blank')}
              >
                <span style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {service.ministry}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px', lineHeight: 1.4 }}>
                  {service.title}
                </h3>
                <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, flex: 1, marginBottom: '16px' }}>
                  {service.desc}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <span style={{ color: '#0f172a', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Verify Eligibility <HiOutlineExternalLink color="#3b82f6" />
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', justifyContent: 'center' }}>
             <button className="btn btn-secondary" style={{ borderColor: '#3b82f6', color: '#3b82f6' }} onClick={() => window.open('https://www.india.gov.in/category/benefits-social-development', '_blank')}>
               Load Additional Schemes
             </button>
          </div>
        </div>
      </section>      {/* ═══ FEATURES ═══ */}
      <section className="section">
        <div className="page-container">
          <div className="section__header">
            <h2 className="section__title">Why Prajaatantr?</h2>
            <p className="section__subtitle">
              Built with cutting-edge technology to ensure every vote counts
            </p>
          </div>
          <div className="grid grid-3 stagger-children">
            {features.map((f, i) => (
              <div key={i} className="feature-card glass-card animate-fade-in">
                <div className={`feature-card__icon stat-card__icon--${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="section section--dark">
        <div className="page-container">
          <div className="section__header">
            <h2 className="section__title">How It Works</h2>
            <p className="section__subtitle">Four simple steps to cast your secure vote</p>
          </div>
          <div className="timeline">
            {steps.map((s, i) => (
              <div key={i} className="timeline__item animate-slide-up" style={{animationDelay: `${i * 0.1}s`}}>
                <div className="timeline__number">{s.num}</div>
                <h3 className="timeline__title">{s.title}</h3>
                <p className="timeline__desc">{s.desc}</p>
              </div>
            ))}
          </div>



        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="section">
        <div className="page-container text-center">
          <div className="cta-card glass-card glass-card--no-hover">
            <h2 className="cta-card__title">Ready to Cast Your Vote?</h2>
            <p className="cta-card__subtitle">
              Join the blockchain voting revolution. Register now and experience
              the future of democratic participation.
            </p>
            <div className="flex gap-md justify-center mt-xl">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started →
              </Link>
              <Link to="/admin/login" className="btn btn-ghost btn-lg">
                Admin Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* ─── Hero ─── */
        .hero {
          position: relative;
          min-height: 92vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .hero__bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .hero__orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
        }
        .hero__orb--1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(234, 179, 8, 0.15), rgba(99, 102, 241, 0.2), transparent);
          top: -10%;
          left: -5%;
          animation: float 8s ease-in-out infinite;
        }
        .hero__orb--2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.25), transparent);
          bottom: -5%;
          right: -5%;
          animation: float 10s ease-in-out infinite reverse;
        }
        .hero__orb--3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.2), transparent);
          top: 40%;
          right: 20%;
          animation: float 12s ease-in-out infinite;
        }
        .hero__content {
          position: relative;
          z-index: 1;
          text-align: center;
          padding-top: 20px;
        }
        .hero__emblem {
          margin-bottom: var(--space-lg);
          display: flex;
          justify-content: center;
        }
        .hero__brand {
          margin-bottom: var(--space-xl);
        }
        .hero__brand-hindi {
          font-size: 3.8rem;
          font-weight: 900;
          background: linear-gradient(135deg, #eab308 0%, #fbbf24 25%, #f59e0b 50%, #d97706 75%, #eab308 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% 100%;
          letter-spacing: 0.04em;
          line-height: 1.2;
          margin-bottom: 4px;
          text-shadow: none;
          filter: drop-shadow(0 2px 8px rgba(234, 179, 8, 0.15));
        }
        .hero__brand-english {
          font-size: 1rem;
          color: rgba(30, 58, 138, 0.45); /* Navy transparent */
          letter-spacing: 0.4em;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .hero__brand-slogan {
          font-size: 0.92rem;
          color: var(--accent-secondary); /* Saffron */
          font-style: italic;
          font-weight: 500;
          letter-spacing: 0.05em;
        }
        
        /* News Ticker */
        .news-ticker {
          background: #db2777; /* Subtle rose/red for urgent updates like NIC portal */
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          height: 32px;
          overflow: hidden;
          width: 100%;
        }
        .news-ticker__label {
          background: #be185d;
          padding: 0 16px;
          height: 100%;
          display: flex;
          align-items: center;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          white-space: nowrap;
          z-index: 2;
        }
        .news-ticker__marquee {
          flex: 1;
          overflow: hidden;
          position: relative;
          white-space: nowrap;
        }
        .news-ticker__content {
          display: inline-block;
          animation: marqueeScroll 25s linear infinite;
        }
        .news-ticker:hover .news-ticker__content {
          animation-play-state: paused;
        }
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hero__live-feed {
          position: absolute;
          right: 2%;
          top: 25%;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          width: 300px;
          text-align: left;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          color: white;
          z-index: 10;
        }
        .feed-header {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: var(--space-md);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          background: var(--accent-success);
          border-radius: 50%;
          box-shadow: 0 0 12px var(--accent-success);
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          50% { transform: scale(1.2); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .feed-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .feed-item {
          font-family: var(--font-sans);
          font-size: 0.82rem;
          color: #e2e8f0;
          border-left: 2px solid rgba(16, 185, 129, 0.5);
          padding-left: 12px;
          opacity: 0;
          animation: slideRightIn 0.8s ease-out forwards;
          line-height: 1.4;
        }
        .feed-timestamp {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: #94a3b8;
        }
        @keyframes slideRightIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .hero__badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: rgba(234, 179, 8, 0.08);
          border: 1px solid rgba(234, 179, 8, 0.2);
          border-radius: var(--radius-full);
          color: rgba(234, 179, 8, 0.7);
          font-size: 0.82rem;
          font-weight: 600;
          margin-bottom: var(--space-lg);
        }
        .hero__title {
          font-size: 3rem;
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin-bottom: var(--space-lg);
        }
        .hero__title-gradient {
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero__subtitle {
          font-size: 1.2rem;
          color: var(--text-secondary);
          max-width: 680px;
          margin: 0 auto var(--space-2xl);
          line-height: 1.7;
        }
        .hero__actions {
          display: flex;
          gap: var(--space-md);
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: var(--space-3xl);
        }
        .hero__stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-xl);
          flex-wrap: wrap;
        }
        .hero__stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .hero__stat-value {
          font-family: var(--font-mono);
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .hero__stat-label {
          font-size: 0.82rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .hero__stat-divider {
          width: 1px;
          height: 40px;
          background: var(--border-primary);
        }

        /* ─── Sections ─── */
        .section {
          padding: var(--space-3xl) 0;
        }
        .section--dark {
          background: rgba(15, 23, 42, 0.4);
          border-top: 1px solid var(--border-secondary);
          border-bottom: 1px solid var(--border-secondary);
        }
        .section__header {
          text-align: center;
          margin-bottom: var(--space-2xl);
        }
        .section__title {
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: var(--space-sm);
          letter-spacing: -0.02em;
        }
        .section__subtitle {
          color: var(--text-secondary);
          font-size: 1.05rem;
        }

        /* ─── Feature Cards ─── */
        .feature-card {
          text-align: left;
        }
        .feature-card__icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-md);
        }
        .feature-card__title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--space-sm);
        }
        .feature-card__desc {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* ─── Timeline ─── */
        .timeline {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-lg);
        }
        .timeline__item {
          text-align: center;
          padding: var(--space-xl);
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          transition: all var(--transition-normal);
        }
        .timeline__item:hover {
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-glow);
          transform: translateY(-4px);
        }
        .timeline__number {
          font-family: var(--font-mono);
          font-size: 2.5rem;
          font-weight: 900;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: var(--space-md);
        }
        .timeline__title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--space-sm);
        }
        .timeline__desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* ─── CTA ─── */
        .cta-card {
          padding: var(--space-3xl);
          text-align: center;
          background: var(--gradient-card);
        }
        .cta-card__title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: var(--space-md);
        }
        .cta-card__subtitle {
          font-size: 1.05rem;
          color: var(--text-secondary);
          max-width: 540px;
          margin: 0 auto;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .hero__title { font-size: 2rem; }
          .hero__brand-hindi { font-size: 2.5rem; }
          .hero__brand-english { font-size: 0.75rem; letter-spacing: 0.25em; }
          .hero__subtitle { font-size: 1rem; }
          .timeline { grid-template-columns: repeat(2, 1fr); }
          .hero__stats { gap: var(--space-md); }
          .hero__stat-divider { display: none; }
        }
        @media (max-width: 480px) {
          .timeline { grid-template-columns: 1fr; }
          .hero__title { font-size: 1.7rem; }
          .hero__brand-hindi { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
};

export default Home;
