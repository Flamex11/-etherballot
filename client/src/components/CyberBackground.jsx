import { useEffect, useRef } from 'react';

const CyberBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle nodes
    const particleCount = Math.min(Math.floor((width * height) / 20000), 55);
    const particles = [];
    const colors = [
      'rgba(37, 99, 235, ',   // Royal blue
      'rgba(2, 132, 199, ',   // Sky cyan
      'rgba(99, 102, 241, ',  // Indigo
      'rgba(5, 150, 105, '    // Emerald
    ];

    // Floating isometric cubes / blocks in background
    const blocks = [];
    const blockCount = 5;

    for (let i = 0; i < blockCount; i++) {
      blocks.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 22 + 14,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        angle: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.004,
        color: colors[i % colors.length]
      });
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1.2,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        baseColor: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.25,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseVal: Math.random() * Math.PI
      });
    }

    let mouse = { x: -1000, y: -1000, radius: 130 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Draw isometric hex / cube (light theme)
    const drawHexBlock = (x, y, size, angle, colorStr) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const hx = Math.cos(a) * size;
        const hy = Math.sin(a) * size;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.strokeStyle = `${colorStr} 0.2)`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Inner wireframe lines
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(0) * size, Math.sin(0) * size);
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos((2 * Math.PI) / 3) * size, Math.sin((2 * Math.PI) / 3) * size);
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos((4 * Math.PI) / 3) * size, Math.sin((4 * Math.PI) / 3) * size);
      ctx.strokeStyle = `${colorStr} 0.12)`;
      ctx.stroke();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw floating geometric blocks
      blocks.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        b.angle += b.vRot;

        if (b.x < -50) b.x = width + 50;
        if (b.x > width + 50) b.x = -50;
        if (b.y < -50) b.y = height + 50;
        if (b.y > height + 50) b.y = -50;

        drawHexBlock(b.x, b.y, b.size, b.angle, b.color);
      });

      // 2. Update & draw constellation nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.pulseVal += p.pulseSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Interactive mouse interaction
        const dxMouse = p.x - mouse.x;
        const dyMouse = p.y - mouse.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < mouse.radius) {
          const force = (mouse.radius - distMouse) / mouse.radius;
          p.x += (dxMouse / distMouse) * force * 1.8;
          p.y += (dyMouse / distMouse) * force * 1.8;
        }

        // Draw connections between nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const lineAlpha = (1 - dist / 120) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${p.baseColor} ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Draw node
        const currentAlpha = p.alpha + Math.sin(p.pulseVal) * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.baseColor} ${Math.max(0.1, currentAlpha)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="cyber-background-container">
      <div className="cyber-aurora cyber-aurora--1" />
      <div className="cyber-aurora cyber-aurora--2" />
      <div className="cyber-aurora cyber-aurora--3" />
      <canvas ref={canvasRef} className="cyber-canvas" />

      <style>{`
        .cyber-background-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
          background: #f8fafc;
        }
        .cyber-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .cyber-aurora {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.16;
          pointer-events: none;
        }
        .cyber-aurora--1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%);
          top: -10%;
          left: -5%;
          animation: auroraDrift1 22s ease-in-out infinite alternate;
        }
        .cyber-aurora--2 {
          width: 550px;
          height: 550px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
          bottom: -10%;
          right: -5%;
          animation: auroraDrift2 26s ease-in-out infinite alternate;
        }
        .cyber-aurora--3 {
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(2, 132, 199, 0.2) 0%, transparent 70%);
          top: 40%;
          left: 45%;
          animation: auroraDrift3 20s ease-in-out infinite alternate;
        }

        @keyframes auroraDrift1 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(60px, 40px) scale(1.15); }
          100% { transform: translate(-30px, 70px) scale(0.95); }
        }
        @keyframes auroraDrift2 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-50px, -40px) scale(1.1); }
          100% { transform: translate(40px, -60px) scale(0.9); }
        }
        @keyframes auroraDrift3 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-40px, 50px) scale(1.2); }
          100% { transform: translate(50px, -30px) scale(0.85); }
        }

        @media (prefers-reduced-motion: reduce) {
          .cyber-aurora {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CyberBackground;
