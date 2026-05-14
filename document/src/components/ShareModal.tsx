import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, FileType, Code2, Copy, Check, Link2 } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { useToast } from "@/components/Toast";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const exportFormats = [
  { id: "pdf", label: "PDF", descKey: "share.pdfDesc" as const, icon: FileText, iconColor: "text-red-600 dark:text-red-400", iconBg: "bg-red-50 dark:bg-red-950" },
  { id: "word", label: "Word", descKey: "share.wordDesc" as const, icon: FileType, iconColor: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-50 dark:bg-blue-950" },
  { id: "markdown", label: "Markdown", descKey: "share.mdDesc" as const, icon: Code2, iconColor: "text-purple-600 dark:text-purple-400", iconBg: "bg-purple-50 dark:bg-purple-950" },
] as const;

export function ShareModal({ open, onOpenChange }: ShareModalProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("https://prowriter.app/doc/shared/abc123");
    setCopied(true);
    toast(t("toast.copySuccess"), "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] px-6 py-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg">{t("share.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-surface-400 mb-4">
              {t("share.exportDocument")}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-surface-200 bg-white p-4 text-center transition-all duration-200 hover:border-surface-400 hover:shadow-sm active:scale-[0.97] cursor-pointer dark:border-surface-700 dark:bg-surface-900 dark:hover:border-surface-500"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${format.iconBg} transition-transform duration-200 group-hover:scale-110`}>
                    <format.icon className={`h-6 w-6 ${format.iconColor}`} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-surface-800 dark:text-surface-200">{format.label}</span>
                    <span className="text-[10px] text-surface-400 leading-tight">{t(format.descKey)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-surface-200 bg-surface-50/50 p-4 dark:border-surface-700 dark:bg-surface-900/50">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-surface-400 mb-3">
              {t("share.shareLink")}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-surface-200 bg-white px-3 py-2 dark:border-surface-700 dark:bg-surface-900">
                <Link2 className="h-4 w-4 shrink-0 text-surface-400" />
                <span className="flex-1 truncate text-sm text-surface-700 dark:text-surface-300">
                  https://prowriter.app/doc/shared/abc123
                </span>
              </div>
              <Button variant={copied ? "secondary" : "default"} size="sm" onClick={handleCopy} className="shrink-0 gap-1.5 h-9">
                {copied ? (
                  <><Check className="h-3.5 w-3.5" /><span className="text-xs">{t("common.copied")}</span></>
                ) : (
                  <><Copy className="h-3.5 w-3.5" /><span className="text-xs">{t("share.copyLink")}</span></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
