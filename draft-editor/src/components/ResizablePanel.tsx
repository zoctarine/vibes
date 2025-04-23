import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  side?: 'left' | 'right';
  onWidthChange?: (width: number) => void;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  defaultWidth = 350,
  minWidth = 250,
  maxWidth = 800,
  side = 'left',
  onWidthChange,
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lastWidth, setLastWidth] = useState(defaultWidth);
  const resizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      let newWidth;
      if (side === 'left') {
        newWidth = e.clientX;
      } else {
        newWidth = window.innerWidth - e.clientX;
      }

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
        onWidthChange?.(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth, side, onWidthChange]);

  const toggleCollapse = () => {
    if (isCollapsed) {
      setWidth(lastWidth);
    } else {
      setLastWidth(width);
      setWidth(40);
    }
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className="relative flex"
      style={{ width: `${width}px`, minWidth: `${width}px` }}
    >
      <div className="flex-1 overflow-hidden bg-background border-border" style={{
        borderRight: side === 'left' ? '1px solid' : 'none',
        borderLeft: side === 'right' ? '1px solid' : 'none',
      }}>
        {width > 40 && children}
      </div>

      <div
        ref={resizeRef}
        className={`absolute ${side === 'left' ? 'right-0' : 'left-0'} top-0 bottom-0 w-1 cursor-col-resize bg-border hover:bg-primary/50 transition-colors`}
        onMouseDown={() => setIsResizing(true)}
        onDoubleClick={toggleCollapse}
        title="Double-click to toggle panel"
      >
      </div>
    </div>
  );
};