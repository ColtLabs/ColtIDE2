import { describe, it, expect } from 'vitest';
import { parseAstToSchemaMetadata } from '../toolchain/NativeColtToolchain';
import { MockColtToolchain } from '../toolchain/MockColtToolchain';

describe('Schema Mapper & Catalog Representation', () => {
  it('extracts complex schemas with multiple connections and collections', () => {
    const complexAst = {
      statements: [
        {
          type: 'Connect',
          name: 'primary_db',
          engine: 'postgres',
          target: 'env("DATABASE_URL")',
        },
        {
          type: 'Connect',
          name: 'cache_store',
          engine: 'redis',
          target: 'env("REDIS_URL")',
        },
        {
          type: 'DefineCollection',
          name: 'users',
          connection: 'primary_db',
          fields: [
            { name: 'id', type: 'uuid', annotations: ['@key'] },
            { name: 'email', type: 'text', annotations: ['@unique'] },
          ],
        },
        {
          type: 'DefineCollection',
          name: 'sessions',
          connection: 'cache_store',
          fields: [
            { name: 'token', type: 'text', annotations: ['@key'] },
            { name: 'expires_at', type: 'time', annotations: ['@index'] },
          ],
        },
      ],
    };

    const schema = parseAstToSchemaMetadata(complexAst);
    expect(schema.connections.length).toBe(2);
    expect(schema.connections[0].name).toBe('primary_db');
    expect(schema.connections[1].name).toBe('cache_store');

    expect(schema.collections.length).toBe(2);
    expect(schema.collections[0].name).toBe('users');
    expect(schema.collections[0].connection).toBe('primary_db');
    expect(schema.collections[1].name).toBe('sessions');
    expect(schema.collections[1].connection).toBe('cache_store');
  });

  it('mock schema metadata is explicitly marked as simulated', async () => {
    const mock = new MockColtToolchain();
    const schema = await mock.getSchemaMetadata();
    expect(schema.sourceType).toBe('mock');
    expect(schema.connections.length).toBeGreaterThan(0);
    expect(schema.collections.length).toBeGreaterThan(0);
  });
});
