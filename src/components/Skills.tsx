import React from 'react';
import { BrainCircuit, Cpu, Paintbrush, Network } from 'lucide-react';

interface Skill {
  name: string;
  level: number;
  description: string;
}

interface SkillCategory {
  title: string;
  icon: React.ReactNode;
  colorClass: string;
  skills: Skill[];
}

export const Skills: React.FC = () => {
  const categories: SkillCategory[] = [
    {
      title: 'AI & Vector Engineering',
      icon: <BrainCircuit className="cat-icon" />,
      colorClass: 'ai-color',
      skills: [
        { name: 'RAG Pipelines', level: 95, description: 'Engineered multi-format document indexing, sliding-window chunking, and contextual similarity queries.' },
        { name: 'ChromaDB', level: 92, description: 'Configured vector collections storing 768-dimensional embeddings of document nodes.' },
        { name: 'Google Gemini API', level: 95, description: 'Integrated text generation models and embedding vectors with backoff retries.' },
        { name: 'Semantic Response Caching', level: 90, description: 'Reduced upstream API costs by caching query embeddings and response streams.' },
      ]
    },
    {
      title: 'Backend Systems',
      icon: <Cpu className="cat-icon" />,
      colorClass: 'backend-color',
      skills: [
        { name: 'FastAPI (Python)', level: 90, description: 'Created modular backends using BackgroundTasks for non-blocking document indexing.' },
        { name: 'Node.js & WebSockets', level: 88, description: 'Built WebSocket broadcast server for real-time multiplayer whiteboard coordination.' },
        { name: 'Prisma & SQLite', level: 85, description: 'Configured SQLite models and relational schema migrations for rooms and user tokens.' },
        { name: 'Rate Limiting Middleware', level: 90, description: 'Implemented custom token-bucket limits inside FastAPI to prevent endpoint abuse.' },
      ]
    },
    {
      title: 'Frontend & UI Dynamics',
      icon: <Paintbrush className="cat-icon" />,
      colorClass: 'frontend-color',
      skills: [
        { name: 'React / Next.js', level: 85, description: 'Developed interactive UI dashboards using React state loops and Next.js App Router.' },
        { name: 'HTML5 Canvas API', level: 90, description: 'Implemented dynamic dot-grid projections, zooming (10%-2000%), and pan math matrices.' },
        { name: 'Vanilla CSS & Animations', level: 88, description: 'Engineered responsive flexbox/grid containers, glassmorphism filters, and CSS variables.' },
        { name: 'TypeScript', level: 88, description: 'Wrote robust typed definitions for shapes, coordinates, vectors, and server events.' },
      ]
    },
    {
      title: 'DevOps & Architectures',
      icon: <Network className="cat-icon" />,
      colorClass: 'devops-color',
      skills: [
        { name: 'Docker & Compose', level: 80, description: 'Packed containers with persistent Docker volumes for metadata databases and vectors.' },
        { name: 'Turborepo Monorepos', level: 85, description: 'Orchestrated multiple backends and React frontends using shared common npm packages.' },
        { name: 'Pnpm Workspaces', level: 85, description: 'Wrote workspace package dependency mappings to dry shared UI and DB configurations.' },
        { name: 'API Resilience Architectures', level: 92, description: 'Engineered exponential retry backoffs with random jitter to gracefully absorb API drops.' },
      ]
    }
  ];

  return (
    <section className="skills-section" id="skills">
      <div className="section-header">
        <h2 className="section-title">Technical Skills Matrix</h2>
        <p className="section-subtitle">A trace of specialized tools and engineering capabilities</p>
      </div>

      <div className="skills-categories-grid">
        {categories.map((cat, idx) => (
          <div key={idx} className={`skills-cat-card ${cat.colorClass}`}>
            <div className="skills-cat-header">
              {cat.icon}
              <h3 className="skills-cat-title">{cat.title}</h3>
            </div>

            <div className="skills-list">
              {cat.skills.map((skill, sIdx) => (
                <div key={sIdx} className="skill-item-row">
                  <div className="skill-meta-label">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-level">{skill.level}%</span>
                  </div>
                  
                  <div className="skill-progress-track">
                    <div className="skill-progress-bar" style={{ width: `${skill.level}%` }} />
                  </div>

                  <div className="skill-details-tooltip">
                    <span className="tooltip-text">{skill.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Skills Footer highlights */}
      <div className="skills-infobox">
        <div className="skills-infobox-glow" />
        <p className="skills-infobox-text">
          🚀 <strong>Engineering Principle:</strong> Rather than accumulating generic languages, my focus is directed on 
          <strong> robustness, concurrency, and real-time execution</strong>. These skills are demonstrated in depth 
          inside the interactive sandboxes above.
        </p>
      </div>
    </section>
  );
};
