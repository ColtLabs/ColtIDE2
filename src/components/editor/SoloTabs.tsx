import { X, FileCode, CheckCircle2, Play, AlignLeft } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useToolchainStore } from '../../store/toolchainStore';
import { usePanelStore } from '../../store/panelStore';
import { cn } from '../../lib/utils';

export const SoloTabs: React.FC = () => {
  const { openTabs, activeTab, setActiveTab, closeTab, dirtyFiles, fileContents, updateFileContent, markFileSaved } =
    useWorkspaceStore();
  const { runCheck, runPlan, runFormat, isChecking, isPlanning, isFormatting } =
    useToolchainStore();
  const { setActivePanelTab } = usePanelStore();

  const currentContent = activeTab ? fileContents[activeTab] || '' : '';

  const handleCheck = async () => {
    if (!currentContent) return;
    await runCheck(currentContent, true);
    setActivePanelTab('problems');
  };

  const handlePlan = async () => {
    if (!currentContent) return;
    await runPlan(currentContent, true);
    setActivePanelTab('output');
  };

  const handleFormat = async () => {
    if (!currentContent || !activeTab) return;
    const formatted = await runFormat(currentContent, true);
    if (formatted) {
      updateFileContent(activeTab, formatted);
      markFileSaved(activeTab);
    }
  };

  return (
    <div className="flex items-center justify-between h-[38px] bg-background/90 backdrop-blur-md border-b border-border/80 px-2 select-none z-10 shrink-0">
      {/* Scrollable Tabs List */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 min-w-0 pr-2">
        {openTabs.map((tab) => {
          const isActive = activeTab === tab;
          const isDirty = dirtyFiles[tab];
          const fileName = tab.split('/').pop() || tab;
          const isColt = fileName.endsWith('.colt');

          return (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              onAuxClick={(e) => {
                if (e.button === 1) {
                  // Middle click closes tab
                  e.preventDefault();
                  closeTab(tab);
                }
              }}
              className={cn(
                'group relative flex items-center gap-2 h-7 px-2.5 rounded-md text-xs font-mono transition-all duration-150 cursor-pointer shrink-0 border select-none',
                isActive
                  ? 'bg-card text-foreground font-medium border-border/80 shadow-sm'
                  : 'bg-transparent text-muted-foreground/75 border-transparent hover:bg-card/40 hover:text-foreground'
              )}
            >
              {/* File Icon */}
              {isColt ? (
                <div className="text-primary flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              ) : (
                <FileCode size={13} className="text-muted-foreground/70" />
              )}

              {/* File Name */}
              <span className="truncate max-w-[140px] tracking-tight">{fileName}</span>

              {/* Dirty indicator / Close Button */}
              <div className="flex items-center justify-center w-4 h-4 ml-0.5">
                {isDirty ? (
                  <span className="w-2 h-2 rounded-full bg-primary group-hover:hidden transition-transform" />
                ) : null}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab);
                  }}
                  className={cn(
                    'p-0.5 rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 transition-all',
                    isDirty ? 'hidden group-hover:flex' : 'opacity-0 group-hover:opacity-100'
                  )}
                  title="Close tab"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab Actions Toolbar */}
      <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-border/40">
        <button
          onClick={handleCheck}
          disabled={isChecking || !activeTab}
          title="colt check (Validate Syntax & Schema)"
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium font-sans text-primary hover:bg-card/80 border border-transparent hover:border-border/60 transition disabled:opacity-40"
        >
          <CheckCircle2 size={12} />
          <span className="hidden sm:inline">Check</span>
        </button>

        <button
          onClick={handlePlan}
          disabled={isPlanning || !activeTab}
          title="colt plan (Compile Multi-Engine SQL Execution Plan)"
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium font-sans text-sky-400 hover:bg-card/80 border border-transparent hover:border-border/60 transition disabled:opacity-40"
        >
          <Play size={12} />
          <span className="hidden sm:inline">Plan</span>
        </button>

        <button
          onClick={handleFormat}
          disabled={isFormatting || !activeTab}
          title="colt fmt (Canonical Code Formatter)"
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium font-sans text-purple-400 hover:bg-card/80 border border-transparent hover:border-border/60 transition disabled:opacity-40"
        >
          <AlignLeft size={12} />
          <span className="hidden sm:inline">Format</span>
        </button>
      </div>
    </div>
  );
};
