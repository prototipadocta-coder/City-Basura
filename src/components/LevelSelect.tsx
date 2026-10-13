import React from 'react';
import { LEVELS_CONFIG } from '../data/gameData';
import { LevelConfig, Character } from '../types/cartoonGame';
import { cartoonAudio } from '../utils/cartoonAudio';
import { Play, Star, Skull, Wind, Flame, ShieldAlert } from 'lucide-react';

interface LevelSelectProps {
  selectedCharacter: Character;
  completedLevels: number[];
  onSelectLevel: (lvl: LevelConfig) => void;
  onBackToCharacters: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  selectedCharacter,
  completedLevels,
  onSelectLevel,
  onBackToCharacters,
}) => {
  const handleStartLevel = (lvl: LevelConfig) => {
    cartoonAudio.playRecyclePop();
    onSelectLevel(lvl);
  };

  const getDifficultyBadge = (difficulty: LevelConfig['difficulty']) => {
    switch (difficulty) {
      case 'Fácil':
        return 'bg-emerald-100 text-emerald-800 border-emerald-500';
      case 'Medio':
        return 'bg-blue-100 text-blue-800 border-blue-500';
      case 'Difícil':
        return 'bg-amber-100 text-amber-800 border-amber-500';
      case 'Extremo':
        return 'bg-orange-100 text-orange-800 border-orange-500';
      case 'Nivel Dios':
        return 'bg-purple-100 text-purple-900 border-purple-600 font-black animate-pulse';
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 py-6 font-['Rubik',sans-serif] select-none">
      <div className="bg-[#FFFDF7] border-4 border-[#2D3142] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0_#2D3142]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b-4 border-[#FFF3D6] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🕹️</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D3142] uppercase tracking-wide">
                Selecciona la Misión
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#FF8A3D] mt-0.5">
              5 niveles de dificultad: ¡Salva la ciudad y limpia el aire!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#FFF3D6] border-2 border-[#2D3142] px-3 py-1.5 rounded-full text-xs font-bold text-[#2D3142]">
              <span>Jugador:</span>
              <span className="font-black text-[#FF8A3D]">{selectedCharacter.name}</span>
              <span>{selectedCharacter.badge}</span>
            </div>

            <button
              onClick={onBackToCharacters}
              className="text-xs font-bold text-[#4F5D75] hover:text-[#2D3142] underline cursor-pointer"
            >
              Cambiar
            </button>
          </div>
        </div>

        {/* Levels List */}
        <div className="space-y-4 mb-6">
          {LEVELS_CONFIG.map((lvl) => {
            const isCompleted = completedLevels.includes(lvl.number);
            const isGodLevel = lvl.difficulty === 'Nivel Dios';

            return (
              <div
                key={lvl.number}
                className={`relative border-3 rounded-2xl p-4 sm:p-5 transition-all shadow-[4px_4px_0_#2D3142] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isGodLevel
                    ? 'bg-gradient-to-r from-purple-100 via-amber-100 to-red-100 border-[#2D3142]'
                    : isCompleted
                    ? 'bg-emerald-50/80 border-[#3DCB6C]'
                    : 'bg-white border-[#2D3142]'
                }`}
              >
                {/* Level info */}
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <div
                    className={`w-14 h-14 rounded-2xl border-3 border-[#2D3142] flex items-center justify-center text-xl font-black shrink-0 shadow-[2px_2px_0_#2D3142] ${
                      isGodLevel
                        ? 'bg-purple-600 text-white animate-bounce'
                        : isCompleted
                        ? 'bg-[#3DCB6C] text-white'
                        : 'bg-[#FF8A3D] text-white'
                    }`}
                  >
                    {isGodLevel ? '👑' : lvl.number}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg sm:text-xl font-black text-[#2D3142]">
                        {lvl.name}
                      </h3>
                      <span
                        className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border-2 ${getDifficultyBadge(
                          lvl.difficulty
                        )}`}
                      >
                        {lvl.difficulty}
                      </span>
                      {isCompleted && (
                        <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1">
                          <Star className="w-3 h-3 fill-white" /> ¡Superado!
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-[#4F5D75] leading-snug mb-2">
                      {lvl.objective}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-[#4F5D75]">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        Meta: {lvl.targetScore} pts
                      </span>
                      <span>·</span>
                      <span>⏱️ Tiempo: {lvl.timeLimit}s</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Wind className="w-3.5 h-3.5 text-blue-500" />
                        Peligro de Smog: {lvl.smogRate > 0.4 ? 'Muy Alto' : 'Normal'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Play Button */}
                <div className="w-full md:w-auto shrink-0 flex items-center justify-end">
                  <button
                    onClick={() => handleStartLevel(lvl)}
                    className={`w-full md:w-auto px-6 py-3 rounded-xl border-3 border-[#2D3142] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0_#2D3142] active:translate-y-1 active:shadow-[1px_1px_0_#2D3142] transition-all cursor-pointer ${
                      isGodLevel
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-[#FF8A3D] hover:bg-[#ff771f] text-white'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{isCompleted ? 'Volver a Jugar' : 'Iniciar Misión'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info for kids */}
        <div className="bg-[#FFF3D6] border-2 border-[#2D3142] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#2D3142]">
          <div className="flex items-center gap-2">
            <span className="text-lg">💡</span>
            <span className="font-bold">
              Consejo de Sofi: ¡Usa las teclas de flechas o A/D para moverte y pulsa ESPACIO o toca para lanzar al contenedor correcto!
            </span>
          </div>
          <span className="font-mono text-[#FF8A3D] font-black shrink-0">
            Niveles Completados: {completedLevels.length} / 5
          </span>
        </div>
      </div>
    </div>
  );
};
