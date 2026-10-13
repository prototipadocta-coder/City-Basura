import React from 'react';
import { soundManager } from '../utils/audio';

interface MenuButtonProps {
  label: string;
  icon: React.ReactNode;
  variant: 'blue' | 'green' | 'red' | 'gray' | 'purple';
  onClick: () => void;
  className?: string;
}

export const MenuButton: React.FC<MenuButtonProps> = ({
  label,
  icon,
  variant,
  onClick,
  className = '',
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'blue':
        return 'voxel-btn-blue';
      case 'green':
        return 'voxel-btn-green';
      case 'red':
        return 'voxel-btn-red';
      case 'gray':
        return 'voxel-btn-gray';
      case 'purple':
        return 'voxel-btn-purple';
    }
  };

  const handleMouseEnter = () => {
    soundManager.playHover();
  };

  const handleClick = () => {
    soundManager.playClick();
    onClick();
  };

  return (
    <button
      type="button"
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className={`voxel-btn ${getVariantClass()} group relative flex items-center justify-center w-full max-w-[420px] h-[54px] sm:h-[62px] px-6 rounded-xl transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-1 cursor-pointer select-none ${className}`}
    >
      {/* Icon on left side with fixed alignment */}
      <div className="absolute left-6 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-white filter drop-shadow-[0_2px_0_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform">
        {icon}
      </div>

      {/* Button label */}
      <span className="text-xl sm:text-2xl font-bold tracking-wide text-white text-pixel-stroke font-['Pixelify_Sans',sans-serif]">
        {label}
      </span>
    </button>
  );
};
