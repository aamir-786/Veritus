import React from 'react';

export default function EffectiveVeritusLogo({ 
  className = "", 
  subtitle = true, 
  variant = "dark" // "dark" (for light bg like Navbar) or "light" (for dark bg like Footer)
}) {
  const isLightMode = variant === "dark"; // Default dark text for light navbar

  return (
    <div className={`inline-flex flex-col items-start select-none py-1 ${className}`}>
      
      {/* Prominent Ultra-Tight L-Bracket Frame Container */}
      <div className="relative inline-flex items-center px-2 py-1">
        
        {/* Top-Left Thick L-Bracket Corner ┌ */}
        <div className={`absolute left-0 top-0 w-3.5 h-3.5 border-l-[4px] border-t-[4px] pointer-events-none ${
          isLightMode ? 'border-black' : 'border-white'
        }`} />

        {/* Main Logo Text Row */}
        <div className="flex items-start gap-1.5 px-2">
          
          {/* Main Word: "Veritus" */}
          <span className={`font-display font-black text-2xl sm:text-3xl tracking-tight leading-none ${
            isLightMode ? 'text-black' : 'text-white'
          }`}>
            Veritus
          </span>

          {/* Top-Right Badge: "Effective RM" */}
          <div className="flex items-center gap-0.5 text-xs sm:text-sm font-display font-extrabold leading-none -mt-0.5">
            <span className={isLightMode ? 'text-black' : 'text-slate-200'}>
              Effective
            </span>
            <span className={isLightMode ? 'text-[#0052FF] font-black' : 'bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent font-black'}>
              RM
            </span>
          </div>

        </div>

        {/* Bottom-Right Thick L-Bracket Corner ┘ */}
        <div className={`absolute right-0 bottom-0 w-3.5 h-3.5 border-r-[4px] border-b-[4px] pointer-events-none ${
          isLightMode ? 'border-black' : 'border-white'
        }`} />

      </div>

      {/* Subtitle Tagline: "DECIDING IN THE DARK" */}
      {subtitle && (
        <span className={`text-[10px] sm:text-[11px] font-black tracking-widest uppercase pl-2.5 mt-1 font-mono ${
          isLightMode ? 'text-[#0052FF]' : 'text-sky-400'
        }`}>
          DECIDING IN THE DARK
        </span>
      )}

    </div>
  );
}
