import type { editor, MarkerSeverity } from 'monaco-editor';
import type { ColtDiagnosticItem, DiagnosticSeverity } from './types';

/**
 * Maps Colt severities to Monaco MarkerSeverity
 */
export function toMonacoSeverity(severity: DiagnosticSeverity): MarkerSeverity {
  switch (severity) {
    case 'error':
      return 8; // MarkerSeverity.Error
    case 'warning':
      return 4; // MarkerSeverity.Warning
    case 'information':
      return 2; // MarkerSeverity.Info
    case 'hint':
      return 1; // MarkerSeverity.Hint
    default:
      return 8;
  }
}

/**
 * Converts a Colt diagnostic item to a Monaco Editor Marker
 */
export function toMonacoMarker(diag: ColtDiagnosticItem): editor.IMarkerData {
  return {
    startLineNumber: diag.span.start.line || diag.line,
    startColumn: diag.span.start.column || diag.column,
    endLineNumber: diag.span.end.line || diag.endLine,
    endColumn: diag.span.end.column || diag.endColumn,
    severity: toMonacoSeverity(diag.severity),
    code: diag.code,
    source: 'colt',
    message: diag.hint ? `${diag.message} (Hint: ${diag.hint})` : diag.message,
  };
}

/**
 * Converts a list of Colt diagnostics to Monaco Editor Markers
 */
export function toMonacoMarkers(diagnostics: ColtDiagnosticItem[]): editor.IMarkerData[] {
  return diagnostics.map(toMonacoMarker);
}

/**
 * Converts a Colt diagnostic to a standard LSP Diagnostic (0-indexed)
 * As defined in Section 5 of ColtIDE Toolchain Specification
 */
export interface LspDiagnostic {
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
  severity: number;
  code: string;
  source: string;
  message: string;
}

export function toLspDiagnostic(diag: ColtDiagnosticItem): LspDiagnostic {
  return {
    range: {
      start: {
        line: Math.max(0, (diag.span.start.line || diag.line) - 1),
        character: Math.max(0, (diag.span.start.column || diag.column) - 1),
      },
      end: {
        line: Math.max(0, (diag.span.end.line || diag.endLine) - 1),
        character: Math.max(0, (diag.span.end.column || diag.endColumn) - 1),
      },
    },
    severity: diag.severity === 'error' ? 1 : diag.severity === 'warning' ? 2 : diag.severity === 'information' ? 3 : 4,
    code: diag.code,
    source: 'colt',
    message: diag.hint ? `${diag.message} (Hint: ${diag.hint})` : diag.message,
  };
}
