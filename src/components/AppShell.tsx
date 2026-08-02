import type { ReactNode } from 'react';

interface AppShellProps {
  sidebar: ReactNode;
  list: ReactNode;
  editor: ReactNode;
  editorVisible: boolean;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
}

// Responsive 3-pane shell.
//   lg+ : sidebar + list + editor always visible side by side.
//   <lg : sidebar becomes a drawer; list and editor swap full-width based on
//         whether a note is selected (editorVisible).
export default function AppShell({
  sidebar,
  list,
  editor,
  editorVisible,
  sidebarOpen,
  onCloseSidebar,
}: AppShellProps) {
  return (
    <div className="flex h-full overflow-hidden">
      <aside className="hidden h-full w-72 shrink-0 border-r border-border bg-bg lg:block">
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseSidebar} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-border bg-bg shadow-2xl shadow-black/50">
            {sidebar}
          </aside>
        </div>
      )}

      <section
        className={`h-full w-full flex-col border-r border-border md:flex md:w-80 md:shrink-0 ${
          editorVisible ? 'hidden' : 'flex'
        }`}
      >
        {list}
      </section>

      <main className={`h-full min-w-0 flex-1 flex-col md:flex ${editorVisible ? 'flex' : 'hidden'}`}>
        {editor}
      </main>
    </div>
  );
}
