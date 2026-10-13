import React, { useState } from 'react';
import { soundManager } from '../utils/audio';

interface FirstPersonArmProps {
  className?: string;
  onArmClick?: () => void;
}

export const FirstPersonArm: React.FC<FirstPersonArmProps> = ({
  className = '',
  onArmClick,
}) => {
  const [isSwinging, setIsSwinging] = useState(false);

  const handleClick = () => {
    if (isSwinging) return;
    setIsSwinging(true);
    soundManager.playFootstep();
    if (onArmClick) onArmClick();
    setTimeout(() => {
      setIsSwinging(false);
    }, 400);
  };

  return (
    <div
      onClick={handleClick}
      className={`fixed bottom-0 right-0 z-30 pointer-events-auto cursor-pointer transition-transform select-none ${className}`}
      title="¡Brazo en primera persona! Haz clic para golpear/interactuar"
    >
      <div
        className={`relative origin-bottom-right transition-transform duration-200 ${
          isSwinging
            ? 'transform -translate-y-8 -translate-x-6 rotate-[-12deg]'
            : 'animate-arm-idle hover:scale-105'
        }`}
      >
        {/* Voxel Arm SVG */}
        <svg
          viewBox="0 0 240 280"
          className="w-56 h-64 sm:w-72 sm:h-80 md:w-88 md:h-96 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
        >
          {/* Black/Charcoal Sleeve (Upper Arm) */}
          <polygon
            points="120,80 230,130 200,280 90,240"
            fill="#18181b"
            stroke="#09090b"
            strokeWidth="3"
          />
          {/* Sleeve Top Highlights */}
          <polygon
            points="120,80 170,102 155,200 95,180"
            fill="#27272a"
          />
          {/* Sleeve Voxel Grid Detail */}
          <line x1="120" y1="120" x2="210" y2="160" stroke="#09090b" strokeWidth="2" strokeDasharray="6 4" />
          <line x1="105" y1="180" x2="195" y2="220" stroke="#09090b" strokeWidth="2" strokeDasharray="6 4" />

          {/* Skin Tone Forearm & Hand (Minecraft Block Style) */}
          {/* Main Top Face */}
          <polygon
            points="30,40 120,80 90,240 10,180"
            fill="#e29b6f"
            stroke="#18181b"
            strokeWidth="3"
          />
          {/* Forearm Light Facet */}
          <polygon
            points="30,40 85,65 70,195 10,180"
            fill="#f2a87a"
          />
          {/* Forearm Dark Shadow Facet */}
          <polygon
            points="85,65 120,80 90,240 70,195"
            fill="#cc8358"
          />

          {/* Fist / Knuckle Block End */}
          <polygon
            points="10,20 50,38 30,40 0,25"
            fill="#e29b6f"
            stroke="#18181b"
            strokeWidth="3"
          />
          <polygon
            points="0,25 30,40 10,180 -10,160"
            fill="#a6653f"
            stroke="#18181b"
            strokeWidth="3"
          />

          {/* Pixel grid shading on hand */}
          <rect x="25" y="55" width="14" height="14" fill="#d9895c" opacity="0.6" />
          <rect x="45" y="70" width="14" height="14" fill="#f7b78d" opacity="0.6" />
          <rect x="35" y="110" width="16" height="16" fill="#bf764d" opacity="0.5" />
          <rect x="55" y="130" width="14" height="14" fill="#f2a87a" opacity="0.6" />
        </svg>

        {/* Small floating hint on hover */}
        <div className="absolute top-8 left-0 -translate-x-12 opacity-0 hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded border border-white/20 whitespace-nowrap pointer-events-none">
          1ª Persona
        </div>
      </div>
    </div>
  );
};
