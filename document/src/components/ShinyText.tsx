import { useRef, useEffect, useMemo } from "react";

interface ShinyTextProps {
  text: string;
  color?: string;
  shineColor?: string;
  speed?: number;
  delay?: number;
  spread?: number;
  yoyo?: boolean;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  disabled?: boolean;
  className?: string;
}

export function ShinyText({
  text,
  color,
  shineColor,
  speed = 2,
  delay = 0,
  spread = 120,
  yoyo = false,
  pauseOnHover = false,
  direction = "left",
  disabled = false,
  className,
}: ShinyTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  // Unique animation name to avoid collisions if multiple instances exist
  const animName = useMemo(
    () => `shiny-text-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  useEffect(() => {
    if (disabled) return;

    const el = ref.current;
    if (!el) return;

    const fromDir = direction === "left" ? "-100%" : "100%";
    const toDir = direction === "left" ? "100%" : "-100%";

    const animId = `${animName}-keyframes`;
    // Remove any existing style with this id (e.g. HMR)
    const existing = document.getElementById(animId);
    if (existing) existing.remove();

    const style = document.createElement("style");
    style.id = animId;
    style.textContent = `
      @keyframes ${animName} {
        0% { background-position: ${fromDir} center; }
        100% { background-position: ${toDir} center; }
      }
    `;
    document.head.appendChild(style);

    el.style.backgroundImage = `linear-gradient(${spread}deg, ${color || "inherit"}, ${shineColor || "#ffffff"} 40%, ${shineColor || "#ffffff"} 60%, ${color || "inherit"})`;
    el.style.backgroundSize = "200% 100%";
    el.style.backgroundClip = "text";
    el.style.webkitBackgroundClip = "text";
    el.style.webkitTextFillColor = "transparent";
    el.style.animationName = animName;
    el.style.animationDuration = `${speed}s`;
    el.style.animationDelay = `${delay}s`;
    el.style.animationTimingFunction = "linear";
    el.style.animationIterationCount = yoyo ? "1" : "infinite";
    if (yoyo) {
      el.style.animationDirection = "alternate";
      el.style.animationIterationCount = "2";
    }

    return () => {
      const s = document.getElementById(animId);
      if (s) s.remove();
    };
  }, [disabled, animName, color, shineColor, spread, speed, delay, yoyo, direction]);

  return (
    <span
      ref={ref}
      className={className}
      style={{
        color: disabled ? color : undefined,
        ...(pauseOnHover && !disabled
          ? { animationPlayState: "running" }
          : undefined),
      }}
      onMouseEnter={() => {
        if (pauseOnHover && !disabled && ref.current) {
          ref.current.style.animationPlayState = "paused";
        }
      }}
      onMouseLeave={() => {
        if (pauseOnHover && !disabled && ref.current) {
          ref.current.style.animationPlayState = "running";
        }
      }}
    >
      {text}
    </span>
  );
}
