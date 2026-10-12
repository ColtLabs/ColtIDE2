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

  // Define ColtStudio Dark Theme
  monaco.editor.defineTheme('coltstudio-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: coltThemeRules,
    colors: {
      'editor.background': '#0e1117',
      'editor.foreground': '#e6edf3',
      'editor.lineHighlightBackground': '#161b22',
      'editor.selectionBackground': '#264f78',
      'editorCursor.foreground': '#00d2b4',
      'editorWhitespace.foreground': '#30363d',
      'editorLineNumber.foreground': '#484f58',
      'editorLineNumber.activeForeground': '#00d2b4',
      'editorGutter.background': '#0e1117',
      'editorIndentGuide.background': '#21262d',
      'editorIndentGuide.activeBackground': '#30363d',
    },
  });

  registered = true;
}
