import React, { useState, useEffect } from 'react';
import { ParticleBackground } from './components/ParticleBackground';
import { CustomCursor } from './components/CustomCursor';
import { Hero } from './components/Hero';
import { SketcherSandbox } from './components/SketcherSandbox';
import { DocBrainConsole } from './components/DocBrainConsole';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';
import { Terminal } from './components/Terminal';
import { Contact } from './components/Contact';
import { Code2, PenTool, Database, Command, Cpu, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sketcher' | 'docbrain'>('sketcher');
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Reset scroll on refresh and disable browser scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'playground', 'projects', 'skills', 'terminal', 'contact'];
      const scrollPos = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-container">
      {/* Background Particles & Interactive Pointer */}
      <ParticleBackground />
      <CustomCursor />

      {/* Floating Header */}
      <header className="navbar-header">
        <div className="navbar-logo clickable" onClick={() => { scrollToSection('home'); setMobileMenuOpen(false); }}>
          <Code2 size={22} className="logo-accent animate-pulse" />
          <span className="logo-text">Sarthak.Systems</span>
        </div>

        {/* Mobile Hamburger toggle button */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {[
            { id: 'home', label: 'Home' },
            { id: 'playground', label: 'Playground' },
            { id: 'projects', label: 'Architecture' },
            { id: 'skills', label: 'Skills' },
            { id: 'terminal', label: 'CLI Mode' },
            { id: 'contact', label: 'Contact' },
          ].map((item) => (
            <button
              key={item.id}
              className={`nav-link-btn clickable ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => {
                scrollToSection(item.id);
                setMobileMenuOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Hero Presentation */}
      <Hero 
        onExplorePlayground={() => scrollToSection('playground')}
        onExploreProjects={() => scrollToSection('projects')}
      />

      {/* Interactive Playground Section */}
      <section className="playground-section" id="playground">
        <div className="section-header">
          <h2 className="section-title">Interactive Sandboxes</h2>
          <p className="section-subtitle">
            Interact with visual simulation layers of my signature systems
          </p>
        </div>

        {/* Tab Selection */}
        <div className="sandbox-tab-row">
          <button
            className={`tab-btn clickable ${activeTab === 'sketcher' ? 'active' : ''}`}
            onClick={() => setActiveTab('sketcher')}
          >
            <PenTool size={16} />
            <span>Sketcher Whiteboard Canvas</span>
          </button>
          
          <button
            className={`tab-btn clickable ${activeTab === 'docbrain' ? 'active' : ''}`}
            onClick={() => setActiveTab('docbrain')}
          >
            <Database size={16} />
            <span>DocBrain RAG Engine</span>
          </button>
        </div>

        {/* Workspace Display */}
        <div className="playground-canvas-area">
          {activeTab === 'sketcher' ? <SketcherSandbox /> : <DocBrainConsole />}
        </div>
      </section>

      {/* Projects Component */}
      <Projects />

      {/* Technical Skill matrix */}
      <Skills />

      {/* CLI Shell Mode */}
      <section className="terminal-section" id="terminal">
        <div className="section-header">
          <h2 className="section-title">Terminal Console</h2>
          <p className="section-subtitle">Query developer data via a sandboxed CLI command interpreter</p>
        </div>
        <div className="terminal-wrapper">
          <Terminal />
        </div>
      </section>

      {/* Contact Panel */}
      <Contact />

      {/* Global Footer */}
      <footer className="global-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} Sarthak.Systems - Full Stack Systems Architect</p>
          <div className="footer-meta-stats">
            <div className="footer-badge">
              <Cpu size={12} />
              <span>Host Node: Local</span>
            </div>
            <div className="footer-badge">
              <Command size={12} />
              <span>Latency: 0ms (Simulated)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
