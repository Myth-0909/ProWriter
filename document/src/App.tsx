import { useState } from "react";
import { TopAppBar } from "@/components/TopAppBar";
import { SideNavBar } from "@/components/SideNavBar";
import { PageTransition } from "@/components/PageTransition";
import { Editor } from "@/components/Editor";
import { DocumentList } from "@/components/DocumentList";
import { DocumentCenterPage } from "@/pages/DocumentCenterPage";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { TrashPage } from "@/pages/TrashPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { LoginPage } from "@/pages/LoginPage";
import { ShareModal } from "@/components/ShareModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useDocuments } from "@/store";
import { useToast } from "@/components/Toast";
import { useI18n } from "@/components/I18nProvider";
import { useAuth } from "@/auth";
import { isLoggedIn as checkLoggedIn, clearToken } from "@/api";
import "./App.css";

export type NavId = "documents" | "favorites" | "trash" | "settings";
type Page = "editor" | "documents" | "favorites" | "share" | "login" | "trash" | "settings";

function EditorPageContent({ activeDocId, setActiveDocId }: { activeDocId: string; setActiveDocId: (id: string) => void }) {
  return (
    <>
      <DocumentList activeId={activeDocId} onSelect={setActiveDocId} />
      <div className="flex-1">
        <Editor documentId={activeDocId} />
      </div>
    </>
  );
}

export default function App() {
  const { toast } = useToast();
  const { t } = useI18n();
  const { refreshUser } = useAuth();
  const { getDocument } = useDocuments();
  const [currentPage, setCurrentPage] = useState<Page>("documents");
  const [isLoggedIn, setIsLoggedIn] = useState(() => checkLoggedIn());
  const [activeNav, setActiveNav] = useState<NavId>("documents");
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [editorDocId, setEditorDocId] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const handleNavChange = (id: NavId) => {
    setActiveNav(id);
    switch (id) {
      case "documents": setCurrentPage("documents"); break;
      case "favorites": setCurrentPage("favorites"); break;
      case "trash": setCurrentPage("trash"); break;
      case "settings": setCurrentPage("settings"); break;
    }
  };

  const handleOpenDoc = (docId: string) => {
    setEditorDocId(docId);
    setCurrentPage("editor");
    setActiveNav("documents");
  };

  const handleLogout = () => setLogoutConfirm(true);

  const confirmLogout = () => {
    clearToken();
    setIsLoggedIn(false);
    setCurrentPage("login");
    setEditorDocId("");
    toast(t("toast.logoutSuccess"), "success");
  };

  const handleLogin = async () => {
    setIsLoggedIn(true);
    await refreshUser();
    setCurrentPage("documents");
  };

  const handleExport = () => {
    const doc = getDocument(editorDocId);
    if (!doc) {
      toast(t("editor.noContent"), "error");
      return;
    }

    const html = `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>${doc.title}</title>
  <style>
    body { max-width: 720px; margin: 40px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 16px; line-height: 1.8; color: #333; }
    h1 { font-size: 28px; margin-bottom: 8px; }
    .meta { color: #999; font-size: 13px; margin-bottom: 24px; }
  </style>
</head>
<body>
  <h1>${doc.title}</h1>
  <div class="meta">${new Date(doc.updatedAt).toLocaleDateString("zh-CN")} · ${doc.category}</div>
  ${doc.content}
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title || "document"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast(t("editor.exported"), "success");
  };

  const topBarVariant: "editor" | "documents" | "trash" | "settings" =
    currentPage === "editor" || currentPage === "share" ? "editor"
    : currentPage === "trash" ? "trash"
    : currentPage === "settings" ? "settings"
    : "documents";

  if (!isLoggedIn && currentPage !== "login") {
    return <LoginPage onLogin={handleLogin} />;
  }
  if (currentPage === "login") {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-white dark:bg-surface-950">
      <div className="flex h-full w-full flex-col">
        <TopAppBar
          variant={topBarVariant}
          onShare={currentPage === "editor" || currentPage === "share" ? () => setShareOpen(true) : undefined}
          onExport={currentPage === "editor" ? handleExport : undefined}
          onLogout={handleLogout}
          onSettings={() => handleNavChange("settings")}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="flex flex-1 overflow-hidden">
          <SideNavBar activeNav={activeNav} onNavChange={handleNavChange} collapsed={sidebarCollapsed} />

          <PageTransition pageKey={currentPage}>
            {currentPage === "editor" && (
              <EditorPageContent activeDocId={editorDocId} setActiveDocId={setEditorDocId} />
            )}
            {currentPage === "documents" && (
              <DocumentCenterPage onOpenDoc={handleOpenDoc} />
            )}
            {currentPage === "favorites" && (
              <FavoritesPage onOpenDoc={handleOpenDoc} />
            )}
            {currentPage === "trash" && (
              <TrashPage />
            )}
            {currentPage === "settings" && (
              <SettingsPage />
            )}
          </PageTransition>
        </div>
      </div>

      <ShareModal open={shareOpen} onOpenChange={setShareOpen} />

      <ConfirmModal
        open={logoutConfirm}
        onOpenChange={setLogoutConfirm}
        title={t("confirm.logoutTitle")}
        description={t("confirm.logoutDesc")}
        confirmLabel={t("topbar.logout")}
        cancelLabel={t("common.cancel")}
        variant="danger"
        onConfirm={confirmLogout}
      />
    </div>
  );
}
