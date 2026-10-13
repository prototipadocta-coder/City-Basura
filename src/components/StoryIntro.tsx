import React, { useState } from 'react';
import { cartoonAudio } from '../utils/cartoonAudio';
import { ArrowRight, Wind, AlertTriangle, ShieldCheck, HeartHandshake } from 'lucide-react';

interface StoryIntroProps {
  onStartGame: () => void;
}

export const StoryIntro: React.FC<StoryIntroProps> = ({ onStartGame }) => {
  const [step, setStep] = useState<'story' | 'problem'>('story');

  const handleNextToProblem = () => {
    cartoonAudio.playBoing();
    setStep('problem');
  };

  const handleBegin = () => {
    cartoonAudio.playRecyclePop();
    onStartGame();
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 py-6 font-['Rubik',sans-serif] select-none">
      {step === 'story' ? (
        /* STEP 1: HISTORIA Y CONTEXTO INICIAL */
        <div className="bg-[#FFFDF7] border-4 border-[#2D3142] rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0_#2D3142] animate-in fade-in zoom-in-95 duration-200">
          {/* Header Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b-4 border-[#FFF3D6] pb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">📖</span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D3142] tracking-wide uppercase">
                  City Basura
                </h1>
                <p className="text-xs sm:text-sm font-bold text-[#FF8A3D]">
                  Historia Inicial · Creado por: Los gatos brasileños
                </p>
              </div>
            </div>

            <div className="bg-[#FFF3D6] border-2 border-[#2D3142] px-3.5 py-1.5 rounded-full text-xs font-black text-[#2D3142]">
              Capítulo 1: El Origen
            </div>
          </div>

          {/* Cartoon Scene Visuals (Illustrations using SVG cartoon shapes) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Panel 1: Descuido humano y calentamiento global */}
            <div className="bg-[#FFF3D6] border-3 border-[#2D3142] rounded-2xl p-4 text-center shadow-[4px_4px_0_#2D3142] flex flex-col items-center">
              <div className="w-20 h-20 bg-[#FF8A3D]/20 rounded-full flex items-center justify-center text-4xl mb-3 border-2 border-[#FF8A3D]">
                🌍🔥
              </div>
              <h3 className="font-extrabold text-sm text-[#2D3142] uppercase mb-1">
                El Descuido
              </h3>
              <p className="text-xs text-[#4F5D75] leading-relaxed">
                Los humanos no cuidaban el medio ambiente, se generaba demasiada basura y comenzó un calentamiento global descontrolado.
              </p>
            </div>

            {/* Panel 2: Terremoto y Planta Tóxica */}
            <div className="bg-[#FFF3D6] border-3 border-[#2D3142] rounded-2xl p-4 text-center shadow-[4px_4px_0_#2D3142] flex flex-col items-center">
              <div className="w-20 h-20 bg-[#EF4444]/20 rounded-full flex items-center justify-center text-4xl mb-3 border-2 border-[#EF4444]">
                ⚡☣️
              </div>
              <h3 className="font-extrabold text-sm text-[#2D3142] uppercase mb-1">
                El Terremoto
              </h3>
              <p className="text-xs text-[#4F5D75] leading-relaxed">
                Días después ocurrió un terremoto. Mucha basura cayó dentro de una planta química tóxica abandonada...
              </p>
            </div>

            {/* Panel 3: Nace Mr.Basura y la Ciudad en Peligro */}
            <div className="bg-[#FFF3D6] border-3 border-[#2D3142] rounded-2xl p-4 text-center shadow-[4px_4px_0_#2D3142] flex flex-col items-center">
              <div className="w-20 h-20 bg-[#3DCB6C]/20 rounded-full flex items-center justify-center text-4xl mb-3 border-2 border-[#3DCB6C]">
                👾💨
              </div>
              <h3 className="font-extrabold text-sm text-[#2D3142] uppercase mb-1">
                Nace Mr.Basura
              </h3>
              <p className="text-xs text-[#4F5D75] leading-relaxed">
                ¡Los residuos se convirtieron en un monstruo gigante que riega basura por todas partes dejando la ciudad en desastre total!
              </p>
            </div>
          </div>

          {/* Historical Narrative Card with the exact text requested */}
          <div className="bg-[#FFF9EC] border-3 border-[#FF8A3D] rounded-2xl p-5 mb-8 relative">
            <span className="absolute -top-3 left-6 bg-[#FF8A3D] text-white text-[11px] font-black uppercase px-3 py-0.5 rounded-full border border-[#2D3142]">
              Relato Original
            </span>
            <p className="text-sm sm:text-base text-[#2D3142] font-medium leading-relaxed italic">
              "Los humanos no cuidaban el medio ambiente y se generaba mucha basura y ocurría un calentamiento global. Unos días después hubo un terremoto y muchas basuras cayeron en una planta tóxica, se convirtieron en el monstruo de la basura regando basura por todas partes, la ciudad era un desastre total, pero un grupo de amigos que estaban cerca de la ciudad se enteró de lo sucedido y combatieron al monstruo."
            </p>
          </div>

          {/* Call to action button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#4F5D75]">
              <HeartHandshake className="w-4 h-4 text-[#3DCB6C]" />
              <span>Los amigos están listos para entrar en acción</span>
            </div>

            <button
              onClick={handleNextToProblem}
              className="w-full sm:w-auto bg-[#FF8A3D] hover:bg-[#ff771f] text-white font-black text-lg px-8 py-3.5 rounded-2xl border-4 border-[#2D3142] shadow-[5px_5px_0_#2D3142] active:translate-y-1 active:shadow-[1px_1px_0_#2D3142] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ver la Problemática</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>
      ) : (
        /* STEP 2: LA PROBLEMÁTICA PRINCIPAL */
        <div className="bg-[#FFFDF7] border-4 border-[#2D3142] rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0_#2D3142] animate-in fade-in zoom-in-95 duration-200">
          {/* Header Alert */}
          <div className="flex items-center gap-3 mb-6 bg-[#FEE2E2] border-3 border-[#EF4444] rounded-2xl p-4">
            <div className="w-12 h-12 bg-[#EF4444] rounded-xl flex items-center justify-center text-white shrink-0 border-2 border-[#2D3142]">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#EF4444]">
                ¡Alerta Ambiental Máxima!
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#2D3142]">
                La Problemática que Debes Resolver
              </h2>
            </div>
          </div>

          {/* Problem Explanation */}
          <div className="bg-[#FFF3D6] border-3 border-[#2D3142] rounded-2xl p-6 mb-6 shadow-[4px_4px_0_#2D3142]">
            <div className="flex items-center gap-3 mb-3">
              <Wind className="w-8 h-8 text-[#FF8A3D] animate-spin" style={{ animationDuration: '6s' }} />
              <h3 className="text-lg sm:text-xl font-black text-[#2D3142]">
                "Había tanta basura que era casi imposible respirar"
              </h3>
            </div>
            <p className="text-sm sm:text-base text-[#4F5D75] leading-relaxed mb-4">
              Cuando la basura se acumula sin clasificar, se pudre y se mezcla con químicos tóxicos, liberando gases como el metano y partículas pesadas. En <strong className="text-[#FF8A3D]">City Basura</strong>, el humo espeso de Mr.Basura está tapando el sol y agotando el oxígeno de los habitantes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-white border-2 border-[#2D3142] p-3 rounded-xl">
                <div className="font-black text-xs text-[#EF4444] uppercase mb-1">
                  ❌ Si no recoges a tiempo:
                </div>
                <p className="text-xs text-[#4F5D75]">
                  El medidor de aire puro bajará a cero, la niebla cubrirá todo y la misión fallará.
                </p>
              </div>

              <div className="bg-white border-2 border-[#2D3142] p-3 rounded-xl">
                <div className="font-black text-xs text-[#3DCB6C] uppercase mb-1">
                  ✅ Si clasificas y reciclas:
                </div>
                <p className="text-xs text-[#4F5D75]">
                  El oxígeno subirá, el cielo se volverá azul brillante y debilitarás al monstruo.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Guide to Bins */}
          <div className="mb-8">
            <h4 className="text-xs font-black uppercase text-[#2D3142] mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3DCB6C]" />
              Aprende a usar los contenedores ecológicos en el juego:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-blue-100 border-2 border-blue-600 rounded-xl p-2.5">
                <div className="text-2xl mb-1">🧴</div>
                <div className="font-black text-blue-800">Azul: Plásticos</div>
                <div className="text-[10px] text-blue-600">Botellas, bolsas, tapas</div>
              </div>
              <div className="bg-gray-100 border-2 border-gray-600 rounded-xl p-2.5">
                <div className="text-2xl mb-1">📄</div>
                <div className="font-black text-gray-800">Gris: Papel y Cartón</div>
                <div className="text-[10px] text-gray-600">Cajas, periódicos, hojas</div>
              </div>
              <div className="bg-emerald-100 border-2 border-emerald-600 rounded-xl p-2.5">
                <div className="text-2xl mb-1">🍎</div>
                <div className="font-black text-emerald-800">Verde: Orgánico</div>
                <div className="text-[10px] text-emerald-600">Cáscaras, restos de frutas</div>
              </div>
              <div className="bg-amber-100 border-2 border-amber-600 rounded-xl p-2.5">
                <div className="text-2xl mb-1">🍾</div>
                <div className="font-black text-amber-800">Amarillo: Vidrio</div>
                <div className="text-[10px] text-amber-600">Frascos y botellas</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => setStep('story')}
              className="text-xs font-black text-[#4F5D75] hover:text-[#2D3142] underline cursor-pointer"
            >
              ← Volver a leer la historia
            </button>

            <button
              onClick={handleBegin}
              className="w-full sm:w-auto bg-[#3DCB6C] hover:bg-[#34b760] text-white font-black text-xl px-10 py-4 rounded-2xl border-4 border-[#2D3142] shadow-[6px_6px_0_#2D3142] active:translate-y-1 active:shadow-[2px_2px_0_#2D3142] transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
            >
              <span>¡Entendido! Elegir Mi Personaje</span>
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
