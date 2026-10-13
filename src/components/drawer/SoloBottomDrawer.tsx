import React from 'react';
import {
  AlertCircle,
  Terminal,
  Code2,
  Database,
  ChevronDown,
  ChevronUp,
  X,
  Lock,
} from 'lucide-react';
import { usePanelStore, type PanelTab } from '../../store/panelStore';
import { useToolchainStore } from '../../store/toolchainStore';
import { ProblemsPanel } from '../ProblemsPanel';
import { OutputPanel } from '../OutputPanel';
import { TerminalPanel } from '../TerminalPanel';
import { SchemaMapperView } from '../SchemaMapperView';
import { cn } from '../../lib/utils';

export const SoloBottomDrawer: React.FC = () => {
  const {
    activePanelTab,
    setActivePanelTab,
    isBottomPanelOpen,
    toggleBottomPanel,
    setBottomPanelOpen,
  } = usePanelStore();
  const { diagnostics, planResult } = useToolchainStore();

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;

  const tabs: Array<{
    id: PanelTab;
    label: string;
    icon: React.ReactNode;
    badge?: React.ReactNode;
  }> = [
    {
      id: 'problems',
      label: 'Problems',
      icon: <AlertCircle size={13} />,
      badge:
        diagnostics.length > 0 ? (
          <span className="flex items-center gap-1 ml-1.5">
            {errorCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-destructive text-destructive-foreground font-bold">
                {errorCount}
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                {warningCount}
              </span>
            )}
          </span>
        ) : null,
    },
    {
      id: 'output',
      label: 'Execution Plan',
      icon: <Code2 size={13} />,
      badge:
        planResult && planResult.steps.length > 0 ? (
          <span className="text-[10px] ml-1.5 px-1.5 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">
            {planResult.steps.length}
          </span>
        ) : null,
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: <Terminal size={13} />,
    },
    {
      id: 'schema',
      label: 'Schema Mapper',
      icon: <Database size={13} />,
      badge: (
        <span className="flex items-center gap-0.5 text-[9px] ml-1.5 px-1.5 py-0.2 rounded bg-card text-muted-foreground/80 border border-border/50 uppercase font-semibold">
          <Lock size={8} />
          Read-Only
        </span>
      ),
    },
  ];

  return (
    <div
      className={cn(
        'flex flex-col bg-background/95 backdrop-blur-md border-t border-border/80 select-none transition-all duration-200 z-10',
        isBottomPanelOpen ? 'h-64' : 'h-[34px]'
      )}
    >
      {/* Drawer Header & Tabs */}
      <div className="flex items-center justify-between h-[34px] bg-card/40 border-b border-border/60 px-2 shrink-0">
        <div className="flex items-center gap-1 h-full">
          {tabs.map((tab) => {
            const isActive = activePanelTab === tab.id && isBottomPanelOpen;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePanelTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 h-6 px-2.5 rounded-md text-xs font-sans transition-all duration-150',
                  isActive
                    ? 'bg-card text-foreground font-semibold shadow-sm border border-border/80'
                    : 'text-muted-foreground/75 hover:text-foreground hover:bg-card/40'
                )}
              >
                <span className={isActive ? 'text-primary' : ''}>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge}
              </button>
            );
          })}
        </div>

        {/* Drawer Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleBottomPanel}
            title={isBottomPanelOpen ? 'Collapse Bottom Drawer' : 'Expand Bottom Drawer'}
            className="p-1 text-muted-foreground/75 hover:text-foreground hover:bg-card rounded-md transition-colors"
          >
            {isBottomPanelOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          {isBottomPanelOpen && (
            <button
              onClick={() => setBottomPanelOpen(false)}
              title="Close Bottom Drawer"
              className="p-1 text-muted-foreground/75 hover:text-foreground hover:bg-card rounded-md transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Drawer Active Tab Content */}
      {isBottomPanelOpen && (
        <div className="flex-1 overflow-hidden bg-background">
          {activePanelTab === 'problems' && <ProblemsPanel />}
          {activePanelTab === 'output' && <OutputPanel />}
          {activePanelTab === 'terminal' && <TerminalPanel />}
          {activePanelTab === 'schema' && <SchemaMapperView />}
        </div>
      )}
    </div>
  );
};
