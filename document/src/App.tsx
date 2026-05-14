import { useState } from "react";
import { EditorPage } from "@/pages/EditorPage";
import { DocumentCenterPage } from "@/pages/DocumentCenterPage";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { SharePanelPage } from "@/pages/SharePanelPage";
import { LoginPage } from "@/pages/LoginPage";
import { TrashPage } from "@/pages/TrashPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ConfirmModal } from "@/components/ConfirmModal";
import { PageTransition } from "@/components/PageTransition";
import { useToast } from "@/components/Toast";
import { useI18n } from "@/components/I18nProvider";
import { useAuth } from "@/auth";
import { isLoggedIn as checkLoggedIn, clearToken } from "@/api";
import "./App.css";

export type NavId = "documents" | "favorites" | "trash" | "settings";
type Page = "editor" | "documents" | "favorites" | "share" | "login" | "trash" | "settings";

export default function App() {
  const { toast } = useToast();
  const { t } = useI18n();
  const { refreshUser } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("documents");
  const [isLoggedIn, setIsLoggedIn] = useState(() => checkLoggedIn());
  const [activeNav, setActiveNav] = useState<NavId>("documents");
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [editorDocId, setEditorDocId] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  if (!isLoggedIn && currentPage !== "login") {
    return <LoginPage onLogin={handleLogin} />;
  }
  if (currentPage === "login") {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-white dark:bg-surface-950">
      <PageTransition pageKey={currentPage}>
        {currentPage === "editor" && (
          <EditorPage activeNav={activeNav} onNavChange={handleNavChange} onLogout={handleLogout} activeDoc={editorDocId} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        )}
        {currentPage === "documents" && (
          <DocumentCenterPage activeNav={activeNav} onNavChange={handleNavChange} onLogout={handleLogout} onOpenDoc={handleOpenDoc} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        )}
        {currentPage === "favorites" && (
          <FavoritesPage activeNav={activeNav} onNavChange={handleNavChange} onLogout={handleLogout} onOpenDoc={handleOpenDoc} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        )}
        {currentPage === "share" && (
          <SharePanelPage activeNav={activeNav} onNavChange={handleNavChange} onLogout={handleLogout} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        )}
        {currentPage === "trash" && (
          <TrashPage activeNav={activeNav} onNavChange={handleNavChange} onLogout={handleLogout} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        )}
        {currentPage === "settings" && (
          <SettingsPage activeNav={activeNav} onNavChange={handleNavChange} onLogout={handleLogout} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        )}
      </PageTransition>

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
