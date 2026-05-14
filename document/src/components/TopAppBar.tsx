import { Button } from "@/components/ui/button";
import {
  Share2,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Languages,
} from "lucide-react";
import { ShinyText } from "@/components/ShinyText";
import { useTheme } from "@/components/ThemeProvider";
import { useI18n } from "@/components/I18nProvider";

interface TopAppBarProps {
  variant?: "editor" | "documents" | "trash" | "settings";
  title?: string;
  onShare?: () => void;
  onExport?: () => void;
  onLogout?: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function TopAppBar({
  variant = "editor",
  title: _title,
  onShare,
  onExport,
  onLogout,
  sidebarCollapsed = false,
  onToggleSidebar,
}: TopAppBarProps) {
  const { t, toggleLang } = useI18n();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="flex h-14 items-center justify-between border-b border-surface-200 bg-white px-6 dark:border-surface-800 dark:bg-surface-950">
      {/* Left: Sidebar Toggle + Logo + Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="h-8 w-8"
          title={sidebarCollapsed ? t("nav.expand") : t("nav.collapse")}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>

        <div className="flex items-center gap-2">
          <img src="/Logo.png" alt="MythWriter" className="h-7 w-7 rounded-md object-contain" />
          <ShinyText
            text="MythWriter"
            color={isDark ? "#f1f5f9" : "#0f172a"}
            shineColor={isDark ? "#60a5fa" : "#3b82f6"}
            speed={3}
            direction="right"
            className="text-sm font-bold tracking-tight select-none"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center justify-end gap-2">
        {variant === "editor" && (
          <>
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={onShare}>
              <Share2 className="h-3.5 w-3.5" />
              <span className="text-xs">{t("topbar.share")}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={onExport}>
              <Download className="h-3.5 w-3.5" />
              <span className="text-xs">{t("topbar.export")}</span>
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLang}
          className="gap-1.5 border border-surface-300 bg-surface-100 hover:bg-surface-200 dark:border-surface-600 dark:bg-surface-800 dark:hover:bg-surface-700"
        >
          <Languages className="h-3.5 w-3.5" />
          <span className="text-xs">{t("topbar.zh")}</span>
        </Button>

        {onLogout && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="gap-1.5 text-surface-500 hover:text-red-500 dark:text-surface-400 dark:hover:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="text-xs">{t("topbar.logout")}</span>
          </Button>
        )}
      </div>
    </header>
  );
}
