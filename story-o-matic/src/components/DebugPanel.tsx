import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { StoryState } from '../types/story';

interface DebugPanelProps {
  storyState: StoryState;
}

export function DebugPanel({ storyState }: DebugPanelProps) {
  if (process.env.NODE_ENV === 'production') return null;

  const [isCollapsed, setIsCollapsed] = useState(true);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatSettings = (settings: any) => {
    if (!settings) return null;
    return {
      genre: settings.genre,
      perspective: settings.perspective === 'first' ? 'First Person' :
                  settings.perspective === 'second' ? 'Second Person' :
                  'Third Person Limited',
      protagonist: settings.protagonistGender.charAt(0).toUpperCase() + 
                  settings.protagonistGender.slice(1),
      styleInspiration: settings.styleInspiration || 'None',
      customOpening: settings.openingSentence ? 'Yes' : 'No'
    };
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-[#252526] text-[#cccccc] shadow-lg opacity-90 hover:opacity-100 transition-all ${isCollapsed ? 'h-10' : 'h-[50vh]'}`}>
      <div className="flex justify-between items-center p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-[#333333] rounded transition-colors"
            aria-label={isCollapsed ? 'Expand debug panel' : 'Collapse debug panel'}
          >
            {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <h3 className="text-sm font-semibold">API Debug Panel</h3>
        </div>
        <span className="text-xs bg-[#333333] px-2 py-1 rounded">
          {storyState.isLoading ? 'Loading...' : 'Ready'}
        </span>
      </div>
      {!isCollapsed && storyState.settings && (
        <div className="p-4 text-xs font-mono bg-[#333333] border-b border-[#3e3e42]">
          <div className="font-semibold mb-2">Story Settings:</div>
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify(formatSettings(storyState.settings), null, 2)}
          </pre>
        </div>
      )}
        <div className="space-y-2 p-4 text-xs font-mono overflow-y-auto max-h-[calc(50vh-8rem)]">
          {storyState.debugLog?.map((log, index) => (
            <div
              key={index}
              className={`p-2 rounded ${
                log.type === 'error'
                  ? 'bg-red-900/50'
                  : log.type === 'request'
                  ? 'bg-blue-900/50'
                  : 'bg-green-900/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-400">{formatTime(log.timestamp)}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  log.type === 'error'
                    ? 'bg-red-800'
                    : log.type === 'request'
                    ? 'bg-blue-800'
                    : 'bg-green-800'
                }`}>
                  {log.type.toUpperCase()}
                </span>
              </div>
              <pre className="whitespace-pre-wrap break-words overflow-x-auto">
                {JSON.stringify(log.data, null, 2)}
              </pre>
            </div>
          ))}
          {(!storyState.debugLog || storyState.debugLog.length === 0) && (
            <div className="text-gray-500 text-center">
              No API interactions yet. Start the story to see the debug log.
            </div>
          )}
        </div>
      </div>
  );
}