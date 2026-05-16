import { useState, useEffect, useRef } from "react";
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
  Upload,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import mammoth from "mammoth";
import { marked } from "marked";
import { useI18n } from "@/components/I18nProvider";
import { useDocuments } from "@/store";
import { useToast } from "@/components/Toast";
import { api } from "@/api";
import { categoryLabels, type DocumentCategory } from "@/types";

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

interface DocumentCenterPageProps {
  onOpenDoc?: (id: string) => void;
}

export function DocumentCenterPage({ onOpenDoc }: DocumentCenterPageProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { documents, favorites, loading, createDocument, moveToTrash } = useDocuments();
  const viewMode: "grid" | "list" = "grid";
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["txt", "md", "docx"].includes(ext)) {
      toast(t("toast.importUnsupported"), "error");
      return;
    }

    setImporting(true);
    try {
      let content = "";
      const title = file.name.replace(/\.[^.]+$/, "");

      if (ext === "docx") {
        // Use convertToHtml to preserve formatting (bold, italic, headings, etc.)
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        content = result.value;
      } else {
        const raw = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        if (ext === "md") {
          // Convert markdown to HTML
          content = await marked.parse(raw);
        } else {
          // TXT: convert plain text with line breaks to HTML paragraphs
          content = raw
            .split(/\n\n+/)
            .map((p) => `<p>${p.replace(/\n/g, "<br>").trim() || "&#8203;"}</p>`)
            .join("");
        }
      }

      const newId = await createDocument("general", title, content);
      toast(t("toast.importSuccess"), "success");
      onOpenDoc?.(newId);
    } catch (error: any) {
      toast(error.message || t("toast.importFailed"), "error");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
    <div className="flex-1 overflow-y-auto bg-surface-50 dark:bg-surface-950 relative">
      {(loading || actionLoading) && <LoadingOverlay />}
      <div className="mx-auto max-w-[1200px] px-20 py-20">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h2 className="text-[32px] font-bold leading-tight text-surface-900 dark:text-surface-100">
              {t("documents.myDocuments")}
            </h2>
            <p className="mt-2 text-sm text-surface-500">{t("documents.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Import button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.docx"
              className="hidden"
              onChange={handleImport}
            />
            <Button
              variant="outline"
              size="lg"
              className="gap-1.5"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              {importing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              <span>{t("documents.import")}</span>
            </Button>

            {/* New document button */}
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
                  onDelete={() => setDeleteTarget(doc.id)}
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
