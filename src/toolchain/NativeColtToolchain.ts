import { invoke } from '@tauri-apps/api/core';
import type {
  IColtToolchainAdapter,
  ColtToolchainStatus,
  ColtCheckResult,
  ColtPlanResult,
  ColtFormatResult,
  ColtSchemaMetadata,
  ColtCollectionSchema,
  ColtConnectionSchema,
  ColtFieldSchema,
} from './types';

export class NativeColtToolchain implements IColtToolchainAdapter {
  readonly isMock = false;
  readonly displayName = 'Native Colt Toolchain';
  private configuredPath?: string;

  constructor(configuredPath?: string) {
    this.configuredPath = configuredPath;
  }

  setConfiguredPath(path?: string) {
    this.configuredPath = path;
  }

  async getToolchainInfo(path?: string): Promise<ColtToolchainStatus> {
    const targetPath = path || this.configuredPath;
    try {
      const res = await invoke<ColtToolchainStatus>('colt_get_toolchain_info', {
        configuredPath: targetPath,
      });
      return res;
    } catch (err: unknown) {
      return {
        available: false,
        isMock: false,
        executablePath: targetPath,
        capabilities: [],
        error: String(err),
      };
    }
  }

  async check(sourceOrPath: string, isBuffer = false): Promise<ColtCheckResult> {
    try {
      const res = await invoke<ColtCheckResult>('colt_check', {
        pathOrSource: sourceOrPath,
        isBuffer,
        configuredPath: this.configuredPath,
      });
      return res;
    } catch (err: unknown) {
      return {
        source: isBuffer ? '<stdin>' : sourceOrPath,
        status: 'error',
        diagnostics: [],
        rawOutput: String(err),
      };
    }
  }

  async plan(sourceOrPath: string, isBuffer = false): Promise<ColtPlanResult> {
    try {
      const res = await invoke<ColtPlanResult>('colt_plan', {
        pathOrSource: sourceOrPath,
        isBuffer,
        configuredPath: this.configuredPath,
      });
      return res;
    } catch (err: unknown) {
      return {
        source: isBuffer ? '<stdin>' : sourceOrPath,
        steps: [],
        diagnostics: [],
        rawOutput: String(err),
      };
    }
  }

  async format(sourceOrPath: string, isBuffer = false): Promise<ColtFormatResult> {
    try {
      const res = await invoke<ColtFormatResult>('colt_format', {
        pathOrSource: sourceOrPath,
        isBuffer,
        configuredPath: this.configuredPath,
      });
      return res;
    } catch (err: unknown) {
      return {
        source: isBuffer ? '<stdin>' : sourceOrPath,
        formatted: isBuffer ? sourceOrPath : '',
        changed: false,
        error: String(err),
      };
    }
  }

  async getSchemaMetadata(sourceOrPath: string, isBuffer = false): Promise<ColtSchemaMetadata> {
    try {
      // Use genuine compiler AST to extract collections and connections
      const rawAst = await invoke<Record<string, unknown>>('colt_parse_ast', {
        pathOrSource: sourceOrPath,
        isBuffer,
        configuredPath: this.configuredPath,
      });

      return parseAstToSchemaMetadata(rawAst);
    } catch {
      // If parse fails (e.g. file has syntax errors), return empty genuine metadata
      return {
        sourceType: 'genuine-compiler',
        connections: [],
        collections: [],
      };
    }
  }
}

/**
 * Extracts read-only schema metadata from genuine Colt AST
 */
export function parseAstToSchemaMetadata(ast: Record<string, unknown>): ColtSchemaMetadata {
  const connections: ColtConnectionSchema[] = [];
  const collections: ColtCollectionSchema[] = [];

  const statements = (ast.statements || ast.program || []) as Array<Record<string, unknown>>;

  for (const stmt of statements) {
    if (stmt.type === 'Connect' || stmt.type === 'connect') {
      connections.push({
        name: String(stmt.name || stmt.alias || 'default'),
        engine: String(stmt.engine || stmt.backend || 'postgres'),
        dsnOrEnv: String(stmt.target || stmt.env || ''),
      });
    } else if (stmt.type === 'DefineCollection' || stmt.type === 'defineCollection' || stmt.type === 'collection') {
      const fields: ColtFieldSchema[] = [];
      const rawFields = (stmt.fields || []) as Array<Record<string, unknown>>;

      for (const f of rawFields) {
        const annotations = (f.annotations || []) as string[];
        fields.push({
          name: String(f.name || ''),
          type: String(f.fieldType || f.type || 'text'),
          isKey: annotations.includes('key') || annotations.includes('@key'),
          isUnique: annotations.includes('unique') || annotations.includes('@unique'),
          isIndexed: annotations.includes('index') || annotations.includes('@index'),
          defaultValue: f.default ? String(f.default) : undefined,
        });
      }

      collections.push({
        name: String(stmt.name || ''),
        connection: stmt.connection ? String(stmt.connection) : undefined,
        fields,
      });
    }
  }

  return {
    sourceType: 'genuine-compiler',
    connections,
    collections,
  };
}
