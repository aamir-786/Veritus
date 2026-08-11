import React from 'react';

export default function EffectiveVeritusLogo({ className = "", subtitle = true, size = "large" }) {
  return (
    <div className={`inline-flex flex-col items-start select-none py-1 ${className}`}>
      
      {/* Prominent Ultra-Tight L-Bracket Frame Container */}
      <div className="relative inline-flex items-center px-2 py-1">
        
        {/* Top-Left Thick Black L-Bracket Corner ┌ */}
        <div className="absolute left-0 top-0 w-3.5 h-3.5 border-l-[4px] border-t-[4px] border-black pointer-events-none" />

        {/* Main Logo Text Row */}
        <div className="flex items-start gap-1.5 px-2">
          
          {/* Main Word: "Veritus" in Solid Pitch Black */}
          <span className="font-display font-black text-2xl sm:text-3xl tracking-tight text-black leading-none">
            Veritus
          </span>

          {/* Top-Right Badge: "Effective RM" (Effective in Black, RM in Royal Blue) */}
          <div className="flex items-center gap-0.5 text-xs sm:text-sm font-display font-extrabold leading-none -mt-0.5">
            <span className="text-black">Effective</span>
            <span className="text-[#0052FF] font-black">
              RM
            </span>
          </div>

        </div>

        {/* Bottom-Right Thick Black L-Bracket Corner ┘ */}
        <div className="absolute right-0 bottom-0 w-3.5 h-3.5 border-r-[4px] border-b-[4px] border-black pointer-events-none" />

      </div>

      {/* Subtitle Tagline: "DECIDING IN THE DARK" in Royal Blue (#0052FF) */}
      {subtitle && (
        <span className="text-[10px] sm:text-[11px] font-black text-[#0052FF] tracking-widest uppercase pl-2.5 mt-1 font-mono">
          DECIDING IN THE DARK
        </span>
      )}

    </div>
  );
}
