import React, { useState } from 'react';
import { ShoppingCart, Coins, Check, Wrench, Shirt, Zap, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ShopItem } from '../../types/game';
import { soundManager } from '../../utils/audio';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  ecoCoins: number;
  onBuyItem: (itemId: string, price: number) => void;
  onEquipItem: (itemId: string) => void;
  items: ShopItem[];
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  ecoCoins,
  onBuyItem,
  onEquipItem,
  items,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'tool' | 'skin' | 'boost'>('all');

  if (!isOpen) return null;

  const filteredItems = items.filter(
    (item) => activeTab === 'all' || item.category === activeTab
  );

  const handleBuy = (item: ShopItem) => {
    if (ecoCoins < item.price) return;
    soundManager.playShopBuy();
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#22c55e', '#facc15', '#38bdf8'],
    });
    onBuyItem(item.id, item.price);
  };

  const handleEquip = (item: ShopItem) => {
    soundManager.playClick();
    onEquipItem(item.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl voxel-modal-frame rounded-2xl p-6 text-white font-['Pixelify_Sans',sans-serif] max-h-[90vh] flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b-2 border-slate-700 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000]">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-wide text-pixel-stroke">
                Tienda del Barrio
              </h2>
              <span className="text-xs text-red-300 font-mono">
                Mejora tu equipo de reciclaje y estilo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Eco Coins Display */}
            <div className="flex items-center gap-2 bg-slate-900 border-2 border-amber-500/80 px-3 py-1.5 rounded-lg shadow-[2px_2px_0_#000]">
              <Coins className="w-5 h-5 text-amber-400" />
              <span className="text-lg font-bold text-amber-400 font-['Rubik',sans-serif]">
                {ecoCoins}
              </span>
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
        </div>

        {/* Categories Tab */}
        <div className="flex gap-2 mb-4 shrink-0 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-red-600 border-black shadow-[2px_2px_0_#000]'
                : 'bg-slate-800 border-slate-700 hover:border-slate-500'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveTab('tool')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'tool'
                ? 'bg-red-600 border-black shadow-[2px_2px_0_#000]'
                : 'bg-slate-800 border-slate-700 hover:border-slate-500'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Herramientas
          </button>
          <button
            onClick={() => setActiveTab('skin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'skin'
                ? 'bg-red-600 border-black shadow-[2px_2px_0_#000]'
                : 'bg-slate-800 border-slate-700 hover:border-slate-500'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            Ropa y Skins
          </button>
          <button
            onClick={() => setActiveTab('boost')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'boost'
                ? 'bg-red-600 border-black shadow-[2px_2px_0_#000]'
                : 'bg-slate-800 border-slate-700 hover:border-slate-500'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Mejoras
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 flex-1">
          {filteredItems.map((item) => {
            const canAfford = ecoCoins >= item.price;
            return (
              <div
                key={item.id}
                className="bg-slate-800/80 border-2 border-slate-700 rounded-xl p-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-base text-white">{item.name}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                      {item.category === 'tool' ? 'Herramienta' : item.category === 'skin' ? 'Aspecto' : 'Mejora'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-snug mb-3">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 mt-auto">
                  {!item.purchased ? (
                    <>
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold font-['Rubik',sans-serif]">
                        <Coins className="w-4 h-4" />
                        <span>{item.price}</span>
                      </div>
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer ${
                          canAfford
                            ? 'bg-emerald-600 hover:bg-emerald-500 border-black shadow-[2px_2px_0_#000] text-white'
                            : 'bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed opacity-60'
                        }`}
                      >
                        Comprar
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Adquirido
                      </span>
                      <button
                        onClick={() => handleEquip(item)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer ${
                          item.equipped
                            ? 'bg-slate-900 border-emerald-500 text-emerald-400'
                            : 'bg-blue-600 hover:bg-blue-500 border-black shadow-[2px_2px_0_#000] text-white'
                        }`}
                      >
                        {item.equipped ? 'Equipado' : 'Equipar'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-700 flex justify-end shrink-0">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="voxel-btn-red px-6 py-2 rounded-lg text-sm font-bold text-white cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
