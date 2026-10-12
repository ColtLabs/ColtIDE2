import { describe, it, expect } from 'vitest';
import {
  toMonacoSeverity,
  toMonacoMarker,
  toMonacoMarkers,
  toLspDiagnostic,
} from '../toolchain/diagnosticMapper';
import type { ColtDiagnosticItem } from '../toolchain/types';

describe('Diagnostic Mapper', () => {
  const sampleDiagnostic: ColtDiagnosticItem = {
    file: 'queries/main.colt',
    line: 12,
    column: 5,
    endLine: 12,
    endColumn: 18,
    severity: 'error',
    code: 'COLT2002',
    message: "Unknown collection 'orders'. Declare it with DEFINE COLLECTION first.",
    hint: 'Declare it with DEFINE COLLECTION first.',
    span: {
      start: { line: 12, column: 5, offset: 240 },
      end: { line: 12, column: 18, offset: 253 },
    },
  };

  it('maps severities correctly to Monaco MarkerSeverity', () => {
    expect(toMonacoSeverity('error')).toBe(8); // MarkerSeverity.Error
    expect(toMonacoSeverity('warning')).toBe(4); // MarkerSeverity.Warning
    expect(toMonacoSeverity('information')).toBe(2); // MarkerSeverity.Info
    expect(toMonacoSeverity('hint')).toBe(1); // MarkerSeverity.Hint
  });

  it('converts Colt diagnostic to Monaco Marker with 1-based indexing preserved', () => {
    const marker = toMonacoMarker(sampleDiagnostic);

    expect(marker.startLineNumber).toBe(12);
    expect(marker.startColumn).toBe(5);
    expect(marker.endLineNumber).toBe(12);
    expect(marker.endColumn).toBe(18);
    expect(marker.severity).toBe(8);
    expect(marker.code).toBe('COLT2002');
    expect(marker.source).toBe('colt');
    expect(marker.message).toContain('Unknown collection');
    expect(marker.message).toContain('Hint:');
  });

  it('batch converts multiple diagnostics to Monaco markers', () => {
    const markers = toMonacoMarkers([sampleDiagnostic, { ...sampleDiagnostic, code: 'COLT1001' }]);
    expect(markers.length).toBe(2);
    expect(markers[0].code).toBe('COLT2002');
    expect(markers[1].code).toBe('COLT1001');
  });

  it('converts Colt diagnostic to 0-indexed LSP diagnostic according to specification', () => {
    const lspDiag = toLspDiagnostic(sampleDiagnostic);

    // LSP ranges are 0-indexed
    expect(lspDiag.range.start.line).toBe(11);
    expect(lspDiag.range.start.character).toBe(4);
    expect(lspDiag.range.end.line).toBe(11);
    expect(lspDiag.range.end.character).toBe(17);

    expect(lspDiag.severity).toBe(1); // LSP DiagnosticSeverity.Error
    expect(lspDiag.code).toBe('COLT2002');
    expect(lspDiag.source).toBe('colt');
    expect(lspDiag.message).toContain('Unknown collection');
  });
});
