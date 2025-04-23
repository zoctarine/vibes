import React from 'react';
import ReactMarkdown from 'react-markdown';
import { StorySegment } from '../types/story';

interface StoryContainerProps {
  segments: StorySegment[];
  currentSegment: StorySegment | null;
  isLoading: boolean;
}

export function StoryContainer({ segments, currentSegment, isLoading }: StoryContainerProps) {
  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-2">
      <div className="space-y-4">
        {segments.map((segment) => (
          <div
            key={segment.id}
            className={`prose prose-slate dark:prose-invert max-w-none opacity-60`}
          >
            <ReactMarkdown className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {segment.content}
            </ReactMarkdown>
          </div>
        ))}
      </div>

      {currentSegment && (
        <div className="prose prose-slate dark:prose-invert max-w-none ">
          <div className={`opacity-0 animate-[fadeIn_0.5s_ease-in_forwards] delay-300`}>
            <ReactMarkdown className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {currentSegment.content}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 animate-pulse">
          <span className="ml-3 text-gray-600 dark:text-gray-400 animate-bounce">...</span>
        </div>
      )}
    </div>
  );
}