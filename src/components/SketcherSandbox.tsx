import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Square, Circle as CircleIcon, Move, ZoomIn, ZoomOut, RotateCcw, User, Eye, Trash2, ArrowUpRight } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Shape {
  id: string;
  type: 'pencil' | 'rectangle' | 'circle' | 'arrow' | 'text';
  color: string;
  strokeWidth: number;
  points?: Point[]; // for pencil
  x?: number;       // for rect, circle, text
  y?: number;
  width?: number;   // for rect
  height?: number;  // for rect
  radius?: number;  // for circle
  x2?: number;      // for arrow
  y2?: number;      // for arrow
  text?: string;    // for text
  creator: 'user' | 'jane';
}

export const SketcherSandbox: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [tool, setTool] = useState<'pencil' | 'rectangle' | 'circle' | 'arrow' | 'pan'>('pencil');
  const [color, setColor] = useState('#8b5cf6'); // Neon Violet
  const [strokeWidth, setStrokeWidth] = useState(3);
  
  const [shapes, setShapes] = useState<Shape[]>([
    // Prefill with a nice default diagram showing whiteboard collaboration
    { id: '1', type: 'rectangle', color: '#14b8a6', strokeWidth: 2, x: 50, y: 50, width: 140, height: 60, creator: 'jane' },
    { id: '2', type: 'text', color: '#f8fafc', strokeWidth: 1, x: 65, y: 85, text: 'Client (Next.js)', creator: 'jane' },
    { id: '3', type: 'arrow', color: '#8b5cf6', strokeWidth: 3, x: 190, y: 80, x2: 310, y2: 80, creator: 'jane' },
    { id: '4', type: 'rectangle', color: '#8b5cf6', strokeWidth: 2, x: 310, y: 50, width: 140, height: 60, creator: 'jane' },
    { id: '5', type: 'text', color: '#f8fafc', strokeWidth: 1, x: 320, y: 85, text: 'WS-Backend (Node)', creator: 'jane' },
  ]);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 50, y: 80 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  
  // Drawing states
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [startPos, setStartPos] = useState<Point>({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState<Point>({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });

  // Multiplayer Peer Simulation
  const [peerState, setPeerState] = useState<{
    active: boolean;
    name: string;
    x: number;
    y: number;
    action: string;
  }>({ active: false, name: 'Jane (Peer)', x: 0, y: 0, action: '' });

  // Map Screen -> Canvas coordinates
  const getCanvasCoords = (clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  };

  // Redraw canvas
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset dimensions to match container
    if (containerRef.current) {
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Dot Grid
    const gridSize = 25;
    const gridColor = '#1e1b29';
    ctx.fillStyle = gridColor;

    // Map canvas bounds back to grid loops
    const startX = Math.floor(-pan.x / (gridSize * zoom)) * gridSize;
    const endX = startX + Math.ceil(canvas.width / (gridSize * zoom)) * gridSize + gridSize;
    const startY = Math.floor(-pan.y / (gridSize * zoom)) * gridSize;
    const endY = startY + Math.ceil(canvas.height / (gridSize * zoom)) * gridSize + gridSize;

    for (let x = startX; x < endX; x += gridSize) {
      for (let y = startY; y < endY; y += gridSize) {
        const screenX = x * zoom + pan.x;
        const screenY = y * zoom + pan.y;
        ctx.beginPath();
        ctx.arc(screenX, screenY, 1.2 * Math.max(zoom, 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Set Canvas Transform matrix for Zoom & Pan
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // 3. Draw existing shapes
    shapes.forEach((shape) => {
      ctx.strokeStyle = shape.color;
      ctx.fillStyle = shape.color;
      ctx.lineWidth = shape.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (shape.type === 'pencil' && shape.points && shape.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        ctx.stroke();
      } 
      else if (shape.type === 'rectangle' && shape.x !== undefined && shape.y !== undefined && shape.width !== undefined && shape.height !== undefined) {
        ctx.beginPath();
        ctx.rect(shape.x, shape.y, shape.width, shape.height);
        ctx.stroke();
      } 
      else if (shape.type === 'circle' && shape.x !== undefined && shape.y !== undefined && shape.radius !== undefined) {
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
        ctx.stroke();
      } 
      else if (shape.type === 'arrow' && shape.x !== undefined && shape.y !== undefined && shape.x2 !== undefined && shape.y2 !== undefined) {
        // Draw main shaft
        ctx.beginPath();
        ctx.moveTo(shape.x, shape.y);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();

        // Draw arrow head
        const angle = Math.atan2(shape.y2 - shape.y, shape.x2 - shape.x);
        const headLength = 12;
        ctx.beginPath();
        ctx.moveTo(shape.x2, shape.y2);
        ctx.lineTo(
          shape.x2 - headLength * Math.cos(angle - Math.PI / 6),
          shape.y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          shape.x2 - headLength * Math.cos(angle + Math.PI / 6),
          shape.y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
      else if (shape.type === 'text' && shape.x !== undefined && shape.y !== undefined && shape.text) {
        ctx.font = '14px Consolas, monospace';
        ctx.fillText(shape.text, shape.x, shape.y);
      }
    });

    // 4. Draw current drawing shape preview
    if (isDrawing) {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (tool === 'pencil' && currentPoints.length > 0) {
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        currentPoints.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      } 
      else if (tool === 'rectangle') {
        const w = currentPos.x - startPos.x;
        const h = currentPos.y - startPos.y;
        ctx.beginPath();
        ctx.rect(startPos.x, startPos.y, w, h);
        ctx.stroke();
      } 
      else if (tool === 'circle') {
        const r = Math.sqrt(Math.pow(currentPos.x - startPos.x, 2) + Math.pow(currentPos.y - startPos.y, 2));
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, r, 0, Math.PI * 2);
        ctx.stroke();
      } 
      else if (tool === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();

        const angle = Math.atan2(currentPos.y - startPos.y, currentPos.x - startPos.x);
        const headLength = 12;
        ctx.beginPath();
        ctx.moveTo(currentPos.x, currentPos.y);
        ctx.lineTo(
          currentPos.x - headLength * Math.cos(angle - Math.PI / 6),
          currentPos.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          currentPos.x - headLength * Math.cos(angle + Math.PI / 6),
          currentPos.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();
  };

  useEffect(() => {
    drawCanvas();
  }, [shapes, zoom, pan, isDrawing, currentPoints, currentPos]);

  // Handle resizing
  useEffect(() => {
    const handleResize = () => {
      drawCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [shapes, zoom, pan]);

  // Drawing event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'pan') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const coords = getCanvasCoords(e.clientX, e.clientY);
    setIsDrawing(true);
    setStartPos(coords);
    setCurrentPos(coords);
    if (tool === 'pencil') {
      setCurrentPoints([coords]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (!isDrawing) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setCurrentPos(coords);
    if (tool === 'pencil') {
      setCurrentPoints((prev) => [...prev, coords]);
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    const newShapeId = Date.now().toString();
    let newShape: Shape | null = null;

    if (tool === 'pencil' && currentPoints.length > 1) {
      newShape = {
        id: newShapeId,
        type: 'pencil',
        color,
        strokeWidth,
        points: currentPoints,
        creator: 'user',
      };
    } 
    else if (tool === 'rectangle') {
      const w = currentPos.x - startPos.x;
      const h = currentPos.y - startPos.y;
      if (Math.abs(w) > 5 && Math.abs(h) > 5) {
        newShape = {
          id: newShapeId,
          type: 'rectangle',
          color,
          strokeWidth,
          x: Math.min(startPos.x, currentPos.x),
          y: Math.min(startPos.y, currentPos.y),
          width: Math.abs(w),
          height: Math.abs(h),
          creator: 'user',
        };
      }
    } 
    else if (tool === 'circle') {
      const r = Math.sqrt(Math.pow(currentPos.x - startPos.x, 2) + Math.pow(currentPos.y - startPos.y, 2));
      if (r > 5) {
        newShape = {
          id: newShapeId,
          type: 'circle',
          color,
          strokeWidth,
          x: startPos.x,
          y: startPos.y,
          radius: r,
          creator: 'user',
        };
      }
    } 
    else if (tool === 'arrow') {
      const dist = Math.sqrt(Math.pow(currentPos.x - startPos.x, 2) + Math.pow(currentPos.y - startPos.y, 2));
      if (dist > 5) {
        newShape = {
          id: newShapeId,
          type: 'arrow',
          color,
          strokeWidth,
          x: startPos.x,
          y: startPos.y,
          x2: currentPos.x,
          y2: currentPos.y,
          creator: 'user',
        };
      }
    }

    if (newShape) {
      setShapes((prev) => [...prev, newShape!]);
      triggerPeerReaction(newShape);
    }

    setCurrentPoints([]);
  };

  // Simulate multiplayer peer action after a user draws a shape
  const triggerPeerReaction = (userShape: Shape) => {
    // Determine a spot near user's shape
    let targetX = 200;
    let targetY = 200;

    if (userShape.x !== undefined && userShape.y !== undefined) {
      targetX = userShape.x + (userShape.width || userShape.radius || 100) + 120;
      targetY = userShape.y + 30;
    } else if (userShape.points && userShape.points.length > 0) {
      targetX = userShape.points[userShape.points.length - 1].x + 120;
      targetY = userShape.points[userShape.points.length - 1].y + 30;
    }

    // Cap boundaries to keep it on screen
    targetX = Math.max(50, Math.min(targetX, 600));
    targetY = Math.max(50, Math.min(targetY, 400));

    // Peer begins drawing routine
    setTimeout(() => {
      setPeerState({
        active: true,
        name: 'Jane (AI-Collaborator)',
        x: targetX - 150,
        y: targetY - 150,
        action: 'Jane is connecting to your canvas...',
      });
    }, 1200);

    // Animate Jane's mouse moving to the draw point
    setTimeout(() => {
      setPeerState((prev) => ({
        ...prev,
        x: targetX - 50,
        y: targetY + 20,
        action: 'Jane is drawing a comment...',
      }));
    }, 2200);

    // Actually add Jane's drawing action and finish
    setTimeout(() => {
      const janeTextShape: Shape = {
        id: `jane-txt-${Date.now()}`,
        type: 'text',
        color: '#14b8a6', // Electric Teal
        strokeWidth: 1,
        x: targetX - 30,
        y: targetY + 15,
        text: 'Sync Active!',
        creator: 'jane',
      };
      
      const janeArrowShape: Shape = {
        id: `jane-arrow-${Date.now()}`,
        type: 'arrow',
        color: '#14b8a6',
        strokeWidth: 2,
        x: targetX - 40,
        y: targetY + 10,
        x2: targetX - 100,
        y2: targetY + 10,
        creator: 'jane',
      };

      setShapes((prev) => [...prev, janeArrowShape, janeTextShape]);
      setPeerState((prev) => ({
        ...prev,
        x: targetX - 30,
        y: targetY + 15,
        action: 'Sync Success!',
      }));
    }, 3200);

    // Hide Jane's cursor
    setTimeout(() => {
      setPeerState((prev) => ({ ...prev, active: false }));
    }, 5000);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom((prev) => {
      const factor = direction === 'in' ? 1.2 : 0.8;
      const nextZoom = prev * factor;
      return Math.min(Math.max(nextZoom, 0.2), 5); // cap zoom 20% to 500%
    });
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 50, y: 80 });
  };

  const clearCanvas = () => {
    setShapes([]);
  };

  const undoLast = () => {
    setShapes((prev) => prev.slice(0, -1));
  };

  return (
    <div className="sketcher-container">
      {/* Sandbox Header Banner */}
      <div className="sandbox-header">
        <div className="sandbox-title-badge">
          <Move size={14} className="glow-icon" />
          <span>Real-Time WebSocket Whiteboard Simulator</span>
        </div>
        <div className="multiplayer-status">
          <div className="user-avatar user-me">Me</div>
          <div className={`user-avatar user-peer ${peerState.active ? 'active' : ''}`}>Jane</div>
          <span className="multiplayer-label">
            {peerState.active ? 'Jane is editing...' : 'Waiting for draw trigger'}
          </span>
        </div>
      </div>

      <div className="sketcher-workspace" ref={containerRef}>
        {/* Toolbox overlay */}
        <div className="canvas-toolbox">
          <button
            className={`tool-btn ${tool === 'pencil' ? 'active' : ''}`}
            onClick={() => setTool('pencil')}
            title="Pencil (Freehand Drawing)"
          >
            <Pencil size={18} />
          </button>
          <button
            className={`tool-btn ${tool === 'rectangle' ? 'active' : ''}`}
            onClick={() => setTool('rectangle')}
            title="Rectangle Tool"
          >
            <Square size={18} />
          </button>
          <button
            className={`tool-btn ${tool === 'circle' ? 'active' : ''}`}
            onClick={() => setTool('circle')}
            title="Circle Tool"
          >
            <CircleIcon size={18} />
          </button>
          <button
            className={`tool-btn ${tool === 'arrow' ? 'active' : ''}`}
            onClick={() => setTool('arrow')}
            title="Arrow Connection"
          >
            <ArrowUpRight size={18} />
          </button>
          <button
            className={`tool-btn ${tool === 'pan' ? 'active' : ''}`}
            onClick={() => setTool('pan')}
            title="Pan Hand Tool (Spacebar + Click)"
          >
            <Move size={18} />
          </button>

          <div className="toolbox-divider" />

          {/* Preset Colors */}
          <div className="color-selectors">
            {['#8b5cf6', '#14b8a6', '#f43f5e', '#eab308', '#f8fafc'].map((c) => (
              <button
                key={c}
                className={`color-dot ${color === c ? 'active' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>

          <div className="toolbox-divider" />

          {/* Stroke Slider */}
          <div className="stroke-selector">
            <span className="stroke-label">{strokeWidth}px</span>
            <input
              type="range"
              min="1"
              max="12"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="stroke-slider"
            />
          </div>
        </div>

        {/* Zoom & View Controls Overlay */}
        <div className="canvas-viewport-controls">
          <span className="zoom-percentage">{Math.round(zoom * 100)}%</span>
          <button className="control-btn" onClick={() => handleZoom('in')} title="Zoom In">
            <ZoomIn size={16} />
          </button>
          <button className="control-btn" onClick={() => handleZoom('out')} title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <button className="control-btn" onClick={resetView} title="Reset Scale & Pan">
            <RotateCcw size={16} />
          </button>
          
          <div className="toolbox-divider-h" />

          <button className="control-btn hover-danger" onClick={undoLast} title="Undo last shape">
            <Eye size={16} />
          </button>
          <button className="control-btn hover-danger" onClick={clearCanvas} title="Clear board">
            <Trash2 size={16} />
          </button>
        </div>

        {/* Real-time Collaboration Notification Toast */}
        {peerState.active && (
          <div className="peer-toast animate-pulse-border">
            <User size={14} className="text-teal" />
            <span className="peer-toast-msg">{peerState.action}</span>
          </div>
        )}

        {/* Canvas Element */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`sketcher-canvas ${tool === 'pan' ? 'cursor-pan' : 'cursor-crosshair'}`}
        />

        {/* Simulated Peer Cursor overlay */}
        {peerState.active && (
          <div
            className="virtual-peer-cursor"
            style={{
              position: 'absolute',
              // Translate coordinate space according to current zoom & pan mapping!
              left: peerState.x * zoom + pan.x,
              top: peerState.y * zoom + pan.y,
              transform: 'translate(-5px, -5px)',
              pointerEvents: 'none',
              zIndex: 10,
              transition: 'left 1s cubic-bezier(0.25, 0.8, 0.25, 1), top 1s cubic-bezier(0.25, 0.8, 0.25, 1)',
            }}
          >
            <div className="cursor-indicator-arrow" />
            <div className="peer-cursor-label">Jane (Collaborator)</div>
          </div>
        )}
      </div>

      {/* Feature Walkthrough footnotes */}
      <div className="sandbox-footer">
        <span className="sandbox-note">
          ⚡ <strong>Engineering Highlight:</strong> Uses dynamic dot grid projection and linear transformation matrices to enable <strong>Infinite Pan & Zoom (10% to 500%)</strong>. Draw a shape to trigger simulated multiplayer WebSocket synchronization and watch the collaborator react in real time.
        </span>
      </div>
    </div>
  );
};
