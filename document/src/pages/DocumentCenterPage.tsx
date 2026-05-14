import { useState, useMemo } from "react";
import { SideNavBar } from "@/components/SideNavBar";
import { TopAppBar } from "@/components/TopAppBar";
import { DocumentCard } from "@/components/DocumentCard";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { LoadingOverlay } from "@/components/LoadingSpinner";
import { WriterFlowChart } from "@/components/WriterFlowChart";
import {
  BookOpen,
  FileText,
  Palette,
  Lightbulb,
  Target,
  Search,
  Plus,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { useDocuments } from "@/store";
import { useToast } from "@/components/Toast";
import type { DocumentCategory } from "@/types";
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
}

export function DocumentCenterPage({
  activeNav = "documents",
  onNavChange,
  onLogout,
  onOpenDoc,
}: DocumentCenterPageProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { documents, favorites, createDocument, moveToTrash } = useDocuments();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleNewDocument = () => {
    setLoading(true);
    setTimeout(() => {
      const newId = createDocument();
      setLoading(false);
      toast(t("toast.newDocCreated"), "success");
      onOpenDoc?.(newId);
    }, 500);
  };

  const handleDelete = (id: string) => {
    setLoading(true);
    setTimeout(() => {
      moveToTrash(id);
      setLoading(false);
      const doc = documents.find((d) => d.id === id);
      toast(`"${doc?.title}" ${t("toast.movedToTrash")}`, "info");
    }, 400);
  };

  const mainDocs = documents.filter((d) => !d.isFavorite);
  const favDocs = favorites;

  const chartData = useMemo(() => ({
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    words: [1200, 800, 2400, 500, 1800, 950, 600],
  }), []);

  const getCategoryKey = (cat: DocumentCategory) => {
    const map: Record<DocumentCategory, "card.sciFi" | "card.fantasy" | "card.design" | "card.journal" | "card.planning" | "card.research"> = {
      sciFi: "card.sciFi", fantasy: "card.fantasy", design: "card.design",
      journal: "card.journal", planning: "card.planning", research: "card.research", general: "card.journal",
    };
    return map[cat];
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white dark:bg-surface-950 relative">
      {loading && <LoadingOverlay />}
      <TopAppBar
        variant="documents"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onLogout={onLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar activeNav={activeNav} onNavChange={onNavChange ?? (() => {})} />

        <div className="flex-1 overflow-y-auto bg-surface-50 dark:bg-surface-950">
          <div className="mx-auto max-w-[1200px] px-20 py-20">
            <div className="mb-10 flex items-start justify-between">
              <div>
                <h2 className="text-[32px] font-bold leading-tight text-surface-900 dark:text-surface-100">
                  {t("documents.myDocuments")}
                </h2>
                <p className="mt-2 text-sm text-surface-500">{t("documents.subtitle")}</p>
              </div>
              <Button size="lg" className="gap-2" onClick={handleNewDocument}>
                <Plus className="h-3.5 w-3.5" />
                <span>{t("documents.newDocument")}</span>
              </Button>
            </div>

            {favDocs.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">
                  {t("nav.favorites")} ({favDocs.length})
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {favDocs.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      title={doc.title}
                      preview={doc.preview}
                      date={doc.updatedAt.slice(0, 10)}
                      categoryKey={getCategoryKey(doc.category)}
                      icon={iconByCategory[doc.category]}
                      iconBg={colorByCategory[doc.category]}
                      onClick={() => onOpenDoc?.(doc.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-10 grid grid-cols-4 gap-4">
              {mainDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  title={doc.title}
                  preview={doc.preview}
                  date={doc.updatedAt.slice(0, 10)}
                  categoryKey={getCategoryKey(doc.category)}
                  icon={iconByCategory[doc.category]}
                  iconBg={colorByCategory[doc.category]}
                  onClick={() => onOpenDoc?.(doc.id)}
                  onDelete={() => setDeleteTarget(doc.id)}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                    {t("documents.writersFlow")}
                  </h3>
                  <p className="mt-1 text-xs text-surface-500">{t("documents.activity")}</p>
                </div>
                <WriterFlowChart days={chartData.days} words={chartData.words} />
              </div>

              <div className="flex flex-col justify-center rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
                <div className="mb-3"><Zap className="h-5 w-5 text-amber-500" /></div>
                <h3 className="mb-2 text-sm font-semibold text-surface-900 dark:text-surface-100">{t("documents.upgrade")}</h3>
                <p className="mb-4 text-xs leading-relaxed text-surface-500">{t("documents.upgradeDesc")}</p>
                <Button variant="default" className="w-full" size="sm">{t("documents.upgradeNow")}</Button>
              </div>
            </div>
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
