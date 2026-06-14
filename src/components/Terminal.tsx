import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TermIcon, ChevronRight } from 'lucide-react';

interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'ascii';
}

export const Terminal: React.FC = () => {
  const [history, setHistory] = useState<TerminalLine[]>([
    { text: 'SYSTEM SHELL v1.4.2 READY', type: 'ascii' },
    { text: 'Type "help" to see available developer commands.', type: 'output' },
  ]);
  const [cmdInput, setCmdInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCmd = cmdInput.trim().toLowerCase();
    if (!cleanCmd) return;

    const newHistory = [...history, { text: `sarthak@systems:~$ ${cmdInput}`, type: 'input' as const }];
    setCmdHistory((prev) => [...prev, cmdInput]);
    setHistoryIdx(-1);
    setCmdInput('');

    let output: TerminalLine[] = [];

    switch (cleanCmd) {
      case 'help':
        output = [
          { text: 'Available Commands:', type: 'output' },
          { text: '  about      - Display background bio of Sarthak Tiwari', type: 'output' },
          { text: '  skills     - Print technical expertise matrix & ASCII charts', type: 'output' },
          { text: '  projects   - Show details and architecture specs of key systems', type: 'output' },
          { text: '  system     - Print simulated node environment diagnostic specs', type: 'output' },
          { text: '  contact    - Print email, GitHub and networking connections', type: 'output' },
          { text: '  clear      - Clear the screen buffer', type: 'output' },
        ];
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'about':
        output = [
          { text: 'SARTHAK TIWARI - PROFESSIONAL BIO:', type: 'ascii' },
          { text: '  I am Sarthak Tiwari, a Full-Stack Developer specialized in low-latency systems', type: 'output' },
          { text: '  and robust AI deployments. I focus on developing real-time interactive canvas', type: 'output' },
          { text: '  frameworks (WebSockets, pan/zoom) and document RAG pipelines (FastAPI, caching).', type: 'output' },
          { text: '  Dedicated to writing resilient APIs, custom fallback parsers, and rate limiters.', type: 'output' },
        ];
        break;

      case 'skills':
        output = [
          { text: 'TECHNICAL EXPERTISE SUMMARY:', type: 'ascii' },
          { text: '  AI / RAG [=======================] 95% (ChromaDB, Semantic Cache, Gemini)', type: 'output' },
          { text: '  Backend  [=====================  ] 88% (FastAPI, WebSockets, Node, SQLite)', type: 'output' },
          { text: '  Frontend [====================   ] 82% (Canvas API, React/Next.js, Vanilla CSS)', type: 'output' },
          { text: '  DevOps   [==================     ] 75% (Docker Compose, Turborepo, CI/CD)', type: 'output' },
        ];
        break;

      case 'projects':
        output = [
          { text: 'SIGNATURE SYSTEM ARCHITECTURES:', type: 'ascii' },
          { text: '1. DocBrain: Production-Grade Document RAG System', type: 'output' },
          { text: '   - Asynchronous element parsing & sliding-window chunk extraction.', type: 'output' },
          { text: '   - Caching: 5m TTL Semantic Cache minimizing upstream LLM costs.', type: 'output' },
          { text: '   - Resilience: Exponential backoffs + custom XML structure fallback parser.', type: 'output' },
          { text: '2. Sketcher: Real-Time Collaborative Infinite Canvas Whiteboard', type: 'output' },
          { text: '   - Next.js monorepo powered by Turborepo and pnpm workspaces.', type: 'output' },
          { text: '   - Zoom (10%-2000%) & pan coordinate transformation algorithms.', type: 'output' },
          { text: '   - Live broadcast synchronization via Node WebSockets backend.', type: 'output' },
        ];
        break;

      case 'system':
        output = [
          { text: 'SARTHAK.SYSTEMS ENGINE DIAGNOSTICS:', type: 'ascii' },
          { text: '  - Host Node Name: Sarthak.Systems', type: 'output' },
          { text: '  - Architecture: x86-64 / Node.js Engine (v20.12.0)', type: 'output' },
          { text: '  - Development Bundler: Vite Compiler (v8.0.16)', type: 'output' },
          { text: '  - Target Server Port: 5173', type: 'output' },
          { text: '  - Database Collections: ChromaDB Vector Client Active', type: 'output' },
          { text: '  - Simulated Core Latency: 0.28ms', type: 'output' },
          { text: '  - Status Code: HTTP 200 OK (Sync Stable)', type: 'output' },
        ];
        break;

      case 'contact':
        output = [
          { text: 'COMMUNICATION NETWORKS:', type: 'ascii' },
          { text: '  - Email: sarthaktiwari112003@gmail.com', type: 'output' },
          { text: '  - GitHub: github.com/Sarthak2811-hub', type: 'output' },
          { text: '  - LinkedIn: linkedin.com/in/sarthak-t-60a3551b3', type: 'output' },
          { text: '  - Work Location: Remote / Global', type: 'output' },
        ];
        break;

      default:
        output = [
          { text: `Command not found: "${cleanCmd}". Type "help" for a list of commands.`, type: 'error' },
        ];
        break;
    }

    setHistory([...newHistory, ...output]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setCmdInput(cmdHistory[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      if (historyIdx === cmdHistory.length - 1) {
        setHistoryIdx(-1);
        setCmdInput('');
      } else {
        const nextIdx = historyIdx + 1;
        setHistoryIdx(nextIdx);
        setCmdInput(cmdHistory[nextIdx]);
      }
    }
  };

  return (
    <div className="terminal-container">
      {/* Top Bar */}
      <div className="terminal-header">
        <div className="terminal-badge">
          <TermIcon size={14} className="terminal-accent" />
          <span>Interactive CLI shell</span>
        </div>
        <div className="terminal-dots">
          <span className="dot dot-red"></span>
          <span className="dot dot-yellow"></span>
          <span className="dot dot-green"></span>
        </div>
      </div>

      {/* Console log */}
      <div className="terminal-log" ref={logContainerRef}>
        {history.map((line, idx) => (
          <div key={idx} className={`terminal-line type-${line.type}`}>
            {line.text}
          </div>
        ))}
      </div>

      {/* Input row */}
      <form onSubmit={handleCommand} className="terminal-input-row">
        <ChevronRight size={14} className="input-prompt-char" />
        <input
          type="text"
          className="terminal-command-input"
          value={cmdInput}
          onChange={(e) => setCmdInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Type a command (e.g. "help", "skills")...'
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </form>
    </div>
  );
};
