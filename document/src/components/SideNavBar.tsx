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
}

export function SideNavBar({ activeNav, onNavChange }: SideNavBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-950">
      {/* Logo Area */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-bold tracking-tight text-surface-900 dark:text-surface-100">
            ProWriter
          </h1>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-500">
            Premium
          </span>
        </div>
      </div>

      {/* Navigation - no animation on click */}
      <nav className="flex-1 px-3 py-2">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = item.id === activeNav;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavChange(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium cursor-pointer",
                    isActive
                      ? "bg-surface-200 text-surface-900 dark:bg-surface-800 dark:text-surface-100"
                      : "text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <span>{t(item.labelKey)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-surface-200 dark:border-surface-800">
        {/* Theme Toggle */}
        <div className="px-4 py-3">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-surface-900 cursor-pointer dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200"
          >
            {theme === "light" ? (
              <Moon className="h-[18px] w-[18px] shrink-0" />
            ) : (
              <Sun className="h-[18px] w-[18px] shrink-0" />
            )}
            <span>{theme === "light" ? t("nav.darkMode") : t("nav.lightMode")}</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="px-6 py-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
              JD
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-surface-900 dark:text-surface-100">
                John Doe
              </span>
              <span className="truncate text-xs text-surface-500">john@example.com</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
