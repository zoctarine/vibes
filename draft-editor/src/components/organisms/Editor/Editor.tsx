import React, { useCallback, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useTreeContext } from '../../../context/TreeContext';
import { useTheme } from '../../../context/ThemeContext';
import { NavigationHeader } from '../../molecules/NavigationHeader/NavigationHeader';
import { CodeEditor } from '../../molecules/CodeEditor/CodeEditor';
import { Button } from '../../atoms/Button/Button';

export const Editor: React.FC = () => {
  const { selectedItem, updateItem, selectItem } = useTreeContext();
  const { theme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleChange = useCallback((value: string) => {
    if (selectedItem) {
      updateItem({ ...selectedItem, content: value });
    }
  }, [selectedItem, updateItem]);

  if (!selectedItem) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select a chapter or scene to start writing
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} flex flex-col group`}>
      <NavigationHeader
        title={selectedItem.title}
        onBack={() => selectItem(null)}
      />
      <div className="flex-1 bg-background overflow-hidden relative">
        <CodeEditor
          content={selectedItem.content}
          onChange={handleChange}
          theme={theme}
        />
        <Button
          onClick={() => setIsFullscreen(!isFullscreen)}
          icon={isFullscreen ? Minimize2 : Maximize2}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className="absolute bottom-4 right-4 bg-background border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
        />
      </div>
    </div>
  );
};