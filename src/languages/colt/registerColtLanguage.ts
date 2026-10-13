import type { Monaco } from '@monaco-editor/react';
import {
  COLT_LANGUAGE_ID,
  coltLanguageDefinition,
  coltThemeRules,
  coltLanguageConfig,
} from './coltMonarch';

let registered = false;

export function registerColtLanguage(monaco: Monaco): void {
  if (registered) return;

  // Register language id
  monaco.languages.register({
    id: COLT_LANGUAGE_ID,
    extensions: ['.colt'],
    aliases: ['Colt', 'colt'],
    mimetypes: ['text/x-colt'],
  });

  // Register Monarch tokenizer
  monaco.languages.setMonarchTokensProvider(COLT_LANGUAGE_ID, coltLanguageDefinition);

  // Register language configuration (comments, brackets)
  monaco.languages.setLanguageConfiguration(COLT_LANGUAGE_ID, coltLanguageConfig);

  // Define ColtIDE Dark Theme
  monaco.editor.defineTheme('coltide-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: coltThemeRules,
    colors: {
      'editor.background': '#121215',
      'editor.foreground': '#ededf0',
      'editor.lineHighlightBackground': '#19191d',
      'editor.selectionBackground': '#1d353a',
      'editorCursor.foreground': '#00d2b4',
      'editorWhitespace.foreground': '#27272a',
      'editorLineNumber.foreground': '#52525b',
      'editorLineNumber.activeForeground': '#00d2b4',
      'editorGutter.background': '#121215',
      'editorIndentGuide.background': '#222226',
      'editorIndentGuide.activeBackground': '#3f3f46',
    },
  });

  registered = true;
}
