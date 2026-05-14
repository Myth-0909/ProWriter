import { Search, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/I18nProvider";
import { useDocuments } from "@/store";
import { useToast } from "@/components/Toast";

interface DocumentListProps {
  activeId?: string;
  onSelect?: (id: string) => void;
}

export function DocumentList({ activeId = "1", onSelect }: DocumentListProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { documents, toggleFavorite, moveToTrash } = useDocuments();
  const isActive = (id: string) => id === activeId;

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleFavorite(id);
    const doc = documents.find((d) => d.id === id);
    toast(doc?.isFavorite ? t("toast.favRemoved") : t("toast.favAdded"), "success");
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    moveToTrash(id);
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      toast(`"${doc.title}" ${t("toast.movedToTrash")}`, "info");
    }
  };

  return (
    <div className="flex h-full w-[320px] shrink-0 flex-col border-r border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-950">
      <div className="border-b border-surface-200 px-4 py-4 dark:border-surface-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder={t("editor.searchDocs")}
            className="w-full rounded-md border border-surface-200 bg-surface-50 py-2 pl-9 pr-3 text-sm text-surface-900 placeholder:text-surface-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-surface-300 focus:border-transparent dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="flex flex-col gap-1">
          {documents.map((doc) => {
            const active = isActive(doc.id);
            return (
              <button
                key={doc.id}
                onClick={() => onSelect?.(doc.id)}
                className={cn(
                  "group flex flex-col gap-1 rounded-lg px-4 py-3 text-left transition-colors cursor-pointer",
                  active
                    ? "bg-surface-100 shadow-sm dark:bg-surface-800"
                    : "hover:bg-surface-50 dark:hover:bg-surface-900"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className={cn(
                    "text-sm font-medium truncate",
                    active ? "text-surface-900 dark:text-surface-100" : "text-surface-700 dark:text-surface-300"
                  )}>
                    {doc.title}
                  </h3>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <span
                      onClick={(e) => handleToggleFavorite(e, doc.id)}
                      className={cn(
                        "p-0.5 rounded hover:bg-surface-200 cursor-pointer transition-colors dark:hover:bg-surface-700",
                        doc.isFavorite ? "text-amber-500" : "text-surface-400"
                      )}
                    >
                      <Star className="h-3.5 w-3.5" fill={doc.isFavorite ? "currentColor" : "none"} />
                    </span>
                    <span
                      onClick={(e) => handleDelete(e, doc.id)}
                      className="p-0.5 rounded hover:bg-red-100 text-surface-400 hover:text-red-500 cursor-pointer transition-colors dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
                <p className="line-clamp-2 text-xs leading-relaxed text-surface-500">{doc.preview}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
