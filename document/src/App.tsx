import { useState } from "react";
import { EditorPage } from "@/pages/EditorPage";
import { DocumentCenterPage } from "@/pages/DocumentCenterPage";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { SharePanelPage } from "@/pages/SharePanelPage";
import { LoginPage } from "@/pages/LoginPage";
import { TrashPage } from "@/pages/TrashPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/Toast";
import { useI18n } from "@/components/I18nProvider";
import "./App.css";

export type NavId = "documents" | "favorites" | "trash" | "settings";
type Page = "editor" | "documents" | "favorites" | "share" | "login" | "trash" | "settings";

export default function App() {
  const { toast } = useToast();
  const { t } = useI18n();
  const [currentPage, setCurrentPage] = useState<Page>("editor");
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("isLoggedIn") === "true");
  const [activeNav, setActiveNav] = useState<NavId>("documents");
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [editorDocId, setEditorDocId] = useState("1");

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
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setCurrentPage("login");
    toast(t("toast.logoutSuccess"), "success");
  };

  const handleLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
    setCurrentPage("editor");
  };

  if (!isLoggedIn && currentPage !== "login") {
    return <LoginPage onLogin={handleLogin} />;
  }
  if (currentPage === "login") {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-white dark:bg-surface-950">
      {currentPage === "editor" && (
        <EditorPage activeNav={activeNav} onNavChange={handleNavChange} onLogout={handleLogout} activeDoc={editorDocId} />
      )}
      {currentPage === "documents" && (
        <DocumentCenterPage activeNav={activeNav} onNavChange={handleNavChange} onLogout={handleLogout} onOpenDoc={handleOpenDoc} />
      )}
      {currentPage === "favorites" && (
        <FavoritesPage activeNav={activeNav} onNavChange={handleNavChange} onLogout={handleLogout} onOpenDoc={handleOpenDoc} />
      )}
      {currentPage === "share" && (
        <SharePanelPage activeNav={activeNav} onNavChange={handleNavChange} onLogout={handleLogout} />
      )}
      {currentPage === "trash" && (
        <TrashPage activeNav={activeNav} onNavChange={handleNavChange} onLogout={handleLogout} />
      )}
      {currentPage === "settings" && (
        <SettingsPage activeNav={activeNav} onNavChange={handleNavChange} onLogout={handleLogout} />
      )}

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
