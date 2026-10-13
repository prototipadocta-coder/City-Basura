import React, { useState } from 'react';
import { User, Play, ShoppingCart, Settings, Users, Volume2, VolumeX, Maximize2, BookOpen, Download } from 'lucide-react';
import { TitleLogo } from './components/TitleLogo';
import { MenuButton } from './components/MenuButton';
import { FirstPersonArm } from './components/FirstPersonArm';
import { CityStreetBackdrop } from './components/CityStreetBackdrop';
import { UserModal } from './components/modals/UserModal';
import { LevelSelectModal } from './components/modals/LevelSelectModal';
import { ShopModal } from './components/modals/ShopModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { MultiplayerModal } from './components/modals/MultiplayerModal';
import { StoryIntro } from './components/StoryIntro';
import { VictoryReflectionModal } from './components/VictoryReflectionModal';
import { FirstPersonGame } from './components/game/FirstPersonGame';
import { UserProfile, ShopItem, GameSettings, Character, LevelConfig } from './types/game';
import { CHARACTERS, GAME_LEVELS } from './data/characters';
import { soundManager } from './utils/audio';

export default function App() {
  // Screen routing: 'menu' | 'story' | 'playing' | 'victory'
  const [screen, setScreen] = useState<'menu' | 'story' | 'playing' | 'victory'>('menu');
  const [activeMultiplayerRoom, setActiveMultiplayerRoom] = useState<string | undefined>(undefined);

  // Active modal in menu: 'user' | 'level-select' | 'shop' | 'settings' | 'multiplayer' | null
  const [activeModal, setActiveModal] = useState<'user' | 'level-select' | 'shop' | 'settings' | 'multiplayer' | null>(null);

  // Selected hero character (Juan by default)
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(CHARACTERS[0]);

  // Current active level
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(GAME_LEVELS[0]);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  // User profile state
  const [profile, setProfile] = useState<UserProfile>({
    nickname: 'Juan',
    selectedCharacterId: 'juan',
    avatarSkin: 'steve',
    level: 3,
    xp: 420,
    nextLevelXp: 800,
    ecoCoins: 480,
    totalTrashCollected: 164,
    totalRecycledKg: 42.5,
    cityCleanlinessScore: 60,
    activeTitle: 'El Líder Veloz',
    unlockedTitles: ['Reciclador Novato', 'Héroe del Barrio', 'El Líder Veloz'],
  });

  // Shop inventory
  const [shopItems, setShopItems] = useState<ShopItem[]>([
    {
      id: 'tool_grabber',
      name: 'Garra Mecánica Voxel',
      category: 'tool',
      description: 'Aumenta el rango de recogida de basura un +50%.',
      price: 150,
      iconName: 'Wrench',
      purchased: true,
      equipped: true,
    },
    {
      id: 'tool_vacuum',
      name: 'Aspiradora Eco-Turbo',
      category: 'tool',
      description: 'Aspira residuos a mayor velocidad y purifica el aire.',
      price: 450,
      iconName: 'Zap',
      purchased: false,
    },
    {
      id: 'skin_colombia',
      name: 'Camiseta Tricolor #10',
      category: 'skin',
      description: 'Luce los colores de Colombia mientras limpias la ciudad.',
      price: 200,
      iconName: 'Shirt',
      purchased: true,
      equipped: false,
    },
    {
      id: 'skin_overol',
      name: 'Overol Reflectivo Pro',
      category: 'skin',
      description: 'Alta visibilidad para combatir el smog de Mr.Basura.',
      price: 300,
      iconName: 'Shirt',
      purchased: false,
    },
    {
      id: 'boost_filter',
      name: 'Filtro de Aire Portátil',
      category: 'boost',
      description: 'Reduce el impacto del smog en tu medidor de oxígeno.',
      price: 250,
      iconName: 'Zap',
      purchased: false,
    },
  ]);

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    masterVolume: 0.8,
    sfxVolume: 0.8,
    musicVolume: 0.5,
    isMuted: false,
    graphicsQuality: 'alta',
    fov: 75,
    mouseSensitivity: 1.0,
    invertY: false,
    crtFilter: false,
    showFps: true,
    language: 'es',
  });

  const toggleMute = () => {
    const newMuted = !settings.isMuted;
    soundManager.isMuted = newMuted;
    setSettings((prev) => ({ ...prev, isMuted: newMuted }));
  };

  const toggleFullscreen = () => {
    soundManager.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleDownloadSingleFile = () => {
    soundManager.playClick();
    const link = document.createElement('a');
    link.href = '/city_basura_completo.html';
    link.download = 'city_basura_completo.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBuyItem = (itemId: string, price: number) => {
    setProfile((prev) => ({ ...prev, ecoCoins: prev.ecoCoins - price }));
    setShopItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, purchased: true, equipped: true } : item))
    );
  };

  const handleEquipItem = (itemId: string) => {
    setShopItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, equipped: !item.equipped } : item
      )
    );
  };

  const handleStartLevel = (lvl: LevelConfig) => {
    setActiveModal(null);
    setCurrentLevel(lvl);
    setScreen('playing');
  };

  const handleLevelComplete = (points: number, levelNum: number) => {
    setTotalScore((prev) => prev + points);
    setProfile((prev) => ({
      ...prev,
      ecoCoins: prev.ecoCoins + 80,
      totalTrashCollected: prev.totalTrashCollected + currentLevel.targetTrash,
      totalRecycledKg: Number((prev.totalRecycledKg + currentLevel.targetTrash * 0.7).toFixed(1)),
      level: prev.level + 1,
    }));

    if (!completedLevels.includes(levelNum)) {
      setCompletedLevels((prev) => [...prev, levelNum]);
    }

    if (levelNum === 5) {
      // Victory in Level 5 (Nivel Dios vs Mr.Basura) -> Show Educational Reflection
      setScreen('victory');
    } else {
      // Advance to next level or return to level selector
      const nextIndex = GAME_LEVELS.findIndex((l) => l.number === levelNum + 1);
      if (nextIndex !== -1) {
        setCurrentLevel(GAME_LEVELS[nextIndex]);
      }
      setActiveModal('level-select');
      setScreen('menu');
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Pixelify_Sans',sans-serif]">
      {/* Optional CRT scanline overlay */}
      {settings.crtFilter && (
        <div
          className="fixed inset-0 pointer-events-none z-50 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
            backgroundSize: '100% 4px',
          }}
        />
      )}

      {/* Screen Router */}
      {screen === 'story' ? (
        <div className="relative w-full h-full flex flex-col justify-between overflow-y-auto bg-[#FFF3D6] p-4 sm:p-6">
          <header className="flex justify-between items-center max-w-4xl mx-auto w-full mb-4">
            <span className="text-sm font-bold text-[#FF8A3D] uppercase">
              Historia y Contexto · Creado por: Los gatos brasileños
            </span>
            <button
              onClick={() => setScreen('menu')}
              className="bg-[#2D3142] text-white px-4 py-2 rounded-xl text-xs font-bold border-2 border-black cursor-pointer shadow-[2px_2px_0_#000]"
            >
              ← Volver al Menú
            </button>
          </header>
          <StoryIntro
            onStartGame={() => {
              setActiveModal('level-select');
              setScreen('menu');
            }}
          />
        </div>
      ) : screen === 'victory' ? (
        <div className="relative w-full h-full flex flex-col justify-center items-center overflow-y-auto bg-[#FFF3D6] p-4 sm:p-6">
          <VictoryReflectionModal
            character={selectedCharacter}
            totalScore={totalScore}
            onPlayAgain={() => {
              setScreen('menu');
              setActiveModal('level-select');
            }}
            onDownloadSingleFileHtml={handleDownloadSingleFile}
          />
        </div>
      ) : screen === 'playing' ? (
        /* 3D FIRST PERSON GAME MODE (BASED ON FIRST IMAGE) */
        <FirstPersonGame
          onReturnToMenu={() => setScreen('menu')}
          onLevelComplete={handleLevelComplete}
          character={selectedCharacter}
          level={currentLevel}
          roomName={activeMultiplayerRoom}
          quality={settings.graphicsQuality}
          fov={settings.fov}
        />
      ) : (
        /* INITIAL SCREEN (MATCHING FIRST IMAGE EXACTLY) */
        <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 md:p-8">
          {/* City Street Voxel Backdrop */}
          <CityStreetBackdrop />

          {/* Top Bar Utilities */}
          <div className="relative z-30 w-full flex items-center justify-between max-w-6xl pointer-events-auto">
            {/* Credits and Eco-Coins */}
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 bg-slate-900/85 border-2 border-black px-3.5 py-1.5 rounded-xl shadow-[3px_3px_0_#000] cursor-pointer hover:border-amber-400 transition-colors"
                onClick={() => {
                  soundManager.playClick();
                  setActiveModal('shop');
                }}
              >
                <span className="text-lg">🪙</span>
                <span className="text-sm sm:text-base font-bold text-amber-300 font-['Rubik',sans-serif]">
                  {profile.ecoCoins}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono hidden sm:inline">
                  Eco-Monedas
                </span>
              </div>

              {/* Creator badge */}
              <div className="hidden md:flex items-center gap-1.5 bg-slate-900/85 border-2 border-black px-3 py-1.5 rounded-xl text-xs text-amber-300 font-bold shadow-[2px_2px_0_#000]">
                <span>🐱🇧🇷 Creado por: Los gatos brasileños</span>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              {/* Story Context Button */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  setScreen('story');
                }}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 border-2 border-black px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-[3px_3px_0_#000] cursor-pointer"
                title="Leer la historia y contexto de City Basura"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Historia</span>
              </button>

              {/* Download standalone HTML for VS Code */}
              <button
                onClick={handleDownloadSingleFile}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 border-2 border-black px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-[3px_3px_0_#000] cursor-pointer"
                title="Descargar código completo en 1 solo archivo HTML para Visual Studio Code"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">HTML VS Code</span>
              </button>

              {/* Audio toggle */}
              <button
                onClick={toggleMute}
                className="w-10 h-10 rounded-xl bg-slate-900/85 border-2 border-black hover:border-white/50 flex items-center justify-center text-white shadow-[3px_3px_0_#000] cursor-pointer transition-colors"
                title={settings.isMuted ? 'Activar sonido' : 'Silenciar sonido'}
              >
                {settings.isMuted ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-emerald-400" />
                )}
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="w-10 h-10 rounded-xl bg-slate-900/85 border-2 border-black hover:border-white/50 flex items-center justify-center text-white shadow-[3px_3px_0_#000] cursor-pointer transition-colors"
                title="Pantalla completa"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Column: Title Logo + The 5 Buttons */}
          <div className="relative z-30 flex flex-col items-center justify-center my-auto w-full max-w-md sm:max-w-lg px-4">
            {/* Title: "CITY BASURA" */}
            <TitleLogo className="mb-4 sm:mb-6" />

            {/* Menu Buttons Stack (Exact order, icons and colors as reference image) */}
            <div className="flex flex-col items-center w-full gap-2.5 sm:gap-3.5">
              {/* 1. Blue Button: Usuario (Character selector for 11 friends) */}
              <MenuButton
                label={`Usuario (${selectedCharacter.name})`}
                icon={<User className="w-6 h-6 fill-white" />}
                variant="blue"
                onClick={() => setActiveModal('user')}
              />

              {/* 2. Green Button: Jugar (Level select & 3D Play) */}
              <MenuButton
                label="Jugar"
                icon={<Play className="w-6 h-6 fill-white" />}
                variant="green"
                onClick={() => setActiveModal('level-select')}
              />

              {/* 3. Red Button: Tienda */}
              <MenuButton
                label="Tienda"
                icon={<ShoppingCart className="w-6 h-6 stroke-[2.5]" />}
                variant="red"
                onClick={() => setActiveModal('shop')}
              />

              {/* 4. Gray Button: Configuración */}
              <MenuButton
                label="Configuración"
                icon={<Settings className="w-6 h-6 stroke-[2.5]" />}
                variant="gray"
                onClick={() => setActiveModal('settings')}
              />

              {/* 5. Purple Button: Multijugador */}
              <MenuButton
                label="Multijugador"
                icon={<Users className="w-6 h-6 fill-white" />}
                variant="purple"
                onClick={() => setActiveModal('multiplayer')}
              />
            </div>
          </div>

          {/* First-Person Voxel Player Arm (Bottom Right Corner) */}
          <FirstPersonArm
            onArmClick={() => {
              soundManager.playClick();
              setActiveModal('level-select');
            }}
          />

          {/* Bottom subtle copyright / credits note */}
          <div className="relative z-20 text-[11px] text-slate-300 font-mono text-center opacity-85 pb-1 pointer-events-none drop-shadow-md">
            <span>City Basura © 2026 · Creado por: Los gatos brasileños · Videojuego en 1ª Persona</span>
          </div>

          {/* Modals */}
          <UserModal
            isOpen={activeModal === 'user'}
            onClose={() => setActiveModal(null)}
            profile={profile}
            onUpdateProfile={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
            selectedCharacter={selectedCharacter}
            onSelectCharacter={(char) => {
              setSelectedCharacter(char);
              setProfile((prev) => ({ ...prev, nickname: char.name, activeTitle: char.role }));
            }}
          />

          <LevelSelectModal
            isOpen={activeModal === 'level-select'}
            onClose={() => setActiveModal(null)}
            selectedCharacter={selectedCharacter}
            completedLevels={completedLevels}
            onStartLevel={handleStartLevel}
          />

          <ShopModal
            isOpen={activeModal === 'shop'}
            onClose={() => setActiveModal(null)}
            ecoCoins={profile.ecoCoins}
            items={shopItems}
            onBuyItem={handleBuyItem}
            onEquipItem={handleEquipItem}
          />

          <SettingsModal
            isOpen={activeModal === 'settings'}
            onClose={() => setActiveModal(null)}
            settings={settings}
            onUpdateSettings={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
          />

          <MultiplayerModal
            isOpen={activeModal === 'multiplayer'}
            onClose={() => setActiveModal(null)}
            onStartMultiplayerGame={(room) => {
              setActiveModal(null);
              setActiveMultiplayerRoom(room);
              setCurrentLevel(GAME_LEVELS[0]);
              setScreen('playing');
            }}
          />
        </div>
      )}
    </main>
  );
}
