import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Character, LevelConfig, Trash, Bin } from '../types/cartoonGame';
import { cartoonAudio } from '../utils/cartoonAudio';
import { Wind, Heart, Star, Clock, AlertTriangle, ArrowLeft, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameCanvasProps {
  character: Character;
  level: LevelConfig;
  onLevelComplete: (score: number, airQuality: number) => void;
  onGameOver: (reason: string) => void;
  onExitToLevels: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  character,
  level,
  onLevelComplete,
  onGameOver,
  onExitToLevels,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reactive state for HUD
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);
  const [airQuality, setAirQuality] = useState(80); // 0 to 100%
  const [carriedTrash, setCarriedTrash] = useState<Trash | null>(null);
  const [bossHp, setBossHp] = useState(100);
  const [combo, setCombo] = useState(0);
  const [isMuted, setIsMuted] = useState(cartoonAudio.isMuted);

  // Engine internal refs
  const stateRef = useRef<{
    playerX: number;
    playerY: number;
    playerWidth: number;
    playerHeight: number;
    playerDir: 'left' | 'right';
    isMoving: boolean;
    keys: { [key: string]: boolean };
    trashes: Trash[];
    bins: Bin[];
    particles: { x: number; y: number; vx: number; vy: number; color: string; life: number; text?: string }[];
    bossX: number;
    bossDir: number;
    lastSpawn: number;
    isFinished: boolean;
  }>({
    playerX: 350,
    playerY: 420,
    playerWidth: 54,
    playerHeight: 70,
    playerDir: 'right',
    isMoving: false,
    keys: {},
    trashes: [],
    bins: [],
    particles: [],
    bossX: 350,
    bossDir: 1,
    lastSpawn: 0,
    isFinished: false,
  });

  // Sound toggle
  const toggleMute = () => {
    const nextMuted = !isMuted;
    cartoonAudio.isMuted = nextMuted;
    setIsMuted(nextMuted);
  };

  // Helper to trigger particle burst
  const addParticles = (x: number, y: number, color: string, text?: string) => {
    const st = stateRef.current;
    if (text) {
      st.particles.push({ x, y: y - 20, vx: 0, vy: -1.2, color, life: 1.0, text });
    }
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
      const speed = 1.5 + Math.random() * 2.5;
      st.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 0.8 + Math.random() * 0.4,
      });
    }
  };

  // Deposit current trash into selected bin
  const depositTrash = useCallback((binType: Bin['type']) => {
    const st = stateRef.current;
    const current = carriedTrash;
    if (!current || st.isFinished) return;

    if (current.correctBin === binType) {
      // Correct classification!
      cartoonAudio.playRecyclePop();
      const pointsEarned = current.points + combo * 5;
      setScore((prev) => {
        const nextScore = prev + pointsEarned;
        // Check if level target reached
        if (nextScore >= level.targetScore && !level.bossMode) {
          st.isFinished = true;
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          setTimeout(() => onLevelComplete(nextScore, airQuality), 500);
        }
        return nextScore;
      });

      // Air improves
      setAirQuality((prev) => Math.min(100, prev + 12));
      setCombo((c) => c + 1);

      // Boss damage if boss mode
      if (level.bossMode) {
        setBossHp((hp) => {
          const nextHp = Math.max(0, hp - 15);
          if (nextHp <= 0 && !st.isFinished) {
            st.isFinished = true;
            confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
            setTimeout(() => onLevelComplete(score + pointsEarned, airQuality), 600);
          }
          return nextHp;
        });
      }

      addParticles(st.playerX, st.playerY - 20, '#3DCB6C', `+${pointsEarned} ¡Reciclado!`);
      setCarriedTrash(null);
    } else {
      // Error: wrong bin
      cartoonAudio.playErrorBuzz();
      setCombo(0);
      setAirQuality((prev) => Math.max(0, prev - 10));
      addParticles(st.playerX, st.playerY - 20, '#EF4444', '¡Contenedor Incorrecto!');
    }
  }, [carriedTrash, combo, level, onLevelComplete, airQuality, score]);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 540;
    canvas.width = width;
    canvas.height = height;

    const st = stateRef.current;
    st.playerX = width / 2;
    st.playerY = height - 120;
    st.isFinished = false;

    // Setup Bins across bottom of screen
    const availableBins: Bin[] = [
      { type: 'blue', label: 'PLÁSTICO', sublabel: '🧴 Botellas/Tapas', color: '#2563EB', x: 70, width: 110 },
      { type: 'gray', label: 'PAPEL', sublabel: '📄 Cartón/Hojas', color: '#64748B', x: 210, width: 110 },
      { type: 'green', label: 'ORGÁNICO', sublabel: '🍎 Cáscaras/Restos', color: '#16A34A', x: 350, width: 110 },
      { type: 'yellow', label: 'VIDRIO', sublabel: '🍾 Frascos/Botellas', color: '#D97706', x: 490, width: 110 },
      { type: 'hazard', label: 'TÓXICO', sublabel: '☢️ Químicos/Peligro', color: '#DC2626', x: 630, width: 110 },
    ];
    st.bins = availableBins;

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      st.keys[e.key] = true;
      st.keys[e.code] = true;

      // Quick hotkeys for bins (1 to 5)
      if (e.key === '1') depositTrash('blue');
      if (e.key === '2') depositTrash('gray');
      if (e.key === '3') depositTrash('green');
      if (e.key === '4') depositTrash('yellow');
      if (e.key === '5') depositTrash('hazard');
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      st.keys[e.key] = false;
      st.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Timer countdown
    const timerInterval = setInterval(() => {
      if (st.isFinished) return;
      setTimeLeft((prev) => {
        if (prev <= 1) {
          st.isFinished = true;
          onGameOver('¡Se agotó el tiempo! El aire sigue contaminado.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Realistic waste generator matching level mission and difficulty
    const spawnTrashItem = () => {
      interface LevelItemDef {
        name: string;
        type: 'plastic' | 'paper' | 'organic' | 'glass' | 'toxic';
        correctBin: Bin['type'];
        emoji: string;
        points: number;
      }

      let itemsPool: LevelItemDef[] = [];

      if (level.number === 1) {
        // Nivel 1: El Barrio Inicial (Domésticos / Escolares)
        itemsPool = [
          { name: 'Botella PET Aplastada', type: 'plastic', correctBin: 'blue', emoji: '🧴', points: 20 },
          { name: 'Lata de Refresco', type: 'plastic', correctBin: 'blue', emoji: '🥤', points: 25 },
          { name: 'Brik de Jugo Escolar', type: 'paper', correctBin: 'gray', emoji: '🧃', points: 20 },
          { name: 'Bolsa de Papas Fritas', type: 'plastic', correctBin: 'blue', emoji: '🥨', points: 15 },
          { name: 'Vaso Plástico', type: 'plastic', correctBin: 'blue', emoji: '🥛', points: 15 },
        ];
      } else if (level.number === 2) {
        // Nivel 2: El Parque Central (Picnic y Orgánicos)
        itemsPool = [
          { name: 'Cáscara de Plátano', type: 'organic', correctBin: 'green', emoji: '🍌', points: 30 },
          { name: 'Manzana Mordida', type: 'organic', correctBin: 'green', emoji: '🍎', points: 25 },
          { name: 'Caja Pizza Grasienta', type: 'organic', correctBin: 'green', emoji: '🍕', points: 20 },
          { name: 'Vaso de Café Térmico', type: 'paper', correctBin: 'gray', emoji: '☕', points: 20 },
          { name: 'Envoltorio Sándwich', type: 'plastic', correctBin: 'blue', emoji: '🥪', points: 20 },
        ];
      } else if (level.number === 3) {
        // Nivel 3: La Gran Avenida (Vidrio Urbano y Tráfico)
        itemsPool = [
          { name: 'Botella Vidrio Verde', type: 'glass', correctBin: 'yellow', emoji: '🍾', points: 35 },
          { name: 'Frasco Vidrio Ámbar', type: 'glass', correctBin: 'yellow', emoji: '🫙', points: 35 },
          { name: 'Periódico Mojado', type: 'paper', correctBin: 'gray', emoji: '📰', points: 25 },
          { name: 'Lata Conserva Oxidada', type: 'plastic', correctBin: 'blue', emoji: '🥫', points: 30 },
          { name: 'Neumático Gastado', type: 'organic', correctBin: 'green', emoji: '🛞', points: 45 },
        ];
      } else if (level.number === 4) {
        // Nivel 4: La Planta Tóxica (Químicos y Peligrosos)
        itemsPool = [
          { name: 'Barril Químico', type: 'toxic', correctBin: 'hazard', emoji: '🛢️', points: 60 },
          { name: 'Batería con Fuga Ácida', type: 'toxic', correctBin: 'hazard', emoji: '🔋', points: 50 },
          { name: 'Tubo Fluorescente Mercurio', type: 'toxic', correctBin: 'hazard', emoji: '💡', points: 45 },
          { name: 'Bidón Aceite Motor', type: 'toxic', correctBin: 'hazard', emoji: '🛢️', points: 45 },
          { name: 'Placa Circuito Quemada', type: 'toxic', correctBin: 'hazard', emoji: '📟', points: 40 },
        ];
      } else {
        // Nivel 5: Batalla Final en el Epicentro (Mutados y Radiactivos)
        itemsPool = [
          { name: 'Núcleo Fango Radiactivo', type: 'toxic', correctBin: 'hazard', emoji: '☢️', points: 75 },
          { name: 'Celda Nuclear Inestable', type: 'toxic', correctBin: 'hazard', emoji: '⚡', points: 70 },
          { name: 'Bolsa Lodo Mutante', type: 'toxic', correctBin: 'hazard', emoji: '👾', points: 60 },
          { name: 'Canister Aire Puro', type: 'plastic', correctBin: 'blue', emoji: '💨', points: 80 },
          { name: 'Cápsula Catalizadora', type: 'glass', correctBin: 'yellow', emoji: '💎', points: 90 },
        ];
      }

      const chosen = itemsPool[Math.floor(Math.random() * itemsPool.length)];

      // Progressive falling speed based on level difficulty
      const baseFallSpeed = 1.0 + level.number * 0.35 + Math.random() * 0.4;

      const newTrash: Trash = {
        id: Date.now() + Math.random(),
        x: 60 + Math.random() * (width - 120),
        y: level.bossMode ? 100 : 20,
        type: chosen.type,
        name: chosen.name,
        correctBin: chosen.correctBin,
        speedY: baseFallSpeed,
        size: 30,
        points: chosen.points,
      };

      st.trashes.push(newTrash);
    };

    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // 1. Spawning trash
      if (currentTime - st.lastSpawn > level.spawnInterval && !st.isFinished) {
        spawnTrashItem();
        st.lastSpawn = currentTime;
      }

      // 2. Boss movement
      if (level.bossMode) {
        st.bossX += st.bossDir * 90 * delta;
        if (st.bossX > width - 120) st.bossDir = -1;
        if (st.bossX < 120) st.bossDir = 1;
      }

      // 3. Player movement
      const moveSpeed = character.speed * 42;
      st.isMoving = false;

      if (st.keys['ArrowLeft'] || st.keys['KeyA']) {
        st.playerX -= moveSpeed * delta;
        st.playerDir = 'left';
        st.isMoving = true;
      }
      if (st.keys['ArrowRight'] || st.keys['KeyD']) {
        st.playerX += moveSpeed * delta;
        st.playerDir = 'right';
        st.isMoving = true;
      }

      // Bounds check
      st.playerX = Math.max(40, Math.min(width - 40, st.playerX));

      // 4. Update Trashes & Collision
      let groundTrashCount = 0;

      for (let i = st.trashes.length - 1; i >= 0; i--) {
        const tr = st.trashes[i];
        tr.y += tr.speedY * 50 * delta;

        // Ground check
        if (tr.y > height - 160) {
          tr.y = height - 160;
          groundTrashCount++;
        }

        // Collision with player (if player has no carried trash)
        const dx = Math.abs(tr.x - st.playerX);
        const dy = Math.abs(tr.y - st.playerY);

        if (dx < 36 && dy < 45 && !carriedTrash) {
          cartoonAudio.playCatch();
          setCarriedTrash(tr);
          addParticles(tr.x, tr.y, '#FF8A3D', `¡${tr.name}!`);
          st.trashes.splice(i, 1);
          continue;
        }
      }

      // 5. Smog & Air Decay:
      // If there is trash on the ground or Mr.Basura is attacking, air drops slowly
      if (groundTrashCount > 0 && !st.isFinished) {
        const decay = level.smogRate * groundTrashCount * delta * 2.2;
        setAirQuality((prev) => {
          const next = prev - decay;
          if (next <= 0) {
            st.isFinished = true;
            onGameOver('¡El aire se volvió irrespirable! La ciudad colapsó bajo el smog tóxico.');
            return 0;
          }
          return next;
        });
      }

      // 6. DRAWING PHASE (Cartoon Art Style)
      // Background Sky
      ctx.fillStyle = level.bgTheme;
      ctx.fillRect(0, 0, width, height);

      // Cartoon Sun & Clouds
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(80, 70, 36, 0, Math.PI * 2);
      ctx.fill();

      // Cloud puffs
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(220, 60, 22, 0, Math.PI * 2);
      ctx.arc(245, 52, 28, 0, Math.PI * 2);
      ctx.arc(270, 60, 22, 0, Math.PI * 2);
      ctx.fill();

      // City Silhouette in Background
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(40, 160, 60, 180);
      ctx.fillRect(110, 120, 80, 220);
      ctx.fillRect(200, 150, 70, 190);
      ctx.fillRect(280, 100, 90, 240);
      ctx.fillRect(380, 140, 75, 200);
      ctx.fillRect(470, 110, 85, 230);
      ctx.fillRect(570, 150, 70, 190);
      ctx.fillRect(650, 130, 80, 210);

      // Ground Street
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, height - 160, width, 160);

      // Yellow/White curb divider
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(0, height - 162, width, 4);

      // Dashed lane marks
      ctx.fillStyle = '#F8FAFC';
      for (let lx = 20; lx < width; lx += 60) {
        ctx.fillRect(lx, height - 110, 35, 6);
      }

      // Draw Smog Overlay if Air Quality is low
      if (airQuality < 50) {
        const smogAlpha = ((50 - airQuality) / 50) * 0.65;
        ctx.fillStyle = `rgba(80, 85, 95, ${smogAlpha})`;
        ctx.fillRect(0, 0, width, height);

        // Smog particles / smoke puffs
        ctx.fillStyle = `rgba(100, 116, 139, ${smogAlpha * 0.7})`;
        for (let s = 0; s < 5; s++) {
          const sx = (currentTime * 0.05 + s * 160) % width;
          const sy = 180 + Math.sin(currentTime * 0.002 + s) * 50;
          ctx.beginPath();
          ctx.arc(sx, sy, 40 + s * 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Boss Mr.Basura in Level 5
      if (level.bossMode) {
        const bx = st.bossX;
        const by = 80;

        // Monster Body (Toxic Trash Heap)
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(bx, by, 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Monster Slime Eyes
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(bx - 16, by - 12, 10, 0, Math.PI * 2);
        ctx.arc(bx + 16, by - 12, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.arc(bx - 16, by - 12, 4, 0, Math.PI * 2);
        ctx.arc(bx + 16, by - 12, 4, 0, Math.PI * 2);
        ctx.fill();

        // Toxic Slime Drools & Teeth
        ctx.fillStyle = '#22C55E';
        ctx.beginPath();
        ctx.arc(bx, by + 18, 14, 0, Math.PI);
        ctx.fill();

        // Boss Name Tag
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 13px Rubik, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👾 Mr.Basura (Jefe Tóxico)', bx, by - 56);

        // Boss Health Bar
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(bx - 50, by - 50, 100, 10);
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(bx - 49, by - 49, (bossHp / 100) * 98, 8);
      }

      // Draw Recycling Bins
      st.bins.forEach((bin, idx) => {
        // Bin Body
        ctx.fillStyle = bin.color;
        ctx.beginPath();
        ctx.roundRect(bin.x - bin.width / 2, height - 70, bin.width, 60, [8, 8, 4, 4]);
        ctx.fill();
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Bin Slot Lid
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(bin.x - bin.width / 2 + 10, height - 64, bin.width - 20, 6);

        // Bin Label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px Rubik, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(bin.label, bin.x, height - 38);

        // Quick Key Indicator (1, 2, 3...)
        ctx.fillStyle = '#FDE047';
        ctx.font = '9px monospace';
        ctx.fillText(`[Tecla ${idx + 1}]`, bin.x, height - 20);
      });

      // Draw Falling / Street Trashes with realistic icons and name tags
      st.trashes.forEach((tr) => {
        ctx.save();
        ctx.translate(tr.x, tr.y);

        let emoji = '🧴';
        if (tr.name.includes('PET')) emoji = '🧴';
        else if (tr.name.includes('Lata de Refresco')) emoji = '🥤';
        else if (tr.name.includes('Brik')) emoji = '🧃';
        else if (tr.name.includes('Papas Fritas')) emoji = '🥨';
        else if (tr.name.includes('Vaso Plástico')) emoji = '🥛';
        else if (tr.name.includes('Plátano')) emoji = '🍌';
        else if (tr.name.includes('Manzana')) emoji = '🍎';
        else if (tr.name.includes('Pizza')) emoji = '🍕';
        else if (tr.name.includes('Café')) emoji = '☕';
        else if (tr.name.includes('Sándwich')) emoji = '🥪';
        else if (tr.name.includes('Vidrio Verde')) emoji = '🍾';
        else if (tr.name.includes('Ámbar')) emoji = '🫙';
        else if (tr.name.includes('Periódico')) emoji = '📰';
        else if (tr.name.includes('Conserva')) emoji = '🥫';
        else if (tr.name.includes('Neumático')) emoji = '🛞';
        else if (tr.name.includes('Barril')) emoji = '🛢️';
        else if (tr.name.includes('Batería')) emoji = '🔋';
        else if (tr.name.includes('Fluorescente')) emoji = '💡';
        else if (tr.name.includes('Aceite')) emoji = '🛢️';
        else if (tr.name.includes('Circuito')) emoji = '📟';
        else if (tr.name.includes('Fango') || tr.name.includes('Núcleo')) emoji = '☢️';
        else if (tr.name.includes('Celda')) emoji = '⚡';
        else if (tr.name.includes('Lodo Mutante')) emoji = '👾';
        else if (tr.name.includes('Aire Puro')) emoji = '💨';
        else if (tr.name.includes('Cápsula')) emoji = '💎';
        else if (tr.type === 'paper') emoji = '📄';
        else if (tr.type === 'organic') emoji = '🍎';
        else if (tr.type === 'glass') emoji = '🍾';
        else if (tr.type === 'toxic') emoji = '☢️';

        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 0, -4);

        // Name tag for educational recognition
        ctx.font = 'bold 8px Rubik, sans-serif';
        ctx.fillStyle = '#1E293B';
        ctx.fillText(tr.name, 0, 16);

        // Ground warning indicator
        if (tr.y >= height - 165) {
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 2;
          ctx.strokeRect(-18, -20, 36, 40);
        }

        ctx.restore();
      });

      // Draw Player Character (Cartoon Kid)
      ctx.save();
      ctx.translate(st.playerX, st.playerY);

      // Facing direction flip
      if (st.playerDir === 'left') {
        ctx.scale(-1, 1);
      }

      // Character Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 32, 22, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body / Clothes
      ctx.fillStyle = character.color;
      ctx.beginPath();
      ctx.roundRect(-16, -8, 32, 32, 6);
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Head
      ctx.fillStyle = '#FED7AA'; // Skin
      ctx.beginPath();
      ctx.arc(0, -22, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hair / Hat
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(0, -26, 17, Math.PI, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(6, -23, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(5, -18, 4, 0, Math.PI);
      ctx.stroke();

      // Legs with walk cycle
      const walkBob = st.isMoving ? Math.sin(currentTime * 0.015) * 6 : 0;
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(-10, 24, 7, 12 + walkBob);
      ctx.fillRect(3, 24, 7, 12 - walkBob);

      // Carried Trash Over Player's Head
      if (carriedTrash) {
        ctx.font = '26px sans-serif';
        ctx.textAlign = 'center';
        let carriedEmoji = '🧴';
        if (carriedTrash.type === 'paper') carriedEmoji = '📄';
        if (carriedTrash.type === 'organic') carriedEmoji = '🍎';
        if (carriedTrash.type === 'glass') carriedEmoji = '🍾';
        if (carriedTrash.type === 'toxic') carriedEmoji = '☢️';
        ctx.fillText(carriedEmoji, 0, -48);

        // Guide bubble
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px Rubik, sans-serif';
        ctx.fillText('¡Deposita abajo!', 0, -68);
      }

      ctx.restore();

      // Draw Particles
      for (let p = st.particles.length - 1; p >= 0; p--) {
        const pt = st.particles[p];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= delta * 1.5;

        if (pt.text) {
          ctx.fillStyle = pt.color;
          ctx.font = 'bold 14px Rubik, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(pt.text, pt.x, pt.y);
        } else {
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        if (pt.life <= 0) {
          st.particles.splice(p, 1);
        }
      }

      if (!st.isFinished) {
        animId = requestAnimationFrame(loop);
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(timerInterval);
      cancelAnimationFrame(animId);
    };
  }, [character, level, carriedTrash, onLevelComplete, onGameOver, airQuality, bossHp, depositTrash]);

  // Click on bin handler (Touch / Mouse direct deposit)
  const handleBinClick = (binType: Bin['type']) => {
    depositTrash(binType);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 py-4 font-['Rubik',sans-serif] select-none">
      {/* Top HUD */}
      <div className="bg-[#FFFDF7] border-4 border-[#2D3142] rounded-2xl p-3.5 mb-3 shadow-[6px_6px_0_#2D3142] flex flex-wrap items-center justify-between gap-3">
        {/* Left: Player Info & Score */}
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl border-3 border-[#2D3142] flex items-center justify-center text-2xl shadow-[2px_2px_0_#2D3142]"
            style={{ backgroundColor: character.color }}
          >
            {character.badge}
          </div>
          <div>
            <div className="text-sm font-black text-[#2D3142] leading-none">
              {character.name}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#4F5D75] mt-1 font-bold">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Puntos:</span>
              <strong className="text-[#FF8A3D] text-sm font-black">{score}</strong>
              <span className="text-[10px]">/ {level.targetScore}</span>
            </div>
          </div>
        </div>

        {/* Center: Air Quality / Oxygen Meter (CORE PROBLEM OBJECTIVE) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase mb-1">
            <Wind className={`w-4 h-4 ${airQuality < 35 ? 'text-red-500 animate-spin' : 'text-[#3DCB6C]'}`} />
            <span className={airQuality < 35 ? 'text-red-600 animate-pulse' : 'text-[#2D3142]'}>
              {airQuality < 35 ? '⚠️ ¡Aire Irrespirable!' : 'Calidad del Aire'}
            </span>
            <span className="font-mono font-bold text-xs">{Math.round(airQuality)}%</span>
          </div>

          <div className="w-40 sm:w-56 h-4 bg-slate-200 border-2 border-[#2D3142] rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-300 ${
                airQuality < 35
                  ? 'bg-red-500 animate-pulse'
                  : airQuality < 60
                  ? 'bg-amber-400'
                  : 'bg-[#3DCB6C]'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, airQuality))}%` }}
            />
          </div>
        </div>

        {/* Right: Time & Sound */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#FFF3D6] border-2 border-[#2D3142] px-3 py-1.5 rounded-xl font-mono text-sm font-black text-[#2D3142]">
            <Clock className="w-4 h-4 text-[#FF8A3D]" />
            <span>{timeLeft}s</span>
          </div>

          <button
            onClick={toggleMute}
            className="w-9 h-9 rounded-xl bg-white border-2 border-[#2D3142] flex items-center justify-center text-[#2D3142] hover:bg-[#FFF3D6] cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-[#3DCB6C]" />}
          </button>

          <button
            onClick={onExitToLevels}
            className="w-9 h-9 rounded-xl bg-red-100 border-2 border-[#2D3142] flex items-center justify-center text-[#2D3142] hover:bg-red-200 cursor-pointer"
            title="Salir a niveles"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative border-4 border-[#2D3142] rounded-3xl overflow-hidden shadow-[8px_8px_0_#2D3142] bg-[#FFF3D6]">
        <canvas ref={canvasRef} className="w-full h-auto block cursor-default" />

        {/* Bottom Touch Bins Bar (For Mobile & direct clicking) */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between gap-1.5 sm:gap-2 pointer-events-auto">
          {(['blue', 'gray', 'green', 'yellow', 'hazard'] as const).map((bType) => {
            const labels = {
              blue: { name: 'Plástico', emoji: '🧴', color: 'bg-blue-600 hover:bg-blue-500' },
              gray: { name: 'Papel', emoji: '📄', color: 'bg-slate-600 hover:bg-slate-500' },
              green: { name: 'Orgánico', emoji: '🍎', color: 'bg-emerald-600 hover:bg-emerald-500' },
              yellow: { name: 'Vidrio', emoji: '🍾', color: 'bg-amber-600 hover:bg-amber-500' },
              hazard: { name: 'Tóxico', emoji: '☢️', color: 'bg-red-600 hover:bg-red-500' },
            }[bType];

            return (
              <button
                key={bType}
                onClick={() => handleBinClick(bType)}
                className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl text-white font-black text-[10px] sm:text-xs border-2 border-[#2D3142] shadow-[2px_2px_0_#2D3142] active:translate-y-0.5 transition-all flex flex-col items-center justify-center cursor-pointer ${labels.color}`}
              >
                <span className="text-sm sm:text-base leading-none mb-0.5">{labels.emoji}</span>
                <span className="truncate w-full text-center leading-none">{labels.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile virtual directional controls */}
      <div className="mt-3 flex sm:hidden items-center justify-between px-2">
        <div className="flex gap-2">
          <button
            onTouchStart={() => { stateRef.current.keys['ArrowLeft'] = true; }}
            onTouchEnd={() => { stateRef.current.keys['ArrowLeft'] = false; }}
            className="w-14 h-12 bg-white border-3 border-[#2D3142] rounded-xl font-black text-xl shadow-[3px_3px_0_#2D3142] active:translate-y-1"
          >
            ◀
          </button>
          <button
            onTouchStart={() => { stateRef.current.keys['ArrowRight'] = true; }}
            onTouchEnd={() => { stateRef.current.keys['ArrowRight'] = false; }}
            className="w-14 h-12 bg-white border-3 border-[#2D3142] rounded-xl font-black text-xl shadow-[3px_3px_0_#2D3142] active:translate-y-1"
          >
            ▶
          </button>
        </div>

        <div className="text-[11px] font-bold text-[#4F5D75] text-right">
          {carriedTrash ? (
            <span className="text-[#3DCB6C]">¡Toca el contenedor correcto abajo!</span>
          ) : (
            <span>Toca y camina para recoger basura</span>
          )}
        </div>
      </div>
    </div>
  );
};
