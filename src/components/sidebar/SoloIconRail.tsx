import React from 'react';
import { Files, Database, AlertCircle, Terminal, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { useToolchainStore } from '../../store/toolchainStore';
import { usePanelStore } from '../../store/panelStore';
import { cn } from '../../lib/utils';

export type RailTab = 'explorer' | 'coltane' | 'problems' | 'terminal';

interface SoloIconRailProps {
  activeTab: RailTab;
  onTabChange: (tab: RailTab) => void;
}

const TABS: Array<{ key: RailTab; icon: React.FC<{ size?: number; className?: string }>; label: string }> = [
  { key: 'explorer', icon: Files, label: 'Explorer' },
  { key: 'coltane', icon: Database, label: 'Coltane Melds & Catalog' },
  { key: 'problems', icon: AlertCircle, label: 'Problems' },
  { key: 'terminal', icon: Terminal, label: 'Terminal' },
];

export const SoloIconRail: React.FC<SoloIconRailProps> = ({ activeTab, onTabChange }) => {
  const { diagnostics } = useToolchainStore();
  const { setSettingsOpen } = usePanelStore();

  const activeIndex = TABS.findIndex((t) => t.key === activeTab);

  return (
    <nav
      className="relative flex flex-col items-center justify-between w-[48px] shrink-0 py-3 bg-sidebar/95 border-r border-border/80 z-20 select-none"
      role="tablist"
      aria-label="Activity Rail"
    >
      {/* Top Section */}
      <div className="relative flex flex-col items-center w-full gap-1.5">
        {/* Sliding spring motion indicator */}
        <motion.div
          className="absolute left-0 w-[2.5px] h-6 rounded-r-full bg-primary shadow-[0_0_8px_1px] shadow-primary/30"
          animate={{ top: 4 + activeIndex * 40 }}
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        />

        {TABS.map(({ key, icon: Icon, label }) => {
          const isActive = activeTab === key;
          const isProblems = key === 'problems';

          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(key)}
              className={cn(
                'relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150 active:scale-95 group',
                isActive
                  ? 'text-foreground bg-card/60 shadow-sm'
                  : 'text-muted-foreground/70 hover:text-foreground hover:bg-card/40'
              )}
              title={label}
            >
              <Icon size={17} className={isActive ? 'text-primary' : 'group-hover:scale-105 transition-transform'} />

              {/* Problem Count Badge */}
              {isProblems && diagnostics.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center shadow-sm">
                  {diagnostics.length > 9 ? '9+' : diagnostics.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Section: Settings */}
      <div className="flex flex-col items-center w-full">
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-card/40 transition-colors"
          title="Colt Toolchain & IDE Settings"
        >
          <Settings size={17} />
        </button>
      </div>
    </nav>
  );
};
