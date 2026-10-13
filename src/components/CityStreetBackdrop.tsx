import React from 'react';
import bgImage from '../assets/images/city_basura_bg_1790697318181.jpg';

export const CityStreetBackdrop: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
      {/* Primary generated scene image backdrop */}
      <img
        src={bgImage}
        alt="City Basura Voxel Scene"
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[1.03] contrast-[1.05]"
      />

      {/* Gentle ambient lighting and vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/40 pointer-events-none" />

      {/* Top sky clouds floating subtly */}
      <div className="absolute top-4 left-1/4 w-32 h-10 bg-white/70 rounded-none shadow-[4px_4px_0_rgba(0,0,0,0.15)] animate-cloud-drift opacity-60 hidden md:block" />
      <div className="absolute top-10 right-1/4 w-44 h-12 bg-white/80 rounded-none shadow-[4px_4px_0_rgba(0,0,0,0.15)] animate-cloud-drift opacity-75 hidden md:block" />

      {/* LEFT BILLBOARD OVERLAY: "Una ciudad más limpia es posible" */}
      <div className="absolute left-3 sm:left-6 md:left-10 lg:left-14 top-20 sm:top-24 md:top-28 z-10 w-44 sm:w-56 md:w-64 transform -rotate-1 hidden sm:block pointer-events-none">
        <div className="bg-[#1e40af] border-4 border-[#0f172a] p-3 sm:p-4 shadow-[6px_6px_0_#0f172a,0_10px_20px_rgba(0,0,0,0.6)] rounded-sm">
          <div className="flex items-start gap-2">
            {/* Voxel Earth Globe Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#38bdf8] border-2 border-[#0369a1] rounded-sm relative overflow-hidden shrink-0 shadow-inner">
              {/* Continents in green pixel blocks */}
              <div className="absolute top-1 left-1 w-5 h-4 bg-[#22c55e]" />
              <div className="absolute bottom-2 left-2 w-6 h-5 bg-[#16a34a]" />
              <div className="absolute top-3 right-1 w-4 h-6 bg-[#22c55e]" />
              <div className="absolute top-1 right-3 w-3 h-2 bg-[#15803d]" />
            </div>

            {/* Billboard Text */}
            <div className="flex-1">
              <p className="text-white text-xs sm:text-sm md:text-base font-bold leading-tight font-['Pixelify_Sans',sans-serif] text-pixel-stroke">
                Una ciudad más limpia es posible
              </p>
              {/* Sprout Icon */}
              <div className="flex items-center gap-1 mt-1 text-emerald-300">
                <span className="text-sm">🌱</span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-200">
                  Medellín Verde
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT CHALKBOARD SIGN: "Recicla / Reduce / Reutiliza" */}
      <div className="absolute right-3 sm:right-6 md:right-10 lg:right-14 top-28 sm:top-36 md:top-40 z-10 w-40 sm:w-48 md:w-52 transform rotate-1 hidden sm:block pointer-events-none">
        <div className="bg-[#18181b] border-4 border-[#78350f] p-3 shadow-[6px_6px_0_#0f172a,0_10px_20px_rgba(0,0,0,0.6)] rounded-sm">
          <p className="text-white text-xs sm:text-sm font-black text-center font-['Rubik',sans-serif] tracking-wider uppercase">
            Recicla
          </p>
          <p className="text-emerald-400 text-xs sm:text-sm font-black text-center font-['Rubik',sans-serif] tracking-wider uppercase">
            Reduce
          </p>
          <p className="text-white text-xs sm:text-sm font-black text-center font-['Rubik',sans-serif] tracking-wider uppercase">
            Reutiliza
          </p>
          {/* Recycle symbol */}
          <div className="flex justify-center mt-1 text-emerald-400 text-lg">
            ♻️
          </div>
        </div>
      </div>

      {/* RIGHT COLOMBIAN FLAG: Tall wooden pole with waving Yellow-Blue-Red flag */}
      <div className="absolute right-12 sm:right-16 md:right-20 lg:right-24 top-4 sm:top-6 md:top-8 z-10 flex flex-col items-start hidden sm:flex pointer-events-none">
        {/* Wooden pole top finial */}
        <div className="w-3 h-3 bg-amber-800 border-2 border-stone-900 mx-auto" />
        <div className="flex items-start">
          {/* Flag fabric with wave animation */}
          <div className="w-16 sm:w-20 md:w-24 h-12 sm:h-14 md:h-16 flex flex-col border-2 border-stone-900 shadow-[3px_3px_0_rgba(0,0,0,0.4)] animate-flag-wave">
            {/* Yellow stripe (50% height) */}
            <div className="w-full h-1/2 bg-[#facc15]" />
            {/* Blue stripe (25% height) */}
            <div className="w-full h-1/4 bg-[#1d4ed8]" />
            {/* Red stripe (25% height) */}
            <div className="w-full h-1/4 bg-[#dc2626]" />
          </div>
          {/* Wooden flagpole */}
          <div className="w-2 h-44 bg-amber-900 border-x-2 border-stone-900 shadow-sm -ml-0.5" />
        </div>
      </div>
    </div>
  );
};
