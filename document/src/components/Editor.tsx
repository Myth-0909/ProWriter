import { useState, useRef, useEffect, useCallback } from "react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
} from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { useDocuments } from "@/store";

interface EditorProps {
  documentId?: string;
}

export function Editor({ documentId }: EditorProps) {
  const { t } = useI18n();
  const { getDocument, updateDocument } = useDocuments();
  const doc = documentId ? getDocument(documentId) : undefined;

  const [title, setTitle] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved">("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load document content when switching
  useEffect(() => {
    if (doc) {
      setTitle(doc.title);
      if (editorRef.current) {
        editorRef.current.innerHTML = doc.content;
      }
      updateCounts();
    }
  }, [documentId]);

  // Auto-save: debounced save on title or content change
  const autoSave = useCallback(() => {
    if (!documentId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    setSaveStatus("saving");
    saveTimerRef.current = setTimeout(() => {
      const content = editorRef.current?.innerHTML ?? "";
      updateDocument(documentId, { title, content });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 1500);
    }, 1500);
  }, [documentId, title, updateDocument]);

  // Trigger auto-save on title change
  useEffect(() => {
    if (title) autoSave();
  }, [title]);

  const updateCounts = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const text = editor.innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);
  }, []);

  const checkFormatState = useCallback(() => {
    const formats = new Set<string>();
    if (document.queryCommandState("bold")) formats.add("bold");
    if (document.queryCommandState("italic")) formats.add("italic");
    if (document.queryCommandState("underline")) formats.add("underline");
    if (document.queryCommandState("strikeThrough")) formats.add("strikeThrough");
    setActiveFormats(formats);
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.addEventListener("input", () => {
      updateCounts();
      autoSave();
    });
    document.addEventListener("selectionchange", checkFormatState);
    return () => {
      editor.removeEventListener("input", updateCounts);
      document.removeEventListener("selectionchange", checkFormatState);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [updateCounts, checkFormatState, autoSave]);

  const execCommand = (command: string) => {
    document.execCommand(command);
    editorRef.current?.focus();
    checkFormatState();
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editorRef.current?.focus();
    }
  };

  const toolbarGroups = [
    {
      buttons: [
        { command: "bold", icon: Bold, label: t("editor.bold") },
        { command: "italic", icon: Italic, label: t("editor.italic") },
        { command: "underline", icon: Underline, label: t("editor.underline") },
        { command: "strikeThrough", icon: Strikethrough, label: t("editor.strikethrough") },
      ],
    },
    {
      buttons: [
        { command: "insertUnorderedList", icon: List, label: t("editor.bulletList") },
        { command: "insertOrderedList", icon: ListOrdered, label: t("editor.orderedList") },
      ],
    },
  ];

  return (
    <div className="flex h-full flex-col bg-white dark:bg-surface-950">
      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 border-b border-surface-200 px-6 py-2 dark:border-surface-800">
        {toolbarGroups.map((group, gi) => (
          <div key={gi} className="flex items-center gap-1">
            {gi > 0 && <Separator orientation="vertical" className="mx-1 h-4" />}
            {group.buttons.map((btn) => (
              <Toggle
                key={btn.command}
                size="sm"
                pressed={activeFormats.has(btn.command)}
                onPressedChange={() => execCommand(btn.command)}
                aria-label={btn.label}
              >
                <btn.icon className="h-3.5 w-3.5" />
              </Toggle>
            ))}
          </div>
        ))}
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[720px] px-12 py-12">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            className="title-input mb-8 text-surface-900 dark:text-surface-100"
            placeholder={t("editor.untitled")}
          />

          <div
            ref={editorRef}
            className="prose-editor min-h-[500px] text-surface-800 dark:text-surface-200"
            contentEditable
            suppressContentEditableWarning
            data-placeholder={t("editor.placeholder")}
          />
        </div>
      </div>

      {/* Footer: Save Status + Word Count */}
      <div className="flex items-center justify-between border-t border-surface-200 px-6 py-2 dark:border-surface-800">
        {/* Auto-save indicator */}
        <div className="text-xs text-surface-400">
          {saveStatus === "saving" && t("editor.saving")}
          {saveStatus === "saved" && (
            <span className="text-green-500">{t("editor.saved")}</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-surface-500">
            <span className="flex h-2 w-2 rounded-full bg-green-400" />
            <span>{wordCount} {t("editor.words")}</span>
          </div>
          <span className="text-xs text-surface-400">{charCount} {t("editor.characters")}</span>
        </div>
      </div>
    </div>
  );
}
