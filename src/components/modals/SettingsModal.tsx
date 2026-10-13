import React from 'react';
import { Settings, Volume2, VolumeX, Monitor, Gamepad2, X } from 'lucide-react';
import { GameSettings } from '../../types/game';
import { soundManager } from '../../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (updated: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg voxel-modal-frame rounded-2xl p-6 text-white font-['Pixelify_Sans',sans-serif] max-h-[90vh] flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b-2 border-slate-700 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000]">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-wide text-pixel-stroke">
                Configuración
              </h2>
              <span className="text-xs text-slate-300 font-mono">
                Ajustes de audio, video y controles
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

        {/* Content sections */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Audio Section */}
          <div className="bg-slate-800/80 border-2 border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold flex items-center gap-2 text-amber-300">
                <Volume2 className="w-4 h-4" /> Audio y Sonido
              </span>
              <button
                onClick={() => {
                  const newMuted = !settings.isMuted;
                  soundManager.isMuted = newMuted;
                  onUpdateSettings({ isMuted: newMuted });
                }}
                className={`px-3 py-1 rounded text-xs font-bold border flex items-center gap-1.5 cursor-pointer ${
                  settings.isMuted
                    ? 'bg-red-900/60 border-red-500 text-red-300'
                    : 'bg-emerald-900/60 border-emerald-500 text-emerald-300'
                }`}
              >
                {settings.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                {settings.isMuted ? 'Silenciado' : 'Activo'}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Volumen General</span>
                  <span className="font-mono">{Math.round(settings.masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.masterVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    soundManager.masterVolume = val;
                    onUpdateSettings({ masterVolume: val });
                  }}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Efectos de Sonido (SFX)</span>
                  <span className="font-mono">{Math.round(settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    soundManager.sfxVolume = val;
                    onUpdateSettings({ sfxVolume: val });
                  }}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Video / Graphics Section */}
          <div className="bg-slate-800/80 border-2 border-slate-700 rounded-xl p-4">
            <span className="text-sm font-bold flex items-center gap-2 text-blue-300 mb-3">
              <Monitor className="w-4 h-4" /> Gráficos y Pantalla
            </span>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Calidad Gráfica Voxel</span>
                <div className="flex gap-1.5">
                  {(['baja', 'media', 'alta'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        soundManager.playClick();
                        onUpdateSettings({ graphicsQuality: q });
                      }}
                      className={`px-2.5 py-1 rounded text-xs uppercase font-bold border transition-colors cursor-pointer ${
                        settings.graphicsQuality === q
                          ? 'bg-blue-600 border-white text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Campo de Visión (FOV)</span>
                  <span className="font-mono">{settings.fov}°</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="100"
                  step="5"
                  value={settings.fov}
                  onChange={(e) => onUpdateSettings({ fov: parseInt(e.target.value, 10) })}
                  className="w-full accent-blue-400 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-300">Filtro Retro CRT Scanlines</span>
                <input
                  type="checkbox"
                  checked={settings.crtFilter}
                  onChange={(e) => onUpdateSettings({ crtFilter: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Controls Information */}
          <div className="bg-slate-800/80 border-2 border-slate-700 rounded-xl p-4">
            <span className="text-sm font-bold flex items-center gap-2 text-emerald-300 mb-3">
              <Gamepad2 className="w-4 h-4" /> Controles en 1ª Persona
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-700">
                <span className="text-slate-400">Moverse</span>
                <span className="font-mono text-emerald-400 font-bold">W A S D</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-700">
                <span className="text-slate-400">Mirar</span>
                <span className="font-mono text-emerald-400 font-bold">Ratón</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-700">
                <span className="text-slate-400">Recoger Basura</span>
                <span className="font-mono text-emerald-400 font-bold">[E] o Clic</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-700">
                <span className="text-slate-400">Pausar / Menú</span>
                <span className="font-mono text-emerald-400 font-bold">ESC</span>
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
            className="voxel-btn-gray px-6 py-2 rounded-lg text-sm font-bold text-white cursor-pointer"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
