import { useState, useEffect } from "react";
import { SideNavBar } from "@/components/SideNavBar";
import { DocumentList } from "@/components/DocumentList";
import { TopAppBar } from "@/components/TopAppBar";
import { Editor } from "@/components/Editor";
import { ShareModal } from "@/components/ShareModal";
import type { NavId } from "@/App";

interface EditorPageProps {
  activeNav?: NavId;
  onNavChange?: (id: NavId) => void;
  onLogout?: () => void;
  activeDoc?: string;
}

export function EditorPage({ activeNav = "documents", onNavChange, onLogout, activeDoc = "1" }: EditorPageProps) {
  const [activeDocId, setActiveDocId] = useState(activeDoc);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    setActiveDocId(activeDoc);
  }, [activeDoc]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white dark:bg-surface-950">
      <TopAppBar
        variant="editor"
        title="ProWriter"
        onShare={() => setShareOpen(true)}
        onLogout={onLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar activeNav={activeNav} onNavChange={onNavChange ?? (() => {})} />
        <DocumentList activeId={activeDocId} onSelect={setActiveDocId} />
        <div className="flex-1">
          <Editor documentId={activeDocId} />
        </div>
      </div>

      <ShareModal open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
}
