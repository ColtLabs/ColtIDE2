import { describe, it, expect } from 'vitest';
import {
  COLT_LANGUAGE_ID,
  coltLanguageDefinition,
  coltLanguageConfig,
  coltThemeRules,
} from '../languages/colt/coltMonarch';

describe('Colt Monaco Language Definition', () => {
  it('defines the correct language identifier', () => {
    expect(COLT_LANGUAGE_ID).toBe('colt');
  });

  it('defines Colt grammar keywords and types', () => {
    const keywords = coltLanguageDefinition.keywords as string[];
    expect(keywords).toContain('CONNECT');
    expect(keywords).toContain('DEFINE');
    expect(keywords).toContain('COLLECTION');
    expect(keywords).toContain('FIND');
    expect(keywords).toContain('PUT');
    expect(keywords).toContain('CREATE');
    expect(keywords).toContain('DELETE');
    expect(keywords).toContain('ATOMIC');
    expect(keywords).toContain('WHERE');
    expect(keywords).toContain('SELECT');

    const types = coltLanguageDefinition.typeKeywords as string[];
    expect(types).toContain('text');
    expect(types).toContain('int');
    expect(types).toContain('uuid');
    expect(types).toContain('time');
    expect(types).toContain('vector');
    expect(types).toContain('doc');
  });

  it('configures line and block comments', () => {
    expect(coltLanguageConfig.comments?.lineComment).toBe('--');
    expect(coltLanguageConfig.comments?.blockComment).toEqual(['/*', '*/']);
  });

  it('configures bracket pairs and auto-closing quotes', () => {
    expect(coltLanguageConfig.brackets).toBeDefined();
    expect(coltLanguageConfig.autoClosingPairs).toBeDefined();
  });

  it('includes complete theme rules for syntax tokens', () => {
    const tokens = coltThemeRules.map((r) => r.token);
    expect(tokens).toContain('keyword');
    expect(tokens).toContain('type');
    expect(tokens).toContain('annotation');
    expect(tokens).toContain('variable.parameter');
    expect(tokens).toContain('comment');
    expect(tokens).toContain('string');
  });
});
