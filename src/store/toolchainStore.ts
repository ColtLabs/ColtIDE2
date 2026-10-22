import { create } from 'zustand';
import { ToolchainManager } from '../toolchain/toolchainManager';
import { checkColtaneDb, executeColt } from '../toolchain/coltaneApi';
import type {
  ColtToolchainStatus,
  ColtDiagnosticItem,
  ColtSchemaMetadata,
  ColtPlanResult,
} from '../toolchain/types';

export interface OutputLog {
  id: string;
  time: string;
  type: 'info' | 'error' | 'success';
  message: string;
}

interface ToolchainState {
  status: ColtToolchainStatus;
  diagnostics: ColtDiagnosticItem[];
  outputLogs: OutputLog[];
  schemaMetadata: ColtSchemaMetadata | null;
  planResult: ColtPlanResult | null;
  isChecking: boolean;
  isPlanning: boolean;
  isFormatting: boolean;
  isRunning: boolean;

  setStatus: (status: ColtToolchainStatus) => void;
  setDiagnostics: (diagnostics: ColtDiagnosticItem[]) => void;
  addLog: (type: 'info' | 'error' | 'success', message: string) => void;
  clearLogs: () => void;
  setSchemaMetadata: (schema: ColtSchemaMetadata | null) => void;
  setPlanResult: (plan: ColtPlanResult | null) => void;

  runCheck: (sourceOrPath: string, isBuffer?: boolean) => Promise<void>;
  runPlan: (sourceOrPath: string, isBuffer?: boolean) => Promise<void>;
  runFormat: (sourceOrPath: string, isBuffer?: boolean) => Promise<string | null>;
  loadSchema: (sourceOrPath: string, isBuffer?: boolean) => Promise<void>;
  runQuery: (source: string) => Promise<void>;
}

export const useToolchainStore = create<ToolchainState>((set, get) => ({
  status: ToolchainManager.getInstance().getStatus(),
  diagnostics: [],
  outputLogs: [
    {
      id: 'init-1',
      time: new Date().toLocaleTimeString(),
      type: 'info',
      message: 'ColtIDE started. Initializing toolchain manager...',
    },
  ],
  schemaMetadata: null,
  planResult: null,
  isChecking: false,
  isPlanning: false,
  isFormatting: false,
  isRunning: false,

  setStatus: (status) => set({ status }),
  setDiagnostics: (diagnostics) => set({ diagnostics }),
  addLog: (type, message) => {
    const log: OutputLog = {
      id: Math.random().toString(36).substring(2, 9),
      time: new Date().toLocaleTimeString(),
      type,
      message,
    };
    set((state) => ({ outputLogs: [...state.outputLogs.slice(-200), log] }));
  },
  clearLogs: () => set({ outputLogs: [] }),
  setSchemaMetadata: (schema) => set({ schemaMetadata: schema }),
  setPlanResult: (plan) => set({ planResult: plan }),

  runCheck: async (sourceOrPath: string, isBuffer = true) => {
    const adapter = ToolchainManager.getInstance().getAdapter();
    set({ isChecking: true });
    get().addLog('info', `Running colt check [adapter: ${adapter.displayName}]...`);

    try {
      const res = await adapter.check(sourceOrPath, isBuffer);
      set({ diagnostics: res.diagnostics });

      if (res.diagnostics.length > 0) {
        get().addLog(
          'error',
          `Check completed with ${res.diagnostics.length} diagnostic(s) in ${res.executionTimeMs ?? 0}ms.`
        );
      } else {
        get().addLog(
          'success',
          `Check successful: 0 errors (${res.steps ?? 0} steps validated).`
        );
      }
    } catch (err: unknown) {
      get().addLog('error', `Failed to execute check: ${String(err)}`);
    } finally {
      set({ isChecking: false });
    }
  },

  runPlan: async (sourceOrPath: string, isBuffer = true) => {
    const adapter = ToolchainManager.getInstance().getAdapter();
    set({ isPlanning: true });
    get().addLog('info', `Compiling execution plan [adapter: ${adapter.displayName}]...`);

    try {
      const res = await adapter.plan(sourceOrPath, isBuffer);
      set({ planResult: res });
      get().addLog('success', `Generated execution plan with ${res.steps.length} step(s).`);
    } catch (err: unknown) {
      get().addLog('error', `Failed to compile plan: ${String(err)}`);
    } finally {
      set({ isPlanning: false });
    }
  },

  runFormat: async (sourceOrPath: string, isBuffer = true) => {
    const adapter = ToolchainManager.getInstance().getAdapter();
    set({ isFormatting: true });
    get().addLog('info', `Formatting document [adapter: ${adapter.displayName}]...`);

    try {
      const res = await adapter.format(sourceOrPath, isBuffer);
      if (res.error) {
        get().addLog('error', `Formatting error: ${res.error}`);
        return null;
      }
      get().addLog('success', `Document formatted successfully.`);
      return res.formatted;
    } catch (err: unknown) {
      get().addLog('error', `Formatting failed: ${String(err)}`);
      return null;
    } finally {
      set({ isFormatting: false });
    }
  },

  loadSchema: async (sourceOrPath: string, isBuffer = true) => {
    const adapter = ToolchainManager.getInstance().getAdapter();
    try {
      const meta = await adapter.getSchemaMetadata(sourceOrPath, isBuffer);
      set({ schemaMetadata: meta });
    } catch {
      // Ignored
    }
  },
  runQuery: async (source: string) => {
    set({ isRunning: true });
    try {
      get().addLog('info', 'Checking ColtaneDB connectivity...');
      await checkColtaneDb();
      get().addLog('success', 'ColtaneDB is reachable. Executing Colt...');
      const result = await executeColt(source);
      get().addLog('success', `ColtaneDB execution completed: ${JSON.stringify(result)}`);
    } catch (err: unknown) {
      get().addLog('error', `ColtaneDB connectivity or execution failed: ${String(err)}`);
    } finally {
      set({ isRunning: false });
    }
  },
}));
