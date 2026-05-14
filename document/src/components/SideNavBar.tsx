import { cn } from "@/lib/utils";
import {
  FileText,
  Star,
  Trash2,
  Settings,
  Sun,
  Moon,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useI18n } from "@/components/I18nProvider";
import { useAuth } from "@/auth";

type NavId = "documents" | "favorites" | "trash" | "settings";

interface NavItem {
  id: NavId;
  labelKey: "nav.documents" | "nav.favorites" | "nav.trash" | "nav.settings";
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { id: "documents", labelKey: "nav.documents", icon: FileText },
  { id: "favorites", labelKey: "nav.favorites", icon: Star },
  { id: "trash", labelKey: "nav.trash", icon: Trash2 },
  { id: "settings", labelKey: "nav.settings", icon: Settings },
];

interface SideNavBarProps {
  activeNav: NavId;
  onNavChange: (id: NavId) => void;
  collapsed?: boolean;
}

export function SideNavBar({ activeNav, onNavChange, collapsed = false }: SideNavBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();

  const initials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const avatarUrl = user?.avatar
    ? `http://localhost:3000/uploads/${user.avatar}`
    : null;

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-surface-200 bg-surface-50 transition-all duration-300 dark:border-surface-800 dark:bg-surface-950",
        collapsed ? "w-[64px]" : "w-[240px]"
      )}
    >
      {/* Logo Area */}
      <div className={cn("pt-6 pb-4", collapsed ? "px-3" : "px-6")}>
        {collapsed ? (
          <div className="flex justify-center">
            <span className="text-lg font-bold text-brand-500">P</span>
          </div>
        ) : (
          <h1 className="text-lg font-bold tracking-tight text-surface-900 dark:text-surface-100">
            ProWriter
          </h1>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 py-2", collapsed ? "px-2" : "px-3")}>
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = item.id === activeNav;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavChange(item.id)}
                  title={collapsed ? t(item.labelKey) : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md text-sm font-medium cursor-pointer transition-all",
                    collapsed
                      ? "justify-center w-10 h-10 mx-auto"
                      : "w-full px-3 py-2",
                    isActive
                      ? "bg-surface-200 text-surface-900 dark:bg-surface-800 dark:text-surface-100"
                      : "text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span>{t(item.labelKey)}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-surface-200 dark:border-surface-800">
        {/* Theme Toggle */}
        <div className={cn("py-3", collapsed ? "px-2" : "px-4")}>
          <button
            onClick={toggleTheme}
            title={collapsed ? (theme === "light" ? t("nav.darkMode") : t("nav.lightMode")) : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-surface-900 cursor-pointer dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 transition-all",
              collapsed
                ? "justify-center w-10 h-10 mx-auto"
                : "w-full px-3 py-2"
            )}
          >
            {theme === "light" ? (
              <Moon className="h-[18px] w-[18px] shrink-0" />
            ) : (
              <Sun className="h-[18px] w-[18px] shrink-0" />
            )}
            {!collapsed && <span>{theme === "light" ? t("nav.darkMode") : t("nav.lightMode")}</span>}
          </button>
        </div>

        {/* User Profile - hidden when collapsed */}
        {!collapsed && (
          <div className="px-6 py-4 pt-1">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
                  {initials}
                </div>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-surface-900 dark:text-surface-100">
                  {user?.name || "..."}
                </span>
                <span className="truncate text-xs text-surface-500">
                  {user?.email || "..."}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
