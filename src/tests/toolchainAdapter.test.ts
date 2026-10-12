import { describe, it, expect } from 'vitest';
import { MockColtToolchain } from '../toolchain/MockColtToolchain';
import { parseAstToSchemaMetadata } from '../toolchain/NativeColtToolchain';
import { ToolchainManager } from '../toolchain/toolchainManager';

describe('Toolchain Integration Layer', () => {
  it('MockColtToolchain provides valid handshake and capabilities', async () => {
    const mock = new MockColtToolchain();
    expect(mock.isMock).toBe(true);
    expect(mock.displayName).toContain('Mock');

    const info = await mock.getToolchainInfo();
    expect(info.available).toBe(true);
    expect(info.isMock).toBe(true);
    expect(info.protocolVersion).toBe('1');
    expect(info.capabilities).toContain('check');
    expect(info.capabilities).toContain('plan');
    expect(info.capabilities).toContain('fmt');
  });

  it('MockColtToolchain validates code and returns diagnostics', async () => {
    const mock = new MockColtToolchain();
    const cleanResult = await mock.check('CONNECT main AS postgres("url")', true);
    expect(cleanResult.status).toBe('ok');
    expect(cleanResult.diagnostics.length).toBe(0);

    const errorResult = await mock.check('DEFINE MELD test ON a, b', true);
    expect(errorResult.status).toBe('error');
    expect(errorResult.diagnostics.length).toBe(1);
    expect(errorResult.diagnostics[0].code).toBe('COLT2003');
    expect(errorResult.diagnostics[0].severity).toBe('error');
  });

  it('MockColtToolchain returns multi-engine execution plan steps', async () => {
    const mock = new MockColtToolchain();
    const plan = await mock.plan('FIND users', true);
    expect(plan.steps.length).toBeGreaterThan(0);
    expect(plan.steps[0].operation).toBe('SCAN');
    expect(plan.steps[0].collection).toBe('users');
  });

  it('ToolchainManager manages active adapter and status subscriptions', async () => {
    const manager = ToolchainManager.getInstance();
    expect(manager).toBeDefined();

    let receivedStatus: unknown = null;
    const unsubscribe = manager.subscribe((status) => {
      receivedStatus = status;
    });

    expect(receivedStatus).not.toBeNull();
    unsubscribe();
  });

  it('parseAstToSchemaMetadata extracts connections and collections with annotations', () => {
    const sampleAst = {
      statements: [
        {
          type: 'Connect',
          name: 'main',
          engine: 'postgres',
          target: 'env("DATABASE_URL")',
        },
        {
          type: 'DefineCollection',
          name: 'customers',
          connection: 'main',
          fields: [
            {
              name: 'id',
              type: 'uuid',
              annotations: ['@key', '@unique'],
            },
            {
              name: 'email',
              type: 'text',
              annotations: ['@unique', '@index'],
            },
            {
              name: 'score',
              type: 'int',
              annotations: [],
            },
          ],
        },
      ],
    };

    const metadata = parseAstToSchemaMetadata(sampleAst);
    expect(metadata.sourceType).toBe('genuine-compiler');
    expect(metadata.connections.length).toBe(1);
    expect(metadata.connections[0].name).toBe('main');
    expect(metadata.connections[0].engine).toBe('postgres');

    expect(metadata.collections.length).toBe(1);
    const collection = metadata.collections[0];
    expect(collection.name).toBe('customers');
    expect(collection.connection).toBe('main');
    expect(collection.fields.length).toBe(3);

    const idField = collection.fields.find((f) => f.name === 'id');
    expect(idField?.isKey).toBe(true);
    expect(idField?.isUnique).toBe(true);
    expect(idField?.type).toBe('uuid');

    const emailField = collection.fields.find((f) => f.name === 'email');
    expect(emailField?.isKey).toBe(false);
    expect(emailField?.isUnique).toBe(true);
    expect(emailField?.isIndexed).toBe(true);
  });
});
