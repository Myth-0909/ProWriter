import { cn } from "@/lib/utils";
import { Pencil, Share2, Trash2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/I18nProvider";

interface DocumentCardProps {
  title: string;
  preview: string;
  date: string;
  categoryKey: "card.sciFi" | "card.fantasy" | "card.design" | "card.journal" | "card.planning" | "card.research";
  icon: LucideIcon;
  iconBg?: string;
  onClick?: () => void;
  onDelete?: () => void;
}

export function DocumentCard({
  title,
  preview,
  date,
  categoryKey,
  icon: Icon,
  iconBg = "bg-brand-100 text-brand-600",
  onClick,
  onDelete,
}: DocumentCardProps) {
  const { t } = useI18n();

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col rounded-xl border border-surface-200 bg-white p-5 transition-all duration-200",
        "dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700 dark:hover:shadow-lg dark:hover:shadow-surface-900/50",
        onClick ? "hover:shadow-md hover:border-surface-300 active:scale-[0.98] cursor-pointer" : ""
      )}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-surface-200 dark:bg-surface-700" />

      {/* Header: Icon + Category */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconBg)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-surface-400">
          {t(categoryKey)}
        </span>
      </div>

      {/* Title */}
      <h4 className="mb-2 text-sm font-semibold leading-tight text-surface-900 dark:text-surface-100">
        {title}
      </h4>

      {/* Preview */}
      <p className="mb-4 flex-1 text-xs leading-relaxed text-surface-500 line-clamp-3">
        {preview}
      </p>

      {/* Footer: Date + Actions */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-surface-400">{date}</span>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6"
            title={t("card.edit")}
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6"
            title={t("card.share")}
            onClick={(e) => e.stopPropagation()}
          >
            <Share2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6 hover:text-red-500"
            title={t("card.delete")}
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
