import React, { useEffect, useState } from 'react';
import { Terminal, Shield, Cpu, RefreshCw } from 'lucide-react';

interface HeroProps {
  onExplorePlayground: () => void;
  onExploreProjects: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplorePlayground, onExploreProjects }) => {
  const [typedText, setTypedText] = useState('');
  const subheaders = [
    'Building Real-Time Whiteboards.',
    'Designing Production-Grade Document RAG.',
    'Optimizing Backoffs, Caching & Cursors.',
    'Full-Stack AI & Systems Engineer.'
  ];
  const [subIndex, setSubIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: number;
    const currentString = subheaders[subIndex];

    if (!isDeleting && charIndex === currentString.length) {
      // Finished typing: pause for 2s, then switch to deleting mode
      timer = window.setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
    } else if (isDeleting && charIndex === 0) {
      // Finished deleting: change phrase and switch to typing mode
      setIsDeleting(false);
      setSubIndex((prev) => (prev + 1) % subheaders.length);
    } else {
      // Normal typing or deleting progression
      timer = window.setTimeout(() => {
        if (isDeleting) {
          setTypedText(currentString.substring(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);
        } else {
          setTypedText(currentString.substring(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        }
      }, isDeleting ? 30 : 70);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, subIndex]);

  return (
    <section className="hero-section" id="home">
      <div className="hero-glow-1" />
      <div className="hero-glow-2" />
      
      <div className="hero-content">
        <div className="status-badge">
          <span className="pulse-indicator"></span>
          Available for Opportunities & Collaboration
        </div>

        <h1 className="hero-title">
          Engineering High-Performance <br />
          <span className="glowing-text">Interactive Systems</span>
        </h1>

        <div className="hero-subtitle-container">
          <Terminal size={18} className="terminal-icon" />
          <span className="cursor-symbol">&gt;</span>
          <span className="hero-typed-text">{typedText}</span>
          <span className="typed-cursor">|</span>
        </div>

        <p className="hero-description">
          I am Sarthak Tiwari, a Full-Stack Developer specializing in low-latency real-time applications and robust AI systems. 
          My expertise spans infinite vector canvases, asynchronous retrieval-augmented generation (RAG) models, 
          resilient API fallbacks, rate limiters, and system performance optimizations.
        </p>

        <div className="hero-cta-buttons">
          <button className="btn-primary" onClick={onExplorePlayground}>
            Interactive Playgrounds
          </button>
          <button className="btn-secondary" onClick={onExploreProjects}>
            View Projects
          </button>
        </div>

        <div className="hero-pill-row">
          <div className="hero-pill">
            <Cpu size={14} />
            <span>FastAPI & ChromaDB</span>
          </div>
          <div className="hero-pill">
            <RefreshCw size={14} />
            <span>WebSockets & Next.js</span>
          </div>
          <div className="hero-pill">
            <Shield size={14} />
            <span>Resilient Systems</span>
          </div>
        </div>
      </div>
    </section>
  );
};
