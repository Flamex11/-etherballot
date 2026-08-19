import { useState, useEffect } from 'react';

const AnimatedEmblem = ({ size = 48, showText = false, titleHindi = "भारत सरकार", titleEng = "Government of India" }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`gov-emblem-wrapper ${loaded ? 'gov-emblem-loaded' : ''}`}>
      <div className="gov-emblem-container">
        <img 
          src="/emblem.png" 
          alt="State Emblem of India - Satyameva Jayate" 
          className="gov-emblem-image"
          style={{ width: size, height: size }}
          onLoad={() => setLoaded(true)}
        />
      </div>
      {showText && (
        <div className="gov-emblem-text-group">
          <span className="gov-emblem-hindi">{titleHindi}</span>
          <span className="gov-emblem-english">{titleEng}</span>
          <span className="gov-emblem-motto">सत्यमेव जयते</span>
        </div>
      )}

      <style>{`
        .gov-emblem-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          opacity: 0;
          transform: translateY(2px);
          transition: all 0.4s ease-out;
        }
        .gov-emblem-loaded {
          opacity: 1;
          transform: translateY(0);
        }
        .gov-emblem-container {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          padding: 2px;
          border-radius: 4px;
        }
        .gov-emblem-image {
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
        }
        .gov-emblem-text-group {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
          text-align: left;
        }
        .gov-emblem-hindi {
          font-family: 'Noto Sans Devanagari', 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 0.01em;
        }
        .gov-emblem-english {
          font-size: 0.8rem;
          font-weight: 700;
          color: #1e3a8a;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .gov-emblem-motto {
          font-family: 'Noto Sans Devanagari', 'Inter', sans-serif;
          font-size: 0.65rem;
          color: #64748b;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default AnimatedEmblem;
