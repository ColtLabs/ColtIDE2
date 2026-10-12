import React from 'react';
import {
  AlertCircle,
  Terminal,
  Code2,
  Database,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { usePanelStore, type PanelTab } from '../store/panelStore';
import { useToolchainStore } from '../store/toolchainStore';
import { ProblemsPanel } from './ProblemsPanel';
import { OutputPanel } from './OutputPanel';
import { TerminalPanel } from './TerminalPanel';
import { SchemaMapperView } from './SchemaMapperView';

export const BottomPanel: React.FC = () => {
  const { activePanelTab, setActivePanelTab, isBottomPanelOpen, toggleBottomPanel } =
    usePanelStore();
  const { diagnostics } = useToolchainStore();

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;

  const tabs: Array<{ id: PanelTab; label: string; icon: React.ReactNode; badge?: React.ReactNode }> = [
    {
      id: 'problems',
      label: 'Problems',
      icon: <AlertCircle size={14} />,
      badge: diagnostics.length > 0 ? (
        <span className="flex items-center gap-1 ml-1.5">
          {errorCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#f85149] text-white font-bold">
              {errorCount}
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#d29922] text-black font-bold">
              {warningCount}
            </span>
          )}
        </span>
      ) : null,
    },
    {
      id: 'output',
      label: 'Output',
      icon: <Code2 size={14} />,
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: <Terminal size={14} />,
    },
    {
      id: 'schema',
      label: 'Schema Mapper',
      icon: <Database size={14} />,
      badge: (
        <span className="text-[10px] ml-1 px-1 rounded bg-[#21262d] text-[#8b949e]">
          Read-Only
        </span>
      ),
    },
  ];

  return (
    <div
      className={`flex flex-col bg-[#0e1117] border-t border-[#30363d] select-none transition-all ${
        isBottomPanelOpen ? 'h-64' : 'h-8'
      }`}
    >
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between h-8 bg-[#161b22] px-2 border-b border-[#30363d]">
        <div className="flex items-center h-full">
          {tabs.map((tab) => {
            const isActive = activePanelTab === tab.id && isBottomPanelOpen;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePanelTab(tab.id)}
                className={`flex items-center gap-1.5 h-full px-3 text-xs font-sans transition-colors ${
                  isActive
                    ? 'text-[#00d2b4] font-semibold border-b-2 border-[#00d2b4] bg-[#0e1117]'
                    : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#1f242c]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge}
              </button>
            );
          })}
        </div>

        {/* Toggle Panel Button */}
        <button
          onClick={toggleBottomPanel}
          title={isBottomPanelOpen ? 'Collapse Bottom Panel' : 'Expand Bottom Panel'}
          className="p-1 text-[#8b949e] hover:text-white hover:bg-[#1f242c] rounded transition"
        >
          {isBottomPanelOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {/* Tab Content */}
      {isBottomPanelOpen && (
        <div className="flex-1 overflow-hidden bg-[#0e1117]">
          {activePanelTab === 'problems' && <ProblemsPanel />}
          {activePanelTab === 'output' && <OutputPanel />}
          {activePanelTab === 'terminal' && <TerminalPanel />}
          {activePanelTab === 'schema' && <SchemaMapperView />}
        </div>
      )}
    </div>
  );
};
