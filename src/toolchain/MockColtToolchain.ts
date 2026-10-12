import type {
  IColtToolchainAdapter,
  ColtToolchainStatus,
  ColtCheckResult,
  ColtPlanResult,
  ColtFormatResult,
  ColtSchemaMetadata,
  ColtDiagnosticItem,
} from './types';

/**
 * Mock Colt Toolchain Adapter
 * Explicitly identified simulated environment for UI development and testing
 * when the native Colt executable is unavailable.
 * NEVER claims mock output is genuine.
 */
export class MockColtToolchain implements IColtToolchainAdapter {
  readonly isMock = true;
  readonly displayName = 'Mock Toolchain [SIMULATION ONLY]';

  async getToolchainInfo(): Promise<ColtToolchainStatus> {
    return {
      available: true,
      isMock: true,
      version: '0.2.0-mock',
      protocolVersion: '1',
      capabilities: ['check', 'plan', 'parse', 'lex', 'fmt'],
      error: 'Running in simulated Mock mode. No native colt executable connected.',
    };
  }

  async check(sourceOrPath: string, isBuffer = false): Promise<ColtCheckResult> {
    const text = isBuffer ? sourceOrPath : '';
    const diagnostics: ColtDiagnosticItem[] = [];

    // Simple mock detection for demonstration in mock mode
    if (text.includes('invalid_syntax') || text.includes('DEFINE MELD')) {
      diagnostics.push({
        file: isBuffer ? '<stdin>' : sourceOrPath,
        line: 1,
        column: 1,
        endLine: 1,
        endColumn: 12,
        severity: 'error',
        code: 'COLT2003',
        message: 'Reserved construct: DEFINE MELD is reserved in this version.',
        hint: 'Use standard DEFINE COLLECTION or wait for multi-database melds in v0.3.',
        span: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 12, offset: 11 },
        },
      });
    }

    return {
      source: isBuffer ? '<stdin> [MOCK]' : sourceOrPath,
      status: diagnostics.length > 0 ? 'error' : 'ok',
      diagnostics,
      steps: 4,
      executionTimeMs: 12,
      rawOutput: '[MOCK RESULT] Simulated check executed without native binary.',
    };
  }

  async plan(sourceOrPath: string, isBuffer = false): Promise<ColtPlanResult> {
    return {
      source: isBuffer ? '<stdin> [MOCK]' : sourceOrPath,
      diagnostics: [],
      steps: [
        {
          step: 1,
          operation: 'SCAN',
          collection: 'users',
          connection: 'main',
          sql: 'SELECT id, email, created_at FROM users WHERE active = true',
          params: [{ kind: 'constant', value: true }],
        },
        {
          step: 2,
          operation: 'PROJECT',
          collection: 'users',
          connection: 'main',
          sql: 'FILTER & RETURN 10 ROWS',
        },
      ],
      rawOutput: '[MOCK RESULT] Simulated execution plan.',
    };
  }

  async format(sourceOrPath: string, isBuffer = false): Promise<ColtFormatResult> {
    // In mock mode, simply return the source with trimmed whitespace
    const text = isBuffer ? sourceOrPath : '';
    return {
      source: isBuffer ? '<stdin> [MOCK]' : sourceOrPath,
      formatted: text.trim() + '\n',
      changed: false,
    };
  }

  async getSchemaMetadata(): Promise<ColtSchemaMetadata> {
    return {
      sourceType: 'mock',
      toolchainVersion: '0.2.0-mock',
      connections: [
        {
          name: 'main',
          engine: 'postgres',
          dsnOrEnv: 'env("DATABASE_URL")',
        },
        {
          name: 'cache',
          engine: 'redis',
          dsnOrEnv: 'env("REDIS_URL")',
        },
      ],
      collections: [
        {
          name: 'users',
          connection: 'main',
          fields: [
            { name: 'id', type: 'uuid', isKey: true, isUnique: true, isIndexed: true },
            { name: 'email', type: 'text', isKey: false, isUnique: true, isIndexed: true },
            { name: 'name', type: 'text', isKey: false, isUnique: false, isIndexed: false },
            { name: 'created_at', type: 'time', isKey: false, isUnique: false, isIndexed: true },
          ],
        },
        {
          name: 'orders',
          connection: 'main',
          fields: [
            { name: 'id', type: 'uuid', isKey: true, isUnique: true, isIndexed: true },
            { name: 'user_id', type: 'uuid', isKey: false, isUnique: false, isIndexed: true },
            { name: 'total_cents', type: 'int', isKey: false, isUnique: false, isIndexed: false },
            { name: 'status', type: 'text', isKey: false, isUnique: false, isIndexed: true },
          ],
        },
      ],
    };
  }
}
