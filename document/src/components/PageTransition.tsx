import { useEffect, useState, useRef, type ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  pageKey: string;
}

export function PageTransition({ children, pageKey }: PageTransitionProps) {
  const [state, setState] = useState<"enter" | "idle" | "exit">("enter");
  const prevKeyRef = useRef(pageKey);
  const childrenRef = useRef(children);

  // Always keep the latest children visible
  childrenRef.current = children;

  useEffect(() => {
    if (pageKey !== prevKeyRef.current) {
      // Start exit animation
      setState("exit");
      const timer = setTimeout(() => {
        prevKeyRef.current = pageKey;
        setState("enter");
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [pageKey]);

  return (
    <div
      className="h-full w-full"
      style={{
        animation:
          state === "enter"
            ? "pageEnter 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards"
            : state === "exit"
              ? "pageExit 0.18s cubic-bezier(0.4, 0, 0.2, 1) forwards"
              : "none",
      }}
    >
      {childrenRef.current}
    </div>
  );
}
