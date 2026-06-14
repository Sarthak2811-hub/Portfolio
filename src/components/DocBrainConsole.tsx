import React, { useState, useEffect, useRef } from 'react';
import { Database, FileText, Send, Zap, Shield, AlertTriangle, Layers, Activity } from 'lucide-react';

interface MockDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  chunks: string[];
  queries: {
    q: string;
    a: string;
    sources: string[];
  }[];
}

const mockDocs: MockDocument[] = [
  {
    id: 'doc1',
    name: 'sketcher_architecture.md',
    size: '18 KB',
    type: 'markdown',
    chunks: [
      'Sketcher uses a Turborepo monorepo structure. The core application logic resides in apps/sketcher-frontend which is built on Next.js, while apps/ws-backend handles real-time coordination.',
      'Canvas interaction features coordinates translation to support native pan and zoom (10% to 2000%) relative to cursor coordinates. This utilizes HTML5 Canvas 2D contexts and linear transformation math.',
      'WebSockets synchronizes edits. To prevent state divergence, each room maintains a lightweight message queue. Action events are dispatched as transactional draw payloads: create, update, delete.'
    ],
    queries: [
      {
        q: 'How does Sketcher coordinate multiplayer sessions?',
        a: 'Sketcher coordinates multiplayer drawing rooms using a custom WebSockets backend. Each client establishes a connection to a specific room ID. Drawing actions (pencil strokes, shapes, updates) are sent as lightweight JSON transactional payloads over WebSockets. The ws-backend receives, validates, and broadcasts these events to all other connected peers in the same room in real-time, maintaining canvas state synchronicity.',
        sources: ['Chunk 3: WebSockets synchronization and transactional draw payloads.', 'Chunk 1: Turborepo setup and ws-backend role.']
      },
      {
        q: 'What is the zoom/pan zoom range and how does it work?',
        a: 'The canvas supports zooming from 10% to 2000% centered relative to the user\'s mouse position. This is achieved by mapping screen coordinate space to canvas cartesian coordinates using matrix transforms. Drawing layers are redrawn on frame cycles relative to the zoom factor and pan offset parameters, utilizing HTML5 Canvas matrix translation and scale contexts natively.',
        sources: ['Chunk 2: Coordinates translation, pan & zoom mapping, Canvas 2D Context.']
      }
    ]
  },
  {
    id: 'doc2',
    name: 'api_resilience_specs.json',
    size: '12 KB',
    type: 'json',
    chunks: [
      'To handle transient network drops and third-party rate limits, all Gemini LLM API calls are wrapped in an exponential backoff retry algorithm with a base delay of 1s and random jitter.',
      'FastAPI middleware incorporates a token-bucket rate limiter. Users are assigned a bucket that refills at 5 tokens/min with a maximum burst capacity of 15, protecting backend resources from DDoS attacks.',
      'DocBrain embeds a custom fallback parser. If python-docx fails because of zip checksum anomalies or corrupted media streams, the engine extracts raw XML from word/document.xml directly.'
    ],
    queries: [
      {
        q: 'How does DocBrain handle API rate limits?',
        a: 'DocBrain implements a two-fold resilience strategy: 1) On the client-facing side, a FastAPI token-bucket rate limiter middleware caps API abuse (5 tokens/min refill, max 15 capacity), returning HTTP 429 when empty. 2) On the upstream AI integration, all Gemini API calls are wrapped in an exponential backoff retry script with random jitter to absorb transient network spikes and 429 warnings seamlessly without failing the user\'s request.',
        sources: ['Chunk 1: Upstream exponential backoff retry with random jitter.', 'Chunk 2: Token-bucket rate limiter in FastAPI middleware.']
      },
      {
        q: 'What is the word parser fallback mechanism?',
        a: 'DocBrain includes a custom XML parsing fallback. When uploading .docx files, if standard library tools (like python-docx) crash due to bad media CRC-32 checksums, the pipeline intercepts the exception, decompresses the zip file, and parses raw text directly from word/document.xml using standard ElementTree. This guarantees text extraction under corrupted stream conditions.',
        sources: ['Chunk 3: Custom zip file decompression and XML parser fallback.']
      }
    ]
  }
];

