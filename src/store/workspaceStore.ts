import { create } from 'zustand';

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileEntry[];
  size?: number;
}

interface WorkspaceState {
  workspacePath: string;
  fileTree: FileEntry[];
  openTabs: string[];
  activeTab: string | null;
  fileContents: Record<string, string>;
  dirtyFiles: Record<string, boolean>; // path -> isDirty

  setWorkspacePath: (path: string) => void;
  setFileTree: (tree: FileEntry[]) => void;
  openFile: (path: string, content?: string) => void;
  closeTab: (path: string) => void;
  setActiveTab: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
  markFileSaved: (path: string) => void;
  createFile: (parentPath: string, name: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspacePath: 'workspace',
  fileTree: [
    {
      name: 'queries',
      path: 'workspace/queries',
      isDirectory: true,
      children: [
        {
          name: 'main.colt',
          path: 'workspace/queries/main.colt',
          isDirectory: false,
        },
        {
          name: 'users.colt',
          path: 'workspace/queries/users.colt',
          isDirectory: false,
        },
      ],
    },
    {
      name: 'schema.colt',
      path: 'workspace/schema.colt',
      isDirectory: false,
    },
  ],
  openTabs: ['workspace/schema.colt'],
  activeTab: 'workspace/schema.colt',
  fileContents: {
    'workspace/schema.colt': `#colt 0.2

CONNECT main AS postgres(env("DATABASE_URL"))

DEFINE COLLECTION users ON main {
  id: uuid @key,
  email: text @unique @index,
  display_name: text,
  created_at: time @index
}

DEFINE COLLECTION posts ON main {
  id: uuid @key,
  user_id: uuid @index,
  title: text,
  body: text,
  published: bool @default(false),
  created_at: time @index
}

FIND users {
  SELECT id, email, display_name
  WHERE created_at > 2026-01-01T00:00:00Z
  ORDER BY display_name ASC
  LIMIT 50
}
`,
    'workspace/queries/main.colt': `#colt 0.2

CONNECT main AS postgres(env("DATABASE_URL"))

FIND posts {
  SELECT id, title, published
  WHERE published == true
  ORDER BY created_at DESC
  LIMIT 10
}
`,
    'workspace/queries/users.colt': `#colt 0.2

CONNECT main AS postgres(env("DATABASE_URL"))

FIND users {
  SELECT id, email
  LIMIT 25
}
`,
  },
  dirtyFiles: {},

  setWorkspacePath: (path) => set({ workspacePath: path }),
  setFileTree: (tree) => set({ fileTree: tree }),

  openFile: (path, content) => {
    const { openTabs, fileContents } = get();
    const newTabs = openTabs.includes(path) ? openTabs : [...openTabs, path];
    const newContents = content !== undefined ? { ...fileContents, [path]: content } : fileContents;

    set({
      openTabs: newTabs,
      activeTab: path,
      fileContents: newContents,
    });
  },

  closeTab: (path) => {
    const { openTabs, activeTab } = get();
    const nextTabs = openTabs.filter((t) => t !== path);
    let nextActive = activeTab;

    if (activeTab === path) {
      nextActive = nextTabs.length > 0 ? nextTabs[nextTabs.length - 1] : null;
    }

    set({
      openTabs: nextTabs,
      activeTab: nextActive,
    });
  },

  setActiveTab: (path) => set({ activeTab: path }),

  updateFileContent: (path, content) => {
    const { fileContents, dirtyFiles } = get();
    set({
      fileContents: { ...fileContents, [path]: content },
      dirtyFiles: { ...dirtyFiles, [path]: true },
    });
  },

  markFileSaved: (path) => {
    const { dirtyFiles } = get();
    const newDirty = { ...dirtyFiles };
    delete newDirty[path];
    set({ dirtyFiles: newDirty });
  },

  createFile: (parentPath, name) => {
    const newPath = `${parentPath}/${name}`;
    const { fileTree, openFile } = get();

    // Helper to insert into tree
    const insertNode = (nodes: FileEntry[]): FileEntry[] => {
      return nodes.map((node) => {
        if (node.path === parentPath && node.isDirectory) {
          return {
            ...node,
            children: [
              ...(node.children || []),
              { name, path: newPath, isDirectory: false },
            ],
          };
        }
        if (node.isDirectory && node.children) {
          return { ...node, children: insertNode(node.children) };
        }
        return node;
      });
    };

    set({ fileTree: insertNode(fileTree) });
    openFile(newPath, `#colt 0.2\n\n-- New Colt source file\n`);
  },
}));
