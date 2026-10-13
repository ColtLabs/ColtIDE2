import React from 'react';
import { Database, Server, RefreshCw, Key, Tag } from 'lucide-react';
import { useToolchainStore } from '../../store/toolchainStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { cn } from '../../lib/utils';

interface SoloColtanePanelProps {
  width: number;
}

export const SoloColtanePanel: React.FC<SoloColtanePanelProps> = ({ width }) => {
  const { schemaMetadata, loadSchema, isChecking } = useToolchainStore();
  const { activeTab, fileContents } = useWorkspaceStore();

  const handleRefresh = () => {
    if (activeTab && fileContents[activeTab]) {
      loadSchema(fileContents[activeTab], true);
    }
  };

  return (
    <aside
      className="liquid-sidebar flex flex-col h-full bg-sidebar border-r border-border/80 select-none overflow-hidden text-xs"
      style={{ width }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-9 border-b border-border/40 shrink-0 bg-background/40 backdrop-blur-sm">
        <div className="flex items-center gap-2 font-medium text-foreground text-xs tracking-wide">
          <Database className="w-3.5 h-3.5 text-primary" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            Coltane Catalog
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isChecking}
          title="Refresh Catalog from Compiler"
          className="p-1 rounded hover:bg-card text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', isChecking && 'animate-spin')} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {/* Layer 1: Connections */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            <span>Connections</span>
            <span className="text-[10px] text-muted-foreground/60">
              {schemaMetadata?.connections.length ?? 0}
            </span>
          </div>

          <div className="space-y-1">
            {(!schemaMetadata || schemaMetadata.connections.length === 0) ? (
              <div className="p-2 rounded bg-card/40 border border-border/40 text-[11px] text-muted-foreground text-center">
                No active connections declared
              </div>
            ) : (
              schemaMetadata.connections.map((conn) => (
                <div
                  key={conn.name}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-card/60 border border-border/50 text-foreground"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Server className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-mono text-xs font-semibold">{conn.name}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 uppercase font-mono font-bold">
                    {conn.engine}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Layer 2: Collections & Fields */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            <span>Collections</span>
            <span className="text-[10px] text-muted-foreground/60">
              {schemaMetadata?.collections.length ?? 0}
            </span>
          </div>

          <div className="space-y-2">
            {(!schemaMetadata || schemaMetadata.collections.length === 0) ? (
              <div className="p-2 rounded bg-card/40 border border-border/40 text-[11px] text-muted-foreground text-center">
                No collections defined
              </div>
            ) : (
              schemaMetadata.collections.map((col) => (
                <div
                  key={col.name}
                  className="rounded-lg bg-card/50 border border-border/50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-2.5 py-1.5 bg-card/80 border-b border-border/40">
                    <span className="font-mono font-bold text-xs text-foreground">
                      {col.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {col.fields.length} fields
                    </span>
                  </div>

                  <div className="divide-y divide-border/30 px-2 py-1">
                    {col.fields.map((f) => (
                      <div
                        key={f.name}
                        className="flex items-center justify-between py-1 text-[11px] font-mono"
                      >
                        <div className="flex items-center gap-1.5">
                          {f.isKey ? (
                            <Key size={11} className="text-amber-400" />
                          ) : (
                            <Tag size={11} className="text-muted-foreground/70" />
                          )}
                          <span className={f.isKey ? 'text-amber-300 font-semibold' : 'text-foreground/90'}>
                            {f.name}
                          </span>
                        </div>
                        <span className="text-primary/90 text-[10px]">{f.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
