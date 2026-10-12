import type { languages, editor } from 'monaco-editor';

export const COLT_LANGUAGE_ID = 'colt';

export const coltLanguageDefinition: languages.IMonarchLanguage = {
  defaultToken: '',
  tokenPostfix: '.colt',
  ignoreCase: true,

  keywords: [
    'CONNECT',
    'AS',
    'DEFAULT',
    'CONNECTION',
    'DEFINE',
    'COLLECTION',
    'FIND',
    'PUT',
    'CREATE',
    'DELETE',
    'ATOMIC',
    'SELECT',
    'WHERE',
    'ORDER',
    'BY',
    'LIMIT',
    'OFFSET',
    'SET',
    'VALUES',
    'INTO',
    'FROM',
    'JOIN',
    'ON',
    'GROUP',
    'HAVING',
    'IN',
    'AND',
    'OR',
    'NOT',
    'IS',
    'NULL',
    'TRUE',
    'FALSE',
    'ASC',
    'DESC',
    'INSERT',
    'UPDATE',
    'UPSERT',
    'RETURNING',
    'CASCADE',
    'RESTRICT',
    'ENV',
    'POSTGRES',
    'SQLITE',
    'MONGODB',
    'REDIS',
    'VECTOR',
  ],

  typeKeywords: [
    'text',
    'int',
    'int32',
    'int64',
    'float',
    'float32',
    'float64',
    'bool',
    'uuid',
    'time',
    'duration',
    'doc',
    'vector',
    'link',
    'bytes',
    'array',
  ],

  operators: [
    '=',
    '>',
    '<',
    '!',
    '~',
    '?',
    ':',
    '==',
    '<=',
    '>=',
    '!=',
    '&&',
    '||',
    '++',
    '--',
    '+',
    '-',
    '*',
    '/',
    '&',
    '|',
    '^',
    '%',
    '->',
  ],

  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  tokenizer: {
    root: [
      // Directives
      [/^#colt\s+[\d\.]+/, 'meta.directive'],

      // Annotations (@key, @unique, @index, etc.)
      [/@[a-zA-Z_]\w*/, 'annotation'],

      // Bound query parameters ($user_id, $limit)
      [/\$[a-zA-Z_]\w*/, 'variable.parameter'],

      // Identifiers and keywords
      [
        /[a-zA-Z_]\w*/,
        {
          cases: {
            '@typeKeywords': 'type',
            '@keywords': 'keyword',
            '@default': 'identifier',
          },
        },
      ],

      // Whitespace & Comments
      { include: '@whitespace' },

      // Delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [
        /@symbols/,
        {
          cases: {
            '@operators': 'operator',
            '@default': '',
          },
        },
      ],

      // Durations (e.g. 500ms, 10s, 5m, 2h)
      [/\d+(?:ms|[smhd])\b/, 'number.duration'],

      // Numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],

      // Strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
      [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
      [/'([^'\\]|\\.)*$/, 'string.invalid'],
      [/'/, { token: 'string.quote', bracket: '@open', next: '@stringSingle' }],
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/--.*$/, 'comment'],
      [/\/\*/, 'comment', '@comment'],
    ],

    comment: [
      [/[^\/*]+/, 'comment'],
      [/\/\*/, 'comment.invalid'],
      ["\\*/", 'comment', '@pop'],
      [/[\/*]/, 'comment'],
    ],

    string: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
    ],

    stringSingle: [
      [/[^\\']+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
    ],
  },
};

export const coltThemeRules: editor.ITokenThemeRule[] = [
  { token: 'keyword', foreground: '00d2b4', fontStyle: 'bold' },
  { token: 'meta.directive', foreground: '79c0ff', fontStyle: 'bold' },
  { token: 'annotation', foreground: 'e3b341', fontStyle: 'italic' },
  { token: 'type', foreground: '58a6ff' },
  { token: 'variable.parameter', foreground: 'f0883e' },
  { token: 'identifier', foreground: 'e6edf3' },
  { token: 'string', foreground: '7ee787' },
  { token: 'string.escape', foreground: 'd2a8ff' },
  { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
  { token: 'number', foreground: 'ff7b72' },
  { token: 'number.duration', foreground: 'ffa657' },
  { token: 'operator', foreground: '00d2b4' },
];

export const coltLanguageConfig: languages.LanguageConfiguration = {
  comments: {
    lineComment: '--',
    blockComment: ['/*', '*/'],
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
};
