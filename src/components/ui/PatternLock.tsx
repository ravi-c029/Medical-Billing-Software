import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PatternLockProps {
  onComplete: (pattern: number[]) => void;
  isError?: boolean;
  onReset?: () => void;
  size?: number;
}

export const PatternLock: React.FC<PatternLockProps> = ({ 
  onComplete, 
  isError = false, 
  onReset,
  size = 320 
}) => {
  const [nodes, setNodes] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const NODE_COUNT = 9;
  const GRID_SIZE = 3;
  const padding = size * 0.15;
  const slotSize = (size - padding * 2) / (GRID_SIZE - 1);

  // Calculate coordinates for a node index
  const getNodeCoords = useCallback((index: number) => {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    return {
      x: padding + col * slotSize,
      y: padding + row * slotSize
    };
  }, [padding, slotSize]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent, index: number) => {
    e.preventDefault();
    setIsDrawing(true);
    setNodes([index]);
    updateMousePos(e);
  };

  const updateMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setMousePos({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    updateMousePos(e);

    // Check if we hit a new node
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    for (let i = 0; i < NODE_COUNT; i++) {
      const coords = getNodeCoords(i);
      const dist = Math.sqrt(Math.pow(x - coords.x, 2) + Math.pow(y - coords.y, 2));
      
      // If we are close enough to a node and it's not already in the pattern
      if (dist < 30 && !nodes.includes(i)) {
        setNodes(prev => [...prev, i]);
        break;
      }
    }
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (nodes.length > 0) {
      onComplete(nodes);
    }
  };

  useEffect(() => {
    if (isError) {
      const timer = setTimeout(() => {
        setNodes([]);
        if (onReset) onReset();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isError, onReset]);

  // SVG Line Generation
  const renderLines = () => {
    if (nodes.length === 0) return null;
    
    const points: string[] = [];
    nodes.forEach((nodeIdx, _) => {
      const coords = getNodeCoords(nodeIdx);
      points.push(`${coords.x},${coords.y}`);
    });

    if (isDrawing) {
      points.push(`${mousePos.x},${mousePos.y}`);
    }

    return (
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={isError ? '#ef4444' : '#3b82f6'}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-colors duration-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
      />
    );
  };

  return (
    <div 
      ref={containerRef}
      className="relative select-none touch-none bg-background shadow-neu-up rounded-[40px] p-4 flex items-center justify-center overflow-hidden group"
      style={{ width: size, height: size }}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      {/* SVG Container for paths */}
      <svg className="absolute inset-0 pointer-events-none" width={size} height={size}>
        <AnimatePresence>
          {renderLines()}
        </AnimatePresence>
      </svg>

      {/* Grid of Nodes */}
      <div className="grid grid-cols-3 gap-12 relative z-10">
        {Array.from({ length: NODE_COUNT }).map((_, idx) => {
          const isActive = nodes.includes(idx);
          return (
            <div
              key={idx}
              className="relative flex items-center justify-center"
              onMouseDown={(e) => handleStart(e, idx)}
              onTouchStart={(e) => handleStart(e, idx)}
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor: isError && isActive ? '#fee2e2' : isActive ? '#dbeafe' : '#f8fafc',
                }}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer
                  ${isActive ? 'shadow-neu-down border-2 border-primary/30' : 'shadow-neu-up border border-white/20'}
                  ${isError && isActive ? 'border-danger/50 shadow-danger/20' : ''}
                `}
              >
                <motion.div 
                  animate={{ 
                    scale: isActive ? 1 : 0,
                    opacity: isActive ? 1 : 0,
                    backgroundColor: isError ? '#ef4444' : '#3b82f6'
                  }}
                  className="w-4 h-4 rounded-full shadow-[0_0_10px_currentColor]" 
                />
              </motion.div>
              
              {/* Ripple Effect on Selection */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 rounded-full pointer-events-none ${isError ? 'bg-danger/20' : 'bg-primary/20'}`}
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
