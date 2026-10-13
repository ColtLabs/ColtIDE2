import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export const TerminalPanel: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const xtermInstance = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 12,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      theme: {
        background: '#121215',
        foreground: '#ededf0',
        cursor: '#00d2b4',
        selectionBackground: '#1d353a',
        black: '#121215',
        red: '#f85149',
        green: '#00d2b4',
        yellow: '#f59e0b',
        blue: '#38bdf8',
        magenta: '#c084fc',
        cyan: '#00d2b4',
        white: '#ffffff',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);

    setTimeout(() => {
      try {
        fitAddon.fit();
      } catch {
        // Ignored
      }
    }, 100);

    xtermInstance.current = term;

    term.writeln('\x1b[1;36mColtIDE Integrated Terminal\x1b[0m');
    term.writeln('\x1b[90mColt Toolchain v0.2.0 Environment Active\x1b[0m\r\n');
    term.write('\x1b[32mcoltide>\x1b[0m ');

    let currentLine = '';
    term.onData((data) => {
      const code = data.charCodeAt(0);
      if (code === 13) {
        // Enter key
        term.writeln('');
        const trimmed = currentLine.trim();

        if (trimmed === 'clear') {
          term.clear();
        } else if (trimmed === 'colt version') {
          term.writeln('colt 0.2.0 (protocol v1, 8 crates verified)');
        } else if (trimmed === 'colt help' || trimmed === 'help') {
          term.writeln('Supported commands:');
          term.writeln('  colt check <file>     Validate syntax & semantic catalog');
          term.writeln('  colt plan <file>      Compile multi-engine execution plan');
          term.writeln('  colt fmt <file>       Canonical format');
          term.writeln('  colt version          Show version and handshake');
          term.writeln('  clear                 Clear terminal buffer');
        } else if (trimmed) {
          term.writeln(`\x1b[33mCommand executed:\x1b[0m ${trimmed}`);
        }

        currentLine = '';
        term.write('\x1b[32mcoltide>\x1b[0m ');
      } else if (code === 127 || code === 8) {
        // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
        }
      } else if (data >= ' ' || data === '\t') {
        currentLine += data;
        term.write(data);
      }
    });

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch {
        // Ignored
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full bg-[#0e1117] p-1 overflow-hidden" ref={terminalRef} />
  );
};
