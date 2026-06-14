import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const ringRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    // Disable on touch devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setVisible(true);
    };

    const onMouseLeave = () => {
      setVisible(false);
    };

    const onMouseEnter = () => {
      setVisible(true);
    };

    const handleHoverStart = () => setHovered(true);
    const handleHoverEnd = () => setHovered(false);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    const updateHoverListeners = () => {
      const interactives = document.querySelectorAll('button, a, select, input, textarea, [role="button"], .clickable');
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', handleHoverStart);
        el.removeEventListener('mouseleave', handleHoverEnd);
        el.addEventListener('mouseenter', handleHoverStart);
        el.addEventListener('mouseleave', handleHoverEnd);
      });
    };

    // Monitor DOM for new interactive items
    const observer = new MutationObserver(updateHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    updateHoverListeners();

    // Lerp animation for smooth lag/trailing
    let animationFrameId: number;
    const animate = () => {
      const speed = 0.15; // interpolation speed
      currentX += (targetX - currentX) * speed;
      currentY += (targetY - currentY) * speed;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${hovered ? 1.8 : 1})`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [hovered]);

  return (
    <div
      ref={ringRef}
      className={`custom-cursor-ring ${visible ? 'visible' : ''} ${hovered ? 'hovered' : ''}`}
      style={{
        position: 'fixed',
        top: -8,
        left: -8,
        width: 16,
        height: 16,
        borderRadius: '50%',
        border: '1.5px solid var(--accent-primary)',
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'border-color 0.2s ease, opacity 0.2s ease',
        opacity: visible ? 0.8 : 0,
      }}
    />
  );
};

