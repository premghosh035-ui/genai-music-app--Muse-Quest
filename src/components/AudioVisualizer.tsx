import React, { useRef, useEffect } from "react";

interface AudioVisualizerProps {
  isPlaying: boolean;
  coverGradient: string;
  intensity?: number; // 0-100 indicating active vibe
}

export default function AudioVisualizer({ isPlaying, coverGradient, intensity = 50 }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Parse color indicators from cover gradient
  const getGradientColors = () => {
    if (coverGradient.includes("pink")) return ["#ec4899", "#8b5cf6", "#3b82f6"];
    if (coverGradient.includes("cyan")) return ["#22d3ee", "#14b8a6", "#1e3a8a"];
    if (coverGradient.includes("emerald")) return ["#10b981", "#059669", "#111827"];
    if (coverGradient.includes("amber")) return ["#b45309", "#e11d48", "#1c1917"];
    return ["#a855f7", "#ec4899", "#3b82f6"]; // default vibrant
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const barCount = 14;
    const barWidth = width / barCount - 3;
    const barHeights = Array(barCount).fill(5);
    const targetHeights = Array(barCount).fill(5);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    const colors = getGradientColors();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Create beautiful canvas gradient
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, colors[1]);
      gradient.addColorStop(1, colors[0]);

      for (let i = 0; i < barCount; i++) {
        if (isPlaying) {
          // Calculate random fluid target height based on intensity
          if (Math.random() > 0.6) {
            const factor = intensity / 100;
            targetHeights[i] = Math.random() * (height - 8) * factor + 6;
          }
        } else {
          // Flat silent state with mild static breath
          targetHeights[i] = 4 + Math.sin(Date.now() * 0.004 + i) * 2;
        }

        // Smooth height transition
        barHeights[i] += (targetHeights[i] - barHeights[i]) * 0.18;

        const x = i * (barWidth + 3) + 1.5;
        const h = barHeights[i];
        const y = height - h;

        // Draw pill-shaped bar
        ctx.fillStyle = gradient;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, h, 3);
        } else {
          ctx.rect(x, y, barWidth, h);
        }
        ctx.fill();
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, coverGradient, intensity]);

  return (
    <div id="visualizer_container" className="w-full h-12 bg-neutral-900/60 rounded-xl px-2 py-1.5 flex flex-col justify-end border border-white/5 relative overflow-hidden backdrop-blur-sm">
      <div className="absolute top-1 left-2 flex items-center gap-1.5 pointer-events-none">
        <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-emerald-500 animate-pulse" : "bg-neutral-600"}`} />
        <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">Sonic Waveform Live</span>
      </div>
      <canvas ref={canvasRef} className="w-full h-7 block" />
    </div>
  );
}
