import React, { useCallback, useState, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { useTreeContext } from '../context/TreeContext';
import { ChevronLeft, Maximize2, Minimize2, Eye } from 'lucide-react';
import { StatusBar } from './StatusBar';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { useTheme } from '../context/ThemeContext';
import { EditorView } from '@codemirror/view';
import { ResizablePanel } from './ResizablePanel';

export const Editor: React.FC = () => {
  const { selectedItem, updateItem, selectItem, items, compilePreview } = useTreeContext();
  const { theme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [leftMargin, setLeftMargin] = useState(350);
  const [rightMargin, setRightMargin] = useState(350);

  const isPreviewMode = selectedItem?.type === 'preview';

  useEffect(() => {
    if (isPreviewMode) {
      setPreviewContent(compilePreview());
    }
  }, [isPreviewMode, compilePreview, items]);

  // Create a stable debounced update function that persists between renders
  const debouncedUpdateItem = useCallback(
    debounce((item: TreeItem) => {
      updateItem(item);
    }, 1500), // Increased debounce time to 1.5 seconds for better performance
    [updateItem]
  );

  const handleChange = (value: string) => {
    if (selectedItem && !isPreviewMode) {
      debouncedUpdateItem({ ...selectedItem, content: value });
    }
  };

  if (!selectedItem) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select a chapter or scene to start writing
      </div>
    );
  }

  const editorTheme = EditorView.theme({
    '&': {
      height: '100%',
      backgroundColor: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
    },
    '.cm-scroller': {
      fontFamily: 'inherit',
      lineHeight: '1.6',
    },
    '.cm-content': {
      padding: '1rem',
      caretColor: 'hsl(var(--primary))',
    },
    '.cm-line': {
      padding: '0 0.5rem',
    },
    '&.cm-focused': {
      outline: 'none',
    },
    '.cm-selectionBackground': {
      backgroundColor: 'hsl(var(--muted)) !important',
    },
    '.cm-cursor': {
      borderLeftColor: 'hsl(var(--primary))',
      animation: 'none !important',
    },
    '&.cm-focused .cm-selectionBackground': {
      backgroundColor: 'hsl(var(--muted)) !important',
    },
    '.cm-gutters': {
      backgroundColor: 'hsl(var(--background))',
      color: 'hsl(var(--muted-foreground))',
      border: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent',
    },
  });

  const editorContent = (
    <div className="flex-1 bg-background relative">
      <CodeMirror
        value={isPreviewMode ? previewContent : selectedItem.content}
        onChange={handleChange}
        theme={theme}
        extensions={[
          markdown(),
          editorTheme,
          EditorView.lineWrapping,
        ]}
        className="h-full"
        editable={!isPreviewMode}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          closeBracketsKeymap: true,
          searchKeymap: true,
        }}
      />
    </div>
  );

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} flex flex-col group overflow-hidden`}>
      <div className="p-4 border-b border-border flex items-center justify-between bg-background">
        <div className="flex items-center">
          <button
            onClick={() => selectItem(null)}
            className="mr-4 hover:bg-muted p-2 rounded-md transition-colors"
            title="Back to tree view"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold">{selectedItem.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {isPreviewMode && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-primary bg-primary/10 rounded-md">
              <Eye size={18} />
              <span className="text-sm font-medium">Preview Mode</span>
            </div>
          )}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>
      
      {isFullscreen ? (
        <div className="flex flex-1">
          <ResizablePanel
            defaultWidth={leftMargin}
            minWidth={200}
            maxWidth={600}
            side="left"
            onWidthChange={setLeftMargin}
          >
            <div className="w-full h-full" />
          </ResizablePanel>
          
          {editorContent}
          
          <ResizablePanel
            defaultWidth={rightMargin}
            minWidth={200}
            maxWidth={600}
            side="right"
            onWidthChange={setRightMargin}
          >
            <div className="w-full h-full" />
          </ResizablePanel>
        </div>
      ) : (
        <>
          {editorContent}
          <div className="h-6" /> {/* Spacer for status bar */}
          {!isFullscreen && <StatusBar content={isPreviewMode ? previewContent : selectedItem.content} />}
        </>
      )}
    </div>
  );
};