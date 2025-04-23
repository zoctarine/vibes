import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Type, Hash } from 'lucide-react';
import debounce from 'lodash.debounce';

interface StatusBarProps {
  content: string;
}

const calculateStats = (content: string = '') => {
  const words = content.trim().split(/\s+/).filter(word => word.length > 0);
  const characters = content.length;
  // Average reading speed is 200-250 words per minute
  const readingTimeMinutes = Math.ceil(words.length / 200);
  
  return {
    words: words.length,
    characters,
    readingTime: readingTimeMinutes,
  };
};

export const StatusBar: React.FC<StatusBarProps> = ({ content }) => {
  const [stats, setStats] = useState(calculateStats(content));

  const updateStats = useCallback(
    debounce((newContent: string) => {
      setStats(calculateStats(newContent));
    }, 500),
    []
  );

  useEffect(() => {
    updateStats(content);
    return () => {
      updateStats.cancel();
    };
  }, [content, updateStats]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="h-6 px-4 border-t border-border bg-background/80 backdrop-blur-sm text-xs text-muted-foreground flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Type size={14} />
          <span>{stats.words.toLocaleString()} words</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Hash size={14} />
          <span>{stats.characters.toLocaleString()} characters</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          <span>{stats.readingTime} min read</span>
        </div>
      </div>
    </div>
  );
};