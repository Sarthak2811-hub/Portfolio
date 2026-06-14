import React from 'react';
import { GitBranch, ShieldAlert, Cpu, Zap, Radio, Maximize, Layers, Layers2 } from 'lucide-react';

export const Projects: React.FC = () => {
  return (
    <section className="projects-section" id="projects">
      <div className="section-header">
        <h2 className="section-title">Production Architectures</h2>
        <p className="section-subtitle">Deep dive into key engineering implementations and details</p>
      </div>

      <div className="projects-grid">
        {/* Project 1: DocBrain */}
        <div className="project-card-full">
          <div className="project-header-row">
            <div className="project-identity">
              <Layers2 className="project-main-icon text-teal" size={32} />
              <div>
                <h3 className="project-name">DocBrain</h3>
                <span className="project-tagline">Production-Grade Document RAG System</span>
              </div>
            </div>
            <div className="project-tech-pills">
              <span>FastAPI</span>
              <span>ChromaDB</span>
              <span>Gemini API</span>
              <span>Docker</span>
              <span>SQLite</span>
            </div>
          </div>

          <div className="project-content-split">
            <div className="project-text-details">
              <p className="project-desc">
                DocBrain is a high-performance RAG system allowing users to securely index documents (PDF, DOCX, TXT) 
                and engage in low-latency streams of conversation. It is optimized for resilience and cost control.
              </p>

              <h4 className="details-heading">Core Engineering Implementations:</h4>
              <ul className="details-list">
                <li>
                  <ShieldAlert size={16} className="bullet-icon text-teal" />
                  <div>
                    <strong>Resilient XML Fallback Parser:</strong> Decompresses and extracts raw text directly 
                    from <code>word/document.xml</code> in case standard libraries crash due to media CRC checksum anomalies.
                  </div>
                </li>
                <li>
                  <Cpu size={16} className="bullet-icon text-teal" />
                  <div>
                    <strong>Sliding-Window Chunking:</strong> Extracts chunks of 500 characters with 50 character overlap, 
                    creating vector weights that preserve narrative continuity on paragraph edges.
                  </div>
                </li>
                <li>
                  <Zap size={16} className="bullet-icon text-teal" />
                  <div>
                    <strong>Semantic Caching (TTL: 5m):</strong> Caches answers and citations in-memory to prevent redundant 
                    LLM evaluations, reducing Gemini token costs.
                  </div>
                </li>
                <li>
                  <GitBranch size={16} className="bullet-icon text-teal" />
                  <div>
                    <strong>Exponential Backoff Retries:</strong> Wraps calls in backoff retries with random jitter to 
                    handle 429 warnings and transient network errors gracefully.
                  </div>
                </li>
              </ul>
            </div>

            {/* Architecture SVG Visualization */}
            <div className="project-visual-card">
              <h5 className="visual-title">RAG Data Pipeline Flow</h5>
              <div className="svg-wrapper">
                <svg viewBox="0 0 400 240" className="arch-svg">
                  {/* Nodes */}
                  <rect x="20" y="20" width="80" height="30" rx="4" className="svg-box source-box" />
                  <text x="60" y="38" className="svg-text">Document</text>

                  <rect x="150" y="20" width="100" height="30" rx="4" className="svg-box process-box" />
                  <text x="200" y="38" className="svg-text font-bold">Fallback XML Parser</text>

                  <rect x="290" y="20" width="90" height="30" rx="4" className="svg-box chunk-box" />
                  <text x="335" y="38" className="svg-text">Text Chunks</text>

                  <rect x="290" y="100" width="90" height="30" rx="4" className="svg-box embed-box" />
                  <text x="335" y="118" className="svg-text">Vector Store</text>

                  <rect x="150" y="100" width="100" height="30" rx="4" className="svg-box gemini-box" />
                  <text x="200" y="118" className="svg-text">Gemini Engine</text>

                  <rect x="20" y="100" width="80" height="30" rx="4" className="svg-box cache-box" />
                  <text x="60" y="118" className="svg-text">Semantic Cache</text>

                  <rect x="150" y="180" width="100" height="30" rx="4" className="svg-box client-box" />
                  <text x="200" y="198" className="svg-text">SSE Client Stream</text>

                  {/* Connective Arrows */}
                  <path d="M 100 35 L 150 35" className="svg-arrow" markerEnd="url(#arrow)" />
                  <path d="M 250 35 L 290 35" className="svg-arrow" markerEnd="url(#arrow)" />
                  <path d="M 335 50 L 335 100" className="svg-arrow" markerEnd="url(#arrow)" />
                  <path d="M 290 115 L 250 115" className="svg-arrow" markerEnd="url(#arrow)" />
                  
                  {/* Bidirectional between Cache and Gemini */}
                  <path d="M 100 110 L 150 110" className="svg-arrow" markerEnd="url(#arrow)" />
                  <path d="M 150 120 L 100 120" className="svg-arrow" markerEnd="url(#arrow)" />
                  
                  <path d="M 200 130 L 200 180" className="svg-arrow animate-dash" markerEnd="url(#arrow)" />
                  <path d="M 60 100 L 60 65 L 170 65 Q 200 65 200 100" className="svg-arrow dashed-arrow" />
                  <text x="110" y="60" className="svg-tiny-text">Backoff Retry With Jitter</text>

                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Project 2: Sketcher */}
        <div className="project-card-full">
          <div className="project-header-row">
            <div className="project-identity">
              <Radio className="project-main-icon text-violet" size={32} />
              <div>
                <h3 className="project-name">Sketcher</h3>
                <span className="project-tagline">Real-Time Collaborative Infinite Whiteboard</span>
              </div>
            </div>
            <div className="project-tech-pills">
              <span>Next.js</span>
              <span>Node.js</span>
              <span>WebSockets</span>
              <span>Prisma ORM</span>
              <span>Turborepo</span>
            </div>
          </div>

          <div className="project-content-split">
            <div className="project-text-details">
              <p className="project-desc">
                Sketcher is a collaborative canvas monorepo that synchronizes drawings inside sandboxed workspaces.
                It utilizes an infinite panning and zooming coordinates system mapped directly in browser space.
              </p>

              <h4 className="details-heading">Core Engineering Implementations:</h4>
              <ul className="details-list">
                <li>
                  <Radio size={16} className="bullet-icon text-violet" />
                  <div>
                    <strong>WebSocket State Broadcast:</strong> Shares cursor paths, strokes, and shapes instantly 
                    via event broadsheets, keeping client canvases in tight sync.
                  </div>
                </li>
                <li>
                  <Maximize size={16} className="bullet-icon text-violet" />
                  <div>
                    <strong>Vector Matrix Coordinate Pan/Zoom:</strong> Performs math scaling relative to the cursor position, 
                    projecting high-performance dot-grids with zero latency.
                  </div>
                </li>
                <li>
                  <Layers size={16} className="bullet-icon text-violet" />
                  <div>
                    <strong>Turborepo Monorepo & Pnpm:</strong> Isolates dependencies in dry packages (<code>common</code>, 
                    <code>db</code>, <code>ui</code>) to speed up code reuse and bundle optimizations.
                  </div>
                </li>
                <li>
                  <Zap size={16} className="bullet-icon text-violet" />
                  <div>
                    <strong>Client-Side Undo/Redo:</strong> Stores active actions in a history transaction stack to reverse and 
                    apply changes without requiring database roundtrips.
                  </div>
                </li>
              </ul>
            </div>

            {/* Architecture SVG Visualization */}
            <div className="project-visual-card">
              <h5 className="visual-title">WebSocket Broadcast Architecture</h5>
              <div className="svg-wrapper">
                <svg viewBox="0 0 400 240" className="arch-svg">
                  {/* Left: Client 1 */}
                  <rect x="20" y="80" width="90" height="40" rx="4" className="svg-box client-box" />
                  <text x="65" y="100" className="svg-text">Client A</text>
                  <text x="65" y="112" className="svg-tiny-text">Canvas Zoom/Pan</text>

                  {/* Center: Server */}
                  <circle cx="200" cy="100" r="30" className="svg-circle ws-server-box" />
                  <text x="200" y="98" className="svg-text font-bold text-center">WS Server</text>
                  <text x="200" y="112" className="svg-tiny-text text-center">(Node/WS)</text>

                  {/* Right: Client 2 */}
                  <rect x="290" y="80" width="90" height="40" rx="4" className="svg-box client-box" />
                  <text x="335" y="100" className="svg-text">Client B</text>
                  <text x="335" y="112" className="svg-tiny-text">Canvas Zoom/Pan</text>

                  {/* Database */}
                  <rect x="155" y="180" width="90" height="30" rx="4" className="svg-box db-box" />
                  <text x="200" y="198" className="svg-text">Prisma DB (PG)</text>

                  {/* Flow lines */}
                  {/* Client A to Server (draw stroke) */}
                  <path d="M 110 90 L 170 90" className="svg-arrow animate-dash-reverse" markerEnd="url(#arrow)" />
                  <text x="140" y="82" className="svg-tiny-text">draw event</text>

                  {/* Server to Client B (broadcast) */}
                  <path d="M 230 90 L 290 90" className="svg-arrow animate-dash" markerEnd="url(#arrow)" />
                  <text x="260" y="82" className="svg-tiny-text">broadcast</text>

                  {/* Server writes to database (async) */}
                  <path d="M 200 130 L 200 180" className="svg-arrow" markerEnd="url(#arrow)" />
                  <text x="208" y="155" className="svg-tiny-text">Prisma write</text>

                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
