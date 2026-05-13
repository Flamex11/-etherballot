import { useState, useEffect } from 'react';

const AnimatedEmblem = ({ size = 48, showText = false }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`emblem-wrapper ${loaded ? 'emblem-loaded' : ''}`}>
      <div className="emblem-glow" />
      <div className="emblem-ring">
        <div className="emblem-ring-inner" />
        <img 
          src="/emblem.png" 
          alt="National Emblem of India" 
          className="emblem-image"
          style={{ width: size, height: size }}
          onLoad={() => setLoaded(true)}
        />
      </div>
      {showText && (
        <div className="emblem-text-group">
          <span className="emblem-hindi">प्रजातंत्र</span>
          <span className="emblem-tagline">सत्यमेव जयते</span>
        </div>
      )}

      <style>{`
        .emblem-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .emblem-wrapper.emblem-loaded {
          opacity: 1;
          transform: scale(1);
        }
        .emblem-glow {
          position: absolute;
          width: ${size + 20}px;
          height: ${size + 20}px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(234, 179, 8, 0.12) 0%, transparent 70%);
          left: -10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          z-index: 0;
        }
        .emblem-ring {
          position: relative;
          z-index: 1;
          border-radius: 50%;
          padding: 3px;
          background: linear-gradient(135deg,
            rgba(234, 179, 8, 0.5),
            rgba(234, 179, 8, 0.15),
            rgba(234, 179, 8, 0.5)
          );
        }
        .emblem-ring-inner {
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          background: var(--bg-primary, #06080f);
          z-index: 0;
        }
        .emblem-image {
          position: relative;
          z-index: 1;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          filter: drop-shadow(0 0 6px rgba(234, 179, 8, 0.15));
        }
        .emblem-text-group {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .emblem-hindi {
          font-size: 1.6rem;
          font-weight: 900;
          background: linear-gradient(135deg, #eab308 0%, #fbbf24 30%, #f59e0b 60%, #eab308 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.02em;
          line-height: 1.2;
        }
        .emblem-tagline {
          font-size: 0.65rem;
          color: rgba(234, 179, 8, 0.6);
          letter-spacing: 0.15em;
          font-weight: 500;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
};

export default AnimatedEmblem;

