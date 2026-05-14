import { useState, useEffect } from "react";
import { SideNavBar } from "@/components/SideNavBar";
import { TopAppBar } from "@/components/TopAppBar";
import { DocumentCard } from "@/components/DocumentCard";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { LoadingOverlay } from "@/components/LoadingSpinner";
import { WriterFlowChart } from "@/components/WriterFlowChart";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  FileText,
  Palette,
  Lightbulb,
  Target,
  Search,
  Plus,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { useDocuments } from "@/store";
import { useToast } from "@/components/Toast";
import { api } from "@/api";
import { categoryLabels, type DocumentCategory } from "@/types";
import type { NavId } from "@/App";

const iconByCategory: Record<DocumentCategory, LucideIcon> = {
  sciFi: BookOpen,
  fantasy: FileText,
  design: Palette,
  journal: Lightbulb,
  planning: Target,
  research: Search,
  general: FileText,
};

const colorByCategory: Record<DocumentCategory, string> = {
  sciFi: "bg-purple-100 text-purple-600",
  fantasy: "bg-blue-100 text-blue-600",
  design: "bg-amber-100 text-amber-600",
  journal: "bg-green-100 text-green-600",
  planning: "bg-red-100 text-red-600",
  research: "bg-cyan-100 text-cyan-600",
  general: "bg-brand-100 text-brand-600",
};

interface DocumentCenterPageProps {
  activeNav?: NavId;
  onNavChange?: (id: NavId) => void;
  onLogout?: () => void;
  onOpenDoc?: (id: string) => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function DocumentCenterPage({
  activeNav = "documents",
  onNavChange,
  onLogout,
  onOpenDoc,
  sidebarCollapsed = false,
  onToggleSidebar,
}: DocumentCenterPageProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { documents, favorites, loading, createDocument, moveToTrash } = useDocuments();
  const viewMode: "grid" | "list" = "grid";
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Weekly stats from API
  const [chartData, setChartData] = useState<{ days: string[]; words: number[] }>({
    days: [],
    words: [],
  });

  useEffect(() => {
    api.getWeeklyStats().then((res) => {
      setChartData({
        days: res.stats.map((s) => s.day),
        words: res.stats.map((s) => s.words),
      });
    }).catch(() => {});
  }, [documents]);

  const handleNewDocument = async (category?: DocumentCategory) => {
    setActionLoading(true);
    try {
      const newId = await createDocument(category || "general");
      toast(t("toast.newDocCreated"), "success");
      onOpenDoc?.(newId);
    } catch (error: any) {
      toast(error.message || t("toast.createFailed"), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      const doc = documents.find((d) => d.id === id);
      await moveToTrash(id);
      toast(`"${doc?.title}" ${t("toast.movedToTrash")}`, "info");
    } catch (error: any) {
      toast(error.message || t("toast.deleteFailed"), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const mainDocs = documents.filter((d) => !d.isFavorite);
  const favDocs = favorites;

  const getCategoryKey = (cat: DocumentCategory) => {
    const map: Record<DocumentCategory, "card.sciFi" | "card.fantasy" | "card.design" | "card.journal" | "card.planning" | "card.research"> = {
      sciFi: "card.sciFi", fantasy: "card.fantasy", design: "card.design",
      journal: "card.journal", planning: "card.planning", research: "card.research", general: "card.journal",
    };
    return map[cat];
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white dark:bg-surface-950 relative">
      {(loading || actionLoading) && <LoadingOverlay />}
      <TopAppBar
        variant="documents"
        onLogout={onLogout}
        onSettings={() => onNavChange?.("settings")}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
      />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar activeNav={activeNav} onNavChange={onNavChange ?? (() => {})} collapsed={sidebarCollapsed} />

        <div className="flex-1 overflow-y-auto bg-surface-50 dark:bg-surface-950">
          <div className="mx-auto max-w-[1200px] px-20 py-20">
            <div className="mb-10 flex items-start justify-between">
              <div>
                <h2 className="text-[32px] font-bold leading-tight text-surface-900 dark:text-surface-100">
                  {t("documents.myDocuments")}
                </h2>
                <p className="mt-2 text-sm text-surface-500">{t("documents.subtitle")}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="lg" className="gap-1 group">
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t("documents.newDocument")}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[220px]">
                  <DropdownMenuLabel>{t("documents.selectCategory")}</DropdownMenuLabel>
                  {(
                    Object.entries(categoryLabels) as [DocumentCategory, { zh: string; en: string }][]
                  ).map(([cat, label], idx) => {
                    const Icon = iconByCategory[cat];
                    const colorClass = colorByCategory[cat];
                    return (
                      <DropdownMenuItem key={cat} index={idx} onClick={() => handleNewDocument(cat)}>
                        <div className={`flex h-7 w-7 items-center justify-center rounded-md dropdown-item-icon ${colorClass.split(" ")[0]}`}>
                          <Icon className={`h-3.5 w-3.5 ${colorClass.split(" ")[1]}`} />
                        </div>
                        <span>{label.zh}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {favDocs.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">
                  {t("nav.favorites")} ({favDocs.length})
                </h3>
                <div className={viewMode === "grid" ? "grid grid-cols-4 gap-4" : "flex flex-col gap-2"}>
                  {favDocs.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      title={doc.title}
                      preview={doc.preview}
                      date={doc.updatedAt.slice(0, 10)}
                      categoryKey={getCategoryKey(doc.category)}
                      icon={iconByCategory[doc.category]}
                      iconBg={colorByCategory[doc.category]}
                      viewMode={viewMode}
                      onClick={() => onOpenDoc?.(doc.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className={viewMode === "grid" ? "grid grid-cols-4 gap-4" : "flex flex-col gap-2"}>
              {mainDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  title={doc.title}
                  preview={doc.preview}
                  date={doc.updatedAt.slice(0, 10)}
                  categoryKey={getCategoryKey(doc.category)}
                  icon={iconByCategory[doc.category]}
                  iconBg={colorByCategory[doc.category]}
                  viewMode={viewMode}
                  onClick={() => onOpenDoc?.(doc.id)}
                  onDelete={() => setDeleteTarget(doc.id)}
                />
              ))}
            </div>

            {/* Writer Flow Chart - Real Data */}
            {chartData.days.length > 0 && (
              <div className="mt-10 rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                    {t("documents.writersFlow")}
                  </h3>
                  <p className="mt-1 text-xs text-surface-500">{t("documents.activity")}</p>
                </div>
                <WriterFlowChart days={chartData.days} words={chartData.words} />
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("confirm.deleteTitle")}
        description={t("confirm.deleteDesc")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
