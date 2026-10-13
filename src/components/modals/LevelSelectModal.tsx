import React, { useState } from 'react';
import { Play, Star, Wind, AlertTriangle, X, Shield, BookOpen } from 'lucide-react';
import { LevelConfig, Character } from '../../types/game';
import { GAME_LEVELS } from '../../data/characters';
import { soundManager } from '../../utils/audio';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCharacter: Character;
  completedLevels: number[];
  onStartLevel: (lvl: LevelConfig) => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  selectedCharacter,
  completedLevels,
  onStartLevel,
}) => {
  const [showStoryDetail, setShowStoryDetail] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl voxel-modal-frame rounded-2xl p-5 sm:p-6 text-white font-['Pixelify_Sans',sans-serif] max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-700 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000]">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-wide text-pixel-stroke">
                Misiones de City Basura
              </h2>
              <span className="text-xs text-emerald-300 font-mono">
                Jugando como: <strong className="text-white">{selectedCharacter.name} {selectedCharacter.badge}</strong>
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

        {/* Scrollable body */}
        <div className="space-y-3.5 overflow-y-auto pr-1 flex-1">
          {/* Story & Problem Context Card */}
          <div className="bg-slate-900/90 border-2 border-amber-500/70 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Historia y Contexto Inicial
              </span>
              <button
                onClick={() => setShowStoryDetail(!showStoryDetail)}
                className="text-[11px] text-blue-400 underline cursor-pointer"
              >
                {showStoryDetail ? 'Ocultar detalle' : 'Leer relato completo'}
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed italic">
              "Los humanos no cuidaban el medio ambiente y se generaba mucha basura provocando calentamiento global. Tras un terremoto, los desechos cayeron en una planta química tóxica y se convirtieron en <strong className="text-red-400 not-italic">Mr.Basura</strong>, un monstruo que inundó la ciudad de basura y humo tóxico."
            </p>

            {/* Problematic highlight */}
            <div className="mt-2 pt-2 border-t border-slate-700/80 flex items-center gap-2 bg-red-950/40 p-2 rounded-lg border border-red-800/60">
              <Wind className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
              <p className="text-[11px] text-red-200 leading-tight">
                <strong>Problemática:</strong> Había tanta basura que era <span className="underline decoration-red-400 font-bold">casi imposible respirar</span>. ¡Recoge y clasifica los residuos para que el aire vuelva a ser puro!
              </p>
            </div>
          </div>

          {/* 5 Levels List */}
          <div className="space-y-2">
            {GAME_LEVELS.map((lvl) => {
              const isCompleted = completedLevels.includes(lvl.number);
              const isBoss = lvl.bossMode;

              return (
                <div
                  key={lvl.number}
                  className={`p-3.5 rounded-xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isBoss
                      ? 'bg-purple-950/40 border-purple-500/80 hover:border-purple-400 shadow-[3px_3px_0_#581c87]'
                      : isCompleted
                      ? 'bg-emerald-950/30 border-emerald-600/80'
                      : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center font-bold text-lg shrink-0 shadow-[2px_2px_0_#000] ${
                        isBoss
                          ? 'bg-purple-600 text-white animate-pulse'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-amber-300'
                      }`}
                    >
                      {isBoss ? '👾' : lvl.number}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-base text-white">
                          {lvl.name}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                            lvl.difficulty.includes('1 - Fácil')
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                              : lvl.difficulty.includes('2 - Medio')
                              ? 'bg-blue-950 text-blue-300 border-blue-500'
                              : lvl.difficulty.includes('3 - Difícil')
                              ? 'bg-amber-950 text-amber-300 border-amber-500'
                              : lvl.difficulty.includes('4 - Extremo')
                              ? 'bg-orange-950 text-orange-300 border-orange-500'
                              : 'bg-purple-950 text-purple-300 border-purple-400 font-extrabold animate-pulse'
                          }`}
                        >
                          {lvl.difficulty}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">
                            ✓ Superado
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-200 leading-snug">
                        {lvl.objective}
                      </p>

                      {/* Realistic Mission Waste Context & Indicators */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300 mt-1.5 font-mono">
                        <span className="bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
                          🎯 Meta: <strong className="text-amber-300">{lvl.targetTrash} residuos</strong>
                        </span>
                        <span className="bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
                          ⏱️ Tiempo: <strong className="text-cyan-300">{lvl.timeLimit}s</strong>
                        </span>
                        <span className="bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
                          💨 Smog: <strong className={lvl.smogRate > 0.3 ? 'text-red-400' : 'text-emerald-400'}>{lvl.smogRate > 0.3 ? 'Muy Tóxico' : lvl.smogRate > 0.1 ? 'Moderado' : 'Leve'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onStartLevel(lvl);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                      isBoss
                        ? 'bg-purple-600 hover:bg-purple-500 border-black shadow-[2px_2px_0_#000] text-white'
                        : isCompleted
                        ? 'bg-emerald-600 hover:bg-emerald-500 border-black shadow-[2px_2px_0_#000] text-white'
                        : 'bg-blue-600 hover:bg-blue-500 border-black shadow-[2px_2px_0_#000] text-white'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{isCompleted ? 'Jugar de nuevo' : 'Iniciar 3D'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between items-center text-xs text-slate-400 shrink-0">
          <span>Creado por: <strong className="text-white">Los gatos brasileños</strong></span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="voxel-btn-gray px-5 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
