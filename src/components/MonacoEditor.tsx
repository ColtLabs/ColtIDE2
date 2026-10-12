import React, { useRef, useEffect } from 'react';
import Editor, { type Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useToolchainStore } from '../store/toolchainStore';
import { usePanelStore } from '../store/panelStore';
import { registerColtLanguage } from '../languages/colt/registerColtLanguage';
import { COLT_LANGUAGE_ID } from '../languages/colt/coltMonarch';
import { toMonacoMarkers } from '../toolchain/diagnosticMapper';

export const MonacoEditor: React.FC = () => {
  const { activeTab, fileContents, updateFileContent, markFileSaved } = useWorkspaceStore();
  const { diagnostics, runCheck, runFormat } = useToolchainStore();
  const { jumpToPosition, setJumpToPosition, setCursorPosition } = usePanelStore();

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentContent = activeTab ? fileContents[activeTab] || '' : '';

  // Handle Monaco Initialization
  const handleEditorDidMount = (editorInstance: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editorInstance;
    monacoRef.current = monaco;

    registerColtLanguage(monaco);

    // Track Cursor Position
    editorInstance.onDidChangeCursorPosition((e) => {
      setCursorPosition(e.position.lineNumber, e.position.column);
    });

    // Keyboard Shortcuts
    // Ctrl+S / Cmd+S: Save & Run Check
    editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
      if (activeTab) {
        markFileSaved(activeTab);
        const code = editorInstance.getValue();
        await runCheck(code, true);
      }
    });

    // Shift+Alt+F: Format Document
    editorInstance.addCommand(
      monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
      async () => {
        if (activeTab) {
          const code = editorInstance.getValue();
          const formatted = await runFormat(code, true);
          if (formatted) {
            updateFileContent(activeTab, formatted);
            markFileSaved(activeTab);
          }
        }
      }
    );
  };

  // Sync Diagnostics to Editor Markers (Red squigglies & warnings)
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const markers = toMonacoMarkers(diagnostics);
    monacoRef.current.editor.setModelMarkers(model, 'colt', markers);
  }, [diagnostics]);

  // Handle Jump to Position from Problems Panel
  useEffect(() => {
    if (!jumpToPosition || !editorRef.current) return;

    editorRef.current.revealPositionInCenter({
      lineNumber: jumpToPosition.line,
      column: jumpToPosition.column,
    });
    editorRef.current.setPosition({
      lineNumber: jumpToPosition.line,
      column: jumpToPosition.column,
    });
    editorRef.current.focus();

    // Reset jump target
    setJumpToPosition(null);
  }, [jumpToPosition, setJumpToPosition]);

  // Handle Content Change with Debounced Check
  const handleEditorChange = (value: string | undefined) => {
    if (!activeTab || value === undefined) return;
    updateFileContent(activeTab, value);

    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    checkTimeoutRef.current = setTimeout(() => {
      runCheck(value, true);
    }, 700);
  };

  if (!activeTab) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0e1117] text-[#8b949e] select-none">
        <div className="text-sm font-medium mb-1">No File Open</div>
        <div className="text-xs text-[#484f58]">Select a .colt file from the workspace explorer</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#0e1117] overflow-hidden">
      <Editor
        height="100%"
        language={activeTab.endsWith('.colt') ? COLT_LANGUAGE_ID : 'plaintext'}
        theme="coltstudio-dark"
        value={currentContent}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true, side: 'right' },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 8, bottom: 8 },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
        }}
      />
    </div>
  );
};
