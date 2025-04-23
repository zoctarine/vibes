import React from 'react';
import { TreeView } from './TreeView';
import { Editor } from './Editor';
import { ResizablePanel } from './ResizablePanel';

export const ProjectView: React.FC = () => {
  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <div className="flex-1 flex">
        <ResizablePanel>
          <TreeView />
        </ResizablePanel>
        <div className="flex-1 overflow-hidden">
          <Editor />
        </div>
      </div>
    </div>
  );
};