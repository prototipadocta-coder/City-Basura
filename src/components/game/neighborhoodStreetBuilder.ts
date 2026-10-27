import * as THREE from 'three';
import { LevelConfig } from '../../types/game';

export interface DistrictInfo {
  id: 'residencial' | 'comercial' | 'industrial' | 'parque';
  name: string;
  subtitle: string;
  icon: string;
  zStart: number;
  zEnd: number;
  themeColor: string;
  badgeClass: string;
  ambientColor: number;
  description: string;
}

// Mark a pedestrian crossing at the residential-school entrance.
const crossingMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
for (let x = -5.2; x <= 5.2; x += 1.45) {
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 2.8), crossingMat);
  stripe.rotation.x = -Math.PI / 2;
  stripe.position.set(x, 0.025, 11);
  scene.add(stripe);
}

export const DISTRICTS: DistrictInfo[] = [
  {
    id: 'residencial',
    name: 'Centro de San Antonio de Prado',
    subtitle: 'Casas, escuela y tiendas de barrio',
    icon: '🏡',
    zStart: 25,
    zEnd: 2,
    themeColor: '#f59e0b',
    badgeClass: 'bg-amber-600 text-amber-100 border-amber-400',
    ambientColor: 0xffedd5,
    description: 'Cuadras residenciales de ladrillo, fachadas de colores, pequeños comercios y andenes concurridos.',
  },
  {
    id: 'comercial',
    name: 'Corredor comercial',
    subtitle: 'Tiendas, paraderos y movilidad local',
    icon: '🛍️',
    zStart: 2,
    zEnd: -38,
    themeColor: '#3b82f6',
    badgeClass: 'bg-blue-600 text-blue-100 border-blue-400',
    ambientColor: 0xe0f2fe,
    description: 'Comercio local, paraderos y flujo de peatones junto a una vía de tráfico mixto.',
  },
  {
    id: 'industrial',
    name: 'Zona de talleres y servicios',
    subtitle: 'Punto de recepción de residuos especiales',
    icon: '⚙️',
    zStart: -38,
    zEnd: -75,
    themeColor: '#10b981',
    badgeClass: 'bg-emerald-600 text-emerald-100 border-emerald-400',
    ambientColor: 0xccfbf1,
    description: 'Talleres y bodegas con un punto señalizado para entregar pilas, luminarias y aceites usados.',
  },
  {
    id: 'parque',
    name: 'Sendero de la quebrada',
    subtitle: 'Zona verde inspirada en Doña María',
    icon: '🌳',
    zStart: -75,
    zEnd: -120,
    themeColor: '#22c55e',
    badgeClass: 'bg-green-600 text-green-100 border-green-400',
    ambientColor: 0xdcfce7,
    description: 'Vegetación de ladera y senderos vecinales inspirados en el entorno natural del corregimiento.',
  },
];

export function getDistrictAtZ(z: number): DistrictInfo {
  for (const d of DISTRICTS) {
    if (z <= d.zStart && z > d.zEnd) {
      return d;
    }
  }
  if (z > DISTRICTS[0].zStart) return DISTRICTS[0];
  return DISTRICTS[DISTRICTS.length - 1];
}

/**
 * Creates dynamic text billboard for 3D overhead district welcome arches
 */
function createArchTextTexture(title: string, subtitle: string, bgColor: string, textColor: string = '#ffffff'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 0);
  grad.addColorStop(0, bgColor);
  grad.addColorStop(0.5, '#0f172a');
  grad.addColorStop(1, bgColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 256);

  // Border glow
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 1010, 242);

  // Title
  ctx.fillStyle = textColor;
  ctx.font = 'bold 54px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 512, 90);

  // Subtitle
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 36px monospace';
  ctx.fillText(subtitle, 512, 175);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export interface DistrictBarrier {
  id: string;
  sourceDistrictId: 'residencial' | 'comercial' | 'industrial';
  targetDistrictName: string;
  zBoundary: number;
  barrierGroup: THREE.Group;
  laserBeam: THREE.Mesh;
  beaconL: THREE.Mesh;
  beaconR: THREE.Mesh;
  signMesh: THREE.Mesh;
  isUnlocked: boolean;
  setUnlocked: (unlocked: boolean) => void;
}

