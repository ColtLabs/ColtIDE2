import { NativeColtToolchain } from './NativeColtToolchain';
import { MockColtToolchain } from './MockColtToolchain';
import type { IColtToolchainAdapter, ColtToolchainStatus } from './types';

export class ToolchainManager {
  private static instance: ToolchainManager;
  private nativeAdapter: NativeColtToolchain;
  private mockAdapter: MockColtToolchain;
  private currentAdapter: IColtToolchainAdapter;
  private currentStatus: ColtToolchainStatus;
  private listeners: Array<(status: ColtToolchainStatus) => void> = [];

  private constructor() {
    this.nativeAdapter = new NativeColtToolchain();
    this.mockAdapter = new MockColtToolchain();
    this.currentAdapter = this.mockAdapter;
    this.currentStatus = {
      available: false,
      isMock: true,
      capabilities: [],
      error: 'Initializing toolchain...',
    };
  }

  public static getInstance(): ToolchainManager {
    if (!ToolchainManager.instance) {
      ToolchainManager.instance = new ToolchainManager();
    }
    return ToolchainManager.instance;
  }

  public getAdapter(): IColtToolchainAdapter {
    return this.currentAdapter;
  }

  public getStatus(): ColtToolchainStatus {
    return this.currentStatus;
  }

  public subscribe(listener: (status: ColtToolchainStatus) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentStatus);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(status: ColtToolchainStatus) {
    this.currentStatus = status;
    for (const listener of this.listeners) {
      listener(status);
    }
  }

  public async initialize(configuredPath?: string): Promise<ColtToolchainStatus> {
    this.nativeAdapter.setConfiguredPath(configuredPath);

    // Attempt native toolchain handshake
    try {
      const status = await this.nativeAdapter.getToolchainInfo(configuredPath);
      if (status.available && !status.isMock) {
        this.currentAdapter = this.nativeAdapter;
        this.notify(status);
        return status;
      }
    } catch {
      // Ignore and fallback
    }

    // Fallback to Mock toolchain
    const mockStatus = await this.mockAdapter.getToolchainInfo();
    this.currentAdapter = this.mockAdapter;
    this.notify(mockStatus);
    return mockStatus;
  }

  public async setConfiguredPath(path: string): Promise<ColtToolchainStatus> {
    return this.initialize(path.trim() || undefined);
  }
}
