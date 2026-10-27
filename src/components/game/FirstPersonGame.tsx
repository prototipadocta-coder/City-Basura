import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { soundManager } from '../../utils/audio';
import { TrashItem, Character, LevelConfig } from '../../types/game';
import { REALISTIC_TRASH_TEMPLATES } from '../../data/characters';
import { createRealisticWasteMesh } from './realisticWasteModels';
import { createPlayerHandModel, updatePlayerArmAnimation, PlayerHandRig } from './playerHandModel';
import { buildNeighborhoodStreet, getDistrictAtZ, DISTRICTS, DistrictInfo, DistrictBarrier } from './neighborhoodStreetBuilder';
import { Pause, RotateCcw, Volume2, VolumeX, Eye, Sparkles, Wind, Heart, AlertTriangle, ShieldCheck, MapPin, Lock, Unlock, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FirstPersonGameProps {
  onReturnToMenu: () => void;
  onLevelComplete: (points: number, levelNumber: number) => void;
  character: Character;
  level: LevelConfig;
  roomName?: string;
  quality: 'alta' | 'media' | 'baja';
  fov: number;
}

export const FirstPersonGame: React.FC<FirstPersonGameProps> = ({
  onReturnToMenu,
  onLevelComplete,
  character,
  level,
  roomName,
  quality,
  fov,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [inventory, setInventory] = useState<TrashItem[]>([]);
  const [recycledCount, setRecycledCount] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);
  const [airQuality, setAirQuality] = useState(100); // 0 to 100%
  const [bossHp, setBossHp] = useState(100);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string; color: string } | null>(null);
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);

  // Dynamic Neighborhood Tracking & Eco-Checkpoint Progression
  const [currentDistrict, setCurrentDistrict] = useState<DistrictInfo>(DISTRICTS[0]);
  const [districtToast, setDistrictToast] = useState<DistrictInfo | null>(null);
  const lastDistrictIdRef = useRef<string>(DISTRICTS[0].id);
  const districtToastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trash tracking per neighborhood (scaled progressively)
  const [districtTrashLeft, setDistrictTrashLeft] = useState<{ [id: string]: number }>(() => ({
    residencial: level.missionDistrictId === 'residencial' ? level.targetTrash : 0,
    comercial: level.missionDistrictId === 'comercial' ? level.targetTrash : 0,
    industrial: level.missionDistrictId === 'industrial' ? level.targetTrash : 0,
    parque: level.missionDistrictId === 'parque' ? level.targetTrash : 0,
  }));
  const [gateWarningToast, setGateWarningToast] = useState<string | null>(null);
  const [nearestTrashHint, setNearestTrashHint] = useState<string | null>(null);
  const lastGateAlertTimeRef = useRef(0);

  // Mobile virtual control states
  const [moveForward, setMoveForward] = useState(false);
  const [moveBackward, setMoveBackward] = useState(false);
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const isPointerLockedRef = useRef(isPointerLocked);
  isPointerLockedRef.current = isPointerLocked;
  const movementInputRef = useRef({ moveForward, moveBackward, moveLeft, moveRight });
  movementInputRef.current = { moveForward, moveBackward, moveLeft, moveRight };
  const onReturnToMenuRef = useRef(onReturnToMenu);
  onReturnToMenuRef.current = onReturnToMenu;

  // Engine references
  const gameRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    playerRig: PlayerHandRig;
    trashObjects: { mesh: THREE.Object3D; item: TrashItem }[];
    greenBins: THREE.Object3D[];
    blueBins: THREE.Object3D[];
    yellowBins: THREE.Object3D[];
    hazardBins: THREE.Object3D[];
    barriers: DistrictBarrier[];
    bossGroup?: THREE.Group;
    bossHp: number;
    particles: {
      mesh: THREE.Object3D;
      vx: number;
      vy: number;
      vz: number;
      rotSpeed: number;
      life: number;
      maxLife: number;
    }[];
    keys: { [key: string]: boolean };
    yaw: number;
    pitch: number;
    isWalking: boolean;
    walkCycle: number;
    armSwing: number;
    isArmSwinging: boolean;
    animFrameId: number;
    isFinished: boolean;
  } | null>(null);

  // References to eliminate stale closures in event listeners
  const inventoryRef = useRef<TrashItem[]>(inventory);
  inventoryRef.current = inventory;

  const handleInteractionRef = useRef<() => void>(() => {});

  const triggerGateAlert = useCallback((distName: string, remaining: number, nextDist: string) => {
    const now = Date.now();
    if (now - lastGateAlertTimeRef.current < 2200) return;
    lastGateAlertTimeRef.current = now;
    soundManager.playError();
    setGateWarningToast(
      `⛔ ¡ZONA BLOQUEADA! Debes recoger todas las basuras de ${distName} (${remaining} restantes) para abrir el paso hacia ${nextDist}.`
    );
    setTimeout(() => {
      setGateWarningToast((curr) => (curr?.includes(distName) ? null : curr));
    }, 4000);
  }, []);

  const showNotification = useCallback((text: string, color: string = 'text-emerald-400') => {
    setNotification({ text, color });
    setTimeout(() => {
      setNotification((curr) => (curr?.text === text ? null : curr));
    }, 2800);
  }, []);

  // Triggers the realistic first-person gloved hand reach & grab animation
  const triggerArmSwing = useCallback(() => {
    if (!gameRef.current) return;
    gameRef.current.playerRig.isGrabbing = true;
    gameRef.current.playerRig.grabT = 0;
    gameRef.current.isArmSwinging = true;
    gameRef.current.armSwing = 0;
  }, []);

  const handleCollectTrash = useCallback((trashItem: TrashItem) => {
    // 1. Instant Power-Up Items (Clean Air Canisters & Ozone Crystals)
    if (trashItem.binType === 'instant') {
      soundManager.playRecycleSuccess();
      triggerArmSwing();
      setAirQuality((prev) => Math.min(100, prev + 35));
      setScore((prev) => prev + trashItem.points);
      showNotification(`✨ ¡${trashItem.name}! +35% Oxígeno y Salud Restaurada 🌬️`, 'text-cyan-300');

      if (level.bossMode && gameRef.current) {
        const nextHp = Math.max(0, gameRef.current.bossHp - 15);
        gameRef.current.bossHp = nextHp;
        setBossHp(nextHp);
        if (nextHp <= 0 && !gameRef.current.isFinished) {
          gameRef.current.isFinished = true;
          confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
          showNotification('🎉 ¡Mr.Basura ha sido purificado por el equipo de amigos!', 'text-emerald-400');
          setTimeout(() => onLevelComplete(score + trashItem.points, level.number), 1200);
        }
      }
      return;
    }

    // 2. Normal waste collection into inventory
    if (inventoryRef.current.length >= 6) {
      showNotification('¡Inventario lleno! Ve a un contenedor de reciclaje en la acera ♻️', 'text-amber-400');
      return;
    }

    soundManager.playCollectTrash();
    triggerArmSwing();
    const updatedInventory = [...inventoryRef.current, trashItem];
    inventoryRef.current = updatedInventory;
    setInventory(updatedInventory);
    showNotification(`¡Recogiste ${trashItem.name}! (${trashItem.categoryName}) +${trashItem.points} pts`, 'text-yellow-300');
  }, [triggerArmSwing, showNotification, level, score, onLevelComplete]);

  const handleDepositTrash = useCallback((binType: TrashItem['binType']) => {
    const carriedItems = inventoryRef.current;
    if (carriedItems.length === 0) {
      showNotification('¡Primero recoge basura del suelo con [E] o Clic!', 'text-amber-400');
      return;
    }

    const depositedItems = carriedItems.filter((item) => item.binType === binType);
    if (depositedItems.length === 0) {
      const binName = binType === 'green' ? 'orgánicos' : binType === 'hazard' ? 'RESPEL' : binType === 'yellow' ? 'vidrio' : 'aprovechables';
      showNotification(`Este punto recibe ${binName}. Conserva los demás residuos en tu mochila.`, 'text-amber-400');
      return;
    }

    const remainingItems = carriedItems.filter((item) => item.binType !== binType);
    inventoryRef.current = remainingItems;
    setInventory(remainingItems);
    soundManager.playRecycleSuccess();
    triggerArmSwing();

    const count = depositedItems.length;
    const gainedPoints = depositedItems.reduce((sum, item) => sum + item.points, 0);
    const newTotalRecycled = recycledCount + count;
    setRecycledCount(newTotalRecycled);
    setScore((prev) => prev + gainedPoints);

    // Progressive oxygen / air restoration based on level difficulty
    const restorePerItem = level.number === 1 ? 28 : level.number === 2 ? 22 : level.number === 3 ? 18 : level.number === 4 ? 15 : 12;
    setAirQuality((prev) => Math.min(100, prev + count * restorePerItem));

    // Boss damage if Level 5
    if (level.bossMode && gameRef.current) {
      const damage = count * 22;
      const nextHp = Math.max(0, gameRef.current.bossHp - damage);
      gameRef.current.bossHp = nextHp;
      setBossHp(nextHp);

      // Flash Boss color & recoil animation
      if (gameRef.current.bossGroup) {
        gameRef.current.bossGroup.position.y += 0.6;
        setTimeout(() => {
          if (gameRef.current?.bossGroup) gameRef.current.bossGroup.position.y -= 0.6;
        }, 180);
      }

      if (nextHp <= 0 && !gameRef.current.isFinished) {
        gameRef.current.isFinished = true;
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
        showNotification('🎉 ¡Mr.Basura ha sido purificado por el equipo de amigos!', 'text-emerald-400');
        setTimeout(() => {
          onLevelComplete(score + gainedPoints, level.number);
        }, 1200);
        return;
      }
    }

    // Check normal level completion
    if (!level.bossMode && newTotalRecycled >= level.targetTrash && !gameRef.current?.isFinished) {
      if (gameRef.current) gameRef.current.isFinished = true;
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
      showNotification(`🎉 ¡Misión cumplida! Has purificado ${level.name}.`, 'text-emerald-400');
      setTimeout(() => {
        onLevelComplete(score + gainedPoints, level.number);
      }, 1000);
    } else {
      showNotification(`¡${count} residuo(s) clasificado(s)! +${gainedPoints} pts | ${newTotalRecycled}/${level.targetTrash}`, 'text-emerald-400');
    }
  }, [recycledCount, score, level, onLevelComplete, triggerArmSwing, showNotification]);

  // Spawn 3D sparkle bursts and ground cleaning ripple exactly where trash was collected
  const spawnPickupParticles = useCallback((pos: THREE.Vector3, colorHex: number = 0x34d399) => {
    if (!gameRef.current) return;
    const { scene, particles } = gameRef.current;

    // 1. Spurt of 10 voxel sparkles rising from the exact spot where the trash was
    const sparkleGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    for (let i = 0; i < 10; i++) {
      const pMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? colorHex : 0xfde047,
      });
      const pMesh = new THREE.Mesh(sparkleGeo, pMat);
      pMesh.position.copy(pos);
      pMesh.position.y += 0.15;
      scene.add(pMesh);

      const angle = (i / 10) * Math.PI * 2;
      const speed = 1.4 + Math.random() * 1.6;
      particles.push({
        mesh: pMesh,
        vx: Math.cos(angle) * speed * 0.8,
        vy: 2.4 + Math.random() * 1.8,
        vz: Math.sin(angle) * speed * 0.8,
        rotSpeed: 5 + Math.random() * 5,
        life: 0.6 + Math.random() * 0.25,
        maxLife: 0.85,
      });
    }

    // 2. Luminous flat cleaning ripple on the asphalt street
    const ringGeo = new THREE.RingGeometry(0.12, 0.32, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.set(pos.x, 0.04, pos.z);
    scene.add(ringMesh);

    particles.push({
      mesh: ringMesh,
      vx: 0,
      vy: 0.1,
      vz: 0,
      rotSpeed: 0,
      life: 0.45,
      maxLife: 0.45,
    });
  }, []);

  // Handle interaction key E or Click
  const handleInteraction = useCallback(() => {
    if (!gameRef.current) return;
    const state = gameRef.current;
    const { camera, trashObjects, greenBins, blueBins, yellowBins, hazardBins } = state;
    const playerPos = camera.position;

    const nearbyBins: { type: TrashItem['binType']; mesh: THREE.Object3D }[] = [
      ...greenBins.map((mesh) => ({ type: 'green' as const, mesh })),
      ...blueBins.map((mesh) => ({ type: 'blue' as const, mesh })),
      ...yellowBins.map((mesh) => ({ type: 'yellow' as const, mesh })),
      ...hazardBins.map((mesh) => ({ type: 'hazard' as const, mesh })),
    ];
    const nearestBin = nearbyBins
      .map((bin) => ({ ...bin, distance: playerPos.distanceTo(bin.mesh.position) }))
      .filter((bin) => bin.distance < 5.2)
      .sort((a, b) => a.distance - b.distance)[0];

    if (nearestBin) {
      handleDepositTrash(nearestBin.type);
      return;
    }

    // Check distance & view alignment to nearest trash
    let nearestIndex = -1;
    let minDist = 4.2;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);

    trashObjects.forEach((obj, idx) => {
      if (obj.mesh.visible) {
        const d = playerPos.distanceTo(obj.mesh.position);
        if (d < minDist) {
          const toObj = obj.mesh.position.clone().sub(playerPos).normalize();
          const dot = forward.dot(toObj);
          // Prioritize what the player is facing or what is very close
          if (dot > 0.2 || d < 2.4) {
            minDist = d;
            nearestIndex = idx;
          }
        }
      }
    });

    // Fallback: any closest visible trash in proximity
    if (nearestIndex === -1) {
      minDist = 3.8;
      trashObjects.forEach((obj, idx) => {
        if (obj.mesh.visible) {
          const d = playerPos.distanceTo(obj.mesh.position);
          if (d < minDist) {
            minDist = d;
            nearestIndex = idx;
          }
        }
      });
    }

    if (nearestIndex !== -1) {
      const target = trashObjects[nearestIndex];

      // Check backpack capacity FIRST (Instant items bypass inventory)
      if (target.item.binType !== 'instant' && inventoryRef.current.length >= 6) {
        showNotification('¡Inventario lleno (6/6)! Lleva los residuos al contenedor de reciclaje ♻️', 'text-amber-400');
        return;
      }

      // 1. Spurt sparkles and ring at the exact place where the trash was
      const spotPos = target.mesh.position.clone();
      const colorHex = target.item.binType === 'hazard' ? 0xef4444 : target.item.binType === 'yellow' ? 0xf59e0b : target.item.binType === 'instant' ? 0x38bdf8 : 0x10b981;
      spawnPickupParticles(spotPos, colorHex);

      // 2. DISAPPEAR COMPLETELY FROM THE SPOT ON THE GROUND
      state.scene.remove(target.mesh);
      target.mesh.visible = false;
      target.mesh.position.set(0, -9999, 0);
      target.mesh.traverse((child) => {
        child.visible = false;
      });

      // 3. Remove completely from trashObjects array so it is NEVER rendered or counted again
      trashObjects.splice(nearestIndex, 1);

      // 4. Update district trash count & unlock barrier if district is completely clean
      if (target.item.districtId) {
        const dId = target.item.districtId;
        setDistrictTrashLeft((prev) => {
          const remaining = Math.max(0, (prev[dId] ?? 1) - 1);
          if (remaining === 0 && gameRef.current) {
            const barrier = gameRef.current.barriers.find((b) => b.sourceDistrictId === dId);
            if (barrier && !barrier.isUnlocked) {
              barrier.setUnlocked(true);
              confetti({ particleCount: 110, spread: 85, origin: { y: 0.6 } });
              soundManager.playBonus();
              showNotification(
                `🎉 ¡BARRIO PURIFICADO! La barrera hacia ${barrier.targetDistrictName} se ha DESBLOQUEADO. ¡Avanza!`,
                'text-emerald-300'
              );
            }
          }
          return { ...prev, [dId]: remaining };
        });
      }

      // 5. Immediately clear HUD prompt
      setActivePrompt(null);

      // 6. Add to inventory & register score
      handleCollectTrash(target.item);
    } else {
      triggerArmSwing();
      soundManager.playFootstep();
    }
  }, [handleDepositTrash, handleCollectTrash, triggerArmSwing, showNotification, spawnPickupParticles]);

  // Keep handleInteractionRef in sync
  handleInteractionRef.current = handleInteraction;

  // Timer interval for level countdown
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('😢 ¡Se agotó el tiempo! El smog envolvió la ciudad. ¡Inténtalo de nuevo!');
          onReturnToMenu();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, onReturnToMenu]);

  // Three.js 3D Voxel World Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(level.bgTheme || '#7dd3fc');
    const fogDensity = quality === 'alta' ? 0.018 : 0.026;
    const fog = new THREE.FogExp2(0x94a3b8, fogDensity);
    scene.fog = fog;

    // 2. Camera (First-person eye level)
    const camera = new THREE.PerspectiveCamera(
      fov,
      container.clientWidth / container.clientHeight,
      0.1,
      160
    );
    camera.position.set(0, 1.8, 8);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: quality !== 'baja', powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === 'alta' ? 2 : 1.5));
    renderer.shadowMap.enabled = quality === 'alta';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.3);
    sunLight.position.set(25, 45, 20);
    if (quality === 'alta') {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
    }
    scene.add(sunLight);

    // 5. Extended 4-Neighborhood Continuous City Avenue
    const streetResult = buildNeighborhoodStreet(scene, level, quality);

    // 6. Colombian Flag Pole (Right sidewalk near entrance)
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 9, 8),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    pole.position.set(7.5, 4.5, 14);
    scene.add(pole);

    const flagGroup = new THREE.Group();
    const yStrip = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.8), new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide }));
    yStrip.position.set(1.1, 8.4, 14);
    const bStrip = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.4), new THREE.MeshBasicMaterial({ color: 0x1d4ed8, side: THREE.DoubleSide }));
    bStrip.position.set(1.1, 7.8, 14);
    const rStrip = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.4), new THREE.MeshBasicMaterial({ color: 0xdc2626, side: THREE.DoubleSide }));
    rStrip.position.set(1.1, 7.4, 14);
    flagGroup.add(yStrip, bStrip, rStrip);
    scene.add(flagGroup);

    // 7. Boss Mr.Basura in Level 5 (Positioned in the Botanical Park Arena)
    let bossGroup: THREE.Group | undefined;
    if (level.bossMode) {
      bossGroup = new THREE.Group();
      // Body (Massive Voxel Trash Heap)
      const bBody = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 5, 4),
        new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.9 })
      );
      bBody.position.y = 2.8;
      bossGroup.add(bBody);

      // Toxic Slime & Rust blocks
      const slimeBlock = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 1.2, 4.2),
        new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.3 })
      );
      slimeBlock.position.y = 2.2;
      bossGroup.add(slimeBlock);

      // Evil Glowing Voxel Eyes
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.4), eyeMat);
      eyeL.position.set(-1.1, 4.2, 2.1);
      const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.4), eyeMat);
      eyeR.position.set(1.1, 4.2, 2.1);
      bossGroup.add(eyeL, eyeR);

      // Huge Voxel Arms
      const armL = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 4.5, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x1f2937 })
      );
      armL.position.set(-3.2, 2.8, 0);
      const armR = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 4.5, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x1f2937 })
      );
      armR.position.set(3.2, 2.8, 0);
      bossGroup.add(armL, armR);

      bossGroup.position.copy(streetResult.bossArenaPosition);
      scene.add(bossGroup);
    }

    // Generate only this mission's required waste in its assigned neighborhood.
    const trashMeshes: { mesh: THREE.Object3D; item: TrashItem }[] = [];

    const districtConfigs: {
      districtId: 'residencial' | 'comercial' | 'industrial' | 'parque';
      zMax: number;
      zMin: number;
    }[] = [
      {
        districtId: 'residencial',
        zMax: 15,
        zMin: 3.8,
      },
      {
        districtId: 'comercial',
        zMax: 0.2,
        zMin: -36.2,
      },
      {
        districtId: 'industrial',
        zMax: -39.8,
        zMin: -73.2,
      },
      {
        districtId: 'parque',
        zMax: -76.8,
        zMin: -105,
      },
    ];

    const missionTemplates = REALISTIC_TRASH_TEMPLATES.filter((template) =>
      level.allowedModelTypes.includes(template.modelType)
    );
    if (missionTemplates.length === 0) {
      throw new Error(`La misión "${level.name}" no tiene residuos configurados.`);
    }
    if (!districtConfigs.some((district) => district.districtId === level.missionDistrictId)) {
      throw new Error(`La misión "${level.name}" apunta a un sector que no existe.`);
    }

    const districtCounts = districtConfigs.map((district) =>
      district.districtId === level.missionDistrictId ? level.targetTrash : 0
    );

    let missionItemIndex = 0;
    districtConfigs.forEach((dCfg, districtIndex) => {
      const count = districtCounts[districtIndex];

      for (let i = 0; i < count; i++) {
        const template = missionTemplates[missionItemIndex % missionTemplates.length];
        missionItemIndex += 1;

        // Lane distribution: Left sidewalk, Center road, Right sidewalk
        const lane = i % 3;
        let x = 0;
        if (lane === 0) x = -4.5 + Math.sin(i * 1.5) * 1.2;
        else if (lane === 1) x = Math.cos(i * 1.2) * 2.5;
        else x = 4.5 + Math.sin(i * 2.1) * 1.2;

        const progress = (i + 0.5) / count;
        const z = dCfg.zMax - progress * (dCfg.zMax - dCfg.zMin) + (Math.sin(i * 2.5) * 0.9);

        const trashItem: TrashItem = {
          id: `trash_${dCfg.districtId}_${i}_${template.modelType}`,
          type: template.binType === 'hazard'
            ? 'toxic'
            : template.binType === 'green'
            ? 'organic'
            : template.binType === 'yellow'
            ? 'glass'
            : template.binType === 'instant'
            ? 'powerup'
            : 'bottle',
          modelType: template.modelType,
          name: template.name,
          categoryName: template.categoryName,
          ecoFact: template.ecoFact,
          points: template.points,
          recyclable: template.recyclable,
          binType: template.binType,
          districtId: dCfg.districtId,
          x,
          y: 0.1,
          z,
        };

        const mesh = createRealisticWasteMesh(trashItem);
        mesh.castShadow = true;
        scene.add(mesh);
        trashMeshes.push({ mesh, item: trashItem });
      }
    });
    const initialDistrictTrashLeft = {
      residencial: 0,
      comercial: 0,
      industrial: 0,
      parque: 0,
    };
    trashMeshes.forEach(({ item }) => {
      if (item.districtId) initialDistrictTrashLeft[item.districtId] += 1;
    });
    setDistrictTrashLeft(initialDistrictTrashLeft);
    streetResult.barriers.forEach((barrier) => {
      if (initialDistrictTrashLeft[barrier.sourceDistrictId] === 0) {
        barrier.setUnlocked(true);
      }
    });

    // 9. FIRST-PERSON ARM WITH REALISTIC SANITATION RUBBER GLOVE
    const playerRig = createPlayerHandModel(character.color || '#FF8A3D', quality);
    camera.add(playerRig.armRoot);
    scene.add(camera);

    // Save state
    gameRef.current = {
      scene,
      camera,
      renderer,
      playerRig,
      trashObjects: trashMeshes,
      greenBins: streetResult.greenBins,
      blueBins: streetResult.blueBins,
      yellowBins: streetResult.yellowBins,
      hazardBins: streetResult.hazardBins,
      barriers: streetResult.barriers,
      bossGroup,
      bossHp: 100,
      particles: [],
      keys: {},
      yaw: 0,
      pitch: 0,
      isWalking: false,
      walkCycle: 0,
      armSwing: 0,
      isArmSwinging: false,
      animFrameId: 0,
      isFinished: false,
    };

    // Listeners with handleInteractionRef to avoid stale closures
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameRef.current) return;
      gameRef.current.keys[e.code] = true;
      if (e.code === 'KeyE') handleInteractionRef.current();
      if (e.code === 'Escape') setIsPaused((p) => !p);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!gameRef.current) return;
      gameRef.current.keys[e.code] = false;
    };

    const handleCanvasClick = () => {
      if (!isPointerLockedRef.current) {
        container.requestPointerLock?.();
      } else {
        handleInteractionRef.current();
      }
    };

    const handlePointerLockChange = () => {
      const pointerLocked = document.pointerLockElement === container;
      isPointerLockedRef.current = pointerLocked;
      setIsPointerLocked(pointerLocked);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerLockedRef.current || !gameRef.current || isPausedRef.current) return;
      const sensitivity = 0.0022;
      gameRef.current.yaw -= e.movementX * sensitivity;
      gameRef.current.pitch -= e.movementY * sensitivity;
      gameRef.current.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, gameRef.current.pitch));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    container.addEventListener('click', handleCanvasClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container || !gameRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Main 3D Animation Loop
    let lastTime = performance.now();
    let stepTimer = 0;
    let smogDecayTimer = 0;
    let bossAttackTimer = 0;

    const animate = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const state = gameRef.current;
      if (state && !isPausedRef.current && !state.isFinished) {
        // Player Rotation
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.x = state.pitch;
        euler.y = state.yaw;
        state.camera.quaternion.setFromEuler(euler);

        // Movement with Character Speed Perk
        const baseSpeed = character.speed;
        const moveVec = new THREE.Vector3();

        const movementInput = movementInputRef.current;
        const fwd = state.keys['KeyW'] || state.keys['ArrowUp'] || movementInput.moveForward;
        const back = state.keys['KeyS'] || state.keys['ArrowDown'] || movementInput.moveBackward;
        const left = state.keys['KeyA'] || state.keys['ArrowLeft'] || movementInput.moveLeft;
        const right = state.keys['KeyD'] || state.keys['ArrowRight'] || movementInput.moveRight;

        if (fwd) moveVec.z -= 1;
        if (back) moveVec.z += 1;
        if (left) moveVec.x -= 1;
        if (right) moveVec.x += 1;

        state.isWalking = moveVec.lengthSq() > 0;

        if (state.isWalking) {
          moveVec.normalize();
          moveVec.applyAxisAngle(new THREE.Vector3(0, 1, 0), state.yaw);
          state.camera.position.addScaledVector(moveVec, baseSpeed * delta);

          // Boundaries across the extended 4-neighborhood avenue
          state.camera.position.x = Math.max(-9.5, Math.min(9.5, state.camera.position.x));
          state.camera.position.z = Math.max(-105, Math.min(18, state.camera.position.z));

          // Keep the clean-up route sequential: clear each sector before advancing.
          // 1. Centro de San Antonio -> Corredor comercial (Z Boundary = 2.0)
          const resLeft = state.trashObjects.filter((t) => t.item.districtId === 'residencial').length;
          if (resLeft > 0 && state.camera.position.z <= 2.25) {
            state.camera.position.z = 2.32;
            triggerGateAlert('Centro de San Antonio de Prado', resLeft, 'Corredor comercial');
          }

          // 2. Corredor comercial -> Zona de talleres (Z Boundary = -38.0)
          const comLeft = state.trashObjects.filter((t) => t.item.districtId === 'comercial').length;
          if (comLeft > 0 && state.camera.position.z <= -37.75) {
            state.camera.position.z = -37.68;
            triggerGateAlert('Corredor comercial', comLeft, 'Zona de talleres y servicios');
          }

          // 3. Zona de talleres -> Sendero de la quebrada (Z Boundary = -75.0)
          const indLeft = state.trashObjects.filter((t) => t.item.districtId === 'industrial').length;
          if (indLeft > 0 && state.camera.position.z <= -74.75) {
            state.camera.position.z = -74.68;
            triggerGateAlert('Zona de talleres y servicios', indLeft, 'Sendero de la quebrada');
          }

          // Footsteps
          stepTimer += delta;
          if (stepTimer > 0.4) {
            soundManager.playFootstep();
            stepTimer = 0;
          }

          state.walkCycle += delta * 10;
          state.camera.position.y = 1.8 + Math.sin(state.walkCycle) * 0.04;
        }

        // Procedural First-Person Gloved Hand Animation (reaching, grabbing, idle bob)
        updatePlayerArmAnimation(state.playerRig, delta, state.isWalking, state.walkCycle);

        // Dynamic Neighborhood Tracking as player advances down the street
        const currentDistrictInfo = getDistrictAtZ(state.camera.position.z);
        if (currentDistrictInfo.id !== lastDistrictIdRef.current) {
          lastDistrictIdRef.current = currentDistrictInfo.id;
          setCurrentDistrict(currentDistrictInfo);
          setDistrictToast(currentDistrictInfo);
          soundManager.playCollectTrash();
          if (districtToastTimerRef.current) clearTimeout(districtToastTimerRef.current);
          districtToastTimerRef.current = setTimeout(() => {
            setDistrictToast(null);
          }, 4200);
        }

        // Update nearest uncollected trash hint in player's current district
        const curDistrictTrash = state.trashObjects.filter(
          (t) => t.mesh.visible && t.item.districtId === currentDistrictInfo.id
        );
        if (curDistrictTrash.length > 0) {
          let minD = 999;
          let closestName = '';
          curDistrictTrash.forEach((t) => {
            const d = state.camera.position.distanceTo(t.mesh.position);
            if (d < minD) {
              minD = d;
              closestName = t.item.name;
            }
          });
          setNearestTrashHint(`${closestName} (${Math.round(minD)}m)`);
        } else {
          setNearestTrashHint(null);
        }

        // Flag flutter
        yStrip.rotation.y = Math.sin(currentTime * 0.004) * 0.15;
        bStrip.rotation.y = Math.sin(currentTime * 0.004 + 0.2) * 0.15;
        rStrip.rotation.y = Math.sin(currentTime * 0.004 + 0.4) * 0.15;

        // Boss Idle & Attack in Level 5
        if (state.bossGroup) {
          state.bossGroup.rotation.y = Math.sin(currentTime * 0.002) * 0.2;
          state.bossGroup.position.y = Math.sin(currentTime * 0.003) * 0.3;

          bossAttackTimer += delta;
          if (bossAttackTimer > 4.5 && !state.isFinished) {
            bossAttackTimer = 0;
            // Mr.Basura unleashes a toxic surge
            showNotification('👾 ¡Mr.Basura ruge y derrama smog tóxico en la calle!', 'text-red-400');
            setAirQuality((prev) => Math.max(5, prev - 8));
          }
        }

        // Air Quality Decay / Smog Mechanic ("imposible respirar")
        smogDecayTimer += delta;
        if (smogDecayTimer > 1.0) {
          smogDecayTimer = 0;
          const uncollectedCount = state.trashObjects.filter((t) => t.mesh.visible).length;
          const decay = uncollectedCount * level.smogRate * 0.1;

          setAirQuality((prev) => {
            const next = Math.max(0, prev - decay);
            if (next <= 0 && !state.isFinished) {
              state.isFinished = true;
              alert('💨 ¡El aire se volvió totalmente irrespirable! La ciudad cayó bajo el smog tóxico de Mr.Basura.');
              onReturnToMenuRef.current();
              return 0;
            }
            return next;
          });
        }

        // Proximity detection for the nearest classified collection point.
        const playerPos = state.camera.position;
        const collectionPoints: { type: TrashItem['binType']; name: string; meshes: THREE.Object3D[] }[] = [
          { type: 'green', name: 'orgánicos', meshes: state.greenBins },
          { type: 'blue', name: 'aprovechables', meshes: state.blueBins },
          { type: 'yellow', name: 'vidrio', meshes: state.yellowBins },
          { type: 'hazard', name: 'RESPEL', meshes: state.hazardBins },
        ];
        const nearestPoint = collectionPoints
          .flatMap((point) => point.meshes.map((mesh) => ({ type: point.type, name: point.name, mesh })))
          .map((point) => ({ ...point, distance: playerPos.distanceTo(point.mesh.position) }))
          .filter((point) => point.distance < 5.2)
          .sort((a, b) => a.distance - b.distance)[0];

        if (nearestPoint) {
          const matchingCount = inventoryRef.current.filter((item) => item.binType === nearestPoint.type).length;
          setActivePrompt(
            matchingCount > 0
              ? `Presiona [E] para depositar ${matchingCount} residuo(s) ${nearestPoint.name}`
              : `Punto ${nearestPoint.name}: no llevas residuos de esta categoría`
          );
        } else {
          let foundNearbyTrash: string | null = null;
          state.trashObjects.forEach((obj) => {
            if (obj.mesh.visible && playerPos.distanceTo(obj.mesh.position) < 3.8) {
              foundNearbyTrash = `[E] Recoger ${obj.item.name} con Guante Protector (${obj.item.categoryName || 'Residuo'})`;
            }
          });
          setActivePrompt(foundNearbyTrash);
        }
        // Animate 3D pickup burst particles and cleaning ground rings
        if (state.particles && state.particles.length > 0) {
          for (let pIdx = state.particles.length - 1; pIdx >= 0; pIdx--) {
            const p = state.particles[pIdx];
            p.life -= delta;
            if (p.life <= 0) {
              state.scene.remove(p.mesh);
              state.particles.splice(pIdx, 1);
            } else {
              p.mesh.position.x += p.vx * delta;
              p.mesh.position.y += p.vy * delta;
              p.mesh.position.z += p.vz * delta;
              p.vy -= 4.2 * delta; // slight gravity
              p.mesh.rotation.x += p.rotSpeed * delta;
              p.mesh.rotation.y += p.rotSpeed * delta;

              // Scale down or expand ring
              const lifeRatio = Math.max(0.01, p.life / p.maxLife);
              if (p.mesh instanceof THREE.Mesh && p.mesh.geometry instanceof THREE.RingGeometry) {
                const expand = (1 - lifeRatio) * 3.5 + 1.0;
                p.mesh.scale.set(expand, expand, expand);
                (p.mesh.material as THREE.MeshBasicMaterial).opacity = lifeRatio * 0.9;
              } else {
                p.mesh.scale.setScalar(lifeRatio);
              }
            }
          }
        }

        // Render scene
        state.renderer.render(state.scene, state.camera);
        state.animFrameId = requestAnimationFrame(animate);
      } else if (gameRef.current) {
        gameRef.current.animFrameId = requestAnimationFrame(animate);
      }
    };

    gameRef.current.animFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('click', handleCanvasClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);

      if (gameRef.current) {
        cancelAnimationFrame(gameRef.current.animFrameId);
        gameRef.current.renderer.dispose();
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [fov, quality, character, level, triggerGateAlert, showNotification]);

  return (
    <div className="relative w-full h-screen overflow-hidden select-none font-['Pixelify_Sans',sans-serif]">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

      {/* Smog Fog Screen Tint when Air Quality is dangerously low */}
      {airQuality < 45 && (
        <div
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-500"
          style={{
            backgroundColor: 'rgba(55, 65, 81, 0.45)',
            boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.8)',
          }}
        />
      )}

      {/* Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="relative w-4 h-4">
          <div className="absolute top-1/2 left-0 w-4 h-0.5 bg-white/80 -translate-y-1/2 shadow-xs" />
          <div className="absolute left-1/2 top-0 h-4 w-0.5 bg-white/80 -translate-x-1/2 shadow-xs" />
        </div>
      </div>

      {/* Top HUD: Character + Neighborhood Badge + Oxygen/Air Quality + Boss Bar / Goal */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-start justify-between pointer-events-none gap-2">
        {/* Left: Active Hero Info & Neighborhood Badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-slate-900/90 border-2 border-slate-700 px-3.5 py-2 rounded-xl shadow-[3px_3px_0_#000] flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0_#000]"
              style={{ backgroundColor: character.color }}
            >
              {character.badge}
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">
                {character.name}
              </div>
              <div className="text-[11px] text-amber-300 font-mono">
                ⭐ {score} pts
              </div>
            </div>
          </div>

          {/* Active Neighborhood Badge with Progress & Lock Status */}
          <div className="hidden sm:flex bg-slate-900/90 border-2 border-slate-700 px-3 py-1.5 rounded-xl shadow-[3px_3px_0_#000] items-center gap-2.5">
            <span className="text-2xl">{currentDistrict.icon}</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-wide">
                  {currentDistrict.name}
                </span>
                {(districtTrashLeft[currentDistrict.id] ?? 0) > 0 ? (
                  <span className="text-[10px] bg-red-950/90 text-red-300 border border-red-500/60 px-1.5 py-0.2 rounded flex items-center gap-1 font-mono font-bold">
                    <Lock className="w-2.5 h-2.5 text-red-400" />
                    <span>Faltan {districtTrashLeft[currentDistrict.id]}</span>
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 px-1.5 py-0.2 rounded flex items-center gap-1 font-mono font-bold">
                    <Unlock className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Despejado ✅</span>
                  </span>
                )}
              </div>

              {/* Nearest Trash Hint Radar */}
              {nearestTrashHint && (
                <div className="text-[10px] text-cyan-300 font-mono font-bold flex items-center gap-1 mt-0.5">
                  <Compass className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate max-w-[170px]">Cerca: {nearestTrashHint}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Oxygen & Air Quality Gauge ("imposible respirar") */}
        <div className="flex flex-col items-center pointer-events-auto">
          <div className="bg-slate-900/90 border-2 border-slate-700 px-4 py-2 rounded-xl shadow-[3px_3px_0_#000] text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold mb-1">
              <Wind className={`w-4 h-4 ${airQuality < 35 ? 'text-red-500 animate-spin' : 'text-emerald-400'}`} />
              <span className={airQuality < 35 ? 'text-red-400 animate-pulse' : 'text-white'}>
                {airQuality < 35 ? '⚠️ ¡AIRE IRRESPIRABLE!' : 'Calidad del Aire / Oxígeno'}
              </span>
              <span className="font-mono text-emerald-400 font-bold">{Math.round(airQuality)}%</span>
            </div>
            <div className="w-44 sm:w-64 h-3 bg-slate-950 border border-slate-600 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  airQuality < 35
                    ? 'bg-red-500 animate-pulse'
                    : airQuality < 60
                    ? 'bg-amber-400'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, airQuality))}%` }}
              />
            </div>

            {/* Boss Bar in Level 5 */}
            {level.bossMode && (
              <div className="mt-2 pt-1.5 border-t border-slate-700/80">
                <div className="flex justify-between text-[11px] font-bold text-red-400 mb-0.5">
                  <span>👾 Mr.Basura (Jefe Tóxico)</span>
                  <span className="font-mono">{bossHp}% HP</span>
                </div>
                <div className="w-44 sm:w-64 h-2 bg-slate-950 border border-red-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 transition-all duration-200"
                    style={{ width: `${bossHp}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Timer & Pause */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-slate-900/90 border-2 border-slate-700 px-3 py-2 rounded-xl text-amber-300 font-mono text-sm font-bold shadow-[3px_3px_0_#000]">
            ⏱️ {timeLeft}s
          </div>

          <button
            onClick={() => setIsPaused(true)}
            className="w-10 h-10 rounded-xl bg-slate-900/90 border-2 border-slate-700 hover:border-slate-500 flex items-center justify-center text-white shadow-[3px_3px_0_#000] cursor-pointer"
            title="Pausar juego (ESC)"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Active mission and measurable progress */}
      <div className="absolute top-24 left-3 z-30 max-w-[min(28rem,calc(100vw-1.5rem))] rounded-xl border border-white/20 bg-slate-950/85 px-3 py-2 text-white shadow-lg pointer-events-none">
        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
          Misión · {level.name}
        </div>
        <p className="mt-0.5 text-xs leading-snug text-slate-100">{level.objective}</p>
        <div className="mt-1 text-[10px] font-mono text-amber-200">
          {level.bossMode
            ? `Purificación de Mr.Basura: ${100 - bossHp}%`
            : `Residuos entregados: ${recycledCount}/${level.targetTrash}`}
        </div>
      </div>

      {/* Eco-Barrier Blocked Warning Alert */}
      {gateWarningToast && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-50 bg-red-950/95 border-3 border-red-500 text-white px-5 py-3 rounded-2xl shadow-[0_10px_35px_rgba(239,68,68,0.85)] flex items-center gap-3 animate-bounce max-w-[92vw] pointer-events-none">
          <div className="w-11 h-11 rounded-xl bg-red-600/30 border-2 border-red-400 flex items-center justify-center text-2xl shrink-0">
            ⛔
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-red-300 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3" />
              ¡BARRERA ECOLÓGICA ACTIVA!
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-white leading-tight">
              {gateWarningToast}
            </p>
          </div>
        </div>
      )}

      {/* Animated District Entrance Announcement Banner */}
      {districtToast && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40 bg-slate-900/95 border-3 border-amber-400 px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.85)] flex items-center gap-3.5 animate-bounce pointer-events-none max-w-[90vw]">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-2xl shadow-[2px_2px_0_#000] shrink-0">
            {districtToast.icon}
          </div>
          <div>
            <div className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              ¡Has entrado a un nuevo sector de la ciudad!
            </div>
            <h3 className="text-base sm:text-lg font-black text-white text-pixel-stroke leading-tight">
              {districtToast.name}
            </h3>
            <p className="text-[11px] text-slate-300 font-sans leading-tight">
              {districtToast.subtitle} — {districtToast.description}
            </p>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && !districtToast && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-40 bg-slate-900/90 border-2 border-black px-5 py-2.5 rounded-xl shadow-[4px_4px_0_#000] animate-bounce pointer-events-none">
          <p className={`text-base font-bold tracking-wide ${notification.color} text-pixel-stroke`}>
            {notification.text}
          </p>
        </div>
      )}

      {/* Contextual Interaction Prompt */}
      {activePrompt && !isPaused && (
        <div className="absolute bottom-28 sm:bottom-24 left-1/2 transform -translate-x-1/2 z-30 bg-black/85 border-2 border-white/80 px-4 py-2 rounded-xl shadow-[3px_3px_0_#000] pointer-events-auto animate-pulse">
          <button
            onClick={handleInteraction}
            className="text-white text-sm sm:text-base font-bold tracking-wide flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>{activePrompt}</span>
          </button>
        </div>
      )}

      {/* Bottom Inventory Hotbar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-slate-900/95 border-4 border-slate-700 p-2 sm:p-2.5 rounded-2xl shadow-[4px_4px_0_#000] flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
          const item = inventory[slotIdx];

          const getRealisticIcon = (modelType?: string) => {
            switch (modelType) {
              case 'crushed_pet_bottle': return '🧴';
              case 'crushed_soda_can': return '🥤';
              case 'juice_tetra_pack': return '🧃';
              case 'snack_chips_bag': return '🥨';
              case 'crinkled_plastic_cup': return '🥛';
              case 'banana_peel_organic': return '🍌';
              case 'bitten_apple_core': return '🍎';
              case 'greasy_pizza_box': return '🍕';
              case 'paper_coffee_cup': return '☕';
              case 'plastic_sandwich_wrap': return '🥪';
              case 'green_glass_beer_bottle': return '🍾';
              case 'amber_glass_preserve_jar': return '🫙';
              case 'wet_rolled_newspaper': return '📰';
              case 'rusty_canned_tin': return '🥫';
              case 'used_car_tire': return '🛞';
              case 'dented_aerosol_spray': return '🧴';
              case 'toxic_chemical_drum': return '🛢️';
              case 'leaking_car_battery': return '🔋';
              case 'broken_mercury_fluorescent': return '💡';
              case 'motor_oil_jug': return '🛢️';
              case 'chemical_glass_flask': return '🧪';
              case 'burnt_pcb_ewaste': return '📟';
              case 'pulsing_toxic_core': return '☢️';
              case 'radioactive_fuel_cell': return '⚡';
              case 'mutated_sludge_bag': return '👾';
              case 'clean_air_canister': return '💨';
              case 'crystal_purifier_capsule': return '💎';
              default: return '🗑️';
            }
          };

          return (
            <div
              key={slotIdx}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 flex flex-col items-center justify-center relative transition-all ${
                item
                  ? 'bg-slate-800 border-emerald-400 shadow-[inset_0_2px_0_rgba(255,255,255,0.2)]'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
              title={item ? `${item.name} (${item.categoryName})` : 'Casilla vacía'}
            >
              {item && (
                <>
                  <span className="text-xl sm:text-2xl leading-none">
                    {getRealisticIcon(item.modelType)}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-300 font-bold leading-none mt-0.5 max-w-[46px] truncate">
                    {item.name.split(' ')[0]}
                  </span>
                </>
              )}
            </div>
          );
        })}

        <div className="pl-2 sm:pl-3 border-l-2 border-slate-700 text-xs text-slate-300">
          <div className="font-bold text-white flex items-center gap-1.5">
            <span>Mochila ({inventory.length}/6)</span>
            <span className="text-[10px] font-mono text-amber-300 font-bold bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">
              {level.difficulty}
            </span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">
            {level.bossMode ? '¡Lleva al contenedor para disparar rayos!' : 'Deposita en contenedores de la acera ♻️'}
          </div>
        </div>
      </div>

      {/* Pointer Lock Helper overlay */}
      {!isPointerLocked && !isPaused && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-slate-900/90 border-2 border-white/60 p-4 rounded-xl text-center shadow-[4px_4px_0_#000] pointer-events-none hidden md:block">
          <div className="flex items-center justify-center gap-2 text-yellow-300 mb-1 font-bold">
            <Eye className="w-5 h-5" />
            <span>Haz clic en la pantalla para controlar la vista con el ratón</span>
          </div>
          <p className="text-xs text-slate-300">
            Usa [W, A, S, D] para caminar y [E] o Clic para recoger basura
          </p>
        </div>
      )}

      {/* Mobile Touch Virtual Controls */}
      <div className="absolute bottom-20 left-4 z-30 flex flex-col items-center gap-1 md:hidden pointer-events-auto">
        <button
          onTouchStart={() => setMoveForward(true)}
          onTouchEnd={() => setMoveForward(false)}
          className="w-12 h-12 bg-slate-800/80 border-2 border-white/50 rounded-lg text-white font-bold active:bg-emerald-600"
        >
          ▲
        </button>
        <div className="flex gap-1">
          <button
            onTouchStart={() => setMoveLeft(true)}
            onTouchEnd={() => setMoveLeft(false)}
            className="w-12 h-12 bg-slate-800/80 border-2 border-white/50 rounded-lg text-white font-bold active:bg-emerald-600"
          >
            ◀
          </button>
          <button
            onTouchStart={() => setMoveBackward(true)}
            onTouchEnd={() => setMoveBackward(false)}
            className="w-12 h-12 bg-slate-800/80 border-2 border-white/50 rounded-lg text-white font-bold active:bg-emerald-600"
          >
            ▼
          </button>
          <button
            onTouchStart={() => setMoveRight(true)}
            onTouchEnd={() => setMoveRight(false)}
            className="w-12 h-12 bg-slate-800/80 border-2 border-white/50 rounded-lg text-white font-bold active:bg-emerald-600"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Mobile Action Button */}
      <div className="absolute bottom-24 right-4 z-30 md:hidden pointer-events-auto">
        <button
          onClick={() => handleInteractionRef.current()}
          className="w-16 h-16 rounded-full bg-emerald-600 border-4 border-black text-white font-bold text-sm shadow-[0_4px_0_#000] active:translate-y-1 flex items-center justify-center cursor-pointer"
        >
          ACCIÓN
        </button>
      </div>

      {/* Pause Menu Modal */}
      {isPaused && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="voxel-modal-frame w-full max-w-sm rounded-2xl p-6 text-center text-white">
            <h2 className="text-3xl font-black mb-1 text-pixel-stroke">Juego en Pausa</h2>
            <p className="text-xs text-slate-400 mb-6 font-mono">
              Héroe: {character.name} {character.badge} · Nivel {level.number}: {level.name}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsPaused(false);
                }}
                className="voxel-btn-green w-full py-3 rounded-xl font-bold text-lg text-white cursor-pointer"
              >
                Reanudar Juego
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  onReturnToMenu();
                }}
                className="voxel-btn-red w-full py-3 rounded-xl font-bold text-lg text-white cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Volver al Menú Principal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