export const DocBrainConsole: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<MockDocument>(mockDocs[0]);
  const [inputVal, setInputVal] = useState<string>('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'system'; text: string; sources?: string[] }[]>([]);

  
  // Simulation Stepper State
  const [step, setStep] = useState<number>(0); // 0: Idle, 1: Chunking, 2: Querying vector space, 3: Streaming response
  const [streamedAnswer, setStreamedAnswer] = useState<string>('');
  const [rateLimiterActive, setRateLimiterActive] = useState<boolean>(false);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [rateLimitBlock, setRateLimitBlock] = useState<boolean>(false);
  
  // Cache Store
  const [cache, setCache] = useState<Record<string, { answer: string; sources: string[]; timestamp: number }>>({});
  const [cacheNotice, setCacheNotice] = useState<string | null>(null);

  const streamIntervalRef = useRef<number | null>(null);

  const handleSelectQuery = (queryText: string) => {
    if (rateLimitBlock) return;
    setInputVal(queryText);
    triggerRAG(queryText);
  };

  const triggerRAG = (question: string) => {
    if (!question.trim()) return;
    
    // 1. Rate Limiting Check
    if (rateLimiterActive) {
      if (requestCount >= 2) {
        setRateLimitBlock(true);
        setStep(0);
        setTimeout(() => {
          setRateLimitBlock(false);
          setRequestCount(0);
        }, 8000);
        return;
      }
      setRequestCount((prev) => prev + 1);
    }

    setMessages((prev) => [...prev, { sender: 'user', text: question }]);
    setStreamedAnswer('');
    
    // Check Cache
    const cacheKey = `${selectedDoc.id}-${question.toLowerCase().trim()}`;
    const cachedItem = cache[cacheKey];
    const now = Date.now();

    if (cachedItem && (now - cachedItem.timestamp < 300000)) { // 5 min TTL
      // Cache HIT: Stream immediately (Simulate SSE speed cache render)
      setCacheNotice('Semantic Cache HIT - Response served in 0ms');
      setStep(3);
      
      let words = cachedItem.answer.split(' ');
      let currentWordIndex = 0;
      let bufferText = '';

      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      
      streamIntervalRef.current = window.setInterval(() => {
        if (currentWordIndex < words.length) {
          bufferText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex];
          setStreamedAnswer(bufferText);
          currentWordIndex++;
        } else {
          clearInterval(streamIntervalRef.current!);
          setMessages((prev) => [
            ...prev,
            { sender: 'system', text: cachedItem.answer, sources: cachedItem.sources }
          ]);
          setStep(0);
          setTimeout(() => setCacheNotice(null), 3000);
        }
      }, 15); // Super fast stream for cache hits
      return;
    }

    // Cache MISS: Run full RAG pipeline simulation
    setCacheNotice(null);
    const matchedQuery = selectedDoc.queries.find(
      (q) => q.q.toLowerCase().trim() === question.toLowerCase().trim()
    );
    
    const answerToStream = matchedQuery 
      ? matchedQuery.a 
      : "I have retrieved matching sections from the vector store, but no pre-configured mock answer exists for this specific prompt. The sliding-window chunks were retrieved successfully.";
    
    const sourcesToRender = matchedQuery ? matchedQuery.sources : ['Document base context chunk.'];

    // Phase 1: Chunking & Text Highlighting (1.5 seconds)
    setStep(1);

    setTimeout(() => {
      // Phase 2: Vector DB Cosine Similarity Search (1.5 seconds)
      setStep(2);
    }, 1800);

    setTimeout(() => {
      // Phase 3: SSE Token Streaming Answers (Simulates HTTP Server-Sent Events stream)
      setStep(3);
      
      let words = answerToStream.split(' ');
      let currentWordIndex = 0;
      let bufferText = '';

      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      
      streamIntervalRef.current = window.setInterval(() => {
        if (currentWordIndex < words.length) {
          bufferText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex];
          setStreamedAnswer(bufferText);
          currentWordIndex++;
        } else {
          clearInterval(streamIntervalRef.current!);
          setMessages((prev) => [
            ...prev,
            { sender: 'system', text: answerToStream, sources: sourcesToRender }
          ]);
          
          // Write to Semantic Cache
          setCache((prev) => ({
            ...prev,
            [cacheKey]: {
              answer: answerToStream,
              sources: sourcesToRender,
              timestamp: Date.now()
            }
          }));

          setStep(0);
        }
      }, 60); // standard SSE delay
    }, 3600);
  };

  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  return (
    <div className="docbrain-container">
      {/* Sandbox Header */}
      <div className="sandbox-header">
        <div className="sandbox-title-badge">
          <Database size={14} className="glow-icon-teal" />
          <span>Asynchronous Document RAG & Caching Console</span>
        </div>
        <div className="console-metrics">
          <button 
            className={`metric-toggle-btn ${rateLimiterActive ? 'active' : ''}`}
            onClick={() => setRateLimiterActive(!rateLimiterActive)}
            title="Toggle Token-Bucket Middleware Rate Limiting"
          >
            <Shield size={12} />
            <span>Rate Limiter: {rateLimiterActive ? 'ON' : 'OFF'}</span>
          </button>
          
          <div className="metric-badge">
            <Layers size={12} />
            <span>ChromaDB: Indexed</span>
          </div>
        </div>
      </div>

      <div className="docbrain-console">
        {/* Left: Document Library Sidebar */}
        <div className="docbrain-sidebar">
          <h4 className="sidebar-title">Index Library</h4>
          <div className="document-list">
            {mockDocs.map((doc) => (
              <button
                key={doc.id}
                className={`document-card ${selectedDoc.id === doc.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedDoc(doc);
                  setMessages([]);
                  setStep(0);
                  setStreamedAnswer('');
                }}
              >
                <FileText size={18} className="doc-icon" />
                <div className="doc-meta">
                  <span className="doc-name">{doc.name}</span>
                  <span className="doc-size">{doc.size}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="quick-queries-pane">
            <h5 className="pane-title">Sample Queries</h5>
            <div className="quick-query-list">
              {selectedDoc.queries.map((q, idx) => (
                <button
                  key={idx}
                  className="quick-query-btn clickable"
                  onClick={() => handleSelectQuery(q.q)}
                  disabled={step !== 0 || rateLimitBlock}
                >
                  {q.q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: RAG Visualizer & Chat Window */}
        <div className="docbrain-chat-pane">
          {/* Caching/Rate limit Alerts */}
          {cacheNotice && (
            <div className="console-alert success-alert">
              <Zap size={14} />
              <span>{cacheNotice}</span>
            </div>
          )}

          {rateLimitBlock && (
            <div className="console-alert danger-alert animate-pulse-border">
              <AlertTriangle size={14} />
              <span>HTTP 429: Rate Limit Exceeded. Token bucket empty. Refilling in 8s...</span>
            </div>
          )}

          {/* Messages Log */}
          <div className="chat-messages-log">
            {messages.length === 0 && step === 0 && (
              <div className="empty-chat-state">
                <FileText size={48} className="placeholder-icon" />
                <p>Select a document from the left library and trigger a search.</p>
                <p className="sub-hint">Click a "Sample Query" to witness the vector retrieval sequence.</p>
              </div>
            )}

            {messages.map((m, idx) => (
              <div key={idx} className={`chat-bubble-row ${m.sender === 'user' ? 'user' : 'system'}`}>
                <div className="chat-avatar">{m.sender === 'user' ? 'U' : 'AI'}</div>
                <div className="chat-bubble">
                  <p>{m.text}</p>
                  {m.sources && (
                    <div className="citation-block">
                      <span className="citation-title">Sources:</span>
                      {m.sources.map((src, sIdx) => (
                        <span key={sIdx} className="citation-pill">{src}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Stepper Pipeline Visualizer (When Processing Query) */}
            {step > 0 && (
              <div className="rag-pipeline-visualizer">
                {/* Step 1: Chunking UI */}
                <div className={`pipeline-step ${step === 1 ? 'active' : 'completed'}`}>
                  <div className="step-hdr">
                    <Activity size={14} className="step-icon" />
                    <span>Step 1: Sliding-Window Text Chunking</span>
                    {step === 1 && <span className="running-indicator">chunking...</span>}
                  </div>
                  <div className="chunking-demo-box">
                    <div className="scrolling-chunk-text">
                      {selectedDoc.chunks.map((chk, cIdx) => (
                        <div key={cIdx} className={`chunk-line ${step === 1 && cIdx === 1 ? 'highlighted' : ''}`}>
                          {chk}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 2: Vector Embedding & Similarity Graph */}
                <div className={`pipeline-step ${step === 2 ? 'active' : step > 2 ? 'completed' : 'pending'}`}>
                  <div className="step-hdr">
                    <Database size={14} className="step-icon" />
                    <span>Step 2: Vector Cosine Similarity Search (ChromaDB)</span>
                    {step === 2 && <span className="running-indicator">querying index...</span>}
                  </div>
                  <div className="vector-graph-canvas">
                    <svg viewBox="0 0 400 120" className="vector-svg">
                      {/* Query Vector */}
                      <circle cx="200" cy="60" r="10" className="vector-node query-node" />
                      <text x="200" y="45" className="vector-node-lbl text-center">Query Vector</text>

                      {/* DB Nodes */}
                      <circle cx="80" cy="30" r="6" className="vector-node matched-node" />
                      <line x1="200" y1="60" x2="80" y2="30" className="vector-line matched-line" />
                      <text x="80" y="20" className="vector-node-lbl">Chunk 1 (sim: 0.88)</text>

                      <circle cx="110" cy="95" r="6" className="vector-node matched-node" />
                      <line x1="200" y1="60" x2="110" y2="95" className="vector-line matched-line" />
                      <text x="110" y="110" className="vector-node-lbl">Chunk 3 (sim: 0.85)</text>

                      <circle cx="310" cy="40" r="6" className="vector-node idle-node" />
                      <line x1="200" y1="60" x2="310" y2="40" className="vector-line idle-line" />
                      <text x="310" y="30" className="vector-node-lbl">Chunk 2 (sim: 0.42)</text>
                    </svg>
                  </div>
                </div>

                {/* Step 3: SSE Streaming */}
                <div className={`pipeline-step ${step === 3 ? 'active' : 'pending'}`}>
                  <div className="step-hdr">
                    <Zap size={14} className="step-icon" />
                    <span>Step 3: Server-Sent Events (SSE) Response Stream</span>
                    {step === 3 && <span className="running-indicator">streaming...</span>}
                  </div>
                  <div className="chat-bubble-row system streaming-row">
                    <div className="chat-avatar">AI</div>
                    <div className="chat-bubble live-stream">
                      <p>{streamedAnswer}<span className="stream-cursor">▋</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (step === 0 && inputVal.trim()) {
                triggerRAG(inputVal);
                setInputVal('');
              }
            }}
            className="docbrain-input-bar"
          >
            <input
              type="text"
              className="chat-text-input"
              placeholder="Ask a question about the active document..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={step !== 0 || rateLimitBlock}
            />
            <button
              type="submit"
              className="chat-submit-btn clickable"
              disabled={step !== 0 || rateLimitBlock || !inputVal.trim()}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
      
      {/* Sandbox Footer */}
      <div className="sandbox-footer">
        <span className="sandbox-note">
          💡 <strong>Engineering Highlight:</strong> Simulates a production-grade RAG indexing pipeline. Includes a <strong>FastAPI Token-Bucket Rate Limiter</strong> (simulated by toggle) and **5-minute In-Memory TTL Semantic Caching**. Repeated requests fetch results instantaneously.
        </span>
      </div>
    </div>
  );
};
