import React from 'react';
import { X, FileCode } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';

export const EditorTabs: React.FC = () => {
  const { openTabs, activeTab, setActiveTab, closeTab, dirtyFiles } = useWorkspaceStore();

  if (openTabs.length === 0) {
    return (
      <div className="h-9 bg-[#0e1117] border-b border-[#30363d] flex items-center px-4 text-xs text-[#8b949e]">
        No open files
      </div>
    );
  }

  return (
    <div className="flex items-center h-9 bg-[#0e1117] border-b border-[#30363d] overflow-x-auto select-none">
      {openTabs.map((tab) => {
        const isActive = activeTab === tab;
        const isDirty = dirtyFiles[tab];
        const fileName = tab.split('/').pop() || tab;

        return (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 h-full px-3 text-xs font-mono border-r border-[#30363d] cursor-pointer group transition-colors ${
              isActive
                ? 'bg-[#161b22] text-[#00d2b4] border-t-2 border-t-[#00d2b4]'
                : 'text-[#8b949e] hover:bg-[#12151c] hover:text-[#c9d1d9]'
            }`}
          >
            <FileCode size={13} className={isActive ? 'text-[#00d2b4]' : 'text-[#8b949e]'} />
            <span className="truncate max-w-[150px]">{fileName}</span>

            {/* Dirty indicator / Close button */}
            <div className="flex items-center justify-center w-4 h-4 ml-1">
              {isDirty ? (
                <span className="w-2 h-2 rounded-full bg-[#00d2b4] group-hover:hidden" />
              ) : null}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab);
                }}
                className={`p-0.5 rounded hover:bg-[#30363d] hover:text-white ${
                  isDirty ? 'hidden group-hover:block' : ''
                }`}
              >
                <X size={12} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
