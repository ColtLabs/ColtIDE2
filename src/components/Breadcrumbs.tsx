import React from 'react';
import { ChevronRight, FileCode, Layers } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useToolchainStore } from '../store/toolchainStore';
import { usePanelStore } from '../store/panelStore';

export const Breadcrumbs: React.FC = () => {
  const { activeTab, fileContents } = useWorkspaceStore();
  const { loadSchema } = useToolchainStore();
  const { setActivePanelTab } = usePanelStore();

  if (!activeTab) return null;

  const parts = activeTab.split('/');
  const currentContent = fileContents[activeTab] || '';

  const handleInspectSchema = async () => {
    await loadSchema(currentContent, true);
    setActivePanelTab('schema');
  };

  return (
    <div className="flex items-center justify-between h-[28px] bg-background/40 backdrop-blur-sm border-b border-border/50 px-3 text-xs select-none shrink-0">
      {/* File Path Segments */}
      <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
        <FileCode size={12} className="text-primary shrink-0" />
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={11} className="text-muted-foreground/40 shrink-0" />}
            <span
              className={
                index === parts.length - 1
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer'
              }
            >
              {part}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Schema quick inspection badge */}
      <button
        onClick={handleInspectSchema}
        title="Inspect Schema Mapping (Read-Only Catalog)"
        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans text-muted-foreground hover:text-foreground hover:bg-card/60 transition border border-transparent hover:border-border/40"
      >
        <Layers size={11} className="text-amber-400" />
        <span>Catalog</span>
      </button>
    </div>
  );
};
