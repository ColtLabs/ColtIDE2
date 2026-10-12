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
    <div className="flex flex-col h-full bg-[#0e1117] text-xs font-mono select-none overflow-hidden">
      {/* Header and Attribution Banner */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <Database size={15} className="text-[#00d2b4]" />
          <span className="font-semibold text-[#e6edf3] font-sans">
            Schema Mapping & Catalog View
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#21262d] text-[#8b949e] border border-[#30363d]">
            <Lock size={10} />
            READ-ONLY
          </span>
        </div>

        {/* Explicit Source Attribution Badge */}
        <div className="flex items-center gap-2">
          {isMock ? (
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#3b2d1d] text-[#d29922] border border-[#d29922]/40">
              Source: Mock Toolchain [Simulated]
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#13322b] text-[#00d2b4] border border-[#00d2b4]/40">
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
            className="p-1 hover:text-white hover:bg-[#1f242c] rounded transition"
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
          <div className="flex flex-col items-center justify-center h-32 text-[#8b949e]">
            <Database size={24} className="text-[#484f58] mb-2" />
            <span>No connections or collections declared in current document.</span>
            <span className="text-[11px] text-[#484f58] mt-1">
              Declare with <code>CONNECT &lt;alias&gt;</code> and <code>DEFINE COLLECTION &lt;name&gt;</code>
            </span>
          </div>
        ) : (
          <>
            {/* Connections Section */}
            {schemaMetadata.connections.length > 0 && (
              <div>
                <div className="text-[#8b949e] font-sans font-semibold text-[11px] uppercase tracking-wider mb-2">
                  Active Connections ({schemaMetadata.connections.length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {schemaMetadata.connections.map((conn) => (
                    <div
                      key={conn.name}
                      className="p-2.5 rounded bg-[#161b22] border border-[#30363d] flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-[#e6edf3]">{conn.name}</div>
                        <div className="text-[11px] text-[#8b949e]">{conn.dsnOrEnv}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#1f242c] text-[#00d2b4] border border-[#30363d] uppercase font-bold">
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
                <div className="text-[#8b949e] font-sans font-semibold text-[11px] uppercase tracking-wider mb-2">
                  Declared Collections ({schemaMetadata.collections.length})
                </div>
                <div className="space-y-3">
                  {schemaMetadata.collections.map((col) => (
                    <div
                      key={col.name}
                      className="rounded bg-[#161b22] border border-[#30363d] overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-3 py-2 bg-[#1c2128] border-b border-[#30363d]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#e6edf3]">{col.name}</span>
                          {col.connection && (
                            <span className="text-[10px] text-[#8b949e]">
                              on connection: <span className="text-[#58a6ff]">{col.connection}</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#8b949e]">
                          {col.fields.length} Field(s)
                        </span>
                      </div>

                      <div className="divide-y divide-[#21262d]">
                        {col.fields.map((f) => (
                          <div
                            key={f.name}
                            className="flex items-center justify-between px-3 py-1.5 text-[11px] hover:bg-[#1f242c]"
                          >
                            <div className="flex items-center gap-2">
                              {f.isKey ? (
                                <Key size={12} className="text-[#e3b341]" />
                              ) : (
                                <Tag size={12} className="text-[#8b949e]" />
                              )}
                              <span className="font-medium text-[#c9d1d9]">{f.name}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[#58a6ff]">{f.type}</span>
                              {f.isKey && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#3b2d1d] text-[#e3b341] border border-[#e3b341]/30">
                                  @key
                                </span>
                              )}
                              {f.isUnique && !f.isKey && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#1a2e3b] text-[#58a6ff] border border-[#58a6ff]/30">
                                  @unique
                                </span>
                              )}
                              {f.isIndexed && !f.isKey && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#1a382d] text-[#00d2b4] border border-[#00d2b4]/30">
                                  @index
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
