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

export function setColtaneApiUrl(url: string): void {
  if (typeof window === 'undefined') return;
  const normalized = url.trim().replace(/\/$/, '');
  if (normalized) window.localStorage.setItem('coltide.coltaneApiUrl', normalized);
  else window.localStorage.removeItem('coltide.coltaneApiUrl');
}

export async function checkColtaneDb(): Promise<{ status: string; uptime?: number }> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 5000);
  const response = await fetch(`${getColtaneApiUrl()}/health`, { method: 'GET', signal: controller.signal });
  window.clearTimeout(timeout);
  const body = (await response.json().catch(() => ({}))) as { status?: string; uptime?: number };
  if (!response.ok || body.status !== 'ok') {
    throw new Error(`ColtaneDB health check failed (HTTP ${response.status})`);
  }
  return { status: body.status, uptime: body.uptime };
}

export async function executeColt(source: string): Promise<ColtaneRunResult> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30000);
  const response = await fetch(`${getColtaneApiUrl()}/api/v1/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source }),
    signal: controller.signal,
  });
  window.clearTimeout(timeout);
  const body = (await response.json().catch(() => ({ error: response.statusText }))) as ColtaneRunResult;
  if (!response.ok) {
    throw new Error(body.error || `ColtaneDB returned HTTP ${response.status}`);
  }
  return body;
}
