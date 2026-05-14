import { SideNavBar } from "@/components/SideNavBar";
import { TopAppBar } from "@/components/TopAppBar";
import { DocumentCard } from "@/components/DocumentCard";
import { useDocuments } from "@/store";
import { useI18n } from "@/components/I18nProvider";
import {
  BookOpen, FileText, Palette, Lightbulb, Target, Search, Star,
  type LucideIcon,
} from "lucide-react";
import type { DocumentCategory } from "@/types";
import type { NavId } from "@/App";

const iconByCategory: Record<DocumentCategory, LucideIcon> = {
  sciFi: BookOpen, fantasy: FileText, design: Palette,
  journal: Lightbulb, planning: Target, research: Search, general: FileText,
};

const colorByCategory: Record<DocumentCategory, string> = {
  sciFi: "bg-purple-100 text-purple-600", fantasy: "bg-blue-100 text-blue-600",
  design: "bg-amber-100 text-amber-600", journal: "bg-green-100 text-green-600",
  planning: "bg-red-100 text-red-600", research: "bg-cyan-100 text-cyan-600",
  general: "bg-brand-100 text-brand-600",
};

interface FavoritesPageProps {
  activeNav?: NavId;
  onNavChange?: (id: NavId) => void;
  onLogout?: () => void;
  onOpenDoc?: (id: string) => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function FavoritesPage({ activeNav = "favorites", onNavChange, onLogout, onOpenDoc, sidebarCollapsed = false, onToggleSidebar }: FavoritesPageProps) {
  const { t } = useI18n();
  const { favorites } = useDocuments();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white dark:bg-surface-950">
      <TopAppBar variant="documents" onLogout={onLogout} onSettings={() => onNavChange?.("settings")} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={onToggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <SideNavBar activeNav={activeNav} onNavChange={onNavChange ?? (() => {})} collapsed={sidebarCollapsed} />
        <div className="flex-1 overflow-y-auto bg-surface-50 dark:bg-surface-950">
          <div className="mx-auto max-w-[1200px] px-20 py-20">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <Star className="h-6 w-6 text-amber-500" fill="currentColor" />
                <h2 className="text-[28px] font-bold leading-tight text-surface-900 dark:text-surface-100">
                  {t("nav.favorites")}
                </h2>
              </div>
              <p className="text-sm text-surface-500">
                {favorites.length > 0 ? `${favorites.length} ${t("favorites.subtitle")}` : t("favorites.emptyDesc")}
              </p>
            </div>

            {favorites.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {favorites.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    title={doc.title}
                    preview={doc.preview}
                    date={doc.updatedAt.slice(0, 10)}
                    categoryKey={doc.category === "general" ? "card.journal" : `card.${doc.category}` as "card.sciFi"}
                    icon={iconByCategory[doc.category]}
                    iconBg={colorByCategory[doc.category]}
                    onClick={() => onOpenDoc?.(doc.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100 dark:bg-surface-800">
                  <Star className="h-8 w-8 text-surface-300 dark:text-surface-600" />
                </div>
                <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300">{t("favorites.empty")}</h3>
                <p className="mt-1 text-sm text-surface-400">{t("favorites.emptyDesc")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
