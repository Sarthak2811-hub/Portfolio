import React, { useEffect, useRef } from 'react';

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];
    
    const mouse = { x: -1000, y: -1000, active: false };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const density = Math.floor((canvas.width * canvas.height) / 12000);
      const limit = Math.min(density, 120); // cap particles for performance
      
      for (let i = 0; i < limit; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 1.5 + 1,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw network lines
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        // Update positions
        p1.x += p1.vx;
        p1.y += p1.vy;
        
        // Bounce off edges
        if (p1.x < 0 || p1.x > canvas.width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > canvas.height) p1.vy *= -1;
        
        // Draw particle
        ctx.fillStyle = 'rgba(99, 102, 241, 0.4)'; // Indigo particle
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect to other particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 100) {
            const alpha = (100 - dist) / 100 * 0.15;
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Connect to mouse
        if (mouse.active) {
          const mdx = p1.x - mouse.x;
          const mdy = p1.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          
          if (mdist < 150) {
            const malpha = (150 - mdist) / 150 * 0.25;
            ctx.strokeStyle = `rgba(20, 184, 166, ${malpha})`; // Teal connection
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            ctx.lineWidth = 0.5; // restore default
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resizeCanvas);
    
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseleave', onMouseLeave);

    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', onMouseMove);
      document.body.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        background: '#030206', // Premium deep obsidian background
      }}
    />
  );
};
