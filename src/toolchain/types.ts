/**
 * ColtStudio Toolchain & Integration Types
 * Strictly aligned with ColtLang authoritative specification (COLTSTUDIO_INTEGRATION.md)
 */

export type DiagnosticSeverity = 'error' | 'warning' | 'information' | 'hint';

export interface ColtDiagnosticItem {
  file: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
  severity: DiagnosticSeverity;
  code: string;
  message: string;
  hint?: string | null;
  span: {
    start: { line: number; column: number; offset: number };
    end: { line: number; column: number; offset: number };
  };
}

export interface ColtToolchainHandshake {
  name: string;
  version: string;
  protocolVersion: string;
  capabilities: string[];
}

export interface ColtToolchainStatus {
  available: boolean;
  isMock: boolean;
  executablePath?: string;
  version?: string;
  protocolVersion?: string;
  capabilities: string[];
  error?: string;
}

export interface ColtCheckResult {
  source: string;
  status: 'ok' | 'error';
  diagnostics: ColtDiagnosticItem[];
  steps?: number;
  executionTimeMs?: number;
  rawOutput?: string;
}

export interface ColtPlanStep {
  step: number;
  operation: string;
  collection?: string;
  connection?: string;
  sql?: string;
  params?: Array<{ kind: string; value: unknown }>;
  span?: {
    start: { line: number; column: number; offset: number };
    end: { line: number; column: number; offset: number };
  };
}

export interface ColtPlanResult {
  source: string;
  steps: ColtPlanStep[];
  diagnostics: ColtDiagnosticItem[];
  rawOutput?: string;
}

export interface ColtFormatResult {
  source: string;
  formatted: string;
  changed: boolean;
  error?: string;
}

export interface ColtFieldSchema {
  name: string;
  type: string;
  isKey: boolean;
  isUnique: boolean;
  isIndexed: boolean;
  defaultValue?: string;
}

export interface ColtCollectionSchema {
  name: string;
  connection?: string;
  fields: ColtFieldSchema[];
}

export interface ColtConnectionSchema {
  name: string;
  engine: string;
  dsnOrEnv: string;
}

export interface ColtSchemaMetadata {
  sourceType: 'genuine-compiler' | 'mock';
  toolchainVersion?: string;
  connections: ColtConnectionSchema[];
  collections: ColtCollectionSchema[];
}

export interface IColtToolchainAdapter {
  readonly isMock: boolean;
  readonly displayName: string;
  getToolchainInfo(configuredPath?: string): Promise<ColtToolchainStatus>;
  check(sourceOrPath: string, isBuffer?: boolean): Promise<ColtCheckResult>;
  plan(sourceOrPath: string, isBuffer?: boolean): Promise<ColtPlanResult>;
  format(sourceOrPath: string, isBuffer?: boolean): Promise<ColtFormatResult>;
  getSchemaMetadata(sourceOrPath: string, isBuffer?: boolean): Promise<ColtSchemaMetadata>;
}
