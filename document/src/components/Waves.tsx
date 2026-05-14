import { useRef, useEffect, useCallback } from "react";

interface Point {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
}

interface WavesProps {
  lineColor?: string;
  backgroundColor?: string;
  waveSpeedX?: number;
  waveSpeedY?: number;
  waveAmpX?: number;
  waveAmpY?: number;
  xGap?: number;
  yGap?: number;
  friction?: number;
  tension?: number;
  maxCursorMove?: number;
  className?: string;
}

export function Waves({
  lineColor = "#94a3b8",
  backgroundColor = "transparent",
  waveSpeedX = 0.0125,
  waveSpeedY = 0.005,
  waveAmpX = 32,
  waveAmpY = 16,
  xGap = 10,
  yGap = 32,
  friction = 0.925,
  tension = 0.005,
  maxCursorMove = 100,
  className,
}: WavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[][]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  const initPoints = useCallback(
    (width: number, height: number) => {
      const points: Point[][] = [];
      const yCount = Math.floor((height + yGap * 2) / yGap) + 2;
      const xCount = Math.floor(width / xGap) + 2;

      for (let yi = 0; yi < yCount; yi++) {
        const row: Point[] = [];
        const baseY = yi * yGap - yGap;
        for (let xi = 0; xi < xCount; xi++) {
          const x = xi * xGap;
          row.push({ x, y: baseY, originX: x, originY: baseY, vx: 0, vy: 0 });
        }
        points.push(row);
      }
      pointsRef.current = points;
    },
    [xGap, yGap]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement!;
    let width = parent.clientWidth;
    let height = parent.clientHeight;

    const resize = () => {
      width = parent.clientWidth;
      height = parent.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initPoints(width, height);
    };

    resize();
    window.addEventListener("resize", resize);

    let time = 0;

    const animate = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const rows = pointsRef.current;

      for (let yi = 0; yi < rows.length; yi++) {
        const row = rows[yi];
        for (let xi = 0; xi < row.length; xi++) {
          const p = row[xi];
          // Sine wave motion
          const targetY =
            p.originY +
            Math.sin(time * waveSpeedX + xi * 0.15) * waveAmpX +
            Math.cos(time * waveSpeedY + yi * 0.3) * waveAmpY;

          // Spring toward target
          p.vy += (targetY - p.y) * 0.02;

          // Mouse interaction
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const force = (1 - dist / 200) * maxCursorMove;
            const angle = Math.atan2(dy, dx);
            p.vx -= Math.cos(angle) * force * tension;
            p.vy -= Math.sin(angle) * force * tension;
          }

          // Apply velocities
          p.x += p.vx;
          p.y += p.vy;

          // Friction
          p.vx *= friction;
          p.vy *= friction;

          // Pull back to origin X
          p.vx += (p.originX - p.x) * tension * 2;
        }
      }

      // Draw waves
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;

      for (let yi = 0; yi < rows.length; yi++) {
        const row = rows[yi];
        ctx.beginPath();
        ctx.moveTo(row[0].x, row[0].y);
        for (let xi = 1; xi < row.length; xi++) {
          ctx.lineTo(row[xi].x, row[xi].y);
        }
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [
    lineColor,
    backgroundColor,
    waveSpeedX,
    waveSpeedY,
    waveAmpX,
    waveAmpY,
    friction,
    tension,
    maxCursorMove,
    initPoints,
  ]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("touchmove", handleTouch);
    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("touchmove", handleTouch);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", pointerEvents: "none" }}
    />
  );
}
