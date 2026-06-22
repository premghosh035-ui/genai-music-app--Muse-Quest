import React from "react";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  withGlow?: boolean;
}

export default function BrandLogo({
  className = "",
  size = "md",
  showText = true,
  withGlow = true
}: BrandLogoProps) {
  // Determine standard size dimensions
  const dims = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-40 h-40"
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Brand Logo Icon */}
      <div className={`relative ${dims} ${withGlow ? "drop-shadow-[0_0_12px_rgba(234,179,8,0.35)]" : ""}`}>
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Metadata definitions for gold gradients and filters */}
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE57F" />
              <stop offset="35%" stopColor="#F5B041" />
              <stop offset="70%" stopColor="#D4AC0D" />
              <stop offset="100%" stopColor="#F39C12" />
            </linearGradient>
            
            <linearGradient id="glowingGold" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F39C12" />
              <stop offset="100%" stopColor="#F1C40F" />
            </linearGradient>

            <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Ring Segment of C-shape/Circle */}
          <path
            d="M 146 54 A 70 70 0 1 0 146 146 M 146 70 A 55 55 0 1 0 146 130"
            stroke="url(#goldGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Bold C-Shape Base Rim */}
          <path
            d="M 154 90 C 154 62 135 44 100 44 C 58 44 38 72 38 100 C 38 128 58 156 100 156 C 135 156 150 138 152 118"
            stroke="url(#goldGradient)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Concentric Vinyl Grooves (Left side) */}
          <path
            d="M 60 70 A 42 42 0 0 0 60 130"
            stroke="url(#goldGradient)"
            strokeWidth="1.5"
            opacity="0.5"
          />
          <path
            d="M 52 78 A 32 32 0 0 0 52 122"
            stroke="url(#goldGradient)"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <path
            d="M 44 86 A 22 22 0 0 0 44 114"
            stroke="url(#goldGradient)"
            strokeWidth="1.5"
            opacity="0.75"
          />

          {/* Double horizontal indicators on mid-right */}
          <line x1="140" y1="100" x2="152" y2="100" stroke="url(#goldGradient)" strokeWidth="4" strokeLinecap="round" />
          <line x1="140" y1="107" x2="149" y2="107" stroke="url(#goldGradient)" strokeWidth="4" strokeLinecap="round" />

          {/* Central Double-Line Play Triangle */}
          {/* Outer Triangle */}
          <polygon
            points="84,65 84,135 142,100"
            stroke="url(#goldGradient)"
            strokeWidth="5"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Inner Triangle Accent */}
          <polygon
            points="92,79 92,121 125,100"
            fill="url(#glowingGold)"
            opacity="0.9"
          />

          {/* Circuit Traces & Nodes (Radiating bottom-right) */}
          {/* Trace 1 */}
          <path
            d="M 120 120 L 140 140 H 155"
            stroke="url(#goldGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="155" cy="140" r="4.5" fill="url(#glowingGold)" />

          {/* Trace 2 */}
          <path
            d="M 112 128 L 128 150 L 146 150"
            stroke="url(#goldGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="146" cy="150" r="4.5" fill="url(#glowingGold)" />

          {/* Trace 3 */}
          <path
            d="M 103 131 L 112 158 L 126 158"
            stroke="url(#goldGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="126" cy="158" r="4.5" fill="url(#glowingGold)" />

          {/* Trace 4 (higher right) */}
          <path
            d="M 132 112 L 152 122 H 162"
            stroke="url(#goldGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="162" cy="122" r="4.5" fill="url(#glowingGold)" />

          {/* Top 'Q' Ring Emblem */}
          <circle cx="100" cy="27" r="11" stroke="url(#goldGradient)" strokeWidth="3" fill="#121212" />
          <text
            x="100"
            y="32"
            fill="url(#goldGradient)"
            fontSize="14"
            fontWeight="900"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            Q
          </text>
        </svg>
      </div>

      {/* Styled MUSEQUEST Text underneath (with gold bar) */}
      {showText && (
        <div className="mt-2 text-center select-none">
          <h2 className="text-sm font-black tracking-[0.25em] text-amber-400 font-sans uppercase leading-none">
            MUSEQUEST
          </h2>
          <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-1" />
        </div>
      )}
    </div>
  );
}
