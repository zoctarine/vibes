import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      title="Toggle dark mode"
      onClick={onToggle}
      className="p-2 rounded-lg bg-gray-100 dark:bg-[#333333] hover:bg-gray-200 dark:hover:bg-[#404040] transition-colors duration-200"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-story-400" />
      ) : (
        <Moon className="h-5 w-5 text-story-600" />
      )}
    </button>
  );
}