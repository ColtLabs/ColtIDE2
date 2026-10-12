import React from 'react';
import { ChevronRight, Play, CheckCircle2, AlignLeft, Layers } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useToolchainStore } from '../store/toolchainStore';
import { usePanelStore } from '../store/panelStore';

export const Breadcrumbs: React.FC = () => {
  const { activeTab, fileContents, markFileSaved, updateFileContent } = useWorkspaceStore();
  const { runCheck, runPlan, runFormat, loadSchema, isChecking, isPlanning, isFormatting } =
    useToolchainStore();
  const { setActivePanelTab } = usePanelStore();

  if (!activeTab) return null;

  const parts = activeTab.split('/');
  const currentContent = fileContents[activeTab] || '';

  const handleCheck = async () => {
    await runCheck(currentContent, true);
    setActivePanelTab('problems');
  };

  const handlePlan = async () => {
    await runPlan(currentContent, true);
    setActivePanelTab('output');
  };

  const handleFormat = async () => {
    const formatted = await runFormat(currentContent, true);
    if (formatted) {
      updateFileContent(activeTab, formatted);
      markFileSaved(activeTab);
    }
  };

  const handleInspectSchema = async () => {
    await loadSchema(currentContent, true);
    setActivePanelTab('schema');
  };

  return (
    <div className="flex items-center justify-between h-7 bg-[#161b22] border-b border-[#30363d] px-3 text-xs select-none">
      {/* File Path Segments */}
      <div className="flex items-center gap-1 text-[#8b949e] font-mono">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={12} className="text-[#484f58]" />}
            <span
              className={
                index === parts.length - 1 ? 'text-[#c9d1d9] font-medium' : 'text-[#8b949e]'
              }
            >
              {part}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Colt Operations Toolbar */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCheck}
          disabled={isChecking}
          title="Run colt check (Validate Syntax & Catalog)"
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#1f242c] text-[#00d2b4] hover:bg-[#282f3a] transition border border-[#30363d] disabled:opacity-50"
        >
          <CheckCircle2 size={12} />
          {isChecking ? 'Checking...' : 'Check'}
        </button>

        <button
          onClick={handlePlan}
          disabled={isPlanning}
          title="Run colt plan (Inspect Multi-Engine SQL Execution Plan)"
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#1f242c] text-[#58a6ff] hover:bg-[#282f3a] transition border border-[#30363d] disabled:opacity-50"
        >
          <Play size={12} />
          {isPlanning ? 'Planning...' : 'Plan'}
        </button>

        <button
          onClick={handleFormat}
          disabled={isFormatting}
          title="Run colt fmt (Canonical Code Formatter)"
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#1f242c] text-[#d2a8ff] hover:bg-[#282f3a] transition border border-[#30363d] disabled:opacity-50"
        >
          <AlignLeft size={12} />
          {isFormatting ? 'Formatting...' : 'Format'}
        </button>

        <button
          onClick={handleInspectSchema}
          title="Inspect Schema Mapping (Read-Only Catalog)"
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#1f242c] text-[#e3b341] hover:bg-[#282f3a] transition border border-[#30363d]"
        >
          <Layers size={12} />
          Schema
        </button>
      </div>
    </div>
  );
};
