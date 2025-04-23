import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      style={{
        animation: 'fadeOut 0.5s ease-in-out forwards',
        animationDelay: '1.5s'
      }}
    >
      <div className="flex flex-col items-center space-y-4">
        <FileText size={64} className="text-primary animate-pulse" />
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
          Draft Editor
        </h1>
      </div>
    </div>
  );
};