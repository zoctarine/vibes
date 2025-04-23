import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { EditorProps, EditorThemeConfig, EditorSetupConfig } from '../../../types/editor';

const editorTheme: EditorThemeConfig = {
  '&': {
    height: '100%',
    backgroundColor: 'hsl(var(--background)) !important',
    color: 'hsl(var(--foreground))',
  },
  '.cm-scroller': {
    fontFamily: 'inherit',
    lineHeight: '1.6',
  },
  '.cm-content': {
    padding: '1rem',
    caretColor: 'hsl(var(--seconday))',
    backgroundColor: 'hsl(var(--background)) !important',
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
};

const editorSetup: EditorSetupConfig = {
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
};

export const CodeEditor: React.FC<EditorProps> = ({
  content,
  onChange,
  theme
}) => {
  return (
    <CodeMirror
      value={content}
      onChange={onChange}
      extensions={[
        markdown(),
        EditorView.theme(editorTheme),
        EditorView.lineWrapping,
      ]}
      className="h-full"
      basicSetup={editorSetup}
    />
  );
};