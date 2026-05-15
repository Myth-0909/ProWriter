import { useRef, useEffect, useCallback } from "react";

interface ParticleData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface ParticlesProps {
  particleCount?: number;
  particleColor?: string;
  lineColor?: string;
  particleRadius?: number;
  lineWidth?: number;
  connectDistance?: number;
  moveSpeed?: number;
  mouseRadius?: number;
  mouseForce?: number;
  className?: string;
}

export function Particles({
  particleCount = 80,
  particleColor = "#3b82f6",
  lineColor = "#3b82f6",
  particleRadius = 2,
  lineWidth = 0.6,
  connectDistance = 140,
  moveSpeed = 0.4,
  mouseRadius = 180,
  mouseForce = 0.4,
  className,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ParticleData[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  const initParticles = useCallback(
    (width: number, height: number) => {
      const particles: ParticleData[] = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * moveSpeed,
          vy: (Math.random() - 0.5) * moveSpeed,
          radius: particleRadius * (0.5 + Math.random()),
        });
      }
      particlesRef.current = particles;
    },
    [particleCount, moveSpeed, particleRadius]
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
      initParticles(width, height);
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse interaction
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRadius) {
          const force = (1 - dist / mouseRadius) * mouseForce;
          p.vx -= (dx / dist) * force;
          p.vy -= (dy / dist) * force;
        }

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Damping
        p.vx *= 0.999;
        p.vy *= 0.999;

        // Wrap around edges
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Ensure minimum velocity
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed < moveSpeed * 0.3) {
          p.vx += (Math.random() - 0.5) * 0.02;
          p.vy += (Math.random() - 0.5) * 0.02;
        }
        if (speed > moveSpeed * 2) {
          p.vx *= 0.95;
          p.vy *= 0.95;
        }

        // Draw particle as a soft dot
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
        gradient.addColorStop(0, particleColor);
        gradient.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw connections
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectDistance) {
            const alpha = 1 - dist / connectDistance;
            ctx.globalAlpha = alpha * 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // Draw mouse glow
      if (mx > -500 && my > -500) {
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, mouseRadius * 0.5);
        glow.addColorStop(0, particleColor + "15");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.fillRect(mx - mouseRadius * 0.5, my - mouseRadius * 0.5, mouseRadius, mouseRadius);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [particleColor, lineColor, lineWidth, connectDistance, moveSpeed, mouseRadius, mouseForce, initParticles]);

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
      style={{ display: "block" }}
    />
  );
}
