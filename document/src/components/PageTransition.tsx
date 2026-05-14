import { useEffect, useState, type ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  pageKey: string;
}

export function PageTransition({ children, pageKey }: PageTransitionProps) {
  const [currentKey, setCurrentKey] = useState(pageKey);
  const [isEntering, setIsEntering] = useState(false);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    if (pageKey !== currentKey) {
      setIsEntering(true);
      setShowContent(false);

      // After exit animation, switch content and play enter animation
      const exitTimer = setTimeout(() => {
        setCurrentKey(pageKey);
        setShowContent(true);
        // Small delay to let DOM update before enter animation
        requestAnimationFrame(() => {
          setIsEntering(false);
        });
      }, 200);

      return () => clearTimeout(exitTimer);
    } else {
      // Initial mount - play enter animation
      setIsEntering(false);
      setShowContent(true);
    }
  }, [pageKey, currentKey]);

  return (
    <div
      className="h-full w-full"
      style={{
        animation: isEntering
          ? "pageExit 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards"
          : showContent
            ? "pageEnter 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards"
            : "none",
      }}
    >
      {showContent ? children : null}
    </div>
  );
}
