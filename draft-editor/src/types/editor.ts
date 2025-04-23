import { TreeItem } from './tree';

export interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  theme: string;
}

export interface EditorThemeConfig {
  '&': {
    height: string;
    backgroundColor: string;
    color: string;
  };
  '.cm-scroller': {
    fontFamily: string;
    lineHeight: string;
  };
  '.cm-content': {
    padding: string;
    caretColor: string;
  };
  '.cm-line': {
    padding: string;
  };
  '&.cm-focused': {
    outline: string;
  };
  '.cm-selectionBackground': {
    backgroundColor: string;
  };
  '.cm-cursor': {
    borderLeftColor: string;
  };
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: string;
  };
  '.cm-gutters': {
    backgroundColor: string;
    color: string;
    border: string;
  };
  '.cm-activeLineGutter': {
    backgroundColor: string;
  };
}

export interface EditorSetupConfig {
  lineNumbers: boolean;
  foldGutter: boolean;
  dropCursor: boolean;
  allowMultipleSelections: boolean;
  indentOnInput: boolean;
  bracketMatching: boolean;
  closeBrackets: boolean;
  autocompletion: boolean;
  rectangularSelection: boolean;
  crosshairCursor: boolean;
  highlightActiveLine: boolean;
  highlightActiveLineGutter: boolean;
  closeBracketsKeymap: boolean;
  searchKeymap: boolean;
}