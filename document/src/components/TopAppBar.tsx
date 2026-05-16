import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Share2,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Languages,
  Sun,
  Moon,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useI18n } from "@/components/I18nProvider";
import { useAuth } from "@/auth";

interface TopAppBarProps {
  variant?: "editor" | "documents" | "trash" | "settings";
  title?: string;
  onShare?: () => void;
  onExport?: () => void;
  onLogout?: () => void;
  onSettings?: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function TopAppBar({
  variant = "editor",
  onShare,
  onExport,
  onLogout,
  onSettings,
  sidebarCollapsed = false,
  onToggleSidebar,
}: TopAppBarProps) {
  const { t, lang, toggleLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const avatarUrl = user?.avatar
    ? `http://localhost:3000/uploads/${user.avatar}`
    : null;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="flex h-14 items-center justify-between border-b border-surface-200 bg-white px-3 sm:px-6 dark:border-surface-800 dark:bg-surface-950">
      {/* Left: Sidebar Toggle only */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="h-8 w-8 text-surface-600 hover:text-surface-900 dark:text-surface-300 dark:hover:text-surface-100"
          title={sidebarCollapsed ? t("nav.expand") : t("nav.collapse")}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Right */}
      <div className="flex items-center justify-end gap-2">
        {variant === "editor" && (
          <>
            <Button variant="ghost" size="sm" className="gap-1.5 text-surface-600 hover:text-surface-900 dark:text-surface-300 dark:hover:text-surface-100" onClick={onShare}>
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">{t("topbar.share")}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 text-surface-600 hover:text-surface-900 dark:text-surface-300 dark:hover:text-surface-100" onClick={onExport}>
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">{t("topbar.export")}</span>
            </Button>
          </>
        )}

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full py-1 pl-1.5 pr-2.5 text-sm transition-colors hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[10px] font-semibold text-white">
                  {initials}
                </div>
              )}
              <span className="hidden sm:inline max-w-[80px] truncate text-sm font-medium text-surface-700 dark:text-surface-200">
                {user?.name || "User"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-surface-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px]">
            {/* User info header */}
            {user && (
              <>
                <div className="flex items-center gap-3 px-3 py-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                      {initials}
                    </div>
                  )}
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium text-surface-900 dark:text-surface-100">
                      {user.name}
                    </span>
                    <span className="truncate text-xs text-surface-500">
                      {user.email}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
              </>
            )}

            {/* Theme toggle */}
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span>{theme === "light" ? t("nav.darkMode") : t("nav.lightMode")}</span>
            </DropdownMenuItem>

            {/* Language switch */}
            <DropdownMenuItem onClick={toggleLang}>
              <Languages className="h-4 w-4" />
              <span>{lang === "zh" ? "English" : "中文"}</span>
            </DropdownMenuItem>

            {/* Settings */}
            {onSettings && (
              <DropdownMenuItem onClick={onSettings}>
                <Settings className="h-4 w-4" />
                <span>{t("settings.title")}</span>
              </DropdownMenuItem>
            )}

            {/* Logout */}
            {onLogout && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("topbar.logout")}</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
