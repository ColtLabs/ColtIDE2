import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  File,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  RefreshCw,
} from 'lucide-react';
import { useWorkspaceStore, type FileEntry } from '../../store/workspaceStore';
import { cn } from '../../lib/utils';

interface SoloSidebarProps {
  width: number;
}

export const SoloSidebar: React.FC<SoloSidebarProps> = ({ width }) => {
  const { fileTree, openFile, activeTab, createFile } = useWorkspaceStore();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const toggleCollapse = (path: string) => {
    setCollapsed((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      setIsCreatingFile(false);
      return;
    }
    const name = newFileName.endsWith('.colt') ? newFileName : `${newFileName}.colt`;
    createFile('workspace', name);
    setNewFileName('');
    setIsCreatingFile(false);
  };

  const renderTree = (entries: FileEntry[], depth = 0) => {
    return (
      <div className="flex flex-col select-none space-y-0.5">
        {entries.map((entry) => {
          const isDir = entry.isDirectory;
          const isExpanded = !collapsed[entry.path];
          const isActive = activeTab === entry.path;
          const isColt = entry.name.endsWith('.colt');

          // Filter by search
          if (
            searchFilter &&
            !isDir &&
            !entry.name.toLowerCase().includes(searchFilter.toLowerCase())
          ) {
            return null;
          }

          return (
            <div key={entry.path}>
              <div
                onClick={() => {
                  if (isDir) {
                    toggleCollapse(entry.path);
                  } else {
                    openFile(entry.path);
                  }
                }}
                style={{ paddingLeft: `${depth * 14 + 10}px` }}
                className={cn(
                  'flex items-center gap-2 py-1 px-2 rounded-md cursor-pointer text-xs font-mono transition-all duration-150 group',
                  isActive
                    ? 'bg-card text-primary font-semibold shadow-sm'
                    : 'text-foreground/80 hover:bg-card/50 hover:text-foreground'
                )}
              >
                {isDir ? (
                  <>
                    <span className="text-muted-foreground/70 group-hover:text-foreground">
                      {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    </span>
                    <span className="text-amber-400">
                      {isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />}
                    </span>
                    <span className="truncate">{entry.name}</span>
                  </>
                ) : (
                  <>
                    <span className="w-3" />
                    {isColt ? (
                      <span className="text-primary">
                        <FileCode size={14} />
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        <File size={14} />
                      </span>
                    )}
                    <span className="truncate">{entry.name}</span>
                  </>
                )}
              </div>

              {isDir && isExpanded && entry.children && (
                <div className="mt-0.5">{renderTree(entry.children, depth + 1)}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <aside
      className="liquid-sidebar flex flex-col h-full bg-sidebar border-r border-border/80 select-none overflow-hidden"
      style={{ width }}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3 h-9 border-b border-border/40 shrink-0">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCreatingFile(true)}
            title="New .colt file"
            className="p-1 rounded hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => {}}
            title="Refresh Explorer"
            className="p-1 rounded hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Search Filter Input */}
      <div className="px-2.5 py-2">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card/50 border border-border/50 text-xs">
          <Search size={12} className="text-muted-foreground/70" />
          <input
            type="text"
            value={searchFilter}
            placeholder="Filter files..."
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 text-xs focus:outline-none font-sans"
          />
        </div>
      </div>

      {/* Creation Row */}
      {isCreatingFile && (
        <form onSubmit={handleCreateFile} className="px-2.5 pb-2">
          <input
            type="text"
            autoFocus
            value={newFileName}
            placeholder="filename.colt"
            onChange={(e) => setNewFileName(e.target.value)}
            onBlur={() => setIsCreatingFile(false)}
            className="w-full bg-card text-xs font-mono text-foreground px-2 py-1 rounded-md border border-primary focus:outline-none shadow-sm"
          />
        </form>
      )}

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {renderTree(fileTree)}
      </div>
    </aside>
  );
};
