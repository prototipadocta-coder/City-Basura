import React from 'react';
import { HERO_CHARACTERS, VILLAIN_CHARACTER } from '../data/gameData';
import { Character } from '../types/cartoonGame';
import { cartoonAudio } from '../utils/cartoonAudio';
import { Check, Zap, Sparkles, ArrowRight } from 'lucide-react';

interface CharacterSelectProps {
  selectedCharacter: Character;
  onSelectCharacter: (char: Character) => void;
  onProceedToLevels: () => void;
  onBackToStory: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  selectedCharacter,
  onSelectCharacter,
  onProceedToLevels,
  onBackToStory,
}) => {
  const handleSelect = (char: Character) => {
    cartoonAudio.playBoing();
    onSelectCharacter(char);
  };

  const handleContinue = () => {
    cartoonAudio.playRecyclePop();
    onProceedToLevels();
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 py-6 font-['Rubik',sans-serif] select-none">
      <div className="bg-[#FFFDF7] border-4 border-[#2D3142] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0_#2D3142]">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b-4 border-[#FFF3D6] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🧑🤝🧑</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D3142] uppercase tracking-wide">
                Elige a tu Héroe o Heroína
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#FF8A3D] mt-0.5">
              11 amigos unidos contra el desastre ecológico de Mr.Basura
            </p>
          </div>

          <button
            onClick={onBackToStory}
            className="text-xs font-bold text-[#4F5D75] hover:text-[#2D3142] underline cursor-pointer self-start sm:self-auto"
          >
            ← Volver a la historia
          </button>
        </div>

        {/* Selected Hero Spotlight & Villain Warning */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Hero Showcase (2 cols) */}
          <div className="md:col-span-2 bg-[#FFF3D6] border-3 border-[#2D3142] rounded-2xl p-5 shadow-[4px_4px_0_#2D3142] flex flex-col sm:flex-row items-center gap-5">
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-[#2D3142] flex items-center justify-center text-5xl shrink-0 shadow-[4px_4px_0_#2D3142] animate-bounce"
              style={{ backgroundColor: selectedCharacter.color }}
            >
              {selectedCharacter.badge}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h3 className="text-2xl font-black text-[#2D3142]">
                  {selectedCharacter.name}
                </h3>
                <span className="bg-[#2D3142] text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  {selectedCharacter.role}
                </span>
              </div>
              <p className="text-xs text-[#4F5D75] leading-relaxed mb-3">
                {selectedCharacter.description}
              </p>
              <div className="inline-flex items-center gap-1.5 bg-white border-2 border-[#2D3142] px-3 py-1 rounded-xl text-xs font-black text-[#3DCB6C]">
                <Zap className="w-4 h-4 fill-[#3DCB6C]" />
                <span>Habilidad: {selectedCharacter.specialAbility}</span>
              </div>
            </div>
          </div>

          {/* Villain Spotlight (1 col) */}
          <div className="bg-slate-900 border-3 border-[#2D3142] rounded-2xl p-4 text-white shadow-[4px_4px_0_#2D3142] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase bg-red-600 text-white px-2 py-0.5 rounded">
                  Enemigo Principal
                </span>
                <span className="text-2xl">{VILLAIN_CHARACTER.badge}</span>
              </div>
              <h4 className="text-lg font-black text-red-400">
                {VILLAIN_CHARACTER.name}
              </h4>
              <p className="text-[11px] text-slate-300 leading-snug mt-1">
                {VILLAIN_CHARACTER.description}
              </p>
            </div>
            <div className="text-[10px] text-amber-300 font-mono mt-3 bg-slate-800 p-2 rounded border border-slate-700">
              ⚠️ Emite humo tóxico que asfixia la ciudad. ¡Debes purificarlo en el Nivel 5!
            </div>
          </div>
        </div>

        {/* Character Grid (All 11 friends) */}
        <div className="mb-8">
          <div className="text-xs font-black uppercase text-[#2D3142] mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FF8A3D]" />
            Selecciona un personaje para jugar:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {HERO_CHARACTERS.map((char) => {
              const isSelected = selectedCharacter.id === char.id;
              return (
                <button
                  key={char.id}
                  onClick={() => handleSelect(char)}
                  className={`relative p-3 rounded-2xl border-3 text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                    isSelected
                      ? 'border-[#2D3142] bg-[#FF8A3D] text-white shadow-[4px_4px_0_#2D3142] -translate-y-1'
                      : 'border-[#2D3142] bg-white hover:bg-[#FFF3D6] text-[#2D3142]'
                  }`}
                >
                  {/* Selected check */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#3DCB6C] rounded-full border-2 border-[#2D3142] flex items-center justify-center text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  <div
                    className="w-12 h-12 rounded-xl border-2 border-[#2D3142] flex items-center justify-center text-2xl mb-1.5 shadow-[2px_2px_0_#2D3142]"
                    style={{ backgroundColor: isSelected ? '#FFFFFF' : char.color }}
                  >
                    {char.badge}
                  </div>

                  <span className="font-extrabold text-sm leading-tight">
                    {char.name}
                  </span>
                  <span
                    className={`text-[10px] mt-0.5 truncate w-full ${
                      isSelected ? 'text-white/90' : 'text-[#4F5D75]'
                    }`}
                  >
                    {char.role.replace('El ', '').replace('La ', '')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t-2 border-[#FFF3D6]">
          <div className="text-xs text-[#4F5D75] font-bold">
            Personaje listo: <strong className="text-[#2D3142]">{selectedCharacter.name}</strong> con {selectedCharacter.specialAbility}
          </div>

          <button
            onClick={handleContinue}
            className="w-full sm:w-auto bg-[#3DCB6C] hover:bg-[#34b760] text-white font-black text-lg px-9 py-3.5 rounded-2xl border-4 border-[#2D3142] shadow-[5px_5px_0_#2D3142] active:translate-y-1 active:shadow-[1px_1px_0_#2D3142] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Ir a Elegir Nivel</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
