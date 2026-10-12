import type { ColtDiagnosticItem } from './types';

export interface LspPosition {
  line: number;
  character: number;
}

export interface LspLocation {
  uri: string;
  range: {
    start: LspPosition;
    end: LspPosition;
  };
}

export interface LspHoverResult {
  contents: string[];
}

export interface IColtLspAdapter {
  readonly isConnected: boolean;
  start(executablePath: string, workspaceRoot: string): Promise<boolean>;
  stop(): Promise<void>;
  notifyDidOpen(uri: string, text: string): void;
  notifyDidChange(uri: string, text: string, version: number): void;
  notifyDidSave(uri: string): void;
  onDiagnostics(callback: (uri: string, diagnostics: ColtDiagnosticItem[]) => void): () => void;
  requestFormatting(uri: string): Promise<string | null>;
  requestHover(uri: string, position: LspPosition): Promise<LspHoverResult | null>;
  requestDefinition(uri: string, position: LspPosition): Promise<LspLocation | null>;
}

/**
 * Placeholder / Ready-for-integration LSP Client Adapter
 * Encapsulates language server protocol stdio transport
 */
export class ColtLspAdapter implements IColtLspAdapter {
  private _isConnected = false;
  private diagnosticListeners: Array<(uri: string, diagnostics: ColtDiagnosticItem[]) => void> = [];

  get isConnected(): boolean {
    return this._isConnected;
  }

  async start(_executablePath: string, _workspaceRoot: string): Promise<boolean> {
    // When `colt lsp` is deployed, this invokes the Tauri stdio PTY/process bridge
    this._isConnected = false;
    return false;
  }

  async stop(): Promise<void> {
    this._isConnected = false;
  }

  notifyDidOpen(_uri: string, _text: string): void {
    // textDocument/didOpen
  }

  notifyDidChange(_uri: string, _text: string, _version: number): void {
    // textDocument/didChange
  }

  notifyDidSave(_uri: string): void {
    // textDocument/didSave
  }

  onDiagnostics(callback: (uri: string, diagnostics: ColtDiagnosticItem[]) => void): () => void {
    this.diagnosticListeners.push(callback);
    return () => {
      this.diagnosticListeners = this.diagnosticListeners.filter((l) => l !== callback);
    };
  }

  async requestFormatting(_uri: string): Promise<string | null> {
    return null;
  }

  async requestHover(_uri: string, _position: LspPosition): Promise<LspHoverResult | null> {
    return null;
  }

  async requestDefinition(_uri: string, _position: LspPosition): Promise<LspLocation | null> {
    return null;
  }
}