export interface NeighborhoodStreetResult {
  greenBins: THREE.Object3D[];
  blueBins: THREE.Object3D[];
  yellowBins: THREE.Object3D[];
  hazardBins: THREE.Object3D[];
  barriers: DistrictBarrier[];
  bossArenaPosition: THREE.Vector3;
  zBounds: [number, number];
}

/**
 * Builds the comprehensive continuous Avenue spanning 4 distinct dynamic neighborhoods.
 */
export function buildNeighborhoodStreet(
  scene: THREE.Scene,
  level: LevelConfig,
  quality: 'alta' | 'media' | 'baja'
): NeighborhoodStreetResult {
  const isHighQuality = quality === 'alta';

  // 1. EXTENDED MAIN ASPHALT ROAD (Z = 24 to Z = -120)
  const roadLength = 150;
  const roadCenterZ = -48;
  const roadGeo = new THREE.PlaneGeometry(12, roadLength);
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.88,
  });
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0, roadCenterZ);
  road.receiveShadow = true;
  scene.add(road);

  // Center white line dashes
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  for (let z = -118; z <= 24; z += 5) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 2.6), lineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.02, z);
    scene.add(dash);
  }

  // 2. EXTENDED SIDEWALKS
  const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
  const leftSidewalk = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, roadLength), sidewalkMat);
  leftSidewalk.position.set(-9, 0.2, roadCenterZ);
  leftSidewalk.receiveShadow = true;
  scene.add(leftSidewalk);

  const rightSidewalk = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, roadLength), sidewalkMat);
  rightSidewalk.position.set(9, 0.2, roadCenterZ);
  rightSidewalk.receiveShadow = true;
  scene.add(rightSidewalk);

  // Containers collection
  const greenBins: THREE.Object3D[] = [];
  const blueBins: THREE.Object3D[] = [];
  const yellowBins: THREE.Object3D[] = [];
  const hazardBins: THREE.Object3D[] = [];

  // Helper to build a standard recycling dumpster station
  const addRecyclingStation = (
    zPos: number,
    types: ('green' | 'blue' | 'yellow' | 'hazard')[],
    side: 'left' | 'right'
  ) => {
    const xBase = side === 'left' ? -6.8 : 6.8;
    types.forEach((t, idx) => {
      const zOffset = zPos + (idx - (types.length - 1) / 2) * 2.8;
      const group = new THREE.Group();
      group.position.set(xBase, 0.2, zOffset);

      let colorHex = 0x15803d;
      let lidColorHex = 0x166534;
      let label = 'ORGÁNICOS';

      if (t === 'blue') {
        colorHex = 0xf8fafc;
        lidColorHex = 0xe2e8f0;
        label = 'APROVECHABLES';
      } else if (t === 'yellow') {
        colorHex = 0xf8fafc;
        lidColorHex = 0xcbd5e1;
        label = 'VIDRIO LIMPIO';
      } else if (t === 'hazard') {
        colorHex = 0xdc2626;
        lidColorHex = 0x7f1d1d;
        label = 'PUNTO RESPEL';
      }

      const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.5 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.0, 1.5), bodyMat);
      body.position.y = 1.0;
      body.castShadow = isHighQuality;
      group.add(body);

      const lidMat = new THREE.MeshStandardMaterial({ color: lidColorHex });
      const lid = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 1.6), lidMat);
      lid.position.y = 2.05;
      group.add(lid);

      const signCanvas = document.createElement('canvas');
      signCanvas.width = 512;
      signCanvas.height = 128;
      const signContext = signCanvas.getContext('2d');
      if (!signContext) {
        throw new Error('No fue posible crear el rótulo del punto de reciclaje.');
      }
      signContext.fillStyle = colorHex === 0xf8fafc ? '#ffffff' : `#${colorHex.toString(16).padStart(6, '0')}`;
      signContext.fillRect(0, 0, signCanvas.width, signCanvas.height);
      signContext.fillStyle = colorHex === 0xf8fafc ? '#0f172a' : '#ffffff';
      signContext.font = 'bold 34px sans-serif';
      signContext.textAlign = 'center';
      signContext.textBaseline = 'middle';
      signContext.fillText(label, signCanvas.width / 2, signCanvas.height / 2, signCanvas.width - 24);
      const signTexture = new THREE.CanvasTexture(signCanvas);
      const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.4), signMat);
      sign.position.set(side === 'left' ? 1.06 : -1.06, 1.2, 0);
      sign.rotation.y = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
      group.add(sign);

      scene.add(group);

      if (t === 'green') greenBins.push(group);
      else if (t === 'blue') blueBins.push(group);
      else if (t === 'yellow') yellowBins.push(group);
      else if (t === 'hazard') hazardBins.push(group);
    });
  };

  // Helper to build 3D Overhead Welcome Arch crossing the street
  const addDistrictArch = (zPos: number, title: string, subtitle: string, archColor: number, pillarColor: number) => {
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, zPos);

    // Left & Right Support Pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: pillarColor, roughness: 0.6 });
    const pLeft = new THREE.Mesh(new THREE.BoxGeometry(1.2, 9.5, 1.2), pillarMat);
    pLeft.position.set(-6.8, 4.75, 0);
    pLeft.castShadow = isHighQuality;

    const pRight = new THREE.Mesh(new THREE.BoxGeometry(1.2, 9.5, 1.2), pillarMat);
    pRight.position.set(6.8, 4.75, 0);
    pRight.castShadow = isHighQuality;

    // Cross beam spanning the avenue
    const beamMat = new THREE.MeshStandardMaterial({ color: archColor, roughness: 0.5 });
    const beam = new THREE.Mesh(new THREE.BoxGeometry(14.8, 1.4, 1.4), beamMat);
    beam.position.set(0, 8.8, 0);
    beam.castShadow = isHighQuality;

    // Front illuminated banner facing incoming player (facing +Z)
    const bannerTex = createArchTextTexture(title, subtitle, '#0284c7');
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex });
    const bannerFront = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 2.8), bannerMat);
    bannerFront.position.set(0, 8.2, 0.72);

    // Back banner facing returning player (facing -Z)
    const bannerBack = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 2.8), bannerMat);
    bannerBack.position.set(0, 8.2, -0.72);
    bannerBack.rotation.y = Math.PI;

    // Crown lamps
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const lampL = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), lampMat);
    lampL.position.set(-6.2, 9.8, 0);
    const lampR = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), lampMat);
    lampR.position.set(6.2, 9.8, 0);

    archGroup.add(pLeft, pRight, beam, bannerFront, bannerBack, lampL, lampR);
    scene.add(archGroup);
  };

  // Helper to build roadside trees
  const addStreetTree = (x: number, z: number, foliageColor: number = 0x22c55e) => {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 3.8, 8), trunkMat);
    trunk.position.set(x, 1.9, z);
    trunk.castShadow = isHighQuality;
    scene.add(trunk);

    const foliageMat = new THREE.MeshStandardMaterial({ color: foliageColor, roughness: 0.8 });
    const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 1), foliageMat);
    foliage.position.set(x, 4.4, z);
    foliage.castShadow = isHighQuality;
    scene.add(foliage);
  };

  // Helper for street lamps
  const addStreetLamp = (x: number, z: number, lightColor: number = 0xfef08a) => {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 6.2, 8), poleMat);
    pole.position.set(x, 3.1, z);
    scene.add(pole);

    const headMat = new THREE.MeshBasicMaterial({ color: lightColor });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), headMat);
    head.position.set(x + (x > 0 ? -0.5 : 0.5), 6.1, z);
    scene.add(head);
  };

  // ==========================================================================
  // SECTOR 1: CENTRO Y CUADRA RESIDENCIAL (Z = 24 to 2)
  // Casas de ladrillo, fachadas de colores, puertas, ventanas y antejardines.
  // ==========================================================================
  addDistrictArch(18, '🏡 CENTRO DE SAN ANTONIO', 'CASAS, ESCUELA Y TIENDAS DE BARRIO', 0xd97706, 0x92400e);

  const resHouseColors = [0xd98b75, 0xe7c27d, 0xb86f55, 0xd9d3b8, 0xc98e78];
  const residentialWindowFrameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
  const residentialGlassMat = new THREE.MeshStandardMaterial({
    color: 0x93c5d3,
    roughness: 0.2,
    metalness: 0.25,
  });
  const residentialDoorMat = new THREE.MeshStandardMaterial({ color: 0x5b4636, roughness: 0.8 });
  for (let z = 16; z >= 4; z -= 7.5) {
    [-16, 16].forEach((xSide, idx) => {
      const houseMat = new THREE.MeshStandardMaterial({
        color: resHouseColors[(Math.abs(Math.floor(z)) + idx) % resHouseColors.length],
        roughness: 0.7,
      });
      const house = new THREE.Mesh(new THREE.BoxGeometry(7, 7, 6.5), houseMat);
      house.position.set(xSide, 3.5, z);
      house.castShadow = isHighQuality;
      scene.add(house);

      const facadeX = xSide + (xSide > 0 ? -3.56 : 3.56);
      [-1.65, 1.65].forEach((windowOffset) => {
        const windowFrame = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 1.45, 1.3),
          residentialWindowFrameMat
        );
        windowFrame.position.set(facadeX, 4.7, z + windowOffset);
        scene.add(windowFrame);
        const windowGlass = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 1.15, 1.0),
          residentialGlassMat
        );
        windowGlass.position.set(facadeX + (xSide > 0 ? -0.02 : 0.02), 4.7, z + windowOffset);
        scene.add(windowGlass);
      });
      const frontDoor = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.2, 1.15), residentialDoorMat);
      frontDoor.position.set(facadeX, 1.35, z);
      scene.add(frontDoor);

      // Terracotta roof
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 });
      const roof = new THREE.Mesh(new THREE.ConeGeometry(5.4, 3, 4), roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.set(xSide, 8.5, z);
      scene.add(roof);

      // Balcony planter box with flowers
      const planter = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 0.4, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x78350f })
      );
      planter.position.set(xSide > 0 ? xSide - 3.8 : xSide + 3.8, 3.8, z);
      scene.add(planter);

      // Red/pink flowers
      const flowers = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.35, 0.6),
        new THREE.MeshStandardMaterial({ color: 0xf43f5e })
      );
      flowers.position.set(xSide > 0 ? xSide - 3.8 : xSide + 3.8, 4.15, z);
      scene.add(flowers);
    });

    addStreetTree(8.2, z - 2, 0x16a34a);
    addStreetTree(-8.2, z - 2, 0x15803d);
    addStreetLamp(6.6, z + 1);
  }

  // Recycling station in Barrio Residencial
  addRecyclingStation(6, ['green', 'blue'], 'left');

  // ==========================================================================
  // SECTOR 2: CORREDOR COMERCIAL (Z = 2 to -38)
  // Comercio local, vitrinas, toldos y espacios de espera.
  // ==========================================================================
  addDistrictArch(1, '🛍️ CORREDOR COMERCIAL', 'TIENDAS, PARADEROS Y MOVILIDAD LOCAL', 0x1d4ed8, 0x1e3a8a);

  const awningColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6];
  for (let z = -2; z >= -36; z -= 8) {
    [-17, 17].forEach((xSide, idx) => {
      const height = 12 + Math.abs(Math.sin(z)) * 5;
      const commBuildingMat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0xf8fafc : 0xe2e8f0,
        roughness: 0.5,
      });
      const bldg = new THREE.Mesh(new THREE.BoxGeometry(7.5, height, 7), commBuildingMat);
      bldg.position.set(xSide, height / 2, z);
      bldg.castShadow = isHighQuality;
      scene.add(bldg);

      // Ground floor glass storefront (escaparate iluminado)
      const shopMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const shopWindow = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 3.2), shopMat);
      shopWindow.position.set(xSide > 0 ? xSide - 3.8 : xSide + 3.8, 2.0, z);
      shopWindow.rotation.y = xSide > 0 ? -Math.PI / 2 : Math.PI / 2;
      scene.add(shopWindow);

      // Striped awning (toldo de tienda)
      const awColor = awningColors[(Math.abs(Math.floor(z)) + idx) % awningColors.length];
      const awning = new THREE.Mesh(
        new THREE.BoxGeometry(6, 0.25, 2.2),
        new THREE.MeshStandardMaterial({ color: awColor, roughness: 0.4 })
      );
      awning.position.set(xSide > 0 ? xSide - 4.6 : xSide + 4.6, 3.8, z);
      awning.rotation.z = xSide > 0 ? 0.35 : -0.35;
      scene.add(awning);

      // Illuminated store sign above awning
      const signMesh = new THREE.Mesh(
        new THREE.BoxGeometry(5.2, 0.9, 0.4),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      );
      signMesh.position.set(xSide > 0 ? xSide - 4.0 : xSide + 4.0, 4.6, z);
      scene.add(signMesh);
    });

    // Café outdoor table with sun umbrella
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const table = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.0, 8), tableMat);
    table.position.set(8.2, 0.7, z);
    scene.add(table);

    const umbrellaMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e });
    const umbrella = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.8, 8), umbrellaMat);
    umbrella.position.set(8.2, 2.4, z);
    scene.add(umbrella);

    addStreetLamp(-6.6, z, 0x38bdf8);
  }

  // Commercial Recycling Stations
  addRecyclingStation(-18, ['blue', 'yellow'], 'right');

  // ==========================================================================
  // SECTOR 3: ZONA DE TALLERES Y SERVICIOS (Z = -38 to -75)
  // Talleres, bodegas y punto de recepción de residuos especiales.
  // ==========================================================================
  addDistrictArch(-39, '🔧 ZONA DE TALLERES', 'PUNTO DE RECEPCIÓN RESPEL', 0x059669, 0x064e3b);

  for (let z = -42; z >= -72; z -= 8.5) {
    [-17, 17].forEach((xSide) => {
      // Brick industrial loft building
      const indMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
      const indBldg = new THREE.Mesh(new THREE.BoxGeometry(8, 10, 7.5), indMat);
      indBldg.position.set(xSide, 5, z);
      scene.add(indBldg);

      // Rooftop Photovoltaic Solar Panels
      const solarMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.1,
        metalness: 0.8,
      });
      const solarPanel = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.15, 5), solarMat);
      solarPanel.position.set(xSide, 10.2, z);
      solarPanel.rotation.x = 0.2;
      scene.add(solarPanel);

      // Eco scrubber chimney
      const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 5, 8), chimneyMat);
      chimney.position.set(xSide > 0 ? xSide + 2 : xSide - 2, 12, z);
      scene.add(chimney);

      // Green eco filter ring on top of chimney
      const filterRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.7, 0.15, 8, 12),
        new THREE.MeshBasicMaterial({ color: 0x22c55e })
      );
      filterRing.rotation.x = Math.PI / 2;
      filterRing.position.set(xSide > 0 ? xSide + 2 : xSide - 2, 14.5, z);
      scene.add(filterRing);
    });

    // Rainwater recycling silo tank
    const siloMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5 });
    const silo = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 5.5, 12), siloMat);
    silo.position.set(-8.5, 2.9, z);
    scene.add(silo);

    // Caution curbs (franjas amarillas y negras en los bordes)
    const curbMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 6), curbMat);
    curb.position.set(6.1, 0.25, z);
    scene.add(curb);
  }

  // Industrial Hazardous & Glass Recycling Station
  addRecyclingStation(-56, ['yellow', 'hazard', 'blue'], 'left');

  // ==========================================================================
  // SECTOR 4: SENDERO DE LA QUEBRADA (Z = -75 to -120)
  // Vegetación de ladera y senderos vecinales.
  // ==========================================================================
  addDistrictArch(-76, '🌳 SENDERO DE LA QUEBRADA', 'ZONA VERDE INSPIRADA EN DOÑA MARÍA', 0x15803d, 0x166534);

  // Diverse tree canopy (Verdes, Cerezos rosados, Jacarandás violetas)
  const parkTreeColors = [0x16a34a, 0xf472b6, 0xa855f7, 0x15803d, 0xec4899];
  for (let z = -79; z >= -115; z -= 6.5) {
    const tColorL = parkTreeColors[Math.abs(Math.floor(z)) % parkTreeColors.length];
    const tColorR = parkTreeColors[(Math.abs(Math.floor(z)) + 2) % parkTreeColors.length];

    addStreetTree(-9.5, z, tColorL);
    addStreetTree(9.5, z, tColorR);
    addStreetTree(-14.5, z - 2, 0x15803d);
    addStreetTree(14.5, z - 2, 0x15803d);

    // Wooden park bench
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.9), benchMat);
    bench.position.set(7.5, 0.5, z + 1);
    scene.add(bench);
  }

  // Classical Stone Fountain in the Central Park Plaza (Z ≈ -96)
  const fountainBaseMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.6 });
  const fountainPool = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.5, 0.8, 16), fountainBaseMat);
  fountainPool.position.set(0, 0.4, -96);
  scene.add(fountainPool);

  const waterMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
  const waterPlane = new THREE.Mesh(new THREE.CircleGeometry(3.9, 16), waterMat);
  waterPlane.rotation.x = -Math.PI / 2;
  waterPlane.position.set(0, 0.85, -96);
  scene.add(waterPlane);

  const centerPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 3.2, 12), fountainBaseMat);
  centerPillar.position.set(0, 1.8, -96);
  scene.add(centerPillar);

  // Sparkling water crystal top
  const crystalTop = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.9, 0),
    new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
  );
  crystalTop.position.set(0, 3.8, -96);
  scene.add(crystalTop);

  // Park Recycling Station
  addRecyclingStation(-86, ['green', 'blue', 'yellow'], 'right');

  // ==========================================================================
  // 3D HOLOGRAPHIC ECO-CHECKPOINT BARRIERS BETWEEN NEIGHBORHOODS
  // Blocks progression until all trash in current neighborhood is collected
  // ==========================================================================
  const createBarrierSignTexture = (title: string, subtitle: string, unlocked: boolean) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 0);
    if (unlocked) {
      bgGrad.addColorStop(0, '#065f46');
      bgGrad.addColorStop(0.5, '#047857');
      bgGrad.addColorStop(1, '#065f46');
    } else {
      bgGrad.addColorStop(0, '#7f1d1d');
      bgGrad.addColorStop(0.5, '#b91c1c');
      bgGrad.addColorStop(1, '#7f1d1d');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 256);

    ctx.strokeStyle = unlocked ? '#34d399' : '#f87171';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, 1012, 244);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 46px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 512, 85);

    ctx.fillStyle = unlocked ? '#a7f3d0' : '#fef08a';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(subtitle, 512, 168);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  };

  const barriers: DistrictBarrier[] = [];

  const addDistrictBarrier = (
    id: string,
    sourceDistrictId: 'residencial' | 'comercial' | 'industrial',
    targetDistrictName: string,
    zBoundary: number,
    districtName: string
  ): DistrictBarrier => {
    const barrierGroup = new THREE.Group();
    barrierGroup.position.set(0, 0, zBoundary);

    // Left & Right Checkpoint Security Pylons
    const pylonMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 });
    const pylonL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.0, 0.8), pylonMat);
    pylonL.position.set(-6.8, 2.5, 0);
    const pylonR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.0, 0.8), pylonMat);
    pylonR.position.set(6.8, 2.5, 0);
    barrierGroup.add(pylonL, pylonR);

    // Hazard Stripes on Pylons
    const hazardMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    for (let h = 0; h < 4; h++) {
      const stripeL = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.25, 0.84), hazardMat);
      stripeL.position.set(-6.8, 1.0 + h * 0.9, 0);
      const stripeR = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.25, 0.84), hazardMat);
      stripeR.position.set(6.8, 1.0 + h * 0.9, 0);
      barrierGroup.add(stripeL, stripeR);
    }

    // Flashing Strobe Beacons on top of pylons
    const beaconMatL = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const beaconL = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), beaconMatL);
    beaconL.position.set(-6.8, 5.2, 0);

    const beaconMatR = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const beaconR = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), beaconMatR);
    beaconR.position.set(6.8, 5.2, 0);
    barrierGroup.add(beaconL, beaconR);

    // Luminous Holographic Laser Grid Barrier
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const laserBeam = new THREE.Mesh(new THREE.BoxGeometry(13.6, 2.8, 0.08), laserMat);
    laserBeam.position.set(0, 1.5, 0);
    barrierGroup.add(laserBeam);

    // Overhead Holographic Warning Sign
    const signTexLocked = createBarrierSignTexture(
      `⛔ BARRERA ACTIVA: ${districtName.toUpperCase()}`,
      `RECOLECTA TODAS LAS BASURAS PARA DESBLOQUEAR EL PASO`,
      false
    );
    const signMat = new THREE.MeshBasicMaterial({ map: signTexLocked, side: THREE.DoubleSide });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 2.1), signMat);
    signMesh.position.set(0, 4.4, 0);
    barrierGroup.add(signMesh);

    scene.add(barrierGroup);

    const barrierObj: DistrictBarrier = {
      id,
      sourceDistrictId,
      targetDistrictName,
      zBoundary,
      barrierGroup,
      laserBeam,
      beaconL,
      beaconR,
      signMesh,
      isUnlocked: false,
      setUnlocked: (unlocked: boolean) => {
        barrierObj.isUnlocked = unlocked;
        if (unlocked) {
          laserBeam.position.y = -2;
          laserBeam.visible = false;
          (beaconL.material as THREE.MeshBasicMaterial).color.setHex(0x10b981);
          (beaconR.material as THREE.MeshBasicMaterial).color.setHex(0x10b981);
          const signTexUnlocked = createBarrierSignTexture(
            `✅ BARRIO PURIFICADO: ${districtName.toUpperCase()}`,
            `PASO DESPEJADO HACIA ${targetDistrictName.toUpperCase()}`,
            true
          );
          (signMesh.material as THREE.MeshBasicMaterial).map = signTexUnlocked;
          (signMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
        } else {
          laserBeam.position.y = 1.5;
          laserBeam.visible = true;
          (beaconL.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
          (beaconR.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
          (signMesh.material as THREE.MeshBasicMaterial).map = signTexLocked;
          (signMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
        }
      },
    };

    barriers.push(barrierObj);
    return barrierObj;
  };

  // Add the 3 checkpoints at the exact borders between neighborhoods
  addDistrictBarrier('barrier_residencial_to_comercial', 'residencial', 'Corredor comercial', 2.0, 'Centro de San Antonio de Prado');
  addDistrictBarrier('barrier_comercial_to_industrial', 'comercial', 'Zona de talleres y servicios', -38.0, 'Corredor comercial');
  addDistrictBarrier('barrier_industrial_to_parque', 'industrial', 'Sendero de la quebrada', -75.0, 'Zona de talleres y servicios');

  return {
    greenBins,
    blueBins,
    yellowBins,
    hazardBins,
    barriers,
    bossArenaPosition: new THREE.Vector3(0, 0, -96),
    zBounds: [-108, 18],
  };
}
