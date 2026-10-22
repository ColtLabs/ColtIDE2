import React, { useState, useRef, useEffect } from 'react';
import {
  FolderOpen,
  ChevronDown,
  Play,
  CheckCircle2,
  AlignLeft,
  PanelBottom,
  Settings,
  Terminal,
  Search,
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useToolchainStore } from '../../store/toolchainStore';
import { usePanelStore } from '../../store/panelStore';
import { cn } from '../../lib/utils';

export const SoloTitlebar: React.FC = () => {
  const { workspacePath, activeTab, fileContents, markFileSaved, updateFileContent } =
    useWorkspaceStore();
  const { runCheck, runPlan, runFormat, runQuery, isChecking, isPlanning, isFormatting, isRunning } =
    useToolchainStore();
  const {
    toggleBottomPanel,
    isBottomPanelOpen,
    setActivePanelTab,
    setSettingsOpen,
  } = usePanelStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentContent = activeTab ? fileContents[activeTab] || '' : '';

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
    if (formatted && activeTab) {
      updateFileContent(activeTab, formatted);
      markFileSaved(activeTab);
    }
  };

  const handleRun = async () => {
    if (!currentContent) return;
    await runQuery(currentContent);
    setActivePanelTab('output');
  };

  return (
    <header className="titlebar-glass relative flex items-center justify-between h-[38px] px-3 z-30 select-none">
      {/* Left: Window Controls & Workspace Switcher */}
      <div className="flex items-center gap-3">
        {/* macOS Style Traffic Light Window Controls */}
        <div className="flex items-center gap-1.5 mr-1">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 hover:opacity-80 transition" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 hover:opacity-80 transition" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50 hover:opacity-80 transition" />
        </div>

        {/* Workspace Switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium text-foreground hover:bg-card/70 border border-border/40 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-primary">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-semibold tracking-tight text-foreground">ColtIDE</span>
            </div>
            <span className="text-muted-foreground/60 text-[11px] font-mono">
              / {workspacePath}
            </span>
            <ChevronDown size={12} className="text-muted-foreground/80" />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 p-1.5 rounded-lg bg-card/95 border border-border/80 shadow-glass backdrop-blur-md z-50 text-xs font-sans">
              <div className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">
                Current Workspace
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/60 text-foreground font-mono text-[11px]">
                <FolderOpen size={14} className="text-primary shrink-0" />
                <span className="truncate">{workspacePath}</span>
              </div>
              <div className="h-px bg-border/60 my-1.5" />
              <button
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-foreground text-left transition"
              >
                <FolderOpen size={13} className="text-muted-foreground" />
                <span>Open Folder...</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Quick Palette Search Trigger */}
      <div className="flex-1 max-w-sm mx-4">
        <button
          className="w-full flex items-center justify-between px-3 py-1 rounded-md bg-card/60 hover:bg-card/90 border border-border/50 text-muted-foreground hover:text-foreground text-[11px] transition-colors shadow-sm"
          title="Search files, symbols, and commands"
        >
          <div className="flex items-center gap-2">
            <Search size={12} className="text-muted-foreground/70" />
            <span>Search workspace or commands...</span>
          </div>
          <kbd className="px-1.5 py-0.2 rounded bg-muted/70 text-[10px] font-mono border border-border/60 text-muted-foreground">
            Ctrl+P
          </kbd>
        </button>
      </div>

      {/* Right: Quick Action Buttons & Layout Toggles */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleCheck}
          disabled={isChecking}
          title="Check Syntax & Semantics"
          className="group inline-flex h-7 items-center rounded-md px-2 bg-transparent text-muted-foreground hover:bg-card hover:text-primary transition-all duration-150 border border-transparent hover:border-border/50 active:scale-95 disabled:opacity-50"
        >
          <CheckCircle2 size={13} className={isChecking ? 'animate-spin text-primary' : ''} />
          <span className="max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-[4rem] group-hover:opacity-100 group-hover:ml-1 text-[11px] font-medium transition-all duration-200">
            Check
          </span>
        </button>

        <button
          onClick={handlePlan}
          disabled={isPlanning}
          title="Compile Multi-Engine Execution Plan"
          className="group inline-flex h-7 items-center rounded-md px-2 bg-transparent text-muted-foreground hover:bg-card hover:text-blue-400 transition-all duration-150 border border-transparent hover:border-border/50 active:scale-95 disabled:opacity-50"
        >
          <Play size={13} className={isPlanning ? 'animate-spin text-blue-400' : ''} />
          <span className="max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-[4rem] group-hover:opacity-100 group-hover:ml-1 text-[11px] font-medium transition-all duration-200">
            Plan
          </span>
        </button>

        <button
          onClick={handleRun}
          disabled={isRunning || !activeTab}
          title="Run Colt against ColtaneDB"
          className="group inline-flex h-7 items-center rounded-md px-2 bg-transparent text-muted-foreground hover:bg-card hover:text-primary transition-all duration-150 border border-transparent hover:border-border/50 active:scale-95 disabled:opacity-50"
        >
          <Play size={13} className={isRunning ? 'animate-spin text-primary' : 'text-primary'} />
          <span className="max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-[3rem] group-hover:opacity-100 group-hover:ml-1 text-[11px] font-medium transition-all duration-200">
            Run
          </span>
        </button>

        <button
          onClick={handleFormat}
          disabled={isFormatting}
          title="Canonical Code Format"
          className="group inline-flex h-7 items-center rounded-md px-2 bg-transparent text-muted-foreground hover:bg-card hover:text-amber-400 transition-all duration-150 border border-transparent hover:border-border/50 active:scale-95 disabled:opacity-50"
        >
          <AlignLeft size={13} />
          <span className="max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-[4rem] group-hover:opacity-100 group-hover:ml-1 text-[11px] font-medium transition-all duration-200">
            Format
          </span>
        </button>

        <div className="w-px h-4 bg-border/60 mx-1" />

        {/* Panel Toggles */}
        <button
          onClick={() => {
            setActivePanelTab('terminal');
            if (!isBottomPanelOpen) toggleBottomPanel();
          }}
          className={cn(
            'p-1.5 rounded-md hover:bg-card transition-colors',
            isBottomPanelOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          )}
          title="Toggle Terminal Panel"
        >
          <Terminal size={14} />
        </button>

        <button
          onClick={toggleBottomPanel}
          className={cn(
            'p-1.5 rounded-md hover:bg-card transition-colors',
            isBottomPanelOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          )}
          title="Toggle Bottom Drawer"
        >
          <PanelBottom size={14} />
        </button>

        <button
          onClick={() => setSettingsOpen(true)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
          title="Settings"
        >
          <Settings size={14} />
        </button>
      </div>
    </header>
  );
};
