import React from 'react';

interface TitleLogoProps {
  className?: string;
}

export const TitleLogo: React.FC<TitleLogoProps> = ({ className = '' }) => {
  return (
    <div className={`relative flex flex-col items-center select-none pointer-events-none ${className}`}>
      {/* Container with gentle float animation */}
      <div className="relative flex flex-col items-center">
        {/* Top Row: Leaf + CITY + Trash Can */}
        <div className="relative flex items-center justify-center">
          {/* Green Plant Leaves on Left */}
          <div className="absolute -left-10 sm:-left-14 -top-2 w-12 h-12 sm:w-16 sm:h-16 z-20 transform -rotate-12 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
            <svg viewBox="0 0 48 48" className="w-full h-full">
              {/* Voxel styled leaves */}
              <rect x="20" y="8" width="8" height="8" fill="#4ade80" stroke="#14532d" strokeWidth="2" />
              <rect x="12" y="16" width="8" height="8" fill="#22c55e" stroke="#14532d" strokeWidth="2" />
              <rect x="20" y="16" width="8" height="8" fill="#16a34a" stroke="#14532d" strokeWidth="2" />
              <rect x="28" y="16" width="8" height="8" fill="#4ade80" stroke="#14532d" strokeWidth="2" />
              <rect x="12" y="24" width="8" height="8" fill="#15803d" stroke="#14532d" strokeWidth="2" />
              <rect x="20" y="24" width="8" height="8" fill="#166534" stroke="#14532d" strokeWidth="2" />
              <rect x="28" y="24" width="8" height="8" fill="#22c55e" stroke="#14532d" strokeWidth="2" />
              <rect x="20" y="32" width="6" height="10" fill="#14532d" />
            </svg>
          </div>

          {/* "CITY" 3D Voxel Letters */}
          <div className="relative z-10">
            <span
              className="text-6xl sm:text-7xl md:text-8xl font-black tracking-wider uppercase font-['Rubik',sans-serif]"
              style={{
                background: 'linear-gradient(180deg, #fef08a 0%, #facc15 35%, #f59e0b 65%, #ea580c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 6px 0 #78350f) drop-shadow(0 10px 0 #18181b) drop-shadow(0 14px 18px rgba(0,0,0,0.8))',
                WebkitTextStroke: '3px #18181b',
              }}
            >
              CITY
            </span>
          </div>

          {/* Voxel Metal Trash Can with Lid on Right */}
          <div className="absolute -right-12 sm:-right-16 -top-5 w-14 h-16 sm:w-18 sm:h-20 z-20 transform rotate-6 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
            <svg viewBox="0 0 60 70" className="w-full h-full">
              {/* Tilted Lid Handle */}
              <rect x="26" y="2" width="8" height="4" fill="#64748b" stroke="#0f172a" strokeWidth="2" />
              {/* Tilted Lid */}
              <rect x="12" y="6" width="36" height="7" rx="1" fill="#94a3b8" stroke="#0f172a" strokeWidth="2" />
              {/* Trash Can Body (Ribbed Voxel Metal) */}
              <path d="M16 14 L44 14 L40 60 L20 60 Z" fill="#94a3b8" stroke="#0f172a" strokeWidth="2.5" />
              {/* Metal Ridges */}
              <line x1="23" y1="18" x2="25" y2="56" stroke="#cbd5e1" strokeWidth="2" />
              <line x1="30" y1="18" x2="30" y2="56" stroke="#64748b" strokeWidth="2" />
              <line x1="37" y1="18" x2="35" y2="56" stroke="#475569" strokeWidth="2" />
              {/* Green Recycle Symbol on Can */}
              <g transform="translate(23, 28) scale(0.65)">
                <path
                  d="M10 2 L13 7 L7 7 Z M17 11 L14 16 L11 11 Z M4 14 L1 9 L6 9 Z"
                  fill="#22c55e"
                  stroke="#14532d"
                  strokeWidth="1.5"
                />
                <circle cx="10" cy="10" r="5" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="3 2" />
              </g>
            </svg>
          </div>
        </div>

        {/* Bottom Word: "BASURA" 3D Voxel Letters */}
        <div className="relative -mt-3 sm:-mt-5 z-20">
          <span
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-widest uppercase font-['Rubik',sans-serif]"
            style={{
              background: 'linear-gradient(180deg, #bbf7d0 0%, #4ade80 25%, #22c55e 55%, #15803d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 6px 0 #14532d) drop-shadow(0 10px 0 #0f172a) drop-shadow(0 14px 18px rgba(0,0,0,0.8))',
              WebkitTextStroke: '3px #0f172a',
            }}
          >
            BASURA
          </span>
        </div>
      </div>
    </div>
  );
};
