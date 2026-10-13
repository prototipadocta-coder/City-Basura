import React from 'react';
import { Character } from '../types/cartoonGame';
import { cartoonAudio } from '../utils/cartoonAudio';
import { Award, Heart, Sparkles, Download, RotateCcw, CheckCircle2, Trees, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VictoryReflectionModalProps {
  character: Character;
  totalScore: number;
  onPlayAgain: () => void;
  onDownloadSingleFileHtml: () => void;
}

export const VictoryReflectionModal: React.FC<VictoryReflectionModalProps> = ({
  character,
  totalScore,
  onPlayAgain,
  onDownloadSingleFileHtml,
}) => {
  React.useEffect(() => {
    cartoonAudio.playVictoryFanfare();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.4 },
      colors: ['#FF8A3D', '#3DCB6C', '#FFF3D6', '#3B82F6'],
    });
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 py-6 font-['Rubik',sans-serif] select-none animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-[#FFFDF7] border-4 border-[#2D3142] rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0_#2D3142]">
        {/* Victory Header */}
        <div className="text-center mb-6 border-b-4 border-[#FFF3D6] pb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#3DCB6C] rounded-3xl border-4 border-[#2D3142] shadow-[4px_4px_0_#2D3142] text-4xl mb-3 animate-bounce">
            🏆
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2D3142] uppercase tracking-wide">
            ¡Victoria Total en City Basura!
          </h1>
          <p className="text-sm sm:text-base font-bold text-[#FF8A3D] mt-1">
            Has derrotado a Mr.Basura y purificado el cielo de la ciudad
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
            <span className="bg-[#FFF3D6] border-2 border-[#2D3142] px-3.5 py-1 rounded-full text-xs font-black text-[#2D3142]">
              Héroe: {character.name} {character.badge}
            </span>
            <span className="bg-[#E0F2FE] border-2 border-[#2D3142] px-3.5 py-1 rounded-full text-xs font-black text-[#0369A1]">
              Puntaje Ecológico: {totalScore} Pts
            </span>
            <span className="bg-[#DCFCE7] border-2 border-[#2D3142] px-3.5 py-1 rounded-full text-xs font-black text-[#15803D]">
              Calidad de Aire: 100% Puro 🌱
            </span>
          </div>
        </div>

        {/* 📖 MENSAJE REFLEXIVO EDUCATIVO (Para 5º grado / 10-11 años) */}
        <div className="bg-[#FFF9EC] border-3 border-[#FF8A3D] rounded-2xl p-6 mb-6 shadow-[4px_4px_0_#2D3142]">
          <div className="flex items-center gap-2 text-[#FF8A3D] font-black text-sm uppercase mb-2">
            <Sparkles className="w-5 h-5 fill-[#FF8A3D]" />
            <span>Reflexión para la Vida Real · ¿Qué nos enseña este juego?</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#2D3142] mb-3 leading-snug">
            El verdadero monstruo no vive en una planta química: ¡es la basura que no separamos!
          </h2>

          <p className="text-sm sm:text-base text-[#4F5D75] leading-relaxed mb-4">
            En el juego descubriste que cuando la basura se acumula sin clasificar, el aire se vuelve denso y <strong>casi imposible de respirar</strong>. En el mundo real ocurre lo mismo:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-white border-2 border-[#2D3142] p-3.5 rounded-xl">
              <div className="text-2xl mb-1.5">🫁</div>
              <h3 className="font-black text-xs text-[#2D3142] uppercase mb-1">
                Salud y Respiración
              </h3>
              <p className="text-xs text-[#4F5D75] leading-relaxed">
                Los botaderos a cielo abierto producen metano y humo que causan asma y enfermedades pulmonares en niños y adultos mayores.
              </p>
            </div>

            <div className="bg-white border-2 border-[#2D3142] p-3.5 rounded-xl">
              <div className="text-2xl mb-1.5">🌡️</div>
              <h3 className="font-black text-xs text-[#2D3142] uppercase mb-1">
                Calentamiento Global
              </h3>
              <p className="text-xs text-[#4F5D75] leading-relaxed">
                Fabricar plástico nuevo gasta mucho petróleo y energía. Reciclar ahorra hasta un 80% de emisiones que calientan el planeta.
              </p>
            </div>

            <div className="bg-white border-2 border-[#2D3142] p-3.5 rounded-xl">
              <div className="text-2xl mb-1.5">🌱</div>
              <h3 className="font-black text-xs text-[#2D3142] uppercase mb-1">
                La Gran Solución
              </h3>
              <p className="text-xs text-[#4F5D75] leading-relaxed">
                ¡Separar en casa y en la escuela! Plásticos limpios, papel seco y aprovechar las cáscaras de fruta para crear abono natural.
              </p>
            </div>
          </div>

          <div className="bg-[#DCFCE7] border-2 border-[#3DCB6C] p-3.5 rounded-xl flex items-center gap-3">
            <Trees className="w-8 h-8 text-[#15803D] shrink-0" />
            <p className="text-xs sm:text-sm font-bold text-[#15803D] leading-snug">
              "Si 10 amigos en la escuela reducen una sola botella de plástico al día, habrán evitado más de 3.000 botellas al año. ¡Pequeñas acciones limpian ciudades enteras!"
            </p>
          </div>
        </div>

        {/* Diploma Certificate Box */}
        <div className="bg-[#FFFDF7] border-3 border-[#2D3142] rounded-2xl p-5 mb-8 text-center shadow-[3px_3px_0_#2D3142]">
          <div className="text-xs font-black uppercase text-[#4F5D75] tracking-widest mb-1">
            Certificado Oficial de Mérito Cívico
          </div>
          <div className="text-xl font-extrabold text-[#2D3142]">
            Guardián Ambiental de Quinto Grado
          </div>
          <div className="text-xs text-[#FF8A3D] font-bold mt-1">
            Otorgado con honor a quien completó los 5 niveles de City Basura
          </div>
          <div className="text-[11px] text-[#4F5D75] font-mono mt-2 pt-2 border-t border-[#FFF3D6]">
            Desarrollado y diseñado por: <strong className="text-[#2D3142]">Los gatos brasileños</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto bg-[#FF8A3D] hover:bg-[#ff771f] text-white font-black text-base px-6 py-3.5 rounded-2xl border-4 border-[#2D3142] shadow-[4px_4px_0_#2D3142] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Jugar con Otro Personaje</span>
          </button>

          <button
            onClick={onDownloadSingleFileHtml}
            className="w-full sm:w-auto bg-[#3DCB6C] hover:bg-[#34b760] text-white font-black text-base px-7 py-3.5 rounded-2xl border-4 border-[#2D3142] shadow-[4px_4px_0_#2D3142] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
            title="Descarga el juego completo en 1 solo archivo .html para Visual Studio Code"
          >
            <Download className="w-5 h-5 stroke-[3]" />
            <span>Descargar Código HTML para VS Code</span>
          </button>
        </div>
      </div>
    </div>
  );
};
