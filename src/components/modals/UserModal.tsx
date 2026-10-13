import React from 'react';
import { User, Award, Trash2, Recycle, ShieldCheck, Zap, X, AlertTriangle } from 'lucide-react';
import { UserProfile, Character } from '../../types/game';
import { CHARACTERS, VILLAIN } from '../../data/characters';
import { soundManager } from '../../utils/audio';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  selectedCharacter: Character;
  onSelectCharacter: (char: Character) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  selectedCharacter,
  onSelectCharacter,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl voxel-modal-frame rounded-2xl p-5 sm:p-6 text-white font-['Pixelify_Sans',sans-serif] max-h-[92vh] flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b-2 border-slate-700 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000]">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-wide text-pixel-stroke">
                Héroes y Perfil de Usuario
              </h2>
              <span className="text-xs text-blue-300 font-mono">
                Elige a uno de los 11 amigos para limpiar City Basura
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-lg bg-red-600 hover:bg-red-500 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000] cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Active Hero Spotlight Card */}
          <div className="bg-slate-800/90 border-2 border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div
              className="w-20 h-20 rounded-2xl border-3 border-black flex items-center justify-center text-4xl shadow-[3px_3px_0_#000] shrink-0"
              style={{ backgroundColor: selectedCharacter.color }}
            >
              {selectedCharacter.badge}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="text-2xl font-bold text-white text-pixel-stroke">
                  {selectedCharacter.name}
                </span>
                <span className="text-xs bg-slate-900 border border-slate-600 px-2 py-0.5 rounded text-amber-300 font-mono">
                  {selectedCharacter.role}
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                {selectedCharacter.description}
              </p>
              <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-300">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Habilidad: {selectedCharacter.specialAbility}</span>
              </div>
            </div>

            {/* Level / Eco-Coins */}
            <div className="text-right shrink-0 bg-slate-900/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400 uppercase">Nivel Cívico</div>
              <div className="text-xl font-bold text-amber-400 font-['Rubik',sans-serif]">
                Nv. {profile.level}
              </div>
              <div className="text-xs text-emerald-400 mt-1">
                🪙 {profile.ecoCoins} Monedas
              </div>
            </div>
          </div>

          {/* 11 Friends Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400 uppercase tracking-wider block">
                Selecciona a tu Personaje Jugable (11 Amigos)
              </label>
              <span className="text-[11px] text-emerald-400 font-bold">
                Cambia el color del brazo 3D en 1ª persona
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {CHARACTERS.map((char) => {
                const isSelected = selectedCharacter.id === char.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => {
                      soundManager.playClick();
                      onSelectCharacter(char);
                    }}
                    className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-950/60 shadow-[2px_2px_0_#22c55e] -translate-y-0.5'
                        : 'border-slate-700 bg-slate-900/70 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div
                        className="w-8 h-8 rounded-lg border border-black flex items-center justify-center text-lg"
                        style={{ backgroundColor: char.color }}
                      >
                        {char.badge}
                      </div>
                      {isSelected && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <span className="font-bold text-sm text-white leading-tight">
                      {char.name}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate mt-0.5">
                      {char.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Villain Dossier: Mr.Basura */}
          <div className="bg-red-950/40 border-2 border-red-700/80 rounded-xl p-3.5 flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-900 border-2 border-black flex items-center justify-center text-2xl shrink-0 shadow-[2px_2px_0_#000]">
              {VILLAIN.badge}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-sm text-red-300">
                  {VILLAIN.name}
                </span>
                <span className="text-[10px] bg-red-900 text-red-200 px-2 py-0.2 rounded font-mono">
                  Enemigo Principal (Nivel 5)
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {VILLAIN.description}
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-900/60 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white leading-none">
                  {profile.totalTrashCollected}
                </div>
                <div className="text-[11px] text-slate-400">Basura Recogida en 3D</div>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-900/60 border border-blue-500/50 flex items-center justify-center text-blue-400">
                <Recycle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white leading-none">
                  {profile.totalRecycledKg} kg
                </div>
                <div className="text-[11px] text-slate-400">Residuos Clasificados</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-700 flex justify-end shrink-0">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="voxel-btn-blue px-6 py-2 rounded-lg text-sm font-bold text-white cursor-pointer"
          >
            Aceptar y Jugar con {selectedCharacter.name}
          </button>
        </div>
      </div>
    </div>
  );
};
