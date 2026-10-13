import React, { useEffect } from 'react';
import { Database, Key, Tag, Lock, ShieldCheck, RefreshCw } from 'lucide-react';
import { useToolchainStore } from '../store/toolchainStore';
import { useWorkspaceStore } from '../store/workspaceStore';

export const SchemaMapperView: React.FC = () => {
  const { schemaMetadata, loadSchema, isChecking } = useToolchainStore();
  const { activeTab, fileContents } = useWorkspaceStore();

  useEffect(() => {
    if (activeTab && fileContents[activeTab]) {
      loadSchema(fileContents[activeTab], true);
    }
  }, [activeTab, fileContents, loadSchema]);

  const isMock = schemaMetadata?.sourceType === 'mock';

  return (
    <div className="flex flex-col h-full bg-background text-xs font-mono select-none overflow-hidden">
      {/* Header and Attribution Banner */}
      <div className="flex items-center justify-between px-3 py-2 bg-card/40 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Database size={14} className="text-primary" />
          <span className="font-semibold text-foreground font-sans text-xs">
            Schema Mapping & Catalog View
          </span>
          <span className="flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-card text-muted-foreground border border-border/60">
            <Lock size={10} />
            READ-ONLY
          </span>
        </div>

        {/* Explicit Source Attribution Badge */}
        <div className="flex items-center gap-2">
          {isMock ? (
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Source: Mock Toolchain [Simulated]
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/30">
              <ShieldCheck size={12} />
              Source: Colt Compiler v0.2.0 [Authoritative Catalog]
            </span>
          )}

          <button
            onClick={() => {
              if (activeTab && fileContents[activeTab]) {
                loadSchema(fileContents[activeTab], true);
              }
            }}
            title="Refresh Schema Catalog"
            className="p-1 text-muted-foreground/80 hover:text-foreground hover:bg-card rounded transition"
          >
            <RefreshCw size={13} className={isChecking ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Catalog Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(!schemaMetadata ||
          (schemaMetadata.collections.length === 0 &&
            schemaMetadata.connections.length === 0)) ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Database size={24} className="text-muted-foreground/40 mb-2" />
            <span className="text-foreground/90 font-medium">No connections or collections declared in current document.</span>
            <span className="text-[11px] text-muted-foreground/60 mt-1">
              Declare with <code>CONNECT &lt;alias&gt;</code> and <code>DEFINE COLLECTION &lt;name&gt;</code>
            </span>
          </div>
        ) : (
          <>
            {/* Connections Section */}
            {schemaMetadata.connections.length > 0 && (
              <div>
                <div className="text-muted-foreground font-sans font-semibold text-[11px] uppercase tracking-wider mb-2">
                  Active Connections ({schemaMetadata.connections.length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {schemaMetadata.connections.map((conn) => (
                    <div
                      key={conn.name}
                      className="p-2.5 rounded-lg bg-card/60 border border-border/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-foreground">{conn.name}</div>
                        <div className="text-[11px] text-muted-foreground">{conn.dsnOrEnv}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 uppercase font-bold">
                        {conn.engine}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collections & Fields Section */}
            {schemaMetadata.collections.length > 0 && (
              <div>
                <div className="text-muted-foreground font-sans font-semibold text-[11px] uppercase tracking-wider mb-2">
                  Collections & Logical Fields ({schemaMetadata.collections.length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {schemaMetadata.collections.map((col) => (
                    <div
                      key={col.name}
                      className="rounded-lg bg-card/60 border border-border/60 overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-3 py-2 bg-card/90 border-b border-border/50">
                        <div className="font-bold text-foreground font-mono">{col.name}</div>
                        <span className="text-[10px] text-muted-foreground">
                          on <span className="text-primary font-semibold">{col.connection}</span>
                        </span>
                      </div>

                      <div className="divide-y divide-border/30 p-2 space-y-1">
                        {col.fields.map((field) => (
                          <div
                            key={field.name}
                            className="flex items-center justify-between py-1 text-[11px]"
                          >
                            <div className="flex items-center gap-1.5">
                              {field.isKey ? (
                                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                                  <Key size={11} />
                                  {field.name}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-foreground/90">
                                  <Tag size={11} className="text-muted-foreground/60" />
                                  {field.name}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-primary text-[10px] font-mono">
                                {field.type}
                              </span>
                              {field.isUnique && (
                                <span className="px-1 py-0.1 rounded text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                  unique
                                </span>
                              )}
                              {field.isIndexed && (
                                <span className="px-1 py-0.1 rounded text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                  index
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
