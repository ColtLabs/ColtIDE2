export interface ColtaneRunResult {
  success: boolean;
  status?: string;
  data?: unknown;
  rows?: unknown[];
  diagnostics?: unknown[];
  error?: string;
  [key: string]: unknown;
}

const DEFAULT_API_URL = 'http://127.0.0.1:3000';

export function getColtaneApiUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_API_URL;
  return (window.localStorage.getItem('coltide.coltaneApiUrl') || DEFAULT_API_URL).replace(/\/$/, '');
}

export async function executeColt(source: string): Promise<ColtaneRunResult> {
  const response = await fetch(`${getColtaneApiUrl()}/api/v1/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source }),
  });
  const body = (await response.json().catch(() => ({ error: response.statusText }))) as ColtaneRunResult;
  if (!response.ok) {
    throw new Error(body.error || `ColtaneDB returned HTTP ${response.status}`);
  }
  return body;
}
