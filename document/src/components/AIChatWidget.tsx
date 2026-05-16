import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, X, Send, Loader2, Sparkles, Smile, ChevronDown } from "lucide-react";
import { useToast } from "@/components/Toast";
import { useDocuments } from "@/store";
import { useAuth } from "@/auth";
import { api } from "@/api";

type Personality = "normal" | "cute" | "catgirl" | "serious" | "silly";

const VALID_PERSONALITIES: Personality[] = ["normal", "cute", "catgirl", "serious", "silly"];

function safePersonality(raw: string | null): Personality {
  if (raw && VALID_PERSONALITIES.includes(raw as Personality)) {
    return raw as Personality;
  }
  return "normal";
}

const PERSONALITY_OPTIONS: { key: Personality; label: string; emoji: string }[] = [
  { key: "normal", label: "正常", emoji: "✨" },
  { key: "cute", label: "可爱", emoji: "🌸" },
  { key: "catgirl", label: "猫娘", emoji: "🐱" },
  { key: "serious", label: "严肃", emoji: "📋" },
  { key: "silly", label: "搞怪", emoji: "🤪" },
];

const MEMORY_KEY = "mythwriter_ai_memory";
const MAX_MEMORY_MESSAGES = 20;

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Long-term memory helpers
function loadMemory(): Message[] {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMemory(messages: Message[]) {
  const recent = messages.slice(-MAX_MEMORY_MESSAGES);
  localStorage.setItem(MEMORY_KEY, JSON.stringify(recent));
}

function buildMemoryContext(memory: Message[]): string {
  if (memory.length === 0) return "";
  const lines = memory.map((m) => {
    const role = m.role === "user" ? "用户" : "助手";
    return `${role}: ${m.content.slice(0, 200)}`;
  });
  return lines.join("\n");
}

export function AIChatWidget() {
  const { toast } = useToast();
  const { createDocument } = useDocuments();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [personality, setPersonality] = useState<Personality>(() =>
    safePersonality(localStorage.getItem("mythwriter_ai_personality"))
  );
  const [personalityOpen, setPersonalityOpen] = useState(false);
  const memoryRef = useRef<Message[]>(loadMemory());
  const greetedRef = useRef(false);

  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  }, []);

  // Send proactive greeting as real message when opening chat
  useEffect(() => {
    if (open && !greetedRef.current) {
      greetedRef.current = true;
      api.aiGreeting({
        userName: user?.name || "",
        personality,
      }).then((res) => {
        setMessages([{ role: "assistant", content: res.greeting }]);
        memoryRef.current = [{ role: "assistant", content: res.greeting }];
        saveMemory(memoryRef.current);
      }).catch(() => {
        setMessages([{ role: "assistant", content: "您好！我是麦斯助手，请问有什么可以帮您的？" }]);
      });
    }
    if (!open) {
      greetedRef.current = false;
      setMessages([]);
    }
  }, [open, personality, user?.name]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save personality preference
  useEffect(() => {
    localStorage.setItem("mythwriter_ai_personality", personality);
  }, [personality]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (open) return;
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
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 56, posStart.current.x + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 56, posStart.current.y + dy)),
      });
    };
    const handleMouseUp = () => {
      setDragging(false);
      if (!hasMoved.current) setOpen(true);
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
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    const memory = [...memoryRef.current, userMsg];
    memoryRef.current = memory;

    try {
      const memoryContext = buildMemoryContext(memory);
      const res = await api.aiChat({
        messages: updatedMessages,
        personality,
        memoryContext,
      });

      const assistantMsg: Message = { role: "assistant", content: res.reply };
      setMessages((prev) => [...prev, assistantMsg]);
      memoryRef.current = [...memory, assistantMsg];
      saveMemory(memoryRef.current);

      if (res.action?.type === "create_document" && res.action.content) {
        const { title, content } = res.action;
        try {
          await createDocument("general", title, content);
          toast(`已创建文档: ${title}`, "success");
        } catch {
          toast("文档创建失败", "error");
        }
      }
    } catch (error: any) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: error.message || "AI service unavailable",
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, personality, createDocument, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentPersonality = PERSONALITY_OPTIONS.find((p) => p.key === personality) || PERSONALITY_OPTIONS[0];

  return (
    <>
      {/* Floating button */}
      <button
        onMouseDown={handleMouseDown}
        className={cn(
          "fixed z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 select-none",
          open ? "opacity-0 pointer-events-none scale-75" : "opacity-100 scale-100",
          dragging ? "cursor-grabbing shadow-xl scale-105" : "cursor-grab hover:shadow-xl hover:scale-105",
          "bg-brand-500 text-white dark:bg-brand-600"
        )}
        style={{ left: position.x, top: position.y, transition: dragging ? "none" : undefined }}
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Chat dialog */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[560px] w-[420px] flex-col rounded-2xl border border-surface-200 bg-white shadow-2xl dark:border-surface-700 dark:bg-surface-900">
          {/* Header */}
          <div className="shrink-0 border-b border-surface-200 px-4 py-3 dark:border-surface-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900">
                  <Bot className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">麦斯助手</h3>
                  <p className="text-[10px] text-surface-500">DeepSeek · {currentPersonality.label}模式</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Personality selector */}
            <div className="relative">
              <button
                onClick={() => setPersonalityOpen(!personalityOpen)}
                className="flex items-center gap-1.5 rounded-lg border border-surface-200 bg-surface-50 px-2.5 py-1 text-xs text-surface-600 hover:bg-surface-100 transition-colors dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700"
              >
                <Smile className="h-3 w-3" />
                <span>{currentPersonality.emoji} {currentPersonality.label}</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform", personalityOpen && "rotate-180")} />
              </button>

              {personalityOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setPersonalityOpen(false)} />
                  <div className="absolute left-0 top-full mt-1 z-20 w-36 rounded-lg border border-surface-200 bg-white py-1 shadow-lg dark:border-surface-700 dark:bg-surface-900">
                    {PERSONALITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => { setPersonality(opt.key); setPersonalityOpen(false); }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-surface-50 dark:hover:bg-surface-800",
                          personality === opt.key
                            ? "text-brand-600 font-medium bg-brand-50 dark:text-brand-400 dark:bg-brand-950"
                            : "text-surface-600 dark:text-surface-400"
                        )}
                      >
                        <span>{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center px-4">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950">
                  <Sparkles className="h-6 w-6 text-brand-500" />
                </div>
                <p className="text-sm font-medium text-surface-700 dark:text-surface-300">你好，我是麦斯助手</p>
                <p className="mt-1 text-xs text-surface-500">我可以帮你写作、编辑、头脑风暴。试试说「帮我写一篇...」</p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={cn("mb-3 flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-brand-500 text-white rounded-br-md"
                        : "bg-surface-100 text-surface-800 rounded-bl-md dark:bg-surface-800 dark:text-surface-200"
                    )}>
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
          <div className="shrink-0 border-t border-surface-200 px-3 py-3 dark:border-surface-700">
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
