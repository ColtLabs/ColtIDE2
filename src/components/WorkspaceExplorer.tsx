import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  File,
  ChevronRight,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { useWorkspaceStore, type FileEntry } from '../store/workspaceStore';

export const WorkspaceExplorer: React.FC = () => {
  const { fileTree, openFile, activeTab, createFile } = useWorkspaceStore();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

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
      <div className="flex flex-col select-none">
        {entries.map((entry) => {
          const isDir = entry.isDirectory;
          const isExpanded = !collapsed[entry.path];
          const isActive = activeTab === entry.path;
          const isColt = entry.name.endsWith('.colt');

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
                style={{ paddingLeft: `${depth * 14 + 12}px` }}
                className={`flex items-center gap-1.5 py-1 px-2 cursor-pointer text-xs font-mono transition-colors group ${
                  isActive
                    ? 'bg-[#1f242c] text-[#00d2b4] font-medium'
                    : 'text-[#c9d1d9] hover:bg-[#161b22] hover:text-white'
                }`}
              >
                {isDir ? (
                  <>
                    <span className="text-[#8b949e]">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                    <span className="text-[#e3b341]">
                      {isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />}
                    </span>
                    <span className="truncate">{entry.name}</span>
                  </>
                ) : (
                  <>
                    <span className="w-3.5" />
                    {isColt ? (
                      <span className="text-[#00d2b4]">
                        <FileCode size={14} />
                      </span>
                    ) : (
                      <span className="text-[#8b949e]">
                        <File size={14} />
                      </span>
                    )}
                    <span className="truncate">{entry.name}</span>
                  </>
                )}
              </div>

              {isDir && isExpanded && entry.children && (
                <div>{renderTree(entry.children, depth + 1)}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0e1117] border-r border-[#30363d] w-64 select-none">
      <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#8b949e] uppercase tracking-wider border-b border-[#30363d]">
        <span className="flex items-center gap-1.5">
          <Folder size={14} className="text-[#00d2b4]" />
          Workspace
        </span>
        <button
          onClick={() => setIsCreatingFile(true)}
          title="New Colt File"
          className="p-1 hover:text-white hover:bg-[#1f242c] rounded transition"
        >
          <Plus size={14} />
        </button>
      </div>

      {isCreatingFile && (
        <form onSubmit={handleCreateFile} className="p-2 border-b border-[#30363d] bg-[#161b22]">
          <input
            type="text"
            autoFocus
            value={newFileName}
            placeholder="filename.colt"
            onChange={(e) => setNewFileName(e.target.value)}
            onBlur={() => setIsCreatingFile(false)}
            className="w-full bg-[#0e1117] text-xs font-mono text-white px-2 py-1 rounded border border-[#00d2b4] focus:outline-none"
          />
        </form>
      )}

      <div className="flex-1 overflow-y-auto py-2">
        {renderTree(fileTree)}
      </div>
    </div>
  );
};
