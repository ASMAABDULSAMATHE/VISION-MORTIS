import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const VisionMortisLogo: React.FC<LogoProps> = ({
  className = "",
  size = "md",
}) => {
  // Compact, sleek sizing requested by user
  const sizeMap: Record<string, string> = {
    sm: "h-5 sm:h-6",
    md: "h-6 sm:h-7",
    lg: "h-8 sm:h-9",
    xl: "h-11 sm:h-12",
  };

  const currentClass = className || sizeMap[size] || "h-6 sm:h-7";

  return (
    <div
      className={`relative inline-flex items-center shrink-0 select-none ${currentClass}`}
      style={{ aspectRatio: "2.95 / 1" }}
      title="Vision Mortis"
    >
      <svg
        viewBox="0 0 620 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle neon cyan bloom */}
          <filter id="ecgNeonGlowExact" x="-30%" y="-40%" width="160%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.8" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="6.5" result="blur2" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur3" />
            <feMerge>
              <feMergeNode in="blur3" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Apex beacon point soft glow */}
          <filter id="apexPointGlowExact" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glowing cyan gradient matching image */}
          <linearGradient id="cyanLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="30%" stopColor="#00f2fe" />
            <stop offset="60%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#00e5ff" />
          </linearGradient>
        </defs>

        {/* 1. TOP-LEFT: "VISION" (Cleanly positioned above baseline, no overlap) */}
        <text
          x="24"
          y="90"
          fill="#ffffff"
          fontFamily="'Orbitron', 'Rajdhani', 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="700"
          fontSize="42"
          letterSpacing="7px"
        >
          VISION
        </text>

        {/* 2. BOTTOM-RIGHT: "MORTIS" (Fully visible with ample right margin for the S) */}
        <text
          x="320"
          y="172"
          fill="#ffffff"
          fontFamily="'Orbitron', 'Rajdhani', 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="700"
          fontSize="42"
          letterSpacing="7px"
        >
          MORTIS
        </text>

        {/* 3. Outer Diffuse Glow for ECG Pulse */}
        <path
          d="M 24 116 
             L 235 116 
             L 247 132 
             L 278 24 
             L 306 198 
             L 324 116 
             L 438 116 
             C 448 116, 454 94, 466 94 
             C 478 94, 484 116, 494 116 
             L 596 116"
          stroke="#00f0ff"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
          filter="url(#ecgNeonGlowExact)"
        />

        {/* 4. Crisp Foreground Neon Pulse Line */}
        <path
          d="M 24 116 
             L 235 116 
             L 247 132 
             L 278 24 
             L 306 198 
             L 324 116 
             L 438 116 
             C 448 116, 454 94, 466 94 
             C 478 94, 484 116, 494 116 
             L 596 116"
          stroke="url(#cyanLineGradient)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 5. Glowing white beacon dot at the apex of the peak */}
        <circle cx="278" cy="24" r="4.5" fill="#ffffff" filter="url(#apexPointGlowExact)" />
        <circle cx="278" cy="24" r="2.8" fill="#ffffff" />
      </svg>
    </div>
  );
};

export const RecreatedLogo = VisionMortisLogo;
export default VisionMortisLogo;
