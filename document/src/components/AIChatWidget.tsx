import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, X, Send, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/components/Toast";
import { useDocuments } from "@/store";
import { api } from "@/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAction {
  type: "create_document";
  title: string;
  content: string;
}

interface ChatResponse {
  reply: string;
  action: AIAction | null;
}

export function AIChatWidget() {
  const { toast } = useToast();
  const { createDocument } = useDocuments();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize position to bottom-right
  useEffect(() => {
    setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (open) return; // Don't drag when dialog open
    setDragging(true);
    hasMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { ...position };
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved.current = true;
      }
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 56, posStart.current.x + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 56, posStart.current.y + dy)),
      });
    };
    const handleMouseUp = () => {
      setDragging(false);
      if (!hasMoved.current) {
        setOpen(true);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, position]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.aiChat([...messages, userMsg]) as ChatResponse;

      const assistantMsg: Message = { role: "assistant", content: res.reply };
      setMessages((prev) => [...prev, assistantMsg]);

      // Handle action
      if (res.action?.type === "create_document") {
        const { title, content } = res.action;
        try {
          await createDocument("general", title, content);
          toast(`已创建文档: ${title}`, "success");
        } catch {
          toast("文档创建失败", "error");
        }
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: error.message || "AI service unavailable" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, createDocument, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        ref={btnRef}
        onMouseDown={handleMouseDown}
        className={cn(
          "fixed z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 select-none",
          open
            ? "opacity-0 pointer-events-none scale-75"
            : "opacity-100 scale-100",
          dragging
            ? "cursor-grabbing shadow-xl scale-105"
            : "cursor-grab hover:shadow-xl hover:scale-105",
          "bg-brand-500 text-white dark:bg-brand-600"
        )}
        style={{
          left: position.x,
          top: position.y,
          transition: dragging ? "none" : undefined,
        }}
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Chat dialog */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[400px] flex-col rounded-2xl border border-surface-200 bg-white shadow-2xl dark:border-surface-700 dark:bg-surface-900 animate-in fade-in-0 zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3 dark:border-surface-700">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900">
                <Bot className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">MythWriter AI</h3>
                <p className="text-[10px] text-surface-500">DeepSeek</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950">
                  <Sparkles className="h-6 w-6 text-brand-500" />
                </div>
                <p className="text-sm font-medium text-surface-700 dark:text-surface-300">你好，我是 MythWriter AI</p>
                <p className="mt-1 text-xs text-surface-500">我可以帮你写作、编辑、头脑风暴。试试说「帮我写一篇...」</p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "mb-3 flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                        msg.role === "user"
                          ? "bg-brand-500 text-white rounded-br-md"
                          : "bg-surface-100 text-surface-800 rounded-bl-md dark:bg-surface-800 dark:text-surface-200"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="mb-3 flex justify-start">
                    <div className="rounded-2xl rounded-bl-md bg-surface-100 px-4 py-3 dark:bg-surface-800">
                      <Loader2 className="h-4 w-4 animate-spin text-surface-400" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-surface-200 px-3 py-3 dark:border-surface-700">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息..."
                disabled={loading}
                className="flex-1 rounded-xl border border-surface-200 bg-surface-50 px-4 py-2 text-sm text-surface-900 outline-none transition-colors focus:border-brand-300 focus:ring-1 focus:ring-brand-300 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100 dark:focus:border-brand-700"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="h-9 w-9 shrink-0 rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
