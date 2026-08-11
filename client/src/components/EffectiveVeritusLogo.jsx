import React from 'react';

export default function EffectiveVeritusLogo({ className = "", subtitle = true }) {
  return (
    <div className={`inline-flex flex-col items-start select-none ${className}`}>
      
      {/* Outer Bracket Frame Container matching Effective RM Branding */}
      <div className="relative flex items-center px-2.5 py-1">
        
        {/* Top-Left & Bottom-Left Black L-Bracket [ */}
        <div className="absolute left-0 top-0 bottom-0 w-2.5 border-l-[3px] border-t-[3px] border-b-[3px] border-slate-950 pointer-events-none" />

        {/* Main Logo Text Row */}
        <div className="flex items-start gap-1.5 px-2">
          
          {/* Main Word: "Veritus" in Solid Black */}
          <span className="font-display font-black text-2xl tracking-tight text-slate-950 leading-none">
            Veritus
          </span>

          {/* Top-Right Badge: "Effective RM" (Effective in Black, RM in Blue) */}
          <div className="flex items-center gap-0.5 text-[11px] font-display font-extrabold leading-none -mt-0.5">
            <span className="text-slate-950">Effective</span>
            <span className="bg-gradient-to-r from-blue-700 to-sky-500 bg-clip-text text-transparent font-black">
              RM
            </span>
          </div>

        </div>

        {/* Top-Right & Bottom-Right Black L-Bracket ] */}
        <div className="absolute right-0 top-0 bottom-0 w-2.5 border-r-[3px] border-t-[3px] border-b-[3px] border-slate-950 pointer-events-none" />

      </div>

      {/* Subtitle Tagline: "Deciding in the Dark" in Electric Blue */}
      {subtitle && (
        <span className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase pl-2.5 mt-1 font-mono">
          Deciding in the Dark
        </span>
      )}

    </div>
  );
}
