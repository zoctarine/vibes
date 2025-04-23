import React from 'react';

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
  isLoading: boolean;
}

export function ErrorDisplay({ error, onRetry, isLoading }: ErrorDisplayProps) {
  return (
    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center">
      <div className="flex-1">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-700 dark:text-red-400 font-medium">Error</p>
        </div>
        <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
      </div>
      <button
        onClick={onRetry}
        disabled={isLoading}
        className="ml-4 px-3 py-1 text-sm bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 
                 border border-red-200 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/70
                 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Retry
      </button>
    </div>
  );
}