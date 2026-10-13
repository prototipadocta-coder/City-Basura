import React, { useState } from 'react';
import { Users, Wifi, PlusCircle, LogIn, CheckCircle2, X } from 'lucide-react';
import { MultiplayerLobby } from '../../types/game';
import { soundManager } from '../../utils/audio';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMultiplayerGame: (roomName: string) => void;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  onStartMultiplayerGame,
}) => {
  const [lobbies, setLobbies] = useState<MultiplayerLobby[]>([
    {
      id: '1',
      name: 'Comuna 13 - Eco Brigada',
      location: 'Medellín',
      currentPlayers: 3,
      maxPlayers: 4,
      status: 'Abierta',
      ping: 28,
    },
    {
      id: '2',
      name: 'Bogotá Séptima Limpia',
      location: 'Bogotá',
      currentPlayers: 2,
      maxPlayers: 4,
      status: 'Abierta',
      ping: 35,
    },
    {
      id: '3',
      name: 'Cali Río Verde Recicla',
      location: 'Cali',
      currentPlayers: 1,
      maxPlayers: 4,
      status: 'Abierta',
      ping: 42,
    },
    {
      id: '4',
      name: 'Cartagena Playa Sin Plástico',
      location: 'Cartagena',
      currentPlayers: 4,
      maxPlayers: 4,
      status: 'Llena',
      ping: 55,
    },
  ]);

  const [newRoomName, setNewRoomName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    soundManager.playClick();
    const newLobby: MultiplayerLobby = {
      id: Date.now().toString(),
      name: newRoomName.trim(),
      location: 'Colombia Local',
      currentPlayers: 1,
      maxPlayers: 4,
      status: 'Abierta',
      ping: 15,
    };
    setLobbies([newLobby, ...lobbies]);
    setNewRoomName('');
    setShowCreate(false);
  };

  const handleJoin = (lobby: MultiplayerLobby) => {
    if (lobby.status === 'Llena') return;
    soundManager.playClick();
    setConnectingId(lobby.id);
    setTimeout(() => {
      onStartMultiplayerGame(lobby.name);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl voxel-modal-frame rounded-2xl p-6 text-white font-['Pixelify_Sans',sans-serif] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-700 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center border-2 border-black shadow-[2px_2px_0_#000]">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-wide text-pixel-stroke">
                Multijugador Cooperativo
              </h2>
              <span className="text-xs text-purple-300 font-mono">
                Limpia la ciudad junto a otros jugadores en línea
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

        {/* Action bar */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <span className="text-xs text-slate-300 uppercase tracking-wider">
            Salas Disponibles ({lobbies.length})
          </span>
          <button
            onClick={() => {
              soundManager.playClick();
              setShowCreate(!showCreate);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-700 hover:bg-purple-600 border-2 border-black shadow-[2px_2px_0_#000] flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            {showCreate ? 'Cancelar' : 'Crear Sala'}
          </button>
        </div>

        {/* Create room form */}
        {showCreate && (
          <form onSubmit={handleCreateRoom} className="mb-3 p-3 bg-purple-950/60 border-2 border-purple-600 rounded-xl flex gap-2">
            <input
              type="text"
              placeholder="Nombre de la nueva sala..."
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-600 px-3 py-1.5 rounded text-sm text-white focus:outline-hidden"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded border border-black shadow cursor-pointer"
            >
              Publicar
            </button>
          </form>
        )}

        {/* Lobbies List */}
        <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
          {lobbies.map((lobby) => {
            const isFull = lobby.status === 'Llena';
            const isConnecting = connectingId === lobby.id;
            return (
              <div
                key={lobby.id}
                className="bg-slate-800/80 border-2 border-slate-700 hover:border-slate-500 rounded-xl p-3.5 flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-base text-white">{lobby.name}</span>
                    <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                      {lobby.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      {lobby.currentPlayers}/{lobby.maxPlayers} Jugadores
                    </span>
                    <span className="flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                      {lobby.ping} ms
                    </span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => handleJoin(lobby)}
                    disabled={isFull || isConnecting}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                      isConnecting
                        ? 'bg-amber-600 border-black text-white animate-pulse'
                        : isFull
                        ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-500 border-black shadow-[2px_2px_0_#000] text-white'
                    }`}
                  >
                    {isConnecting ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Conectando...
                      </>
                    ) : isFull ? (
                      'Llena'
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" /> Unirse
                      </>
                    )}
                  </button>
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
            className="voxel-btn-purple px-6 py-2 rounded-lg text-sm font-bold text-white cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
